import type {
  DastAuditEvent,
  DastJobDetailResponse,
  DastScanRequest,
  DastScanResponse,
  DastStreamCompleteData,
  DastStreamFindingData,
  DastStreamHandlers,
  DastStreamLogData,
  DastStreamStatusData,
  DastToolCatalogResponse,
  DastValidateTargetResponse,
} from "@whoami/types";
import {
  DEFAULT_DAST_SERVICE_URL,
  DEFAULT_DAST_ORIGIN_URL,
  DEFAULT_CODEFY_JWT,
} from "../orchestrator/constants.js";
import { SecurityServiceApiError } from "../sast/client.js";

export interface DastClientOptions {
  readonly baseUrl?: string;
  readonly jwtToken?: string;
  readonly apiKey?: string;
  readonly timeoutMs?: number;
  readonly fetchImpl?: typeof fetch;
}

export interface PollDastJobOptions {
  intervalMs?: number;
  maxIntervalMs?: number;
  maxWaitMs?: number;
  onProgress?: (job: DastJobDetailResponse) => void;
}

const TERMINAL_STATUSES = new Set(["completed", "failed", "cancelled"]);

export class DastClient {
  private readonly baseUrl: string;
  private readonly jwtToken?: string;
  private readonly apiKey?: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: DastClientOptions = {}) {
    this.baseUrl = (options.baseUrl || DEFAULT_DAST_SERVICE_URL).replace(/\/+$/, "");
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
        "Authentication required: Please sign in to your Codefy account or configure an API key to access DAST services.",
        401,
      );
    }
    const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
    if (this.apiKey) {
      headers["X-API-Key"] = this.apiKey;
    }
    return headers;
  }

  private async executeFetch(
    url: string,
    init: RequestInit,
    requireAuth: boolean,
  ): Promise<Response> {
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

      try {
        return await this.fetchImpl(url, {
          ...init,
          headers,
          signal: controller.signal,
        });
      } catch (err) {
        // Fallback to origin if calling edge gateway fails
        if (url.startsWith(DEFAULT_DAST_SERVICE_URL)) {
          const originUrl = url.replace(DEFAULT_DAST_SERVICE_URL, DEFAULT_DAST_ORIGIN_URL);
          return await this.fetchImpl(originUrl, {
            ...init,
            headers,
            signal: controller.signal,
          });
        }
        throw err;
      }
    } finally {
      clearTimeout(timer);
    }
  }

  private async request<T>(
    path: string,
    init: RequestInit = {},
    requireAuth = true,
  ): Promise<T> {
    try {
      const res = await this.executeFetch(`${this.baseUrl}${path}`, init, requireAuth);

      if (!res.ok) {
        let detail = `Request failed with status ${res.status}`;
        try {
          const errJson = await res.json();
          if (errJson && typeof errJson === "object" && "detail" in errJson) {
            detail = typeof errJson.detail === "string" ? errJson.detail : JSON.stringify(errJson.detail);
          }
        } catch {
          // Non-JSON response
        }
        if (res.status === 401) {
          throw new SecurityServiceApiError(
            detail || "Session has expired or token is invalid. Please sign in again.",
            401,
            detail,
          );
        }
        if (res.status === 404) {
          throw new SecurityServiceApiError(
            "DAST scanning service is currently unavailable or not deployed at this endpoint (HTTP 404).",
            404,
            detail,
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
          `DAST service at ${this.baseUrl} returned non-JSON response (${res.status} ${res.statusText || "OK"}, Content-Type: "${contentType || "unknown"}"): "${preview}". ` +
            `Verify your DAST endpoint is running and returning valid API responses.`,
          res.status,
          rawText,
          "invalid_service_response",
        );
      }
    } catch (err: unknown) {
      if (err instanceof SecurityServiceApiError) {
        throw err;
      }

      throw new SecurityServiceApiError(
        err instanceof Error ? err.message : "Network error contacting DAST service",
        0,
      );
    }
  }

  async getHealth(): Promise<{ status: string; environment?: string; version?: string }> {
    return this.request("/health", { method: "GET" }, false);
  }

  async getTools(): Promise<DastToolCatalogResponse> {
    try {
      return await this.request("/v1/tools", { method: "GET" }, false);
    } catch {
      return await this.request("/v1/dast/tools", { method: "GET" }, false);
    }
  }

  async getDastTools(): Promise<DastToolCatalogResponse> {
    return this.getTools();
  }

  /**
   * Pre-flight SSRF Guardrail validation.
   * Asserts the target does not resolve to private/loopback/cloud metadata address space.
   */
  async validateTarget(targetUrl: string): Promise<DastValidateTargetResponse> {
    const raw = await this.request<Record<string, unknown>>(
      `/v1/dast/validate-target?target_url=${encodeURIComponent(targetUrl)}`,
      { method: "GET" },
      true,
    );
    const valid =
      typeof raw.valid === "boolean"
        ? raw.valid
        : typeof raw.ok === "boolean"
          ? raw.ok
          : Boolean(raw.safe_to_scan);

    return {
      valid,
      ok: valid,
      safe_to_scan: valid,
      target_url: (raw.target_url as string) || targetUrl,
      hostname: raw.hostname as string | undefined,
      resolved_ips: raw.resolved_ips as readonly string[] | undefined,
      ip_address: raw.ip_address as string | undefined,
      message: raw.message as string | undefined,
      code: raw.code as string | undefined,
      reason: (raw.reason as string) || (raw.message as string) || undefined,
    };
  }

  async validateDastTarget(targetUrl: string): Promise<DastValidateTargetResponse> {
    return this.validateTarget(targetUrl);
  }

  async submitScan(req: DastScanRequest): Promise<DastScanResponse> {
    const path = req.mode === "active" ? "/v1/dast/scan/active" : "/v1/dast/scan";
    return this.request(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
  }

  async submitActiveScan(req: DastScanRequest): Promise<DastScanResponse> {
    return this.submitScan({ ...req, mode: "active" });
  }

  async submitPassiveScan(req: DastScanRequest): Promise<DastScanResponse> {
    return this.submitScan({ ...req, mode: "passive" });
  }

  async listScans(params?: { limit?: number; offset?: number }): Promise<{ items: DastJobDetailResponse[] }> {
    const searchParams = new URLSearchParams();
    if (params?.limit !== undefined) searchParams.set("limit", String(params.limit));
    if (params?.offset !== undefined) searchParams.set("offset", String(params.offset));
    const qs = searchParams.toString() ? `?${searchParams.toString()}` : "";
    try {
      return await this.request<{ items: DastJobDetailResponse[] }>(`/v1/dast/scans${qs}`, { method: "GET" });
    } catch {
      return await this.request<{ items: DastJobDetailResponse[] }>(`/v1/jobs${qs}`, { method: "GET" });
    }
  }

  async getJob(jobId: string): Promise<DastJobDetailResponse> {
    return this.request(`/v1/jobs/${encodeURIComponent(jobId)}`, { method: "GET" });
  }

  async deleteJob(jobId: string): Promise<{ message: string }> {
    return this.request(`/v1/jobs/${encodeURIComponent(jobId)}`, { method: "DELETE" });
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
      const rawText = await res.text();
      try {
        return JSON.parse(rawText);
      } catch {
        return rawText;
      }
    } finally {
      clearTimeout(timer);
    }
  }

  async exportDastJob(jobId: string, format: "sarif" | "json" = "sarif"): Promise<unknown> {
    return this.exportFindings(jobId, format);
  }

  async pollJobUntilComplete(
    jobId: string,
    options: PollDastJobOptions = {},
  ): Promise<DastJobDetailResponse> {
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
      `Timed out waiting for DAST job ${jobId} to complete after ${maxWaitMs}ms`,
      408,
    );
  }

  /**
   * Fetches immutable security audit events (GET /v1/audit-events)
   */
  async getAuditEvents(params?: { limit?: number; offset?: number }): Promise<DastAuditEvent[]> {
    const searchParams = new URLSearchParams();
    if (params?.limit !== undefined) searchParams.set("limit", String(params.limit));
    if (params?.offset !== undefined) searchParams.set("offset", String(params.offset));
    const qs = searchParams.toString() ? `?${searchParams.toString()}` : "";
    const res = await this.request<DastAuditEvent[] | { items: DastAuditEvent[] }>(
      `/v1/audit-events${qs}`,
      { method: "GET" },
      true,
    );
    return Array.isArray(res) ? res : res.items || [];
  }

  /**
   * Subscribes to real-time Server-Sent Events (SSE) for live scan telemetry (GET /v1/jobs/{job_id}/stream)
   * Emits 'status', 'log', 'finding', and 'complete' events.
   * Returns a cleanup function that cancels the stream.
   */
  streamJobEvents(jobId: string, handlers: DastStreamHandlers): () => void {
    const token = this.jwtToken || DEFAULT_CODEFY_JWT;
    const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : "";
    const url = `${this.baseUrl}/v1/jobs/${encodeURIComponent(jobId)}/stream${tokenQuery}`;

    // If native EventSource exists (browser, webview)
    if (typeof EventSource !== "undefined") {
      const eventSource = new EventSource(url);

      eventSource.addEventListener("status", (e: MessageEvent) => {
        try {
          handlers.onStatus?.(JSON.parse(e.data) as DastStreamStatusData);
        } catch {
          // Ignore parse errors
        }
      });

      eventSource.addEventListener("log", (e: MessageEvent) => {
        try {
          handlers.onLog?.(JSON.parse(e.data) as DastStreamLogData);
        } catch {
          // Ignore parse errors
        }
      });

      eventSource.addEventListener("finding", (e: MessageEvent) => {
        try {
          handlers.onFinding?.(JSON.parse(e.data) as DastStreamFindingData);
        } catch {
          // Ignore parse errors
        }
      });

      eventSource.addEventListener("complete", (e: MessageEvent) => {
        try {
          handlers.onComplete?.(JSON.parse(e.data) as DastStreamCompleteData);
        } catch {
          // Ignore parse errors
        }
        eventSource.close();
      });

      eventSource.onerror = (err) => {
        handlers.onError?.(new Error("SSE stream error"));
        eventSource.close();
      };

      return () => eventSource.close();
    }

    // Node.js / environments without EventSource: use fetch with body reader
    const controller = new AbortController();
    let isClosed = false;

    (async () => {
      try {
        const headers = new Headers(this.getAuthHeader());
        headers.set("Accept", "text/event-stream");
        const res = await this.fetchImpl(url, {
          method: "GET",
          headers,
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          handlers.onError?.(new Error(`Failed to connect to SSE stream: ${res.status}`));
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (!isClosed) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const block of lines) {
            let eventType = "message";
            let dataStr = "";
            for (const line of block.split("\n")) {
              if (line.startsWith("event:")) {
                eventType = line.slice(6).trim();
              } else if (line.startsWith("data:")) {
                dataStr = line.slice(5).trim();
              }
            }
            if (!dataStr) continue;
            try {
              const parsed = JSON.parse(dataStr);
              if (eventType === "status") handlers.onStatus?.(parsed);
              else if (eventType === "log") handlers.onLog?.(parsed);
              else if (eventType === "finding") handlers.onFinding?.(parsed);
              else if (eventType === "complete") {
                handlers.onComplete?.(parsed);
                isClosed = true;
                break;
              }
            } catch {
              // Ignore parse error
            }
          }
        }
      } catch (err: unknown) {
        if (!isClosed && (err as { name?: string })?.name !== "AbortError") {
          handlers.onError?.(err instanceof Error ? err : new Error(String(err)));
        }
      }
    })();

    return () => {
      isClosed = true;
      controller.abort();
    };
  }
}
