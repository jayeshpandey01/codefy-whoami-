# Codefy — Market Research (India-first AppSec)

Prepared 2026-11-20. All web sources accessed 2026-11-20. Tags like [S7] point to the **Source register** at the end, which gives each source's title, organisation, date, URL, and whether it is primary or secondary. **ESTIMATE** marks our own inference and shows the formula. FX for conversions: ₹93.5 per USD (ESTIMATE, rounded from the ₹93.44 close on 18 Nov 2026 [S39]).

---

## 1. Global anchors (context only, not Codefy's market)

| Metric | Value | Source |
|---|---|---|
| Global application-security market | Grand View Research expects **USD 42.09 bn by 2033, 18.8% CAGR (2026–33)**, with North America at **39.4%** of 2025 revenue. MarketsandMarkets' release headline is **USD 23.45 bn by 2031**; the reported 2026 base (~USD 13.63 bn) and 11.5% CAGR were seen only in a search-index snippet because the page blocks automated access. The two analysts' scopes clearly differ. | [S1], [S2] |
| IBM Cost of a Data Breach **2025** | Global average **USD 4.44 m** (US **USD 10.22 m**). India average **₹22 crore (INR 220 m)**, up 13% YoY, an all-time high. | [S3], [S4] |
| IBM Cost of a Data Breach **2026** (newer) | Global average **USD 4.99 m**. India average **₹25.5 crore**, up 15.9%. In India, offensive testing (red teaming and pentesting) was the **largest cost-reducing factor**, saving **₹2.47 crore** per breach. | [S6], [S5] |
| Verizon DBIR **2025** | Exploitation of vulnerabilities as the initial access step **grew 34% to 20% of breaches** (12,195 confirmed breaches analysed). Third-party involvement doubled to 30%. | [S7] |
| Verizon DBIR **2026** (newer) | **31%** of breaches start with vulnerability exploitation, the first time in 19 years it has overtaken stolen credentials. Third-party involvement: 48%. | [S8] |

**Web-application share:** neither DBIR press release gives a web-application breakdown, so we cite none. The full DBIR PDF has a "Basic Web Application Attacks" pattern; extract that figure manually before quoting it.

**Pitch line:** for the second year running, exploited vulnerabilities are a leading way in, and in India, testing is IBM's single biggest cost reducer.

---

## 2. India: market, threat and regulation

**Market size (supply side).** DSCI's *Indian Cybersecurity Product Landscape 3.0* reports **400+ product companies** with **USD 4.46 bn revenue in CY2025** (up from 1.05 bn in 2020, a 34% CAGR). It projects about **USD 6 bn in CY2026E**. Domestic India drives **45%+ of revenue**, and BFSI, IT services and government make up over a third of demand [S9]. Treat these as Indian *vendor revenue*, not Indian *AppSec spend*.

**India AppSec analyst estimates disagree by more than 20×.** IMARC puts 2025 at **USD 73.6 m** [S37]. MarketsandMarkets' India page reports about **USD 1,738.8 m for 2024**, seen only in a search snippet and low confidence [S38]. That spread is why Section 6 sizes the market bottom-up.

**Threat volume.** CERT-In handled **29.44 lakh (≈2.94 m) incidents in 2025** [S10], up from **20,41,360 in 2024** [S11] (ESTIMATE +44% = 29.44/20.41 − 1). CERT-In has **231 empanelled security-audit organisations** [S10].

**Regulatory triggers that create budget:**

