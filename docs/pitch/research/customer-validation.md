# Customer Validation and Evidence

Evidence levels used everywhere in this project:

| Label | Meaning |
|---|---|
| **VERIFIED** | Reproduced or observed by us during this project, with files in `../evidence/` |
| **PUBLIC** | Visible on a public registry or API (snapshot date given) |
| **FOUNDER-REPORTED** | Stated by the founder; no supporting artifact reviewed yet |
| **QUALITATIVE** | A person's opinion or experience, not measured |

## 1. Case study: security weakness at an Indian tech company (1005 Labs)

**Status of the claim: FOUNDER-REPORTED. Supporting artifacts have not been reviewed.**

| Field | What we know | Evidence level |
|---|---|---|
| Company | 1005 Labs | Founder-reported |
| Issue | A PostgreSQL credential security weakness that appeared susceptible to compromise | Founder-reported |
| Discovery method | Testing with Codefy | Founder-reported |
| Investigation and tracking | Founder investigated and tracked the issue | Founder-reported |
| Reporting | Founder emailed the company's CTO | Founder-reported |
| Response | The CTO replied with thanks ("Thank you for helping us") | Founder-reported; a thank-you is not a remediation confirmation |
| Remediation | Founder indicated a fix was confirmed | Founder-reported; **no message confirming it has been reviewed** |
| Authorization to test | **Not established.** No prior written scope or permission has been shown; the CTO's thank-you came after the report | Open |
| Permission to name the company publicly | **Not established** | Open |
| Exploitation | **Not claimed.** The finding is described as a weakness that appeared susceptible, which is all the evidence supports | n/a |

**Repo search:** the term "1005" or "1005 Labs" appears in no repository (all seven searched), so no internal artifact exists in code.

**How the deck uses it:** the company is **anonymised** ("an Indian tech startup") and the card is badged FOUNDER-REPORTED. The deck says "reported to the CTO, who responded with thanks" and does **not** say "remediated".

**What is needed to upgrade it** (all redacted before use; never publish credentials, tokens, IPs or infrastructure details):
1. The disclosure email, with names, hosts and any secret values removed.
2. The Codefy scan output that surfaced the issue (secret values replaced by `***REDACTED***`, as Codefy already does).
3. The message confirming the fix, if one exists.
4. A one-line written permission from 1005 Labs to be named. Without it, keep the anonymised wording.
5. Whatever authorization existed before testing (an engagement email, a bug-bounty scope, an invitation). If none existed, keep the story in the deck as "responsible disclosure" and consider getting the CTO's written consent to reference it.

## 2. Early users

