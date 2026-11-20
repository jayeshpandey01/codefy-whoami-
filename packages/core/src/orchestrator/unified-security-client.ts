import type {
  AuthSession,
  CanonicalIssue,
  CanonicalIssueDetailResponse,
  DastJobDetailResponse,
  DastScanRequest,
  DastScanResponse,
  DastStreamHandlers,
  DastValidateTargetResponse,
  Finding,
  IssueListParams,
  IssueListResponse,
  IssueMetricsSummaryResponse,
  IssueStatus,
  SastCreateResponse,
  SastJobDetailResponse,
  SastScanDirectRequest,
  SastScanRepoRequest,
} from "@whoami/types";
import { GatewayAuthClient } from "../auth/gateway-auth-client.js";
import { SastClient, type PollJobOptions } from "../sast/client.js";
import { DastClient, type PollDastJobOptions } from "../dast/client.js";
import {
  DEFAULT_AUTH_SERVICE_URL,
  DEFAULT_SAST_SERVICE_URL,
  DEFAULT_DAST_SERVICE_URL,
} from "./constants.js";
import {
  normalizeSastJobFindings,
  normalizeDastJobFindings,
} from "./normalizer.js";

export interface UnifiedSecurityClientOptions {
  readonly authBaseUrl?: string;
  readonly sastBaseUrl?: string;
  readonly dastBaseUrl?: string;
  readonly jwtToken?: string;
  readonly timeoutMs?: number;
  readonly fetchImpl?: typeof fetch;
}

/**
 * Unified Security Facade for Codefy.
 * Connects Auth (cmd-d-llm Gateway), SAST (25 engines), and DAST (30 engines)
 * via a single shared JWT token.
 */
export class UnifiedSecurityClient {
  public readonly auth: GatewayAuthClient;
  private _sast: SastClient;
  private _dast: DastClient;
  private _jwtToken?: string;
  private readonly sastBaseUrl: string;
  private readonly dastBaseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: UnifiedSecurityClientOptions = {}) {
    this.sastBaseUrl = options.sastBaseUrl || DEFAULT_SAST_SERVICE_URL;
    this.dastBaseUrl = options.dastBaseUrl || DEFAULT_DAST_SERVICE_URL;
    this.timeoutMs = options.timeoutMs ?? 60_000;
    this.fetchImpl = options.fetchImpl || fetch.bind(globalThis);
    this._jwtToken = options.jwtToken?.trim();

    this.auth = new GatewayAuthClient({
      baseUrl: options.authBaseUrl || DEFAULT_AUTH_SERVICE_URL,
      timeoutMs: this.timeoutMs,
      fetchImpl: this.fetchImpl,
    });

    this._sast = new SastClient({
      baseUrl: this.sastBaseUrl,
      jwtToken: this._jwtToken,
      timeoutMs: this.timeoutMs,
      fetchImpl: this.fetchImpl,
    });

    this._dast = new DastClient({
      baseUrl: this.dastBaseUrl,
      jwtToken: this._jwtToken,
      timeoutMs: this.timeoutMs,
      fetchImpl: this.fetchImpl,
    });
  }

  get sast(): SastClient {
    return this._sast;
  }

  get dast(): DastClient {
    return this._dast;
  }

  get jwtToken(): string | undefined {
    return this._jwtToken;
  }

  /**
   * Updates the bearer JWT across both SAST and DAST clients simultaneously.
   */
  setSession(session: AuthSession | string): void {
    const token = typeof session === "string" ? session : session.accessToken;
    this._jwtToken = token;

    this._sast = new SastClient({
      baseUrl: this.sastBaseUrl,
      jwtToken: token,
      timeoutMs: this.timeoutMs,
      fetchImpl: this.fetchImpl,
    });

    this._dast = new DastClient({
      baseUrl: this.dastBaseUrl,
      jwtToken: token,
      timeoutMs: this.timeoutMs,
      fetchImpl: this.fetchImpl,
    });
  }

  /**
   * Authenticate with email/password and automatically configure SAST and DAST clients.
   */
  async login(email: string, password: string): Promise<AuthSession> {
    const session = await this.auth.login(email, password);
    this.setSession(session);
    return session;
  }

  /**
   * Run a full SAST scan lifecycle: submits zip, polls until complete, and normalizes findings.
   */
  async runSastScan(
    zipData: Blob | Buffer | Uint8Array,
    options: {
      mode?: "passive" | "active";
      targetValue?: string;
      pollOptions?: PollJobOptions;
    } = {},
  ): Promise<{ job: SastJobDetailResponse; findings: Finding[] }> {
    const mode = options.mode ?? "passive";
    const res: SastCreateResponse =
      mode === "active"
        ? await this.sast.submitActiveScan(zipData)
        : await this.sast.submitPassiveScan(zipData);

    const job = await this.sast.pollJobUntilComplete(res.job_id, options.pollOptions);
    const findings = normalizeSastJobFindings(job, options.targetValue);
    return { job, findings };
  }

  /**
   * Run a full DAST scan lifecycle: validates target, submits scan, polls, and normalizes findings.
   * Optionally attaches real-time SSE stream telemetry handlers.
   */
  async runDastScan(
    targetUrl: string,
    options: {
      mode?: "passive" | "active";
      tools?: readonly string[];
      pollOptions?: PollDastJobOptions;
      streamHandlers?: DastStreamHandlers;
    } = {},
  ): Promise<{
    validation: DastValidateTargetResponse;
    scan: DastScanResponse;
    job: DastJobDetailResponse;
    findings: Finding[];
  }> {
    const validation = await this.dast.validateTarget(targetUrl);
    const isSafe = validation.safe_to_scan ?? validation.valid ?? validation.ok ?? false;
    if (!isSafe) {
      throw new Error(`Target is not safe to scan: ${validation.message || validation.reason || validation.code || "Restricted address"}`);
    }

    const scanReq: DastScanRequest = {
      target_url: targetUrl,
      mode: options.mode ?? "passive",
      tools: options.tools,
    };
    const scan = await this.dast.submitScan(scanReq);

    let cleanupStream: (() => void) | undefined;
    if (options.streamHandlers) {
      cleanupStream = this.dast.streamJobEvents(scan.job_id, options.streamHandlers);
    }

    try {
      const job = await this.dast.pollJobUntilComplete(scan.job_id, options.pollOptions);
      const findings = normalizeDastJobFindings(job, targetUrl);
      return { validation, scan, job, findings };
    } finally {
      cleanupStream?.();
    }
  }

  // -------------------------------------------------------------
  // Canonical Issue Graph Store & Metrics Shortcuts
  // -------------------------------------------------------------

  async listIssues(params: IssueListParams = {}): Promise<IssueListResponse> {
    return this.sast.listIssues(params);
  }

  async getIssueMetrics(repoId?: string): Promise<IssueMetricsSummaryResponse> {
    return this.sast.getIssueMetricsSummary(repoId);
  }

  async transitionIssue(
    issueId: string,
    targetStatus: IssueStatus,
    reason?: string,
    actor?: string,
  ): Promise<CanonicalIssue> {
    return this.sast.transitionIssue(issueId, targetStatus, reason, actor);
  }

  async grantRiskAcceptance(
    issueId: string,
    acceptedBy: string,
    reason: string,
    expiresDays = 90,
  ): Promise<CanonicalIssue> {
    return this.sast.grantRiskAcceptance(issueId, acceptedBy, reason, expiresDays);
  }
}
