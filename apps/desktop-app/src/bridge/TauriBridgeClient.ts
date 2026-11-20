import type { BridgeClient, BridgeMessageOfType } from "@whoami/ui";
import {
  type BridgeMessage,
  type BridgeMessageType,
  type Finding,
  type RuleToggleConfig,
  type WorkspaceGraph,
  type DastStreamStatusData,
  type DastStreamLogData,
  type DastStreamFindingData,
  type DastStreamCompleteData,
  toStructuredError,
} from "@whoami/types";
import {
  DEFAULT_ORCHESTRATOR_URL,
  DEFAULT_OPERATOR_API_KEY,
  DEFAULT_ADMIN_API_KEY,
  DEFAULT_SAST_SERVICE_URL,
  DEFAULT_DAST_SERVICE_URL,
  DEFAULT_AUTH_SERVICE_URL,
  ScanOrchestratorClient,
  handleOrchestratorMessage,
} from "@whoami/core/query";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import { save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile, writeFile } from "@tauri-apps/plugin-fs";
import { clearAuthSession, getAuthSession } from "../db/authRepo.js";
import { getSettings } from "../db/preferencesRepo.js";
import { pickAndReadWorkspace, pickWorkspaceFolder, readWorkspaceFromPath, type PickedWorkspace } from "./workspaceFs.js";
import { scanFilesInWorker } from "./engineWorker.js";
import { invoke } from "@tauri-apps/api/core";
import { checkForAppUpdate, installPendingUpdate, restartApp, checkForVersionChange } from "./updater.js";

type Handler = (message: BridgeMessage) => void;

let requestCounter = 0;
function nextRequestId(): string {
  requestCounter += 1;
  return `desktop-req-${requestCounter}-${Date.now()}`;
}

/**
 * The desktop app's concrete BridgeClient (see the webview-bridge skill and
 * packages/ui's BridgeClient interface). This is the ONLY place in the app
 * that talks to Tauri's dialog/fs plugins -- always from the main thread,
 * never from inside the analysis Worker (see engine.worker.ts's module doc).
 *
 * Because this app has no real separate "host" process the way the VS Code
 * extension does (there is no extension-host <-> webview split here -- this
 * class *is* the frontend's entire host-side implementation, running in the
 * same JS realm as the UI), `send()` handles messages synchronously-ish
 * in-process rather than posting across an IPC boundary. It still implements
 * exactly the same BridgeClient contract packages/ui expects, so the UI
 * layer never knows the difference from the VS Code build.
 */
export class TauriBridgeClient implements BridgeClient {
  private readonly handlers = new Map<BridgeMessageType, Set<Handler>>();
  private readonly anyHandlers = new Set<Handler>();

  /**
   * Findings from the most recently completed scan, keyed by id -- lets
   * get-trace-request answer immediately from memory instead of re-running
   * anything, since Finding already carries its full TaintTrace (see the
   * webview-bridge skill's rule on sending large payloads whole).
   */
  private lastScanFindings = new Map<string, Finding>();

  /** Root of the most recently scanned workspace — used to enforce
   * path-containment on get-file-content-request. */
  private lastScannedRoot: string | null = null;

  /** Built once per scan, alongside it, in the Worker (see engine.worker.ts) —
   * answers get-workspace-graph-request from memory rather than re-scanning. */
  private lastWorkspaceGraph: WorkspaceGraph = { nodes: [], edges: [] };
  private cachedOrchestratorClient: ScanOrchestratorClient | null = null;
  private readonly activeDastStreams = new Map<string, () => void>();

  private static readonly UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

  constructor() {
    // Update checks are the one outbound network call this app makes on its
    // own -- orchestrator calls happen only when the user starts a cloud
    // scan (see src-tauri/capabilities/default.json's updated
    // description and docs/RELEASE-PIPELINE.md) -- they run through the
    // Tauri updater plugin's Rust side, never through this webview's fetch,
    // so the CSP connect-src needs no change for this. A failed check (e.g.
    // genuinely offline) is swallowed inside checkForAppUpdate/
    // checkForVersionChange rather than surfaced as an error notice -- an
    // offline launch should be silent, not alarming.
    void this.runStartupUpdateChecks();
    setInterval(() => {
      void checkForAppUpdate((notice) => this.emit({ type: "update-notice", notice }));
    }, TauriBridgeClient.UPDATE_CHECK_INTERVAL_MS);
  }

