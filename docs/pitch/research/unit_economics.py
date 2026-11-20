#!/usr/bin/env python3
"""Codefy unit-economics model. Reproduce with: python3 unit_economics.py

Every price below is a PUBLIC LIST PRICE from infrastructure-costs.md (accessed 2026-11-20).
Every usage figure is an ASSUMPTION and labelled as such. Nothing here is a measured bill.
INR figures are ex-GST unless stated. FX = RBI/FBIL reference rate, 19-Nov-2026.
"""
import json, math

FX = 93.3461          # INR per USD (FBIL/RBI 19-Nov-2026, via MSEI archive)
GST = 0.18            # GST on SaaS sold in India
PAY_FEE = 0.02        # payment-gateway fee: ESTIMATE (not verified from a vendor page)
OR_FEE = 0.055        # OpenRouter credit-purchase fee (openrouter.ai/pricing)

# ---- infrastructure stacks (USD / month) -------------------------------------------------
STACKS = {
    "A_MVP": {            # 5-10 active users
        "Hosting (Render API 1c-2g)": 25,
        "Workers (Render 1c-2g x1)": 25,
        "Database (Render PG 0.5c-1g)": 19,
        "Redis (Render KV 256MB)": 10,
        "Scanner compute (DO 2vCPU/4GB x1)": 24,
        "Edge proxy (Cloudflare Workers paid)": 5,
        "Monitoring (Axiom/Sentry/UptimeRobot free)": 0,
        "Storage (R2 free allowance)": 0,
        "Domain (.tech $50.98/yr)": 50.98 / 12,
    },
    "B_GROWTH": {         # ~100 users, ~15 orgs
        "Hosting (Render API 2c-4g)": 85,
        "Workers (Render 1c-2g x2)": 50,
        "Database (Render PG 1c-2g)": 40,
        "Redis (Render KV 1GB)": 20,
        "Scanner compute (DO 2vCPU/4GB x2)": 48,
        "Edge proxy (Cloudflare Workers paid)": 5,
        "Monitoring (Sentry Team)": 26,
        "Storage (R2 ~50GB)": 1,
        "Domain (.tech $50.98/yr)": 50.98 / 12,
    },
    "C_SCALE": {          # ~1,000 users, ~150 orgs
        "Hosting (Render API 2c-4g x2 + Pro workspace $25)": 170 + 25,
        "Workers (Render 2c-4g x4)": 340,
        "Database (Render PG 2c-8g)": 100,
        "Redis (Render KV 3GB)": 60,
        "Scanner compute (DO 2vCPU/4GB x6)": 144,
        "Edge proxy (Cloudflare Workers incl. overage est.)": 15,
        "Monitoring (Sentry Team + Axiom cloud)": 26 + 25,
        "Storage (R2 ~300GB)": 5,
        "Domain (.tech $50.98/yr)": 50.98 / 12,
    },
}

# ---- usage assumptions ------------------------------------------------------------------
USERS = {"A_MVP": 10, "B_GROWTH": 100, "C_SCALE": 1000}
CLOUD_SCANS_PER_USER = 8       # ASSUMPTION; local scans cost no server compute
LLM_CALLS_PER_USER = 12        # ASSUMPTION (chat + triage + patch requests / month)
# one LLM call = 4,000 input + 1,000 output tokens (ASSUMPTION)
IN_TOK, OUT_TOK = 4000, 1000
MODELS = {                      # USD per 1M tokens (in, out) - OpenRouter / Anthropic list, 2026-11-20
    "gemini-2.5-flash-lite": (0.10, 0.40),
    "claude-sonnet-5.5": (2.00, 10.00),
}
PREMIUM_SHARE = 0.20            # ASSUMPTION: 20% of calls (patches) use the premium model


def llm_cost_inr(call_premium_share=PREMIUM_SHARE):
    def one(m):
        i, o = MODELS[m]
        return (IN_TOK * i + OUT_TOK * o) / 1e6 * FX * (1 + OR_FEE)
    cheap, prem = one("gemini-2.5-flash-lite"), one("claude-sonnet-5.5")
    return cheap, prem, (1 - call_premium_share) * cheap + call_premium_share * prem


