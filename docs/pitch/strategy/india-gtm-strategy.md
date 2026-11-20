# India-First Go-To-Market, 90-Day Plan and Pricing

Targets below are **proposals**, not results. No conversion benchmarks are quoted because none were verified. Segment scores come from `../research/market-research.md` §5 (estimates).

## 1. Segments

| Rank | Segment | Why | Trigger | Score* |
|---|---|---|---|---|
| 1 | Fintech startups | Partner banks and regulators require VAPT; API auth and injection bugs; small teams | RBI partner due diligence, SEBI CSCRF, DPDP (rules notified 14 Nov 2025; penalties up to ₹250 crore) | 4.0 |
| 2 | Early-stage SaaS (JS/TS/Python) | No security staff; first enterprise or US customer sends a security questionnaire | SOC 2 / ISO 27001 prep, customer questionnaires | 3.75 |
| 3 | Mid-sized SaaS (50–500 engineers) | Many repos, audit evidence; longer sales | SOC 2 Type II renewals | 3.5 |
| Channel | Software agencies (3.25) and security/VAPT consultancies | Agencies need a handover scan; consultancies can resell and widen distribution | Client contract clauses | — |

*Mean of four 1–5 scores (urgency, budget, sales-cycle fit, product fit) in the research file. Estimates, not measured.

**Entry point:** lead with early-stage SaaS and fintech startups running JS/TS or Python (the engines' strongest fit). Treat mid-sized SaaS as the second wave once there are references. Enterprise is out of scope until there is a case study and a hardened backend.

## 2. Channels (priority order)

| # | Channel | Audience | Approach | Cost | Effort | Metric |
|---|---|---|---|---|---|---|
| 1 | Founder-led CTO outreach (LinkedIn, warm intros) | Fintech and SaaS CTOs | Offer a free scan of one repo with the founder present; share the graph and SARIF | ₹0 | High, founder time | Demos booked |
| 2 | Product-led: VS Code Marketplace, npm, GitHub README | Individual developers | Publish current build (marketplace is on 0.2.0 vs repo 0.3.1); publish to Open VSX; clear install command | ₹0 | Low | Installs, weekly active scanners |
| 3 | Agency and VAPT-consultancy partnerships | Agencies, small consultancies | Offer partner pricing and white-labelled reports; they bring clients | Revenue share (to be set) | Medium | Partner-sourced pilots |
| 4 | Indian developer and startup communities (Reddit, Discord, local meetups, Product Hunt, Hacker News) | Developers | Demo posts and a public benchmark post | ₹0 | Medium | Sign-ups |
| 5 | Accelerators and startup programmes | Early-stage founders | Apply and demo | ₹0 | Low | Intros |
| 6 | Security-community write-ups | AppSec practitioners | Publish the seeded test and its misses honestly | ₹0 | Low | Backlinks, replies |

Do not run paid ads before pricing is validated.

## 3. 90-day plan

| Month | Focus | Actions | Proposed KPI targets (not actuals) |
|---|---|---|---|
| 1 | Discovery and pilots | Fix trust blockers first (below). 30 customer conversations; demos; recruit pilots; collect redacted evidence for the case study | 60 qualified leads, 25 demos, 10 pilots started |
| 2 | Proof and pricing | Weekly pilot check-ins; publish one case study with written permission; test ₹4,999 price with 10 buyers; first paid conversions | 8 active organisations, 400 completed scans, 3 paid conversions |
| 3 | Repeatability | Referral ask in every pilot; sign 1–2 agency/consultancy partners; fix top feedback; track retention | ₹15,000 MRR (3 Startup-tier customers), ≥50% of pilots still active in week 12, 2 partner-sourced pilots |

3 Startup-tier customers is also the infrastructure break-even in `../research/unit-economics.md`.

**Trust blockers to clear in Month 1** (all found in the audit, none require new features):
1. Remove the shared "tester" guest mode for active DAST scans, and add target-ownership checks (DAST has none today).
2. Replace free-tier hosting (sleeps after 15 minutes; free Postgres is deleted after 30 days) with paid minimums.
3. Publish the current extension build; unify naming (Codefy / WhoAmI / Axtion).
4. Retire the `anthropic/claude-3.5-sonnet` default (retired on OpenRouter).
5. Add basic usage analytics so the "active users" claim becomes measurable.

## 4. Pricing validation

See `../research/unit-economics.md`. Tiers: Free, Developer ₹499/user, Startup ₹4,999 (≤10 devs), Growth ₹19,999 (≤40 devs), Enterprise custom. Month 2 tests the Startup price with ten buyers, and the result replaces the estimate.

## 5. Global expansion (after India)

From `../research/market-research.md` §7 (qualitative, from cited sources): **UAE → Singapore → UK → USA (developer self-serve first) → EU last.** UAE and Singapore have English-language B2B, regulator-driven security spend (UAE IA, MAS TRM) and fewer incumbents focused on SMB; the USA has the largest market but the most competition and highest product-maturity bar (SOC 2 expected); the EU adds NIS2/DORA/CRA compliance and GDPR obligations. **Required before leaving India:** a case study, a hardened multi-tenant backend, SOC 2 readiness, USD billing. None exists today.