| Metric | Value | Level | Notes |
|---|---|---|---|
| Active users | "approximately 5–10" | **FOUNDER-REPORTED** | No analytics exist in the product (no usage telemetry is wired up; the gateway's `/developer/usage` is not called by any app). The user list lives in Firebase/auth backends that were not queried. |
| VS Code Marketplace `Mickey20.codefy-whoami` | 4 installs, downloadCount 135, no ratings, version **0.2.0**, last updated 2026-10-02 | **PUBLIC** (snapshot 2026-11-20 ≈16:28 UTC) | Repo is at 0.3.1, so the published version is behind. downloadCount includes updates and automated downloads. |
| Open VSX | Not published | PUBLIC | The release workflow skips publishing when `OVSX_PAT` is unset. |
| npm `@mickey20/codefy` | 956 downloads in the first 4 days (created 2026-11-16: 537, 76, 297, 46 per day); versions 0.0.0-stage to 1.1.1 | **PUBLIC** | Counts include CI, mirrors and bots. Not unique users. |
| Founder's own desktop history | 20 scan sessions, 2 workspaces, 246 findings (13 offline, 6 cloud SAST, 1 orchestrator) over ≈27 days | **VERIFIED** (local file) | One machine, one person: proves the product works for its builder, not adoption. Of the 246 findings, 156 are "SSRF, needs-verification", which shows a noise problem on large codebases. |
| Retention, projects, feedback | Not available | n/a | Needs a survey or analytics. |

**The deck states:** "5–10 active users (founder-reported)" next to the PUBLIC counts, and does not describe either as customers.

## 3. QA tester comparison

**Claim:** a senior QA tester said manually finding and investigating a bug and validating its exploitability takes about 2–3 days in their workflow; in an observed Codefy test the relevant issue was identified in about one second.

| Element | Detail | Level |
|---|---|---|
| Manual process | 2–3 days to find, investigate and validate exploitability | **QUALITATIVE** (one tester's estimate; process and bug type not documented) |
| Codefy observation | Issue identified in ≈1 s | **FOUNDER-REPORTED** (original test input, environment and repetitions not recorded) |
| What the 1 s measures | Detection of a candidate issue. It does **not** include exploit validation, triage or fixing. | Scope limit |

**Independent measurements we made on 2026-11-20** (Apple M5, 16 GB, Node 26; scripts in `../evidence/scripts/`):

| Measurement | Result | Level |
|---|---|---|
| Local engine, 10 fixture files (5 rules × vulnerable/safe), 20 runs each | median 0.21–0.44 ms per file, p95 ≤ 1.11 ms; 5/5 vulnerable fixtures flagged, 0/5 safe fixtures flagged | **VERIFIED** |
| Local engine, 40 TS files / 10,116 LOC (the CLI source) | 126 ms total, median 2.27 ms per file, p95 7.92 ms | **VERIFIED** |
| Desktop app UI, 7-file demo project | "Scan complete in 0s" (app's own log) | **VERIFIED** |
| Cloud SAST via CLI, same demo project | 94 s end to end (semgrep, gitleaks, trufflehog, trivy), including queue and free-tier cold start | **VERIFIED** |
| Cloud passive DAST, public site header check | Completed in under 1 minute; 2 low findings; both confirmed independently with `curl` (CSP and X-Content-Type-Options absent) | **VERIFIED** |

**Honest reading:** sub-second detection is real for the patterns the local engine covers. It does not mean "every vulnerability in one second", and it does not mean exploitability was validated.

### Seeded-issue mini-test (n = 5, illustrative only)

A 7-file Express demo app with 5 deliberate issues (`../evidence/demo-payments-api/`):

| Seeded issue | Local engine | Cloud SAST (semgrep/gitleaks) |
|---|---|---|
| Hard-coded AWS key (AWS's documented example key) | Found | Found |
| Command injection (`exec`) | Found | Found |
| SSRF (`fetch(req.body.url)`) | Found | **Missed** |
| Path traversal (`readFileSync(path.join(..., req.query.file as string))`) | **Missed** | Found |
| SQL injection (`db.query` after string concatenation) | **Missed** | **Missed** |

- Local: 3 of 5. Cloud: 3 of 5. **Combined: 4 of 5.** SQL injection was missed by both.
- The cloud scan also reported 1 finding we did not seed (XSS on `res.send`), which we did not verify as a true or false positive.
- Local misses trace to pattern gaps: the rule did not follow `req.query.x as string` or a sink inside `await db.query(...)`. These are real engine gaps and are listed in `../README.md`.
- n = 5 on a toy project proves nothing about accuracy. It supports exactly one statement: running two engines found more than either alone, consistent with the literature on tool combination (Lipp et al., ISSTA 2022; see `academic-research.md`).

## 4. BugBound (exploit-validation engine): what exists

BugBound's own report shows 10 verified vulnerabilities on its **own deliberately vulnerable benchmark app**, and `bugbound_axtion_report.json` shows 0 findings against a local copy of the website. There is **no precision/recall measurement on any third-party application**. It is not integrated into the desktop app (the PoC button returns "unavailable" or a simulated result). The deck therefore lists validation as "Next", not "Now".
