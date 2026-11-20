---
name: security-auditor
description: Performs deterministic static security analysis, dependency vulnerability checks, secret scanning, and dangerous code pattern detection across application source code. Use when auditing codebases, analyzing attack surfaces, checking for OWASP Top 10 vulnerabilities, or assessing source-to-sink data flow.
---

# Security Auditor Skill

This skill provides an evidence-driven, deterministic static application security testing (SAST) workflow for identifying vulnerabilities in source code before dynamic testing. It implements the static analysis and data-flow mapping principles defined in the BugBound architecture.

## Workflow Pipeline

```text
Source Code
   ├── 1. Dependency Analysis (CVEs, unmaintained/vulnerable packages)
   ├── 2. Secret & Credential Scanning (API keys, JWT secrets, database credentials)
   └── 3. Source-to-Sink Data Flow Analysis (SQLi, Command Injection, SSRF, Deserialization)
            ↓
       Candidate Findings Corpus
```

---

## 1. Dependency Analysis

Audit direct and transitive dependencies for known vulnerabilities:

1. **Python (`requirements.txt`, `pyproject.toml`, `Pipfile`)**:
   - Inspect versions against known CVE databases.
   - Run audit commands if tooling is available:
     ```bash
     pip audit || safety check
     ```
   - Check for unpinned dependencies or unsafe version ranges (`>=`).

2. **Node.js (`package.json`, `package-lock.json`, `pnpm-lock.yaml`)**:
   - Check dependencies using npm or yarn:
     ```bash
     npm audit --json
     ```

---

## 2. Deterministic Secret Scanning

Scan the repository for hardcoded secrets, cryptographic keys, and tokens.

### Patterns to Detect
- **JWT / Session Secrets**: `JWT_SECRET`, `SECRET_KEY`, `APP_SECRET`
- **Cloud & API Credentials**: AWS keys (`AKIA...`), Google API keys (`AIza...`), Stripe, GitHub personal access tokens
- **Database Credentials**: Hardcoded URIs (`postgres://user:pass@host/db`)
- **Private Keys**: `-----BEGIN PRIVATE KEY-----`, `-----BEGIN RSA PRIVATE KEY-----`

### Using the Bundled Secret Scanner Helper
Run the bundled script to quickly flag high-confidence secret leaks:
```bash
python3 .agents/skills/security-auditor/scripts/scan_secrets_sinks.py --path .
```

---

## 3. Dangerous Code Patterns & Source-to-Sink Analysis

Never report a vulnerability without tracing the complete data flow. Identify the **Source** (user input), **Transformation**, and **Sink** (execution point).

### Common Vulnerability Classes & Dangerous Sinks

| Vulnerability | Common Sinks | Safe Counterparts |
| :--- | :--- | :--- |
| **SQL Injection** | `cursor.execute(f"...")`, `db.execute(query + id)` | Parameterized queries, ORM query builders |
| **Command Injection** | `os.system()`, `subprocess.Popen(..., shell=True)` | `subprocess.run([...], shell=False)` |
| **Path Traversal** | `open(f"/uploads/{filename}")`, `send_file(path)` | `os.path.abspath` validation, path containment checks |
| **Unsafe Deserialization** | `pickle.loads()`, `yaml.load(..., Loader=Loader)` | `yaml.safe_load()`, `json.loads()` |
| **SSRF** | `requests.get(user_provided_url)`, `httpx.get()` | Strict domain allowlists, IP validation, blocking private IPs |

See [sinks_checklist.md](./references/sinks_checklist.md) for the exhaustive checklist across languages.

---

## 4. Candidate Finding Output Schema

When a dangerous sink or secret leak is identified, record it in the standard candidate structure:

```json
{
  "finding_type": "SOURCE_TO_SINK_FLOW",
  "category": "SQL_INJECTION",
  "severity": "HIGH",
  "source": {
    "parameter": "user_id",
    "entry_point": "GET /api/users/{id}",
    "file": "controllers/users.py",
    "line": 42
  },
  "transformation": "f-string formatting",
  "sink": {
    "function": "cursor.execute",
    "file": "repositories/user_repo.py",
    "line": 88
  },
  "status": "CANDIDATE",
  "remediation": "Replace formatted SQL string with parameterized query: cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))"
}
```

