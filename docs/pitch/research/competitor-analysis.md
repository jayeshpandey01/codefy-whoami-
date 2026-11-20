# Competitor Analysis — AppSec Landscape (accessed 2026-11-20)

All sources were accessed 2026-11-20. Pricing is in [`competitor-pricing.md`](competitor-pricing.md).

**Legend:** **Y** = vendor documents it · **P** = partial, limited or add-on · **N** = official docs say it is not offered · **U** = Unknown (not found in the pages reviewed; not proof of absence). Bracketed numbers point to the footnotes.

## 1. Category classification

| Product | SAST | DAST | SCA | Secrets | Code review | AI code security | ASPM / unified | Pentest / VAPT | Recon / ASM |
|---|---|---|---|---|---|---|---|---|---|
| Snyk | Y | Y [1] | Y | Y | U | Y [2] | Y | Y (AI pentest, Enterprise) [1] | P (API discovery) [1] |
| Semgrep | Y | U | Y | Y | U | Y [3] | U | U | U |
| SonarQube Server / Cloud | Y | U | P (add-on) [4] | Y [5] | Y (code quality) | Y (AI CodeFix, AI Code Assurance) [4] | U | U | U |
| GitHub Advanced Security | Y (CodeQL) | U | Y (Dependabot) | Y | U | Y (Copilot Autofix, AI Scan) [6] | P | U | U |
| CodeRabbit | U | U | U | U | **Y (AI PR review)** [7] | P | U | U | U |
| Checkmarx One | Y | Y [8] | Y | Y [8] | U | Y (Developer Assist) [8] | Y [8] | U | U |
| Veracode | Y | Y [9] | Y | U | U | Y (Veracode Fix) [10] | U | U | P (EASM in DAST) [9] |
| Invicti / Acunetix | P [11] | Y | P [11] | U | U | Y [11] | Y (ASPM SKU) [12] | Y (Agentic Pentest) [11] | P [11] |
| StackHawk | U | Y | U | U | U | Y (Wingman) [13] | U | U | Y (Scale tier) [14] |
| Burp Suite | U | Y | U | U | U | Y (Burp AI) [15] | U | Y (manual tooling) | U |
| ZAP by Checkmarx | U | Y | U | U | U | U | U | P (manual tooling) | U |
| Aikido | Y | Y | Y | Y | Y (PR security review) | Y | Y | Y (separate pentest service) | Y (Pro tier) [16] |
| Beagle Security (IN) | U | Y | U | U | U | Y (agentic AI pentest) | U | Y | P (surface scan) [17] |
| Astra Security (IN) | U | Y | U | U | U | P (AI fix assist) | U | Y | U |
| Appknox (IN) | Y (mobile) | Y (mobile) | P (SBOM add-on) | U | U | U | U | Y (service) | U |
| Indusface (IN) | U | Y (WAS) | U | U | U | P (AI-assisted pentest) | U | P (add-on) | U |
| CloudSEK (IN) | U | U | U | U | U | P (Nexus AI) | U | U | **Y (BeVigil)** [18] |
| Strobes (IN-founded) | U | U | U | U | U | P (AI pentesting) | Y | Y (PTaaS) | Y [19] |

## 2. Feature table

