import { describe, it, expect } from "vitest";
import { deduplicateFindings, getFindingDeduplicationKey, isDastFinding } from "@whoami/types";
import type { Finding } from "@whoami/types";

describe("Finding Deduplication", () => {
  it("deduplicates code findings at the same file and line with the same vulnerability", () => {
    const finding1: Finding = {
      id: "f-1",
      ruleId: "js-sql-injection-string-concat",
      severity: "high",
      status: "confirmed",
      title: "SQL Injection via String Concatenation",
      description: "User input directly interpolated into SQL query",
      cwe: "CWE-89",
      createdAt: new Date().toISOString(),
      trace: {
        sinkClass: "sql-injection",
        steps: [
          { filePath: "src/db.ts", line: 10, label: "req.query.id", role: "source" },
          { filePath: "src/db.ts", line: 15, label: "db.query", role: "sink" },
        ],
      },
      fix: "Use parameterized queries ($1)",
    };

    const finding2: Finding = {
      id: "f-2",
      ruleId: "js-sql-injection-string-concat",
      severity: "high",
      status: "needs-verification",
      title: "SQL Injection via String Concatenation",
      description: "Duplicate finding from a re-scan or overlapping rule",
      cwe: "CWE-89",
      createdAt: new Date().toISOString(),
      trace: {
        sinkClass: "sql-injection",
        steps: [
          { filePath: "src/db.ts", line: 15, label: "db.query", role: "sink" },
        ],
      },
    };

    const result = deduplicateFindings([finding1, finding2]);
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("f-1");
    expect(result[0]!.status).toBe("confirmed");
    expect(result[0]!.fix).toBeDefined();
  });

  it("favors the confirmed status and richer trace when duplicate findings arrive in reverse order", () => {
    const unconfirmedFinding: Finding = {
      id: "unconfirmed-id",
      ruleId: "js-command-injection-exec",
      severity: "critical",
      status: "needs-verification",
      title: "Command Injection via exec",
      description: "Potentially unsafe command execution",
      cwe: "CWE-78",
      createdAt: new Date().toISOString(),
      trace: {
        sinkClass: "command-injection",
        steps: [
          { filePath: "server.js", line: 25, label: "exec", role: "sink" },
        ],
      },
    };

    const confirmedFinding: Finding = {
      id: "confirmed-id",
      ruleId: "js-command-injection-exec",
      severity: "critical",
      status: "confirmed",
      title: "Command Injection via exec",
      description: "Confirmed command execution vulnerability",
      cwe: "CWE-78",
      createdAt: new Date().toISOString(),
      trace: {
        sinkClass: "command-injection",
        steps: [
          { filePath: "server.js", line: 20, label: "source", role: "source" },
          { filePath: "server.js", line: 25, label: "sink", role: "sink" },
        ],
      },
      fix: "execFile('cmd', [args])",
    };

    const result = deduplicateFindings([unconfirmedFinding, confirmedFinding]);
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("confirmed-id");
    expect(result[0]!.status).toBe("confirmed");
    expect(result[0]!.trace.steps).toHaveLength(2);
  });

  it("deduplicates remote DAST findings based on host, path, and vulnerability type", () => {
    const dast1: Finding = {
      id: "remote-recon-1",
      ruleId: "remote-cors-misconfiguration",
      scope: "endpoint",
      severity: "medium",
      status: "confirmed",
      title: "Overly Permissive CORS Policy",
      description: "Access-Control-Allow-Origin: * with credentials",
      cwe: "CWE-942",
      createdAt: new Date().toISOString(),
      trace: {
        sinkClass: "prototype-pollution",
        steps: [
          { filePath: "https://api.example.com/v1/users", line: 1, label: "Origin Header", role: "source" },
          { filePath: "https://api.example.com/v1/users", line: 1, label: "Response Header", role: "sink" },
        ],
      },
    };

    const dast2: Finding = {
      id: "remote-recon-2",
      ruleId: "remote-cors-misconfiguration",
      scope: "endpoint",
      severity: "medium",
      status: "needs-verification",
      title: "Overly Permissive CORS Policy",
      description: "Discovered on duplicate scan run",
      cwe: "CWE-942",
      createdAt: new Date().toISOString(),
      trace: {
        sinkClass: "prototype-pollution",
        steps: [
          { filePath: "https://api.example.com/v1/users", line: 1, label: "Origin", role: "source" },
          { filePath: "https://api.example.com/v1/users", line: 1, label: "Response", role: "sink" },
        ],
      },
    };

    const result = deduplicateFindings([dast1, dast2]);
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("remote-recon-1");
  });

  it("preserves distinct findings at different locations or different CWEs", () => {
    const findingA: Finding = {
      id: "fa",
      ruleId: "js-sql-injection-string-concat",
      severity: "high",
      status: "confirmed",
      title: "SQL Injection",
      description: "SQLi at line 10",
      cwe: "CWE-89",
      createdAt: new Date().toISOString(),
      trace: {
        sinkClass: "sql-injection",
        steps: [
          { filePath: "src/db.ts", line: 10, label: "req.query.id", role: "source" },
          { filePath: "src/db.ts", line: 10, label: "db.query", role: "sink" },
        ],
      },
    };

    const findingB: Finding = {
      id: "fb",
      ruleId: "js-path-traversal",
      severity: "high",
      status: "confirmed",
      title: "Path Traversal",
      description: "Path traversal at line 20",
      cwe: "CWE-22",
      createdAt: new Date().toISOString(),
      trace: {
        sinkClass: "path-traversal",
        steps: [
          { filePath: "src/db.ts", line: 20, label: "req.query.file", role: "source" },
          { filePath: "src/db.ts", line: 20, label: "fs.readFile", role: "sink" },
        ],
      },
    };

    const result = deduplicateFindings([findingA, findingB]);
    expect(result).toHaveLength(2);
  });

  it("handles empty arrays gracefully", () => {
    expect(deduplicateFindings([])).toEqual([]);
  });

  describe("isDastFinding & Cross-Mode Findings Preservation", () => {
    const sastFinding: Finding = {
      id: "sast-local-1",
      ruleId: "python-sql-injection",
      severity: "high",
      status: "confirmed",
      scope: "code",
      title: "SQL Injection in User Query",
      description: "Direct parameter interpolation",
      createdAt: new Date().toISOString(),
      trace: {
        sinkClass: "sql-injection",
        steps: [{ filePath: "server.py", line: 45, label: "cursor.execute", role: "sink" }],
      },
    };

    const cloudSastFinding: Finding = {
      id: "remote-semgrep-finding",
      ruleId: "semgrep-hardcoded-secret",
      severity: "critical",
      status: "confirmed",
      scope: "secrets",
      code: "SEMGREP_SECRET",
      title: "Hardcoded API Key",
      description: "Secret found in file",
      createdAt: new Date().toISOString(),
      trace: {
        sinkClass: "secret-exposure",
        steps: [{ filePath: "config.py", line: 12, label: "API_KEY", role: "source" }],
      },
    };

    const dastFindingEndpoint: Finding = {
      id: "dast-nuclei-cve",
      ruleId: "nuclei-cve-2024-1234",
      severity: "critical",
      status: "confirmed",
      scope: "endpoint",
      title: "RCE in API Endpoint",
      description: "Exploited vulnerability on live target",
      createdAt: new Date().toISOString(),
      trace: {
        sinkClass: "command-injection",
        steps: [{ filePath: "https://api.example.com/v1/exec", line: 1, label: "Endpoint", role: "source" }],
      },
    };

    const dastFindingDomain: Finding = {
      id: "remote-probe-80",
      ruleId: "open-port-80",
      severity: "medium",
      status: "confirmed",
      code: "PORT_HTTP_OPEN",
      title: "Open HTTP Port",
      description: "Port 80 reachable on target",
      createdAt: new Date().toISOString(),
      trace: {
        sinkClass: "ssrf",
        steps: [{ filePath: "nasa.gov:80", line: 1, label: "Port", role: "source" }],
      },
    };

    it("accurately categorizes SAST and DAST findings", () => {
      expect(isDastFinding(sastFinding)).toBe(false);
      expect(isDastFinding(cloudSastFinding)).toBe(false);
      expect(isDastFinding(dastFindingEndpoint)).toBe(true);
      expect(isDastFinding(dastFindingDomain)).toBe(true);
    });

    it("preserves DAST findings when SAST scan completes and merges", () => {
      const initialFindings = [sastFinding, dastFindingEndpoint, dastFindingDomain];
      const newSastFinding: Finding = {
        ...sastFinding,
        id: "sast-local-2",
        title: "New Command Injection",
      };

      // SAST scan finishes: replaces previous SAST, retains DAST findings
      const nextSastResults = [newSastFinding];
      const merged = deduplicateFindings([
        ...initialFindings.filter(isDastFinding),
        ...nextSastResults,
      ]);

      expect(merged).toHaveLength(3);
      expect(merged.some((f) => f.id === "sast-local-2")).toBe(true);
      expect(merged.some((f) => f.id === "dast-nuclei-cve")).toBe(true);
      expect(merged.some((f) => f.id === "remote-probe-80")).toBe(true);
      expect(merged.some((f) => f.id === "sast-local-1")).toBe(false);
    });

    it("preserves SAST findings when DAST scan completes and merges", () => {
      const initialFindings = [sastFinding, cloudSastFinding, dastFindingEndpoint];
      const newDastFinding: Finding = {
        ...dastFindingEndpoint,
        id: "dast-zap-xss",
        title: "Cross-Site Scripting via Form",
      };

      // DAST scan finishes: replaces previous DAST, retains SAST findings
      const nextDastResults = [newDastFinding];
      const merged = deduplicateFindings([
        ...initialFindings.filter((f) => !isDastFinding(f)),
        ...nextDastResults,
      ]);

      expect(merged).toHaveLength(3);
      expect(merged.some((f) => f.id === "sast-local-1")).toBe(true);
      expect(merged.some((f) => f.id === "remote-semgrep-finding")).toBe(true);
      expect(merged.some((f) => f.id === "dast-zap-xss")).toBe(true);
      expect(merged.some((f) => f.id === "dast-nuclei-cve")).toBe(false);
    });
  });
});

