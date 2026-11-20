# Competitor Pricing — AppSec Tools (accessed 2026-11-20)

All URLs were accessed on **2026-11-20**. "Search snippet" means the figure was seen in search-result text and the page itself was not opened.

**Labels:** **VP** = VERIFIED PUBLIC PRICE (on the vendor's page or the vendor's own marketplace listing) · **H** = HISTORICAL (dated or superseded) · **E** = ESTIMATE (third-party or spend data) · **U** = UNPUBLISHED (contact sales).

## Exchange rate used

**USD 1 = ₹93.3461**. This is the RBI/FBIL reference rate for **19-Nov-2026**, as listed in MSEI's "Historical Data for RBI Reference Rate" archive (https://www.msei.in/markets/Currency/Historical-Data/RBIReferenceRateArchives.aspx). FBIL has published this rate since 2018. Nearby values were 93.5703 (17-Nov) and 93.7650 (12-Nov; matches FBIL figure quoted at https://clarityupsc.com/live-economic-data/rupee-dollar/). All INR figures exclude GST and are rounded to ₹1. No EUR conversion was needed.

---

## Snyk
- **Free:** $0. 5 projects; Snyk Code 100 tests/month (Open Source 200, IaC 300, Container 100). **VP**
- **Team:** "$25 per contributing developer/month, minimum 5 devs / $1,375 annually". The plan allows 5 to 10 contributing developers and 100 projects. **VP**
- **Enterprise (Platform Subscription):** "Contact Sales". The page publishes credit rates (1 credit = $1): Code 1.0 and Open Source 1.0 credit per Active Contributor per day; Secrets 0.66; IaC 0.33; API & Web (DAST) 3.0 credits per Provisioned Target per day; Evo AI Pentesting 4,000 credits per assessment. Implied list price for Code alone is about $365 per contributor per year (≈₹34,071). **VP** (unit rates) / **U** (contract)
- **Unit:** contributing developer (committed to a monitored private repo in the last 90 days).
- **Sources:** https://snyk.io/plans/ ; https://snyk.io/start/team

## Semgrep
- **Free:** $0 for up to **10 contributors** and 10 private repos. Includes Code (SAST) and Supply Chain (SCA), plus 60 AI credits. Secrets is not included. **VP**
- **Teams:** Code $30, Supply Chain $30 and Secrets $15 per contributor per month. Up to 500 private repos and 20 AI credits per developer per month. **VP**
- **Enterprise:** custom/volume pricing. **U**
- **Unit:** per contributor per month, priced per product.
- **Source:** https://semgrep.dev/pricing