| Product | SAST | DAST | Recon / ASM | Exploit validation / proof-based | AI features (what exactly) | IDE plugin | Primary customer |
|---|---|---|---|---|---|---|---|
| Snyk | Y | Y (API & Web, from Probely) | P | P: Evo AI Pentesting (Enterprise) [1] | Snyk Agent Fix (formerly DeepCode AI Fix) autofix in IDE and PR; Evo coding-agent security [2] | Y [2] | Dev teams up to Enterprise |
| Semgrep | Y | U | U | U | Assistant / "Multimodal": AI triage (false-positive filtering with memories), AI autofix suggestions, AI detection [3] | P (MCP server for VS Code) [3] | Dev and AppSec teams |
| SonarQube Server / Cloud | Y | U | U | U | AI CodeFix (Server Enterprise), AI Code Assurance; Gitar AI code review sold separately at $20/user/month [4] | Y (SonarQube for IDE, free) [5] | Dev teams (code quality first) |
| GitHub Advanced Security | Y | U | U | U | Copilot Autofix, AI Scan for PRs and repos, agentic autofix, AI-detected secrets (several use AI Credits) [6] | U | Teams already on GitHub |
| CodeRabbit | U | U | U | U | **AI pull-request review** (summaries, line comments, one-click fixes); it is a reviewer, not a vulnerability scanner [7] | Y (VS Code, Cursor, Windsurf; free with limits) [7] | Dev teams, any size |
| Checkmarx One | Y | Y | U | P: DAST marketed as confirming exploitability [8] | Developer Assist: agentic find, fix and re-check in IDE and for coding agents; MCP server [8] | Y [8] | Large enterprise ($30k minimum deal) |
| Veracode | Y | Y | P (EASM) [9] | U | Veracode Fix: AI patches for SAST and SCA findings, human-approved [10] | Y (VS Code, JetBrains, Eclipse, Visual Studio for Fix for SAST) [10] | Enterprise, regulated |
| Invicti / Acunetix | P | Y | P | **Y: proof-based scanning** confirms findings with safe read-only exploits; vendor claims 99.98% accuracy on confirmed results [20] | AI-guided fixes, agentic prioritisation, $500 agentic pentest, LLM security testing [11] | U | Mid-market to enterprise AppSec |
| StackHawk | U | Y | Y (Scale) | P: Wingman re-scans to verify fixes [13] | Wingman: runs DAST from inside Claude Code, Cursor, Copilot, Codex and Antigravity; agent fixes the issue and re-scans [13] | P (via coding agents) | Dev-first API/web teams |
| Burp Suite | U | Y | U | Y (manual exploitation by tester) | Burp AI: Explainer, "Explore This", AI scan enhancements; per-user credits or a subscription [15] | U | Pentesters, security teams |
| ZAP by Checkmarx | U | Y | U | P (manual) | U | U | Individuals, OSS, CI users |
| Aikido | Y (incl. "AI SAST") | Y | Y (Pro) | P: AI pentesting uses credits; pentests also sold as a service [16] | AI AutoFix (10/month free, unlimited paid), PR security review, AI pentesting, AI code analysis [16] | Y [16] | SMB / mid-market dev teams |

**Footnotes**
- [1] https://snyk.io/plans/ (API & Web credits, Evo AI Pentesting); https://snyk.io/news/snyk-launches-snyk-api-and-web-to-reimagine-dast-innovation-for-ai-era (search snippet)
- [2] https://snyk.io/product/snyk-code/
- [3] https://semgrep.dev/pricing ; https://semgrep.dev/docs/semgrep-assistant/overview and https://semgrep.dev/blog/2026/semgrep-mcp-server (search snippets)
- [4] https://www.sonarsource.com/plans-and-pricing/ ; https://www.sonarsource.com/plans-and-pricing/sonarqube/
- [5] https://sonarsource.com/solutions/secrets-detection (search snippet)
- [6] https://github.com/security/plans
- [7] https://www.coderabbit.ai/pricing ; https://docs.coderabbit.ai/overview/ide-cli-review (search snippet)
- [8] https://checkmarx.com/checkmarx-one-developer-assist and https://checkmarx.com/platform/ (search snippets); https://aws.amazon.com/marketplace/pp/prodview-xbxjoco7f6xwi
- [9] https://www.veracode.com/products/dynamic-analysis-dast/ (search snippet)
- [10] https://docs.veracode.com/r/About_Veracode_Fix (search snippet)
- [11] https://www.invicti.com/pricing (AppSec Core: "code, runtime, and supply chain"; ASM appears only in site navigation)
- [12] https://aws.amazon.com/marketplace/pp/prodview-cene4t3k5k5wm
- [13] https://www.stackhawk.com/pricing/ ; https://www.stackhawk.com/product/wingman/ (search snippet)
- [14] https://www.stackhawk.com/pricing/ ("Attack surface discovery" on Scale)
- [15] https://portswigger.net/burp/documentation/desktop/burp-ai/ai-credits (search snippet)
- [16] https://www.aikido.dev/pricing
- [17] https://beaglesecurity.com/pricing
- [18] https://www.cloudsek.com/platform/bevigil (search snippet)
- [19] https://www.gartner.com/reviews/product/strobes-security-1923728412 (search snippet)
- [20] https://www.invicti.com/features/proof-based-scanning (search snippet)

## 3. Notable free capabilities and enterprise-only gates