  private async runStartupUpdateChecks(): Promise<void> {
    const updatedNotice = await checkForVersionChange();
    if (updatedNotice) {
      this.emit({ type: "update-notice", notice: updatedNotice });
    }
    await checkForAppUpdate((notice) => this.emit({ type: "update-notice", notice }));
  }

  send(message: BridgeMessage): void {
    void this.handle(message);
  }

  on<T extends BridgeMessageType>(
    type: T,
    handler: (message: BridgeMessageOfType<T>) => void,
  ): () => void {
    const set = this.handlers.get(type) ?? new Set<Handler>();
    set.add(handler as Handler);
    this.handlers.set(type, set);
    return () => {
      set.delete(handler as Handler);
    };
  }

  /**
   * Correct only for single-reply message types (get-trace, apply-fix,
   * run-poc): it resolves on the first message matching `requestId`,
   * regardless of type. scan-workspace-request deliberately is NOT sent via
   * request() for that exact reason -- it streams scan-workspace-progress
   * messages under the same requestId before the final
   * scan-workspace-result, which would resolve this prematurely. Callers
   * should use send() + on('scan-workspace-progress'/'scan-workspace-result')
   * for that one instead (see the webview-bridge skill's streaming row).
   */
  async request<TReq extends BridgeMessage, TRes extends BridgeMessage>(
    message: TReq,
    timeoutMs = 30_000,
  ): Promise<TRes> {
    const requestId = message.requestId ?? nextRequestId();
    const outgoing = { ...message, requestId } as TReq;

    return new Promise<TRes>((resolve, reject) => {
      const cleanup = (): void => {
        clearTimeout(timer);
        this.anyHandlers.delete(handler);
      };

      const handler: Handler = (incoming) => {
        if (incoming.requestId !== requestId) return;
        cleanup();
        if (incoming.type === "error") {
          reject(new Error(incoming.message));
        } else {
          resolve(incoming as TRes);
        }
      };

      const timer = setTimeout(() => {
        cleanup();
        reject(
          new Error(
            `BridgeClient request timed out after ${timeoutMs}ms: ${message.type}`,
          ),
        );
      }, timeoutMs);

      this.anyHandlers.add(handler);
      void this.handle(outgoing);
    });
  }

  /** Delivers a host->UI message to every registered listener -- the desktop-app analogue of `webview.postMessage`. */
  private emit(message: BridgeMessage): void {
    const set = this.handlers.get(message.type);
    if (set) {
      for (const handler of [...set]) handler(message);
    }
    for (const handler of [...this.anyHandlers]) handler(message);
  }

  /**
   * Built fresh per orchestrator request (as VS Code's extensionBridge does),
   * so a URL or key changed in Settings applies on the next call with no
   * invalidation plumbing. Requests go through the http plugin's fetch, i.e.
   * from Rust: the orchestrator sends no CORS headers, so the webview's own
   * fetch would be blocked. Allowed hosts: capabilities/default.json.
   */
  private async createOrchestratorClient(): Promise<ScanOrchestratorClient> {
    if (this.cachedOrchestratorClient) {
      return this.cachedOrchestratorClient;
    }
    const session = await getAuthSession();
    const isExpired = session?.expiresAt ? session.expiresAt <= Date.now() : false;
    if (isExpired && session) {
      await clearAuthSession();
    }
    const jwtToken =
      (!isExpired &&
      session?.accessToken &&
      session.accessToken !== "offline-local-session"
        ? session.accessToken
        : undefined) ||
      undefined; // No hardcoded JWT fallback — authenticate via the sign-in flow

    const apiKey =
      (typeof process !== "undefined" && (process.env?.API_KEY || process.env?.OPERATOR_API_KEY)) ||
      DEFAULT_OPERATOR_API_KEY ||
      undefined;

    const adminApiKey =
      (typeof process !== "undefined" && process.env?.ADMIN_API_KEY) ||
      DEFAULT_ADMIN_API_KEY ||
      undefined;

    this.cachedOrchestratorClient = new ScanOrchestratorClient({
      baseUrl: DEFAULT_ORCHESTRATOR_URL,
      sastBaseUrl: DEFAULT_SAST_SERVICE_URL,
      dastBaseUrl: DEFAULT_DAST_SERVICE_URL,
      authBaseUrl: DEFAULT_AUTH_SERVICE_URL,
      apiKey,
      adminApiKey,
      authMode: "api_key",
      jwtToken,
      useMicroservices: true,
      fetchFn: tauriFetch as typeof fetch,
    });
    return this.cachedOrchestratorClient;
  }

