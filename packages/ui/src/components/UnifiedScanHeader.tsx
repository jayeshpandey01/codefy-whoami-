import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import type {
  AllScanProfile,
  ScanModeTier,
  ScanProfile,
  SastProfile,
} from "@whoami/types";
import {
  CheckIcon,
  ChevronDownIcon,
  ColumnsIcon,
  DownloadIcon,
  FileCodeIcon,
  FocusIcon,
  FolderIcon,
  MenuIcon,
  NetworkIcon,
  PanelLeftIcon,
  PanelRightIcon,
  PauseIcon,
  PlayIcon,
  RadioIcon,
  RefreshCwIcon,
  RemoteScanIcon,
  RowsIcon,
  SearchIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  TerminalIcon,
} from "./Icons.js";
import {
  WHOLE_CODE_GRAPH_OPTIONS,
  type GraphViewType,
} from "./GraphSelectorDropdown.js";

export type ScanMode = ScanModeTier | "local" | "orchestrator";

export interface ScanProfileOption {
  readonly id: AllScanProfile | "secret-scan";
  readonly name: string;
  readonly desc: string;
  readonly tool: string;
}

export const CLOUD_SAST_TASKS: ScanProfileOption[] = [
  {
    id: "semgrep",
    name: "Semgrep AST Rules",
    desc: "High-speed semantic pattern matching across OWASP Top 10 & CWE rules",
    tool: "Semgrep",
  },
  {
    id: "bearer",
    name: "Bearer Privacy & Security",
    desc: "Dataflow analysis for sensitive data leaks and OWASP Top 10",
    tool: "Bearer",
  },
  {
    id: "bandit",
    name: "Bandit Python SAST",
    desc: "Security linter for Python code property graphs and ASTs",
    tool: "Bandit",
  },
  {
    id: "eslint",
    name: "ESLint Security",
    desc: "Static analysis and vulnerability detection for JS/TS codebases",
    tool: "ESLint",
  },
  {
    id: "njsscan",
    name: "njsscan Node Security",
    desc: "NodeJS and Express application static security analysis",
    tool: "njsscan",
  },
  {
    id: "pmd",
    name: "PMD Source Analyzer",
    desc: "Static rule analyzer for Java, Apex, and multi-language projects",
    tool: "PMD",
  },
  {
    id: "gosec",
    name: "GoSec Security Scanner",
    desc: "Go source code AST inspection against security rules",
    tool: "GoSec",
  },
  {
    id: "brakeman",
    name: "Brakeman Rails SAST",
    desc: "Static analysis vulnerability scanner for Ruby on Rails",
    tool: "Brakeman",
  },
  {
    id: "flawfinder",
    name: "Flawfinder C/C++",
    desc: "C/C++ source code vulnerability search and CWE mapping",
    tool: "Flawfinder",
  },
  {
    id: "cppcheck",
    name: "Cppcheck Static Analyzer",
    desc: "Deep C/C++ static bug and memory safety vulnerability detector",
    tool: "Cppcheck",
  },
  {
    id: "gitleaks",
    name: "Gitleaks Secret Detector",
    desc: "Git history and repository secret and API token discovery",
    tool: "Gitleaks",
  },
  {
    id: "trufflehog",
    name: "TruffleHog Verified Secrets",
    desc: "800+ credential detector scanning with live verification checks",
    tool: "TruffleHog",
  },
  {
    id: "detect-secrets",
    name: "Detect Secrets",
    desc: "Enterprise credential scanning and entropy heuristics",
    tool: "Detect-Secrets",
  },
  {
    id: "trivy",
    name: "Trivy Vulnerability Scanner",
    desc: "Comprehensive CVE scanner for container images, OS, and code",
    tool: "Trivy",
  },
  {
    id: "osv-scanner",
    name: "Google OSV-Scanner",
    desc: "Open Source Vulnerability database dependency matching",
    tool: "OSV-Scanner",
  },
  {
    id: "pip-audit",
    name: "pip-audit Python CVEs",
    desc: "Scans Python virtual environments and packages for known CVEs",
    tool: "pip-audit",
  },
  {
    id: "checkov",
    name: "Checkov IaC Security",
    desc: "Static analysis for Terraform, CloudFormation, and Kubernetes",
    tool: "Checkov",
  },
  {
    id: "kics",
    name: "KICS IaC Scanner",
    desc: "Infrastructure as code security vulnerabilities and misconfigurations",
    tool: "KICS",
  },
  {
    id: "hadolint",
    name: "Hadolint Dockerfile Linter",
    desc: "Dockerfile static analyzer and best practice security checks",
    tool: "Hadolint",
  },
  {
    id: "zizmor",
    name: "Zizmor GitHub Actions",
    desc: "Static analysis security auditor for GitHub Actions workflows",
    tool: "Zizmor",
  },
  {
    id: "slither",
    name: "Slither Solidity Analyzer",
    desc: "Static analysis framework for Ethereum smart contracts",
    tool: "Slither",
  },
  {
    id: "spectral",
    name: "Spectral API Linter",
    desc: "OpenAPI and AsyncAPI security and compliance linter",
    tool: "Spectral",
  },
  {
    id: "shellcheck",
    name: "ShellCheck Script Linter",
    desc: "Static analysis and bug discovery for bash and sh scripts",
    tool: "ShellCheck",
  },
  {
    id: "mobsfscan",
    name: "MobSFScan Mobile SAST",
    desc: "Static analysis for Android and iOS mobile application code",
    tool: "MobSFScan",
  },
  {
    id: "syft",
    name: "Syft SBOM Generator",
    desc: "Generates Software Bill of Materials for dependencies and packages",
    tool: "Syft",
  },
  // Legacy aliases
  {
    id: "sast-joern",
    name: "Joern CPG Taint Scan",
    desc: "Code Property Graph AST/CFG & inter-procedural taint flow discovery",
    tool: "Joern CPG",
  },
  {
    id: "sast-codeql",
    name: "CodeQL Deep Taint",
    desc: "Semantic AST analysis and inter-procedural dataflow query bundles",
    tool: "GitHub CodeQL",
  },
];

export interface TargetValidationResult {
  readonly status: "idle" | "validating" | "safe" | "unsafe";
  readonly message?: string;
  readonly reason?: string;
  readonly resolvedIp?: string;
}

/**
 * Pre-flight SSRF Guardrail validation.
 * Verifies that the target does not resolve to private, loopback, link-local,
 * or cloud provider metadata address space.
 */
export function validateTargetSafety(input: string): TargetValidationResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { status: "idle", message: "Enter a target domain or IP address" };
  }

  // Reject unsupported / dangerous protocols
  const protocolMatch = trimmed.match(/^([a-zA-Z0-9+.-]+):\/\//);
  if (protocolMatch) {
    const proto = protocolMatch[1]?.toLowerCase();
    if (proto !== "http" && proto !== "https") {
      return {
        status: "unsafe",
        reason: `Restricted protocol scheme: "${proto}://". Only HTTP and HTTPS are permitted for authorized DAST scanning.`,
        message: "SSRF Blocked: Invalid Protocol",
      };
    }
  }

  // Strip scheme and path for host evaluation
  let host = trimmed.replace(/^[a-zA-Z0-9+.-]+:\/\//, "");
  host = host.split("/")[0] || "";
  host = host.split("?")[0] || "";
  host = host.split("#")[0] || "";

  // Strip port if present
  if (host.startsWith("[")) {
    const endBracket = host.indexOf("]");
    if (endBracket !== -1) {
      host = host.slice(1, endBracket);
    }
  } else if (host.includes(":")) {
    host = host.split(":")[0] || host;
  }

  const hostLower = host.toLowerCase();

  // 1. Loopback addresses
  if (
    hostLower === "localhost" ||
    hostLower.endsWith(".localhost") ||
    hostLower === "127.0.0.1" ||
    hostLower.startsWith("127.") ||
    hostLower === "0.0.0.0" ||
    hostLower === "::1" ||
    hostLower === "[::1]" ||
    hostLower === "ip6-localhost" ||
    hostLower === "ip6-loopback"
  ) {
    return {
      status: "unsafe",
      reason: `SSRF Blocked: Target host "${host}" resolves to a local loopback address.`,
      message: "SSRF Blocked: Loopback Address",
    };
  }

  // 2. Cloud metadata endpoints
  if (
    hostLower === "169.254.169.254" ||
    hostLower.startsWith("169.254.") ||
    hostLower === "metadata.google.internal" ||
    hostLower.endsWith(".google.internal") ||
    hostLower === "metadata" ||
    hostLower.includes("metadata.azure") ||
    hostLower.includes("metadata.aws")
  ) {
    return {
      status: "unsafe",
      reason: `SSRF Blocked: Target host "${host}" is a cloud instance metadata endpoint.`,
      message: "SSRF Blocked: Cloud Metadata",
    };
  }

  // 3. RFC-1918 Private & CGNAT IPv4 ranges
  const ipv4Match = hostLower.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const oct1 = parseInt(ipv4Match[1]!, 10);
    const oct2 = parseInt(ipv4Match[2]!, 10);
    const oct3 = parseInt(ipv4Match[3]!, 10);
    const oct4 = parseInt(ipv4Match[4]!, 10);

    if (oct1 > 255 || oct2 > 255 || oct3 > 255 || oct4 > 255) {
      return {
        status: "unsafe",
        reason: `Invalid IP address format: "${host}".`,
        message: "Invalid IP Address",
      };
    }

    if (oct1 === 10) {
      return {
        status: "unsafe",
        reason: `SSRF Blocked: "${host}" is in RFC-1918 private Class A network (10.0.0.0/8).`,
        message: "SSRF Blocked: Private Network",
      };
    }

    if (oct1 === 172 && oct2 >= 16 && oct2 <= 31) {
      return {
        status: "unsafe",
        reason: `SSRF Blocked: "${host}" is in RFC-1918 private Class B network (172.16.0.0/12).`,
        message: "SSRF Blocked: Private Network",
      };
    }

    if (oct1 === 192 && oct2 === 168) {
      return {
        status: "unsafe",
        reason: `SSRF Blocked: "${host}" is in RFC-1918 private Class C network (192.168.0.0/16).`,
        message: "SSRF Blocked: Private Network",
      };
    }

    if (oct1 === 100 && oct2 >= 64 && oct2 <= 127) {
      return {
        status: "unsafe",
        reason: `SSRF Blocked: "${host}" is inside Carrier-Grade NAT network (100.64.0.0/10).`,
        message: "SSRF Blocked: Carrier NAT",
      };
    }

    if (oct1 === 0) {
      return {
        status: "unsafe",
        reason: `SSRF Blocked: "${host}" is an invalid current network address (0.0.0.0/8).`,
        message: "SSRF Blocked: Invalid Address",
      };
    }
  }

  // 4. Intranet top-level domains
  if (
    hostLower.endsWith(".internal") ||
    hostLower.endsWith(".local") ||
    hostLower.endsWith(".lan") ||
    hostLower.endsWith(".corp") ||
    hostLower.endsWith(".home") ||
    hostLower.endsWith(".arpa")
  ) {
    return {
      status: "unsafe",
      reason: `SSRF Blocked: Intranet top-level domain "${host}" is not accessible from external DAST probes.`,
      message: "SSRF Blocked: Intranet Domain",
    };
  }

  // 5. Bare single-word hostnames (e.g. "router", "gateway", "intranet")
  if (!hostLower.includes(".") && !ipv4Match) {
    return {
      status: "unsafe",
      reason: `SSRF Blocked: Target "${host}" is a single-label local network name.`,
      message: "SSRF Blocked: Local Name",
    };
  }

  return {
    status: "safe",
    message: "Target Verified Safe",
    reason: `SSRF Preflight passed: "${host}" is an external address authorized for testing.`,
  };
}

