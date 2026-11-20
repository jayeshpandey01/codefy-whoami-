import {
  type DastJobDetailResponse,
  type Finding,
  type RemoteFindingSummary,
  type SastFindingEvidence,
  type SastFindingSummary,
  type SastJobDetailResponse,
  type ScanResultRead,
  type SinkClass,
  type TaintStep,
  isSastProfile,
} from "@whoami/types";

function mapSeverity(rawSeverity?: string): Finding["severity"] {
  const normalized = (rawSeverity || "low").toLowerCase();
  if (normalized === "critical") return "critical";
  if (normalized === "high" || normalized === "error") return "high";
  if (normalized === "medium" || normalized === "warn" || normalized === "warning")
    return "medium";
  return "low";
}

function detectSinkClass(title: string, desc?: string, code?: string): SinkClass {
  const text = `${title} ${desc || ""} ${code || ""}`.toLowerCase();
  if (
    text.includes("secret") ||
    text.includes("credential") ||
    text.includes("token") ||
    text.includes("trufflehog") ||
    text.includes("gitleaks") ||
    text.includes("entropy") ||
    text.includes("cors") ||
    text.includes("cwe-942") ||
    text.includes("jwt") ||
    text.includes("api_key") ||
    text.includes("password") ||
    text.includes("cwe-798") ||
    text.includes("cwe-522") ||
    text.includes("cwe-347") ||
    text.includes("cwe-345") ||
    text.includes("tls") ||
    text.includes("ssl") ||
    text.includes("cipher") ||
    text.includes("cwe-326") ||
    text.includes("cwe-327")
  ) {
    return "secret-exposure";
  }
  if (
    text.includes("sql") ||
    (text.includes("injection") && text.includes("db")) ||
    text.includes("cwe-89") ||
    text.includes("graphql") ||
    text.includes("cwe-943")
  ) {
    return text.includes("graphql") && !text.includes("injection") ? "secret-exposure" : "sql-injection";
  }
  if (
    text.includes("ssrf") ||
    text.includes("request forgery") ||
    text.includes("open redirect") ||
    text.includes("crlf") ||
    text.includes("cwe-113") ||
    text.includes("cwe-918") ||
    text.includes("idor") ||
    text.includes("bola") ||
    text.includes("cwe-639") ||
    text.includes("access control")
  ) {
    return "ssrf";
  }
  if (
    text.includes("xss") ||
    text.includes("cross-site scripting") ||
    text.includes("ssti") ||
    text.includes("template injection") ||
    text.includes("eval") ||
    text.includes("code injection") ||
    text.includes("cwe-79") ||
    text.includes("cwe-94") ||
    text.includes("cwe-1336")
  ) {
    return "code-injection";
  }
  if (
    text.includes("exec") ||
    text.includes("command") ||
    /\b(exec|execa|spawn|command|shell|system-call)\b/i.test(text) ||
    text.includes("rce") ||
    text.includes("shell") ||
    text.includes("system-call") ||
    text.includes("command injection") ||
    text.includes("cwe-78") ||
    text.includes("commix")
  ) {
    return "command-injection";
  }
  if (
    text.includes("traversal") ||
    text.includes("file read") ||
    text.includes("directory") ||
    text.includes("cwe-22")
  ) {
    return "path-traversal";
  }
  if (
    text.includes("prototype") ||
    text.includes("pollution") ||
    text.includes("cwe-1321")
  ) {
    return "prototype-pollution";
  }
  return "ssrf";
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function parseLocation(
  locStr?: string,
  fallbackFile = "target",
  fallbackLine = 1,
): { file: string; line: number } {
  if (!locStr) return { file: fallbackFile, line: fallbackLine };
  const cleaned = locStr.replace(/\s*\([^)]*\)$/, "").trim();
  const match = cleaned.match(/^(.*?):(\d+)(?::\d+)?$/);
  if (match && match[1] && match[2]) {
    return { file: match[1], line: parseInt(match[2], 10) || fallbackLine };
  }
  return { file: cleaned || fallbackFile, line: fallbackLine };
}

function extractCwe(rawCwe?: string | string[]): string | undefined {
  if (!rawCwe) return undefined;
  if (Array.isArray(rawCwe)) {
    for (const item of rawCwe) {
      const match = String(item).match(/(CWE-\d+)/i);
      if (match && match[1]) return match[1].toUpperCase();
    }
    return undefined;
  }
  const match = String(rawCwe).match(/(CWE-\d+)/i);
  return match && match[1] ? match[1].toUpperCase() : rawCwe;
}

export interface NormalizeRemoteFindingsOptions {
  isSast?: boolean;
  profile?: string;
}

/**
 * Normalizes findings from remote scanners (DAST: Nuclei, HTTPX, Nmap and SAST: Joern CPG, Semgrep, TruffleHog)
 * into native WhoAmI Finding structures.
 */