  private emitError(requestId: string | undefined, err: unknown, fallbackScope: string): void {
    const structured = toStructuredError(err, fallbackScope);
    if (
      structured.statusCode === 401 ||
      structured.code === "session_expired" ||
      /session.*expire|token.*invalid|invalid.*token/i.test(structured.message)
    ) {
      this.cachedOrchestratorClient = null;
      void clearAuthSession();
    }
    this.emit({ type: "error", requestId, ...structured });
  }

  /**
   * Subscribes to real-time DAST SSE stream telemetry and forwards
   * dast-stream-* events to registered bridge listeners (UI webview).
   */
  public streamDastEvents(jobId: string, requestId?: string): () => void {
    if (this.activeDastStreams.has(jobId)) {
      return this.activeDastStreams.get(jobId)!;
    }

    let cleanup = () => {};
    const doStream = async () => {
      try {
        const client = await this.createOrchestratorClient();
        cleanup = client.dast.streamJobEvents(jobId, {
          onStatus: (data: DastStreamStatusData) => {
            this.emit({
              type: "dast-stream-status",
              jobId,
              job_id: jobId,
              data,
              status: data.status,
              progress_percent: data.progress_percent,
              current_tool: data.current_tool,
              requestId,
            });
          },
          onLog: (data: DastStreamLogData) => {
            this.emit({
              type: "dast-stream-log",
              jobId,
              job_id: jobId,
              data,
              message: data.message,
              tool: data.tool,
              timestamp: data.timestamp,
              requestId,
            });
          },
          onFinding: (data: DastStreamFindingData) => {
            this.emit({
              type: "dast-stream-finding",
              jobId,
              job_id: jobId,
              data,
              finding: data,
              tool_name: data.tool_name,
              title: data.title,
              severity: data.severity,
              requestId,
            });
          },
          onComplete: (data: DastStreamCompleteData) => {
            this.emit({
              type: "dast-stream-complete",
              jobId,
              job_id: jobId,
              data,
              status: data.status,
              total_findings: data.total_findings,
              duration_ms: data.duration_ms,
              requestId,
            });
            this.activeDastStreams.delete(jobId);
          },
          onError: () => {
            this.activeDastStreams.delete(jobId);
          },
        });
        if (this.activeDastStreams.has(jobId)) {
          this.activeDastStreams.set(jobId, cleanup);
        }
      } catch {
        this.activeDastStreams.delete(jobId);
      }
    };

    const cancelFn = () => {
      this.activeDastStreams.delete(jobId);
      cleanup();
    };

    this.activeDastStreams.set(jobId, cancelFn);
    void doStream();
    return cancelFn;
  }

