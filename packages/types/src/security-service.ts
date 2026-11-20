/**
 * Contracts for Codefy SAST & DAST Microservices.
 * Unified via shared JWT authentication from cmd-d-llm Gateway.
 */

export type SastScanMode = "passive" | "active" | "diff" | "autofix" | "compliance";

export type SastScanStatus = "pending" | "running" | "completed" | "failed" | "expired";

export interface SastJobSummary {
  readonly total_findings: number;
  readonly critical: number;
  readonly high: number;
  readonly medium: number;
  readonly low: number;
  readonly info: number;
}

export interface SastFinding {
  readonly id?: string;
  readonly fingerprint: string;
  readonly tool_name: string;
  readonly vulnerability_id: string;
  readonly title: string;
  readonly severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO" | string;
  readonly file_path: string;
  readonly line_start: number;
  readonly line_end?: number | null;
  readonly snippet?: string | null;
  readonly description?: string | null;
  readonly cwe_id?: string | null;
  readonly remediation?: string | null;
  readonly detected_by: readonly string[];
  readonly terminal_output?: string | null;
}

export interface SastCreateResponse {
  readonly job_id: string;
  readonly mode: SastScanMode;
  readonly status: SastScanStatus;
  readonly status_url: string;
  readonly created_at: string;
  readonly expires_at: string;
  readonly message: string;
  readonly cached?: boolean;
}

export interface SastJobDetailResponse {
  readonly job_id: string;
  readonly target_id?: string | null;
  readonly user_id: string;
  readonly mode: SastScanMode;
  readonly status: SastScanStatus;
  readonly summary?: SastJobSummary | null;
  readonly created_at: string;
  readonly completed_at?: string | null;
  readonly expires_at: string;
  readonly duration_ms?: number | null;
  readonly error_message?: string | null;
  readonly terminal_output?: string | null;
  readonly tool_errors?: Record<string, string>;
  readonly findings: readonly SastFinding[];
  readonly scanned_tools: readonly string[];
  readonly autofix_patch?: string | null;
  readonly cached?: boolean;
}

