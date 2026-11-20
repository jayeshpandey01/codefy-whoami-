import { describe, expect, it, vi } from "vitest";
import { DastClient } from "../../dast/client.js";
import { SecurityServiceApiError } from "../../sast/client.js";

describe("DastClient", () => {
  it("calls /health without authentication", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: "ok", uptime_seconds: 120 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const client = new DastClient({
      baseUrl: "https://test-dast.local",
      fetchImpl: fetchMock,
    });

    const health = await client.getHealth();
    expect(health.status).toBe("ok");
  });

  it("calls /v1/dast/tools to fetch catalog", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          tools: [
            {
              id: "owasp-zap",
              name: "OWASP ZAP",
              category: "DAST Engine",
              description: "Web crawler and active fuzzer",
            },
            {
              id: "nuclei",
              name: "Nuclei",
              category: "Vulnerability Scanner",
              description: "Fast template-based scanner",
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const client = new DastClient({
      baseUrl: "https://test-dast.local",
      fetchImpl: fetchMock,
    });

    const catalog = await client.getTools();
    expect(catalog.tools).toHaveLength(2);
    expect(catalog.tools[0]?.id).toBe("owasp-zap");
  });

  it("validates target URL for SSRF protection", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          target_url: "https://example.com",
          safe_to_scan: true,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const client = new DastClient({
      baseUrl: "https://test-dast.local",
      jwtToken: "test.jwt.bearer",
      fetchImpl: fetchMock,
    });

    const validation = await client.validateTarget("https://example.com");
    expect(validation.safe_to_scan).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://test-dast.local/v1/dast/validate-target?target_url=https%3A%2F%2Fexample.com",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("submits DAST scan with custom parameters", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          job_id: "dast_job_99",
          target_url: "https://example.com",
          mode: "passive",
          status: "pending",
          status_url: "/v1/jobs/dast_job_99",
          created_at: "2026-10-06T01:00:00Z",
          expires_at: "2026-10-07T01:00:00Z",
          message: "Scan queued",
        }),
        { status: 202, headers: { "Content-Type": "application/json" } },
      ),
    );

    const client = new DastClient({
      baseUrl: "https://test-dast.local",
      jwtToken: "test.jwt.bearer",
      fetchImpl: fetchMock,
    });

    const res = await client.submitScan({
      target_url: "https://example.com",
      mode: "passive",
      crawl_depth: 3,
    });

    expect(res.job_id).toBe("dast_job_99");
    expect(res.status).toBe("pending");
  });

  it("handles SSRF block response", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          detail: "Target hostname resolves to a restricted private or internal IP (127.0.0.1).",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      ),
    );

    const client = new DastClient({
      baseUrl: "https://test-dast.local",
      jwtToken: "test.jwt.bearer",
      fetchImpl: fetchMock,
    });

    await expect(
      client.submitScan({ target_url: "http://127.0.0.1:8000" }),
    ).rejects.toThrow("Target hostname resolves to a restricted private or internal IP");
  });

  it("handles 404 endpoint not deployed with friendly message", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("Not Found", {
        status: 404,
        headers: { "Content-Type": "text/plain" },
      }),
    );

    const client = new DastClient({
      baseUrl: "https://dast-dutn.onrender.com",
      jwtToken: "test.jwt.bearer",
      fetchImpl: fetchMock,
    });

    await expect(
      client.submitScan({ target_url: "https://example.com" }),
    ).rejects.toThrow("DAST scanning service is currently unavailable or not deployed");
  });

  it("fetches audit events via GET /v1/audit-events", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: "evt_1",
            event_type: "scan_dispatched",
            user_id: "usr_1",
            target_url: "https://example.com",
            mode: "passive",
            timestamp: "2026-11-13T12:59:30.124Z",
            client_ip: "103.21.244.2",
          },
          {
            id: "evt_2",
            event_type: "ssrf_prevented",
            user_id: "usr_1",
            target_url: "http://127.0.0.1:8000",
            timestamp: "2026-11-13T12:58:12.801Z",
            client_ip: "103.21.244.2",
          },
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const client = new DastClient({
      baseUrl: "https://test-dast.local",
      jwtToken: "test.jwt.bearer",
      fetchImpl: fetchMock,
    });

    const events = await client.getAuditEvents({ limit: 10, offset: 0 });
    expect(events).toHaveLength(2);
    expect(events[0]?.event_type).toBe("scan_dispatched");
    expect(events[1]?.event_type).toBe("ssrf_prevented");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://test-dast.local/v1/audit-events?limit=10&offset=0",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("handles fallback to origin when gateway request encounters network error", async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.startsWith("https://dast.pandeyjayesh020.workers.dev")) {
        return Promise.reject(new Error("Edge gateway network timeout"));
      }
      if (url.startsWith("https://dast-js9w.onrender.com")) {
        return Promise.resolve(
          new Response(JSON.stringify({ status: "ok", origin_fallback: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        );
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });

    const client = new DastClient({
      baseUrl: "https://dast.pandeyjayesh020.workers.dev",
      fetchImpl: fetchMock,
    });

    const health = await client.getHealth();
    expect(health.status).toBe("ok");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