export function normalizeRemoteFindings(
  result: ScanResultRead,
  targetValue = "target",
  options?: NormalizeRemoteFindingsOptions,
): Finding[] {
  const findings: Finding[] = [];
  const createdAt = result.created_at || new Date().toISOString();
  const rawFindings = result.summary?.findings || [];

  for (let i = 0; i < rawFindings.length; i++) {
    const raw = rawFindings[i]!;
    const rawAny = raw as unknown as Record<string, unknown>;
    const rawCode = typeof rawAny.code === "string" ? rawAny.code : "";
    const evidenceObj =
      typeof rawAny.evidence === "object" && rawAny.evidence !== null
        ? (rawAny.evidence as Record<string, unknown>)
        : undefined;

    const hasSastToolPrefix =
      rawCode.startsWith("JOERN") ||
      rawCode.startsWith("SEMGREP") ||
      rawCode.startsWith("TRUFFLEHOG") ||
      rawCode.startsWith("GITLEAKS") ||
      rawCode.startsWith("CODEQL") ||
      rawCode.startsWith("AST_GREP");

    const hasSastEvidence = Boolean(
      evidenceObj?.flow ||
      evidenceObj?.detector ||
      evidenceObj?.check_id ||
      (typeof evidenceObj?.file === "string" &&
        !evidenceObj.file.includes("://") &&
        /\.(tsx?|jsx?|py|java|go|c|cpp|rs|php|rb|html|vue|svelte)$/i.test(evidenceObj.file))
    );

    const hasDastIndicators = Boolean(
      rawAny.matched_at ||
      rawAny.template_id ||
      rawAny.host ||
      rawCode.startsWith("SEC_HEADER_") ||
      rawCode.startsWith("SSL_") ||
      rawCode.startsWith("TLS_") ||
      rawCode.startsWith("CORS_") ||
      rawCode.startsWith("CSP_") ||
      rawCode.startsWith("WAF_") ||
      rawCode.startsWith("PORT_") ||
      rawCode.startsWith("OPEN_PORT_") ||
      rawCode.startsWith("DNS_") ||
      rawCode.startsWith("NUCLEI_") ||
      rawCode.startsWith("DALFOX_") ||
      rawCode.startsWith("KATANA_") ||
      rawCode.startsWith("HTTPX_") ||
      rawCode.startsWith("FEROX_") ||
      rawCode.startsWith("FFUF_") ||
      rawCode.startsWith("ZAP_") ||
      rawCode.startsWith("NIKTO_")
    );

    let isSastFinding: boolean;
    if (options?.isSast !== undefined) {
      isSastFinding = options.isSast;
    } else if (options?.profile) {
      isSastFinding = isSastProfile(options.profile);
    } else if (hasDastIndicators) {
      isSastFinding = false;
    } else if (hasSastToolPrefix || hasSastEvidence) {
      isSastFinding = true;
    } else {
      isSastFinding = "code" in raw && typeof raw.code === "string";
    }

    const findingId = `remote-${result.scan_job_id}-${i + 1}`;
    const severity = mapSeverity(raw.severity);

    if (isSastFinding) {
      const item = raw as SastFindingSummary;
      const evidence =
        typeof item.evidence === "object" && item.evidence !== null
          ? (item.evidence as SastFindingEvidence)
          : undefined;

      const codeStr = item.code || "";
      const titleLowerSast = (item.title || "").toLowerCase();
      const isJoern =
        codeStr.startsWith("JOERN") ||
        titleLowerSast.includes("joern") ||
        Boolean(evidence?.flow);
      const isTrufflehog =
        codeStr.startsWith("TRUFFLEHOG") ||
        titleLowerSast.includes("trufflehog") ||
        (typeof evidence?.detector === "string" &&
          evidence.detector.toLowerCase().includes("trufflehog"));
      const isGitleaks =
        codeStr.startsWith("GITLEAKS") ||
        titleLowerSast.includes("gitleaks") ||
        (typeof evidence?.detector === "string" &&
          evidence.detector.toLowerCase().includes("gitleaks")) ||
        codeStr.toLowerCase().includes("entropy");
      const isCodeql =
        codeStr.startsWith("CODEQL") ||
        titleLowerSast.includes("codeql");
      const isSemgrep =
        codeStr.startsWith("SEMGREP") ||
        titleLowerSast.includes("semgrep") ||
        (typeof evidence?.detector === "string" &&
          evidence.detector.toLowerCase().includes("semgrep")) ||
        Boolean(evidence?.check_id);

      const isSecret =
        isTrufflehog ||
        isGitleaks ||
        titleLowerSast.includes("secret") ||
        titleLowerSast.includes("credential") ||
        titleLowerSast.includes("token leak") ||
        titleLowerSast.includes("api key") ||
        titleLowerSast.includes("private key");

      const sinkClass = isSecret
        ? "secret-exposure"
        : detectSinkClass(item.title, item.description, codeStr);
      const cwe =
        extractCwe(evidence?.cwe) ||
        (sinkClass === "sql-injection"
          ? "CWE-89"
          : sinkClass === "command-injection"
            ? "CWE-78"
            : sinkClass === "secret-exposure"
              ? "CWE-798"
              : sinkClass === "path-traversal"
                ? "CWE-22"
                : severity === "critical"
                  ? "CWE-94"
                  : "CWE-200");

      let traceSteps: TaintStep[] = [];

      // 1. Joern CPG or CodeQL with multi-step taint propagation flow
      if ((isJoern || isCodeql) && evidence?.flow && evidence.flow.length > 0) {
        const flow = evidence.flow;
        traceSteps = flow.map((step, idx) => {
          const parsed = parseLocation(
            step.location,
            evidence.file || targetValue,
            evidence.line || 1,
          );
          let role: TaintStep["role"] = "sanitizer";
          if (idx === 0 || step.type.toLowerCase().includes("source")) {
            role = "source";
          } else if (
            idx === flow.length - 1 ||
            step.type.toLowerCase().includes("sink")
          ) {
            role = "sink";
          }

          const varLabel = step.variable ? `${step.variable}: ` : "";
          return {
            role,
            label: `${varLabel}${step.type}`,
            filePath: parsed.file,
            line: parsed.line,
          };
        });
      } else if (isTrufflehog || isGitleaks) {
        // 2. Secret Detection (TruffleHog / Gitleaks)
        const parsed = parseLocation(
          evidence?.location,
          evidence?.file || targetValue,
          evidence?.line || 1,
        );
        const detectorName =
          evidence?.detector || (isGitleaks ? "Gitleaks Entropy Secret" : "Secret");
        const verifiedLabel = evidence?.verified ? " [VERIFIED LIVE]" : "";

        traceSteps = [
          {
            role: "source",
            label: `Scanned File: ${parsed.file}`,
            filePath: parsed.file,
            line: parsed.line,
          },
          {
            role: "sink",
            label: `Exposed ${detectorName} Credential${verifiedLabel}`,
            filePath: parsed.file,
            line: parsed.line,
          },
        ];
      } else {
        // 3. Semgrep, CodeQL single-step, or Generic SAST
        const parsed = parseLocation(
          evidence?.location,
          evidence?.file || targetValue,
          evidence?.line || 1,
        );
        const checkId = evidence?.check_id || item.code || "sast-rule";
        const codeSnippet = evidence?.snippet
          ? `: ${evidence.snippet.substring(0, 60)}`
          : "";

        traceSteps = [
          {
            role: "source",
            label: `Entry Point: ${parsed.file}`,
            filePath: parsed.file,
            line: parsed.line,
          },
          {
            role: "sanitizer",
            label: `Pattern Rule: ${checkId}`,
            filePath: parsed.file,
            line: parsed.line,
          },
          {
            role: "sink",
            label: `Vulnerability Sink (Line ${parsed.line})${codeSnippet}`,
            filePath: parsed.file,
            line: parsed.line,
          },
        ];
      }

      const rotationLink =
        typeof evidence?.extra_data === "object" && evidence.extra_data
          ? String(evidence.extra_data.rotation_guide || "")
          : "";

      findings.push({
        id: findingId,
        ruleId: `remote-${slugify(codeStr || item.title || "finding")}`,
        status: "confirmed",
        severity,
        title: item.title || codeStr || "Security Finding",
        description: item.description || item.title || "Security finding detected by SAST engine",
        cwe,
        code: codeStr,
        scope: isTrufflehog || isGitleaks ? "secrets" : "code",
        hint: item.remediation,
        fix: item.remediation,
        link: rotationLink || undefined,
        trace: {
          steps: traceSteps,
          sinkClass,
        },
        createdAt,
      });
    } else {
      // DAST Finding (Nuclei, Nmap, HTTPX, FFUF, Dalfox, etc.)
      const item = raw as RemoteFindingSummary & { code?: string };
      const rawCode = typeof item.code === "string" ? item.code : "";
      const ruleSlug = item.template_id || (rawCode ? slugify(rawCode) : slugify(item.title));
      const hostOrPath = item.matched_at || item.host || targetValue;
      const sinkClass = detectSinkClass(item.title, item.description, rawCode);
      const titleLower = item.title.toLowerCase();
      const cwe =
        extractCwe(item.cwe) ||
        (titleLower.includes("xss") || titleLower.includes("cross-site scripting")
          ? "CWE-79"
          : titleLower.includes("ssti") || titleLower.includes("template injection")
            ? "CWE-1336"
            : titleLower.includes("crlf")
              ? "CWE-113"
              : titleLower.includes("cors")
                ? "CWE-942"
                : titleLower.includes("takeover")
                  ? "CWE-284"
                  : severity === "critical"
                    ? "CWE-94"
                    : severity === "high"
                      ? "CWE-200"
                      : "CWE-16");

      const traceSteps: TaintStep[] = [
        {
          role: "source",
          label: targetValue,
          filePath: hostOrPath,
          line: 1,
        },
        {
          role: "sanitizer",
          label: item.title,
          filePath: hostOrPath,
          line: 1,
        },
        {
          role: "sink",
          label: hostOrPath,
          filePath: hostOrPath,
          line: 1,
        },
      ];

      const remediationText = (item as unknown as { remediation?: string; solution?: string }).remediation ||
        (item as unknown as { remediation?: string; solution?: string }).solution;

      findings.push({
        id: findingId,
        ruleId: `remote-${ruleSlug}`,
        status: "confirmed",
        severity,
        title: item.title,
        description: item.description || `Detected on ${hostOrPath}`,
        cwe,
        code: rawCode || item.template_id || "remote_vuln",
        scope: "endpoint",
        hint: remediationText || deriveDastRemediation(item.title, cwe, sinkClass),
        fix: remediationText || deriveDastFix(item.title, cwe, sinkClass),
        trace: {
          steps: traceSteps,
          sinkClass,
        },
        createdAt,
      });
    }
  }

  // If there are discovered technologies and no specific findings, create info finding
  if (
    findings.length === 0 &&
    result.summary?.technologies &&
    result.summary.technologies.length > 0
  ) {
    findings.push({
      id: `remote-${result.scan_job_id}-tech`,
      ruleId: "remote-tech-discovery",
      status: "confirmed",
      severity: "low",
      title: "Discovered Web Technologies",
      description: `Target ${targetValue} is running: ${result.summary.technologies.join(", ")}`,
      cwe: "CWE-200",
      scope: "endpoint",
      trace: {
        steps: [
          {
            role: "source",
            label: targetValue,
            filePath: targetValue,
            line: 1,
          },
          {
            role: "sink",
            label: "Tech Fingerprint",
            filePath: targetValue,
            line: 1,
          },
        ],
        sinkClass: "ssrf",
      },
      createdAt,
    });
  }

  return findings;
}

