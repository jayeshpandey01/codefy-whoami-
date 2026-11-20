# Unit Economics and Proposed Indian Pricing

Reproduce: `python3 unit_economics.py` (this folder). Inputs and sources: [`infrastructure-costs.md`](infrastructure-costs.md). All prices below are **proposals**, not existing customer commitments, and no customer has agreed to them.

## 1. Proposed tiers (INR / month, ex-GST)

| Tier | Price | Includes (proposed) | Rationale |
|---|---|---|---|
| Free | ₹0 | Local scans (JS/TS, Python, secrets), graphs, Markdown report | Costs ≈ nothing to serve (runs on the user's machine) |
| Developer | ₹499 / user | Cloud SAST + passive DAST, PDF/SARIF export, fair-use cloud scans | Under Snyk Team $25 (₹2,334) and Semgrep $30 (₹2,800) per seat |
| Startup | ₹4,999 / org (≤10 devs) | Developer features for 10 seats, CI gate, shared findings | ≈ ₹500/dev; Snyk Team 10 devs = ₹23,337, GitHub Secret Protection + Team = ₹21,470, Aikido Basic = ₹32,671 (list prices, `competitor-pricing.md`) |
| Growth | ₹19,999 / org (≤40 devs) | Startup + priority scans, audit log | ≈ ₹500/dev |
| Enterprise | Custom | SSO, private deployment, support | Not priced; no evidence yet |

**Willingness-to-pay check (ESTIMATE):** the market research puts early-stage SaaS at ₹25k–₹75k per year and fintech startups at ₹1–5 L per year, anchored on VAPT prices of ₹40k–₹1.5 L per application. ₹4,999/month (₹59,988/year) sits inside those bands. **It has not been tested with a buyer.** Month 2 of the 90-day plan tests it.

GST: a Startup customer pays ₹4,999 + ₹899.82 GST = **₹5,898.82**; only ₹4,999 is revenue.

## 2. Model outputs

| | A: MVP | B: Growth | C: Scale |
|---|---:|---:|---:|
| Active users | 10 | 100 | 1,000 |
| Cloud scans / month | 80 | 800 | 8,000 |
| Monthly cost (₹) | 10,528 | 26,568 | 90,352 |
| Cost per cloud scan, fully loaded (₹) | 131.60 | 33.21 | 11.29 |
| Cost per user (₹) | 1,053 | 266 | 90 |
| Cost per LLM analysis (₹, blended) | 0.42 | 0.42 | 0.42 |
| Cost per report | ₹0 (generated client-side: Markdown, jsPDF) | | |
| Assumed paying mix (Developer seats, Startup orgs, Growth orgs) | 0, 0, 0 | 5, 4, 1 | 40, 30, 8 |
| Monthly revenue (₹, ex-GST) | 0 | 42,490 | 3,29,922 |
| Gross margin (after 2% payment fee, all infra + LLM) | n/a | 35.5% | 70.6% |

The paying mixes are **hypotheses chosen to illustrate the model**, not forecasts. Cost per repository and per organisation follow from scans per repo, which is unmeasured, so they are not quoted.

## 3. Break-even

| Question | Answer |
|---|---|
| Revenue needed to cover Scenario A infrastructure + LLM | ₹10,743/month (after a 2% payment fee) |
| Startup-tier customers needed (infrastructure only) | **3** |
| Startup-tier customers needed if the team costs ₹1,00,000/month | **23** |

The 2% payment fee is an estimate, not from a vendor page. Founder time, sales and support are excluded from the first row.

## 4. What would change the answer

- Usage: at 2 scans/user the cost per scan in Scenario B is ₹133; at 32 it is ₹8.
- LLM mix: 100% premium raises cost per analysis to ₹1.77.
- Churn, discounts and support cost are not modelled because there is no data.
- Gross margin at Scale depends on actually delivering the real scanners; the current backend runs a subset (see `README.md` audit).