export const DAST_PASSIVE_TASKS: ScanProfileOption[] = [
  {
    id: "httpx",
    name: "Fast Recon",
    desc: "Fast HTTP service, security headers, technology stack, and title discovery (HTTPX v1.6.0)",
    tool: "HTTPX",
  },
  {
    id: "nmap",
    name: "Full Network Scan",
    desc: "Detailed TCP service and version detection on authorized target hosts (Nmap v7.95)",
    tool: "Nmap",
  },
  {
    id: "naabu",
    name: "Naabu Port Enumeration",
    desc: "Fast and reliable TCP port discovery scanning top-1000 ports (v2.3.1)",
    tool: "Naabu",
  },
  {
    id: "katana",
    name: "Katana Web Crawler",
    desc: "Dynamic JS-aware web crawling, link discovery, and API endpoint extraction (v1.1.0)",
    tool: "Katana",
  },
  {
    id: "dnsx",
    name: "DNSX DNS Reconnaissance",
    desc: "Mass DNS resolution, record extraction (A, AAAA, CNAME, MX, TXT), and SPF/DMARC audit (v1.2.1)",
    tool: "DNSX",
  },
  {
    id: "subzy",
    name: "Subzy Subdomain Takeover",
    desc: "Subdomain takeover vulnerability detection via CNAME fingerprinting across 14+ cloud providers (v1.0.0)",
    tool: "Subzy",
  },
  {
    id: "wafw00f",
    name: "WafW00f WAF/CDN Fingerprint",
    desc: "WAF and CDN product fingerprinting via 30+ signature engine before active testing (v2.2.0)",
    tool: "WafW00f",
  },
  {
    id: "interactsh",
    name: "Interactsh OOB Interaction",
    desc: "Out-of-band interaction and blind SSRF listener setup (v1.2.0)",
    tool: "Interactsh",
  },
  {
    id: "subfinder",
    name: "Subfinder Asset Discovery",
    desc: "Passive subdomain discovery using certificate transparency and public intelligence (v2.6.6)",
    tool: "Subfinder",
  },
  {
    id: "gau",
    name: "GAU Historical URL Mining",
    desc: "Mining historical endpoints and parameters from Wayback Machine, AlienVault, and Common Crawl (v2.2.3)",
    tool: "GAU",
  },
  {
    id: "sslyze",
    name: "SSLyze TLS & Transport Audit",
    desc: "Comprehensive SSL/TLS cipher audit, deprecated protocol detection (TLS 1.0/1.1), and certificate trust validation (v5.3.0)",
    tool: "SSLyze",
  },
  {
    id: "jsluice",
    name: "JSLuice Script Analysis",
    desc: "Extracts secrets, API tokens, hidden endpoints, and unlisted backend routes from crawled JavaScript assets (v1.2.0)",
    tool: "JSLuice",
  },
  {
    id: "graphql-cop",
    name: "GraphQL-Cop Protocol Audit",
    desc: "Audits GraphQL endpoints for public introspection, field suggestion disclosure, and query batching limits (v1.1.0)",
    tool: "GraphQL-Cop",
  },
  {
    id: "masscan",
    name: "Masscan Fast Port Availability",
    desc: "Ultra-high-speed asynchronous TCP port availability discovery across broad port spaces (v1.3.2)",
    tool: "Masscan",
  },
  {
    id: "amass",
    name: "OWASP Amass Attack Surface",
    desc: "In-depth network mapping, ASN resolution, and reverse DNS attack surface enumeration (v4.2.0)",
    tool: "OWASP Amass",
  },
];

export const DAST_ACTIVE_TASKS: ScanProfileOption[] = [
  {
    id: "nuclei",
    name: "Nuclei Vulnerability Assessment",
    desc: "Template-based vulnerability detection across known CVEs, exposed .env, .git, and debug panels (v3.3.0)",
    tool: "Nuclei",
  },
  {
    id: "dalfox",
    name: "DalFox XSS Scanner",
    desc: "Automated parameter analysis and XSS (Reflected, Stored, DOM) vulnerability fuzzing (v2.9.2)",
    tool: "DalFox",
  },
  {
    id: "zap",
    name: "OWASP ZAP Dynamic Scanner",
    desc: "Automated web application security scan via OWASP ZAP crawler and active scanner (v2.15.0)",
    tool: "OWASP ZAP",
  },
  {
    id: "ffuf",
    name: "FFUF Content Discovery",
    desc: "Web directory, route, and endpoint enumeration via fuzzing with soft-404 calibration (v2.1.0)",
    tool: "FFUF",
  },
  {
    id: "feroxbuster",
    name: "Feroxbuster Deep Content Discovery",
    desc: "Recursive web directory and endpoint content discovery with auto-tune concurrency (v2.10.2)",
    tool: "Feroxbuster",
  },
  {
    id: "corsy",
    name: "Corsy CORS Auditor",
    desc: "CORS misconfiguration detection (null origin, arbitrary reflection, credential disclosure) (v1.0.0)",
    tool: "Corsy",
  },
  {
    id: "crlfuzz",
    name: "CRLFuzz Injection Scanner",
    desc: "CRLF injection and HTTP response splitting detection via multi-encoding vectors (v1.4.1)",
    tool: "CRLFuzz",
  },
  {
    id: "sstimap",
    name: "SSTImap Template Injection",
    desc: "Server-Side Template Injection (SSTI) detection across Jinja2, Twig, Smarty, and Freemarker (v1.2.2)",
    tool: "SSTImap",
  },
  {
    id: "sqlmap",
    name: "SQLMap Injection Scanner",
    desc: "Automated SQL injection vulnerability detection across parameter vectors (v1.8.0)",
    tool: "SQLMap",
  },
  {
    id: "nikto",
    name: "Nikto Web Server Security",
    desc: "Web server configuration flaws, dangerous files, outdated components, and HTTP method audit (v2.5.0)",
    tool: "Nikto",
  },
  {
    id: "arjun",
    name: "Arjun Parameter Discovery",
    desc: "Discovers hidden and unlinked HTTP GET/POST/JSON parameters susceptible to injection (v2.2.1)",
    tool: "Arjun",
  },
  {
    id: "kiterunner",
    name: "Kiterunner API Route Discovery",
    desc: "Content-aware API route discovery, Swagger/OpenAPI endpoints, and REST microservice mapping (v1.0.2)",
    tool: "Kiterunner",
  },
  {
    id: "jwt_tool",
    name: "JWT Tool Token Fuzzer",
    desc: "Tests JSON Web Tokens for alg:none, weak HMAC key brute-forcing, and signature bypasses (v2.2.6)",
    tool: "JWT Tool",
  },
  {
    id: "commix",
    name: "Commix Command Injection",
    desc: "Automated detection and verification of Operating System command injection vulnerabilities (v3.9.0)",
    tool: "Commix",
  },
  {
    id: "access-control",
    name: "Access Control & IDOR Probe",
    desc: "Differential request fuzzing across identifier parameters to discover IDOR and BOLA vulnerabilities (v1.0.0)",
    tool: "Access Control Probe",
  },
];

export const CANONICAL_DAST_TASKS: ScanProfileOption[] = [
  ...DAST_PASSIVE_TASKS,
  ...DAST_ACTIVE_TASKS,
];

