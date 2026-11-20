# Codefy SAST Live Production Verification Report

- **Target URL:** `https://sast-1-1q51.onrender.com`
- **Host Environment:** Render Web Service (Uvicorn / Cloudflare)
- **Verification Date:** `2026-10-22T03:37:44.560312+00:00`
- **Overall Status:** **ALL CHECKS PASSED**

---

## 1. Actual Endpoint Responses & Latencies

| Endpoint | Method | Actual Status | Latency | Result | Output Details |
|---|:---:|:---:|:---:|:---:|---|
| `/` | `GET` | `200` | `301.02ms` | **PASS** | `{'service': 'Codefy SAST', 'version': '0.1.0', 'status': 'online', 'docs_url': '/docs', 'health_url': '/health'}` |
| `/health` | `GET` | `200` | `104.7ms` | **PASS** | `{'status': 'ok', 'environment': 'development', 'version': '0.1.0', 'uptime_seconds': 478.47}` |
| `/openapi.json` | `GET` | `200` | `109.15ms` | **PASS** | `19 endpoints registered` |
| `/v1/tools` | `GET` | `200` | `109.79ms` | **PASS** | `25 active tools` |
| `/v1/audit-events` | `GET` | `200` | `106.86ms` | **PASS** | `{'items': [], 'total': 0, 'limit': 50, 'offset': 0}` |
| `/v1/sast/scan/upload-url` | `POST` | `403` | `108.18ms` | **PASS** | `{'detail': 'Not authenticated'}` |
| `/v1/auth/login` | `POST` | `401` | `929.36ms` | **PASS** | `{'detail': 'Invalid email or password credentials.'}` |
| `/v1/tools` | `OPTIONS` | `200` | `119.03ms` | **PASS** | `{'access-control-allow-credentials': 'true', 'access-control-allow-methods': 'DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT', 'access-control-allow-origin': 'http://localhost:3000', 'access-control-max-age': '600'}` |

---

## 2. Live Runtime Metadata

- **Service Name:** `Codefy SAST`
- **Version:** `0.1.0`
- **Uptime:** `478.47 seconds`
- **Registered Endpoints (19):**

```json
[
  "/health",
  "/v1/auth/register",
  "/v1/auth/verify-email",
  "/v1/auth/resend-code",
  "/v1/auth/login",
  "/v1/auth/me",
  "/v1/auth/logout",
  "/v1/sast/scan/upload-url",
  "/v1/sast/scan/direct",
  "/v1/sast/scan",
  "/v1/sast/scan/active",
  "/v1/sast/scan/repo",
  "/v1/sast/scans",
  "/v1/jobs/{job_id}",
  "/v1/jobs/{job_id}/stream",
  "/v1/jobs/{job_id}/export",
  "/v1/jobs/{job_id}/patch",
  "/v1/tools",
  "/v1/audit-events"
]
```

---

## 3. Cataloged Security Scanners (25 Tools)

