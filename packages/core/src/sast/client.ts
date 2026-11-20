import type {
  AuditEventsListResponse,
  CanonicalIssue,
  CanonicalIssueDetailResponse,
  IssueListParams,
  IssueListResponse,
  IssueMetricsSummaryResponse,
  IssueStatus,
  SastCreateResponse,
  SastJobDetailResponse,
  SastPresignedUploadRequest,
  SastPresignedUploadResponse,
  SastScanDiffRequest,
  SastScanDirectRequest,
  SastScanListResponse,
  SastScanNightlyRequest,
  SastScanRepoRequest,
  SastToolCatalogResponse,
  SecurityStreamEvent,
} from "@whoami/types";
import { DEFAULT_SAST_SERVICE_URL, DEFAULT_CODEFY_JWT } from "../orchestrator/constants.js";

export class SecurityServiceApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly detail?: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "SecurityServiceApiError";
  }
}

export interface SastClientOptions {
  readonly baseUrl?: string;
  readonly jwtToken?: string;
  readonly apiKey?: string;
  readonly timeoutMs?: number;
  readonly fetchImpl?: typeof fetch;
}

export interface PollJobOptions {
  intervalMs?: number;
  maxIntervalMs?: number;
  maxWaitMs?: number;
  onProgress?: (job: SastJobDetailResponse) => void;
}

const TERMINAL_STATUSES = new Set(["completed", "failed", "expired"]);

