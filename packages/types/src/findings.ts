import type { TaintTrace } from "./taint.js";

/**
 * Tri-state model — never a numeric confidence score. See CLAUDE.md's
 * "Precision & Trust Over Volume" principle and the taint-engine skill.
 */
export type FindingStatus = "confirmed" | "needs-verification" | "discarded";

export type Severity = "critical" | "high" | "medium" | "low";

export type FindingScope =
  | "code"
  | "secrets"
  | "endpoint"
  | "security"
  | "orchestrator"
  | "parser"
  | string;

export interface Finding {
  readonly id: string;
  readonly ruleId: string;
  readonly status: FindingStatus;
  readonly severity: Severity;
  readonly title: string;
  readonly description: string;
  readonly cwe?: string;
  readonly trace: TaintTrace;
  readonly createdAt: string;

  /** Actual ast-grep YAML rule definition or parser specification in string form */
  readonly ruleYaml?: string;

  /** Diagnostic code (e.g. 'command_injection', 'syntax_error') */
  readonly code?: string;
  /** Diagnostic scope (e.g. 'code', 'secrets', 'endpoint', 'parser') */
  readonly scope?: FindingScope;
  /** Detailed reason explaining why this issue was flagged */
  readonly reason?: string;
  /** Actionable hint explaining how to remediate the issue */
  readonly hint?: string;
  /** Suggested copyable code fix snippet */
  readonly fix?: string;
  /** External documentation, CWE, or advisory link */
  readonly link?: string;
}

export * from "./finding-dedup.js";

const CODE_FILE_EXTENSIONS = new Set([
  "py", "js", "ts", "tsx", "jsx", "go", "rs", "java", "c", "cc", "cpp", "cxx",
  "h", "hh", "hpp", "hxx", "cs", "php", "rb", "swift", "kt", "kts", "scala",
  "m", "mm", "sh", "bash", "zsh", "pl", "pm", "json", "yaml", "yml", "toml",
  "xml", "html", "htm", "css", "scss", "sass", "sql", "md", "txt", "env", "lock"
]);

/**
 * Check if a finding is categorized as DAST (Dynamic analysis, target endpoint, live probe).
 *
 * `scope` is the primary signal -- SAST findings (local or cloud) carry
 * "code"/"secrets"/"security"/"parser", while cloud DAST findings carry
 * "orchestrator" or "endpoint". Also identifies DAST IDs starting with "dast-",
 * bare domain/IP/URL trace steps, and known DAST check-codes/rule-ids.
 */
export function isDastFinding(f: Finding): boolean {
  if (f.id.startsWith("dast-")) {
    return true;
  }
  // Explicit DAST / network scopes
  if (f.scope === "orchestrator" || f.scope === "endpoint") {
    return true;
  }

  const codeUpper = (f.code || "").toUpperCase();
  const ruleIdLower = (f.ruleId || "").toLowerCase();
  const isDastCodeOrRule =
    codeUpper.startsWith("SEC_HEADER_") ||
    codeUpper.startsWith("SSL_") ||
    codeUpper.startsWith("TLS_") ||
    codeUpper.startsWith("CORS_") ||
    codeUpper.startsWith("CSP_") ||
    codeUpper.startsWith("WAF_") ||
    codeUpper.startsWith("PORT_") ||
    codeUpper.startsWith("OPEN_PORT_") ||
    codeUpper.startsWith("DNS_") ||
    codeUpper.startsWith("NUCLEI_") ||
    codeUpper.startsWith("DALFOX_") ||
    codeUpper.startsWith("KATANA_") ||
    codeUpper.startsWith("HTTPX_") ||
    codeUpper.startsWith("FEROX_") ||
    codeUpper.startsWith("FFUF_") ||
    codeUpper.startsWith("ZAP_") ||
    codeUpper.startsWith("NIKTO_") ||
    ruleIdLower.includes("sec-header") ||
    ruleIdLower.includes("open-port") ||
    ruleIdLower.includes("weak-cipher");

  const isKnownSastTool =
    codeUpper.startsWith("JOERN") ||
    codeUpper.startsWith("SEMGREP") ||
    codeUpper.startsWith("TRUFFLEHOG") ||
    codeUpper.startsWith("GITLEAKS") ||
    codeUpper.startsWith("CODEQL") ||
    codeUpper.startsWith("AST_GREP") ||
    ruleIdLower.includes("joern") ||
    ruleIdLower.includes("semgrep") ||
    ruleIdLower.includes("trufflehog") ||
    ruleIdLower.includes("gitleaks") ||
    ruleIdLower.includes("codeql");

  // If finding has an explicit DAST check code or rule ID and is not a SAST tool,
  // classify as DAST even if the backend legacy scope was misattributed.
  if ((f.id.startsWith("remote-") || isDastCodeOrRule) && isDastCodeOrRule && !isKnownSastTool) {
    return true;
  }

  // Explicit SAST scopes always take precedence when not a DAST rule
  if (
    f.scope === "code" ||
    f.scope === "secrets" ||
    f.scope === "security" ||
    f.scope === "parser"
  ) {
    return false;
  }

  // Check if any trace step points to a URL, domain, IP, or network target
  const hasEndpointStep = f.trace?.steps?.some((s) => {
    const p = s.filePath?.trim() || "";
    if (!p) return false;
    if (p.startsWith("http://") || p.startsWith("https://") || p.includes("://")) {
      return true;
    }
    // IPv4 pattern (e.g. "192.168.1.1", "10.0.0.1:8080")
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?(\/.*)?$/.test(p)) {
      return true;
    }
    // Hostname/domain pattern (e.g. "nasa.gov", "nasa.gov:1", "api.target.com:443", "test.internal/path")
    // Must NOT be a source code filename extension like "server.py" or "app.js"
    const domainMatch = p.match(/^([a-zA-Z0-9.-]+\.([a-zA-Z]{2,}))(:\d+)?(\/.*)?$/i);
    if (domainMatch && domainMatch[2]) {
      const ext = domainMatch[2].toLowerCase();
      if (!CODE_FILE_EXTENSIONS.has(ext)) {
        return true;
      }
    }
    return false;
  });

  if (hasEndpointStep) {
    return true;
  }

  return false;
}

