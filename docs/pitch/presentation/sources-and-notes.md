# Codefy Pitch Deck — Slide-by-Slide Sources, Notes & Diligence Defense

**Standard:** Strictly 10 Slides (16:9). No 11th slide. Every number and statement below is traced to an official report, academic paper, codebase artifact, or explicitly labeled as an estimate / founder-reported.

---

## Slide 1 — Codefy: The Vision
- **Kicker:** India-First AppSec · Local AST Engine · Traced Attack Paths
- **Headline:** Find the vulnerability. See the path. Ship the fix.
- **Value Proposition:** One unified workflow for code scanning, secret detection, and web-app security. Runs locally on your machine with zero code upload, or in the cloud. Every finding opens as an interactive, traced attack path.
- **Key Metrics:**
  - Indian AppSec TAM: ₹5,416 cr ($579M) — bottom-up model (`research/market-research.md` §6).
  - Local Engine Speed: <1 ms (0.24 ms median per file, Apple M5 benchmark in `evidence/engine-benchmark.json`).
  - Proposed Team Pricing: ₹4,999/mo (Startup tier for 10 devs; ~78% below foreign list prices).
  - Initial SOM Beachhead: ₹4.6 cr ($490k) — Year 3 target (~390 paying Indian SaaS & Fintech orgs).
- **Evidence & Diligence:**
  - The three client surfaces (VS Code, Desktop, CLI & MCP server) exist and run today.
  - The offline mode guarantees zero network traffic (verified via network isolation test).
  - All claims of "zero false positives" or "<300ms per keystroke" from legacy materials have been stripped.
- **Speaker Notes:**
  > "Codefy is built for early-stage software and fintech companies that cannot afford ₹15–25 lakh dedicated AppSec engineers or ₹40,000–₹1,50,000 periodic manual pentests. We combine local AST taint analysis, secret scanning, and cloud SAST/DAST into a single tool where every vulnerability is visualized as a reachable attack path. It's fast, private, and priced in Rupees."

---

## Slide 2 — The Problem & Market Opportunity
- **Kicker:** § 02 · Problem & Market Opportunity
- **Headline:** Vulnerabilities are now the #1 breach vector, while security testing remains slow and costly.
- **Facts & Sources:**
  1. **31% of breaches** began with exploitation of a vulnerability, overtaking stolen credentials for the first time in 19 years. Third-party involvement reached 48%.  
     *Source:* Verizon Data Breach Investigations Report (DBIR) 2026, 19 May 2026.
  2. **₹25.5 crore ($2.73M)** average cost of an Indian data breach (+15.9% YoY, all-time record). Red teaming and offensive testing reduced costs by ₹2.47 crore per breach.  
     *Source:* IBM Cost of a Data Breach Report 2026 (India release, 3 Aug 2026).
  3. **₹40,000 to ₹1,50,000** typical manual VAPT cost per web application (1–3 weeks turnaround). Small teams test once a year or only before major enterprise sales.  
     *Source:* Tranquility Cybersecurity (TCSA) 2026 pricing; Cybersigma June 2026.
- **Bottom-Up Market Sizing (India):**
  - **TAM:** ₹5,416 crore ($579M) across 2,05,494 active DPIIT startups, 20,000 software agencies, and 5,000 mid-market firms.
  - **SAM:** ₹500 crore ($53.5M) for self-serve SMB and mid-market teams on JS/TS/Python stacks.
  - **SOM:** ₹4.6 crore ($490k) beachhead targeting ~390 paying organizations by Year 3 (0.9% of SAM).
- **Regulatory Drivers:**
  - DPDP Rules 2025 (notified 14 Nov 2025): Up to ₹250 crore penalty for failing to maintain reasonable security safeguards.
  - RBI IT Governance & SEBI CSCRF: Mandate periodic VAPT and continuous API testing for fintechs and market infrastructure.
- **Speaker Notes:**
  > "For 19 years, phishing and credential stuffing were the primary way breaches happened. In 2026, vulnerability exploitation took the #1 spot. In India, data breach costs surged to ₹25.5 crore. Yet, small engineering teams are trapped: they either pay ₹1.5 lakh for an annual manual pentest or deploy noisy open-source tools that lack data-flow context. With DPDP penalties reaching ₹250 crore, security is now a board-level compliance requirement."

---

## Slide 3 — Introducing Codefy
- **Kicker:** § 03 · Introducing Codefy
- **Headline:** Code scanning, secret detection and web-app probes — unified into traced attack paths.
- **Core Product Dimensions:**
  - **What:** Unified static taint analysis, entropy secret scanning, and dynamic HTTP probes.
  - **Who:** Indian engineering teams, starting with Fintech startups, early-stage SaaS, and software agencies.
  - **How:** Local in-process engine for instant private feedback; opt-in cloud runner for Semgrep, Gitleaks, and DAST probes; SARIF export for CI/CD gates.