export class SastClient {
  private readonly baseUrl: string;
  private readonly jwtToken?: string;
  private readonly apiKey?: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: SastClientOptions = {}) {
    this.baseUrl = (options.baseUrl || DEFAULT_SAST_SERVICE_URL).replace(/\/+$/, "");
    const envJwt = typeof process !== "undefined" ? process.env?.CODEFY_JWT : undefined;
    const rawJwt = options.jwtToken?.trim() || envJwt || DEFAULT_CODEFY_JWT;
    this.jwtToken = rawJwt && rawJwt !== "offline-local-session" ? rawJwt : undefined;
    this.apiKey = options.apiKey?.trim();
    this.timeoutMs = options.timeoutMs ?? 60_000;
    this.fetchImpl = options.fetchImpl || fetch.bind(globalThis);
  }

  private getAuthHeader(): Record<string, string> {
    const token = this.jwtToken || DEFAULT_CODEFY_JWT;
    if (!token || token === "offline-local-session") {
      throw new SecurityServiceApiError(
        "Authentication required: Please sign in to your Codefy account with your email and password to access cloud SAST services.",
        401,
        "Session has expired or token is invalid.",
        "session_expired",
      );
    }
    const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
    if (this.apiKey) {
      headers["X-API-Key"] = this.apiKey;
    }
    return headers;
  }

  private async request<T>(
    path: string,
    init: RequestInit = {},
    requireAuth = true,
  ): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const headers = new Headers(init.headers || {});
      if (requireAuth) {
        const authHeader = this.getAuthHeader();
        for (const [k, v] of Object.entries(authHeader)) {
          headers.set(k, v);
        }
      }

      const res = await this.fetchImpl(`${this.baseUrl}${path}`, {
        ...init,
        headers,
        signal: controller.signal,
      });

      if (!res.ok) {
        let detail = `Request failed with status ${res.status}`;
        try {
          const errJson = await res.json();
          if (errJson && typeof errJson === "object" && "detail" in errJson) {
            detail = typeof errJson.detail === "string" ? errJson.detail : JSON.stringify(errJson.detail);
          }
        } catch {
          // Non-JSON error body
        }
        if (res.status === 401) {
          throw new SecurityServiceApiError(
            detail || "Cloud SAST scanner rejected authorization. Switch to Local Scan to analyze offline.",
            401,
            detail,
            "sast_auth_failed",
          );
        }
        throw new SecurityServiceApiError(detail, res.status, detail);
      }

      const contentType = res.headers.get("content-type") || "";
      const rawText = await res.text();
      try {
        return JSON.parse(rawText) as T;
      } catch {
        const preview = rawText.trim().slice(0, 120);
        throw new SecurityServiceApiError(
          `SAST service at ${this.baseUrl} returned non-JSON response (${res.status} ${res.statusText || "OK"}, Content-Type: "${contentType || "unknown"}"): "${preview}". ` +
            `Verify your Cloudflare Worker or SAST endpoint is proxying API requests to the SAST backend.`,
          res.status,
          rawText,
          "invalid_service_response",
        );
      }
    } catch (err: unknown) {
      if (err instanceof SecurityServiceApiError) throw err;
      throw new SecurityServiceApiError(
        err instanceof Error ? err.message : "Network error contacting SAST service",
        0,
      );
    } finally {
      clearTimeout(timer);
    }
  }

  async getHealth(): Promise<{ status: string; environment?: string; version?: string }> {
    return this.request("/health", { method: "GET" }, false);
  }

  async getTools(): Promise<SastToolCatalogResponse> {
    return this.request("/v1/tools", { method: "GET" }, false);
  }

  async submitPassiveScan(
    zipData: Blob | Buffer | Uint8Array,
    filename = "source.zip",
    targetId?: string,
  ): Promise<SastCreateResponse> {
    const formData = new FormData();
    const blob =
      zipData instanceof Blob
        ? zipData
        : new Blob([zipData as unknown as BlobPart]);
    formData.append("file", blob, filename);
    if (targetId) {
      formData.append("target_id", targetId);
    }

    return this.request("/v1/sast/scan", {
      method: "POST",
      body: formData,
    });
  }

  async submitActiveScan(
    zipData: Blob | Buffer | Uint8Array,
    filename = "source.zip",
    targetId?: string,
  ): Promise<SastCreateResponse> {
    const formData = new FormData();
    const blob =
      zipData instanceof Blob
        ? zipData
        : new Blob([zipData as unknown as BlobPart]);
    formData.append("file", blob, filename);
    if (targetId) {
      formData.append("target_id", targetId);
    }

    return this.request("/v1/sast/scan/active", {
      method: "POST",
      body: formData,
    });
  }

  async submitDiffScan(params: SastScanDiffRequest): Promise<SastCreateResponse> {
    const formData = new FormData();
    if (params.file) {
      const blob =
        params.file instanceof Blob
          ? params.file
          : new Blob([params.file as unknown as BlobPart]);
      formData.append("file", blob, "project.zip");
    }
    formData.append("base_commit", params.base_commit);
    if (params.patch_content) {
      formData.append("patch_content", params.patch_content);
    }
    if (params.target_id) {
      formData.append("target_id", params.target_id);
    }

    return this.request("/v1/sast/scan/diff", {
      method: "POST",
      body: formData,
    });
  }

  async submitNightlyScan(params: SastScanNightlyRequest): Promise<SastCreateResponse> {
    const body = new URLSearchParams();
    body.set("target_id", params.target_id);
    return this.request("/v1/sast/scan/nightly", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
  }

  async listScans(params: {
    target_id?: string;
    limit?: number;
    offset?: number;
    mode?: string;
    status?: string;
  } = {}): Promise<SastScanListResponse> {
    const searchParams = new URLSearchParams();
    if (params.target_id) searchParams.set("target_id", params.target_id);
    if (params.limit !== undefined) searchParams.set("limit", String(params.limit));
    if (params.offset !== undefined) searchParams.set("offset", String(params.offset));
    if (params.mode) searchParams.set("mode", params.mode);
    if (params.status) searchParams.set("status", params.status);

    const qs = searchParams.toString();
    const path = `/v1/sast/scans${qs ? `?${qs}` : ""}`;
    return this.request<SastScanListResponse>(path, { method: "GET" });
  }

  async requestUploadUrl(req: SastPresignedUploadRequest = {}): Promise<SastPresignedUploadResponse> {
    return this.request("/v1/sast/scan/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
  }

  async submitDirectScan(req: SastScanDirectRequest): Promise<SastCreateResponse> {
    return this.request("/v1/sast/scan/direct", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
  }

  async submitRepoScan(req: SastScanRepoRequest): Promise<SastCreateResponse> {
    return this.request("/v1/sast/scan/repo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
  }

  async getJob(jobId: string): Promise<SastJobDetailResponse> {
    return this.request(`/v1/jobs/${encodeURIComponent(jobId)}`, { method: "GET" });
  }

  async deleteJob(jobId: string): Promise<{ message: string }> {
    return this.request(`/v1/jobs/${encodeURIComponent(jobId)}`, { method: "DELETE" });
  }

  async getAutofixPatch(jobId: string): Promise<string> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const headers = new Headers(this.getAuthHeader());
      const res = await this.fetchImpl(`${this.baseUrl}/v1/jobs/${encodeURIComponent(jobId)}/patch`, {
        method: "GET",
        headers,
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new SecurityServiceApiError(
          `Failed to fetch patch: status ${res.status}`,
          res.status,
        );
      }
      return await res.text();
    } finally {
      clearTimeout(timer);
    }
  }

  async exportFindings(jobId: string, format: "sarif" | "json" = "sarif"): Promise<unknown> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const headers = new Headers(this.getAuthHeader());
      const res = await this.fetchImpl(
        `${this.baseUrl}/v1/jobs/${encodeURIComponent(jobId)}/export?format=${encodeURIComponent(format)}`,
        {
          method: "GET",
          headers,
          signal: controller.signal,
        },
      );

      if (!res.ok) {
        throw new SecurityServiceApiError(
          `Export failed with status ${res.status}`,
          res.status,
        );
      }
      return await res.json();
    } finally {
      clearTimeout(timer);
    }
  }

  async pollJobUntilComplete(
    jobId: string,
    options: PollJobOptions = {},
  ): Promise<SastJobDetailResponse> {
    const intervalMs = options.intervalMs ?? 3000;
    const maxIntervalMs = options.maxIntervalMs ?? 15000;
    const maxWaitMs = options.maxWaitMs ?? 40 * 60 * 1000;
    const startTime = Date.now();

    let currentInterval = intervalMs;

    while (Date.now() - startTime < maxWaitMs) {
      const job = await this.getJob(jobId);
      options.onProgress?.(job);

      if (TERMINAL_STATUSES.has(job.status)) {
        return job;
      }

      await new Promise((resolve) => setTimeout(resolve, currentInterval));
      currentInterval = Math.min(Math.round(currentInterval * 1.3), maxIntervalMs);
    }

    throw new SecurityServiceApiError(
      `Timed out waiting for SAST job ${jobId} to complete after ${maxWaitMs}ms`,
      408,
    );
  }

  // -------------------------------------------------------------
  // Canonical Issue Graph Store & Metrics (BugBound V3)
  // -------------------------------------------------------------

  async listIssues(params: IssueListParams = {}): Promise<IssueListResponse> {
    const searchParams = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") {
        searchParams.set(k, String(v));
      }
    }
    const qs = searchParams.toString();
    return this.request<IssueListResponse>(`/v1/sast/issues${qs ? `?${qs}` : ""}`, {
      method: "GET",
    });
  }

  async getIssueMetricsSummary(repoId?: string): Promise<IssueMetricsSummaryResponse> {
    const qs = repoId ? `?repo_id=${encodeURIComponent(repoId)}` : "";
    return this.request<IssueMetricsSummaryResponse>(
      `/v1/sast/issues/metrics/summary${qs}`,
      { method: "GET" },
    );
  }

  async getIssue(issueId: string): Promise<CanonicalIssueDetailResponse> {
    return this.request<CanonicalIssueDetailResponse>(
      `/v1/sast/issues/${encodeURIComponent(issueId)}`,
      { method: "GET" },
    );
  }

  async transitionIssue(
    issueId: string,
    targetStatus: IssueStatus,
    reason?: string,
    actor?: string,
  ): Promise<CanonicalIssue> {
    return this.request<CanonicalIssue>(
      `/v1/sast/issues/${encodeURIComponent(issueId)}/transition`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_status: targetStatus, reason, actor }),
      },
    );
  }

  async grantRiskAcceptance(
    issueId: string,
    acceptedBy: string,
    reason: string,
    expiresDays = 90,
  ): Promise<CanonicalIssue> {
    return this.request<CanonicalIssue>(
      `/v1/sast/issues/${encodeURIComponent(issueId)}/risk-acceptance`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accepted_by: acceptedBy,
          reason,
          expires_days: Math.min(Math.max(1, expiresDays), 90),
        }),
      },
    );
  }

  async deleteIssue(issueId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(
      `/v1/sast/issues/${encodeURIComponent(issueId)}`,
      { method: "DELETE" },
    );
  }

  // -------------------------------------------------------------
  // Security Audit Trail
  // -------------------------------------------------------------

  async listAuditEvents(params: {
    target_id?: string;
    limit?: number;
    offset?: number;
    event_type?: string;
  } = {}): Promise<AuditEventsListResponse> {
    const searchParams = new URLSearchParams();
    if (params.target_id) searchParams.set("target_id", params.target_id);
    if (params.limit !== undefined) searchParams.set("limit", String(params.limit));
    if (params.offset !== undefined) searchParams.set("offset", String(params.offset));
    if (params.event_type) searchParams.set("event_type", params.event_type);
    const qs = searchParams.toString();
    return this.request<AuditEventsListResponse>(`/v1/audit-events${qs ? `?${qs}` : ""}`, {
      method: "GET",
    });
  }

  // -------------------------------------------------------------
  // Progressive Scan Results Stream (SSE)
  // -------------------------------------------------------------

  listenToJobStream(
    jobId: string,
    onEvent: (event: SecurityStreamEvent) => void,
    onError?: (err: Error) => void,
  ): () => void {
    const controller = new AbortController();
    const token = this.jwtToken || DEFAULT_CODEFY_JWT;
    const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : "";
    const streamUrl = `${this.baseUrl}/v1/jobs/${encodeURIComponent(jobId)}/stream${tokenQuery}`;

    (async () => {
      try {
        const headers = new Headers(this.getAuthHeader());
        headers.set("Accept", "text/event-stream");
        const res = await this.fetchImpl(streamUrl, {
          method: "GET",
          headers,
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          throw new SecurityServiceApiError(
            `Failed to open scan stream: ${res.statusText || res.status}`,
            res.status,
          );
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (!controller.signal.aborted) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const dataMatch = line.match(/^data:\s*(.+)$/m);
            if (dataMatch && dataMatch[1]) {
              try {
                const parsed = JSON.parse(dataMatch[1]) as SecurityStreamEvent;
                onEvent(parsed);
              } catch {
                // Non-JSON SSE event data
              }
            }
          }
        }
      } catch (err: unknown) {
        if (!controller.signal.aborted && onError) {
          onError(err instanceof Error ? err : new Error(String(err)));
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }
}
