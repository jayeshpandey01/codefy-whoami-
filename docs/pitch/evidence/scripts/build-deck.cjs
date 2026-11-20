// Builds docs/pitch/presentation/codefy-pitch-deck.pptx (10 slides, 16:9, editable).
// Run: NODE_PATH=<dir with pptxgenjs, sharp> node build-deck.cjs <skillDir>/scripts/apply_theme.js
// Every number on a slide is traced in docs/pitch/presentation/sources-and-notes.md.
const path = require("path");
const pptxgen = require("pptxgenjs");
const sharp = require("sharp");
const { applyTheme } = require(process.argv[2]);

const ROOT = path.resolve(__dirname, "../..");
const SHOT = path.join(ROOT, "assets/screenshots/presentation");
const OUT = path.join(ROOT, "presentation/codefy-pitch-deck.pptx");

const THEME = {
  name: "Codefy",
  headFontFace: "Arial",
  bodyFontFace: "Arial",
  colors: {
    dk1: "0B1220", lt1: "FFFFFF", dk2: "14233A", lt2: "F1F4F8",
    accent1: "2F7DD1", accent2: "4FB3E8", accent3: "1C9A72", accent4: "C98414",
    accent5: "D8454B", accent6: "566074", hlink: "2F7DD1", folHlink: "566074",
  },
};

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 in
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "Codefy: investor and customer briefing";
pres.author = "Codefy";
pres.company = "Codefy";
const C = pres.SchemeColor;

const W = 13.33, M = 0.6;
const MUTED_DARK = "AEB8C8";
const tint = { green: "DDF3EA", amber: "FBEBCB", blue: "DCEAF9", gray: "E4E8EE", red: "F9DEDF" };
const tintText = { green: "0E6B4D", amber: "7A4E00", blue: "1B4F8A", gray: "3E4757", red: "8F1F25" };

// ---- layouts ------------------------------------------------------------------------------
pres.defineSlideMaster({
  title: "LIGHT", background: { color: C.background1 },
  objects: [
    { text: { text: "CODEFY", options: { x: M, y: 7.08, w: 2, h: 0.25, fontSize: 10, bold: true, color: C.accent6, charSpacing: 3, margin: 0 } } },
  ],
  slideNumber: { x: 12.2, y: 7.08, w: 0.55, h: 0.25, fontSize: 10, color: C.accent6, align: "right" },
  placeholders: [{ placeholder: { options: { name: "title", type: "title", x: M, y: 0.42, w: 12.1, h: 1.0, fontSize: 32, bold: true, color: C.text1, valign: "top", margin: 0 }, text: "" } }],
});
pres.defineSlideMaster({
  title: "DARK", background: { color: C.text1 },
  objects: [
    { text: { text: "CODEFY", options: { x: M, y: 7.08, w: 2, h: 0.25, fontSize: 10, bold: true, color: MUTED_DARK, charSpacing: 3, margin: 0 } } },
  ],
  slideNumber: { x: 12.2, y: 7.08, w: 0.55, h: 0.25, fontSize: 10, color: MUTED_DARK, align: "right" },
  placeholders: [{ placeholder: { options: { name: "title", type: "title", x: M, y: 0.42, w: 12.1, h: 1.0, fontSize: 32, bold: true, color: C.background1, valign: "top", margin: 0 }, text: "" } }],
});

// ---- helpers ------------------------------------------------------------------------------
const T = (s, text, o) => s.addText(text, Object.assign({ isTextBox: true, margin: 0, fontFace: "Arial", color: C.text1, valign: "top" }, o));
const box = (s, o) => s.addShape(pres.ShapeType.roundRect, Object.assign({ rectRadius: 0.08, line: { color: "D5DBE4", width: 0.75 } }, o));
const card = (s, x, y, w, h, o = {}) => box(s, Object.assign({ x, y, w, h, fill: { color: C.background2 }, line: { color: "E1E6EE", width: 0.5 } }, o));
function badge(s, label, x, y, kind, w) {
  const bw = w || 0.12 + label.length * 0.085;
  box(s, { x, y, w: bw, h: 0.26, fill: { color: tint[kind] }, line: { color: tint[kind], width: 0.25 }, rectRadius: 0.13 });
  T(s, label, { x, y, w: bw, h: 0.26, fontSize: 10, bold: true, color: tintText[kind], align: "center", valign: "middle" });
  return bw;
}
const src = (s, text, dark) => T(s, text, { x: M, y: 6.62, w: 12.1, h: 0.42, fontSize: 10, color: dark ? MUTED_DARK : C.accent6, valign: "bottom" });
async function dims(f) { const m = await sharp(path.join(SHOT, f)).metadata(); return m.width / m.height; }
async function pic(s, f, x, y, w, h, alt) {
  const ar = await dims(f); let pw = w, ph = w / ar; if (ph > h) { ph = h; pw = h * ar; }
  s.addImage({ path: path.join(SHOT, f), x: x + (w - pw) / 2, y: y + (h - ph) / 2, w: pw, h: ph, altText: alt, objectName: alt });
  return { pw, ph };
}
const title = (s, t) => s.addText(t, { placeholder: "title" });