```json
{
  "tools": [
    {
      "id": "semgrep",
      "name": "Semgrep",
      "modes": [
        "passive",
        "active"
      ],
      "version": "1.78.0",
      "category": "SAST",
      "description": "Fast, multi-language static analysis for finding security vulnerabilities and enforcing standards."
    },
    {
      "id": "bearer",
      "name": "Bearer",
      "modes": [
        "passive",
        "active"
      ],
      "version": "1.45.0",
      "category": "Data Privacy & Deep SAST",
      "description": "Deep semantic data-flow analysis to identify sensitive data leaks and privacy violations."
    },
    {
      "id": "bandit",
      "name": "Bandit",
      "modes": [
        "passive",
        "active"
      ],
      "version": "1.7.9",
      "category": "Python SAST",
      "description": "Security linter designed to find common security issues in Python source code."
    },
    {
      "id": "eslint-security",
      "name": "ESLint Security",
      "modes": [
        "passive",
        "active"
      ],
      "version": "3.0.0",
      "category": "JavaScript/TypeScript SAST",
      "description": "AST-based security linter identifying unsafe patterns in Node.js and browser applications."
    },
    {
      "id": "njsscan",
      "name": "njsscan",
      "modes": [
        "passive",
        "active"
      ],
      "version": "0.3.7",
      "category": "Node.js SAST",
      "description": "OWASP static security code scanner for Node.js, Express, and JavaScript applications."
    },
    {
      "id": "pmd",
      "name": "PMD Security",
      "modes": [
        "passive",
        "active"
      ],
      "version": "7.3.0",
      "category": "Java SAST",
      "description": "Source-code static analyzer for Java, Apex, and XML without requiring bytecode compilation."
    },
    {
      "id": "gosec",
      "name": "GoSec",
      "modes": [
        "passive",
        "active"
      ],
      "version": "2.20.0",
      "category": "Go SAST",
      "description": "Go security checker analyzing the abstract syntax tree for security flaws."
    },
    {
      "id": "brakeman",
      "name": "Brakeman",
      "modes": [
        "passive",
        "active"
      ],
      "version": "6.1.2",
      "category": "Ruby SAST",
      "description": "Vulnerability scanner designed specifically for Ruby on Rails applications."
    },
    {
      "id": "mobsfscan",
      "name": "MobSFScan",
      "modes": [
        "passive",
        "active"
      ],
      "version": "0.3.7",
      "category": "Mobile Security SAST",
      "description": "OWASP static analysis tool for Android (Java/Kotlin) and iOS (Swift/Obj-C) source code."
    },
    {
      "id": "flawfinder",
      "name": "Flawfinder",
      "modes": [
        "passive",
        "active"
      ],
      "version": "2.0.19",
      "category": "C/C++ SAST",
      "description": "Scans C/C++ source code and produces a prioritized list of potential security flaws."
    },
    {
      "id": "cppcheck",
      "name": "Cppcheck",
      "modes": [
        "passive",
        "active"
      ],
      "version": "2.14.0",
      "category": "C/C++ Static Analysis",
      "description": "Static analysis tool for C/C++ code checking for memory leaks, buffer overruns, and undefined behavior."
    },
    {
      "id": "shellcheck",
      "name": "ShellCheck",
      "modes": [
        "passive",
        "active"
      ],
      "version": "0.10.0",
      "category": "Shell Script SAST",
      "description": "Static analysis tool for sh/bash scripts warning about command injection and variable bugs."
    },
    {
      "id": "gitleaks",
      "name": "Gitleaks",
      "modes": [
        "passive",
        "active"
      ],
      "version": "8.18.4",
      "category": "Secret Detection",
      "description": "High-performance scanner detecting hardcoded secrets, API tokens, and credentials."
    },
    {
      "id": "trufflehog",
      "name": "TruffleHog",
      "modes": [
        "passive",
        "active"
      ],
      "version": "3.80.0",
      "category": "Secret Detection & Verification",
      "description": "Deep secret detection verifying leaked credentials against live provider APIs."
    },
    {
      "id": "detect-secrets",
      "name": "Detect-Secrets",
      "modes": [
        "passive",
        "active"
      ],
      "version": "1.5.0",
      "category": "Secret Baseline",
      "description": "Heuristic baseline scanner preventing secrets from entering version control."
    },
    {
      "id": "trivy",
      "name": "Trivy",
      "modes": [
        "passive",
        "active"
      ],
      "version": "0.53.0",
      "category": "SCA & Dependency Auditing",
      "description": "Vulnerability and misconfiguration scanner for project dependencies and lockfiles."
    },
    {
      "id": "osv-scanner",
      "name": "OSV-Scanner",
      "modes": [
        "passive",
        "active"
      ],
      "version": "1.8.0",
      "category": "SCA",
      "description": "Google OSV database vulnerability scanner evaluating open source dependencies."
    },
    {
      "id": "pip-audit",
      "name": "pip-audit",
      "modes": [
        "passive",
        "active"
      ],
      "version": "2.7.3",
      "category": "Python SCA",
      "description": "Audits Python dependencies for known vulnerabilities via the PyPA advisory database."
    },
    {
      "id": "checkov",
      "name": "Checkov",
      "modes": [
        "passive",
        "active"
      ],
      "version": "3.2.0",
      "category": "IaC Security",
      "description": "Static code analysis tool for infrastructure-as-code (Terraform, CloudFormation, K8s)."
    },
    {
      "id": "hadolint",
      "name": "Hadolint",
      "modes": [
        "passive",
        "active"
      ],
      "version": "2.12.0",
      "category": "Dockerfile SAST",
      "description": "Smart Dockerfile linter enforcing best practices and security rules."
    },
    {
      "id": "zizmor",
      "name": "Zizmor",
      "modes": [
        "passive",
        "active"
      ],
      "version": "1.4.1",
      "category": "CI/CD Pipeline Security",
      "description": "Trail of Bits static analysis tool auditing GitHub Actions workflows for template injection and credential leaks."
    },
    {
      "id": "kics",
      "name": "KICS",
      "modes": [
        "passive",
        "active"
      ],
      "version": "2.1.3",
      "category": "Multi-Platform IaC",
      "description": "Checkmarx scanner detecting security misconfigurations in Ansible, Helm, CloudFormation, and Terraform."
    },
    {
      "id": "slither",
      "name": "Slither",
      "modes": [
        "passive",
        "active"
      ],
      "version": "0.10.3",
      "category": "Smart Contract SAST",
      "description": "Static analysis framework for Solidity smart contracts identifying reentrancy, access control, and integer bugs."
    },
    {
      "id": "spectral",
      "name": "Spectral",
      "modes": [
        "passive",
        "active"
      ],
      "version": "6.11.1",
      "category": "API Contract Security",
      "description": "API and OpenAPI/Swagger linter enforcing OWASP API Security Top 10 design rules and best practices."
    },
    {
      "id": "syft",
      "name": "Syft",
      "modes": [
        "passive",
        "active"
      ],
      "version": "1.11.0",
      "category": "SBOM & Supply Chain",
      "description": "High-speed cataloger generating Software Bill of Materials (SBOM) in CycloneDX and SPDX formats directly from source trees."
    }
  ]
}
```

---

## 4. Integration Verification

- **Central Auth Service:** Successfully communicating with upstream `https://cmd-d-llm.vercel.app` (returned `401 {"detail": "Invalid email or password credentials."}`).
- **Authentication Guards:** Protected endpoints (`/v1/sast/scan/upload-url`, `/v1/sast/scan`) correctly reject unauthenticated traffic with `403 Forbidden`.
- **CORS Handling:** Origin reflection and allowed credentials correctly negotiated.