- **Current System Architecture (4 Tiers):**
  - *Tier 1 (Client Surfaces):* VS Code Extension (v0.3.1), Tauri Desktop App (v0.3.0), CLI (`@mickey20/codefy` v1.1.1), Stdio MCP Server (24 tools).
  - *Tier 2 (Local Core):* `@whoami/core` with Tree-sitter WASM, ast-grep N-API, 10 intra-procedural taint rules, Shannon entropy ($\ge 4.0$), 6 React Flow + ELK views.
  - *Tier 3 (Edge & Auth):* Cloudflare Workers proxy, Firebase Auth / JWT via `cmd-d_llm` on Vercel, SSRF guardrails on Axiom controller.
  - *Tier 4 (Cloud Runners):* Render Celery workers, Semgrep, Gitleaks, Trufflehog, Trivy, 27 Python DAST probes, Firebase RTDB progress stream.
- **Speaker Notes:**
  > "Codefy is split across a fast local core and an on-demand cloud runner. On the developer's laptop, Tree-sitter and ast-grep build an in-process syntax tree and trace taint paths in under a millisecond. When comprehensive scans are needed, the tool enqueues a cloud job running Semgrep and Gitleaks, then outputs SARIF into your GitHub Actions pipeline."

---

## Slide 4 — Product Demonstration (Omnichannel Surfaces)
- **Kicker:** § 04 · Omnichannel Surfaces
- **Headline:** Demonstrated across every developer touchpoint: CLI, VS Code, and Agent MCP.
- **Genuine Running Software Artifacts:**
  1. *Surface 01 (Terminal CLI):* `cli-version.png` — Interactive terminal runner (`Codefy Security CLI v1.0.0`) providing quick DAST, SAST, live streaming telemetry, and CI/CD gating.
  2. *Surface 02 (VS Code Extension):* `extension-version.jpg` — In-editor intelligence (`Codefy - WhoAmI v0.3.1`) showing whole-code architecture, taint-flow DAGs, and marketplace metadata.
  3. *Surface 03 (Agent MCP with Antigravity):* `mcp-antigravity.jpg` — Native 24-tool stdio MCP server integrated with Antigravity / Claude Code driving automated BugBound QA verification audits and reports.
- **Verification Details:** All three images captured live from running software instances on 2026-11-20.
- **Speaker Notes:**
  > "These are real screenshots from our running software across all three surfaces. Surface 1 is our interactive terminal CLI for developers and CI/CD gates. Surface 2 is our VS Code extension with real-time taint-flow DAGs and in-editor remediation. Surface 3 is our native 24-tool stdio MCP server plugged into Antigravity, running autonomous multi-phase BugBound audits and generating full compliance reports with zero human toil."

---

## Slide 5 — Customer Validation & Success Stories
- **Kicker:** § 05 · Customer Validation & Traction
- **Headline:** Early validation: what we have proven, and what is founder-reported.
- **Elements:**
  1. *PostgreSQL Security Case Study:*
     - *Status:* FOUNDER-REPORTED.
     - *Context:* Posture testing at an Indian tech startup revealed a PostgreSQL credential security weakness susceptible to external compromise.
     - *Action:* Investigated, tracked, and responsibly disclosed to the company's CTO.
     - *Outcome:* CTO acknowledged with gratitude ("Thank you for helping us"). Anonymized in accordance with responsible disclosure practices.
  2. *Early User Adoption:*
     - *Status:* FOUNDER-REPORTED + PUBLIC ANCHORS.
     - *Counts:* 5–10 active developer users (founder-reported cohorts).
     - *Public Metrics:* 956 npm downloads for `@mickey20/codefy` (first 4 days); 135 VS Code Marketplace downloads (`Mickey20.codefy-whoami`).
  3. *QA Speed Benchmark:*
     - *Status:* QUALITATIVE + EMPIRICAL TIMINGS.
     - *Comparison:* Senior QA tester estimated 2–3 days to manually discover, isolate, and validate a bug in their workflow. Codefy identified a candidate injection vulnerability in ~1 second.
     - *Measured Benchmarks:* 0.24 ms median per small file; 126 ms across 40 files / 10k LOC.
     - *Scope Caveat:* Automates issue detection only; does not replace full exploit validation.
- **Speaker Notes:**
  > "We believe in radical honesty. We do not manufacture traction. Our case study is an Indian startup where we discovered a PostgreSQL credential vulnerability and responsibly reported it to their CTO. Our early traction consists of 5–10 active users and 950+ npm downloads. And while a QA tester takes 2–3 days to manually uncover and trace a bug, Codefy surfaces candidate paths in seconds."