export function normalizeSastJobFindings(
  job: SastJobDetailResponse,
  targetValue = "codebase",
): Finding[] {
  const createdAt = job.created_at || new Date().toISOString();
  return job.findings.map((f, i) => {
    const findingId = `sast-${job.job_id}-${f.fingerprint.slice(0, 8)}-${i + 1}`;
    const severity = mapSeverity(f.severity);
    const sinkClass = detectSinkClass(f.title, f.description || "", f.vulnerability_id);
    const cwe = extractCwe(f.cwe_id ?? undefined) || "CWE-200";
    const filePath = f.file_path || targetValue;
    const line = f.line_start || 1;

    const traceSteps: TaintStep[] = [
      {
        role: "source",
        label: `File: ${filePath}`,
        filePath,
        line,
      },
      {
        role: "sink",
        label: `${f.title} (${f.detected_by?.length ? f.detected_by.join(", ") : f.tool_name})`,
        filePath,
        line,
      },
    ];

    return {
      id: findingId,
      ruleId: f.vulnerability_id || `sast-${f.tool_name}`,
      status: "confirmed",
      severity,
      title: f.title,
      description: f.description || f.title,
      cwe,
      scope: "orchestrator",
      hint: f.remediation || (f as unknown as { solution?: string }).solution || undefined,
      fix: f.remediation || (f as unknown as { solution?: string }).solution || undefined,
      trace: {
        steps: traceSteps,
        sinkClass,
      },
      createdAt,
    };
  });
}