export const DAST_ALIASES: ScanProfileOption[] = [
  {
    id: "recon",
    name: "Fast Recon (Alias)",
    desc: "Alias for HTTPX service and header discovery",
    tool: "HTTPX",
  },
  {
    id: "web-discovery",
    name: "Web Discovery (Alias)",
    desc: "Alias for Katana crawling and endpoint discovery",
    tool: "Katana",
  },
  {
    id: "network-portscan",
    name: "Full Network Scan (Alias)",
    desc: "Alias for Nmap service and version detection",
    tool: "Nmap",
  },
  {
    id: "vuln-assessment",
    name: "Vuln Assessment (Alias)",
    desc: "Alias for Nuclei vulnerability assessment",
    tool: "Nuclei",
  },
  {
    id: "xss-scan",
    name: "XSS Scan (Alias)",
    desc: "Alias for DalFox parameter and XSS fuzzing",
    tool: "DalFox",
  },
  {
    id: "dast-zap",
    name: "OWASP ZAP (Alias)",
    desc: "Alias for OWASP ZAP active scanner",
    tool: "OWASP ZAP",
  },
  {
    id: "cors-audit",
    name: "CORS Audit (Alias)",
    desc: "Alias for Corsy misconfiguration testing",
    tool: "Corsy",
  },
  {
    id: "crlf-scan",
    name: "CRLF Injection (Alias)",
    desc: "Alias for CRLFuzz injection testing",
    tool: "CRLFuzz",
  },
  {
    id: "ssti-scan",
    name: "SSTI Scan (Alias)",
    desc: "Alias for SSTImap template injection testing",
    tool: "SSTImap",
  },
  {
    id: "jwt-tool",
    name: "JWT Toolkit (Alias)",
    desc: "Alias for JWT Tool token fuzzer",
    tool: "JWT Tool",
  },
];

export const TARGET_DAST_TASKS: ScanProfileOption[] = [
  ...CANONICAL_DAST_TASKS,
  ...DAST_ALIASES,
];

export const DEFAULT_ORCHESTRATOR_TASKS: ScanProfileOption[] = [
  ...CLOUD_SAST_TASKS,
  ...TARGET_DAST_TASKS,
];

export interface UnifiedScanHeaderProps {
  readonly scanMode?: ScanMode;
  readonly onScanModeChange?: (mode: ScanMode) => void;

  // Local scan props
  readonly currentFolderPath?: string;
  readonly recentFolders?: readonly string[];
  readonly onFolderChange?: (folderPath: string) => void;
  readonly onBrowseFolder?: () => Promise<string | null> | void;
  readonly onScanLocal?: (folderPath: string) => void;
  readonly isLocalScanning?: boolean;
  readonly localProgress?: { scanned: number; total: number } | null;

  // Cloud SAST scan props
  readonly onScanCloudSast?: (params: {
    folderPath: string;
    profiles: (AllScanProfile | "secret-scan")[];
    ruleTags?: string[];
  }) => void;
  readonly isCloudSastScanning?: boolean;
  readonly cloudSastProgress?: {
    currentTask: string;
    completed: number;
    total: number;
  } | null;

  // Orchestrator scan props
  readonly defaultTarget?: string;
  readonly onScanOrchestrator?: (params: {
    target: string;
    profiles: (AllScanProfile | "secret-scan")[];
  }) => void;
  readonly isOrchestratorScanning?: boolean;
  readonly orchestratorProgress?: {
    currentTask: string;
    completed: number;
    total: number;
  } | null;

  // SSRF Target Safety Preflight validation
  readonly onValidateTarget?: (target: string) => Promise<{
    readonly safe?: boolean;
    readonly valid?: boolean;
    readonly ok?: boolean;
    readonly reason?: string;
    readonly message?: string;
    readonly ip_address?: string;
    readonly resolved_ips?: readonly string[];
  } | boolean>;

  // Graph layout controls
  readonly layoutDirection?: "DOWN" | "RIGHT";
  readonly onLayoutDirectionChange?: (dir: "DOWN" | "RIGHT") => void;
  readonly graphViewMode?: "all" | "selected";
  readonly onGraphViewModeChange?: (mode: "all" | "selected") => void;
  readonly activeGraph?: GraphViewType;
  readonly onSelectGraph?: (graphId: GraphViewType) => void;
  readonly groupByFile?: boolean;
  readonly onToggleGroupByFile?: () => void;

  // Test-file filtering for the "Whole Code" architecture graphs -- test
  // suites often dominate a codebase's node count relative to app code.
  readonly hideTestFiles?: boolean;
  readonly onToggleHideTestFiles?: () => void;

  readonly findingCount?: number;
  readonly localCount?: number;
  readonly orchestratorCount?: number;

  // Analysis Pipeline Mode: 'bugs' (flaws only) vs 'full' (entire codebase architecture)
  readonly analysisPipelineMode?: "bugs" | "full";
  readonly onAnalysisPipelineModeChange?: (mode: "bugs" | "full") => void;

  // Left Sidebar (Primary Sidebar) toggle
  readonly isLeftSidebarOpen?: boolean;
  readonly onToggleLeftSidebar?: () => void;

  // Right Section (Auxiliary Bar) toggle
  readonly isRightSectionOpen?: boolean;
  readonly onToggleRightSection?: () => void;

  // Universal Quick Search trigger
  readonly onOpenSearch?: () => void;

  // Download the current scan as a report -- opens a preview before the
  // actual file save, regardless of which format was picked from the menu.
  readonly onDownloadReport?: (format: "md" | "pdf" | "sarif") => void;
}

const RECENT_FOLDERS_STORAGE_KEY = "whoami:recent_folders";