---

## Slide 6 — Competitive Landscape & USPs
- **Kicker:** § 06 · Competitive Landscape & USPs
- **Headline:** A unified, developer-accessible security tool built for Indian budgets.
- **Competitor Table Summary (10 Devs / Month):**
  - *Snyk:* SAST Yes, DAST Yes, Recon Partial, Exploit Proof Enterprise, AI Agent Fix — ₹23,337/mo ($25/dev).
  - *Semgrep:* SAST Yes, DAST Unknown, Recon Unknown, AI Assistant — Free $\le 10$ devs; ₹28,000/mo on Teams.
  - *SonarQube:* SAST Yes, DAST Unknown, Quality Focus — Free Community / Cloud $\le 50$k LOC.
  - *CodeRabbit:* AI PR review, not a vulnerability scanner — ₹22,404/mo ($24/dev).
  - *Aikido:* SAST Yes, DAST Yes, Recon Pro, Cloud Yes — Free tier; Basic ₹32,671/mo ($350).
  - *Codefy:* Local AST + Cloud SAST/DAST + Secrets + 24-tool MCP — Free local; Proposed ₹4,999/mo (Startup tier).
- **Four Defensible USPs:**
  1. *Unified Workflow:* Local SAST + cloud SAST + DAST + secrets in one tool instead of 4 fragmented bills.
  2. *Offline Local Engine:* Sensitive source code never leaves the laptop during local passes.
  3. *Visual Attack Paths:* 6 interactive React Flow views trace source $\rightarrow$ sink reachability.
  4. *Agent & CI-Ready:* Stdio MCP server (24 tools) + SARIF export + `--fail-on` gate.
- **Seeded Test Reality:** On 5 planted issues in a demo app, local engine found 3, cloud SAST found 3, together found 4 (SQLi missed by both).
- **Speaker Notes:**
  > "We do not claim to replace Snyk or Checkmarx for Fortune 500 enterprises. Our competitive wedge is price accessibility and local developer ergonomics. Snyk costs ₹23,000+ per month for a 10-person team. Codefy is ₹4,999, combines local AST scanning with cloud SAST and DAST, and exposes 24 security tools directly to AI coding agents via MCP."

---

## Slide 7 — Business Model & Unit Economics
- **Kicker:** § 07 · Business Model & Unit Economics
- **Headline:** Priced in Rupees for Indian teams; fixed infrastructure dominates costs.
- **Proposed Pricing Tiers (INR / Month, ex-GST):**
  - *Free:* ₹0 — Local AST scanning, secret detection, attack graphs, Markdown export.
  - *Developer:* ₹499 /dev/mo — Cloud SAST + passive DAST, PDF & SARIF export.
  - *Startup (Hero):* ₹4,999 /org/mo (≤10 devs) — CI/CD gate, shared team findings.
  - *Growth:* ₹19,999 /org/mo (≤40 devs) — Priority queues, audit trail.
  - *Enterprise:* Custom — Private VPC deployment, custom AST rules.
- **Unit Economics Model (Reproducible via `unit_economics.py`):**
  - *MVP (10 Users):* Infra ₹10,528/mo | Cost per scan ₹131.60 | LLM per analysis ₹0.42.
  - *Growth (100 Users):* Infra ₹26,568/mo | Cost per scan ₹33.21 | 35.5% Gross Margin.
  - *Scale (1,000 Users):* Infra ₹90,352/mo | Cost per scan ₹11.29 | 70.6% Gross Margin.
- **Break-Even:**
  - **3 Startup customers** cover all monthly infrastructure + LLM costs.
  - **23 Startup customers** cover infra plus a ₹1,00,000/mo team stipend.
- **Speaker Notes:**
  > "Our business model has extraordinary operational leverage because local scanning runs on the developer's CPU at ₹0 marginal cost to us. In our cloud tier, fixed infrastructure dominates at ₹10,500/month. We need only 3 paying Startup customers to achieve cash-flow break-even on infrastructure. At 1,000 users, gross margins expand past 70%."

---

## Slide 8 — India-First Go-To-Market
- **Kicker:** § 08 · India-First Go-To-Market
- **Headline:** Founder-led outreach, product-led developer acquisition, and partner distribution.
- **Initial Segments:**
  1. *Fintech Startups (4.0/5):* Mandated VAPT due diligence from RBI, partner banks, and SEBI CSCRF.
  2. *Early-Stage SaaS (3.75/5):* Fast-growing JS/TS/Python teams blocked by US/EU enterprise security questionnaires.
  3. *Software Development Agencies (3.25/5):* Need handover security certificates for client deliverables; multiplier channel.