| Instrument | What it requires (verified text) | Why it matters to Codefy | Source |
|---|---|---|---|
| CERT-In Directions, 28 Apr 2022 (s.70B(6)) | Report specified incidents **within 6 hours**; keep ICT logs for a rolling **180 days in India**; effective 27 Jun 2022. | Every service provider and body corporate needs detection, logs and evidence. | [S12] |
| CERT-In empanelment | **231** empanelled auditors (2025); CERT-In published *Comprehensive Cyber Security Audit Policy Guidelines* (Jul 2025). | Regulated buyers *must* use empanelled auditors, so Codefy complements rather than replaces them, and auditors are a channel. | [S10] |
| RBI IT Governance Master Direction (RBI/2023-24/107, 7 Nov 2023; effective 1 Apr 2024) | For critical/DMZ customer-facing systems: **VA at least every 6 months, PT at least every 12 months**, plus VA/PT before and after major changes. Must be done by "independent information security experts/auditors". Vendors must confirm code is "free of known vulnerabilities". Applies to banks, Top/Upper/Middle-layer NBFCs, CICs and AIFIs. | Fintechs that partner with banks or NBFCs inherit these demands through vendor due diligence. | [S13] |
| SEBI CSCRF (SEBI/HO/ITD-1/ITD_CSC_EXT/P/CIR/2024/113, 20 Aug 2024) | VAPT is conducted "through Cert-in Auditor" (half-yearly for qualified stock brokers, yearly for others). Scope covers applications, **API security testing** and mobile. Reports must cite **CVE/CWE/OWASP** and an **EPSS/SSVC score**, with closure timelines. | Codefy's findings can be pre-formatted to this template, which saves auditor time. | [S14], [S15] |
| DPDP Act 2023 + DPDP Rules 2025 | Rules **notified 14 Nov 2025**, with an **18-month phased compliance** window. Penalty **up to ₹250 crore** for failing to maintain reasonable security safeguards, and up to ₹200 crore for breach-notification failures. | Every Indian SaaS company handling personal data now faces a board-level security-safeguard liability. | [S16] |

Caveat: a July 2026 RBI "Cybersecurity, Technology: Risk, Resilience and Assurance Framework" direction for commercial banks appeared in search results but was **not verified**. Check whether it supersedes [S13] for banks.

---

## 3. Indian demand-side counts (inputs to bottom-up sizing)

