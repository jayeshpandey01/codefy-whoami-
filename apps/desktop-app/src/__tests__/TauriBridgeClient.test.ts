import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BridgeMessage, DastStreamHandlers } from "@whoami/types";

const tauriFetch = vi.fn();
const authSession = {
  accessToken: "signed-in-user-token",
  tokenType: "bearer",
  userId: "user-1",
  email: "user@example.test",
  name: "Test User",
  tier: "community" as const,
  expiresAt: Date.now() + 60_000,
};

vi.mock("@tauri-apps/plugin-http", () => ({ fetch: (...args: unknown[]) => tauriFetch(...args) }));
vi.mock("../db/authRepo.js", () => ({
  getAuthSession: async () => authSession,
  clearAuthSession: vi.fn(async () => {}),
}));
vi.mock("../bridge/updater.js", () => ({
  checkForAppUpdate: vi.fn(async () => undefined),
  checkForVersionChange: vi.fn(async () => null),
  installPendingUpdate: vi.fn(),
  restartApp: vi.fn(),
}));
vi.mock("../bridge/workspaceFs.js", () => ({}));
vi.mock("../bridge/engineWorker.js", () => ({}));

const { TauriBridgeClient } = await import("../bridge/TauriBridgeClient.js");

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("TauriBridgeClient orchestrator requests", () => {
  beforeEach(() => {
    tauriFetch.mockReset();
    process.env.OPERATOR_API_KEY = "Jf2T0sTy0IauJ6ELjLWAibC9-EpFo5LXwneztTBeyAU";
    process.env.ADMIN_API_KEY = "nBK_0V8AQVDZmC6gTpgkTn04t7Gx2IYSYiPvdT5zymU";
  });

  it("sends orchestrator requests with the backend api key", async () => {
    tauriFetch.mockResolvedValue(jsonResponse([{ id: "t-1" }]));
    const bridge = new TauriBridgeClient();

    // list-scans is an operator endpoint (targets need the admin key).
    const res = await bridge.request<BridgeMessage, BridgeMessage>({
      type: "list-scans-request",
    } as BridgeMessage);

    expect(res.type).toBe("list-scans-result");
    expect(tauriFetch).toHaveBeenCalledOnce();
    const [url, init] = tauriFetch.mock.calls[0]!;
    expect(String(url)).toMatch(
      /^https:\/\/(sast\.jayeshpandey754\.workers\.dev|dast\.pandeyjayesh020\.workers\.dev|dast-js9w\.onrender\.com)\//,
    );
    const headers = (init as RequestInit).headers;
    const apiKey =
      headers instanceof Headers
        ? headers.get("X-API-Key")
        : (headers as Record<string, string>)?.["X-API-Key"];
    expect(apiKey).toBe("Jf2T0sTy0IauJ6ELjLWAibC9-EpFo5LXwneztTBeyAU");
  });

  it("handles target registration directly and sends admin requests with admin credentials", async () => {
    tauriFetch.mockResolvedValue(jsonResponse([{ id: "audit-1" }]));
    const bridge = new TauriBridgeClient();

    const regRes = await bridge.request<BridgeMessage, BridgeMessage>({
      type: "register-target-request",
      target: {
        value: "example.com",
        owner_reference: "Test User",
        authorization_reference: "AUTH-TEST-1",
        authorization_confirmed: true,
      },
    } as unknown as BridgeMessage);

    expect(regRes.type).toBe("register-target-result");
    if (regRes.type === "register-target-result") {
      expect(regRes.target?.value).toBe("example.com");
    }

    const auditRes = await bridge.request<BridgeMessage, BridgeMessage>({
      type: "list-audit-events-request",
    } as BridgeMessage);

    expect(auditRes.type).toBe("list-audit-events-result");
    expect(tauriFetch).toHaveBeenCalledOnce();
    const [url, init] = tauriFetch.mock.calls[0]!;
    expect(String(url)).toMatch(
      /^https:\/\/(sast\.jayeshpandey754\.workers\.dev|dast\.pandeyjayesh020\.workers\.dev|dast-js9w\.onrender\.com)\//,
    );
    expect((init as RequestInit).headers).toMatchObject({
      "X-API-Key": "nBK_0V8AQVDZmC6gTpgkTn04t7Gx2IYSYiPvdT5zymU",
    });
  });

  it("maps HTTP errors to an error message carrying the requestId", async () => {
    tauriFetch.mockResolvedValue(jsonResponse({ detail: "invalid api key" }, 401));
    const bridge = new TauriBridgeClient();
    const errors: BridgeMessage[] = [];
    bridge.on("error", (m) => errors.push(m));

    await expect(
      bridge.request({ type: "list-scans-request", requestId: "r-401" } as BridgeMessage),
    ).rejects.toThrow();
    expect(errors[0]).toMatchObject({ type: "error", requestId: "r-401", statusCode: 401 });
  });

  it("identifies expired sessions and marks them with session_expired error code", async () => {
    tauriFetch.mockResolvedValue(
      jsonResponse({ detail: "Session has expired or token is invalid." }, 401),
    );
    const bridge = new TauriBridgeClient();
    const errors: BridgeMessage[] = [];
    bridge.on("error", (m) => errors.push(m));

    await expect(
      bridge.request({ type: "list-scans-request", requestId: "r-expired" } as BridgeMessage),
    ).rejects.toThrow();
    expect(errors[0]).toMatchObject({
      type: "error",
      requestId: "r-expired",
      statusCode: 401,
      code: "session_expired",
    });
  });

  it("dispatches validate-dast-target-request and returns validate-dast-target-result", async () => {
    tauriFetch.mockResolvedValue(
      jsonResponse({ valid: true, ok: true, safe_to_scan: true, target_url: "https://example.com" }),
    );
    const bridge = new TauriBridgeClient();

    const res = await bridge.request<BridgeMessage, BridgeMessage>({
      type: "validate-dast-target-request",
      targetUrl: "https://example.com",
    } as BridgeMessage);

    expect(res.type).toBe("validate-dast-target-result");
    if (res.type === "validate-dast-target-result") {
      expect(res.valid).toBe(true);
      expect(res.targetUrl).toBe("https://example.com");
    }
    expect(tauriFetch).toHaveBeenCalledOnce();
    const [url] = tauriFetch.mock.calls[0]!;
    expect(String(url)).toContain("/v1/dast/validate-target");
  });

  it("dispatches list-dast-tools-request and returns list-dast-tools-result", async () => {
    tauriFetch.mockResolvedValue(
      jsonResponse({
        tools: [
          { id: "zap", name: "OWASP ZAP", category: "active", description: "DAST scanner" },
          { id: "sqlmap", name: "SQLMap", category: "active", description: "SQL Injection engine" },
        ],
      }),
    );
    const bridge = new TauriBridgeClient();

    const res = await bridge.request<BridgeMessage, BridgeMessage>({
      type: "list-dast-tools-request",
    } as BridgeMessage);

    expect(res.type).toBe("list-dast-tools-result");
    if (res.type === "list-dast-tools-result") {
      expect(res.tools).toHaveLength(2);
      expect(res.tools?.[0]?.id).toBe("zap");
    }
    expect(tauriFetch).toHaveBeenCalledOnce();
    const [url] = tauriFetch.mock.calls[0]!;
    expect(String(url)).toMatch(/\/v1\/(tools|dast\/tools)/);
  });

  it("dispatches export-dast-job-request and returns export-dast-job-result", async () => {
    tauriFetch.mockResolvedValue(
      jsonResponse({
        $schema: "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
        version: "2.1.0",
        runs: [],
      }),
    );
    const bridge = new TauriBridgeClient();

    const res = await bridge.request<BridgeMessage, BridgeMessage>({
      type: "export-dast-job-request",
      jobId: "dast-job-42",
      format: "sarif",
    } as BridgeMessage);

    expect(res.type).toBe("export-dast-job-result");
    if (res.type === "export-dast-job-result") {
      expect(res.jobId).toBe("dast-job-42");
      expect(res.format).toBe("sarif");
      expect(res.data).toHaveProperty("version", "2.1.0");
    }
    expect(tauriFetch).toHaveBeenCalledOnce();
    const [url] = tauriFetch.mock.calls[0]!;
    expect(String(url)).toContain("/v1/jobs/dast-job-42/export?format=sarif");
  });

  it("wires up streaming bridge messages from DastClient SSE stream to forward dast-stream-* events", async () => {
    const bridge = new TauriBridgeClient();
    const client = await (
      bridge as unknown as {
        createOrchestratorClient: () => Promise<{
          dast: { streamJobEvents: (jobId: string, handlers: DastStreamHandlers) => () => void };
        }>;
      }
    ).createOrchestratorClient();

    let capturedHandlers: DastStreamHandlers | undefined;
    const streamSpy = vi.spyOn(client.dast, "streamJobEvents").mockImplementation((_jobId, handlers) => {
      capturedHandlers = handlers;
      return () => {};
    });

    const statusEvents: BridgeMessage[] = [];
    const logEvents: BridgeMessage[] = [];
    const findingEvents: BridgeMessage[] = [];
    const completeEvents: BridgeMessage[] = [];

    bridge.on("dast-stream-status", (m) => statusEvents.push(m));
    bridge.on("dast-stream-log", (m) => logEvents.push(m));
    bridge.on("dast-stream-finding", (m) => findingEvents.push(m));
    bridge.on("dast-stream-complete", (m) => completeEvents.push(m));

    bridge.streamDastEvents("job-sse-test", "req-sse-1");

    // Allow doStream async tick
    await new Promise((r) => setTimeout(r, 10));

    expect(streamSpy).toHaveBeenCalledWith("job-sse-test", expect.any(Object));
    expect(capturedHandlers).toBeDefined();

    // Trigger status event
    capturedHandlers!.onStatus?.({
      job_id: "job-sse-test",
      status: "running",
      progress_percent: 50,
      current_tool: "sqlmap",
    });
    expect(statusEvents).toHaveLength(1);
    expect(statusEvents[0]).toMatchObject({
      type: "dast-stream-status",
      jobId: "job-sse-test",
      status: "running",
      progress_percent: 50,
      current_tool: "sqlmap",
      requestId: "req-sse-1",
    });

    // Trigger log event
    capturedHandlers!.onLog?.({
      timestamp: "2026-11-14T00:00:00Z",
      message: "Testing target parameter id",
      tool: "sqlmap",
    });
    expect(logEvents).toHaveLength(1);
    expect(logEvents[0]).toMatchObject({
      type: "dast-stream-log",
      jobId: "job-sse-test",
      message: "Testing target parameter id",
      tool: "sqlmap",
    });

    // Trigger finding event
    capturedHandlers!.onFinding?.({
      tool_name: "sqlmap",
      title: "Boolean-based blind SQL injection",
      severity: "HIGH",
      target_url: "https://example.com/api?id=1",
      cwe_id: "CWE-89",
    });
    expect(findingEvents).toHaveLength(1);
    expect(findingEvents[0]).toMatchObject({
      type: "dast-stream-finding",
      jobId: "job-sse-test",
      tool_name: "sqlmap",
      title: "Boolean-based blind SQL injection",
      severity: "HIGH",
    });

    // Trigger complete event
    capturedHandlers!.onComplete?.({
      status: "completed",
      total_findings: 1,
      duration_ms: 3500,
    });
    expect(completeEvents).toHaveLength(1);
    expect(completeEvents[0]).toMatchObject({
      type: "dast-stream-complete",
      jobId: "job-sse-test",
      status: "completed",
      total_findings: 1,
      duration_ms: 3500,
    });
  });
});