export interface DastEvidenceSummary {
  payload?: string;
  evidenceText?: string;
  requestText?: string;
  responseText?: string;
}

export function extractDastEvidence(f: {
  evidence?: unknown;
  raw_output?: unknown;
  snippet?: string | null;
  parameter?: string | null;
}): DastEvidenceSummary {
  const result: DastEvidenceSummary = {};

  if (f.evidence) {
    if (typeof f.evidence === "string") {
      result.evidenceText = f.evidence;
    } else if (typeof f.evidence === "object" && f.evidence !== null) {
      const ev = f.evidence as Record<string, unknown>;
      if (typeof ev.payload === "string") result.payload = ev.payload;
      if (typeof ev.request === "string") result.requestText = ev.request;
      if (typeof ev.response === "string") result.responseText = ev.response;
      if (typeof ev.extracted_results === "string") result.evidenceText = ev.extracted_results;
      else if (Array.isArray(ev.extracted_results)) result.evidenceText = ev.extracted_results.join(", ");
      if (typeof ev.data === "string" && !result.evidenceText) result.evidenceText = ev.data;
      if (typeof ev.proof === "string" && !result.evidenceText) result.evidenceText = ev.proof;
      if (typeof ev.curl_command === "string") result.requestText = ev.curl_command;
      if (typeof ev.match === "string" && !result.evidenceText) result.evidenceText = ev.match;
    }
  }

  if (f.raw_output) {
    if (typeof f.raw_output === "string") {
      try {
        const parsed = JSON.parse(f.raw_output);
        if (typeof parsed === "object" && parsed !== null) {
          if (!result.payload && typeof parsed.payload === "string") result.payload = parsed.payload;
          if (!result.evidenceText && typeof parsed.extracted === "string") result.evidenceText = parsed.extracted;
          if (!result.evidenceText && typeof parsed.proof === "string") result.evidenceText = parsed.proof;
          if (!result.evidenceText && typeof parsed.matched === "string") result.evidenceText = parsed.matched;
          if (!result.evidenceText && typeof parsed.output === "string") result.evidenceText = parsed.output;
        }
      } catch {
        if (!result.evidenceText && f.raw_output.trim().length > 0) {
          result.evidenceText = f.raw_output.trim();
        }
      }
    } else if (typeof f.raw_output === "object" && f.raw_output !== null) {
      const ro = f.raw_output as Record<string, unknown>;
      if (!result.payload && typeof ro.payload === "string") result.payload = ro.payload;
      if (!result.evidenceText && typeof ro.extracted === "string") result.evidenceText = ro.extracted;
      if (!result.evidenceText && typeof ro.output === "string") result.evidenceText = ro.output;
      if (!result.evidenceText && typeof ro.proof === "string") result.evidenceText = ro.proof;
      if (!result.evidenceText && typeof ro.matched === "string") result.evidenceText = ro.matched;
    }
  }

  if (f.snippet && !result.evidenceText) {
    result.evidenceText = f.snippet;
  }

  return result;
}