# ---- proposed price points (INR / month, ex-GST) - PROPOSALS, not commitments -------------
PRICE = {"Developer": 499, "Startup": 4999, "Growth": 19999}
# paying customers per scenario (ASSUMPTION): (Developer seats, Startup orgs, Growth orgs)
PAYING = {"A_MVP": (0, 0, 0), "B_GROWTH": (5, 4, 1), "C_SCALE": (40, 30, 8)}

out = {"fx": FX, "assumptions": {
    "cloud_scans_per_user_per_month": CLOUD_SCANS_PER_USER,
    "llm_calls_per_user_per_month": LLM_CALLS_PER_USER,
    "tokens_per_call": f"{IN_TOK} in / {OUT_TOK} out",
    "premium_model_share": PREMIUM_SHARE, "payment_fee": PAY_FEE}}

cheap, prem, blend = llm_cost_inr()
out["llm_per_call_inr"] = {"flash-lite": round(cheap, 3), "sonnet-5.5": round(prem, 3), "blended": round(blend, 3)}

rows = {}
for s, items in STACKS.items():
    infra_usd = sum(items.values())
    infra_inr = infra_usd * FX
    scans = USERS[s] * CLOUD_SCANS_PER_USER
    llm_calls = USERS[s] * LLM_CALLS_PER_USER
    llm_inr = llm_calls * blend
    total = infra_inr + llm_inr
    dev, st, gr = PAYING[s]
    mrr = dev * PRICE["Developer"] + st * PRICE["Startup"] + gr * PRICE["Growth"]
    fees = mrr * PAY_FEE
    gm = (mrr - fees - total) / mrr if mrr else None
    rows[s] = {
        "users": USERS[s], "cloud_scans": scans, "llm_calls": llm_calls,
        "infra_usd": round(infra_usd, 2), "infra_inr": round(infra_inr),
        "llm_inr": round(llm_inr), "total_inr": round(total),
        "annual_inr": round(total * 12),
        "cost_per_cloud_scan_inr": round(total / scans, 2),
        "cost_per_user_inr": round(total / USERS[s], 1),
        "cost_per_llm_analysis_inr": round(blend, 3),
        "paying (dev,startup,growth)": PAYING[s], "mrr_inr": mrr,
        "gross_margin": None if gm is None else round(gm, 3),
        "breakdown_inr": {k: round(v * FX) for k, v in items.items()},
    }
out["scenarios"] = rows

# ---- break-even -------------------------------------------------------------------------
A = rows["A_MVP"]
net_startup = PRICE["Startup"] * (1 - PAY_FEE)
out["break_even"] = {
    "infra_only_startup_customers": math.ceil(A["total_inr"] / net_startup),
    "with_1L_monthly_opex_startup_customers": math.ceil((A["total_inr"] + 100000) / net_startup),
    "monthly_revenue_needed_infra_only": round(A["total_inr"] / (1 - PAY_FEE)),
    "gst_example": {"list_ex_gst": PRICE["Startup"], "gst_18pct": round(PRICE["Startup"] * GST, 2),
                    "customer_pays": round(PRICE["Startup"] * (1 + GST), 2)},
}

# ---- sensitivity: scenario B fully-loaded cost per cloud scan -----------------------------
B = rows["B_GROWTH"]
sens = {}
for spu in (2, 4, 8, 16, 32):
    scans = USERS["B_GROWTH"] * spu
    sens[f"{spu} scans/user"] = round(B["total_inr"] / scans, 2)
out["sensitivity_B_cost_per_scan_inr"] = sens
out["sensitivity_llm_per_call_inr_by_premium_share"] = {
    f"{int(p*100)}% premium": round(llm_cost_inr(p)[2], 3) for p in (0, 0.2, 0.5, 1.0)}

# ---- marginal cost of one cloud scan (capacity view) ---------------------------------------
SCAN_SECONDS = 120          # observed: 94 s end-to-end for the demo project incl. queue/cold start (rounded up)
CONCURRENT, UTIL = 2, 0.25  # ASSUMPTION: 2 concurrent scans per 2vCPU box, 25% sustained utilisation
cap = 30 * 24 * 3600 / SCAN_SECONDS * CONCURRENT * UTIL
out["marginal_cost_per_scan_inr"] = round(24 * FX / cap, 3)
out["scanner_box_capacity_scans_per_month"] = round(cap)

print(json.dumps(out, indent=2, ensure_ascii=False))
