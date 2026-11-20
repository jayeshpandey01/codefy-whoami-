# Academic Research Review: Evidence Base for Codefy

_Prepared 2026-11-20. Every paper below was checked against an official or registry record: Crossref DOI metadata, publisher page, arXiv listing, USENIX/ICLR proceedings, or the authors' own PDF. "Abstract-level" means the numbers come only from the published abstract and are reported as the authors state them. Benchmark results are research measurements on fixed datasets. They are **not** measurements of Codefy or of any commercial product._

---

## 0. Verdict on the three legacy deck citations

### 0.1 "Sadowski et al., CACM 2018" (used to support "85%+ of legacy SAST alerts are false positives")

- **Verified:** C. Sadowski, E. Aftandilian, A. Eagle, et al., "Lessons from Building Static Analysis Tools at Google," _Communications of the ACM_ 61(4), April 2018. DOI [10.1145/3188720](https://doi.org/10.1145/3188720).
- **What it actually says (checked against the full text):**
  - It defines an **"effective false positive"** as an issue on which "developers did not take positive action after seeing the issue."
  - Code-review checks "are allowed to include up to 10% effective false positives". A check should "Produce less than 10% effective false positives. Developers should feel the check is pointing out an actual issue at least 90% of the time." Compiler checks must produce **no** effective false positives.
  - Tricorder tracks "Please fix" vs. "Not useful" clicks. "If the ratio for an analyzer goes above 10%, the Tricorder team disables the analyzer."
  - On historical FindBugs use at Google: in a 2009 "Fixit" week, engineers reviewed 3,954 warnings (42% of 9,473), and only 16% (640) were fixed.
  - It lists reasons engineers avoid static analysis, including "Not trustworthy. Users do not trust the results due to, say, false positives", and warns that "if a tool wastes developer time with false positives … developers will lose faith and ignore results."
- **Verdict: does NOT support "85%+".** The paper gives no industry-wide false-positive rate. It does strongly support a different claim: developers abandon tools whose perceived false-positive rate goes above about 10%, and actionability matters as much as accuracy. **Fix:** reword to "Google keeps code-review analyzers below a 10% effective-false-positive threshold and disables analyzers that exceed it, because developers stop trusting noisy tools (Sadowski et al., CACM 2018)." Do not present the 16% FindBugs fix rate as a false-positive rate. Unfixed warnings are not the same thing as false positives.

### 0.2 "Purba et al., arXiv:2403.04671" (used to support "35–55% hallucination rate of open-ended LLM audits")

- **The arXiv ID is wrong.** arXiv:2403.04671 is _"Greater than the sum of its parts: The role of minority and majority status in collaborative problem-solving communication"_ (Cavazos & Nixon, cs.CL), which has nothing to do with security.
- **The real paper:** M. D. Purba, A. Ghosh, B. J. Radford, B. Chu, "Software Vulnerability Detection using Large Language Models," _2023 IEEE 34th International Symposium on Software Reliability Engineering Workshops (ISSREW)_, Florence, Oct 2023. DOI [10.1109/ISSREW60843.2023.00058](https://doi.org/10.1109/ISSREW60843.2023.00058). The DBLP key is `conf/issre/PurbaGRC23`. The authors are Purba, Ghosh, Radford and Chu, **not** "Ray, Tanim". I found no arXiv version.
- **What it says (abstract-level, since the full text is paywalled):** the authors apply four well-known LLMs to two widely referenced public datasets. They report "a significant performance gap between these LLMs and those from popular static analysis tools, primarily due to their high false positive rates", but say LLMs "show great promise in identifying subtle patterns," which suggests combining LLMs with other program analysis.
- **Verdict: does NOT support "35–55% hallucination rate."** The abstract gives no such figure and does not measure "hallucination." The supporting claim in `docs/DETECTION-ENGINE-SPEC.md` (precision rises "above 90%" with narrow questions) has no support in this paper either. **Note:** the title that spec gives, "Benchmarking Large Language Models for Vulnerability Detection: The False Sense of Security," matched no paper in my searches and appears to be fabricated. **Fix:** cite the ISSREW 2023 paper by its real title and DOI for "LLMs alone show high false-positive rates versus static tools." Cite Ullah et al. (S&P 2024) and Ding et al. (ICSE 2025) below for the stronger case.

### 0.3 "Fixing in production costs 10–30× more (IBM Systems Sciences Institute)"

- The primary source for this figure has never been located. Laurent Bossavit traced the chart to Pressman's 1987 textbook, which cites IBM Systems Sciences Institute "course notes." He concluded that the Institute was an internal training programme and found no supporting data ([The Register, 22 Jul 2021](https://www.theregister.com/2021/07/22/bugs_expense_bs/); Bossavit, _[The Leprechauns of Software Engineering](https://leanpub.com/leprechauns)_).
- Counter-evidence: T. Menzies, W. Nichols, F. Shull, L. Layman, "Are delayed issues harder to resolve? Revisiting cost-to-fix of defects throughout the lifecycle," _Empirical Software Engineering_ (online Nov 2016), DOI [10.1007/s10664-016-9469-x](https://doi.org/10.1007/s10664-016-9469-x). Across 171 projects (2006–2014) it found "no evidence for the delayed issue effect."
- **Recommendation: drop it.** A technical reviewer will recognise it as a known "leprechaun." If you need the point, say "Google found developers act on issues flagged at compile time far more than on issues in checked-in code" (Sadowski 2018: 74% vs. 21% judged "real problems"). That is a sourced argument for fixing issues in the IDE.

---

## 1. SAST effectiveness, false positives and adoption

**1.1 Why Don't Software Developers Use Static Analysis Tools to Find Bugs?**
B. Johnson, Y. Song, E. Murphy-Hill, et al. · ICSE 2013 · DOI [10.1109/ICSE.2013.6606613](https://doi.org/10.1109/ICSE.2013.6606613) · Peer-reviewed.
_Objective/method:_ qualitative interviews with 20 developers about static analysis use.
_Results (abstract-level):_ all participants found the tools beneficial, but "false positives and the way in which the warnings are presented" are barriers to use. Developers want help fixing defects, not just reports.
_Limitations:_ small sample, from 2013, and not specific to security.
_Codefy takeaway:_ the finding card with a 1-click fix is the evidence-backed UX choice. Lead the pitch with "actionable," not "more findings."

**1.2 Lessons from Building Static Analysis Tools at Google.** See §0.1. _Takeaway:_ adopt a measurable **"not useful" rate per rule**, set a 10% ceiling, and auto-disable rules that exceed it. This turns "precision over volume" into a policy that can be checked.

**1.3 An Empirical Study on the Effectiveness of Static C Code Analyzers for Vulnerability Detection**
S. Lipp, S. Banescu, A. Pretschner · ISSTA 2022 · DOI [10.1145/3533767.3534380](https://doi.org/10.1145/3533767.3534380) · Peer-reviewed.
_Method:_ five open-source analyzers and one commercial C analyzer, run on 27 projects (1.15 MLOC) containing 192 CVE-based vulnerabilities.
_Results (abstract-level):_ the tools miss 47–80% of real-world vulnerabilities. Combining analyzers lowers the miss rate to 30–69%, "at the cost of 15 percentage points more functions flagged."
_Limitations:_ C only, and the ground truth is limited to known CVEs.
_Takeaway:_ this directly supports **orchestrating multiple tools**. Combining them increases recall but adds noise, so orchestration needs deduplication and triage, which is Codefy's job.

**1.4 Comparison and Evaluation on Static Application Security Testing (SAST) Tools for Java**
K. Li, S. Chen, L. Fan, et al. · ESEC/FSE 2023 · DOI [10.1145/3611643.3616262](https://doi.org/10.1145/3611643.3616262) · Peer-reviewed.
_Method:_ the authors selected seven free or open-source Java SAST tools from 161 candidates and evaluated them on synthetic and real-world benchmarks.
_Results (abstract-level):_ the tools do well on synthetic benchmarks but detect only **12.7%** of real-world vulnerabilities. Even combined, **70.9%** stay undetected.
_Limitations:_ Java only, and commercial tools are excluded.
_Takeaway:_ **synthetic-benchmark scores overstate real-world performance.** Codefy must report results on real-CVE datasets and must not quote OWASP Benchmark scores alone.

## 2. Limits of LLM vulnerability detection

**2.1 Software Vulnerability Detection using Large Language Models** (Purba et al., ISSREW 2023). See §0.2.

**2.2 LLMs Cannot Reliably Identify and Reason About Security Vulnerabilities (Yet?)**
S. Ullah, M. Han, S. Pujar, et al. · IEEE S&P 2024 · DOI [10.1109/SP54263.2024.00210](https://doi.org/10.1109/SP54263.2024.00210) · Peer-reviewed (arXiv 2312.12575).
_Method:_ the SecLLMHolmes framework, with 228 code scenarios, eight LLMs and eight investigative dimensions.
_Results (abstract-level):_ responses are non-deterministic, and the reasoning is often incorrect or unfaithful. Merely renaming functions or variables, or adding library functions, makes PaLM2 answer incorrectly in 26% of cases and GPT-4 in 17%.
_Limitations:_ the 2023-era models it tested have since been superseded.
_Takeaway:_ this is the strongest peer-reviewed basis for "we do not let an LLM decide whether code is vulnerable." Because of the non-determinism, any LLM verdict Codefy uses must be cached, versioned and reproducible.

**2.3 Vulnerability Detection with Code Language Models: How Far Are We?** (PrimeVul)
Y. Ding, Y. Fu, O. Ibrahim, et al. · ICSE 2025 · DOI [10.1109/ICSE55347.2025.00038](https://doi.org/10.1109/ICSE55347.2025.00038) · Peer-reviewed (arXiv 2403.18624).
_Method:_ a new de-duplicated dataset with chronological splits (PrimeVul) and more realistic evaluation metrics.
_Results (abstract-level):_ a state-of-the-art 7B model scored 68.26% F1 on BigVul but **3.09% F1** on PrimeVul. GPT-3.5 and GPT-4 results were "akin to random guessing in the most stringent settings."
_Limitations:_ function-level C/C++ classification only.
_Takeaway:_ earlier benchmarks were inflated by data leakage. Any accuracy Codefy reports must use time-split, de-duplicated data.

**2.4 To Err is Machine: Vulnerability Detection Challenges LLM Reasoning**
B. Steenhoek, M. M. Rahman, M. K. Roy, et al. · arXiv [2403.17218](https://arxiv.org/abs/2403.17218) (v2, Jan 2025) · **Preprint.** I found no peer-reviewed version.
_Results (abstract-level):_ state-of-the-art models reached only **54.5% balanced accuracy**. Better prompts, larger models, more pre-training and fine-tuning gave no significant improvement. The models fail at multi-step reasoning about how variables relate.
_Takeaway:_ supports giving the multi-step part, the source-to-sink path, to deterministic analysis and asking the LLM only about a single step.

## 3. LLM + static-analysis hybrids and LLM triage

**3.1 Enhancing Static Analysis for Practical Bug Detection: An LLM-Integrated Approach** (LLift)
H. Li, Y. Hao, Y. Zhai, Z. Qian · PACMPL 8 (OOPSLA1), 2024 · DOI [10.1145/3649828](https://doi.org/10.1145/3649828) · Peer-reviewed. The arXiv version, 2308.00245, is titled "The Hitchhiker's Guide to Program Analysis."
_Method:_ static analysis produces candidate use-before-initialization (UBI) bugs in the Linux kernel. The LLM then examines each candidate using bug-specific prompts and checks designed to handle non-determinism.
_Results (abstract-level):_ the arXiv abstract reports about 50% precision on nearly 1,000 candidates, with "no missing bugs" observed, and 13 previously unknown UBI bugs. The OOPSLA abstract reports four new UBI bugs that the Linux community acknowledged.
_Limitations:_ one bug class (UBI) in one codebase (the Linux kernel).
_Takeaway:_ this is the clearest research precedent for Codefy's design: **static analysis proposes, and the LLM rules on one narrow question.**

**3.2 IRIS: LLM-Assisted Static Analysis for Detecting Security Vulnerabilities**
Z. Li, S. Dutta, M. Naik · ICLR 2025 · [proceedings.iclr.cc](https://proceedings.iclr.cc/paper/2025/hash/582d4e27fa24168f3af1f4582655034b-Abstract-Conference.html) · Peer-reviewed (arXiv 2405.17238).
_Method:_ the LLM infers taint source and sink specifications, CodeQL runs the analysis, and the LLM then filters the results. It introduces CWE-Bench-Java, with 120 validated vulnerabilities.
_Results (abstract-level, ICLR version):_ CodeQL detects 27 of the 120. IRIS with GPT-4 detects 55, improves CodeQL's false discovery rate by 5 percentage points, and found 4 previously unknown vulnerabilities.
_Limitations:_ Java only, costly whole-repository LLM calls, and recall still below 50%.
_Takeaway:_ LLM-assisted **specification inference** (suggesting new sources and sinks) is a proven extension point. If Codefy adopts it, suggested specs should be reviewed and committed as deterministic rules, not run as live LLM judgments.

**3.3 Reducing False Positives in Static Bug Detection with LLMs: An Empirical Study in Industry**
X. Du, J. Feng, Y. Zou, et al. · ICSE-SEIP 2026 · DOI [10.1145/3786583.3786910](https://doi.org/10.1145/3786583.3786910) · Peer-reviewed (arXiv 2601.18844).
_Method:_ 433 alarms from Tencent's internal static analysis tool (328 false positives, 105 true positives) across three bug types, plus developer interviews.
_Results (abstract-level):_ manual inspection takes 10–20 minutes per alarm. Hybrid LLM-plus-static-analysis techniques eliminate **94–98% of false positives with high recall**, at $0.0011–$0.12 per alarm.
_Limitations:_ one company, three bug types and 433 alarms.
_Takeaway:_ this is industrial evidence that **LLM triage of static-analysis output** pays off. Cite it as "up to 94–98% in one industrial study," never as Codefy's own rate.

## 4. LLM vulnerability repair

**4.1 Examining Zero-Shot Vulnerability Repair with Large Language Models**
H. Pearce, B. Tan, B. Ahmad, et al. · IEEE S&P 2023 · DOI [10.1109/SP46215.2023.10179324](https://doi.org/10.1109/SP46215.2023.10179324) · Peer-reviewed.
_Results (abstract-level):_ together, the LLMs repaired 100% of the synthetic and hand-crafted scenarios. On real-world historical examples, generating functionally correct code was hard.
_Takeaway:_ patches must be checked by a re-scan plus the project's own tests, and ideally by re-running the exploit test.

**4.2 How Effective Are Neural Networks for Fixing Security Vulnerabilities**
Y. Wu, N. Jiang, H. V. Pham, et al. · ISSTA 2023 · DOI [10.1145/3597926.3598135](https://doi.org/10.1145/3597926.3598135) · Peer-reviewed.
_Results (abstract-level):_ on Vul4J and VJBench (Java), Codex, the best model tested, fixed 10.2 vulnerabilities (**20.4%**). Many CWE types were never fixed.
_Takeaway:_ present patches as "suggested fixes, verified by re-scan," never as "auto-remediation."

## 5. DAST / black-box scanners

**5.1 Why Johnny Can't Pentest: An Analysis of Black-Box Web Vulnerability Scanners**
A. Doupé, M. Cova, G. Vigna · DIMVA 2010, LNCS 6201 · DOI [10.1007/978-3-642-14215-4_7](https://doi.org/10.1007/978-3-642-14215-4_7) · Peer-reviewed.
_Method:_ eleven commercial and open-source scanners run against a realistic test application.
_Results (abstract-level):_ "crawling is … as critical and challenging … as the vulnerability detection techniques themselves," and "many classes of vulnerabilities are completely overlooked."
_Limitations:_ from 2010, so the specific tools are outdated.
_Takeaway:_ DAST findings depend on coverage. Codefy should use its static route and endpoint map to seed DAST targets rather than rely on crawling.

**5.2 Black Widow: Blackbox Data-driven Web Scanning**
B. Eriksson, G. Pellegrino, A. Sabelfeld · IEEE S&P 2021 · DOI [10.1109/SP40001.2021.00022](https://doi.org/10.1109/SP40001.2021.00022) · Peer-reviewed.
_Results (abstract-level):_ 63–280% higher code coverage than other crawlers, no false positives in the scanning evaluation, more XSS found, and new vulnerabilities in HotCRP, osCommerce, PrestaShop and WordPress.
_Takeaway:_ tracking state and dependencies between pages is what makes black-box scanning effective. Codefy should feed authenticated, stateful sequences to its DAST engines.

## 6. LLM penetration testing and agentic exploitation

**6.1 Getting pwn'd by AI: Penetration Testing with Large Language Models**
A. Happe, J. Cito · ESEC/FSE 2023 · DOI [10.1145/3611643.3613083](https://doi.org/10.1145/3611643.3613083) · Peer-reviewed.
_Method/results:_ GPT-3.5 is used for high-level planning and in a closed loop that runs commands on a vulnerable VM over SSH. The authors report "promising initial results" (qualitative).
_Takeaway:_ an early precedent for LLM-driven execution loops. It also covers the ethics, which matters for Codefy's opt-in probing.

**6.2 PentestGPT: Evaluating and Harnessing Large Language Models for Automated Penetration Testing**
G. Deng, Y. Liu, V. Mayoral-Vilches, et al. · USENIX Security 2024 · [usenix.org](https://www.usenix.org/conference/usenixsecurity24/presentation/deng) · Peer-reviewed (arXiv 2308.06782).
_Results (arXiv abstract):_ LLMs handle sub-tasks (using tools, interpreting output) but lose track of the overall scenario. A three-module design raised task completion by 228.6% over the GPT-3.5 baseline.
_Takeaway:_ break agentic security work into small, structured, stateful steps. This supports Codefy's narrow-task design over a single open-ended "hack this" agent.

**6.3 LLM Agents can Autonomously Exploit One-day Vulnerabilities**
R. Fang, R. Bindu, A. Gupta, D. Kang · arXiv [2404.08144](https://arxiv.org/abs/2404.08144) (2024) · **Preprint.** I found no peer-reviewed version. A follow-up from the same group, "Teams of LLM Agents can Exploit Zero-Day Vulnerabilities," appeared at EACL 2026 (DOI [10.18653/v1/2026.eacl-long.2](https://doi.org/10.18653/v1/2026.eacl-long.2)).
_Results (abstract-level):_ on 15 one-day vulnerabilities, a GPT-4 agent exploited 87% when given the CVE description and 7% without it. Every other model tested, and the ZAP and Metasploit scanners, scored 0%.
_Limitations:_ n = 15, and the result depends heavily on the CVE description.
_Takeaway:_ LLM agents do much better when given a precise target description. Codefy's static path can serve as that description. The paper also reinforces the risk of autonomous exploitation, so keep probes opt-in, limited to the local target, and logged.

## 7. Execution-based validation, PoC generation and BOLA/IDOR

**7.1 Checking Security Properties of Cloud Service REST APIs**
V. Atlidakis, P. Godefroid, M. Polishchuk · ICST 2020 · DOI [10.1109/ICST46399.2020.00046](https://doi.org/10.1109/ICST46399.2020.00046) · Peer-reviewed.
_Method:_ four security rules checked by active checkers in the RESTler stateful fuzzer. One is the **user-namespace rule**: "A resource created in a user namespace must not be accessible from another user namespace", where the namespace is defined by the user's token. This is BOLA by construction.
_Results:_ new bugs in deployed Azure and Office365 services, all since fixed.
_Takeaway:_ **this is the closest academic precedent for Codefy's BOLA/BFLA execution oracle:** create a resource as user A, replay the request with user B's token, and check whether access is wrongly granted. Use the name "property checker" or "oracle" in technical messaging.

**7.2 Detecting Broken Object-Level Authorization Vulnerabilities in Database-Backed Applications** (BolaRay)
Y. Huang, C. Shi, J. Lu, et al. · ACM CCS 2024 · DOI [10.1145/3658644.3690227](https://doi.org/10.1145/3658644.3690227) · Peer-reviewed.
_Method:_ a study of 101 real-world BOLA vulnerabilities, which identified four common authorization models. These feed a combined SQL and static analysis that checks whether the required checks are enforced.
_Results (abstract-level):_ across 25 applications, 193 true vulnerabilities (178 new) at a **21.86% false-positive rate**. 155 have been confirmed and 52 CVEs granted.
_Takeaway:_ BOLA is common and statically detectable, but static analysis alone still had about 22% false positives. That gap is where Codefy's runtime oracle adds value: **static candidates confirmed by execution.**

**7.3 PoCGen: Generating Proof-of-Concept Exploits for Vulnerabilities in Npm Packages**
D. Simsek, A. Eghbali, M. Pradel · _Proc. ACM Softw. Eng._ (PACMSE), 2026 · DOI [10.1145/3808178](https://doi.org/10.1145/3808178) · Peer-reviewed (arXiv 2506.04962).
_Method:_ the LLM interprets the vulnerability report, static analysis finds the taint paths, and dynamic analysis validates the exploit.
_Results (abstract-level):_ exploits for 77% of the vulnerabilities in SecBench.js, 45 percentage points above the baseline, at about $0.02 per exploit.
_Takeaway:_ the architecture closest to Codefy's pipeline (static taint, then LLM synthesis, then execution check), in the JS/npm ecosystem Codefy targets.

**7.4 PoC-Gym: Towards More Reliable LLM-Assisted Proof-of-Concept Exploit Generation**
D. Gezgin, A. Das, S. Kim, et al. · arXiv [2602.04165](https://arxiv.org/abs/2602.04165) (v3, Sep 2026) · **Preprint.**
_Results (abstract-level):_ 20 Java CVEs and 338 runs. 116 candidates passed runtime validation, but only 65 passed post-hoc validation against the ground-truth vulnerable locations. The paper warns that "printed markers, generated files, or runtime side effects" often do not imply that the vulnerability actually fired.
_Takeaway:_ **this is the key caution for Codefy's execution oracle.** "The test passed" is not enough. Each validation must check a property tied to the vulnerability itself (user B received user A's object ID or data, or the taint reached the sink) and record the evidence. Report the oracle's own false-confirmation rate.

## 8. Vulnerability prioritisation

**8.1 Exploit Prediction Scoring System (EPSS)**
J. Jacobs, S. Romanosky, B. Edwards, et al. · _Digital Threats: Research and Practice_ 2(3), 2021 · DOI [10.1145/3436242](https://doi.org/10.1145/3436242) · Peer-reviewed.
_Results (abstract-level):_ an open, data-driven estimate of the probability of exploitation within 12 months, with ROC AUC = 0.838.

**8.2 Enhancing Vulnerability Prioritization: Data-Driven Exploit Predictions with Community-Driven Insights**
J. Jacobs, S. Romanosky, O. Suciu, et al. · IEEE EuroS&P Workshops 2023 · DOI [10.1109/EuroSPW59978.2023.00027](https://doi.org/10.1109/EuroSPW59978.2023.00027) · Peer-reviewed.
_Results (abstract-level):_ the authors argue that severity-based prioritisation predicts exploitation poorly. Their new model shows an "82% performance improvement over past models."
_Takeaway (both):_ for dependency or CVE findings that come through orchestrated scanners, rank by EPSS together with reachability, not by CVSS alone. EPSS covers published CVEs only. It does not apply to Codefy's own taint findings in first-party code.

## 9. Tree-sitter or lightweight-parser taint analysis

I found no peer-reviewed evaluation of tree-sitter-based security taint analysis that I could verify, so none is cited. This is a gap. Codefy's own measurement (§12) is the evidence it will need, and it should not borrow results from CodeQL-based papers.

---

## 10. Claims Codefy CAN make, backed by literature

1. **"Open-source SAST misses most real-world vulnerabilities, even in combination."** Seven Java tools detected 12.7% of real-world vulnerabilities, and 70.9% stayed undetected when combined (Li et al., FSE 2023). C analyzers miss 47–80% (Lipp et al., ISSTA 2022).
2. **"Combining scanners raises recall but adds noise, so orchestration needs triage."** Lipp et al. (ISSTA 2022) found the miss rate fell to 30–69% at the cost of 15 percentage points more functions flagged.
3. **"Developer trust collapses with noisy tools; Google keeps review-time analyzers under about 10% effective false positives."** (Sadowski et al., CACM 2018; Johnson et al., ICSE 2013).
4. **"Open-ended LLM vulnerability detection is unreliable."** Near-random results on a realistic benchmark (Ding et al., ICSE 2025). Answers change under trivial renaming (Ullah et al., S&P 2024). High false-positive rates compared with static tools (Purba et al., ISSREW 2023).
5. **"Using static analysis for the search and the LLM for narrow judgments is the approach the research supports."** (LLift, OOPSLA 2024; IRIS, ICLR 2025). In one industrial study, hybrid LLM triage removed 94–98% of false positives (Du et al., ICSE-SEIP 2026).
6. **"Black-box scanners are limited by crawling and state, so static knowledge of routes helps."** (Doupé et al., DIMVA 2010; Eriksson et al., S&P 2021).
7. **"Execution-based oracles for authorization flaws are an established technique."** (Atlidakis et al., ICST 2020). Static BOLA detection still shows about 22% false positives (Huang et al., CCS 2024), and static-plus-dynamic PoC validation works in npm (Simsek et al., PACMSE 2026).
8. **"LLM-generated security patches need verification."** (Pearce et al., S&P 2023; Wu et al., ISSTA 2023).

## 11. Claims Codefy must NOT make

- "85%+ of legacy SAST alerts are false positives." No verified source supports this, and Sadowski 2018 does not say it.
- "Open-ended LLM audits hallucinate 35–55%," or "narrow questions push precision above 90%." No verified source supports either. The arXiv ID cited is unrelated, and the title cited in the spec does not exist.
- "Fixing in production costs 10–30× / 100× more (IBM)." The primary source cannot be located, and contrary evidence exists (Menzies et al.).
- Any precision, recall, false-positive rate or "zero false positives" figure for Codefy before it has been measured with the protocol in §12.
- Research benchmark numbers (94–98%, 77%, 87%) presented as Codefy's performance or as typical real-world performance.
- "Validated" or "confirmed" for any finding whose oracle only checked a status code or side effect (PoC-Gym, 2026).
- "Auto-remediation" or "guaranteed fixes." Patches are suggestions until re-scan and tests pass.
- "Replaces pentesters" or "autonomous pentesting." The evidence (PentestGPT, Fang et al.) shows partial, task-level capability.
- Head-to-head claims against named commercial tools (Checkmarx, Fortify, Snyk) without a published, reproducible comparison.

## 12. Recommended evaluation framework

**Metrics, reported for each language, each CWE and each engine (deterministic taint, orchestrated SAST, DAST, oracle):**

| Metric | Definition / note |
|---|---|
| Precision; false-positive rate | TP/(TP+FP). Report separately for `confirmed` and `needs-verification` findings |
| Recall; false-negative rate | Against labelled ground truth. Real-CVE sets reported separately from synthetic ones (Li 2023, Lipp 2022) |
| Effective FP / "not useful" rate | Developer-dismissed share in pilots (Sadowski 2018). Target under 10% |
| Detection latency | p50/p95 milliseconds per file save (IDE) and per full repository scan |
| Validation success rate | Share of candidates the oracle confirms |
| Oracle false-confirmation rate | Confirmations that fail manual or post-hoc ground-truth review (PoC-Gym) |
| Remediation correctness | Patch compiles, the original exploit test fails afterwards, the project's tests pass, and a re-scan is clean |
| LLM determinism | Agreement rate on repeated triage calls (Ullah 2024) |

**Suggested public benchmarks:**
- _Synthetic SAST:_ OWASP Benchmark (Java), NIST Juliet / SARD (C/C++, Java). Use for regression testing only, since synthetic scores overstate real performance.
- _Real-world code:_ PrimeVul (time-split, de-duplicated), CVEfixes, CWE-Bench-Java (IRIS), SecBench.js (npm, from PoCGen), and Vul4J / VJBench for repair.
- _DAST and API authorization:_ OWASP crAPI and VAmPI (contain BOLA/BFLA), OWASP Juice Shop, DVWA. Report results for each vulnerability class, and include authenticated multi-user scenarios.
- _Protocol:_ freeze rules before the test set is chosen, use chronological splits for anything LLM-assisted, publish the harness and raw results, and label every number with dataset, version and date.