| Count | Value | As of | Source | Type |
|---|---|---|---|---|
| DPIIT-recognised startups | **2,12,283**, of which **6,789 closed** (MCA) | 31 Jan 2026 | PIB, 17 Mar 2026 [S17] | Primary |
| DPIIT-recognised startups (later) | **2.23 lakh**; ~55,200 recognised in FY26 | 31 Mar 2026 | Angel One, reporting ministry figures [S18] | Secondary |
| Indian developers on GitHub | **21.9 m** (#2 globally); 5.2 m+ added in 2025; projected 57.5 m by 2030. TypeScript is #1 and Python #2 language globally. | Oct 2025 | GitHub Octoverse [S19] | Primary |
| Fintech companies (Tracxn) | **16,461**, of which **2,890 funded** and 30 unicorns | late May 2026 | Analytics Insight citing Tracxn [S21] | Secondary |
| SaaS companies | **1,000+**, with **150+ above USD 1 m ARR** (dated; no newer census found) | Jul 2020 | NASSCOM/SaaSBoomi/Zinnov [S20] | Primary |
| Tech industry / NASSCOM members | FY26E revenue **USD 315 bn** (IT services USD 149 bn); **3,500+** member companies | Feb 2026 | NASSCOM [S22] | Primary |
| GCCs in India | **1,750+** | 2024 | NASSCOM [S23] | Primary |
| Cyber product companies | **400+** | Dec 2025 | DSCI [S9] | Primary |

We found **no verified MCA count of software development firms**. That is the weakest input; see A2 in Section 6.

---

## 4. Cost side: what Indian buyers pay today

**Web-app VAPT prices (public Indian price pages):**

| Vendor page | Single web app | API | Duration | Source |
|---|---|---|---|---|
| TCSA (Tranquility), "VAPT cost India 2026", 10 Jun 2026 | ₹40k – ₹1.5 L (typical SaaS scope) | ₹40k – ₹1.2 L | 1–3 weeks of testing plus reporting | [S24] |
| Cybersigma, 29 Jun 2026 | ₹1.2 L – ₹3.5 L (moderate, ~5–8 roles); ₹4 L – ₹12 L+ for large multi-tenant SaaS | ₹1 L – ₹4 L | 6–12 days (web), 3–6 weeks (large) | [S25] |
| Astra Security blog (updated 17 Feb 2026) | ₹40k – ₹8.5 L; manual ₹40k – ₹2.5 L. Plans: Scanner ₹1.67 L/yr, Pentest ₹5 L/yr, Enterprise ₹6.65 L/yr | — | — | [S26] |

**Developer-tool list prices (global competitors):** Snyk Team "starting at $25/month", for up to 10 developers [S27]. Semgrep Teams **$30/contributor/month** for Code, $15 for Secrets; free up to 10 contributors [S28]. GitHub Code Security **$30** and Secret Protection **$19 per active committer per month** (1 Apr 2025) [S29]. ESTIMATE: $30 × ₹93.5 ≈ ₹2,800 per developer per month, or ≈ ₹33,700 per developer per year.

**Salaries:** AmbitionBox lists Application Security Engineers at **₹4 L – ₹34 L/yr** for 1–7 years of experience (747 salaries, updated Jul 2025). This was read via search index because the page blocks automated access [S30]. Glassdoor shows a Mumbai "Security Engineer" average base of **₹7.1 L/yr** (85 salaries, Jun 2026) [S31].
ESTIMATE: one mid-level AppSec hire ≈ ₹15–25 L/yr fully loaded (midpoint of S30 × ~1.2 overhead). For most SMBs that is 10–50× the cost of a tool subscription, which is the core of Codefy's value argument.

---

## 5. Segment evaluation

Scores run 1–5 on four criteria: **U** = urgency of the trigger, **B** = budget, **C** = sales-cycle fit for a founder-led team, **F** = fit with today's product (JS/TS/Python web/API, self-serve). Attractiveness is the mean of the four. WTP figures are all **ESTIMATE**, anchored on a ₹40k–₹3.5L VAPT per app [S24–S26] and on $25–30/dev/month tools [S27–S29].

| Segment | Main security problem | Current alternatives | Buying trigger | Budget sensitivity | Decision maker | Sales cycle | WTP / yr (ESTIMATE) | U/B/C/F | Score |
|---|---|---|---|---|---|---|---|---|---|
| **D. Fintech startups** | API auth/IDOR and injection bugs on payment/KYC flows; must pass partner-bank/NBFC VAPT | Annual CERT-In-empanelled VAPT, open-source scanners | RBI-regulated partner due diligence [S13], SEBI CSCRF if regulated [S14], DPDP [S16] | Medium | CTO / CISO-in-a-founder | 3–8 weeks | ₹1 L – ₹5 L | 5/3/4/4 | **4.0** |
| **A. Early-stage SaaS** | No security staff; enterprise customer security questionnaires block deals | Free scanners, ad-hoc one-off VAPT | First enterprise or US deal, SOC 2 / ISO 27001 readiness, DPDP | High | Founder / CTO | Days–2 weeks (self-serve) | ₹25k – ₹75k | 3/2/5/5 | **3.75** |
| **B. Mid-sized SaaS (50–500 eng.)** | Continuous coverage across many repos; audit evidence | Snyk/Semgrep/GitHub GHAS + annual VAPT | SOC 2 Type II, ISO 27001 renewals, DPDP, large-customer audits | Medium-low | VP Eng / Head of Security | 1–3 months | ₹3 L – ₹12 L | 4/4/3/3 | **3.5** |
| C. Software dev agencies | Clients ask for a VAPT certificate at handover; many codebases | Outsourced VAPT per project, often skipped | Client contract clause, government or BFSI client | High | Founder / delivery head | 2–6 weeks | ₹50k – ₹2.5 L | 3/2/4/4 | 3.25 |
| G. Security consulting firms (incl. 231 empanelled [S10]) | Manual testing hours; report formatting (e.g., SEBI template [S15]) | Burp Suite, commercial scanners, in-house scripts | Margin pressure, CSCRF volume | Medium | Practice lead / partner | 1–2 months | ₹1 L – ₹6 L | 3/3/4/3 | 3.25 |
| E. IT services companies | Secure delivery across thousands of client projects | Enterprise SAST/DAST (Checkmarx, Veracode, etc.), internal CoEs | Client MSAs, ISO 27001 | Low | CISO / procurement | 6–12+ months | ₹10 L – ₹50 L+ | 3/5/1/2 | 2.75 |
| F. Enterprise eng teams / GCCs | Scale, policy, SSO/RBAC, multi-language | Incumbent enterprise suites, often bought globally by the parent | Internal audit, parent-company policy | Low | CISO + procurement (often HQ) | 6–18 months | ₹15 L – ₹1 cr | 4/5/1/1 | 2.75 |

**Ranking:** 1) D Fintech startups, 2) A Early-stage SaaS, 3) B Mid-sized SaaS, 4) C Agencies and G Consulting firms (tied; G doubles as a channel), 6) E and F (tied; defer).