  private async handle(message: BridgeMessage): Promise<void> {
    // Cloud orchestrator requests: shared with the VS Code extension host
    // (packages/core/src/orchestrator/bridge-router.ts).
    try {
      if (
        await handleOrchestratorMessage(
          () => this.createOrchestratorClient(),
          message,
          (reply) => {
            this.emit(reply);
            if (reply.type === "submit-remote-scan-result" && reply.scan?.id) {
              const meta = ScanOrchestratorClient.getScanMeta(reply.scan.id);
              if (!meta || meta.kind === "dast") {
                this.streamDastEvents(reply.scan.id, reply.requestId);
              }
            }
          },
        )
      ) {
        if (message.type === "poll-remote-scan-request" && message.scanId) {
          const meta = ScanOrchestratorClient.getScanMeta(message.scanId);
          if (!meta || meta.kind === "dast") {
            this.streamDastEvents(message.scanId, message.requestId);
          }
        }
        return;
      }
    } catch (err) {
      this.emitError(message.requestId, err, "orchestrator");
      return;
    }

    switch (message.type) {
      case "pick-folder-request": {
        try {
          const selected = await pickWorkspaceFolder(message.defaultPath);
          this.emit({
            type: "pick-folder-result",
            requestId: message.requestId,
            folderPath: selected,
          });
        } catch (err) {
          console.warn("[WhoAmI] Failed to pick folder:", err);
          this.emit({
            type: "pick-folder-result",
            requestId: message.requestId,
            folderPath: null,
          });
        }
        return;
      }

      case "scan-workspace-request":
        await this.handleScanWorkspace(message.requestId, message.folderPath, message.rules);
        return;

      case "get-trace-request": {
        const finding = this.lastScanFindings.get(message.findingId);
        if (!finding) {
          this.emit({
            type: "error",
            requestId: message.requestId,
            message: `No finding with id "${message.findingId}" in the current scan results.`,
          });
          return;
        }
        this.emit({
          type: "get-trace-result",
          requestId: message.requestId,
          trace: finding.trace,
        });
        return;
      }

      // No fs write or shell permission is granted in
      // src-tauri/capabilities/default.json (the http plugin is scoped to
      // the orchestrator only), and there is no local probe runner.
      // apply-fix and run-poc are answered honestly as unavailable rather
      // than silently no-opping -- or, worse, reporting a probe as verified
      // without running one.
      case "get-file-content-request": {
        try {
          const root = this.lastScannedRoot;
          const requestedPath = message.filePath;

          // SECURITY: Reject paths that escape the last-scanned workspace root.
          if (root) {
            // Tauri's readTextFile accepts relative paths relative to app cwd,
            // so we must resolve against the known root to get a canonical absolute path.
            const { resolve, sep } = await import("@tauri-apps/api/path");
            const resolved = await resolve(root, requestedPath);
            const pathSep = sep();
            const normalizedRoot = root.endsWith(pathSep) ? root : root + pathSep;
            if (!resolved.startsWith(normalizedRoot) && resolved !== root) {
              this.emit({
                type: "get-file-content-result",
                requestId: message.requestId,
                filePath: message.filePath,
                content: null,
                error: "SecurityException: Requested path is outside the scanned workspace root.",
              });
              return;
            }
          }

          const content = await readTextFile(message.filePath);
          this.emit({
            type: "get-file-content-result",
            requestId: message.requestId,
            filePath: message.filePath,
            content,
          });
        } catch (err) {
          this.emit({
            type: "get-file-content-result",
            requestId: message.requestId,
            filePath: message.filePath,
            content: null,
            error: err instanceof Error ? err.message : String(err),
          });
        }
        return;
      }

      case "save-report-file-request": {
        try {
          const isPdf = message.fileName.endsWith(".pdf");
          const selectedPath = await save({
            defaultPath: message.fileName,
            filters: [
              {
                name: isPdf ? "PDF Document" : "Markdown Report",
                extensions: [isPdf ? "pdf" : "md"],
              },
            ],
          });
          if (!selectedPath) {
            this.emit({
              type: "save-report-file-result",
              requestId: message.requestId,
              savedPath: null,
            });
            return;
          }
          if (message.encoding === "base64") {
            const binaryString = atob(message.content);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            await writeFile(selectedPath, bytes);
          } else {
            await writeTextFile(selectedPath, message.content);
          }
          this.emit({
            type: "save-report-file-result",
            requestId: message.requestId,
            savedPath: selectedPath,
          });
        } catch (err) {
          this.emit({
            type: "error",
            requestId: message.requestId,
            message: `Failed to save report: ${err instanceof Error ? err.message : String(err)}`,
          });
        }
        return;
      }

      case "apply-fix-request":
        this.emit({
          type: "apply-fix-result",
          requestId: message.requestId,
          applied: false,
        });
        this.emit({
          type: "error",
          requestId: message.requestId,
          message:
            "Applying fixes directly to code files is an IDE feature available in the Codefy VS Code extension.",
        });
        return;

      case "run-poc-request":
        this.emit({
          type: "run-poc-result",
          requestId: message.requestId,
          verified: false,
          detail:
            "PoC runtime verification requires a local probe runner in an active workspace environment (available in the VS Code extension).",
        });
        return;

      case "get-workspace-graph-request":
        this.emit({
          type: "get-workspace-graph-result",
          requestId: message.requestId,
          graph: this.lastWorkspaceGraph,
        });
        return;

      case "update-install-request":
        await installPendingUpdate((notice) => this.emit({ type: "update-notice", notice }));
        return;

      case "update-restart-request":
        await restartApp();
        return;

      case "update-dismiss-request":
        // Purely a UI-side dismissal (UpdateBanner hides itself); nothing
        // persists host-side about a dismissed "available"/"ready" notice --
        // the next check() call (interval or next launch) will re-announce
        // it if it's still the latest version, same as VS Code re-showing an
        // extension update if you never install it.
        return;

      case "jump-to-line":
        // There is no editor pane in this app (unlike the VS Code
        // extension, which can drive vscode's own editor) -- fire-and-forget
        // per the protocol, nothing more to do host-side.
        console.info(
          `[WhoAmI] jump-to-line ${message.filePath}:${message.line} (no editor pane to jump in)`,
        );
        return;

      // scan-workspace-progress / scan-workspace-result / get-trace-result /
      // apply-fix-result / run-poc-result / error are host->UI-only in this
      // app's flow -- nothing to do if the UI itself sends one.
      //
      // Everything else that reaches here is a *-request this class has no
      // case for. Orchestrator requests never get here (dispatched above);
      // in practice this is the auth-* family, which App.tsx sends straight
      // to the AI gateway itself, and persistence-*, which this app keeps in
      // IndexedDB. Answer immediately rather than let request() hang until
      // its timeout with no explanation.
      default:
        if (message.type.endsWith("-request")) {
          this.emit({
            type: "error",
            requestId: message.requestId,
            message: `"${message.type}" is not handled by the desktop app's bridge.`,
          });
        }
        return;
    }
  }