export interface SastScanListResponse {
  readonly items: readonly SastJobDetailResponse[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
}

export type SastToolName =
  | "semgrep"
  | "bearer"
  | "bandit"
  | "eslint"
  | "njsscan"
  | "pmd"
  | "gosec"
  | "brakeman"
  | "flawfinder"
  | "cppcheck"
  | "gitleaks"
  | "trufflehog"
  | "detect-secrets"
  | "trivy"
  | "osv-scanner"
  | "pip-audit"
  | "checkov"
  | "kics"
  | "hadolint"
  | "zizmor"
  | "slither"
  | "spectral"
  | "shellcheck"
  | "mobsfscan"
  | "syft";

export type DastPassiveToolName =
  | "httpx"
  | "nmap"
  | "naabu"
  | "katana"
  | "dnsx"
  | "subzy"
  | "wafw00f"
  | "interactsh"
  | "subfinder"
  | "gau"
  | "sslyze"
  | "jsluice"
  | "graphql-cop"
  | "masscan"
  | "amass";

export type DastActiveToolName =
  | "nuclei"
  | "dalfox"
  | "zap"
  | "ffuf"
  | "feroxbuster"
  | "corsy"
  | "crlfuzz"
  | "sstimap"
  | "sqlmap"
  | "nikto"
  | "arjun"
  | "kiterunner"
  | "jwt_tool"
  | "commix"
  | "access-control";

export const DAST_PASSIVE_TOOL_NAMES: readonly DastPassiveToolName[] = [
  "httpx",
  "nmap",
  "naabu",
  "katana",
  "dnsx",
  "subzy",
  "wafw00f",
  "interactsh",
  "subfinder",
  "gau",
  "sslyze",
  "jsluice",
  "graphql-cop",
  "masscan",
  "amass",
] as const;

export const DAST_ACTIVE_TOOL_NAMES: readonly DastActiveToolName[] = [
  "nuclei",
  "dalfox",
  "zap",
  "ffuf",
  "feroxbuster",
  "corsy",
  "crlfuzz",
  "sstimap",
  "sqlmap",
  "nikto",
  "arjun",
  "kiterunner",
  "jwt_tool",
  "commix",
  "access-control",
] as const;

export const DAST_ALL_TOOL_NAMES: readonly (DastPassiveToolName | DastActiveToolName)[] = [
  ...DAST_PASSIVE_TOOL_NAMES,
  ...DAST_ACTIVE_TOOL_NAMES,
] as const;

export type DastToolName =
  | DastPassiveToolName
  | DastActiveToolName
  // Legacy aliases for backward compatibility
  | "tlsx"
  | "shuffledns"
  | "cve-scan"
  | "tech-detect"
  | "header-audit"
  | "cors-check"
  | "sitemap-parser"
  | "robots-parser"
  | "url-extractor"
  | "ssrf-detector"
  | "xxe-injector"
  | "jwt-tool"
  | "api-fuzzer"
  | "auth-matrix"
  | "idor-tester"
  | "dast-zap"
  | "historical-urls"
  | "tls-audit"
  | "js-secret-analysis"
  | "graphql-audit"
  | "deep-osint"
  | "api-route-discovery"
  | "recon"
  | "web-discovery"
  | "network-portscan"
  | "fast-portscan"
  | "smart-portscan"
  | "content-discovery"
  | "deep-content-discovery"
  | "web-crawl"
  | "vuln-assessment"
  | "xss-scan"
  | "oob-interaction"
  | "dns-recon"
  | "subdomain-takeover"
  | "waf-detect"
  | "cors-audit"
  | "crlf-scan"
  | "ssti-scan"
  | (string & {});

export interface SastToolInfo {
  readonly id: string;
  readonly name: string;
  readonly modes: readonly SastScanMode[];
  readonly version: string;
  readonly category: string;
  readonly description: string;
}

export interface SastToolCatalogResponse {
  readonly tools: readonly SastToolInfo[];
}

export interface SastPresignedUploadRequest {
  readonly filename?: string;
  readonly content_type?: string;
}

export interface SastPresignedUploadResponse {
  readonly upload_url: string;
  readonly file_key: string;
  readonly provider: string;
  readonly expires_in_seconds: number;
}

export interface SastScanDirectRequest {
  readonly file_key: string;
  readonly file_sha256: string;
  readonly mode?: SastScanMode;
  readonly ruleset_version?: string;
  readonly base_commit?: string;
  readonly framework?: string | null;
  readonly enable_autofix?: boolean;
}

export interface SastScanRepoRequest {
  readonly repo_url: string;
  readonly target_id?: string | null;
  readonly branch?: string;
  readonly mode?: SastScanMode;
  readonly github_token?: string | null;
  readonly subpath?: string | null;
  readonly base_commit?: string;
  readonly framework?: string | null;
  readonly enable_autofix?: boolean;
}

export interface SastScanDiffRequest {
  readonly file?: Blob | Uint8Array;
  readonly base_commit: string;
  readonly patch_content?: string | null;
  readonly target_id?: string | null;
}

export interface SastScanNightlyRequest {
  readonly target_id: string;
}

// -------------------------------------------------------------
// Authentication Session & Refresh Contracts
// -------------------------------------------------------------

export interface AuthRefreshRequest {
  readonly refresh_token: string;
}

export interface AuthRefreshResponse {
  readonly access_token: string;
  readonly token_type: string;
  readonly user_id: string;
  readonly email: string;
  readonly name: string;
  readonly tier: string;
  readonly expires_in_seconds: number;
  readonly refresh_token?: string;
  readonly auto_verified?: boolean;
  readonly message?: string;
}

// -------------------------------------------------------------
// BugBound V3 Canonical Issue Graph Store Contracts
// -------------------------------------------------------------

export type IssueStatus =
  | "discovered"
  | "triaged"
  | "verified"
  | "fixed"
  | "regression_locked"
  | "closed"
  | "risk_accepted"
  | (string & {});

export type IssueAnchorType = "code" | "url" | "dependency" | "secret" | "infra" | (string & {});

export interface IssueCodeAnchor {
  readonly file_path: string;
  readonly line_start: number;
  readonly line_end?: number | null;
  readonly column_start?: number | null;
  readonly column_end?: number | null;
  readonly snippet?: string | null;
  readonly git_commit?: string | null;
}

export interface IssueUrlAnchor {
  readonly method?: string;
  readonly url_path: string;
  readonly parameter?: string | null;
  readonly target_url?: string;
}

export interface IssueDependencyAnchor {
  readonly package_name: string;
  readonly installed_version?: string | null;
  readonly fixed_version?: string | null;
  readonly ecosystem?: string | null;
}

export interface IssueSecretAnchor {
  readonly secret_type?: string;
  readonly masked_token?: string;
  readonly commit_hash?: string;
}

export interface IssueInfraAnchor {
  readonly resource_type?: string;
  readonly resource_id?: string;
  readonly config_file?: string;
}

export interface IssueAnchor {
  readonly type: IssueAnchorType;
  readonly code?: IssueCodeAnchor;
  readonly url?: IssueUrlAnchor;
  readonly dependency?: IssueDependencyAnchor;
  readonly secret?: IssueSecretAnchor;
  readonly infra?: IssueInfraAnchor;
}

export interface IssueEvidence {
  readonly repro_script?: string | null;
  readonly request_response_sample?: string | null;
  readonly oracle_result?: string | null;
  readonly terminal_output?: string | null;
  readonly raw_tool_payload?: Record<string, unknown> | null;
}

export interface RiskAcceptanceRecord {
  readonly accepted_by: string;
  readonly reason: string;
  readonly accepted_at: string;
  readonly expires_at: string;
}

export interface RiskAcceptanceRequest {
  readonly accepted_by: string;
  readonly reason: string;
  readonly expires_days?: number;
}

export interface CanonicalIssue {
  readonly issue_id: string;
  readonly repo_id: string;
  readonly fingerprint: string;
  readonly title: string;
  readonly category: string;
  readonly severity: "critical" | "high" | "medium" | "low" | "info" | string;
  readonly confidence?: "unverified" | "verified" | "oracle_proven" | string;
  readonly source_tool: string;
  readonly anchor: IssueAnchor;
  readonly evidence?: IssueEvidence;
  readonly status: IssueStatus;
  readonly first_seen: string;
  readonly last_seen: string;
  readonly ticket_ref?: string | null;
  readonly sla_due?: string | null;
  readonly risk_acceptance?: RiskAcceptanceRecord | null;
  readonly occurrence_count: number;
  readonly cwe_id?: string | null;
  readonly remediation_advice?: string | null;
}

export interface IssueHistoryEvent {
  readonly timestamp: string;
  readonly actor: string;
  readonly from_status?: IssueStatus;
  readonly to_status: IssueStatus;
  readonly reason?: string;
}

export interface CanonicalIssueDetailResponse {
  readonly issue: CanonicalIssue;
  readonly history?: readonly IssueHistoryEvent[];
}

export interface IssueTransitionRequest {
  readonly target_status: IssueStatus;
  readonly reason?: string;
  readonly actor?: string;
}

export interface IssueListParams {
  repo_id?: string;
  category?: string;
  severity?: string;
  status?: IssueStatus;
  confidence?: string;
  anchor_type?: string;
  code_file?: string;
  url_path?: string;
  dependency_package?: string;
  source_tool?: string;
  limit?: number;
  offset?: number;
}

export interface IssueListResponse {
  readonly items: readonly CanonicalIssue[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
}

export interface IssueMetricsSummaryResponse {
  readonly total_issues: number;
  readonly open_issues: number;
  readonly triaged_issues: number;
  readonly verified_issues: number;
  readonly fixed_issues: number;
  readonly regression_locked_issues: number;
  readonly closed_issues: number;
  readonly risk_accepted_issues: number;
  readonly critical_count: number;
  readonly high_count: number;
  readonly medium_count: number;
  readonly low_count: number;
  readonly info_count: number;
  readonly sla_breached_count: number;
  readonly top_categories: Record<string, number>;
}

export interface AuditEventItem {
  readonly id: string;
  readonly event_type: string;
  readonly action: string;
  readonly user_id: string;
  readonly target_id?: string | null;
  readonly job_id?: string | null;
  readonly severity: string;
  readonly details: Record<string, unknown>;
  readonly timestamp: string;
}

export interface AuditEventsListResponse {
  readonly items: readonly AuditEventItem[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
}

// -------------------------------------------------------------
// DAST Microservice Contracts
// -------------------------------------------------------------

export type DastScanMode = "passive" | "active";

export type DastScanStatus = "pending" | "running" | "completed" | "failed" | "cancelled";

export interface DastScanRequest {
  readonly target_url: string;
  readonly mode?: DastScanMode;
  readonly tools?: readonly (DastToolName | string)[];
  readonly custom_headers?: Record<string, string>;
  readonly cookies?: Record<string, string>;
  readonly excluded_paths?: readonly string[];
  readonly crawl_depth?: number;
  readonly max_hosts?: number;
  readonly rate_limit?: number;
  readonly timeout_seconds?: number;
  readonly concurrency?: number;
  readonly user_agent?: string;
  readonly auth_token?: string;
  readonly proxy_url?: string;
  readonly tool_options?: Record<string, Record<string, unknown>>;
}

export interface DastScanResponse {
  readonly job_id: string;
  readonly target_url: string;
  readonly mode: DastScanMode;
  readonly status: DastScanStatus;
  readonly status_url: string;
  readonly created_at: string;
  readonly expires_at: string;
  readonly message: string;
  readonly selected_tools?: readonly string[];
}

export interface DastFinding {
  readonly id?: string;
  readonly tool_name: string;
  readonly rule_id?: string;
  readonly vulnerability_id?: string;
  readonly title: string;
  readonly severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO" | string;
  readonly cwe_id?: string | null;
  readonly owasp_category?: string | null;
  readonly cvss_score?: number | null;
  readonly target_url?: string;
  readonly file_path?: string;
  readonly line_start?: number;
  readonly snippet?: string | null;
  readonly parameter?: string | null;
  readonly evidence?: unknown;
  readonly remediation?: string | null;
  readonly fingerprint: string;
  readonly detected_by?: readonly string[];
  readonly corroborated_by?: readonly string[];
  readonly raw_output?: unknown;
}

export interface DastJobSummary {
  readonly total_findings: number;
  readonly critical: number;
  readonly high: number;
  readonly medium: number;
  readonly low: number;
  readonly info: number;
  readonly scanned_tools?: readonly string[];
  readonly duration_ms?: number;
}

export interface DastJobDetailResponse {
  readonly job_id: string;
  readonly user_id: string;
  readonly target_url?: string | null;
  readonly mode: string;
  readonly status: string;
  readonly summary?: DastJobSummary | Record<string, unknown> | null;
  readonly created_at: string;
  readonly completed_at?: string | null;
  readonly expires_at?: string | null;
  readonly duration_ms?: number | null;
  readonly error_message?: string | null;
  readonly terminal_output?: string | null;
  readonly tool_errors?: Record<string, string>;
  readonly findings: readonly DastFinding[];
  readonly scanned_tools: readonly string[];
}

export interface DastToolInfo {
  readonly id: string;
  readonly name: string;
  readonly modes?: readonly DastScanMode[];
  readonly version?: string;
  readonly category: string;
  readonly description: string;
  readonly supported_options?: readonly string[];
}

export interface DastToolCatalogResponse {
  readonly total?: number;
  readonly tools: readonly DastToolInfo[];
}

export interface DastAuditEvent {
  readonly id: string;
  readonly event_type: "scan_dispatched" | "ssrf_prevented" | "auth_login" | "auth_logout" | string;
  readonly user_id?: string;
  readonly target_url?: string;
  readonly mode?: string;
  readonly timestamp: string;
  readonly client_ip?: string;
  readonly details?: Record<string, unknown>;
}

export interface DastStreamStatusData {
  readonly job_id: string;
  readonly status: "pending" | "running" | "completed" | "failed" | string;
  readonly progress_percent?: number;
  readonly current_tool?: string;
  readonly completed_tools?: readonly string[];
  readonly total_tools?: number;
  readonly findings_count?: number;
  readonly message?: string;
}

export interface DastStreamLogData {
  readonly timestamp: string;
  readonly message: string;
  readonly tool?: string;
  readonly level?: "info" | "warn" | "error" | "debug" | string;
}

export interface DastStreamFindingData {
  readonly tool_name: string;
  readonly title: string;
  readonly severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO" | string;
  readonly target_url?: string;
  readonly cwe_id?: string;
  readonly vulnerability_id?: string;
  readonly parameter?: string | null;
  readonly snippet?: string | null;
  readonly evidence?: unknown;
  readonly remediation?: string | null;
  readonly fingerprint?: string;
}

export interface DastStreamCompleteData {
  readonly status: string;
  readonly total_findings: number;
  readonly duration_ms: number;
  readonly summary?: DastJobSummary | Record<string, unknown> | null;
}

export type DastStreamEventType = "status" | "log" | "finding" | "complete" | "error" | "ping";

export interface DastStreamHandlers {
  onStatus?: (data: DastStreamStatusData) => void;
  onLog?: (data: DastStreamLogData) => void;
  onFinding?: (data: DastStreamFindingData) => void;
  onComplete?: (data: DastStreamCompleteData) => void;
  onError?: (error: Error) => void;
  onPing?: () => void;
}

export type DastExportFormat = "sarif" | "json";

export interface DastExportRequest {
  readonly job_id: string;
  readonly format?: DastExportFormat | "sarif" | "json";
}

export interface DastExportResponse {
  readonly job_id: string;
  readonly format: DastExportFormat | string;
  readonly data: unknown;
}

export interface DastValidateTargetResponse {
  readonly valid?: boolean;
  readonly ok?: boolean;
  readonly safe_to_scan?: boolean;
  readonly target_url: string;
  readonly hostname?: string;
  readonly resolved_ips?: readonly string[];
  readonly ip_address?: string;
  readonly message?: string;
  readonly code?: string;
  readonly reason?: string;
}

// -------------------------------------------------------------
// Real-time SSE Stream Event
// -------------------------------------------------------------

export interface SecurityStreamEvent {
  readonly type: "ping" | "tool_start" | "tool_complete" | "scan_complete" | "error";
  readonly job_id?: string;
  readonly tool?: string;
  readonly status?: string;
  readonly findings_count?: number;
  readonly summary?: SastJobSummary | DastJobSummary;
  readonly timestamp?: number;
  readonly message?: string;
}