---

## 6. Bottom-up India TAM / SAM / SOM

**Definitions.** TAM = relevant Indian software-producing orgs × annual AppSec testing + tooling spend. SAM = the TAM segments that a self-serve or low-touch SaaS + CLI + IDE product can serve today (A, C, D and B-type orgs), × JS/TS/Python web/API fit × the share of spend an automated product can substitute. SOM = realistic year-3 paying customers × ARPA.

### Assumptions (all ESTIMATE unless a source is given)

| # | Assumption | Low | Base | High | Basis |
|---|---|---|---|---|---|
| A1 | Active DPIIT startups | 2,05,494 | 2,05,494 | 2,05,494 | 2,12,283 − 6,789 [S17] |
| A1s | Share that ship software (SaaS, fintech, IT, edtech, etc.) | 20% | 30% | 40% | ESTIMATE; no 2025/26 sector table found |
| A2 | Dev agencies / IT-services SMEs not in A1 | 10,000 | 20,000 | 40,000 | ESTIMATE; NASSCOM's 3,500+ members [S22] is a floor |
| A3 | Mid-market software and fintech orgs (50–500 engineers) | 3,000 | 5,000 | 8,000 | Anchor: 2,890 funded fintechs [S21] + SaaS with >$1 m ARR [S20] |
| A4 | Enterprises / GCCs / large IT | 2,000 | 2,500 | 3,500 | Anchor: 1,750+ GCCs [S23] |
| P1 | Spend per A1 org | ₹0.5 L | ₹1.0 L | ₹1.5 L | One web-app VAPT ₹40k–₹1.5 L [S24] |
| P2 | Spend per A2 org | ₹0.75 L | ₹1.5 L | ₹3 L | 1–2 client-app VAPTs [S24][S25] |
| P3 | Spend per A3 org | ₹8 L | ₹15 L | ₹30 L | 2–4 VAPTs at ₹1.2–3.5 L [S25] + 30–100 seats × ₹33.7k [S29] |
| P4 | Spend per A4 org | ₹0.75 cr | ₹1.5 cr | ₹3 cr | ESTIMATE; enterprise suites + programme VAPT |
| F1 | JS/TS/Python web/API fit | 50% | 60% | 70% | TS/Python are the top-2 GitHub languages [S19]; ESTIMATE applied to orgs |
| F2 | Spend substitutable by an automated product (vs mandated empanelled manual audit) | 40% | 50% | 60% | ESTIMATE; CSCRF/RBI still require independent auditors [S13][S15] |

### Results

| | Formula | Low | **Base** | High |
|---|---|---|---|---|
| **TAM** | A1·A1s·P1 + A2·P2 + A3·P3 + A4·P4 | ₹2,020 cr (USD 216 m) | **₹5,416 cr (USD 579 m)** | ₹15,333 cr (USD 1.64 bn) |
| **SAM** | (A1·A1s·P1 + A2·P2 + A3·P3) × F1 × F2 | ₹104 cr (USD 11 m) | **₹500 cr (USD 53.5 m)** | ₹2,030 cr (USD 217 m) |
| **SOM (year-3 ARR)** | Σ customers × ARPA (below) | ₹1.6 cr (USD 0.17 m), 150 customers | **₹4.6 cr (USD 0.49 m), 390 customers** | ₹11.1 cr (USD 1.19 m), 940 customers |

The base TAM of USD 579 m falls between the IMARC (USD 74 m) and MarketsandMarkets (USD 1.7 bn) India estimates [S37][S38], which is a sanity check rather than proof. Enterprise (A4) is about 69% of base TAM and is **excluded from SAM**.

