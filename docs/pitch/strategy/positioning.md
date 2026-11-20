# Positioning

Every statement below is limited to what `../README.md` (the implementation audit) and `../research/` support.

## Messaging

| Item | Text |
|---|---|
| One line | Codefy runs code scanning, secret detection and web-app scanning from one workflow (editor, desktop, CLI), and shows each finding as a traced attack path. |
| Website headline | Find the vulnerability. See the path. Ship the fix. |
| Subheadline | Scan locally with no code leaving your machine, add cloud SAST and DAST when you need them, and gate your CI. Built for Indian engineering teams, priced in rupees. |
| 30-second pitch | Most Indian startups find out about security bugs from a customer questionnaire or a ₹40,000–₹1.5 lakh pentest weeks later. Codefy puts the scan where developers already work: in VS Code, a desktop app or one CLI command. It traces user input to dangerous code, runs open-source scanners in the cloud, and exports SARIF for CI. Local scanning is free and offline. We are early, with a handful of users, and we are looking for teams to pilot it. |
| 60-second founder pitch | Verizon's 2026 report found vulnerability exploitation is now the number-one way breaches start, and IBM puts the average Indian breach at ₹25.5 crore. Small teams still depend on occasional pentests. I built Codefy so a developer can find and understand a vulnerability in seconds, on their own machine. A local engine traces JS/TS and Python input to risky sinks and finds secrets, with no upload. When you need more, the same tool runs Semgrep, Gitleaks, Trivy and web-app checks in the cloud and exports SARIF. Every finding opens as a graph showing how it propagates. Today it works for its builder and a handful of early users. It does not yet validate exploits, and it has gaps: it found 3 of 5 issues we planted, and 4 of 5 together with the cloud engine. We are fixing those and are looking for pilot teams. |
| Investor angle | An India-first AppSec tool at roughly one-fifth of incumbent per-team list prices (proposed), whose cost is dominated by fixed infrastructure (≈₹10.5k/month at MVP). The risks are depth, trust and distribution, not unit cost. |
| Customer angle | A free, offline first scan; a paid tier priced for a ten-person team. |

**Phrases deliberately avoided:** "zero false positives", "<300 ms per keystroke", "Gemini", "AST-validated 1-click fix", "Excalidraw", "55 engines", "revolutionising security". None is supported by the code (see `../README.md`).

## The seven positioning questions

| Question | Evidence-based answer |
|---|---|
| Why Codefy over **Snyk**? | Price for a small team (proposed ₹4,999/month for 10 devs vs ₹23,337 list for Snyk Team) and a free offline local scan. Snyk is far more mature (SCA, IDE, Agent Fix, Enterprise AI pentesting). Not a feature win. |
| Over **Semgrep**? | Semgrep Code is free for up to 10 contributors, so price is not the reason. Codefy adds DAST and attack-path graphs in the same tool. Semgrep has a much larger rule set. A developer who wants only SAST should use Semgrep, and Codefy already runs it on the cloud side. |
| Over **CodeRabbit**? | They are different categories. CodeRabbit is AI pull-request review, not a vulnerability scanner. Complementary. |
| Over traditional QA workflows? | The QA tester's 2–3 day estimate is qualitative. Codefy automates *detection* of covered issue classes in seconds, but does not yet validate exploitability. It shortens the discovery step only. |
| Over outsourcing to a VAPT firm? | A VAPT is ₹40k–₹1.5 L per application per engagement and is required for some regulators (CERT-In-empanelled auditors for SEBI CSCRF). Codefy is not a substitute for that audit. It reduces what the auditor finds and gives continuous coverage between audits. |
| What does Codefy combine that others don't? | Offline local engine + cloud SAST + DAST + secrets + MCP/CLI in one product, at a startup price. Aikido is the closest unified competitor (SAST+DAST+cloud, free plan). The combination at Indian pricing is the difference, not any single capability. |
| Actual limitations | Early (v0.3). Local rules: 5 JS/TS and 5 Python only, same-function tracing. 3/5 on our seeded test. No exploit validation in the product. DAST "tools" are lightweight probes. Backend on free-tier hosting with sleep/cold-start problems and a shared guest mode. No tests in the CLI. No customer references yet. |

## Positioning map (qualitative placement, our judgement)

Axes: x = price accessibility; y = depth and maturity. Codefy sits **high on accessibility, low on depth**. Semgrep and Aikido sit mid on both. Snyk, Checkmarx, Veracode and Invicti sit high on depth, low on accessibility. The realistic opportunity is the lower-left-to-centre gap: teams too small for enterprise tools that want more than a free scanner. This is a judgement, not a measurement.

## USPs (4, each with evidence)

| USP | Implementation evidence | Customer benefit | Distinction |
|---|---|---|---|
| 1. One workflow: local SAST + cloud SAST + DAST + secrets | Desktop, VS Code, CLI all present; CLI scan run live on 2026-11-20; seeded test: 4/5 combined vs 3/5 each | Fewer tools to stitch together; wider coverage | Aikido unifies too; Codefy's edge is price and local mode |
| 2. Offline local engine, code stays on the machine | Offline mode scanned 7 files with network blocked; engine benchmark in `../evidence/` | Privacy for sensitive code; free to run | Most incumbents scan server-side or require an account |
| 3. Findings as traced attack paths | 6 graph views in the app (screenshots); source→sink trace per finding | Faster understanding of why something is a bug | Visual trace is rare in low-cost tools. Control-flow and supply-chain views are partial. |
| 4. Agent- and CI-ready | MCP server with 24 tools / 3 resources / 4 prompts (counted in code); `--fail-on` exit codes; SARIF export | Works with Claude Code, Cursor and CI gates | StackHawk and Checkmarx have agent integrations too; Codefy's is free and open |