export function deriveDastCwe(
  toolName?: string,
  title?: string,
  ruleId?: string,
  rawCwe?: string | null,
): string {
  const extracted = extractCwe(rawCwe ?? undefined);
  if (extracted) return extracted;

  const t = (toolName || "").toLowerCase();
  const lower = `${title || ""} ${ruleId || ""}`.toLowerCase();

  // 1. GraphQL (graphql-cop)
  if (t === "graphql-cop" || lower.includes("graphql")) {
    if (lower.includes("injection") || lower.includes("query injection")) return "CWE-943";
    if (
      lower.includes("batch") ||
      lower.includes("dos") ||
      lower.includes("denial of service") ||
      lower.includes("alias") ||
      lower.includes("directive") ||
      lower.includes("depth") ||
      lower.includes("recursion") ||
      lower.includes("circular") ||
      lower.includes("exhaustion")
    ) {
      return "CWE-400";
    }
    if (lower.includes("introspection") || lower.includes("schema") || lower.includes("field suggestion")) {
      return "CWE-200";
    }
    return "CWE-200";
  }

  // 2. TLS / SSL (sslyze, tlsx)
  if (t === "sslyze" || t === "tlsx" || lower.includes("tls") || lower.includes("ssl") || lower.includes("cipher")) {
    if (lower.includes("broken") || lower.includes("rc4") || lower.includes("des") || lower.includes("3des") || lower.includes("md5") || lower.includes("cbc")) {
      return "CWE-327";
    }
    if (lower.includes("cert") || lower.includes("expired") || lower.includes("self-signed") || lower.includes("trust") || lower.includes("validation")) {
      return "CWE-295";
    }
    if (lower.includes("cleartext") || lower.includes("plaintext") || lower.includes("http")) {
      return "CWE-319";
    }
    if (lower.includes("heartbleed")) return "CWE-119";
    if (lower.includes("robot")) return "CWE-385";
    if (lower.includes("weak") || lower.includes("cipher") || lower.includes("sslv") || lower.includes("tls 1.0") || lower.includes("tls 1.1")) {
      return "CWE-326";
    }
    return "CWE-326";
  }

  // 3. JWT (jwt_tool)
  if (t === "jwt_tool" || t === "jwt-tool" || lower.includes("jwt") || lower.includes("token")) {
    if (lower.includes("none") || lower.includes("alg") || lower.includes("confusion")) return "CWE-345";
    if (lower.includes("weak") || lower.includes("secret") || lower.includes("brute") || lower.includes("hmac")) return "CWE-522";
    if (lower.includes("signature") || lower.includes("jwk") || lower.includes("jku") || lower.includes("kid") || lower.includes("verify")) {
      return "CWE-347";
    }
    if (lower.includes("expire") || lower.includes("exp")) return "CWE-613";
    return "CWE-347";
  }

  // 4. Access Control & IDOR (access-control, auth-matrix, idor-tester)
  if (
    t === "access-control" ||
    t === "auth-matrix" ||
    t === "idor-tester" ||
    lower.includes("idor") ||
    lower.includes("bola") ||
    lower.includes("bfla") ||
    lower.includes("access control") ||
    lower.includes("privilege")
  ) {
    if (lower.includes("object level") || lower.includes("bola") || lower.includes("idor") || lower.includes("direct object")) return "CWE-639";
    if (lower.includes("function level") || lower.includes("bfla")) return "CWE-285";
    if (lower.includes("privilege") || lower.includes("escalation")) return "CWE-269";
    if (lower.includes("missing auth") || lower.includes("unauthenticated")) return "CWE-306";
    if (lower.includes("authorization") || lower.includes("unauthorized")) return "CWE-862";
    return "CWE-639";
  }

  // 5. SQL Injection (sqlmap)
  if (t === "sqlmap" || lower.includes("sql") || lower.includes("sqli")) return "CWE-89";

  // 6. Command Injection (commix)
  if (t === "commix" || lower.includes("command injection") || lower.includes("rce") || lower.includes("shell injection") || lower.includes("os command")) {
    return "CWE-78";
  }

  // 7. XSS (dalfox)
  if (t === "dalfox" || lower.includes("xss") || lower.includes("cross-site scripting")) return "CWE-79";

  // 8. SSTI (sstimap)
  if (t === "sstimap" || lower.includes("ssti") || lower.includes("template injection")) return "CWE-1336";

  // 9. CRLF Injection (crlfuzz)
  if (t === "crlfuzz" || lower.includes("crlf") || lower.includes("response splitting")) return "CWE-113";

  // 10. CORS (corsy)
  if (t === "corsy" || lower.includes("cors")) return "CWE-942";

  // 11. Subdomain Takeover (subzy)
  if (t === "subzy" || lower.includes("takeover")) return "CWE-284";

  // 12. JS Secret Leakage (jsluice)
  if (t === "jsluice" || lower.includes("secret") || lower.includes("credential") || lower.includes("api key")) return "CWE-798";

  // 13. SSRF & OOB Interaction (interactsh)
  if (t === "interactsh" || lower.includes("ssrf") || lower.includes("out-of-band") || lower.includes("oob")) return "CWE-918";

  // 14. Network & Port Scanning (nmap, naabu, masscan)
  if (t === "nmap" || t === "naabu" || t === "masscan" || lower.includes("port") || lower.includes("service scan")) return "CWE-200";

  // 15. Security Headers & Server Misconfiguration (httpx, nikto, wafw00f)
  if (lower.includes("header") || lower.includes("csp") || lower.includes("hsts") || t === "nikto" || t === "wafw00f") return "CWE-16";

  // 16. Web Content Discovery & Crawling (ffuf, feroxbuster, katana, gau, amass, subfinder, arjun, kiterunner)
  if (
    t === "ffuf" ||
    t === "feroxbuster" ||
    t === "katana" ||
    t === "gau" ||
    t === "amass" ||
    t === "subfinder" ||
    t === "dnsx" ||
    t === "arjun" ||
    t === "kiterunner"
  ) {
    return "CWE-200";
  }

  // 17. ZAP & Nuclei fallbacks
  if (lower.includes("traversal") || lower.includes("file read") || lower.includes("lfi")) return "CWE-22";
  if (lower.includes("prototype")) return "CWE-1321";

  return "CWE-200";
}