  private async handleScanWorkspace(
    requestId: string | undefined,
    folderPath?: string,
    rules?: RuleToggleConfig,
  ): Promise<void> {
    const scanStartedAt = Date.now();
    const scanLog = (level: "info" | "warn" | "error", message: string): void => {
      const requestLabel = requestId ?? "no-request-id";
      void invoke("log_scan_diagnostic", {
        level,
        message: `[request=${requestLabel}] ${message}`,
      }).catch((err: unknown) => {
        console.warn("[WhoAmI] Could not forward scan diagnostics to terminal:", err);
      });
    };
    try {
      scanLog("info", `Scan requested${folderPath ? ` for ${folderPath}` : " (folder picker)"}.`);
      let picked: PickedWorkspace | null = null;
      if (folderPath && folderPath.trim()) {
        const trimmed = folderPath.trim();
        try {
          picked = await readWorkspaceFromPath(trimmed);
        } catch (err) {
          console.warn(`[WhoAmI] Could not scan directory "${trimmed}":`, err);
        }

        if (!picked || picked.files.length === 0) {
          scanLog("error", `No scannable files loaded from ${trimmed}.`);
          this.emit({
            type: "error",
            requestId,
            message: `Directory "${trimmed}" contains no scannable files or could not be accessed.`,
          });
          return;
        }
      } else {
        picked = await pickAndReadWorkspace();
      }

      if (!picked) {
        scanLog("warn", "Scan cancelled or folder selection returned no workspace.");
        this.emit({
          type: "error",
          requestId,
          message: "Workspace scan cancelled: no folder was selected or folder contains no scannable files.",
        });
        return;
      }

      if (picked.files.length === 0) {
        scanLog("error", `No scannable files loaded from ${picked.rootPath}.`);
        this.emit({
          type: "error",
          requestId,
          message: `Folder "${picked.rootPath}" contains no supported readable source files.`,
        });
        return;
      }

      scanLog("info", `Workspace loaded: ${picked.files.length} file(s) from ${picked.rootPath}; starting analysis Worker.`);

      const settings = await getSettings();
      const result = await scanFilesInWorker(picked.files, picked.rootPath, {
        rules: rules ?? settings.rules,
        onDiagnostic: scanLog,
        onProgress: (scanned, total) => {
          this.emit({
            type: "scan-workspace-progress",
            requestId,
            scanned,
            total,
          });
        },
      });
      scanLog("info", `Scan complete in ${Math.round((Date.now() - scanStartedAt) / 1000)}s: findings=${result.findings.length}, secrets=${result.secrets.length}.`);
      if (result.secrets.length > 0) {
        scanLog("warn", `${result.secrets.length} potential secret(s) detected; values omitted from diagnostics.`);
      }

      this.lastScanFindings = new Map(
        result.findings.map((finding) => [finding.id, finding]),
      );
      this.lastWorkspaceGraph = result.workspaceGraph;
      this.lastScannedRoot = picked.rootPath; // Track root for path-containment checks
      this.emit({
        type: "scan-workspace-result",
        requestId,
        findings: result.findings,
        coverage: {
          ...picked.coverage,
          filesScanned: picked.files.length - result.filesFailed,
          filesFailed: picked.coverage.filesFailed + result.filesFailed,
        },
      });
    } catch (err) {
      scanLog("error", `Scan failed after ${Math.round((Date.now() - scanStartedAt) / 1000)}s: ${err instanceof Error ? err.stack ?? err.message : String(err)}`);
      this.emit({
        type: "error",
        requestId,
        message:
          err instanceof Error
            ? err.message
            : "Workspace scan failed for an unknown reason.",
      });
    }
  }
}