| Product | Notable free capability | Enterprise-only / paid gate |
|---|---|---|
| Snyk | 5 projects; 100 Snyk Code tests/month | Evo AI Pentesting and coding-agent security need an Enterprise Platform Subscription; Team is capped at 10 developers |
| Semgrep | Code + Supply Chain free for **up to 10 contributors** and 10 private repos | Secrets is paid only; SSO/RBAC/API on Teams and above; self-managed SCM, custom AI model and dedicated infra are Enterprise |
| SonarQube | Community Build (self-host) free; Cloud free to 50k LOC; IDE extension free with secrets detection | AI CodeFix, portfolios, SCIM, MISRA, legacy languages (COBOL, ABAP…) are Enterprise; advanced SAST/SCA is an extra subscription |
| GitHub | CodeQL, secret scanning, push protection and Copilot Autofix free on **public** repos; Dependabot free everywhere | Private repos need the paid add-ons; public-leak monitoring and OSS license compliance are Enterprise-only |
| CodeRabbit | Free reviews on public repos; free IDE reviews (rate-limited) | SSO, audit logs, self-hosting and custom regions are Enterprise |
| Checkmarx | ZAP is free (Checkmarx-branded OSS); 1-month Developer Assist trial (homepage snippet) | Everything else is quoted, with a $30k/year minimum |
| Invicti | — | All scanning is quoted; only the $500 agentic pentest is self-serve |
| StackHawk | 14-day trial only | Attack-surface discovery, SSO and program reporting are on Scale (quoted) |
| Burp Suite | Community Edition (manual proxy; limited) | Automated scanning in Pro ($499); DAST at scale is quoted |
| ZAP | Fully free | — |
| Aikido | Free plan includes SAST, SCA, secrets, cloud, DAST, IDE plugins and 10 AI AutoFixes/month | Attack surface monitoring and on-prem scanning start at Pro; SIEM at Advanced; FedRAMP at Enterprise |
| Beagle | Free plan: 1 lite test/month | API/GraphQL testing at Advanced; SSO and API discovery at Enterprise |

## 4. Indian-market notes

Only verifiable items are listed. "U" means no evidence was found either way.

| Vendor | Prices in INR? | India presence | GST invoicing |
|---|---|---|---|
| Snyk, Semgrep, SonarSource, CodeRabbit, Checkmarx, Veracode, Invicti, StackHawk, PortSwigger | No INR seen on pricing pages (USD only) | U | U |
| GitHub | USD. Indian cards supported via one-time payments and, since 2026-08-10, automatic recurring payments ([changelog](https://github.blog/changelog/2026-08-10-github-billing-in-india-now-supports-automatic-recurring-payments), search snippet) | U | U. A third-party blog says GitHub does not issue GST invoices; that claim is unverified. |
| Aikido | **Yes, partially:** the pentest is listed at ₹2,65,000, a regional price below the USD conversion of ≈₹3,73,384. Plan currency did not render. | U | U |
| Astra Security | **Yes:** the blog lists "Starting at INR 16,000"; the pricing page is in USD | HQ listed as Chandigarh; India VAPT service pages | U |
| Beagle Security | USD on the pricing page; **Razorpay** offered as a payment method | Kerala (Technopark) office plus San Francisco HQ (search snippets) | U |
| Indusface | USD on the vendor page; **₹6,000/app/month via a reseller** (snippet) | HQ Vadodara, Gujarat (snippets) | U |
| Appknox | No public prices | HQ Bengaluru per YourStory snippet (Singapore per CB Insights) | U |
| CloudSEK | USD on AWS Marketplace | Main office Bengaluru (job posting snippet); Built In lists HQ as Singapore | U |
| Strobes | No public prices | LinkedIn lists HQ as Plano, TX; India presence U | U |

**Observations (factual):**
1. Only Aikido, Astra and Indusface (via a reseller) show any INR price point.
2. Among global tools, the self-serve options a 10-person Indian team can buy without talking to sales are Snyk Team, Semgrep Teams, SonarQube Cloud Team, GitHub add-ons, CodeRabbit, StackHawk Wingman, Burp Pro and Aikido.
3. Exploit-validated DAST (Invicti proof-based scanning) and enterprise SAST suites (Checkmarx, Veracode) are quote-only. Checkmarx's published AWS minimum of $30k/year is about ₹28 lakh/year.