export function normalizeDastJobFindings(
  job: DastJobDetailResponse,
  targetUrl = "target",
): Finding[] {
  const createdAt = job.created_at || new Date().toISOString();
  const target = job.target_url || targetUrl;
  const rawFindings = Array.isArray(job.findings) ? job.findings : [];
  return rawFindings.map((f, i) => {
    const fp = f.fingerprint ? f.fingerprint.slice(0, 8) : String(i + 1);
    const findingId = `dast-${job.job_id}-${fp}-${i + 1}`;
    const severity = mapSeverity(f.severity);
    const sinkClass = detectSinkClass(f.title, f.rule_id || "", f.owasp_category || "");
    const cwe = deriveDastCwe(f.tool_name, f.title, f.rule_id || f.vulnerability_id, f.cwe_id);
    const url = f.target_url || target;

    const evidence = extractDastEvidence(f);
    const payload = evidence.payload;
    const evidenceText = evidence.evidenceText;

    const traceSteps: TaintStep[] = [
      {
        role: "source",
        label: url,
        filePath: url,
        line: f.line_start || 1,
      },
    ];

    if (f.parameter || payload || evidenceText) {
      const probeLabel = f.parameter
        ? `Probe (${f.tool_name}): parameter "${f.parameter}"${payload ? ` = ${payload}` : ""}`
        : payload
          ? `Probe (${f.tool_name}): payload ${payload}`
          : `Probe (${f.tool_name}): ${evidenceText && evidenceText.length > 60 ? `${evidenceText.slice(0, 57)}...` : (evidenceText || f.title)}`;

      traceSteps.push({
        role: "sanitizer",
        label: probeLabel,
        filePath: url,
        line: f.line_start || 1,
      });
    }

    traceSteps.push({
      role: "sink",
      label: f.parameter ? `${f.title} (${f.parameter})` : f.title,
      filePath: url,
      line: f.line_start || 1,
    });

    const remediation = f.remediation || (f as unknown as { solution?: string }).solution;

    let description = `${f.title} detected on ${url}${f.parameter ? ` (parameter: ${f.parameter})` : ""}`;
    if (payload && !description.includes(payload)) {
      description += `. Payload: ${payload}`;
    }
    if (evidenceText && !description.includes(evidenceText)) {
      const preview = evidenceText.length > 100 ? `${evidenceText.slice(0, 97)}...` : evidenceText;
      description += ` [Evidence: ${preview}]`;
    }

    return {
      id: findingId,
      ruleId: f.rule_id || f.vulnerability_id || `dast-${f.tool_name}`,
      status: "confirmed",
      severity,
      title: f.title,
      description,
      cwe,
      scope: "endpoint",
      reason: evidenceText ? `Evidence: ${evidenceText}` : undefined,
      hint: remediation || deriveDastRemediation(f.title, cwe, sinkClass, f.tool_name),
      fix: remediation || deriveDastFix(f.title, cwe, sinkClass, f.tool_name),
      trace: {
        steps: traceSteps,
        sinkClass,
      },
      createdAt,
    };
  });
}

