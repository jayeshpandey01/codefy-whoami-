# Infrastructure Costs

Prices are public list prices, accessed 2026-11-20. USD→INR = **93.3461** (RBI/FBIL reference rate, 19-Nov-2026, via the MSEI archive). INR figures exclude 18% GST unless stated. Usage figures are **assumptions**, not measured bills. Model: [`unit_economics.py`](unit_economics.py), output in [`../evidence/unit-economics-output.json`](../evidence/unit-economics-output.json).

## 1. What Codefy runs today (from repo config)

| Component | Provider / plan as declared | Source in repo | Today's cost |
|---|---|---|---|
| SAST API + 3 Celery workers | Render (`render.yaml`, plan undeclared; free tiers in use per the CLI's own `gap.md`) | `codefy - whoami/SAST/render.yaml` | Founder to confirm from billing |
| DAST API | Render | `codefy - whoami/DAST/render.yaml` | same |
| Postgres / Redis | Render **free** | SAST `render.yaml` | ₹0 (free Postgres is deleted 30 days after creation) |
| Auth + LLM gateway | Vercel serverless | `cmd-d_llm/vercel.json` | ₹0 if Hobby |
| SAST / DAST proxies | Cloudflare Workers | `cloudflare-worker/` | ₹0 (free: 100k req/day) |
| Job state | Firebase Realtime DB / Firestore | SAST/DAST/cmd-d config | ₹0 on Spark |
| Scan execution | GitHub Actions (DAST `dast-scanner.yml`; Axiom `scanner_runner.yml` runs **every 5 min**) | `.github/workflows/` | Free minutes; **Axiom's 5-minute cron is a cost risk** on private repos |
| Domain | `axtion.tech` (registered 2026-10-22) | WHOIS | ≈ ₹397/month (.tech renewal $50.98/yr) |
| LLM | Gateway rotates free-tier models (Llama-3.2-1B, gpt-oss-120b, etc.) | `cmd-d_llm/app/config.py` | ≈ ₹0; quality limited |

**Current actual cost: unknown.** The configuration implies almost everything is on free tiers, but no invoice or billing export was available. Do not quote a current spend figure until the founder supplies one.

**Reliability note (affects the cost story):** Render free services sleep after 15 minutes (≈1 minute wake-up); the CLI's own `Docs/gap.md` records outages caused by this.

## 2. Price book used by the model (official pages, 2026-11-20)

| Item | Price | Unit | URL |
|---|---|---|---|
| Render web/worker 1c-2g | $25 | month | render.com/pricing |
| Render web/worker 2c-4g | $85 | month | render.com/pricing |
| Render Postgres 0.5c-1g / 1c-2g / 2c-8g | $19 / $40 / $100 | month | render.com/pricing |
| Render Key Value 256MB / 1GB / 3GB | $10 / $20 / $60 | month | render.com/pricing |
| Render Pro workspace | $25 | month | render.com/pricing |
| DigitalOcean 2 vCPU / 4 GB droplet | $24 | month | digitalocean.com/pricing/droplets |
| Cloudflare Workers paid | $5 + $0.30/M requests | month | developers.cloudflare.com/workers/platform/pricing/ |
| Cloudflare R2 | $0.015 | GB-month (egress free) | developers.cloudflare.com/r2/pricing/ |
| Sentry Team | $26 (annual) | month | sentry.io/pricing/ |
| Axiom Cloud | $25 + usage | month | axiom.co/pricing |
| GitHub Actions Linux | $0.006 | minute (2,000 free/month on Free plan) | docs.github.com/en/billing/concepts/product-billing/github-actions |
| .tech domain | $50.98 | year | porkbun.com/products/domains |
| gemini-2.5-flash-lite | $0.10 in / $0.40 out | 1M tokens | OpenRouter models API |
| Claude Sonnet 5.5 | $2 in / $10 out | 1M tokens | platform.claude.com/docs/en/about-claude/pricing |
| OpenRouter credit fee | 5.5% | purchases | openrouter.ai/pricing |
| GST on foreign digital services | 18% | invoice | fonoa.com/countries/india/tax-on-digital-services (secondary) |

**Corrections this research made:**
- `anthropic/claude-3.5-sonnet` (the BugBound and `OpenRouterTriageProvider` default) is **retired** on OpenRouter (0 endpoints). Both defaults need updating before any production LLM use.
- Hetzner CX/CPX (€16.99) showed "currently unavailable"; DigitalOcean is used instead.
- The earlier assumption that Vercel Hobby is "non-commercial" was **not confirmed** on the pages opened; check the Terms of Service before relying on Hobby for paid use.

## 3. Three scenarios (monthly, ₹, ex-GST)

Assumptions: 8 cloud scans/user/month (local scans use no server compute); 12 LLM calls/user/month; 4,000 input + 1,000 output tokens per call; 80% cheap model / 20% premium model. Real usage is unknown. The founder's own desktop history shows 20 scans in about 27 days for a single heavy user.

| Expense | A: MVP (10 users) | B: Growth (100 users) | C: Scale (1,000 users) |
|---|---:|---:|---:|
| Hosting (Render API) | 2,334 | 7,934 | 18,202 |
| Database | 1,774 | 3,734 | 9,335 |
| Workers | 2,334 | 4,667 | 31,737 |
| Redis | 933 | 1,867 | 5,601 |
| Scanner compute (DigitalOcean) | 2,240 | 4,481 | 13,442 |
| Edge proxy (Cloudflare) | 467 | 467 | 1,400 |
| Monitoring | 0 | 2,427 | 4,761 |
| Storage + domain | 397 | 490 | 864 |
| **Infrastructure subtotal** | **10,478** | **26,067** | **85,342** |
| LLM | 50 | 501 | 5,011 |
| **TOTAL** | **10,528** | **26,568** | **90,352** |
| **Annual** | **1,26,337** | **3,18,814** | **10,84,226** |

(Line items are rounded individually; the totals come from the model.)

## 4. Sensitivity

| Variable | Result |
|---|---|
| Scenario B cost per cloud scan at 2 / 4 / 8 / 16 / 32 scans per user | ₹132.84 / ₹66.42 / ₹33.21 / ₹16.61 / ₹8.30 |
| LLM cost per call at 0% / 20% / 50% / 100% premium-model share | ₹0.08 / ₹0.42 / ₹0.93 / ₹1.77 |
| Marginal cost of one cloud scan (120 s, 2 concurrent per box, 25% utilisation, 10,800 scans/box/month) | ≈ ₹0.21 |

**Reading this:** the fixed infrastructure floor (≈ ₹10.5k/month) dominates at small scale. Marginal compute and LLM cost per scan is under ₹2. The business is a fixed-cost-coverage problem, not a per-scan cost problem.

## 5. Biggest cost risks

1. **Running real scanner binaries continuously.** Per the backend audit, the Render SAST worker installs ~10 of the 25 catalogued tools, and DAST "tools" are Python probes rather than the real binaries. Doing what the marketing says (real nuclei, ZAP, semgrep at scale) means dedicated compute; Render's 2c-4g is $85/month versus $24 on DigitalOcean.
2. **Premium LLM share.** Moving from 20% to 100% premium calls multiplies LLM cost ≈4×.
3. **GitHub Actions minutes.** A 5-minute cron on a private repo consumes ≈ 8,640 minutes/month, over 4× the free allowance.
