# Product Roadmap: Now, Next, Future

Only **NOW** describes things that exist. **NEXT** and **FUTURE** are proposals.

## NOW (verified, see `../README.md`)

- Local engine: JS/TS (5 rules) and Python (5 rules) taint tracing within a function; secret detection (3 patterns + entropy); 24 syntax-error grammars.
- Desktop (Tauri), VS Code extension and CLI (npm `@mickey20/codefy` 1.1.1) with a 24-tool MCP server.
- Cloud SAST (semgrep, gitleaks, trufflehog, trivy and others: 25 catalogued, ~10 installed on the Render worker) and passive DAST checks, run live on 2026-11-20.
- Six attack-path graph views; Markdown, PDF and SARIF export (SARIF for cloud jobs).
- Local scan history. Chat via a hosted gateway with a local fallback.

## NEXT: evidence graph + reasoning layer ("JEV")

The founder's specified flow (provided in this session; the acronym "JEV" appears in no repository and its expansion is not documented, so it is kept as the founder's name for this layer):

```
SAST / DAST / SCA / Secrets findings
        │
        ▼
   Evidence Graph  ──►  Relationship & Data-flow Analysis  ──►  Attack-Path Hypothesis
                                                                      │
                                                                      ▼
                            Research Engine  ──►  AI Security Reasoning
                                                                      │
                                                                      ▼
                    Deterministic Validation  ──►  Verified Security Report
                                                                      │
                                                                      ▼
                                   Fix Proposal  ──►  Rescan & Regression Tests
```

**Responsibilities (proposed)**

| Stage | Owner | Notes |
|---|---|---|
| Normalise findings into one graph (nodes: code locations, endpoints, secrets, dependencies; edges: flows, calls, exposes) | Deterministic code | Extends the existing `WorkspaceGraph` and canonical issue schema (`SAST/v3.md`) |
| Relationship and data-flow analysis; attack-path hypotheses | Deterministic code first, LLM second | LLM only gets a narrow question about one path |
| AI reasoning (explain, rank, suggest related issues, draft fix) | LLM, narrow prompts, schema-validated output | The literature supports this split: LLM hybrids beat open-ended LLM audits (IRIS, LLift); open-ended LLM vulnerability detection is near-random on realistic data (Ding et al., ICSE 2025) |
| Deterministic validation | Existing BugBound-style oracle (ASGI replay, pytest generation) | A "validated" label must depend on a check tied to the vulnerability itself; one 2026 preprint found many LLM exploits passed runtime checks without triggering the bug |
| Report, fix proposal, rescan | Deterministic | Rescan proves the fix; regression test locks it |

**Output schema (proposal):** `{finding_id, evidence[], path[], hypothesis, llm_rationale, validation:{status: confirmed|refuted|inconclusive, check_id, artifact}, severity, fix:{diff, rescan_result}}`. A finding is `confirmed` only when validation produced an artifact.

**Failure handling:** LLM unavailable or schema-invalid → finding stays `needs-verification` (already the repo's rule, `CLAUDE.md`). No LLM verdict ever upgrades a finding without a deterministic check.

**Confidence:** report the validation status, not a numeric LLM score; calibrate any score against the benchmark below before showing it.

**Evaluation framework (required before claiming accuracy)**

| Metric | How |
|---|---|
| Precision, recall, FP rate, FN rate | OWASP Benchmark, Juliet, PrimeVul/CVEfixes for SAST; OWASP Juice Shop, crAPI, DVWA for DAST; report per CWE |
| Detection latency | Existing harness (`../evidence/scripts/bench.mjs`) |
| Validation success rate | Share of `confirmed` findings reproducing on a clean checkout |
| Remediation correctness | Patch applies, tests pass, rescan clears the finding |
| Baselines | Semgrep alone, local engine alone, combined |

## FUTURE: guarded reconnaissance and validation

Modules: asset discovery, scope validation, service and endpoint discovery, technology fingerprinting, application mapping, authentication and authorization testing, vulnerability identification, controlled exploit validation, evidence collection, risk classification, remediation, report generation.

**Safety requirements (all must exist before any active module ships):** explicit written authorization and scope enforcement per target; rate limits; isolated test execution; immutable audit log; secret redaction; human approval for destructive operations; **an emergency stop (no kill switch exists in any repo today)**; safe-test policies. Axiom already enforces authorization references and blocks private/metadata targets; DAST does not verify ownership.

**QA-oriented workflows:** regression tests generated from confirmed findings (BugBound produces `test_regression.py`).

## Status of "Kafka and Temporal"

The `pipeline` repo defines a Kafka + Temporal control plane. **Neither runs anywhere**: Kafka appears only as config and a dependency, Temporal modules are empty files, scans are stored in memory, and milestone tracking shows 0 of 10 done. Treat it as design only. Celery + Redis is the real job system today.

## Global

India → UAE → Singapore → UK → USA → EU (see `india-gtm-strategy.md` §5).