**SOM build (year-3 paying customers × ARPA, ESTIMATE):**

| Customer type | Low | Base | High | ARPA |
|---|---|---|---|---|
| Early-stage SaaS / startups | 100 | 250 | 600 | ₹50k |
| Dev agencies | 30 | 80 | 200 | ₹1.2 L |
| Fintech startups | 15 | 40 | 90 | ₹3 L |
| Mid-sized SaaS | 5 | 20 | 50 | ₹6 L |

The base case equals about 0.9% of SAM. A founder-led team reaches it with a self-serve funnel plus roughly 60 sales-assisted deals (fintech and mid-market) over 3 years. That is about 1.7 assisted closes per month, which is plausible but not trivial.

---

## 7. Global expansion comparison

| Market | One cited number | Competitive intensity | Pricing level | Compliance drivers | CAC difficulty | Product maturity needed |
|---|---|---|---|---|---|---|
| **USA** | North America = 39.4% of 2025 AppSec revenue [S1]; US breach average USD 10.22 m (2025) [S3] | Very high (Snyk, Semgrep, GitHub, Checkmarx, Veracode, etc.) | Highest ($25–30+/dev/mo list [S27–S29]) | SOC 2 (customer-driven), PCI DSS v4.x (req. 6.4.2 for public web apps effective 31 Mar 2025 [S36]) | Very high | Very high: SOC 2 for Codefy itself, SSO, broad language coverage |
| **UK** | 43% of businesses (~612,000) identified a breach or attack in the last 12 months [S32] | High | High | PCI DSS v4.x, UK GDPR, customer SOC 2 / ISO 27001 | High | High |
| **EU** | CRA reporting obligations live since 11 Sep 2026 [S33a]; fines up to €15 m or 2.5% of turnover [S33b] | Medium-high, fragmented | High | NIS2, DORA (financial), CRA (products with digital elements) | High (languages, GDPR, data residency) | Highest: EU hosting, SBOM/vulnerability-handling evidence |
| **Singapore** | No verified market-size figure. Cybersecurity (Amendment) Act 2024 key provisions in force 31 Oct 2025 [S40] | Medium | Medium-high | MAS TRM (financial institutions), CSA Cyber Trust mark | Medium | Medium-high |
| **UAE** | Middle East average breach cost USD 8 m (2026) [S34] | Medium (global vendors through partners) | Medium-high | UAE IA standard / NESA (government and critical sectors), central-bank rules | Medium (partner-led, relationship-driven) | Medium |

DSCI names **North America, the Middle East and Southeast Asia** as the most significant export markets for Indian cyber products, and **55%** of Indian cyber product companies have expanded globally, mostly through channel partners [S9].

**Recommended sequence after India:**

1. **UAE (with GCC partners)** in year 2: Indian founders already have networks there, regulation creates demand, competition is lighter, and the time zone works.
2. **Singapore / SEA** in years 2–3: the MAS TRM fintech wedge mirrors the India fintech playbook.
3. **UK** in year 3: English-speaking and PCI-driven, but needs SOC 2 / ISO 27001 for Codefy.
4. **USA** in years 3–4: start with developer-led self-serve (IDE/CLI) only, and avoid head-on enterprise sales against Snyk/GitHub.
5. **EU** last: CRA is an opportunity, but it needs EU hosting and mature SBOM/vulnerability-handling features.

---

## 8. Source register