- **Acquisition Channels:**
  - Founder-Led Outreach (LinkedIn & warm intros to CTOs for 30-min live repository scans).
  - Product-Led Growth (VS Code Marketplace, npm package, GitHub repo).
  - VAPT & Agency Partnerships (Reseller margin and white-label reporting).
  - Developer Communities (Hacker News, Reddit, Product Hunt, local Bangalore/NCR meetups).
- **90-Day Execution Plan:**
  - *Month 1 (Discover & Pilot):* Clear trust blockers, 30 CTO discovery calls $\rightarrow$ Targets: 60 leads, 25 demos, 10 pilots.
  - *Month 2 (Prove & Price):* Weekly pilot check-ins, publish 1 permissioned case study, test ₹4,999 pricing $\rightarrow$ Targets: 8 active orgs, 400 scans, 3 paid conversions.
  - *Month 3 (Repeatability):* Referral engine, 1–2 consulting partners $\rightarrow$ Targets: ₹15,000 MRR (break-even reached), $\ge 50\%$ pilot retention.
- **Speaker Notes:**
  > "We execute in 30-day phases. In Month 1, we conduct founder-led outreach offering free 30-minute repository audits to fintech and SaaS CTOs. In Month 2, we validate our ₹4,999 price point and secure our first 3 paying teams to hit infrastructure break-even. In Month 3, we establish channel partnerships with software agencies."

---

## Slide 9 — Technology Roadmap & Global Expansion
- **Kicker:** § 09 · Roadmap & Global Expansion
- **Headline:** From verified developer scanner to intelligent evidence-based security testing.
- **Phased Evolution:**
  - **NOW (Verified Today):** Local AST engine (JS/TS & Python taint, secrets), Desktop/VS Code/CLI surfaces, 24-tool Stdio MCP server, cloud SAST runner, 6 React Flow attack-path views.
  - **NEXT (JEV + LLM Reasoning):** Joint Evidence & Validation layer merging SAST/DAST/secrets into a unified evidence graph; schema-enforced LLM triage for narrow questions; deterministic runtime validation (BugBound oracle) before any finding is labelled "confirmed"; AST-level diff patches with automated rescan.
  - **FUTURE (Guarded Reconnaissance):** External attack surface discovery, stateful authorization testing (BOLA/BFLA), strict safety guardrails (written scope, rate limits, emergency kill switch), automated pytest regression suites.
- **Global Expansion Sequence:**
  - India (Beachhead) $\rightarrow$ UAE (NESA/fintech) $\rightarrow$ Singapore (MAS TRM) $\rightarrow$ UK (PCI DSS v4.x) $\rightarrow$ USA (Self-serve PLG) $\rightarrow$ EU (DORA & CRA).
  - Required before global expansion: Permissioned case study, hardened multi-tenant backend, SOC 2 Type I readiness, USD Stripe billing.
- **Speaker Notes:**
  > "Codefy is not just another scanner. Our roadmap transitions from deterministic scanning to an intelligent evidence graph we call JEV. Instead of open-ended LLM audits that hallucinate, JEV asks closed questions about verified taint paths, proves exploitability through an execution oracle, and generates regression tests. After establishing our India beachhead, we expand to UAE and Singapore where regulatory frameworks match our wedge."

---

## Slide 10 — Why Codefy?
- **Kicker:** § 10 · Why Codefy
- **Headline:** Security testing a 10-person team can start today: on their own machine, for free.
- **Core Pillars:**
  1. *Works Today:* Real local & cloud scanning, 6 attack-path graphs, SARIF export, and a native 24-tool MCP server demonstrated live.
  2. *Honest About Gaps:* 4 of 5 seeded flaws detected by combined engines. Zero fabricated accuracy metrics; JEV exploit validation scheduled next.
  3. *Priced for India:* Proposed ₹4,999/month for 10 developers — 78% below foreign suites, with an offline tier that costs ₹0.
- **Actionable Next Step:**
  - **A 30-Minute Pilot:** We scan one of your repositories together, you inspect the attack-path graph, keep the SARIF & PDF compliance report, then decide.
- **Links & Contact:**
  - Website: `axtion.tech`
  - VS Code Marketplace: `Mickey20.codefy-whoami`
  - CLI: `npm i -g @mickey20/codefy`
  - Founder: Jayesh Pandey
- **Speaker Notes:**
  > "Thank you. Codefy is operational, evidence-backed, and priced for the Indian market. We are ready to help Indian tech companies secure their code without enterprise price tags. Let's schedule a 30-minute pilot scan on one of your repositories."