export function deriveDastRemediation(
  title: string,
  cwe?: string,
  sinkClass?: SinkClass,
  toolName?: string,
): string {
  const lower = `${title || ""} ${toolName || ""}`.toLowerCase();
  const c = cwe?.toUpperCase();

  // GraphQL
  if (lower.includes("graphql") || toolName === "graphql-cop" || c === "CWE-943" || (c === "CWE-400" && lower.includes("graphql"))) {
    return "Disable GraphQL introspection in production environments. Implement depth limiting, query cost analysis, and query complexity validation to prevent Denial of Service and schema leakage.";
  }

  // TLS / SSL
  if (
    lower.includes("tls") ||
    lower.includes("ssl") ||
    lower.includes("cipher") ||
    toolName === "sslyze" ||
    toolName === "tlsx" ||
    c === "CWE-326" ||
    c === "CWE-327" ||
    c === "CWE-295" ||
    c === "CWE-319"
  ) {
    return "Disable deprecated SSL/TLS protocols (SSLv2, SSLv3, TLS 1.0, TLS 1.1) and weak ciphers (RC4, 3DES, CBC). Enforce TLS 1.2+ with forward-secret AEAD cipher suites and enable HSTS with a long max-age.";
  }

  // JWT
  if (
    lower.includes("jwt") ||
    lower.includes("token") ||
    toolName === "jwt_tool" ||
    toolName === "jwt-tool" ||
    c === "CWE-347" ||
    c === "CWE-345" ||
    c === "CWE-613"
  ) {
    return "Enforce strict cryptographic signature verification on JWTs. Disallow the 'none' algorithm, avoid symmetric/asymmetric algorithm confusion, use strong secret keys (min 256 bits), and validate 'exp', 'nbf', and 'iss' claims.";
  }

  // IDOR / Access Control
  if (
    lower.includes("idor") ||
    lower.includes("bola") ||
    lower.includes("bfla") ||
    lower.includes("access control") ||
    lower.includes("privilege") ||
    toolName === "access-control" ||
    toolName === "auth-matrix" ||
    toolName === "idor-tester" ||
    c === "CWE-639" ||
    c === "CWE-285" ||
    c === "CWE-269" ||
    c === "CWE-306" ||
    c === "CWE-862"
  ) {
    return "Enforce server-side authorization checks on every resource lookup. Verify that the authenticated session owns or is authorized to access the requested resource identifier (preventing Insecure Direct Object References).";
  }

  // Command Injection
  if (lower.includes("command injection") || lower.includes("rce") || toolName === "commix" || c === "CWE-78") {
    return "Avoid invoking OS system commands through shell interpreters. If unavoidable, use argument arrays with execFile/spawn without shell: true, and validate arguments strictly against an allowlist.";
  }

  // SSTI
  if (lower.includes("ssti") || lower.includes("template injection") || toolName === "sstimap" || c === "CWE-1336") {
    return "Never pass user-supplied input directly into template engine evaluation strings. Treat templates as code and pass user inputs strictly as template context variables.";
  }

  // JS Secrets Exposure
  if (toolName === "jsluice" || c === "CWE-798" || (lower.includes("secret") && lower.includes("exposed"))) {
    return "Revoke exposed secrets immediately. Store API keys and credentials in encrypted secrets managers or environment variables, not in client-side code or public repositories.";
  }

  // Subdomain Takeover
  if (toolName === "subzy" || lower.includes("takeover") || (c === "CWE-284" && lower.includes("domain"))) {
    return "Remove dangling DNS CNAME records pointing to decommissioned third-party cloud services (e.g. AWS S3, GitHub Pages, Heroku, Azure) to prevent unauthorized resource claiming.";
  }

  // CORS
  if (lower.includes("cors") || c === "CWE-942") {
    return "Restrict the Access-Control-Allow-Origin response header to trusted, explicit domains instead of '*' or reflecting origin with credentials.";
  }

  // XSS
  if (lower.includes("xss") || lower.includes("cross-site") || c === "CWE-79") {
    return "Sanitize and contextual HTML-encode untrusted inputs before reflecting them in responses. Apply a strict Content-Security-Policy.";
  }

  // SQL Injection
  if (lower.includes("sql") || c === "CWE-89") {
    return "Use parameterized queries, prepared statements, or ORM abstractions instead of concatenating untrusted inputs into SQL strings.";
  }

  // Security Headers
  if (lower.includes("header") || lower.includes("csp") || lower.includes("hsts") || c === "CWE-16") {
    return "Configure essential HTTP security response headers (Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options, X-Frame-Options).";
  }

  // CRLF
  if (lower.includes("crlf") || c === "CWE-113") {
    return "Sanitize all user inputs before adding them to HTTP headers by stripping carriage return (\\r) and newline (\\n) characters.";
  }

  // Path Traversal
  if (lower.includes("traversal") || c === "CWE-22") {
    return "Validate user-supplied filenames and paths against an allowlist, resolving to canonical absolute paths within an allowed base directory.";
  }

  // SSRF
  if (lower.includes("ssrf") || sinkClass === "ssrf" || toolName === "interactsh" || c === "CWE-918") {
    return "Validate and whitelist destination hostnames, schemes, and ports before issuing outbound HTTP requests from backend services.";
  }

  return `Review and harden endpoint configuration for "${title}". Sanitize request parameters and enforce authentication and least privilege.`;
}