P = primary (the issuing organisation's own page or document); P-PR = the publisher's own press release for a paywalled report; S = secondary. Accessed 2026-11-20 for all.

| ID | Claim | Source (title) | Org | Date | URL | P/S | Confidence |
|---|---|---|---|---|---|---|---|
| S1 | AppSec USD 42.09 bn by 2033, 18.8% CAGR; NA 39.4% | Application Security Market To Reach $42.09 Billion By 2033 | Grand View Research | Jan 2026 | https://www.grandviewresearch.com/press-release/global-application-security-market | P-PR | Medium |
| S2 | AppSec USD 23.45 bn by 2031 (11.5% CAGR, ~13.63 bn 2026 from snippet) | Application Security Industry worth $23.45 billion by 2031 | MarketsandMarkets | n/d (2026) | https://www.marketsandmarkets.com/PressReleases/application-security.asp | P-PR (blocked; read via search index) | Low-Med |
| S3 | Global USD 4.44 m; US USD 10.22 m | IBM Report: 13% of organizations reported breaches of AI models… | IBM | 30 Jul 2025 | https://newsroom.ibm.com/2025-07-30-ibm-report-13-of-organizations-reported-breaches-of-ai-models-or-applications,-97-of-which-reported-lacking-proper-ai-access-controls | P | High |
| S4 | India INR 220 m (₹22 cr), +13% | India Records Highest Average Cost of a Data Breach | IBM India | 7 Aug 2025 | https://in.newsroom.ibm.com/2025-08-07-India-Records-Highest-Average-Cost-of-a-Data-Breach-IBM | P | High |
| S5 | India ₹25.5 cr (+15.9%); offensive testing saves ₹2.47 cr | India Records its Highest Average Cost of a Data Breach 2026 | IBM India | 3 Aug 2026 | https://in.newsroom.ibm.com/India-Records-its-Highest-Average-Cost-of-a-Data-Breach-2026 | P | High |
| S6 | Global USD 4.99 m (2026) | IBM Study: One in four malicious breaches are AI-enabled… | IBM | 29 Jul 2026 | https://newsroom.ibm.com/2026-07-29-ibm-study-one-in-four-malicious-breaches-are-ai-enabled,-costing-companies-6-million-on-average | P | High |
| S7 | Exploitation 20% of breaches, +34%; 12,195 breaches; third party 30% | 2025 Data Breach Investigations Report (news release) | Verizon | 23 Apr 2025 | https://www.verizon.com/about/news/2025-data-breach-investigations-report | P | High |
| S8 | 31% start with exploitation; third party 48% | Vulnerability exploitation top breach entry point, 2026 DBIR | Verizon | 19 May 2026 | https://www.verizon.com/about/news/breach-industry-wide-dbir-finds | P | High |
| S9 | 400+ cyber product cos; USD 4.46 bn 2025; ~6 bn 2026E; 45%+ domestic; 55% global | Press Release: Indian Cybersecurity Product Landscape 3.0 | DSCI | 4 Dec 2025 | https://www.dsci.in/files/content/press-release/2026/Press-Release_Indian-Cybersecurity-Product-Landscape-3.0-Dec-25.pdf | P-PR | High |
| S10 | 29.44 lakh incidents (2025); 231 empanelled auditors | CERT-In: India's Frontline Defender against Cyber Threats (Backgrounder) | PIB / MeitY | 23 Jan 2026 | https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/jan/doc2026123764501.pdf | P | High |
| S11 | 20,41,360 incidents (2024) | Delhi tops cybersecurity incidents as cases double nationwide since 2021 (citing Lok Sabha reply) | ThePrint | 2026 | https://theprint.in/india/delhi-tops-cybersecurity-incidents-as-cases-double-nationwide-since-2021-govt/2887649 | S | Medium-High (consistent across outlets) |
| S12 | 6-hour reporting; 180-day logs; effective 27 Jun 2022 | Ergo newsflash on CERT-In Directions (primary PDF: cert-in.org.in/PDF/CERT-In_Directions_70B_28.04.2022.pdf, not fetched) | Khaitan & Co | 30 Apr 2022 | https://khaitanco.com/sites/default/files/2022-04/Ergo_30042022.pdf | S | High |
| S13 | VA ≥6-monthly, PT ≥12-monthly; independent auditors; applicability | RBI (IT Governance, Risk, Controls and Assurance Practices) Directions, 2023 | RBI | 7 Nov 2023 | https://rbi.org.in/Scripts/NotificationUser.aspx?Id=12562&Mode=0 | P | High |
| S14 | CSCRF circular no. and date | Cybersecurity and Cyber Resilience Framework (CSCRF) for SEBI REs | SEBI | 20 Aug 2024 | https://www.sebi.gov.in/legal/circulars/aug-2024/cybersecurity-and-cyber-resilience-framework-cscrf-for-sebi-regulated-entities-res-_85964.html | P | High |
| S15 | VAPT through CERT-In auditor; scope incl. API; CVE/CWE/OWASP + EPSS/SSVC report format | Implementation of SEBI CSCRF circular w.r.t. VAPT Audit Report Submission (NSDL/POLICY/2025/0121) | NSDL | 15 Sep 2025 | https://nsdl.com/nsdl/circulars/2025-0121-Policy-Implementation_of_SEBI_CSCRF_Circular_w.r.t._Vapt_Audit_Report_Submission.pdf | P | High |
| S16 | DPDP Rules notified 14 Nov 2025; 18-month phasing; ₹250 cr / ₹200 cr penalties | DPDP Rules, 2025 Notified (Backgrounder) | PIB / MeitY | 17 Nov 2025 | https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251117695301.pdf | P | High |
| S17 | 2,12,283 DPIIT startups; 6,789 closed | Lok Sabha reply on startups (PIB release) | PIB / DPIIT | 17 Mar 2026 | https://pib.gov.in/PressReleasePage.aspx?PRID=2241313 | P | High |
| S18 | 2.23 lakh startups at 31 Mar 2026; 55,200 in FY26 | Startup count crosses 2.23 lakh… | Angel One (news) | Apr 2026 | https://www.angelone.in/news/economy/startup-count-crosses-2-23-lakh-as-india-recognises-55-200-entities-in-fy26-employment-expands | S | Medium |
| S19 | India 21.9 m GitHub devs; 5.2 m+ new; 57.5 m by 2030; TS #1, Python #2 | Octoverse: A new developer joins GitHub every second… | GitHub | 28 Oct 2025 | https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/ | P | High |
| S20 | 1,000+ SaaS cos; 150+ >$1 m ARR | Indian SaaS Landscape Growing ~1.5X Faster than Global SaaS | NASSCOM (with SaaSBoomi, Zinnov) | 23 Jul 2020 | https://www.nasscom.in/sites/default/files/media_pdf/Press-Release-NASSCOM-SaaS-Report-2020-23-Jul-2020.pdf | P-PR | Medium (dated) |
| S21 | 16,461 fintechs; 2,890 funded (Tracxn) | How Fintech is Fueling India's Startup Growth in 2026 | Analytics Insight | 1 Jul 2026 | https://www.analyticsinsight.net/fintech/how-fintech-is-fueling-indias-startup-growth-in-2026 | S | Medium |
| S22 | FY26E USD 315 bn; IT services USD 149 bn; 3,500+ members | Nasscom Annual Strategic Review 2026 (press release) | NASSCOM | 24 Feb 2026 | https://d3r3sr3o54kk15.cloudfront.net/s3fs-public/media_pdf/India%E2%80%99s%20tech%20industry%20continues%20to%20redefine%20AI-led%20transformation%2C%20efficiency%20and%20skilling--%20Nasscom%20Annual%20Strategic%20Review%202026.pdf | P-PR | High |
| S23 | 1,750+ GCCs | Nasscom Annual Strategic Review 2025 (press release) | NASSCOM | 24 Feb 2025 | https://nasscom.in/sites/default/files/media_pdf/Nasscom%20SR%20Press%20release.pdf | P-PR | High |
| S24 | Web ₹40k–1.5 L; API ₹40k–1.2 L; 1–3 weeks | VAPT cost India 2026 | Tranquility Cybersecurity (TCSA) | 10 Jun 2026 | https://www.tcsa.in/resources/vapt-cost-india-2026 | P (vendor price page) | Medium |
| S25 | Web ₹1.2–3.5 L; large ₹4–12 L+; 6–12 days | VAPT cost India | Cybersigma | 29 Jun 2026 | https://cybersigmacs.com/blog/vapt-cost-india/ | P (vendor price page) | Medium |
| S26 | ₹40k–8.5 L; plan prices ₹1.67 L / ₹5 L / ₹6.65 L | VAPT Pricing: How Much Does a Website VAPT Cost? | Astra Security | updated 17 Feb 2026 | https://www.getastra.com/blog/security-audit/vapt-cost-pricing/ | P (vendor) | Medium |
| S27 | Snyk Team from $25/mo, up to 10 devs | Snyk Pricing | Snyk | accessed | https://snyk.io/pricing/ | P | High |
| S28 | Semgrep Teams $30/contributor/mo; free ≤10 | Semgrep Pricing | Semgrep | accessed | https://semgrep.dev/pricing | P | High |
| S29 | GitHub Code Security $30, Secret Protection $19 per active committer/mo | GitHub Advanced Security is here for GitHub Team organizations | GitHub | 1 Apr 2025 | https://github.blog/changelog/2025-04-01-github-advanced-security-is-here-for-github-team-organizations | P | High |
| S30 | AppSec engineer ₹4–34 L (747 salaries, Jul 2025) | Application Security Engineer Salary | AmbitionBox | Jul 2025 | https://www.ambitionbox.com/profile/application-security-engineer-salary | S (read via search index) | Medium |
| S31 | Security Engineer, Mumbai, ₹7.1 L avg base (85 salaries) | Security Engineer Salaries, Mumbai | Glassdoor | Jun 2026 | https://www.glassdoor.com.hk/Salaries/mumbai-india-security-engineer-salary-SRCH_IL.0,12_IM1070_KO13,30.htm | S (read via search index) | Low-Med |
| S32 | 43% of UK businesses (~612,000) breached | Cyber security breaches survey 2025/2026 | UK DSIT / Home Office | 30 Apr 2026 | https://www.gov.uk/government/statistics/cyber-security-breaches-survey-20252026/cyber-security-breaches-survey-20252026 | P | High |
| S33a | CRA reporting from 11 Sep 2026 | CRA reporting | European Commission | 2026 | https://digital-strategy.ec.europa.eu/en/policies/cra-reporting | P | High |
| S33b | CRA fines up to €15 m / 2.5% | EU Cyber Resilience Act: 24-hour reporting duties start Sept 11, 2026 | Jones Day | Jul 2026 | https://www.jonesday.com/de/insights/2026/07/eu-cyber-resilience-act-24hour-reporting-duties-start-september-11-2026 | S | High |
| S34 | Middle East average breach cost USD 8 m | IBM Cost of a Data Breach — Middle East findings 2026 | IBM MEA | 3 Aug 2026 | https://mea.newsroom.ibm.com/codb-me-findings-2026 | P | High |
| S36 | PCI DSS 6.4.2 effective as of 31 Mar 2025 | FAQ 1593 — superseded requirements after 31 March 2025 | PCI SSC | Mar 2025 | https://www.pcisecuritystandards.org/faq/articles/Frequently_Asked_Question/how-should-pci-dss-v4-x-requirements-noted-as-superseded-by-another-requirement-be-reported-after-31-march-2025 | P | High |
| S37 | India AppSec USD 73.6 m (2025) | India Application Security Market | IMARC Group | 2026 | https://www.imarcgroup.com/india-application-security-market | P-PR | Low-Med |
| S38 | India AppSec ~USD 1,738.8 m (2024) | India Application Security Market analysis | MarketsandMarkets | n/d | https://www.marketsandmarkets.com/Market-Reports/geography/application-security-market/India | P-PR (blocked; snippet) | Low |
| S39 | ₹93.44/USD close, 18 Nov 2026 | Rupee closes higher at 93.44… (PTI) | Telangana Today | 18 Nov 2026 | https://telanganatoday.com/rupee-closes-higher-at-93-44-despite-strong-dollar-and-market-weakness | S | Medium-High |
| S40 | Singapore Cybersecurity (Amendment) Act 2024 in force 31 Oct 2025 | Singapore: CSA Cyber Landscape Report 2025/2026 | Baker McKenzie | 29 Jul 2026 | https://www.bakermckenzie.com/en/insight/publications/2026/07/singapore-csa-cyber-landscape-report-2025-2026 | S | Medium-High |

**Open verification items:** the DBIR web-application share (needs the full PDF); a current Indian SaaS company count (the latest verified figure is from 2020); an MCA count of software firms (assumption A2); the 2026 RBI cyber direction for commercial banks; and MarketsandMarkets' figures (pages blocked automated access).