(async () => {
  // =========================== 1. Vision =====================================================
  {
    const s = pres.addSlide({ masterName: "DARK" });
    T(s, "CODEFY · INDIA-FIRST APPLICATION SECURITY", { x: M, y: 0.7, w: 7, h: 0.3, fontSize: 12, bold: true, color: C.accent2, charSpacing: 2 });
    T(s, "Find the vulnerability.\nSee the path.\nShip the fix.", { x: M, y: 1.25, w: 6.4, h: 2.7, fontSize: 46, bold: true, color: C.background1, lineSpacingMultiple: 1.0 });
    T(s, "One workflow for code scanning, secret detection and web-app testing. Runs on your machine with no upload, or in the cloud. Every finding opens as a traced attack path.", { x: M, y: 4.15, w: 6.0, h: 1.2, fontSize: 18, color: MUTED_DARK });
    let cx = M;
    for (const c of ["Local & offline", "Cloud SAST + DAST", "VS Code · Desktop · CLI · MCP"]) {
      const w = 0.35 + c.length * 0.092; box(s, { x: cx, y: 5.6, w, h: 0.4, fill: { color: C.text2 }, line: { color: "2A3D5C", width: 0.75 }, rectRadius: 0.2 });
      T(s, c, { x: cx, y: 5.6, w, h: 0.4, fontSize: 12, color: C.background1, align: "center", valign: "middle" }); cx += w + 0.15;
    }
    T(s, "Early product (v0.3), founder-built. Features and gaps are stated plainly in this deck.", { x: M, y: 6.35, w: 6.4, h: 0.4, fontSize: 12, color: MUTED_DARK });
    box(s, { x: 7.35, y: 0.85, w: 5.45, h: 4.9, fill: { color: "10192B" }, line: { color: "2A3D5C", width: 0.75 }, rectRadius: 0.12 });
    await pic(s, "crop_image.png", 7.5, 1.0, 5.15, 3.6, "Codefy VS Code extension, WhoAmI Findings and whole-code architecture taint graph");
    T(s, "Real screen: VS Code extension, in-editor architecture & taint attack-path DAG", { x: 7.5, y: 5.05, w: 5.15, h: 0.55, fontSize: 11, color: MUTED_DARK });
    T(s, "Investor and customer briefing · November 2026", { x: 7.35, y: 6.1, w: 5.45, h: 0.3, fontSize: 12, color: MUTED_DARK, align: "right" });
    s.addNotes("Positioning: all three capabilities named on this slide exist today (see README.md capability matrix). 'Runs with no upload' applies to local scans; the cloud mode uploads code to the SAST API. We deliberately avoid claims such as zero false positives or per-keystroke latency; neither is supported.");
  }

  // =========================== 2. Problem & market ============================================
  {
    const s = pres.addSlide({ masterName: "LIGHT" });
    title(s, "Vulnerabilities are now the top way in, and testing is slow and costly");
    const stats = [
      ["31%", "of breaches began with exploitation of a vulnerability, ahead of stolen credentials for the first time in 19 years", "Verizon DBIR 2026, 19 May 2026"],
      ["₹25.5 cr", "average cost of a data breach in India (+15.9%). Pentesting and red teaming cut it by ₹2.47 cr per breach", "IBM Cost of a Data Breach, India, 3 Aug 2026"],
      ["₹40k–₹1.5 L", "typical web-app VAPT, 1–3 weeks per application, so most small teams test rarely", "TCSA price page, 10 Jun 2026"],
    ];
    stats.forEach(([n, d, sc], i) => {
      const y = 1.65 + i * 1.62;
      card(s, M, y, 6.5, 1.45);
      T(s, n, { x: M + 0.25, y: y + 0.2, w: 2.5, h: 0.9, fontSize: n.length > 6 ? 26 : 38, bold: true, color: C.accent1, valign: "middle" });
      T(s, d, { x: M + 2.85, y: y + 0.18, w: 3.45, h: 0.8, fontSize: 13, color: C.text1 });
      T(s, sc, { x: M + 2.85, y: y + 1.07, w: 3.45, h: 0.25, fontSize: 10, color: C.accent6 });
    });
    // India opportunity
    const x0 = 7.45;
    T(s, "India opportunity, bottom-up", { x: x0, y: 1.65, w: 5.3, h: 0.35, fontSize: 16, bold: true });
    badge(s, "ESTIMATE", x0 + 3.6, 1.68, "gray");
    const bars = [["TAM", "₹5,416 cr", "All Indian software-producing organisations", 5.3, C.accent1], ["SAM", "₹500 cr", "Self-serve SMB + mid-market, JS/TS/Python fit", 3.6, C.accent2], ["SOM", "₹4.6 cr", "Year 3, about 390 paying customers", 1.5, C.accent3]];
    bars.forEach(([k, v, d, w, col], i) => {
      const y = 2.15 + i * 1.12;
      box(s, { x: x0, y, w, h: 0.5, fill: { color: col }, line: { color: col, width: 0.25 }, rectRadius: 0.06 });
      T(s, `${k}  ${v}`, { x: x0 + 0.15, y, w: Math.max(w - 0.2, 1.4), h: 0.5, fontSize: 15, bold: true, color: C.background1, valign: "middle" });
      T(s, d, { x: x0, y: y + 0.55, w: 5.3, h: 0.3, fontSize: 11, color: C.accent6 });
    });
    card(s, x0, 5.5, 5.3, 1.0);
    T(s, "Why bottom-up: published India AppSec market sizes differ by more than 20× ($74M vs about $1.7B). DPDP Rules (notified 14 Nov 2025) allow penalties up to ₹250 crore for inadequate safeguards.", { x: x0 + 0.18, y: 5.58, w: 4.95, h: 0.85, fontSize: 11, color: C.text1 });
    src(s, "Sources: Verizon 2026 DBIR; IBM India 2026 (in.newsroom.ibm.com); tcsa.in/resources/vapt-cost-india-2026; PIB/MeitY 17 Nov 2025; sizing assumptions in research/market-research.md §6 (all ESTIMATE).");
    s.addNotes("Verified by independent search on 20 Nov 2026: DBIR 31% and IBM India ₹25.5 crore (secondary reporting of both; primary Verizon executive summary and IBM newsroom pages exist). VAPT price is a vendor page (medium confidence). TAM/SAM/SOM are our estimate; every input is in the assumptions table of market-research.md. The weakest input is the number of agencies (20,000, pure assumption). Low-to-high range: TAM ₹2,020 to 15,333 cr; SOM ₹1.6 to 11.1 cr.");
  }

  // =========================== 3. Introducing Codefy ==========================================
  {
    const s = pres.addSlide({ masterName: "LIGHT" });
    title(s, "Codefy: one scan across code and running apps, shown as attack paths");
    // left column
    const rows = [["What", "Finds injection flaws, hard-coded secrets and misconfigurations, then traces how input reaches them."], ["Who", "Small and mid-size engineering teams on JS/TS or Python: fintech and SaaS startups first."], ["How", "Scan locally in the editor or desktop app, add cloud scanners when needed, gate CI with SARIF."]];
    rows.forEach(([k, v], i) => {
      const y = 1.65 + i * 1.3;
      T(s, k.toUpperCase(), { x: M, y, w: 1, h: 0.3, fontSize: 12, bold: true, color: C.accent1, charSpacing: 2 });
      T(s, v, { x: M, y: y + 0.3, w: 3.5, h: 0.9, fontSize: 14 });
    });
    // diagram
    const dx = 4.5, dw = 8.25;
    T(s, "SURFACES", { x: dx, y: 1.65, w: 2, h: 0.25, fontSize: 10, bold: true, color: C.accent6, charSpacing: 2 });
    ["VS Code extension", "Desktop app (Tauri)", "CLI + MCP server"].forEach((t, i) => {
      const w = 2.65, x = dx + i * (w + 0.15); box(s, { x, y: 1.95, w, h: 0.55, fill: { color: C.text2 }, line: { color: C.text2, width: 0.5 } });
      T(s, t, { x, y: 1.95, w, h: 0.55, fontSize: 13, bold: true, color: C.background1, align: "center", valign: "middle" });
    });
    T(s, "ENGINES", { x: dx, y: 2.75, w: 2, h: 0.25, fontSize: 10, bold: true, color: C.accent6, charSpacing: 2 });
    // local
    card(s, dx, 3.05, 3.55, 1.85, { fill: { color: "EAF2FC" }, line: { color: C.accent1, width: 1 } });
    T(s, "Local engine (offline)", { x: dx + 0.18, y: 3.15, w: 3.2, h: 0.3, fontSize: 14, bold: true });
    T(s, "AST taint tracing: JS/TS (5 rules) and Python (5 rules). Secret detection. No code leaves the machine.", { x: dx + 0.18, y: 3.5, w: 3.2, h: 0.9, fontSize: 12 });
    badge(s, "IMPLEMENTED", dx + 0.18, 4.5, "green");
    // cloud
    card(s, dx + 3.75, 3.05, 4.5, 1.85, { fill: { color: "F6F8FB" } });
    T(s, "Cloud scanners (opt-in)", { x: dx + 3.93, y: 3.15, w: 4.1, h: 0.3, fontSize: 14, bold: true });
    T(s, "SAST: Semgrep, Gitleaks, TruffleHog, Trivy and more.\nDAST: passive and active web checks (lightweight probes).", { x: dx + 3.93, y: 3.5, w: 4.1, h: 0.9, fontSize: 12 });
    badge(s, "SAST: PARTIAL", dx + 3.93, 4.5, "amber"); badge(s, "DAST: EXPERIMENTAL", dx + 5.35, 4.5, "amber", 1.75);
    T(s, "OUTPUTS", { x: dx, y: 5.1, w: 2, h: 0.25, fontSize: 10, bold: true, color: C.accent6, charSpacing: 2 });
    [["Findings with source→sink trace", 2.7], ["6 attack-path graph views", 2.7], ["Markdown · PDF · SARIF · CI gate", 2.7]].forEach(([t, w], i) => {
      const x = dx + i * 2.85; card(s, x, 5.4, w, 0.7, { fill: { color: C.background1 } });
      T(s, t, { x: x + 0.1, y: 5.4, w: w - 0.2, h: 0.7, fontSize: 12, bold: true, align: "center", valign: "middle" });
    });
    T(s, "Not yet built: exploit validation and an LLM reasoning layer (see roadmap).", { x: M, y: 5.45, w: 3.6, h: 0.6, fontSize: 12, color: C.accent6 });
    src(s, "Evidence: capability matrix in docs/pitch/README.md (code paths, tests and live runs of 20 Nov 2026). DAST registry lists 30 'tools' that are lightweight HTTP probes; SAST catalogue lists 25 tools, about 10 installed on the hosted worker.");
    s.addNotes("This slide is the 'current implementation' view. Statuses use the project's four labels. Do not describe DAST as 30 scanners or SAST as 25 working tools: the audit found 27 Python probes behind the DAST registry and roughly 10 installed SAST binaries. The local engine covers 5 JS/TS and 5 Python rule classes and traces within one function (max 8 hops).");
  }

  // =========================== 4. Product demo =================================================
  {
    const s = pres.addSlide({ masterName: "LIGHT" });
    title(s, "Product demo: genuine screens from the running product");
    box(s, { x: M, y: 1.5, w: 6.9, h: 4.55, fill: { color: "0F1623" }, line: { color: "2A3D5C", width: 0.75 }, rectRadius: 0.1 });
    await pic(s, "crop_image.png", M + 0.1, 1.6, 6.7, 4.0, "VS Code Extension: WhoAmI Findings, architecture and taint attack-path DAG");
    T(s, "VS Code: in-editor architecture & taint attack-path graph (real runtime artifact)", { x: M + 0.15, y: 5.65, w: 6.6, h: 0.35, fontSize: 11, color: MUTED_DARK });
    const thumbs = [["vscode-unified-graph.png", "VS Code: four whole-code architecture views", "VS Code extension graph view menu"], ["desktop-threat-graph.png", "Desktop: threat-model view, tainted flows reaching assets", "Desktop threat model and blast radius graph"], ["cli-sast.png", "CLI: cloud SAST job result (semgrep, gitleaks)", "CLI cloud SAST scan results"]];
    for (let i = 0; i < 3; i++) {
      const y = 1.5 + i * 1.55, [f, cap, alt] = thumbs[i];
      box(s, { x: 7.75, y, w: 5.0, h: 1.4, fill: { color: "0F1623" }, line: { color: "2A3D5C", width: 0.75 } });
      await pic(s, f, 7.82, y + 0.07, 1.95, 1.26, alt);
      T(s, cap, { x: 9.9, y: y + 0.1, w: 2.75, h: 1.2, fontSize: 12, color: C.background1, valign: "middle" });
    }
    T(s, "Also real: report export (Markdown, PDF, SARIF), scan history, settings. Cloud DAST results are shown through the CLI; the desktop DAST panel needs a signed-in account and is not pictured.", { x: 7.75, y: 6.18, w: 5.0, h: 0.5, fontSize: 10, color: C.accent6 });
    src(s, "Captured 20 Nov 2026 on a seeded 7-file demo project (5 planted issues): desktop frontend v0.3.0 with network off; CLI 1.1.1 against live cloud services. Secrets and personal hostnames redacted. Originals: assets/screenshots/original.");
    s.addNotes("All screens are real. The desktop frontend was run in Chromium with only the Tauri file-dialog and file-read calls stubbed; the analysis engine, worker and UI are the real code. The demo project contains AWS's documented example key, not a real secret. The VS Code screen is the founder's own capture, cropped to remove local paths. The CLI result is the real output of a live scan (job IDs in evidence/).");
  }

  // =========================== 5. Validation ===================================================
  {
    const s = pres.addSlide({ masterName: "LIGHT" });
    title(s, "Early validation: what we can show, and how strongly");
    const cw = 3.92, gap = 0.17, y0 = 1.55, h = 4.85;
    const xs = [M, M + cw + gap, M + 2 * (cw + gap)];
    // A
    card(s, xs[0], y0, cw, h);
    T(s, "Security case study", { x: xs[0] + 0.2, y: y0 + 0.18, w: cw - 0.4, h: 0.3, fontSize: 15, bold: true });
    badge(s, "FOUNDER-REPORTED", xs[0] + 0.2, y0 + 0.55, "amber");
    T(s, "An Indian tech startup (name withheld)", { x: xs[0] + 0.2, y: y0 + 0.95, w: cw - 0.4, h: 0.3, fontSize: 12, color: C.accent6 });
    ["Tested with Codefy", "Found a PostgreSQL credential weakness that appeared open to compromise", "Investigated and tracked it", "Reported to the company's CTO", "CTO replied with thanks"].forEach((t, i) => {
      const y = y0 + 1.4 + i * 0.5;
      box(s, { x: xs[0] + 0.22, y: y + 0.04, w: 0.26, h: 0.26, fill: { color: C.accent1 }, line: { color: C.accent1, width: 0.25 }, rectRadius: 0.13 });
      T(s, String(i + 1), { x: xs[0] + 0.22, y: y + 0.04, w: 0.26, h: 0.26, fontSize: 10, bold: true, color: C.background1, align: "center", valign: "middle" });
      T(s, t, { x: xs[0] + 0.6, y, w: cw - 0.8, h: 0.45, fontSize: 12 });
    });
    T(s, "No exploitation claimed. Remediation not independently confirmed. Redacted evidence in preparation.", { x: xs[0] + 0.2, y: y0 + 4.0, w: cw - 0.4, h: 0.7, fontSize: 11, color: C.accent6 });
    // B
    card(s, xs[1], y0, cw, h);
    T(s, "Early traction", { x: xs[1] + 0.2, y: y0 + 0.18, w: cw - 0.4, h: 0.3, fontSize: 15, bold: true });
    badge(s, "FOUNDER-REPORTED", xs[1] + 0.2, y0 + 0.55, "amber");
    T(s, "5–10", { x: xs[1] + 0.2, y: y0 + 0.95, w: 2, h: 0.9, fontSize: 48, bold: true, color: C.accent1 });
    T(s, "active users, no usage analytics yet to confirm", { x: xs[1] + 0.2, y: y0 + 1.85, w: cw - 0.4, h: 0.5, fontSize: 12, color: C.accent6 });
    badge(s, "PUBLIC · 20 NOV 2026", xs[1] + 0.2, y0 + 2.5, "blue");
    T(s, [{ text: "4", options: { bold: true, fontSize: 20, color: C.accent1 } }, { text: "  VS Code Marketplace installs (published build 0.2.0)", options: { fontSize: 12 } }], { x: xs[1] + 0.2, y: y0 + 2.9, w: cw - 0.4, h: 0.6 });
    T(s, [{ text: "956", options: { bold: true, fontSize: 20, color: C.accent1 } }, { text: "  npm downloads in the first 4 days; includes CI and bots, not unique users", options: { fontSize: 12 } }], { x: xs[1] + 0.2, y: y0 + 3.55, w: cw - 0.4, h: 0.9 });
    // C
    card(s, xs[2], y0, cw, h);
    T(s, "Speed versus manual testing", { x: xs[2] + 0.2, y: y0 + 0.18, w: cw - 0.4, h: 0.3, fontSize: 15, bold: true });
    badge(s, "QUALITATIVE + FOUNDER-OBSERVED", xs[2] + 0.2, y0 + 0.55, "amber", 3.2);
    T(s, "2–3 days", { x: xs[2] + 0.2, y: y0 + 0.98, w: 1.8, h: 0.55, fontSize: 26, bold: true, color: C.accent6 });
    T(s, "≈1 s", { x: xs[2] + 2.1, y: y0 + 0.98, w: 1.6, h: 0.55, fontSize: 26, bold: true, color: C.accent1 });
    T(s, "senior QA tester: find and validate one bug by hand", { x: xs[2] + 0.2, y: y0 + 1.55, w: 1.8, h: 0.75, fontSize: 10, color: C.accent6 });
    T(s, "Codefy: relevant issue identified, observed once", { x: xs[2] + 2.1, y: y0 + 1.55, w: 1.65, h: 0.75, fontSize: 10, color: C.accent6 });
    badge(s, "VERIFIED · OUR MEASUREMENT", xs[2] + 0.2, y0 + 2.45, "green", 2.7);
    T(s, "Local engine: 0.2–0.4 ms per small file; 2.3 ms median across a 10k-line codebase.\nDesktop scan of 7 files: under 1 s.\nCloud SAST: 94 s including cold start.", { x: xs[2] + 0.2, y: y0 + 2.82, w: cw - 0.4, h: 1.2, fontSize: 11 });
    T(s, "This is detection only, for the issue classes covered. It is not exploit validation and not a universal benchmark.", { x: xs[2] + 0.2, y: y0 + 4.05, w: cw - 0.4, h: 0.7, fontSize: 11, bold: true });
    src(s, "Sources: Marketplace gallery API and npm registry API, snapshot 20 Nov 2026 (customer-validation.md §2); timings from evidence/engine-benchmark.json, Apple M5. Badge key: VERIFIED = reproduced by us · PUBLIC = public registry · FOUNDER-REPORTED = no artifact reviewed.");
    s.addNotes("Name 1005 Labs only if written permission is obtained; until then keep anonymised. 'Thank you for helping us' is gratitude, not proof of a fix. Active-user count is the founder's estimate; the marketplace 'installs' figure is 4 and the downloadCount (135) includes updates and automated downloads. The ≈1 s QA observation is the founder's; the original input, environment and repetitions were not recorded, so we present our own reproducible timings beside it and state the scope limit.");
  }

  // =========================== 6. Competitive ==================================================
  {
    const s = pres.addSlide({ masterName: "LIGHT" });
    title(s, "Where Codefy fits: a unified, low-cost option, not a replacement for mature suites");
    const hdr = (t) => ({ text: t, options: { bold: true, color: C.background1, fill: { color: C.text2 }, fontSize: 10, align: "center", valign: "middle" } });
    const c = (t, o = {}) => ({ text: t, options: Object.assign({ fontSize: 10, align: "center", valign: "middle", color: C.text1 }, o) });
    const nm = (t, o = {}) => ({ text: t, options: Object.assign({ fontSize: 11, bold: true, align: "left", valign: "middle", color: C.text1 }, o) });
    const cf = { fill: { color: "DCEAF9" } };
    const rows = [
      [hdr("Product"), hdr("SAST"), hdr("DAST"), hdr("Recon"), hdr("Proof of exploit"), hdr("AI"), hdr("Free tier / entry price")],
      [nm("Snyk"), c("Yes"), c("Yes"), c("Partial"), c("Enterprise"), c("Agent Fix"), c("Team $25/dev ≈ ₹23.3k per 10 devs", { align: "left" })],
      [nm("Semgrep"), c("Yes"), c("Unknown"), c("Unknown"), c("Unknown"), c("Assistant"), c("Free ≤10 contributors", { align: "left" })],
      [nm("SonarQube"), c("Yes"), c("Unknown"), c("Unknown"), c("Unknown"), c("AI CodeFix"), c("Community free; Cloud free ≤50k LOC", { align: "left" })],
      [nm("CodeRabbit"), c("n/a: AI PR review", { fontSize: 9 }), c("n/a"), c("n/a"), c("n/a"), c("Review"), c("From $24/dev (annual)", { align: "left" })],
      [nm("Invicti / StackHawk"), c("Partial / n/a"), c("Yes"), c("Partial / Scale"), c("Invicti: proof-based", { fontSize: 9 }), c("Yes"), c("Quoted; Wingman $10/user", { align: "left" })],
      [nm("Aikido"), c("Yes"), c("Yes"), c("Pro"), c("Partial"), c("Yes"), c("Free plan; Basic $350/mo (10 users)", { align: "left" })],
      [nm("Codefy", cf), c("Yes: 10 local rules + cloud", Object.assign({ fontSize: 9 }, cf)), c("Partial: probes", Object.assign({ fontSize: 9 }, cf)), c("Partial: remote", Object.assign({ fontSize: 9 }, cf)), c("Not yet", cf), c("Chat; template fixes", Object.assign({ fontSize: 9 }, cf)), c("Free local; proposed ₹4,999/mo (10 devs)", Object.assign({ align: "left", bold: true }, cf))],
    ];
    s.addTable(rows, { x: M, y: 1.55, w: 8.3, colW: [1.35, 1.0, 0.85, 0.95, 1.1, 0.95, 2.1], rowH: [0.38, 0.52, 0.5, 0.52, 0.52, 0.56, 0.52, 0.6], border: { type: "solid", pt: 0.5, color: "D5DBE4" }, fontFace: "Arial", color: C.text1, valign: "middle", autoPage: false, objectName: "Competitor comparison" });
    T(s, "Yes = vendor documents it · Unknown = not found in pages reviewed, not proof of absence · Prices are public list prices (20 Nov 2026, ₹93.35/$).", { x: M, y: 5.78, w: 8.3, h: 0.5, fontSize: 10, color: C.accent6 });
    // USPs
    const ux = 9.2, uw = 3.55;
    T(s, "Four defensible differences", { x: ux, y: 1.5, w: uw, h: 0.3, fontSize: 14, bold: true });
    [["Unified workflow", "Local + cloud SAST, DAST and secrets in one tool"], ["Offline local engine", "Local scans send no code anywhere"], ["Attack-path graphs", "Each finding traced source→sink"], ["Agent- and CI-ready", "MCP server (24 tools), SARIF, --fail-on gate"]].forEach(([h1, d], i) => {
      const y = 1.9 + i * 0.82; card(s, ux, y, uw, 0.72, { fill: { color: C.background1 } });
      T(s, h1, { x: ux + 0.15, y: y + 0.07, w: uw - 0.3, h: 0.28, fontSize: 12, bold: true, color: C.accent1 });
      T(s, d, { x: ux + 0.15, y: y + 0.36, w: uw - 0.3, h: 0.34, fontSize: 10.5 });
    });
    card(s, ux, 5.25, uw, 1.1, { fill: { color: tint.amber }, line: { color: tint.amber, width: 0.25 } });
    T(s, [{ text: "Seeded test (5 planted issues):", options: { bold: true } }, { text: " local found 3, cloud found 3, together 4. SQL injection was missed by both. n=5: illustrative, not an accuracy rate.", options: {} }], { x: ux + 0.15, y: 5.32, w: uw - 0.3, h: 0.98, fontSize: 10.5, color: C.text1 });
    src(s, "Sources: research/competitor-analysis.md and competitor-pricing.md (official pricing pages, 20 Nov 2026, FBIL rate 93.3461); evidence/local-engine-seeded-findings.txt and cloud-sast-demo-scan.json. Codefy is early (v0.3) and does not claim superiority to mature suites.");
    s.addNotes("Competitor cells come from official pages; 'Unknown' means we could not verify, never 'No'. Aikido is the closest unified competitor (SAST, DAST, cloud, free plan). Semgrep Code is free for up to 10 contributors, so price is not a reason to prefer Codefy over Semgrep for SAST alone; Codefy already runs Semgrep on the cloud side. USP 3 caveat: the control-flow view is drawn from the finding's trace and the supply-chain view uses placeholder data. The seeded test is n=5 on a toy app.");
  }

  // =========================== 7. Business model ===============================================
  {
    const s = pres.addSlide({ masterName: "LIGHT" });
    title(s, "Business model: priced for Indian teams; infrastructure is the main cost");
    // tiers
    T(s, "Proposed tiers (₹ / month, ex-GST)", { x: M, y: 1.5, w: 4, h: 0.3, fontSize: 14, bold: true });
    badge(s, "PROPOSAL", M + 3.15, 1.52, "gray");
    [["Free", "₹0", "Local scans, graphs, Markdown"], ["Developer", "₹499 / user", "Cloud SAST + passive DAST, PDF/SARIF"], ["Startup", "₹4,999", "10 devs, CI gate, shared findings"], ["Growth", "₹19,999", "40 devs, priority scans, audit log"], ["Enterprise", "Custom", "Not priced: no evidence yet"]].forEach(([n, p, d], i) => {
      const y = 1.9 + i * 0.84, hl = n === "Startup"; card(s, M, y, 3.7, 0.74, { fill: { color: hl ? "DCEAF9" : C.background2 }, line: { color: hl ? C.accent1 : "E1E6EE", width: hl ? 1 : 0.5 } });
      T(s, n, { x: M + 0.15, y: y + 0.08, w: 1.6, h: 0.3, fontSize: 13, bold: true });
      T(s, p, { x: M + 1.7, y: y + 0.08, w: 1.9, h: 0.3, fontSize: 13, bold: true, color: C.accent1, align: "right" });
      T(s, d, { x: M + 0.15, y: y + 0.4, w: 3.4, h: 0.3, fontSize: 10.5, color: C.accent6 });
    });
    T(s, "Customer pays +18% GST (₹4,999 → ₹5,898.82).", { x: M, y: 6.12, w: 3.7, h: 0.3, fontSize: 10, color: C.accent6 });
    // chart
    T(s, "Monthly list price for a 10-developer team (₹)", { x: 4.55, y: 1.5, w: 4.3, h: 0.3, fontSize: 14, bold: true });
    s.addChart(pres.charts.BAR, [{ name: "₹ per month", labels: ["Aikido Basic", "Snyk Team", "GitHub Secret Prot. + Team", "Codefy Startup (proposed)"], values: [32671, 23337, 21470, 4999] }], {
      x: 4.45, y: 1.85, w: 4.45, h: 3.9, barDir: "bar", chartColors: ["8D99AB", "8D99AB", "8D99AB", "2F7DD1"], barGapWidthPct: 45,
      showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "#,##0", dataLabelFontSize: 11, dataLabelFontFace: "Arial", dataLabelColor: "0B1220",
      catAxisLabelFontSize: 10.5, catAxisLabelFontFace: "Arial", catAxisLabelColor: "0B1220", catAxisOrientation: "maxMin", valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" }, showLegend: false, valAxisMaxVal: 40000,
    });
    T(s, "Semgrep Code is free for up to 10 contributors. Competitor prices: public list, accessed 20 Nov 2026.", { x: 4.55, y: 5.8, w: 4.3, h: 0.5, fontSize: 10, color: C.accent6 });
    // unit economics
    const hx = 9.15, hw = 3.6;
    T(s, "Unit economics (model)", { x: hx, y: 1.5, w: 2.4, h: 0.3, fontSize: 14, bold: true });
    badge(s, "ASSUMPTIONS", hx + 2.45, 1.52, "gray", 1.15);
    const h = (t) => ({ text: t, options: { bold: true, fontSize: 10, color: C.background1, fill: { color: C.text2 }, align: "center", valign: "middle" } });
    const cc = (t, o = {}) => ({ text: t, options: Object.assign({ fontSize: 10.5, align: "center", valign: "middle" }, o) });
    s.addTable([
      [h(""), h("MVP\n10 users"), h("Growth\n100"), h("Scale\n1,000")],
      [cc("Cost / month", { align: "left", bold: true }), cc("₹10.5k"), cc("₹26.6k"), cc("₹90.4k")],
      [cc("Cost / cloud scan", { align: "left", bold: true }), cc("₹132"), cc("₹33"), cc("₹11")],
      [cc("LLM / analysis", { align: "left", bold: true }), cc("₹0.42"), cc("₹0.42"), cc("₹0.42")],
      [cc("Gross margin", { align: "left", bold: true }), cc("n/a"), cc("36%"), cc("71%")],
    ], { x: hx, y: 1.9, w: hw, colW: [1.2, 0.8, 0.8, 0.8], rowH: [0.55, 0.42, 0.42, 0.42, 0.42], border: { type: "solid", pt: 0.5, color: "D5DBE4" }, fontFace: "Arial", autoPage: false, objectName: "Unit economics table" });
    card(s, hx, 4.35, hw, 1.9, { fill: { color: "DCEAF9" }, line: { color: C.accent1, width: 0.75 } });
    T(s, [{ text: "Break-even\n", options: { bold: true, fontSize: 12, color: C.accent1 } }, { text: "3", options: { bold: true, fontSize: 20 } }, { text: " Startup customers cover infrastructure.\n", options: { fontSize: 11 } }, { text: "23", options: { bold: true, fontSize: 20 } }, { text: " cover infrastructure plus ₹1 L/month of team cost.", options: { fontSize: 11 } }], { x: hx + 0.18, y: 4.45, w: hw - 0.36, h: 1.7 });
    src(s, "Model: research/unit_economics.py (reproducible). List prices accessed 20 Nov 2026, ₹93.3461/$ (FBIL, 19 Nov). Assumes 8 cloud scans and 12 LLM calls per user per month; paying mix is illustrative. No customer has agreed to these prices.");
    s.addNotes("All prices are proposals. The Startup price is ~₹500 per developer against ₹2,100 to ₹3,300 per developer at Snyk/GitHub/Aikido list prices. Willingness-to-pay is an ESTIMATE (₹25k to ₹75k per year for early SaaS) anchored on VAPT prices; Month 2 of the 90-day plan tests it with ten buyers. Gross margin uses a 2% payment-fee estimate and the assumed paying mixes (5 Developer, 4 Startup, 1 Growth at Growth scale; 40, 30, 8 at Scale). Fixed infrastructure (≈₹10.5k) dominates; marginal cost per scan is about ₹0.21. Founder time, sales and support are excluded except in the 23-customer line. Current actual spend is unknown (free tiers); not quoted.");
  }

  // =========================== 8. GTM ==========================================================
  {
    const s = pres.addSlide({ masterName: "LIGHT" });
    title(s, "India-first go-to-market: founder-led, product-led, partner-assisted");
    card(s, M, 1.5, 5.95, 2.35);
    T(s, "Who we start with", { x: M + 0.2, y: 1.6, w: 5.5, h: 0.3, fontSize: 14, bold: true });
    [["1  Fintech startups", "VAPT demanded by partners and regulators; DPDP", "4.0"], ["2  Early-stage SaaS", "Customer security questionnaires, SOC 2 prep", "3.75"], ["3  Mid-sized SaaS", "Many repos, audit evidence, longer sale", "3.5"]].forEach(([a, b, sc], i) => {
      const y = 2.0 + i * 0.6;
      T(s, a, { x: M + 0.2, y, w: 2.2, h: 0.28, fontSize: 12, bold: true, color: C.accent1 });
      T(s, b, { x: M + 0.2, y: y + 0.27, w: 4.5, h: 0.28, fontSize: 10.5 });
      T(s, sc, { x: M + 5.0, y, w: 0.75, h: 0.3, fontSize: 14, bold: true, align: "right" });
    });
    T(s, "Attractiveness score /5 (our estimate). Agencies and VAPT consultancies: channel partners.", { x: M + 0.2, y: 3.5, w: 5.5, h: 0.3, fontSize: 10, color: C.accent6 });
    card(s, 6.75, 1.5, 6.0, 2.35);
    T(s, "How we reach them (priority order)", { x: 6.95, y: 1.6, w: 5.6, h: 0.3, fontSize: 14, bold: true });
    T(s, [["Founder-led CTO outreach: free scan of one repo, live", true], ["Product-led: Marketplace, Open VSX, npm, GitHub", true], ["Agency and VAPT-consultancy partnerships", true], ["Indian dev and startup communities, Product Hunt", true], ["Accelerators; publish our own honest benchmark", false]].map(([t, b]) => ({ text: t, options: { bullet: true, breakLine: b, fontSize: 12, paraSpaceAfter: 3 } })), { x: 6.95, y: 1.98, w: 5.6, h: 1.8 });
    // 90 day
    T(s, "First 90 days", { x: M, y: 4.05, w: 3, h: 0.3, fontSize: 14, bold: true });
    badge(s, "TARGETS, NOT ACTUALS", M + 1.55, 4.07, "gray", 1.9);
    [["Month 1", "Discover and pilot", "Fix trust blockers. 30 conversations, demos, pilot recruitment, evidence pack.", "60 qualified leads · 25 demos · 10 pilots"], ["Month 2", "Prove and price", "Weekly pilot check-ins, one permissioned case study, test ₹4,999 with 10 buyers.", "8 active orgs · 400 scans · 3 paid"], ["Month 3", "Make it repeatable", "Referral ask, 1–2 channel partners, fix top feedback, track retention.", "₹15k MRR · ≥50% pilots active · 2 partner-led pilots"]].forEach(([m, h1, d, k], i) => {
      const x = M + i * 4.1, w = 3.95;
      card(s, x, 4.45, w, 2.05, { fill: { color: C.background1 } });
      T(s, m.toUpperCase(), { x: x + 0.18, y: 4.55, w: 1.5, h: 0.25, fontSize: 10, bold: true, color: C.accent1, charSpacing: 2 });
      T(s, h1, { x: x + 0.18, y: 4.8, w: w - 0.36, h: 0.3, fontSize: 14, bold: true });
      T(s, d, { x: x + 0.18, y: 5.15, w: w - 0.36, h: 0.75, fontSize: 11 });
      T(s, k, { x: x + 0.18, y: 5.95, w: w - 0.36, h: 0.5, fontSize: 11, bold: true, color: C.accent3 });
    });
    src(s, "Sources: segment scores from research/market-research.md §5 (estimates); plan in strategy/india-gtm-strategy.md. 3 paid Startup customers equals the infrastructure break-even. No conversion benchmarks are quoted because none were verified.");
    s.addNotes("Trust blockers to clear in Month 1 (all found in the audit): remove the shared guest identity for active scans and add target-ownership checks to DAST; move off free-tier hosting that sleeps after 15 minutes; publish the current extension build (Marketplace has 0.2.0, repo 0.3.1); retire the retired default LLM model; add usage analytics so 'active users' is measurable. After India: UAE, Singapore, UK, USA, EU, in that order (market-research.md §7).");
  }

  // =========================== 9. Roadmap & global =============================================
  {
    const s = pres.addSlide({ masterName: "DARK" });
    title(s, "Roadmap: from verified scanner to evidence-backed security testing");
    const cols = [
      ["NOW", "Verified today", C.accent3, ["Local engine: JS/TS + Python taint, secrets", "Desktop, VS Code, CLI + 24-tool MCP server", "Cloud SAST and passive DAST, run live", "6 attack-path views; MD, PDF, SARIF"]],
      ["NEXT", "Evidence graph + AI reasoning (JEV)", C.accent2, ["Merge SAST, DAST, SCA and secrets into one evidence graph", "Data-flow analysis → attack-path hypotheses", "LLM answers narrow questions only", "Deterministic validation before any 'confirmed' label", "Fix proposal, then rescan and regression test"]],
      ["FUTURE", "Guarded recon and validation", C.accent4, ["Asset, service and endpoint discovery", "Auth and authorization testing", "Controlled exploit validation", "Needs first: written scope, rate limits, audit log, human approval, emergency stop"]],
    ];
    cols.forEach(([k, sub, col, items], i) => {
      const x = M + i * 4.1, w = 3.95;
      box(s, { x, y: 1.5, w, h: 3.6, fill: { color: "10192B" }, line: { color: "2A3D5C", width: 0.75 } });
      T(s, k, { x: x + 0.2, y: 1.62, w: 1.5, h: 0.3, fontSize: 14, bold: true, color: col, charSpacing: 3 });
      T(s, sub, { x: x + 0.2, y: 1.95, w: w - 0.4, h: 0.5, fontSize: 13, bold: true, color: C.background1 });
      T(s, items.map((t, j) => ({ text: t, options: { bullet: true, breakLine: j < items.length - 1, paraSpaceAfter: 4, fontSize: 11.5, color: C.background1 } })), { x: x + 0.2, y: 2.5, w: w - 0.4, h: 2.55 });
    });
    // global
    T(s, "AFTER INDIA", { x: M, y: 5.3, w: 2, h: 0.25, fontSize: 10, bold: true, color: MUTED_DARK, charSpacing: 2 });
    ["India", "UAE", "Singapore", "UK", "USA", "EU"].forEach((c, i) => {
      const x = M + i * 2.03, w = 1.93;
      s.addShape(pres.ShapeType.chevron, { x, y: 5.6, w, h: 0.55, fill: { color: i === 0 ? C.accent1 : "1B2B45" }, line: { color: i === 0 ? C.accent1 : "2A3D5C", width: 0.5 } });
      T(s, c, { x: x + 0.15, y: 5.6, w: w - 0.3, h: 0.55, fontSize: 13, bold: true, color: C.background1, align: "center", valign: "middle" });
    });
    T(s, "Before leaving India: a permissioned case study, a hardened multi-tenant backend, SOC 2 readiness, USD billing. None exists yet.", { x: M, y: 6.25, w: 12.1, h: 0.4, fontSize: 11, color: MUTED_DARK });
    s.addNotes("NOW lists only verified items. NEXT follows the founder's flowchart: findings → evidence graph → relationship and data-flow analysis → attack-path hypothesis → research engine → AI security reasoning → deterministic validation → verified report → fix proposal → rescan and regression tests. The acronym 'JEV' appears in no repository and its expansion was not provided; keep it as the founder's name for this layer until defined. Literature support: LLM+static-analysis hybrids (IRIS, LLift) outperform open-ended LLM detection (Ding et al., ICSE 2025: near-random on realistic data). Kafka and Temporal in the pipeline repo are design only; nothing runs. Global order from market-research.md §7 is a judgement from cited sources, not a forecast.");
  }

  // =========================== 10. Why Codefy ==================================================
  {
    const s = pres.addSlide({ masterName: "DARK" });
    T(s, "WHY CODEFY", { x: M, y: 0.75, w: 4, h: 0.3, fontSize: 12, bold: true, color: C.accent2, charSpacing: 3 });
    T(s, "Security testing a ten-person team can start today: on their own machine, for free.", { x: M, y: 1.15, w: 11.5, h: 1.6, fontSize: 38, bold: true, color: C.background1 });
    [["Works today", "Local and cloud scans, attack-path graphs, SARIF, a 24-tool MCP server. Demonstrated live."], ["Honest about gaps", "4 of 5 planted issues found by both engines together. Exploit validation comes next, not now."], ["Priced for India", "Proposed ₹4,999 a month for 10 developers, against ₹21k to ₹33k list elsewhere."]].forEach(([h1, d], i) => {
      const x = M + i * 4.1, w = 3.95; box(s, { x, y: 3.1, w, h: 1.75, fill: { color: "10192B" }, line: { color: "2A3D5C", width: 0.75 } });
      T(s, h1, { x: x + 0.2, y: 3.22, w: w - 0.4, h: 0.35, fontSize: 15, bold: true, color: C.accent2 });
      T(s, d, { x: x + 0.2, y: 3.65, w: w - 0.4, h: 1.1, fontSize: 12.5, color: C.background1 });
    });
    box(s, { x: M, y: 5.1, w: 12.1, h: 1.35, fill: { color: C.accent1 }, line: { color: C.accent1, width: 0.5 } });
    T(s, [{ text: "Next step: a 30-minute pilot. ", options: { bold: true } }, { text: "We scan one of your repositories together, you keep the report, then decide.", options: {} }], { x: M + 0.3, y: 5.2, w: 7.2, h: 1.1, fontSize: 16, color: C.background1, valign: "middle" });
    T(s, "axtion.tech\nVS Code Marketplace: Mickey20.codefy-whoami\nnpm i -g @mickey20/codefy\nJayesh Pandey, Founder", { x: 8.0, y: 5.2, w: 4.6, h: 1.1, fontSize: 12, color: C.background1, valign: "middle", align: "right" });
    s.addNotes("No fundraising ask and no traction claim beyond the labelled items on slide 5. Contact email intentionally not shown: none was provided for publication. The Marketplace listing currently shows version 0.2.0 and the npm package is 1.1.1. The website axtion.tech uses the Axtion brand; unify naming before external distribution.");
  }

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})().catch((e) => { console.error(e); process.exit(1); });