## SonarQube Server (Community Build / Developer / Enterprise / Data Center)
- **Community Build:** free, open source. **VP** (no price card)
- **Developer / Enterprise / Data Center:** "Priced per instance, per year, based on your lines of code". Get the quote from sales. **U**
- **Estimate:** about $2,500/yr for up to 100K LOC (dev.to guide, search snippet: https://dev.to/rahulxsingh/sonarqube-pricing-in-2026-community-developer-enterprise-and-cloud-costs-explained-bdg). **E**
- **Unit:** instance per year, by LOC tier.
- **Sources:** https://www.sonarsource.com/plans-and-pricing/sonarqube/ ; https://www.sonarsource.com/plans-and-pricing/developer

## SonarQube Cloud (formerly SonarCloud)
- **Free:** $0, private projects up to 50k LOC. Free for OSS. **VP**
- **Team:** **$34/month billed monthly, starting at 100k LOC**. Higher LOC increments are available. **VP**
- **Enterprise:** annual, contact sales. Advanced Security (advanced SAST and SCA) is an extra subscription. **U**
- **Unit:** LOC (not seats).
- **Source:** https://www.sonarsource.com/plans-and-pricing/

## GitHub Advanced Security (Secret Protection / Code Security)
- **Free (public repos):** secret scanning, push protection, CodeQL and Copilot Autofix. Dependabot and the dependency graph are free on all repos. **VP**
- **GitHub Secret Protection:** $19 per active committer per month. **VP**
- **GitHub Code Security:** $30 per active committer per month. **VP**
- **Base plan:** the add-ons are listed for Team ($4/user/month) and Enterprise ($21/user/month). **VP**
- **Gating:** some AI features (AI Scan, agentic autofix, AI-detected secrets) consume AI Credits. Public monitoring and OSS license compliance are Enterprise-only.
- **Unit:** active committer.
- **Sources:** https://github.com/security/plans ; https://github.com/pricing

## CodeRabbit (AI PR review)
- **Free:** reviews on public/OSS repos. The IDE extension is free with rate limits (https://docs.coderabbit.ai/overview/ide-cli-review, search snippet). **VP**
- **Essentials:** $24/dev/month annual, or $30 monthly. **VP**
- **Team:** $48 annual / $60 monthly. **VP**
- **Advanced:** $72 annual / $90 monthly. **VP**
- **Enterprise:** contact. **U**
- **Overage:** $0.25 per reviewed file over the hourly allowance; agent use $0.40/min.
- **Unit:** per developer who opens PRs.
- **Source:** https://www.coderabbit.ai/pricing

## Checkmarx One
- **Vendor page:** "no one-size-fits-all list price". Every tier is "Get A Custom Quote". **U**
- **AWS Marketplace list (vendor listing), per license per year:** CxOne Start with SAST NG $1,035; CxOne Essential $1,564; DevAssist add-on $300; Container $240; API Security $276. **Minimum deal USD 30,000 for 1 year / USD 90,000 for 3 years.** **VP**
- **Unit:** per license (DevAssist is per developer; some modules are per application).
- **Sources:** https://checkmarx.com/pricing/ ; https://aws.amazon.com/marketplace/pp/prodview-xbxjoco7f6xwi

## Veracode
- **Vendor page:** no prices; "Request a Demo / Contact Us". **U**
- **Estimate:** SpendHound average annual spend $19,994 (SMB) and $555,147 (enterprise). Last updated 29-Oct-2026. **E**
- **Unit:** Unknown publicly. Third parties describe per-application pricing.
- **Sources:** https://www.veracode.com/pricing/ ; https://www.spendhound.com/marketplace/veracode-pricing

## Invicti (and Acunetix, now "Invicti Web + API")
- **Agentic Pentest:** "$500 max per pentest" for one app and its API suite. **VP**
- **Web + API / AppSec Core / AppSec Flex:** no price shown; quote or demo only. **U**
- **AWS Marketplace (vendor listing, 12 months):** Invicti Ent On Demand, 50 targets: $37,000. Invicti ASPM, "150 Users and Targets": $60,000. Acunetix Online Premium, 5 targets: $7,000. **VP** (marketplace list; the Acunetix SKU predates the rebrand)
- **Rebrand:** acunetix.com/pricing shows a banner "Acunetix is now Invicti Web + API".
- **Unit:** target (one FQDN; each subdomain or port counts separately) or per pentest.
- **Sources:** https://www.invicti.com/pricing ; https://www.acunetix.com/pricing/ ; https://aws.amazon.com/marketplace/pp/prodview-cene4t3k5k5wm

## StackHawk
- **Wingman:** **$10/user/month**, 14-day trial, unlimited apps, 50 scans per user per month. **VP**
- **Scale:** "Talk to us". Includes attack-surface discovery and SSO. **U**
- **Free tier:** none beyond the trial.
- **Unit:** user.
- **Source:** https://www.stackhawk.com/pricing/

## Burp Suite (PortSwigger)
- **Community:** free. **VP**
- **Professional:** **$499**. The page doesn't state the unit; Capterra and third-party snippets say per user per year, up from $449 before Jan 2026. **VP** (price) / unit from search snippet
- **Burp AI:** credits or a subscription add-on. Pack prices were not found. **U**
- **DAST (formerly Enterprise):** "Tailored to Your Needs", unlimited users. **U**
- **Sources:** https://portswigger.net/burp/pro ; https://portswigger.net/burp/dast/pricing ; https://www.capterra.com/p/178476/PortSwigger/pricing/ (search snippet)

## ZAP by Checkmarx
- **Price:** "Free and open source". No paid tier is mentioned. **VP**
- **Source:** https://www.zaproxy.org/

## Aikido Security
- **Developer (free):** 2 users, 10 repos, 1 domain, 1 cloud account, 10 AI AutoFixes/month. **VP**
- **Basic / Pro / Advanced:** flat fee that includes 10 users. **VP** (vendor page); USD figures from PricingSaaS
  - **Vendor page (fetched 2026-11-20):** shows "300 / 600 / 600 per month" with **no currency symbol rendered**.
  - **PricingSaaS capture of the vendor page (16-Nov-2026):** Basic **$350/month** monthly ($315 annual), Pro $700 ($630), Advanced $1,050 ($945).
- **Enterprise:** tailored pricing. **U**
- **Pentest:** "Typical Pentest" listed as **€3.500 / $4,000 / ₹265,000 / £3,000 per assessment**. The INR price is a regional price; it is not a conversion. **VP**
- **Unit:** flat fee per org tier (10 users included); pentest per assessment.
- **Sources:** https://www.aikido.dev/pricing ; https://pricingsaas.com/companies/aikido

---

## Indian players

### Beagle Security (AI pentest / DAST; offices in Kerala and San Francisco)
- **Free:** 1 lite test/month after a 14-day trial. **VP**
- **Essential:** $99/month (2 tests/month, 5 users). **VP**
- **Advanced:** $299/month (15 tests/month, API/GraphQL testing). **VP**
- **Enterprise:** custom. **U**
- **Unit:** tests per month. Payments go through Stripe and Razorpay. INR and GST are not mentioned.
- **Source:** https://beaglesecurity.com/pricing

### Astra Security (DAST scanner + PTaaS; HQ listed as Chandigarh)
- **Scanner Lite:** $69/month ($699/yr), 1 target. **VP**
- **Scanner:** $199/month ($1,999/yr). **VP**
- **Pentest Auto:** $2,999 per pentest. **VP**
- **Pentest Expert:** $5,999 per pentest. **VP**
- **Enterprise:** "$9,999/yr onwards". **VP**
- **INR:** Astra's own blog lists "Starting at INR 16,000" with no unit stated. **VP** (unit unknown)
- **Unit:** per target or per pentest.
- **Sources:** https://www.getastra.com/pricing ; https://www.getastra.com/blog/penetration-testing/companies-in-india/

### Appknox (mobile SAST/DAST/API; HQ Bengaluru per YourStory snippet, Singapore per CB Insights)
- **Plans:** Starter, Professional and Advanced; pricing on request. **U**
- **Unit:** number of unique apps.
- **Source:** https://www.appknox.com/pricing

### Indusface (AppTrana WAAP, WAS/DAST; HQ Vadodara)
- **AppTrana Advanced:** $99 per FQDN per month (WAF/WAAP, not a scanner). **VP**
- **Premium / Enterprise:** custom. **U**
- **WAS (DAST):** "from $59", unit not given. **VP** (incomplete)
- **Reseller INR:** "From ₹6,000 / application / month (billed annually)" for Advanced (search snippet, https://itforsme.in/pricing/indusface-apptrana-india). **E**
- **Source:** https://www.indusface.com/pricing/

### CloudSEK (BeVigil external ASM, XVigil digital risk; main office Bengaluru)
- **BeVigil Enterprise, AWS Marketplace:** Starter $35,000 per 12 months (up to 500 assets); Standard $70,000 (search snippet, https://aws.amazon.com/marketplace/pp/prodview-hwpvn62c5w7t6). **VP** (not opened)
- **XVigil:** no published price. **U**

### Strobes (ASM/RBVM/ASPM/PTaaS; HQ Plano, TX per LinkedIn)
- **Current:** credit-based, scaling with assets; contact sales. **U**
- **Older PTaaS entry:** "$499/month, 1 pentest per year" (G2, last updated Oct-2024, search snippet: https://g2.com/products/strobes-ptaas/pricing). **H**

---

## Summary — cheapest paid entry for a 10-developer team (USD 1 = ₹93.3461)

| Product | Cheapest paid entry, ₹/month (formula) | Unit | Label |
|---|---|---|---|
| Snyk Team | **₹23,337** = $25 × 10 × 93.3461 | contributing dev | VP |
| Semgrep Teams (Code only) | **₹28,004** = $30 × 10 × R. Free tier covers 10 contributors, so ₹0 is possible within its limits. | contributor/product | VP |
| SonarQube Cloud Team | **₹3,174** = $34 × R (100k LOC; seat count irrelevant) | LOC | VP |
| SonarQube Server Developer | **≈₹19,447** = $2,500/12 × R | instance/LOC | E (vendor U) |
| GitHub Secret Protection | **₹21,470** = ($19 + $4 Team) × 10 × R | active committer | VP |
| GitHub Code Security | **₹31,738** = ($30 + $4) × 10 × R | active committer | VP |
| CodeRabbit Essentials | **₹22,403** = $24 × 10 × R (annual); ₹28,004 monthly | PR-opening dev | VP |
| Checkmarx One | **₹2,33,365** = $30,000 min/12 × R (10 × $1,035 is below the minimum) | license; $30k minimum | VP (AWS list) |
| Veracode | **≈₹1,55,530** = $19,994/12 × R | Unknown (app-based) | E |
| Invicti / Acunetix | **₹54,452** = $7,000/12 × R (5 targets); Agentic Pentest ₹46,673 per pentest | target / pentest | VP (AWS list / vendor) |
| StackHawk Wingman | **₹9,335** = $10 × 10 × R | user | VP |
| Burp Suite Pro | **₹38,816** = $499 × 10 / 12 × R. A single seat is ₹3,882/month. | user/year | VP |
| ZAP by Checkmarx | ₹0 | — | VP |
| Aikido Basic | **₹32,671** = $350 × R (10 users included); ₹29,404 on annual billing | org tier | VP (via PricingSaaS capture) |
| Beagle Security Essential | **₹9,241** = $99 × R | tests/month | VP |
| Astra Scanner Lite | **₹6,441** = $69 × R (1 target) | target | VP |
| Indusface AppTrana Advanced | **₹9,241** = $99 × R (1 FQDN, WAAP) | FQDN | VP |
| CloudSEK BeVigil Starter | **₹2,72,259** = $35,000/12 × R | assets (≤500) | VP (snippet) |
| Appknox | — | app | U |
| Strobes | — (older $499/month = ₹46,580) | assets/credits | U / H |

### Pricing not verifiable (contact sales only)
Veracode, Checkmarx (direct), SonarQube Server editions, Burp Suite DAST, Invicti Web + API / AppSec Core, StackHawk Scale, Snyk Enterprise contract value, Appknox, Strobes (current), CloudSEK XVigil, Burp AI credit packs.
