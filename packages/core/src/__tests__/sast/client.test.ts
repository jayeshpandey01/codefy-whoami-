import { describe, expect, it, vi } from "vitest";
import { SastClient, SecurityServiceApiError } from "../../sast/client.js";

describe("SastClient", () => {
  it("calls /health without authentication", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: "ok", version: "0.1.0" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const client = new SastClient({
      baseUrl: "https://test-sast.local",
      fetchImpl: fetchMock,
    });

    const health = await client.getHealth();
    expect(health.status).toBe("ok");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://test-sast.local/health",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("calls /v1/tools to fetch catalog without auth", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          tools: [
            {
              id: "semgrep",
              name: "Semgrep",
              modes: ["passive", "active"],
              version: "1.78.0",
              category: "SAST",
              description: "Fast multi-language static analysis",
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const client = new SastClient({
      baseUrl: "https://test-sast.local",
      fetchImpl: fetchMock,
    });

    const catalog = await client.getTools();
    expect(catalog.tools).toHaveLength(1);
    expect(catalog.tools[0]?.id).toBe("semgrep");
  });

  it("throws SecurityServiceApiError when requesting protected endpoint without JWT", async () => {
    const client = new SastClient({
      baseUrl: "https://test-sast.local",
    });

    await expect(client.getJob("job_123")).rejects.toThrow(SecurityServiceApiError);
  });

  it("submits passive scan with Bearer token in multipart form", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          job_id: "job_passive_1",
          mode: "passive",
          status: "pending",
          status_url: "/v1/jobs/job_passive_1",
          created_at: "2026-10-06T01:00:00Z",
          expires_at: "2026-10-06T01:10:00Z",
          message: "Passive scan queued",
        }),
        { status: 202, headers: { "Content-Type": "application/json" } },
      ),
    );

    const client = new SastClient({
      baseUrl: "https://test-sast.local",
      jwtToken: "test.jwt.bearer",
      fetchImpl: fetchMock,
    });

    const dummyZip = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
    const res = await client.submitPassiveScan(dummyZip, "code.zip");

    expect(res.job_id).toBe("job_passive_1");
    expect(res.mode).toBe("passive");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://test-sast.local/v1/sast/scan",
      expect.objectContaining({
        method: "POST",
        headers: expect.any(Headers),
      }),
    );

    const calledHeaders = (fetchMock.mock.calls[0]![1] as RequestInit).headers as Headers;
    expect(calledHeaders.get("Authorization")).toBe("Bearer test.jwt.bearer");
  });

  it("submits direct scan with file_key and SHA-256 hash", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          job_id: "job_cached_98",
          mode: "diff",
          status: "completed",
          status_url: "/v1/jobs/job_cached_98",
          created_at: "2026-10-06T01:00:00Z",
          expires_at: "2026-10-06T01:10:00Z",
          message: "Scan completed instantly from cache",
          cached: true,
        }),
        { status: 202, headers: { "Content-Type": "application/json" } },
      ),
    );

    const client = new SastClient({
      baseUrl: "https://test-sast.local",
      jwtToken: "test.jwt.bearer",
      fetchImpl: fetchMock,
    });

    const res = await client.submitDirectScan({
      file_key: "uploads/code.zip",
      file_sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      mode: "diff",
    });

    expect(res.cached).toBe(true);
    expect(res.status).toBe("completed");
  });

  it("polls job until complete", async () => {
    let callCount = 0;
    const fetchMock = vi.fn().mockImplementation(() => {
      callCount++;
      const status = callCount >= 2 ? "completed" : "running";
      return Promise.resolve(
        new Response(
          JSON.stringify({
            job_id: "job_poll_1",
            user_id: "usr_1",
            mode: "passive",
            status,
            created_at: "2026-10-06T01:00:00Z",
            expires_at: "2026-10-06T01:10:00Z",
            findings: [],
            scanned_tools: ["semgrep"],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );
    });

    const client = new SastClient({
      baseUrl: "https://test-sast.local",
      jwtToken: "test.jwt.bearer",
      fetchImpl: fetchMock,
    });

    const job = await client.pollJobUntilComplete("job_poll_1", {
      intervalMs: 10,
      maxIntervalMs: 20,
    });

    expect(job.status).toBe("completed");
    expect(callCount).toBe(2);
  });

  it("fetches autofix git patch", async () => {
    const patchContent = `--- a/app.py\n+++ b/app.py\n@@ -1,1 +1,1 @@\n-eval(x)\n+ast.literal_eval(x)`;
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(patchContent, {
        status: 200,
        headers: { "Content-Type": "text/x-diff" },
      }),
    );

    const client = new SastClient({
      baseUrl: "https://test-sast.local",
      jwtToken: "test.jwt.bearer",
      fetchImpl: fetchMock,
    });

    const patch = await client.getAutofixPatch("job_fix_1");
    expect(patch).toContain("literal_eval");
  });

  it("submits passive scan with target_id in FormData", async () => {
    let capturedBody: FormData | undefined;
    const fetchMock = vi.fn().mockImplementation(async (_url: string, init?: RequestInit) => {
      capturedBody = init?.body as FormData;
      return new Response(
        JSON.stringify({
          job_id: "job_target_1",
          mode: "passive",
          status: "pending",
          status_url: "/v1/jobs/job_target_1",
          created_at: "2026-10-06T01:00:00Z",
          expires_at: "2026-10-06T01:10:00Z",
          message: "Scan queued",
        }),
        { status: 202, headers: { "Content-Type": "application/json" } },
      );
    });

    const client = new SastClient({
      baseUrl: "https://test-sast.local",
      jwtToken: "test.jwt.bearer",
      fetchImpl: fetchMock,
    });

    const dummyZip = new Uint8Array([0x50, 0x4b, 0x03, 0x04]);
    await client.submitPassiveScan(dummyZip, "code.zip", "target-workspace-123");

    expect(capturedBody).toBeDefined();
    expect(capturedBody?.get("target_id")).toBe("target-workspace-123");
  });

  it("lists scans with query parameters and returns ScanListResponse", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            {
              job_id: "job_list_1",
              target_id: "target-123",
              user_id: "user-abc",
              mode: "passive",
              status: "completed",
              created_at: "2026-10-18T19:00:00Z",
              expires_at: "2026-10-18T19:10:00Z",
              findings: [],
              scanned_tools: ["semgrep"],
            },
          ],
          total: 1,
          limit: 50,
          offset: 0,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const client = new SastClient({
      baseUrl: "https://test-sast.local",
      jwtToken: "test.jwt.bearer",
      fetchImpl: fetchMock,
    });

    const res = await client.listScans({ target_id: "target-123", limit: 50 });
    expect(res.total).toBe(1);
    expect(res.items).toHaveLength(1);
    expect(res.items[0]?.job_id).toBe("job_list_1");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://test-sast.local/v1/sast/scans?target_id=target-123&limit=50",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("handles non-JSON plain text responses (e.g. Hello world) gracefully with descriptive error", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response("Hello world", {
        status: 200,
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
      }),
    );

    const client = new SastClient({
      baseUrl: "https://test-sast.local",
      jwtToken: "test.jwt.bearer",
      fetchImpl: fetchMock,
    });

    await expect(client.getHealth()).rejects.toMatchObject({
      name: "SecurityServiceApiError",
      code: "invalid_service_response",
      statusCode: 200,
    });
  });

  it("submits diff-aware incremental scan via POST /v1/sast/scan/diff", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          job_id: "job_diff_123",
          mode: "diff",
          status: "pending",
          status_url: "/v1/jobs/job_diff_123",
          created_at: "2026-11-13T12:00:00Z",
          expires_at: "2026-11-13T12:10:00Z",
          message: "Diff scan accepted",
        }),
        { status: 202, headers: { "Content-Type": "application/json" } },
      ),
    );

    const client = new SastClient({
      baseUrl: "https://test-sast.local",
      jwtToken: "test.jwt.bearer",
      fetchImpl: fetchMock,
    });

    const res = await client.submitDiffScan({
      base_commit: "origin/main",
      patch_content: "diff --git a/app.ts b/app.ts\n...",
      target_id: "monorepo",
    });

    expect(res.job_id).toBe("job_diff_123");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://test-sast.local/v1/sast/scan/diff",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("submits nightly full sweep scan via POST /v1/sast/scan/nightly", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          job_id: "job_nightly_123",
          mode: "passive",
          status: "pending",
          status_url: "/v1/jobs/job_nightly_123",
          created_at: "2026-11-13T12:00:00Z",
          expires_at: "2026-11-13T12:10:00Z",
          message: "Nightly sweep queued",
        }),
        { status: 202, headers: { "Content-Type": "application/json" } },
      ),
    );

    const client = new SastClient({
      baseUrl: "https://test-sast.local",
      jwtToken: "test.jwt.bearer",
      fetchImpl: fetchMock,
    });

    const res = await client.submitNightlyScan({ target_id: "monorepo" });
    expect(res.job_id).toBe("job_nightly_123");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://test-sast.local/v1/sast/scan/nightly",
      expect.objectContaining({
        method: "POST",
        headers: expect.any(Headers),
        body: "target_id=monorepo",
      }),
    );
  });

  it("queries BugBound V3 canonical issues via GET /v1/sast/issues", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            {
              issue_id: "iss_sqli_1",
              repo_id: "monorepo",
              fingerprint: "fp_sqli_abc",
              title: "SQL Injection in User Query",
              category: "SQL_INJECTION",
              severity: "critical",
              source_tool: "semgrep",
              anchor: {
                type: "code",
                code: { file_path: "db.ts", line_start: 42 },
              },
              status: "discovered",
              first_seen: "2026-11-13T12:00:00Z",
              last_seen: "2026-11-13T12:00:00Z",
              occurrence_count: 1,
            },
          ],
          total: 1,
          limit: 20,
          offset: 0,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const client = new SastClient({
      baseUrl: "https://test-sast.local",
      jwtToken: "test.jwt.bearer",
      fetchImpl: fetchMock,
    });

    const res = await client.listIssues({ severity: "critical", limit: 20 });
    expect(res.items).toHaveLength(1);
    expect(res.items[0]?.issue_id).toBe("iss_sqli_1");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://test-sast.local/v1/sast/issues?severity=critical&limit=20",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("fetches security posture and metrics summary via GET /v1/sast/issues/metrics/summary", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          total_issues: 10,
          open_issues: 5,
          triaged_issues: 2,
          verified_issues: 1,
          fixed_issues: 2,
          regression_locked_issues: 0,
          closed_issues: 0,
          risk_accepted_issues: 0,
          critical_count: 2,
          high_count: 3,
          medium_count: 3,
          low_count: 2,
          info_count: 0,
          sla_breached_count: 1,
          top_categories: { SQL_INJECTION: 3, SSRF: 2 },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const client = new SastClient({
      baseUrl: "https://test-sast.local",
      jwtToken: "test.jwt.bearer",
      fetchImpl: fetchMock,
    });

    const metrics = await client.getIssueMetricsSummary("monorepo");
    expect(metrics.total_issues).toBe(10);
    expect(metrics.critical_count).toBe(2);
    expect(metrics.sla_breached_count).toBe(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://test-sast.local/v1/sast/issues/metrics/summary?repo_id=monorepo",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("transitions issue status via POST /v1/sast/issues/{issue_id}/transition", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          issue_id: "iss_sqli_1",
          status: "triaged",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const client = new SastClient({
      baseUrl: "https://test-sast.local",
      jwtToken: "test.jwt.bearer",
      fetchImpl: fetchMock,
    });

    const res = await client.transitionIssue("iss_sqli_1", "triaged", "Verified by analyst", "user:sec");
    expect(res.status).toBe("triaged");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://test-sast.local/v1/sast/issues/iss_sqli_1/transition",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          target_status: "triaged",
          reason: "Verified by analyst",
          actor: "user:sec",
        }),
      }),
    );
  });

  it("grants risk acceptance exemption with max 90-day clamp", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          issue_id: "iss_sqli_1",
          status: "risk_accepted",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const client = new SastClient({
      baseUrl: "https://test-sast.local",
      jwtToken: "test.jwt.bearer",
      fetchImpl: fetchMock,
    });

    // Request with 120 days should clamp to 90
    await client.grantRiskAcceptance("iss_sqli_1", "Lead Dev", "Compensating controls in WAF", 120);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://test-sast.local/v1/sast/issues/iss_sqli_1/risk-acceptance",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          accepted_by: "Lead Dev",
          reason: "Compensating controls in WAF",
          expires_days: 90,
        }),
      }),
    );
  });

  it("lists security audit events via GET /v1/audit-events", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            {
              id: "evt_1",
              event_type: "scan.completed",
              action: "scan_complete",
              user_id: "usr_1",
              severity: "info",
              details: { job_id: "job_123" },
              timestamp: "2026-11-13T12:00:00Z",
            },
          ],
          total: 1,
          limit: 10,
          offset: 0,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const client = new SastClient({
      baseUrl: "https://test-sast.local",
      jwtToken: "test.jwt.bearer",
      fetchImpl: fetchMock,
    });

    const res = await client.listAuditEvents({ limit: 10 });
    expect(res.items).toHaveLength(1);
    expect(res.items[0]?.event_type).toBe("scan.completed");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://test-sast.local/v1/audit-events?limit=10",
      expect.objectContaining({ method: "GET" }),
    );
  });
});
