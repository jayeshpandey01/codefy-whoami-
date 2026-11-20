import { describe, expect, it } from "vitest";
import type { ScanResultRead } from "@whoami/types";
import {
  normalizeRemoteFindings,
  normalizeDastJobFindings,
  normalizeSastJobFindings,
  deriveDastRemediation,
  deriveDastFix,
  deriveDastCwe,
  extractDastEvidence,
} from "../../orchestrator/normalizer.js";

describe("normalizeRemoteFindings", () => {
  it("converts remote scanner findings into WhoAmI Finding structures with graph traces", () => {
    const mockResult: ScanResultRead = {
      id: "result-uuid-1",
      scan_job_id: "scan-uuid-1",
      summary: {
        live_hosts_count: 1,
        risk_summary: {
          critical: 0,
          high: 1,
          medium: 1,
          low: 0,
          info: 1,
          total: 3,
        },
        findings: [
          {
            title: "Exposed Git Repository",
            severity: "high",
            description: "Found .git/HEAD exposed on the root web path.",
            host: "https://example.com/.git/HEAD",
            cwe: "CWE-200",
          },
          {
            title: "Missing Content Security Policy",
            severity: "medium",
            description: "Missing CSP header.",
            host: "https://example.com",
          },
        ],
      },
      created_at: "2026-09-01T00:00:00Z",
      artifact: null,
      error_logs: null,
    };

    const findings = normalizeRemoteFindings(mockResult, "example.com");
    expect(findings.length).toBe(2);

    const f1 = findings[0]!;
    expect(f1.id).toBe("remote-scan-uuid-1-1");
    expect(f1.severity).toBe("high");
    expect(f1.scope).toBe("endpoint");
    expect(f1.title).toBe("Exposed Git Repository");
    expect(f1.cwe).toBe("CWE-200");
    expect(f1.status).toBe("confirmed");
    expect(f1.trace.steps.length).toBe(3);
    expect(f1.trace.steps[0]?.role).toBe("source");
    expect(f1.trace.steps[2]?.role).toBe("sink");

    const f2 = findings[1]!;
    expect(f2.severity).toBe("medium");
    expect(f2.scope).toBe("endpoint");
    expect(f2.title).toBe("Missing Content Security Policy");
  });

  it("generates asset technology finding when technologies are discovered", () => {
    const mockResult: ScanResultRead = {
      id: "result-uuid-2",
      scan_job_id: "scan-uuid-2",
      summary: {
        live_hosts_count: 1,
        technologies: ["Nginx:1.24.0", "OpenSSL:3.0.2", "React"],
      },
      created_at: "2026-09-01T00:00:00Z",
      artifact: null,
      error_logs: null,
    };

    const findings = normalizeRemoteFindings(mockResult, "api.example.com");
    expect(findings.length).toBe(1);
    expect(findings[0]?.severity).toBe("low");
    expect(findings[0]?.title).toBe("Discovered Web Technologies");
    expect(findings[0]?.description).toContain(
      "Nginx:1.24.0, OpenSSL:3.0.2, React",
    );
  });

  it("normalizes diverse DAST scanner findings (XSS, CORS, CRLF, SSTI) with appropriate CWEs", () => {
    const mockResult: ScanResultRead = {
      id: "result-dast-various",
      scan_job_id: "scan-dast-100",
      created_at: "2026-09-01T00:00:00Z",
      artifact: null,
      error_logs: null,
      summary: {
        findings: [
          {
            title: "Reflected Cross-Site Scripting (XSS)",
            severity: "high",
            host: "https://example.com/search?q=test",
            description: "Reflected payload executed in DOM context",
          },
          {
            title: "CORS Misconfiguration — Arbitrary Origin Allowed",
            severity: "medium",
            host: "https://example.com/api/user",
            description: "Access-Control-Allow-Origin: * with credentials",
          },
          {
            title: "CRLF Injection / HTTP Response Splitting",
            severity: "medium",
            host: "https://example.com/redirect",
            description: "Injected newline headers",
          },
          {
            title: "Server-Side Template Injection (SSTI)",
            severity: "critical",
            host: "https://example.com/render",
            description: "Jinja2 template evaluation {{ 7*7 }}",
          },
        ],
      },
    };

    const findings = normalizeRemoteFindings(mockResult, "example.com");
    expect(findings.length).toBe(4);

    // XSS
    expect(findings[0]?.title).toContain("Cross-Site Scripting");
    expect(findings[0]?.cwe).toBe("CWE-79");
    expect(findings[0]?.trace.sinkClass).toBe("code-injection");

    // CORS
    expect(findings[1]?.title).toContain("CORS");
    expect(findings[1]?.cwe).toBe("CWE-942");
    expect(findings[1]?.trace.sinkClass).toBe("secret-exposure");

    // CRLF
    expect(findings[2]?.title).toContain("CRLF");
    expect(findings[2]?.cwe).toBe("CWE-113");
    expect(findings[2]?.trace.sinkClass).toBe("ssrf");

    // SSTI
    expect(findings[3]?.title).toContain("SSTI");
    expect(findings[3]?.cwe).toBe("CWE-1336");
    expect(findings[3]?.trace.sinkClass).toBe("code-injection");
  });

  it("properly classifies DAST findings containing a code property as endpoint scope", () => {
    const mockResult: ScanResultRead = {
      id: "res-dast-nasa",
      scan_job_id: "job-nasa-dast",
      created_at: "2026-09-18T12:00:00.000Z",
      artifact: null,
      error_logs: null,
      summary: {
        findings: [
          {
            code: "SEC_HEADER_MISSING_CSP",
            title: "Content-Security-Policy header is missing",
            severity: "low",
            description: "Missing Content-Security-Policy response header",
            host: "nasa.gov",
            matched_at: "https://nasa.gov",
          },
          {
            code: "SSL_TLS_WEAK_CIPHER",
            title: "Weak Cipher Suites Enabled",
            severity: "medium",
            host: "nasa.gov:443",
          },
        ],
      },
    };

    // 1. Inferred without explicit options
    const findingsInferred = normalizeRemoteFindings(mockResult, "nasa.gov");
    expect(findingsInferred.length).toBe(2);
    expect(findingsInferred[0]?.scope).toBe("endpoint");
    expect(findingsInferred[0]?.code).toBe("SEC_HEADER_MISSING_CSP");
    expect(findingsInferred[0]?.ruleId).toBe("remote-sec-header-missing-csp");
    expect(findingsInferred[1]?.scope).toBe("endpoint");
    expect(findingsInferred[1]?.code).toBe("SSL_TLS_WEAK_CIPHER");

    // 2. Explicit DAST profile options
    const findingsExplicit = normalizeRemoteFindings(mockResult, "nasa.gov", {
      isSast: false,
      profile: "recon",
    });
    expect(findingsExplicit[0]?.scope).toBe("endpoint");
    expect(findingsExplicit[1]?.scope).toBe("endpoint");
    // Verify hint and fix were populated
    expect(findingsExplicit[0]?.hint).toBeDefined();
    expect(findingsExplicit[0]?.hint).toContain("security response headers");
    expect(findingsExplicit[0]?.fix).toContain("Content-Security-Policy");
  });

  it("populates hint and fix in normalizeDastJobFindings", () => {
    const mockDastJob = {
      job_id: "job-dast-123",
      user_id: "user-1",
      mode: "fast" as const,
      scanned_tools: ["nuclei", "zap"],
      target_url: "https://example.com",
      status: "completed" as const,
      created_at: "2026-09-01T00:00:00Z",
      findings: [
        {
          id: "f-cors-1",
          fingerprint: "cors-fp-1",
          title: "CORS Wildcard Origin with Credentials",
          severity: "high" as const,
          tool_name: "nuclei",
          rule_id: "cors-misconfig",
          cwe_id: "CWE-942",
        },
        {
          id: "f-xss-2",
          fingerprint: "xss-fp-2",
          title: "Reflected Cross-Site Scripting (XSS)",
          severity: "high" as const,
          tool_name: "zap",
          rule_id: "xss-reflected",
          parameter: "q",
          remediation: "Custom remediation provided by scanner",
        },
      ],
    };

    const findings = normalizeDastJobFindings(mockDastJob, "https://example.com");
    expect(findings.length).toBe(2);
    expect(findings[0]?.scope).toBe("endpoint");
    expect(findings[0]?.hint).toContain("Access-Control-Allow-Origin");
    expect(findings[0]?.fix).toContain("app.use(cors");
    expect(findings[1]?.hint).toBe("Custom remediation provided by scanner");
    expect(findings[1]?.fix).toBe("Custom remediation provided by scanner");
  });

  it("populates hint and fix in normalizeSastJobFindings", () => {
    const mockSastJob = {
      job_id: "job-sast-456",
      user_id: "user-1",
      mode: "active" as const,
      expires_at: "2026-09-02T00:00:00Z",
      scanned_tools: ["semgrep"],
      status: "completed" as const,
      created_at: "2026-09-01T00:00:00Z",
      findings: [
        {
          fingerprint: "abc123456789",
          detected_by: ["semgrep"],
          title: "SQL Injection in User Lookup",
          severity: "critical" as const,
          tool_name: "semgrep",
          vulnerability_id: "sql-injection",
          file_path: "src/auth.ts",
          line_start: 42,
          remediation: "Use parameterized queries",
        },
      ],
    };

    const findings = normalizeSastJobFindings(mockSastJob, "src/auth.ts");
    expect(findings.length).toBe(1);
    expect(findings[0]?.hint).toBe("Use parameterized queries");
    expect(findings[0]?.fix).toBe("Use parameterized queries");
  });

  it("derives DAST remediation and code fix correctly for common flaw classes", () => {
    const corsHint = deriveDastRemediation("CORS Misconfiguration Allowed All", "CWE-942");
    expect(corsHint).toContain("Access-Control-Allow-Origin");
    const corsFix = deriveDastFix("CORS Misconfiguration", "CWE-942");
    expect(corsFix).toContain("cors({");

    const sqlHint = deriveDastRemediation("SQL Injection vulnerability");
    expect(sqlHint).toContain("parameterized queries");
    const sqlFix = deriveDastFix("SQL Injection", "CWE-89");
    expect(sqlFix).toContain("SELECT * FROM accounts WHERE id = ?");

    const xssHint = deriveDastRemediation("Stored Cross-Site Scripting (XSS)");
    expect(xssHint).toContain("HTML-encode");
    const xssFix = deriveDastFix("XSS vulnerability");
    expect(xssFix).toContain("escapeHtml(userInput)");
  });

  it("derives precise CWEs for all special DAST engines (GraphQL, TLS, JWT, IDOR, Commix)", () => {
    expect(deriveDastCwe("graphql-cop", "GraphQL Introspection Enabled")).toBe("CWE-200");
    expect(deriveDastCwe("graphql-cop", "GraphQL Batching Query DOS Attack")).toBe("CWE-400");
    expect(deriveDastCwe("graphql-cop", "GraphQL Query Injection")).toBe("CWE-943");
    expect(deriveDastCwe("sslyze", "Weak TLS 1.0 Cipher Suite")).toBe("CWE-326");
    expect(deriveDastCwe("sslyze", "Broken RC4 Cipher Enabled")).toBe("CWE-327");
    expect(deriveDastCwe("sslyze", "Expired SSL Certificate")).toBe("CWE-295");
    expect(deriveDastCwe("jwt_tool", "JWT None Algorithm Confusion")).toBe("CWE-345");
    expect(deriveDastCwe("jwt_tool", "Weak HMAC Secret Key")).toBe("CWE-522");
    expect(deriveDastCwe("jwt_tool", "Invalid JWT Signature")).toBe("CWE-347");
    expect(deriveDastCwe("access-control", "Insecure Direct Object Reference (IDOR)")).toBe("CWE-639");
    expect(deriveDastCwe("access-control", "Broken Object Level Authorization (BOLA)")).toBe("CWE-639");
    expect(deriveDastCwe("access-control", "Broken Function Level Authorization (BFLA)")).toBe("CWE-285");
    expect(deriveDastCwe("access-control", "Privilege Escalation")).toBe("CWE-269");
    expect(deriveDastCwe("commix", "OS Command Injection via Shell")).toBe("CWE-78");
    expect(deriveDastCwe("sqlmap", "Blind SQL Injection")).toBe("CWE-89");
  });

  it("extracts evidence and raw_output payloads in normalizeDastJobFindings", () => {
    const mockJob = {
      job_id: "job-evidence-test",
      user_id: "user-1",
      mode: "active" as const,
      scanned_tools: ["graphql-cop", "sslyze", "jwt_tool", "access-control"],
      target_url: "https://api.example.com",
      status: "completed" as const,
      created_at: "2026-09-01T00:00:00Z",
      findings: [
        {
          id: "f-gql-1",
          fingerprint: "gql-fp-1",
          tool_name: "graphql-cop",
          title: "GraphQL Introspection Enabled",
          severity: "medium" as const,
          evidence: { payload: '{"query":"{__schema{types{name}}}"}', proof: "__schema returned full AST" },
        },
        {
          id: "f-tls-2",
          fingerprint: "tls-fp-2",
          tool_name: "sslyze",
          title: "Weak Cipher Suites: TLS_RSA_WITH_AES_128_CBC_SHA",
          severity: "high" as const,
          raw_output: JSON.stringify({ extracted: "TLS_RSA_WITH_AES_128_CBC_SHA accepted" }),
        },
        {
          id: "f-jwt-3",
          fingerprint: "jwt-fp-3",
          tool_name: "jwt_tool",
          title: "JWT Algorithm 'none' Bypass",
          severity: "critical" as const,
          parameter: "Authorization",
          evidence: { payload: "eyJhbGciOiJub25lIn0.eyJzdWIiOiJhZG1pbiJ9." },
        },
        {
          id: "f-idor-4",
          fingerprint: "idor-fp-4",
          tool_name: "access-control",
          title: "IDOR on /api/user/:id",
          severity: "high" as const,
          parameter: "id",
          snippet: "HTTP 200 returned for unauthorized user record",
        },
      ],
    };

    const findings = normalizeDastJobFindings(mockJob, "https://api.example.com");
    expect(findings.length).toBe(4);

    // GraphQL
    expect(findings[0]?.cwe).toBe("CWE-200");
    expect(findings[0]?.description).toContain('Payload: {"query":"{__schema{types{name}}}"}');
    expect(findings[0]?.hint).toContain("GraphQL introspection");
    expect(findings[0]?.fix).toContain("ApolloServer");

    // TLS
    expect(findings[1]?.cwe).toBe("CWE-327");
    expect(findings[1]?.description).toContain("Evidence: TLS_RSA_WITH_AES_128_CBC_SHA accepted");
    expect(findings[1]?.hint).toContain("deprecated SSL/TLS protocols");
    expect(findings[1]?.fix).toContain("ssl_protocols");

    // JWT
    expect(findings[2]?.cwe).toBe("CWE-345");
    expect(findings[2]?.trace.steps.length).toBe(3);
    expect(findings[2]?.description).toContain("parameter: Authorization");
    expect(findings[2]?.description).toContain("Payload: eyJhbGciOiJub25lIn0.eyJzdWIiOiJhZG1pbiJ9.");
    expect(findings[2]?.hint).toContain("cryptographic signature verification");
    expect(findings[2]?.fix).toContain("jwt.verify");

    // IDOR
    expect(findings[3]?.cwe).toBe("CWE-639");
    expect(findings[3]?.trace.steps.length).toBe(3);
    expect(findings[3]?.description).toContain("parameter: id");
    expect(findings[3]?.hint).toContain("server-side authorization checks");
    expect(findings[3]?.fix).toContain("db.documents.findUnique");
  });
});