function getStoredRecentFolders(): string[] {
  if (typeof window === "undefined" || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(RECENT_FOLDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
  } catch {
    return [];
  }
}

function saveStoredRecentFolders(folders: readonly string[]): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(RECENT_FOLDERS_STORAGE_KEY, JSON.stringify(folders.slice(0, 10)));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Streamlined Single-Tier Header Component featuring:
 * 1. Mode-synchronized scan controls (Folder selector for Local, Target & Multi-task selector for Orchestrator)
 * 2. Graph controls (Single Graph View dropdown, Flow filters, Layout direction, Issues count)
 */
export function UnifiedScanHeader({
  scanMode = "local",
  onScanModeChange,
  currentFolderPath = "",
  recentFolders,
  onFolderChange,
  onBrowseFolder,
  onScanLocal,
  isLocalScanning = false,
  localProgress,
  onScanCloudSast,
  isCloudSastScanning = false,
  cloudSastProgress,
  defaultTarget = "scanme.nmap.org",
  onScanOrchestrator,
  isOrchestratorScanning = false,
  orchestratorProgress,
  onValidateTarget,
  layoutDirection = "DOWN",
  onLayoutDirectionChange,
  graphViewMode = "all",
  onGraphViewModeChange,
  activeGraph = "graph",
  onSelectGraph,
  findingCount = 0,
  analysisPipelineMode = "bugs",
  onAnalysisPipelineModeChange,
  isLeftSidebarOpen = true,
  onToggleLeftSidebar,
  isRightSectionOpen = false,
  onToggleRightSection,
  onOpenSearch,
  onDownloadReport,
  hideTestFiles,
  onToggleHideTestFiles,
}: UnifiedScanHeaderProps): React.ReactElement {
  const [activeMode, setActiveMode] = useState<ScanMode>(scanMode);

  // Local & Cloud folder state
  const [selectedFolder, setSelectedFolder] = useState<string>(currentFolderPath);
  const [internalRecentFolders, setInternalRecentFolders] = useState<string[]>(() => {
    if (recentFolders && recentFolders.length > 0) return [...recentFolders];
    return getStoredRecentFolders();
  });
  const [isFolderDropdownOpen, setIsFolderDropdownOpen] = useState<boolean>(false);

  // Cloud SAST state
  const [selectedSastTasks, setSelectedSastTasks] = useState<
    (AllScanProfile | "secret-scan")[]
  >(["sast-joern", "sast-semgrep", "sast-trufflehog"]);
  const [isSastDropdownOpen, setIsSastDropdownOpen] = useState<boolean>(false);
  const sastMenuRef = useRef<HTMLDivElement>(null);

  // Target DAST state
  const [target, setTarget] = useState<string>(defaultTarget);
  const [targetValidation, setTargetValidation] = useState<TargetValidationResult>(() =>
    validateTargetSafety(defaultTarget),
  );
  const [selectedTasks, setSelectedTasks] = useState<
    (AllScanProfile | "secret-scan")[]
  >(["recon", "web-discovery", "vuln-assessment"]);
  const [isTaskDropdownOpen, setIsTaskDropdownOpen] = useState<boolean>(false);
  const [isLayoutMenuOpen, setIsLayoutMenuOpen] = useState<boolean>(false);
  const [isWholeCodeOpen, setIsWholeCodeOpen] = useState<boolean>(false);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState<boolean>(false);

  const folderMenuRef = useRef<HTMLDivElement>(null);
  const taskMenuRef = useRef<HTMLDivElement>(null);
  const layoutMenuRef = useRef<HTMLDivElement>(null);
  const wholeCodeMenuRef = useRef<HTMLDivElement>(null);
  const downloadMenuRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [showLeftShadow, setShowLeftShadow] = useState<boolean>(false);
  const [showRightShadow, setShowRightShadow] = useState<boolean>(false);

  const closeAllDropdowns = useCallback(() => {
    setIsFolderDropdownOpen(false);
    setIsSastDropdownOpen(false);
    setIsTaskDropdownOpen(false);
    setIsLayoutMenuOpen(false);
    setIsWholeCodeOpen(false);
    setIsDownloadMenuOpen(false);
  }, []);

  const updateScrollState = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setShowLeftShadow(scrollLeft > 2);
    setShowRightShadow(scrollLeft < scrollWidth - clientWidth - 2);
  }, []);

  const getDropdownStyle = (
    ref: React.RefObject<HTMLDivElement | null>,
    align: "left" | "right" = "left",
    width = 288,
  ): React.CSSProperties => {
    if (typeof window === "undefined" || !ref.current) {
      return {
        position: "fixed",
        top: 48,
        ...(align === "right" ? { right: 16 } : { left: 16 }),
        zIndex: 9999,
      };
    }
    const rect = ref.current.getBoundingClientRect();
    const style: React.CSSProperties = {
      position: "fixed",
      top: rect.bottom + 4,
      zIndex: 9999,
      maxHeight: Math.max(160, window.innerHeight - rect.bottom - 16),
    };
    if (align === "right") {
      const rightOffset = Math.max(8, window.innerWidth - rect.right);
      if (window.innerWidth - rightOffset < width) {
        style.left = 8;
      } else {
        style.right = rightOffset;
      }
    } else {
      style.left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
    }
    return style;
  };

  const isLocal = activeMode === "local" || activeMode === "local-offline";
  const isCloudSast = activeMode === "cloud-sast";
  const isTargetDast = activeMode === "target-dast" || activeMode === "orchestrator";

  // Filter Whole Code graph options for active scanMode
  const availableWholeCodeOptions = React.useMemo(() => {
    return WHOLE_CODE_GRAPH_OPTIONS.filter((opt) => {
      if (!activeMode) return true;
      if (opt.scope === "both") return true;
      if (isTargetDast) return opt.scope === "orchestrator";
      return opt.scope === "local";
    });
  }, [activeMode, isTargetDast]);

  const isBugModeActive = activeGraph === "graph" || analysisPipelineMode === "bugs";
  const selectedWholeCodeOption =
    availableWholeCodeOptions.find((g) => g.id === activeGraph) ||
    availableWholeCodeOptions[0];

  // Update internal mode if prop changes
  useEffect(() => {
    setActiveMode(scanMode);
  }, [scanMode]);

  // Sync internal selectedFolder if prop changes
  useEffect(() => {
    if (currentFolderPath !== undefined) {
      setSelectedFolder(currentFolderPath);
    }
  }, [currentFolderPath]);

  // Sync internal recentFolders if prop changes
  useEffect(() => {
    if (recentFolders && recentFolders.length > 0) {
      setInternalRecentFolders([...recentFolders]);
    }
  }, [recentFolders]);

  const addFolderToRecent = (folder: string) => {
    if (!folder || !folder.trim()) return;
    const normalized = folder.trim();
    setInternalRecentFolders((prev) => {
      const updated = [normalized, ...prev.filter((f) => f !== normalized)].slice(0, 10);
      saveStoredRecentFolders(updated);
      return updated;
    });
  };

  const handleBrowseFolder = async () => {
    try {
      let chosenPath: string | null = null;
      if (onBrowseFolder) {
        const res = await onBrowseFolder();
        if (res) chosenPath = res;
      } else if (typeof window !== "undefined" && "showDirectoryPicker" in window) {
        try {
          const win = window as unknown as {
            showDirectoryPicker?: () => Promise<{ name?: string }>;
          };
          const dirHandle = await win.showDirectoryPicker?.();
          if (dirHandle?.name) {
            chosenPath = dirHandle.name;
          }
        } catch {
          // User cancelled file manager dialog
        }
      }

      if (chosenPath) {
        setSelectedFolder(chosenPath);
        onFolderChange?.(chosenPath);
        addFolderToRecent(chosenPath);
      }
    } catch (err) {
      console.warn("[WhoAmI] Failed to browse folder:", err);
    }
  };

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const targetNode = event.target as Node;
      if ((targetNode as HTMLElement)?.closest?.('[data-dropdown="true"]')) {
        return;
      }
      if (
        folderMenuRef.current &&
        !folderMenuRef.current.contains(targetNode)
      ) {
        setIsFolderDropdownOpen(false);
      }
      if (sastMenuRef.current && !sastMenuRef.current.contains(targetNode)) {
        setIsSastDropdownOpen(false);
      }
      if (taskMenuRef.current && !taskMenuRef.current.contains(targetNode)) {
        setIsTaskDropdownOpen(false);
      }
      if (
        layoutMenuRef.current &&
        !layoutMenuRef.current.contains(targetNode)
      ) {
        setIsLayoutMenuOpen(false);
      }
      if (
        wholeCodeMenuRef.current &&
        !wholeCodeMenuRef.current.contains(targetNode)
      ) {
        setIsWholeCodeOpen(false);
      }
      if (
        downloadMenuRef.current &&
        !downloadMenuRef.current.contains(targetNode)
      ) {
        setIsDownloadMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeAllDropdowns();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeAllDropdowns]);

  useEffect(() => {
    const handleScrollCapture = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest?.('[data-dropdown="true"]')) return;
      closeAllDropdowns();
    };
    window.addEventListener("scroll", handleScrollCapture, true);
    return () => window.removeEventListener("scroll", handleScrollCapture, true);
  }, [closeAllDropdowns]);

  useEffect(() => {
    updateScrollState();
    const handleResize = () => {
      closeAllDropdowns();
      updateScrollState();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateScrollState, closeAllDropdowns]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target?.closest?.(".overflow-y-auto") ||
        target?.closest?.("[data-dropdown]")
      ) {
        return;
      }

      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        if (e.deltaY !== 0 && el.scrollWidth > el.clientWidth) {
          if (e.cancelable) {
            e.preventDefault();
          }
          el.scrollLeft += e.deltaY;
        }
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, []);

  useEffect(() => {
    updateScrollState();
  }, [
    activeMode,
    currentFolderPath,
    scanMode,
    isLocalScanning,
    isCloudSastScanning,
    isOrchestratorScanning,
    updateScrollState,
  ]);

  const handleHeaderScroll = () => {
    closeAllDropdowns();
    updateScrollState();
  };

  const handleModeSwitch = (mode: ScanMode) => {
    setActiveMode(mode);
    onScanModeChange?.(mode);
  };

  // The orchestrator accepts both a tool id ("semgrep") and its legacy
  // profile alias ("sast-semgrep"), and the default selection uses the alias.
  // A catalog row counts as selected when either form is present, so the
  // checkboxes agree with the "N SAST Active" count.
  const isSastTaskSelected = (taskId: AllScanProfile | "secret-scan"): boolean =>
    selectedSastTasks.includes(taskId) || selectedSastTasks.includes(`sast-${taskId}`);

  const handleToggleSastTask = (taskId: AllScanProfile | "secret-scan") => {
    setSelectedSastTasks((prev) => {
      const alias = `sast-${taskId}`;
      return prev.includes(taskId) || prev.includes(alias)
        ? prev.filter((id) => id !== taskId && id !== alias)
        : [...prev, taskId];
    });
  };

  const handleSelectAllSastTasks = () => {
    setSelectedSastTasks(CLOUD_SAST_TASKS.map((t) => t.id));
  };

  const handleClearAllSastTasks = () => {
    setSelectedSastTasks([]);
  };

  // Real-time target safety preflight check
  useEffect(() => {
    const localResult = validateTargetSafety(target);
    if (localResult.status === "unsafe" || !onValidateTarget || !target.trim()) {
      setTargetValidation(localResult);
      return;
    }

    setTargetValidation({ status: "validating", message: "Validating target safety…" });
    const timer = setTimeout(async () => {
      try {
        const res = await onValidateTarget(target);
        if (typeof res === "boolean") {
          setTargetValidation(
            res
              ? { status: "safe", message: "Target Verified Safe" }
              : { status: "unsafe", message: "SSRF Blocked: Target validation failed", reason: "Target not safe to scan" },
          );
        } else if (res) {
          const isSafe = res.safe ?? res.valid ?? res.ok ?? true;
          setTargetValidation(
            isSafe
              ? {
                  status: "safe",
                  message: res.message || "Target Verified Safe",
                  reason: res.reason,
                }
              : {
                  status: "unsafe",
                  message: res.message || "SSRF Blocked: Target restricted",
                  reason: res.reason || "Address resolved to restricted IP range",
                },
          );
        }
      } catch (err: unknown) {
        setTargetValidation({
          status: "unsafe",
          message: "Target Validation Error",
          reason: err instanceof Error ? err.message : String(err),
        });
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [target, onValidateTarget]);

  const handleToggleTask = (taskId: AllScanProfile | "secret-scan") => {
    setSelectedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  const handleSelectAllTasks = () => {
    setSelectedTasks(CANONICAL_DAST_TASKS.map((t) => t.id));
  };

  const handleSelectPassiveTasks = () => {
    setSelectedTasks(DAST_PASSIVE_TASKS.map((t) => t.id));
  };

  const handleSelectActiveTasks = () => {
    setSelectedTasks(DAST_ACTIVE_TASKS.map((t) => t.id));
  };

  const handleClearAllTasks = () => {
    setSelectedTasks([]);
  };

  const handleTriggerLocalScan = () => {
    if (!selectedFolder.trim()) {
      void handleBrowseFolder();
      return;
    }
    addFolderToRecent(selectedFolder);
    onScanLocal?.(selectedFolder);
  };

  const handleTriggerCloudSastScan = () => {
    if (selectedSastTasks.length === 0) return;
    if (!selectedFolder.trim()) {
      void handleBrowseFolder();
      return;
    }
    addFolderToRecent(selectedFolder);
    if (onScanCloudSast) {
      onScanCloudSast({
        folderPath: selectedFolder,
        profiles: selectedSastTasks,
      });
    } else if (onScanOrchestrator) {
      onScanOrchestrator({
        target: selectedFolder,
        profiles: selectedSastTasks,
      });
    }
  };

  const handleTriggerOrchestratorScan = () => {
    if (selectedTasks.length === 0) return;
    if (targetValidation.status === "unsafe") return;
    onScanOrchestrator?.({
      target,
      profiles: selectedTasks,
    });
  };


  return (
    <header className="relative flex flex-col border-b border-vscode-border bg-vscode-header/90 backdrop-blur-xl text-vscode-fg select-none shrink-0 font-sans shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_8px_20px_rgba(0,0,0,0.35)] w-full min-w-0">
      {/* Left overflow shadow */}
      {showLeftShadow && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-vscode-header via-vscode-header/80 to-transparent z-30 transition-opacity duration-200"
        />
      )}

      {/* Streamlined Unified Control Bar with horizontal scrolling */}
      <div
        ref={scrollContainerRef}
        onScroll={handleHeaderScroll}
        className="flex items-center justify-between px-3 py-2 gap-3 overflow-x-auto scrollbar-none min-w-0 w-full flex-nowrap"
      >
        {/* Left: Contextual Scan Inputs for active mode */}
        <div className="flex items-center gap-2.5 shrink-0 flex-nowrap">
          {/* Mode Switcher Pill: [ Local | Cloud SAST | Target DAST ] */}
          <div className="flex items-center rounded-md border border-vscode-border bg-vscode-card p-0.5 shadow-sm shrink-0">
            <button
              type="button"
              onClick={() => handleModeSwitch("local-offline")}
              title="Local Workspace Offline SAST Scan"
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                isLocal
                  ? "bg-vscode-primary text-white shadow-sm font-semibold"
                  : "text-vscode-muted hover:text-vscode-fg hover:bg-vscode-card-hover font-medium"
              }`}
            >
              <FolderIcon size={12} className={isLocal ? "text-white" : "text-severity-high"} />
              <span>Local</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeSwitch("cloud-sast")}
              title="Cloud SAST Engines (Joern, Semgrep, PMD, Trivy, etc.)"
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                isCloudSast
                  ? "bg-vscode-primary text-white shadow-sm font-semibold"
                  : "text-vscode-muted hover:text-vscode-fg hover:bg-vscode-card-hover font-medium"
              }`}
            >
              <ShieldCheckIcon size={12} className={isCloudSast ? "text-white" : "text-severity-medium"} />
              <span>Cloud SAST</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeSwitch("target-dast")}
              title="Target DAST Probes & Port Scanners (Nuclei, Dalfox, Ferox, etc.)"
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                isTargetDast
                  ? "bg-[#107C41] text-white shadow-sm font-semibold"
                  : "text-vscode-muted hover:text-vscode-fg hover:bg-vscode-card-hover font-medium"
              }`}
            >
              <RemoteScanIcon size={12} className={isTargetDast ? "text-white" : "text-severity-low"} />
              <span>Target DAST</span>
            </button>
          </div>

          <div className="h-4 w-[1px] bg-vscode-border shrink-0" />

          {/* Contextual Input Controls */}
          {isLocal ? (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-caption font-bold uppercase tracking-wider text-vscode-muted shrink-0">
                Directory:
              </span>

              {/* Folder Dropdown / Editable Combobox */}
              <div className="relative w-44 sm:w-60 max-w-[260px] shrink" ref={folderMenuRef}>
                <div className="flex items-center rounded-md border border-vscode-border bg-vscode-card focus-within:border-vscode-focus px-2 py-1 text-xs">
                  <button
                    type="button"
                    onClick={handleBrowseFolder}
                    title="Browse folder in file manager…"
                    aria-label="Browse folder"
                    className="p-0.5 -ml-0.5 mr-1 text-severity-high hover:text-[#FFD700] hover:bg-vscode-border rounded transition-colors cursor-pointer shrink-0"
                  >
                    <FolderIcon size={14} />
                  </button>
                  <input
                    type="text"
                    value={selectedFolder}
                    onChange={(e) => {
                      setSelectedFolder(e.target.value);
                      onFolderChange?.(e.target.value);
                    }}
                    placeholder="Workspace folder…"
                    title={selectedFolder || "Workspace folder…"}
                    className="flex-1 min-w-0 bg-transparent text-vscode-fg outline-none font-mono text-xs placeholder-vscode-muted truncate"
                  />
                  <button
                    type="button"
                    onClick={() => setIsFolderDropdownOpen((prev) => !prev)}
                    title="Select recent folder"
                    aria-label="Recent folders"
                    className="p-0.5 text-vscode-muted hover:text-white transition-colors cursor-pointer ml-1 shrink-0"
                  >
                    <ChevronDownIcon size={12} />
                  </button>
                </div>

                {/* Recent Folders Dropdown Menu */}
                {isFolderDropdownOpen &&
                  typeof document !== "undefined" &&
                  createPortal(
                    <div
                      data-dropdown="true"
                      onWheel={(e) => e.stopPropagation()}
                      style={getDropdownStyle(folderMenuRef, "left", 288)}
                      className="w-72 rounded-md border border-vscode-border bg-vscode-card p-1 shadow-2xl animate-in fade-in duration-100 max-h-64 overflow-y-auto"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setIsFolderDropdownOpen(false);
                          void handleBrowseFolder();
                        }}
                        className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded text-xs font-medium text-severity-medium hover:bg-vscode-card-hover hover:text-vscode-fg cursor-pointer border-b border-vscode-border mb-1"
                      >
                        <FolderIcon size={13} className="text-severity-medium shrink-0" />
                        <span>Browse for folder…</span>
                      </button>

                      <div className="px-2.5 py-1 text-caption font-bold uppercase tracking-wider text-vscode-muted">
                        Recent Workspaces
                      </div>
                      {internalRecentFolders.length === 0 ? (
                        <div className="px-2.5 py-1.5 text-xs text-vscode-muted italic">
                          No recent folders
                        </div>
                      ) : (
                        internalRecentFolders.map((folder, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setSelectedFolder(folder);
                              onFolderChange?.(folder);
                              setIsFolderDropdownOpen(false);
                            }}
                            className={`flex w-full items-center justify-between px-2.5 py-1.5 rounded text-xs font-mono text-left truncate cursor-pointer ${
                              selectedFolder === folder
                                ? "bg-vscode-card-selected text-vscode-fg font-semibold"
                                : "text-vscode-fg hover:bg-vscode-card-hover hover:text-vscode-fg"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <FolderIcon size={12} className="text-severity-high shrink-0" />
                              <span className="truncate" title={folder}>{folder}</span>
                            </div>
                            {selectedFolder === folder && <CheckIcon size={12} className="text-white shrink-0" />}
                          </button>
                        ))
                      )}
                    </div>,
                    document.body,
                  )}
              </div>

              {/* Local Scan Action Button */}
              <div className="flex items-center gap-2 shrink-0">
                {isLocalScanning && localProgress && (
                  <span className="text-xs font-mono text-severity-medium">
                    {localProgress.scanned}/{localProgress.total} files
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleTriggerLocalScan}
                  disabled={isLocalScanning}
                  aria-label="Scan Folder"
                  title={isLocalScanning ? "Scanning Folder… (Pause)" : "Scan Folder (100% Offline)"}
                  className="flex items-center justify-center rounded-md bg-vscode-primary hover:bg-vscode-primary-hover active:bg-vscode-primary-hover px-2.5 py-1.5 text-xs font-semibold text-white transition-colors shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isLocalScanning ? (
                    <PauseIcon size={14} className="text-white" />
                  ) : (
                    <RefreshCwIcon size={14} className="text-white" />
                  )}
                </button>
              </div>
            </div>
          ) : isCloudSast ? (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-caption font-bold uppercase tracking-wider text-vscode-muted shrink-0">
                Directory:
              </span>

              {/* Folder input for SAST */}
              <div className="relative w-44 sm:w-60 max-w-[260px] shrink" ref={folderMenuRef}>
                <div className="flex items-center rounded-md border border-vscode-border bg-vscode-card focus-within:border-vscode-focus px-2 py-1 text-xs">
                  <button
                    type="button"
                    onClick={handleBrowseFolder}
                    title="Browse folder in file manager…"
                    aria-label="Browse folder"
                    className="p-0.5 -ml-0.5 mr-1 text-severity-medium hover:text-[#9cdcfe] hover:bg-vscode-border rounded transition-colors cursor-pointer shrink-0"
                  >
                    <FolderIcon size={14} />
                  </button>
                  <input
                    type="text"
                    value={selectedFolder}
                    onChange={(e) => {
                      setSelectedFolder(e.target.value);
                      onFolderChange?.(e.target.value);
                    }}
                    placeholder="Workspace path…"
                    title={selectedFolder || "Workspace path…"}
                    className="flex-1 min-w-0 bg-transparent text-vscode-fg outline-none font-mono text-xs placeholder-vscode-muted truncate"
                  />
                  <button
                    type="button"
                    onClick={() => setIsFolderDropdownOpen((prev) => !prev)}
                    title="Select recent folder"
                    aria-label="Recent folders"
                    className="p-0.5 text-vscode-muted hover:text-white transition-colors cursor-pointer ml-1 shrink-0"
                  >
                    <ChevronDownIcon size={12} />
                  </button>
                </div>

                {/* Recent Folders Dropdown Menu */}
                {isFolderDropdownOpen &&
                  typeof document !== "undefined" &&
                  createPortal(
                    <div
                      data-dropdown="true"
                      onWheel={(e) => e.stopPropagation()}
                      style={getDropdownStyle(folderMenuRef, "left", 288)}
                      className="w-72 rounded-md border border-vscode-border bg-vscode-card p-1 shadow-2xl animate-in fade-in duration-100 max-h-64 overflow-y-auto"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setIsFolderDropdownOpen(false);
                          void handleBrowseFolder();
                        }}
                        className="flex w-full items-center gap-2 px-2.5 py-1.5 rounded text-xs font-medium text-severity-medium hover:bg-vscode-card-hover hover:text-vscode-fg cursor-pointer border-b border-vscode-border mb-1"
                      >
                        <FolderIcon size={13} className="text-severity-medium shrink-0" />
                        <span>Browse for folder…</span>
                      </button>

                      <div className="px-2.5 py-1 text-caption font-bold uppercase tracking-wider text-vscode-muted">
                        Recent Workspaces
                      </div>
                      {internalRecentFolders.length === 0 ? (
                        <div className="px-2.5 py-1.5 text-xs text-vscode-muted italic">
                          No recent folders
                        </div>
                      ) : (
                        internalRecentFolders.map((folder, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setSelectedFolder(folder);
                              onFolderChange?.(folder);
                              setIsFolderDropdownOpen(false);
                            }}
                            className={`flex w-full items-center justify-between px-2.5 py-1.5 rounded text-xs font-mono text-left truncate cursor-pointer ${
                              selectedFolder === folder
                                ? "bg-vscode-card-selected text-vscode-fg font-semibold"
                                : "text-vscode-fg hover:bg-vscode-card-hover hover:text-vscode-fg"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <FolderIcon size={12} className="text-severity-high shrink-0" />
                              <span className="truncate" title={folder}>{folder}</span>
                            </div>
                            {selectedFolder === folder && <CheckIcon size={12} className="text-white shrink-0" />}
                          </button>
                        ))
                      )}
                    </div>,
                    document.body,
                  )}
              </div>


              {/* Cloud SAST Engine Dropdown */}
              <div className="relative min-w-[110px] max-w-[130px] shrink" ref={sastMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsSastDropdownOpen((prev) => !prev)}
                  className="flex items-center justify-between w-full rounded-md border border-vscode-border bg-vscode-card px-2 py-1 text-xs cursor-pointer hover:border-vscode-dim"
                >
                  <div className="flex items-center gap-1 truncate">
                    <ShieldCheckIcon size={13} className="text-severity-medium shrink-0" />
                    <span className="text-vscode-fg font-medium truncate text-xs">
                      {selectedSastTasks.length} SAST Active
                    </span>
                  </div>
                  <ChevronDownIcon size={12} className="text-vscode-muted ml-1 shrink-0" />
                </button>

                {isSastDropdownOpen &&
                  typeof document !== "undefined" &&
                  createPortal(
                    <div
                      data-dropdown="true"
                      onWheel={(e) => e.stopPropagation()}
                      style={getDropdownStyle(sastMenuRef, "left", 288)}
                      className="w-72 rounded-md border border-vscode-border bg-vscode-card p-2 shadow-2xl animate-in fade-in duration-100"
                    >
                      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-vscode-border">
                        <span className="text-caption font-bold uppercase tracking-wider text-vscode-muted">
                          Cloud SAST Engines
                        </span>
                        <div className="flex items-center gap-2 text-caption">
                          <button
                            type="button"
                            onClick={handleSelectAllSastTasks}
                            className="text-severity-medium hover:underline cursor-pointer"
                          >
                            All
                          </button>
                          <span className="text-vscode-border">|</span>
                          <button
                            type="button"
                            onClick={handleClearAllSastTasks}
                            className="text-vscode-muted hover:text-vscode-fg cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      <div
                        className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1"
                        onWheel={(e) => e.stopPropagation()}
                      >
                        {CLOUD_SAST_TASKS.map((task) => {
                          const isChecked = isSastTaskSelected(task.id);
                          return (
                            <label
                              key={task.id}
                              className="flex items-start gap-2 p-1.5 rounded hover:bg-vscode-card-hover transition-colors cursor-pointer select-none"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleSastTask(task.id)}
                                className="mt-0.5 rounded border-vscode-border text-vscode-primary focus:ring-0 cursor-pointer"
                              />
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`text-xs font-semibold ${
                                      isChecked ? "text-vscode-fg" : "text-vscode-muted"
                                    }`}
                                  >
                                    {task.name}
                                  </span>
                                  <span className="rounded bg-vscode-header border border-vscode-border px-1 text-caption font-mono text-vscode-muted">
                                    {task.tool}
                                  </span>
                                </div>
                                <span className="text-caption text-vscode-muted leading-tight">
                                  {task.desc}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>,
                    document.body,
                  )}
              </div>

              {/* Cloud SAST Action Button */}
              <div className="flex items-center gap-2 shrink-0">
                {isCloudSastScanning && cloudSastProgress && (
                  <span
                    className="text-xs font-mono text-severity-medium"
                    title={cloudSastProgress.currentTask}
                  >
                    {cloudSastProgress.total > 0
                      ? `Running (${Math.max(1, Math.min(cloudSastProgress.completed, cloudSastProgress.total))}/${cloudSastProgress.total})`
                      : "Running…"}
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleTriggerCloudSastScan}
                  disabled={isCloudSastScanning || selectedSastTasks.length === 0}
                  aria-label="Scan Cloud SAST"
                  title="Run cloud SAST for this workspace"
                  className="flex items-center justify-center rounded-md bg-vscode-card-selected hover:bg-vscode-primary border border-vscode-focus/50 px-2.5 py-1.5 text-xs font-semibold text-severity-medium transition-colors shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isCloudSastScanning ? (
                    <PauseIcon size={14} className="text-severity-medium" />
                  ) : (
                    <PlayIcon size={14} className="text-severity-medium" />
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-caption font-bold uppercase tracking-wider text-vscode-muted shrink-0">
                Target:
              </span>
              <div className="flex items-center w-40 sm:w-56 max-w-[240px] shrink rounded-md border border-vscode-border bg-vscode-card focus-within:border-vscode-focus px-2 py-1 text-xs">
                <RadioIcon size={13} className="text-severity-low shrink-0 mr-1.5" />
                <input
                  type="text"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="Host or IP (e.g. example.com)"
                  title={targetValidation.reason || target}
                  className="flex-1 min-w-0 bg-transparent text-vscode-fg outline-none font-mono text-xs placeholder-vscode-muted truncate mr-1"
                />

                {/* SSRF Preflight Safety Status Indicator */}
                {targetValidation.status === "safe" && (
                  <span
                    title={targetValidation.reason || "Target verified safe: SSRF preflight passed"}
                    aria-label="Target Safe"
                    className="flex items-center gap-1 rounded bg-[#107C41]/20 border border-[#107C41]/50 px-1.5 text-caption font-semibold text-[#4EC9B0] shrink-0 cursor-help"
                  >
                    <ShieldCheckIcon size={11} className="text-[#3FB950]" />
                    <span>Safe</span>
                  </span>
                )}
                {targetValidation.status === "unsafe" && (
                  <span
                    title={targetValidation.reason || targetValidation.message || "SSRF Blocked: Target address restricted"}
                    aria-label="Target Unsafe"
                    className="flex items-center gap-1 rounded bg-[#BE1100]/20 border border-[#BE1100]/50 px-1.5 text-caption font-semibold text-severity-critical shrink-0 cursor-help"
                  >
                    <ShieldAlertIcon size={11} className="text-severity-critical" />
                    <span>Blocked</span>
                  </span>
                )}
                {targetValidation.status === "validating" && (
                  <span
                    title="Checking target safety via SSRF preflight…"
                    aria-label="Checking Target Safety"
                    className="flex items-center gap-1 rounded bg-vscode-card border border-vscode-border px-1.5 text-caption font-medium text-vscode-muted shrink-0"
                  >
                    <RefreshCwIcon size={10} className="animate-spin text-vscode-muted" />
                    <span>Checking</span>
                  </span>
                )}
              </div>

              {/* Multi-Task Checkbox Dropdown Selector */}
              <div className="relative min-w-[110px] max-w-[130px] shrink" ref={taskMenuRef}>
                <div className="flex items-center justify-between rounded-md border border-vscode-border bg-vscode-card px-2 py-1 text-xs cursor-pointer hover:border-vscode-dim">
                  <button
                    type="button"
                    onClick={() => setIsTaskDropdownOpen((prev) => !prev)}
                    className="flex items-center gap-1.5 text-left flex-1 truncate"
                  >
                    <TerminalIcon size={13} className="text-severity-low shrink-0" />
                    <span className="text-vscode-fg font-medium truncate text-xs">
                      {selectedTasks.length === 0
                        ? "Select Tasks…"
                        : `${selectedTasks.length} Tasks Active`}
                    </span>
                    <ChevronDownIcon size={12} className="text-vscode-muted ml-auto shrink-0" />
                  </button>
                </div>

                {/* Task Selection Dropdown with Checkboxes */}
                {isTaskDropdownOpen &&
                  typeof document !== "undefined" &&
                  createPortal(
                    <div
                      data-dropdown="true"
                      onWheel={(e) => e.stopPropagation()}
                      style={getDropdownStyle(taskMenuRef, "left", 288)}
                      className="w-72 rounded-md border border-vscode-border bg-vscode-card p-2 shadow-2xl animate-in fade-in duration-100"
                    >
                      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-vscode-border">
                        <span className="text-caption font-bold uppercase tracking-wider text-vscode-muted">
                          Scan Task Profiles
                        </span>
                        <div className="flex items-center gap-1 text-caption">
                          <button
                            type="button"
                            onClick={handleSelectAllTasks}
                            className="text-severity-medium hover:underline cursor-pointer font-medium"
                            title="Select all 30 DAST engines"
                          >
                            All
                          </button>
                          <span className="text-vscode-border">|</span>
                          <button
                            type="button"
                            onClick={handleSelectPassiveTasks}
                            className="text-severity-low hover:underline cursor-pointer"
                            title="Select 15 passive reconnaissance engines"
                          >
                            Passive
                          </button>
                          <span className="text-vscode-border">|</span>
                          <button
                            type="button"
                            onClick={handleSelectActiveTasks}
                            className="text-severity-high hover:underline cursor-pointer"
                            title="Select 15 active fuzzing & vulnerability assessment engines"
                          >
                            Active
                          </button>
                          <span className="text-vscode-border">|</span>
                          <button
                            type="button"
                            onClick={handleClearAllTasks}
                            className="text-vscode-muted hover:text-vscode-fg cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      </div>

                      <div
                        className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1"
                        onWheel={(e) => e.stopPropagation()}
                      >
                        <div className="px-1 pt-1 pb-0.5 text-caption font-bold uppercase tracking-wider text-severity-low">
                          Passive Inspection (15 Engines)
                        </div>
                        {DAST_PASSIVE_TASKS.map((task) => {
                          const isChecked = selectedTasks.includes(task.id);
                          return (
                            <label
                              key={task.id}
                              className="flex items-start gap-2 p-1.5 rounded hover:bg-vscode-card-hover transition-colors cursor-pointer select-none"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleTask(task.id)}
                                className="mt-0.5 rounded border-vscode-border text-vscode-primary focus:ring-0 cursor-pointer"
                              />
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`text-xs font-semibold ${
                                      isChecked ? "text-vscode-fg" : "text-vscode-muted"
                                    }`}
                                  >
                                    {task.name}
                                  </span>
                                  <span className="rounded bg-vscode-header border border-vscode-border px-1 text-caption font-mono text-vscode-muted">
                                    {task.tool}
                                  </span>
                                </div>
                                <span className="text-caption text-vscode-muted leading-tight">
                                  {task.desc}
                                </span>
                              </div>
                            </label>
                          );
                        })}

                        <div className="px-1 pt-2 pb-0.5 text-caption font-bold uppercase tracking-wider text-severity-high border-t border-vscode-border mt-1">
                          Active Fuzzing & Exploitation (15 Engines)
                        </div>
                        {DAST_ACTIVE_TASKS.map((task) => {
                          const isChecked = selectedTasks.includes(task.id);
                          return (
                            <label
                              key={task.id}
                              className="flex items-start gap-2 p-1.5 rounded hover:bg-vscode-card-hover transition-colors cursor-pointer select-none"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleTask(task.id)}
                                className="mt-0.5 rounded border-vscode-border text-vscode-primary focus:ring-0 cursor-pointer"
                              />
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`text-xs font-semibold ${
                                      isChecked ? "text-vscode-fg" : "text-vscode-muted"
                                    }`}
                                  >
                                    {task.name}
                                  </span>
                                  <span className="rounded bg-vscode-header border border-vscode-border px-1 text-caption font-mono text-vscode-muted">
                                    {task.tool}
                                  </span>
                                </div>
                                <span className="text-caption text-vscode-muted leading-tight">
                                  {task.desc}
                                </span>
                              </div>
                            </label>
                          );
                        })}

                        <div className="px-1 pt-2 pb-0.5 text-caption font-bold uppercase tracking-wider text-vscode-muted border-t border-vscode-border mt-1">
                          Compatibility Aliases
                        </div>
                        {DAST_ALIASES.map((task) => {
                          const isChecked = selectedTasks.includes(task.id);
                          return (
                            <label
                              key={task.id}
                              className="flex items-start gap-2 p-1.5 rounded hover:bg-vscode-card-hover transition-colors cursor-pointer select-none opacity-85"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleTask(task.id)}
                                className="mt-0.5 rounded border-vscode-border text-vscode-primary focus:ring-0 cursor-pointer"
                              />
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className={`text-xs font-semibold ${
                                      isChecked ? "text-vscode-fg" : "text-vscode-muted"
                                    }`}
                                  >
                                    {task.name}
                                  </span>
                                  <span className="rounded bg-vscode-header border border-vscode-border px-1 text-caption font-mono text-vscode-muted">
                                    {task.tool}
                                  </span>
                                </div>
                                <span className="text-caption text-vscode-muted leading-tight">
                                  {task.desc}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>,
                    document.body,
                  )}
              </div>

              {/* Orchestrator Action Button */}
              <div className="flex items-center gap-2 shrink-0">
                {isOrchestratorScanning && orchestratorProgress && (
                  <span
                    className="text-xs font-mono text-severity-low"
                    title={orchestratorProgress.currentTask}
                  >
                    {orchestratorProgress.total > 0
                      ? `Running (${Math.max(1, Math.min(orchestratorProgress.completed, orchestratorProgress.total))}/${orchestratorProgress.total})`
                      : "Running…"}
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleTriggerOrchestratorScan}
                  disabled={isOrchestratorScanning || selectedTasks.length === 0 || targetValidation.status === "unsafe"}
                  aria-label="Scan Target"
                  title={
                    targetValidation.status === "unsafe"
                      ? `Target blocked: ${targetValidation.reason || targetValidation.message}`
                      : isOrchestratorScanning
                        ? "Scanning Target… (Pause)"
                        : "Start scan"
                  }
                  className="flex items-center justify-center rounded-md bg-[#107C41] hover:bg-[#0E6C38] active:bg-[#0A4D27] px-2.5 py-1.5 text-xs font-semibold text-white transition-colors shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isOrchestratorScanning ? (
                    <PauseIcon size={14} className="text-white" />
                  ) : (
                    <PlayIcon size={14} className="text-white" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Search Button, Bugs Focus Button, Architecture Options Dropdown, Flow Filter, and Right Section Toggle */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {/* Universal Quick Search Button */}
          {onOpenSearch && (
            <button
              type="button"
              onClick={onOpenSearch}
              title="Search files, folders, and issues (Cmd+K / Ctrl+K)"
              aria-label="Search files, folders, and issues"
              className="flex items-center gap-1.5 rounded-md border border-vscode-border bg-vscode-card hover:bg-vscode-card-hover hover:border-vscode-dim px-2 py-1 text-xs text-vscode-muted hover:text-vscode-fg transition-colors shadow-sm cursor-pointer"
            >
              <SearchIcon size={12} className="text-severity-medium shrink-0" />
              <span className="text-xs hidden md:inline font-medium">Search…</span>
              <kbd className="hidden sm:inline-flex items-center px-1.5 text-caption font-mono text-vscode-muted bg-vscode-bg border border-vscode-btn-secondary rounded">
                ⌘K
              </kbd>
            </button>
          )}

          {/* Integrated 2-Mode Switcher: Bug View vs Architecture Options */}
          <div className="flex items-center rounded-md border border-vscode-border bg-vscode-card p-0.5 shadow-sm">
            {/* 1. Bug & Vulnerability Mode Button */}
            <button
              type="button"
              onClick={() => {
                setIsWholeCodeOpen(false);
                onAnalysisPipelineModeChange?.("bugs");
                onSelectGraph?.("graph");
              }}
              title="Bugs & Vulnerability Analysis Pipeline (Focus View)"
              aria-label="Bugs & Vulnerabilities"
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                isBugModeActive
                  ? "bg-vscode-primary text-white shadow-sm font-semibold"
                  : "text-vscode-muted hover:text-vscode-fg hover:bg-vscode-card-hover font-medium"
              }`}
            >
              <ShieldAlertIcon
                size={13}
                className={isBugModeActive ? "text-white" : "text-severity-critical"}
              />
              <span>Bugs</span>
              {findingCount !== undefined && findingCount > 0 && (
                <span className="rounded-full bg-severity-critical-bg border border-severity-critical/50 px-1.5 text-caption font-mono text-severity-critical font-bold">
                  {findingCount}
                </span>
              )}
            </button>

            {/* 2. Whole Code Analysis Options Dropdown Button */}
            <div className="relative" ref={wholeCodeMenuRef}>
              <button
                type="button"
                onClick={() => {
                  if (isBugModeActive) {
                    onAnalysisPipelineModeChange?.("full");
                    const targetGraph =
                      selectedWholeCodeOption?.id ||
                      (activeMode === "orchestrator" ? "remote" : "unified");
                    onSelectGraph?.(targetGraph);
                  }
                  setIsWholeCodeOpen((prev) => !prev);
                }}
                title="Full Codebase Architecture & Unified Pipeline"
                aria-label="Whole Code Architecture"
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                  !isBugModeActive
                    ? "bg-vscode-primary text-white shadow-sm font-semibold"
                    : "text-vscode-muted hover:text-vscode-fg hover:bg-vscode-card-hover font-medium"
                }`}
              >
                <RadioIcon
                  size={13}
                  className={!isBugModeActive ? "text-white" : "text-[#4EC9B0]"}
                />
                <span className="text-xs truncate max-w-[80px] sm:max-w-[105px]">
                  {!isBugModeActive && selectedWholeCodeOption
                    ? selectedWholeCodeOption.category
                    : "Whole Code"}
                </span>
                <ChevronDownIcon
                  size={11}
                  className={`text-vscode-muted transition-transform duration-150 ${
                    isWholeCodeOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Whole Code Architecture Dropdown Menu */}
              {isWholeCodeOpen &&
                typeof document !== "undefined" &&
                createPortal(
                  <div
                    data-dropdown="true"
                    onWheel={(e) => e.stopPropagation()}
                    style={getDropdownStyle(wholeCodeMenuRef, "right", 288)}
                    className="w-72 rounded-lg border border-vscode-border bg-vscode-bg p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-100 font-sans max-h-96 overflow-y-auto"
                  >
                    <div className="px-2.5 py-1.5 text-caption font-bold uppercase tracking-wider text-vscode-muted border-b border-vscode-card-hover flex items-center justify-between">
                      <span>
                        {activeMode === "orchestrator"
                          ? "Whole Target Architecture"
                          : "Whole Code Architecture Diagrams"}
                      </span>
                      <span className="font-mono text-caption text-vscode-dim">
                        ({availableWholeCodeOptions.length})
                      </span>
                    </div>

                    <div className="flex flex-col gap-0.5 py-1">
                      {availableWholeCodeOptions.map((option) => {
                        const isSelected = !isBugModeActive && option.id === activeGraph;

                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => {
                              onAnalysisPipelineModeChange?.("full");
                              onSelectGraph?.(option.id);
                              setIsWholeCodeOpen(false);
                            }}
                            className={`flex items-start gap-2 p-1.5 rounded text-left transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-vscode-card-selected/60 border border-vscode-focus/50 text-vscode-fg font-semibold"
                                : "text-vscode-fg hover:bg-vscode-card-hover border border-transparent"
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">{option.icon}</div>
                            <div className="flex flex-col min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-semibold">{option.title}</span>
                                <span
                                  className={`rounded border px-1 text-caption font-mono font-medium ${option.badgeColor}`}
                                >
                                  {option.category}
                                </span>
                              </div>
                              <span className="text-caption text-vscode-muted leading-tight mt-0.5">
                                {option.subtitle}
                              </span>
                            </div>
                            {isSelected && (
                              <CheckIcon size={13} className="text-severity-medium shrink-0 mt-1" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Layout Direction section inside dropdown */}
                    <div className="border-t border-vscode-card-hover my-1" />
                    <div className="px-2 py-1 text-caption font-bold uppercase tracking-wider text-vscode-muted">
                      Layout Direction
                    </div>
                    <div className="flex gap-1 px-1">
                      <button
                        type="button"
                        onClick={() => {
                          onLayoutDirectionChange?.("DOWN");
                          setIsWholeCodeOpen(false);
                        }}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded text-xs cursor-pointer ${
                          layoutDirection === "DOWN"
                            ? "bg-vscode-card-selected text-vscode-fg font-semibold"
                            : "text-vscode-fg hover:bg-vscode-card-hover"
                        }`}
                      >
                        <RowsIcon size={12} className="text-severity-medium" />
                        <span>Top-to-Bottom</span>
                        {layoutDirection === "DOWN" && <CheckIcon size={11} className="text-vscode-focus" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onLayoutDirectionChange?.("RIGHT");
                          setIsWholeCodeOpen(false);
                        }}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1 px-2 rounded text-xs cursor-pointer ${
                          layoutDirection === "RIGHT"
                            ? "bg-vscode-card-selected text-vscode-fg font-semibold"
                            : "text-vscode-fg hover:bg-vscode-card-hover"
                        }`}
                      >
                        <ColumnsIcon size={12} className="text-severity-medium" />
                        <span>Left-to-Right</span>
                        {layoutDirection === "RIGHT" && <CheckIcon size={11} className="text-vscode-focus" />}
                      </button>
                    </div>

                    {onToggleHideTestFiles && (
                      <>
                        <div className="border-t border-vscode-card-hover my-1" />
                        <button
                          type="button"
                          onClick={onToggleHideTestFiles}
                          title="Test suites often dominate a codebase's file count -- hide them to focus the architecture graph on application code"
                          className="flex w-full items-center justify-between px-2 py-1.5 rounded text-xs text-left cursor-pointer text-vscode-fg hover:bg-vscode-card-hover"
                        >
                          <span>Hide test files</span>
                          <span
                            className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors ${
                              hideTestFiles ? "bg-vscode-focus" : "bg-vscode-btn-secondary"
                            }`}
                          >
                            <span
                              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                              hideTestFiles ? "translate-x-3.5" : "translate-x-0.5"
                            }`}
                            />
                          </span>
                        </button>
                      </>
                    )}
                  </div>,
                  document.body,
                )}
            </div>
          </div>

          {/* Graph View Mode Filter (All vs Selected) - Compact */}
          <div className="flex items-center rounded border border-vscode-border bg-vscode-card p-0.5">
            <button
              type="button"
              onClick={() => onGraphViewModeChange?.("all")}
              title="All Flows"
              aria-label="All Flows"
              className={`p-1 rounded transition-colors cursor-pointer flex items-center justify-center ${
                graphViewMode === "all"
                  ? "bg-vscode-primary text-white shadow-sm"
                  : "text-vscode-muted hover:text-vscode-fg hover:bg-vscode-card-hover"
              }`}
            >
              <NetworkIcon size={13} />
            </button>
            <button
              type="button"
              onClick={() => onGraphViewModeChange?.("selected")}
              title="Selected Flow"
              aria-label="Selected Flow"
              className={`p-1 rounded transition-colors cursor-pointer flex items-center justify-center ${
                graphViewMode === "selected"
                  ? "bg-vscode-primary text-white shadow-sm"
                  : "text-vscode-muted hover:text-vscode-fg hover:bg-vscode-card-hover"
              }`}
            >
              <FocusIcon size={13} />
            </button>
          </div>


          {/* Layout Controls: Left (Primary) Side Bar & Right (Secondary) Section */}
          {(onToggleLeftSidebar || onToggleRightSection) && (
            <div className="flex items-center rounded border border-vscode-border bg-vscode-card p-0.5 gap-0.5">
              {onToggleLeftSidebar && (
                <button
                  type="button"
                  onClick={onToggleLeftSidebar}
                  title={isLeftSidebarOpen ? "Hide Primary Side Bar" : "Show Primary Side Bar"}
                  aria-label={isLeftSidebarOpen ? "Hide Primary Side Bar" : "Show Primary Side Bar"}
                  className={`flex items-center justify-center p-1 rounded transition-colors cursor-pointer ${
                    isLeftSidebarOpen
                      ? "bg-vscode-primary text-white shadow-sm"
                      : "text-vscode-muted hover:text-vscode-fg hover:bg-vscode-card-hover"
                  }`}
                >
                  <PanelLeftIcon size={13} />
                </button>
              )}

              {onToggleRightSection && (
                <button
                  type="button"
                  onClick={onToggleRightSection}
                  title={isRightSectionOpen ? "Hide Right Section" : "Show Right Section"}
                  aria-label={isRightSectionOpen ? "Hide Right Section" : "Show Right Section"}
                  className={`flex items-center justify-center p-1 rounded transition-colors cursor-pointer ${
                    isRightSectionOpen
                      ? "bg-vscode-primary text-white shadow-sm"
                      : "text-vscode-muted hover:text-vscode-fg hover:bg-vscode-card-hover"
                  }`}
                >
                  <PanelRightIcon size={13} />
                </button>
              )}

            </div>
          )}

          {/* Download Report: its own pill, separate from the sidebar/panel toggles */}
          {onDownloadReport && (
            <div className="relative" ref={downloadMenuRef}>
              <button
                type="button"
                onClick={() => setIsDownloadMenuOpen((prev) => !prev)}
                title="Download Scan Report"
                aria-label="Download Report"
                aria-expanded={isDownloadMenuOpen}
                className={`flex items-center gap-1 rounded border border-vscode-border p-1 transition-colors cursor-pointer ${
                  isDownloadMenuOpen
                    ? "bg-vscode-primary text-white shadow-sm border-vscode-primary"
                    : "bg-vscode-card text-vscode-muted hover:text-vscode-fg hover:bg-vscode-card-hover"
                }`}
              >
                <DownloadIcon size={13} />
              </button>

              {isDownloadMenuOpen &&
                typeof document !== "undefined" &&
                createPortal(
                  <div
                    data-dropdown="true"
                    onWheel={(e) => e.stopPropagation()}
                    style={getDropdownStyle(downloadMenuRef, "right", 224)}
                    className="w-56 rounded-lg border border-vscode-border bg-vscode-bg p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-100 font-sans"
                  >
                    <div className="px-2 py-1 text-caption font-semibold uppercase tracking-wider text-vscode-dim">
                      Download Report
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsDownloadMenuOpen(false);
                        onDownloadReport("md");
                      }}
                      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-vscode-fg hover:bg-vscode-card-hover transition-colors cursor-pointer"
                    >
                      <FileCodeIcon size={13} className="text-severity-medium" />
                      Markdown (.md)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsDownloadMenuOpen(false);
                        onDownloadReport("pdf");
                      }}
                      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-vscode-fg hover:bg-vscode-card-hover transition-colors cursor-pointer"
                    >
                      <FileCodeIcon size={13} className="text-[#3FB950]" />
                      PDF document
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsDownloadMenuOpen(false);
                        onDownloadReport("sarif");
                      }}
                      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-vscode-fg hover:bg-vscode-card-hover transition-colors cursor-pointer"
                    >
                      <FileCodeIcon size={13} className="text-[#4EC9B0]" />
                      SARIF report (.sarif)
                    </button>
                    <div className="mt-0.5 border-t border-vscode-border px-2 pt-1.5 text-caption text-vscode-dim">
                      Opens a preview before the file is saved.
                    </div>
                  </div>,
                  document.body,
                )}
            </div>
          )}
        </div>
      </div>

      {/* Right overflow shadow */}
      {showRightShadow && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-vscode-header via-vscode-header/80 to-transparent z-30 transition-opacity duration-200"
        />
      )}
    </header>
  );
}