export function deriveDastFix(
  title: string,
  cwe?: string,
  _sinkClass?: SinkClass,
  toolName?: string,
): string | undefined {
  const lower = `${title || ""} ${toolName || ""}`.toLowerCase();
  const c = cwe?.toUpperCase();

  // GraphQL
  if (lower.includes("graphql") || toolName === "graphql-cop" || c === "CWE-943" || (c === "CWE-400" && lower.includes("graphql"))) {
    return `// Apollo Server / GraphQL hardening\nconst server = new ApolloServer({\n  typeDefs,\n  resolvers,\n  introspection: process.env.NODE_ENV !== "production",\n  validationRules: [depthLimit(5), costLimit(1000)],\n});`;
  }

  // TLS / SSL
  if (
    lower.includes("tls") ||
    lower.includes("ssl") ||
    lower.includes("cipher") ||
    toolName === "sslyze" ||
    toolName === "tlsx" ||
    c === "CWE-326" ||
    c === "CWE-327" ||
    c === "CWE-295" ||
    c === "CWE-319"
  ) {
    return `# Nginx TLS hardening configuration\nssl_protocols TLSv1.2 TLSv1.3;\nssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';\nssl_prefer_server_ciphers on;\nssl_session_cache shared:SSL:10m;\nssl_session_timeout 1d;`;
  }

  // JWT
  if (
    lower.includes("jwt") ||
    lower.includes("token") ||
    toolName === "jwt_tool" ||
    toolName === "jwt-tool" ||
    c === "CWE-347" ||
    c === "CWE-345" ||
    c === "CWE-613"
  ) {
    return `// Secure JWT verification\njwt.verify(token, process.env.JWT_PUBLIC_KEY!, {\n  algorithms: ["RS256"],\n  issuer: "https://auth.company.com",\n  audience: "https://api.company.com",\n  maxAge: "1h",\n});`;
  }

  // IDOR / Access Control
  if (
    lower.includes("idor") ||
    lower.includes("bola") ||
    lower.includes("bfla") ||
    lower.includes("access control") ||
    lower.includes("privilege") ||
    toolName === "access-control" ||
    toolName === "auth-matrix" ||
    toolName === "idor-tester" ||
    c === "CWE-639" ||
    c === "CWE-285" ||
    c === "CWE-269" ||
    c === "CWE-306" ||
    c === "CWE-862"
  ) {
    return `// Object-Level Authorization (IDOR mitigation)\nconst resource = await db.documents.findUnique({\n  where: { id: req.params.docId, ownerId: req.user.id },\n});\nif (!resource) {\n  return res.status(403).json({ error: "Access denied" });\n}`;
  }

  // Command Injection
  if (lower.includes("command injection") || lower.includes("rce") || toolName === "commix" || c === "CWE-78") {
    return `// Safe command execution without shell interpolation\nimport { execFile } from "node:child_process";\nexecFile("git", ["log", "--format=%H", sanitize(rev)], (err, stdout) => {\n  /* handle output */\n});`;
  }

  // SSTI
  if (lower.includes("ssti") || lower.includes("template injection") || toolName === "sstimap" || c === "CWE-1336") {
    return `# Safe template rendering with context variables\nreturn render_template("user_profile.html", username=user_input)`;
  }

  // JS Secrets Exposure
  if (toolName === "jsluice" || c === "CWE-798" || (lower.includes("secret") && lower.includes("exposed"))) {
    return `// Load secrets securely from environment\nconst apiKey = process.env.SERVICE_API_KEY;\nif (!apiKey) throw new Error("Missing SERVICE_API_KEY");`;
  }

  // CORS
  if (lower.includes("cors") || c === "CWE-942") {
    return `// Express CORS configuration\napp.use(cors({\n  origin: ["https://trusted.domain.com"],\n  credentials: true,\n}));`;
  }

  // XSS
  if (lower.includes("xss") || lower.includes("cross-site") || c === "CWE-79") {
    return `// Contextual output encoding\nconst sanitized = escapeHtml(userInput);\nres.setHeader("Content-Type", "text/html; charset=utf-8");\nres.send(\`<div>\${sanitized}</div>\`);`;
  }

  // SQL Injection
  if (lower.includes("sql") || c === "CWE-89") {
    return `// Parameterized SQL query\nconst [rows] = await db.execute("SELECT * FROM accounts WHERE id = ?", [accountId]);`;
  }

  // Security Headers
  if (lower.includes("header") || lower.includes("csp") || lower.includes("hsts") || c === "CWE-16") {
    return `// Security Headers middleware\nres.setHeader("Content-Security-Policy", "default-src 'self'");\nres.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");\nres.setHeader("X-Content-Type-Options", "nosniff");\nres.setHeader("X-Frame-Options", "DENY");`;
  }

  // CRLF
  if (lower.includes("crlf") || c === "CWE-113") {
    return `// Strip CRLF injection characters\nconst sanitizedHeader = userHeaderValue.replace(/[\\r\\n]/g, "");\nres.setHeader("X-Custom-Header", sanitizedHeader);`;
  }

  return undefined;
}

export const convertScanResultToFindings = normalizeRemoteFindings;
