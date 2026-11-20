import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

// Import jsPDF from packages/ui
const { jsPDF } = await import(
  path.resolve(projectRoot, "packages/ui/node_modules/jspdf/dist/jspdf.es.min.js")
);

const WIDTH = 960;
const HEIGHT = 540;

const doc = new jsPDF({
  orientation: "landscape",
  unit: "pt",
  format: [WIDTH, HEIGHT],
});

// Color Palette
const COLORS = {
  bg: [10, 13, 20],
  cardBg: [16, 22, 34],
  cardBorder: [40, 50, 70],
  textWhite: [255, 255, 255],
  textMuted: [148, 163, 184],
  cyan: [0, 240, 255],
  emerald: [16, 185, 129],
  violet: [139, 92, 246],
  amber: [245, 158, 11],
  rose: [244, 63, 94],
  headerBg: [13, 18, 29],
};

function drawBackground() {
  doc.setFillColor(...COLORS.bg);
  doc.rect(0, 0, WIDTH, HEIGHT, "F");

  // Subtle decorative accents
  doc.setFillColor(15, 25, 45);
  doc.circle(80, 80, 140, "F");
  doc.circle(WIDTH - 80, HEIGHT - 80, 140, "F");

  doc.setFillColor(...COLORS.bg);
  doc.rect(0, 0, WIDTH, HEIGHT, "F");
}

function drawHeader(tag, programTag) {
  // Top brand bar
  doc.setFillColor(...COLORS.cyan);
  doc.circle(44, 32, 4, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.cyan);
  doc.text(tag.toUpperCase(), 56, 35);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textMuted);
  doc.text(programTag, WIDTH - 40, 35, { align: "right" });

  doc.setDrawColor(...COLORS.cardBorder);
  doc.setLineWidth(0.75);
  doc.line(40, 48, WIDTH - 40, 48);
}

function drawFooter(slideIndex, subtitle = "Confidential • Startup Buildathon India 2026") {
  doc.setDrawColor(...COLORS.cardBorder);
  doc.setLineWidth(0.75);
  doc.line(40, HEIGHT - 36, WIDTH - 40, HEIGHT - 36);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.textMuted);
  doc.text(subtitle, 40, HEIGHT - 22);
  doc.text(`Slide ${String(slideIndex).padStart(2, "0")} / 12`, WIDTH - 40, HEIGHT - 22, {
    align: "right",
  });
}

function drawCard(x, y, w, h, borderHighlight = null) {
  doc.setFillColor(...COLORS.cardBg);
  if (borderHighlight) {
    doc.setDrawColor(...borderHighlight);
    doc.setLineWidth(1.2);
  } else {
    doc.setDrawColor(...COLORS.cardBorder);
    doc.setLineWidth(0.75);
  }
  doc.roundedRect(x, y, w, h, 8, 8, "FD");
}

function drawPill(text, x, y, color) {
  const textWidth = doc.getTextWidth(text);
  const pillW = textWidth + 16;
  const pillH = 18;

  doc.setFillColor(color[0], color[1], color[2], 0.15);
  doc.setDrawColor(...color);
  doc.setLineWidth(0.75);
  doc.roundedRect(x, y - 12, pillW, pillH, 9, 9, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...color);
  doc.text(text, x + 8, y);
  return pillW;
}

// ==========================================
// SLIDE 1: Cover
// ==========================================
drawBackground();
drawHeader("CODEFY (WHOAMI)", "Startup Buildathon India 2026 • Google AI & Cloud");

let coverPillW = drawPill("AI-NATIVE APPLICATION SECURITY INTELLIGENCE", 40, 110, COLORS.cyan);

doc.setFont("helvetica", "bold");
doc.setFontSize(34);
doc.setTextColor(...COLORS.textWhite);
doc.text("The Zero-Data-Leakage", 40, 160);
doc.setTextColor(...COLORS.cyan);
doc.text("Developer Security Platform", 40, 202);

doc.setFont("helvetica", "normal");
doc.setFontSize(14);
doc.setTextColor(...COLORS.textMuted);
const coverSubtitle = [
  "Sub-second, in-process AST static taint analysis paired with Google Gemini agent intelligence.",
  "Catching high-impact vulnerabilities before code ever leaves the IDE.",
];
doc.text(coverSubtitle, 40, 245);

drawCard(40, 310, 880, 140, COLORS.cyan);
doc.setFont("helvetica", "bold");
doc.setFontSize(13);
doc.setTextColor(...COLORS.cyan);
doc.text("CORE ARCHITECTURAL PILLARS POWERED BY GOOGLE AI", 60, 340);

doc.setFont("helvetica", "normal");
doc.setFontSize(11);
doc.setTextColor(...COLORS.textWhite);
doc.text("• In-Process AST Engine: Dual web-tree-sitter & ast-grep WASM runtime (<300ms analysis)", 60, 368);
doc.text("• Zero-Data-Leakage Privacy: Shannon-entropy secret redactor & local AST program slicer (0.66% payload)", 60, 392);
doc.text("• Omni-Channel Execution: VS Code extension, Tauri desktop, React/Ink CLI & 24-tool native MCP server", 60, 416);

drawFooter(1, "Founder & Lead Architect: Jayesh | Track: AI-Native Developer Security");

// ==========================================
// SLIDE 2: Problem Statement
// ==========================================
doc.addPage();
drawBackground();
drawHeader("PROBLEM STATEMENT", "The $2.8 Trillion DevSecOps Crisis");

doc.setFont("helvetica", "bold");
doc.setFontSize(22);
doc.setTextColor(...COLORS.textWhite);
doc.text("AppSec is Broken: Noise, Hallucinations, and Data Leaks", 40, 85);
doc.setFont("helvetica", "normal");
doc.setFontSize(11);
doc.setTextColor(...COLORS.textMuted);
doc.text("Developers are trapped between noisy legacy scanners and risky, hallucinating AI chatbots.", 40, 105);

const colW3 = 276;
const cardY = 130;
const cardH = 320;

// Problem Card 1
drawCard(40, cardY, colW3, cardH, COLORS.rose);
doc.setFont("helvetica", "bold");
doc.setFontSize(38);
doc.setTextColor(...COLORS.rose);
doc.text("85%+", 60, 180);
doc.setFontSize(13);
doc.setTextColor(...COLORS.textWhite);
doc.text("False Positive Alarm Fatigue", 60, 210);
doc.setFont("helvetica", "normal");
doc.setFontSize(10);
doc.setTextColor(...COLORS.textMuted);
const p1Lines = doc.splitTextToSize(
  "Traditional SAST tools (SonarQube, Checkmarx) flag blunt syntax patterns without proving data-flow reachability from untrusted sources to sensitive sinks.\n\nDevelopers drown in noise and ignore critical warnings, letting severe exploits slip through into production (Google CACM 2018 study).",
  colW3 - 40
);
doc.text(p1Lines, 60, 235);

// Problem Card 2
drawCard(342, cardY, colW3, cardH, COLORS.amber);
doc.setFont("helvetica", "bold");
doc.setFontSize(38);
doc.setTextColor(...COLORS.amber);
doc.text("35–55%", 362, 180);
doc.setFontSize(13);
doc.setTextColor(...COLORS.textWhite);
doc.text("LLM Security Hallucinations", 362, 210);
doc.setFont("helvetica", "normal");
doc.setFontSize(10);
doc.setTextColor(...COLORS.textMuted);
const p2Lines = doc.splitTextToSize(
  "Feeding entire codebases into general LLMs for security audits produces staggering 35%–55% hallucination rates (Purba et al., arXiv:2403.04671).\n\nModels invent phantom vulnerabilities or miss subtle exploit chains because they lack structural AST data-flow graphs.",
  colW3 - 40
);
doc.text(p2Lines, 362, 235);

// Problem Card 3
drawCard(644, cardY, colW3, cardH, COLORS.violet);
doc.setFont("helvetica", "bold");
doc.setFontSize(38);
doc.setTextColor(...COLORS.violet);
doc.text("100%", 664, 180);
doc.setFontSize(13);
doc.setTextColor(...COLORS.textWhite);
doc.text("IP & Secret Exposure Risk", 664, 210);
doc.setFont("helvetica", "normal");
doc.setFontSize(10);
doc.setTextColor(...COLORS.textMuted);
const p3Lines = doc.splitTextToSize(
  "Sending unredacted source code, proprietary algorithms, and embedded API keys to public cloud LLMs breaches enterprise compliance (GDPR, SOC2) and leaks critical IP.\n\nEnterprises are forced to ban AI code assistants due to valid data leakage fears.",
  colW3 - 40
);
doc.text(p3Lines, 664, 235);

drawFooter(2, "Core Pain: High False Positives • Unreliable AI Hallucinations • IP Exposure");

// ==========================================
// SLIDE 3: Proposed Solution
// ==========================================
doc.addPage();
drawBackground();
drawHeader("PROPOSED SOLUTION", "Codefy (WhoAmI) Product Architecture");

doc.setFont("helvetica", "bold");
doc.setFontSize(22);
doc.setTextColor(...COLORS.textWhite);
doc.text("Deterministic Precision + Targeted Agentic AI", 40, 85);
doc.setFont("helvetica", "normal");
doc.setFontSize(11);
doc.setTextColor(...COLORS.textMuted);
doc.text("In-process AST taint analysis catches the bug; Gemini verifies the guard; zero code leaves unredacted.", 40, 105);

const colW4 = 205;
const gap4 = 20;

const solCards = [
  {
    tag: "01 · COMPILER",
    title: "Sub-300ms AST Engine",
    color: COLORS.cyan,
    desc: "Dual web-tree-sitter & ast-grep WASM engine traces sources (req.body, params) into sinks (exec, SQL, fetch) in-editor per keystroke.",
  },
  {
    tag: "02 · PRIVACY",
    title: "Zero-Data-Leakage",
    color: COLORS.emerald,
    desc: "Shannon-entropy redactor and local AST program slicer eliminate secrets and proprietary logic before any token leaves the machine.",
  },
  {
    tag: "03 · TRIAGE",
    title: "Narrow-Query Triage",
    color: COLORS.violet,
    desc: "Asks Gemini 2.0 Flash a single narrow question: 'Does this guard sanitize this tainted input?' Eliminates hallucinations (>95% accuracy).",
  },
  {
    tag: "04 · AUTOPATCH",
    title: "1-Click Verified Fix",
    color: COLORS.cyan,
    desc: "Synthesizes surgical AST unified diffs implementing parameterized queries and safe subprocess arguments applied with one click.",
  },
];

solCards.forEach((c, idx) => {
  const x = 40 + idx * (colW4 + gap4);
  drawCard(x, 140, colW4, 300, c.color);

  drawPill(c.tag, x + 20, 180, c.color);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.textWhite);
  doc.text(c.title, x + 20, 215);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...COLORS.textMuted);
  const lines = doc.splitTextToSize(c.desc, colW4 - 36);
  doc.text(lines, x + 20, 240);
});

drawFooter(3, "Sub-second Developer Feedback Loop Embedded Directly in the Code Editor");

// ==========================================
// SLIDE 4: Live Product Demo
// ==========================================
doc.addPage();
drawBackground();
drawHeader("PRODUCT EXPERIENCE", "VS Code Extension & Tauri Desktop Application");

doc.setFont("helvetica", "bold");
doc.setFontSize(22);
doc.setTextColor(...COLORS.textWhite);
doc.text("Interactive Visual Attack Graphs & In-Editor Remediation", 40, 85);
doc.setFont("helvetica", "normal");
doc.setFontSize(11);
doc.setTextColor(...COLORS.textMuted);
doc.text("Turning abstract security warnings into navigable blast-radius DAGs and one-click fixes.", 40, 105);

const colW2 = 425;
// Left Box: Visual Graph
drawCard(40, 135, colW2, 310, COLORS.cyan);
doc.setFont("helvetica", "bold");
doc.setFontSize(12);
doc.setTextColor(...COLORS.cyan);
doc.text("EXCALIDRAW-STYLE MERMAID BLAST-RADIUS GRAPH", 60, 165);

doc.setFillColor(6, 9, 15);
doc.setDrawColor(...COLORS.cardBorder);
doc.roundedRect(60, 185, colW2 - 40, 230, 6, 6, "FD");

// Diagram nodes inside Left Box
doc.setFillColor(244, 63, 94, 0.2);
doc.setDrawColor(...COLORS.rose);
doc.roundedRect(80, 220, 140, 40, 4, 4, "FD");
doc.setFont("helvetica", "bold");
doc.setFontSize(9);
doc.setTextColor(...COLORS.rose);
doc.text("Source: req.body.cmd", 90, 244);

doc.setFont("helvetica", "bold");
doc.setFontSize(14);
doc.setTextColor(...COLORS.cyan);
doc.text("──────▶", 230, 244);

doc.setFillColor(245, 158, 11, 0.2);
doc.setDrawColor(...COLORS.amber);
doc.roundedRect(290, 220, 160, 40, 4, 4, "FD");
doc.setFontSize(9);
doc.setTextColor(...COLORS.amber);
doc.text("Sanitizer: isAlphaNumeric()", 300, 244);

doc.setFontSize(14);
doc.setTextColor(...COLORS.cyan);
doc.text("──────▼", 360, 280);

doc.setFillColor(244, 63, 94, 0.2);
doc.setDrawColor(...COLORS.rose);
doc.roundedRect(290, 305, 160, 40, 4, 4, "FD");
doc.setFontSize(9);
doc.setTextColor(...COLORS.rose);
doc.text("Sink: execSync(tainted)", 300, 329);

doc.setFont("helvetica", "normal");
doc.setFontSize(8.5);
doc.setTextColor(...COLORS.textMuted);
doc.text("• Rendered via React Flow & Cytoscape engine in VS Code webview", 80, 380);
doc.text("• Click any node to instantly jump to exact line in source code", 80, 396);

// Right Box: 1-Click Diff
drawCard(495, 135, colW2, 310, COLORS.emerald);
doc.setFont("helvetica", "bold");
doc.setFontSize(12);
doc.setTextColor(...COLORS.emerald);
doc.text("1-CLICK VERIFIED REMEDIATION DIFF", 515, 165);

doc.setFillColor(6, 9, 15);
doc.setDrawColor(...COLORS.cardBorder);
doc.roundedRect(515, 185, colW2 - 40, 230, 6, 6, "FD");

doc.setFont("courier", "normal");
doc.setFontSize(8.5);
doc.setTextColor(100, 116, 139);
doc.text("// Vulnerability: CWE-78 Command Injection", 530, 210);
doc.text("// Target: packages/api/src/routes/ping.ts:42", 530, 226);

// Red delete line
doc.setFillColor(244, 63, 94, 0.15);
doc.rect(525, 240, colW2 - 60, 22, "F");
doc.setTextColor(...COLORS.rose);
doc.text("- const result = execSync(`ping -c 4 ${targetHost}`);", 530, 255);

// Green add line
doc.setFillColor(16, 185, 129, 0.15);
doc.rect(525, 270, colW2 - 60, 22, "F");
doc.setTextColor(...COLORS.emerald);
doc.text("+ const result = execFileSync('ping', ['-c', '4', targetHost]);", 530, 285);

doc.setFont("helvetica", "normal");
doc.setFontSize(8.5);
doc.setTextColor(...COLORS.textMuted);
doc.text("Remediation Rationale:", 530, 325);
doc.text("Replaces shell execution with safe execFileSync array argument passing.", 530, 342);
doc.text("Gemini 2.0 validates zero syntax regression before applying diff.", 530, 358);

drawFooter(4, "Dual Packaging: VS Code Extension VSIX + Native Tauri Desktop Client");

// ==========================================
// SLIDE 5: Solution Architecture
// ==========================================
doc.addPage();
drawBackground();
drawHeader("SOLUTION ARCHITECTURE", "Four-Tier Hybrid Edge / Cloud System");

doc.setFont("helvetica", "bold");
doc.setFontSize(22);
doc.setTextColor(...COLORS.textWhite);
doc.text("Hybrid Edge / Cloud Architecture", 40, 85);
doc.setFont("helvetica", "normal");
doc.setFontSize(11);
doc.setTextColor(...COLORS.textMuted);
doc.text("Strict separation of deterministic local compilation and privacy-guarded Google AI cloud services.", 40, 105);

const archCards = [
  {
    tier: "TIER 1: CLIENT SURFACES",
    title: "VS Code, Tauri, CLI & MCP",
    color: COLORS.cyan,
    bullets: [
      "VS Code extension & Tauri runtime",
      "React 18 / Ink interactive CLI",
      "24-tool native stdio MCP server",
      "Low-latency IPC communication",
    ],
  },
  {
    tier: "TIER 2: CORE ENGINE",
    title: "In-Process AST Engine",
    color: COLORS.emerald,
    bullets: [
      "@whoami/core with web-tree-sitter",
      "ast-grep N-API & WASM dual builds",
      "Forward/backward taint propagation",
      "Local OKF BM25 knowledge index",
    ],
  },
  {
    tier: "TIER 3: PRIVACY GATE",
    title: "Zero-Data-Leakage",
    color: COLORS.rose,
    bullets: [
      "Shannon-entropy secret scanner",
      "Absolute path anonymizer",
      "41 LOC slice (0.66% payload)",
      "Hallucination & drift guard",
    ],
  },
  {
    tier: "TIER 4: GOOGLE AI & ENGINES",
    title: "Gemini AI & 55+ Engines",
    color: COLORS.violet,
    bullets: [
      "Antigravity multi-agent orchestration",
      "Gemini 2.0 Flash / 1.5 Pro triage",
      "25 SAST & 30 DAST engines unified",
      "BugBound 0% false-positive oracle",
    ],
  },
];

archCards.forEach((c, idx) => {
  const x = 40 + idx * (colW4 + gap4);
  drawCard(x, 140, colW4, 300, c.color);

  drawPill(c.tier, x + 16, 170, c.color);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.textWhite);
  doc.text(c.title, x + 16, 205);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.textMuted);
  c.bullets.forEach((b, bIdx) => {
    doc.text(`• ${b}`, x + 16, 230 + bIdx * 24);
  });
});

drawFooter(5, "Guaranteed Privacy: Source code never leaves local machine unredacted");

// ==========================================
// SLIDE 6: Google AI Tools Integration
// ==========================================
doc.addPage();
drawBackground();
drawHeader("GOOGLE AI ECOSYSTEM", "Full-Stack Google AI Integration");

doc.setFont("helvetica", "bold");
doc.setFontSize(22);
doc.setTextColor(...COLORS.textWhite);
doc.text("Built on Google Antigravity, Agent Skills, Studio & Gemini", 40, 85);
doc.setFont("helvetica", "normal");
doc.setFontSize(11);
doc.setTextColor(...COLORS.textMuted);
doc.text("Leveraging Google's agentic ecosystem to create an autonomous, deterministic security assistant.", 40, 105);

// Left Box: Antigravity & Agent Skills
drawCard(40, 135, colW2, 310, COLORS.violet);
drawPill("AGENT ORCHESTRATION", 60, 165, COLORS.violet);
doc.setFont("helvetica", "bold");
doc.setFontSize(14);
doc.setTextColor(...COLORS.textWhite);
doc.text("Google Antigravity & Google Agent Skills", 60, 195);

doc.setFont("helvetica", "normal");
doc.setFontSize(9.5);
doc.setTextColor(...COLORS.textMuted);
const leftDesc = [
  "• Google Antigravity Platform:",
  "  Serves as our primary AI-native agent development environment.",
  "  Orchestrates multi-agent evaluation loops, AST rule regression testing,",
  "  and automated threat modeling simulation harnesses.",
  "",
  "• Google Agent Skills (Deployed in .agent/skills/):",
  "  - security-auditor: Deterministic CWE classification and sink auditing.",
  "  - code-review-ai: Differential identity testing for IDOR/BOLA security.",
  "  - rag-implementation: Hybrid keyword-semantic OKF search.",
  "  - prompt-engineering-patterns: Strict Pydantic/JSON schema enforcement.",
];
doc.text(leftDesc, 60, 220);

// Right Box: Google AI Studio & Gemini Models
drawCard(495, 135, colW2, 310, COLORS.cyan);
drawPill("MODELS & STUDIO", 515, 165, COLORS.cyan);
doc.setFont("helvetica", "bold");
doc.setFontSize(14);
doc.setTextColor(...COLORS.textWhite);
doc.text("Google AI Studio & Gemini 2.0 Flash / 1.5 Pro", 515, 195);

doc.setFont("helvetica", "normal");
doc.setFontSize(9.5);
doc.setTextColor(...COLORS.textMuted);
const rightDesc = [
  "• Google AI Studio:",
  "  Used to prototype prompt chains, calibrate few-shot demonstrations,",
  "  and enforce deterministic responseSchema JSON structures.",
  "",
  "• Gemini 2.0 Flash / Flash Thinking:",
  "  Sub-400ms triage engine verifying conditional guard expressions in real time.",
  "  Flash Thinking evaluates complex multi-branch sanitizer logic.",
  "",
  "• Gemini 1.5 Pro (2 Million Token Context):",
  "  Repository-wide holistic security architecture reviews and multi-file",
  "  contextual patch generation preserving style and imports.",
];
doc.text(rightDesc, 515, 220);

drawFooter(6, "Seamless Google AI Alignment: Antigravity IDE, Modular Skills, Studio & Gemini Models");

// ==========================================
// SLIDE 7: Market Opportunity
// ==========================================
doc.addPage();
drawBackground();
drawHeader("MARKET OPPORTUNITY", "DevSecOps & Application Security Growth");

doc.setFont("helvetica", "bold");
doc.setFontSize(22);
doc.setTextColor(...COLORS.textWhite);
doc.text("A Massive, Accelerating Market Opportunity", 40, 85);
doc.setFont("helvetica", "normal");
doc.setFontSize(11);
doc.setTextColor(...COLORS.textMuted);
doc.text("As AI generates 10x more code, demand for real-time in-editor security guardrails is surging.", 40, 105);

const marketData = [
  {
    label: "Total Addressable Market (TAM)",
    val: "$18.4B",
    color: COLORS.cyan,
    desc: "Global DevSecOps and AppSec tooling market projected by 2028, expanding at 24.3% CAGR to $34.8B by 2030 (Gartner).",
  },
  {
    label: "Serviceable Addressable Market (SAM)",
    val: "$4.2B",
    color: COLORS.emerald,
    desc: "Direct corporate spend on developer-first static analysis, code intelligence, and automated vulnerability remediation.",
  },
  {
    label: "Serviceable Obtainable Market (SOM)",
    val: "$450M",
    color: COLORS.violet,
    desc: "Targeting 3.2M enterprise TypeScript/JavaScript and Python developers building cloud-native apps.",
  },
];

marketData.forEach((m, idx) => {
  const x = 40 + idx * (colW3 + 26);
  drawCard(x, 140, colW3, 300, m.color);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textMuted);
  doc.text(m.label.toUpperCase(), x + 20, 180);

  doc.setFontSize(38);
  doc.setTextColor(...m.color);
  doc.text(m.val, x + 20, 230);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textWhite);
  const mLines = doc.splitTextToSize(m.desc, colW3 - 40);
  doc.text(mLines, x + 20, 265);
});

drawFooter(7, "Key Catalyst: Proliferation of AI-written code requires automated real-time verification");

// ==========================================
// SLIDE 8: Business Model
// ==========================================
doc.addPage();
drawBackground();
drawHeader("BUSINESS MODEL", "Product-Led Growth (PLG) + Enterprise SaaS");

doc.setFont("helvetica", "bold");
doc.setFontSize(22);
doc.setTextColor(...COLORS.textWhite);
doc.text("Land with Developers, Expand across Enterprise Teams", 40, 85);
doc.setFont("helvetica", "normal");
doc.setFontSize(11);
doc.setTextColor(...COLORS.textMuted);
doc.text("High-margin software model (>82% gross margin) driven by VS Code extension marketplace virality.", 40, 105);

const bizTiers = [
  {
    name: "Developer Community",
    price: "$0",
    period: "Free forever",
    color: COLORS.cyan,
    features: [
      "Unlimited local AST taint scans",
      "In-editor finding highlights",
      "Community OWASP rule pack",
      "Local Blast-Radius graph",
    ],
  },
  {
    name: "Pro Developer",
    price: "$29",
    period: "per dev / month",
    color: COLORS.emerald,
    features: [
      "Hosted Gemini 2.0 triage gateway",
      "1-Click verified patch synthesis",
      "OKF / GraphRAG natural language chat",
      "PR diff security scanner bot",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "per seat / annual",
    color: COLORS.violet,
    features: [
      "Google Cloud Vertex AI hosting",
      "Custom proprietary AST rule pack",
      "Automated DAST verification probes",
      "SOC2 & ISO compliance audit reports",
    ],
  },
];

bizTiers.forEach((t, idx) => {
  const x = 40 + idx * (colW3 + 26);
  drawCard(x, 140, colW3, 300, t.color);

  drawPill(t.name.toUpperCase(), x + 20, 170, t.color);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(32);
  doc.setTextColor(...COLORS.textWhite);
  doc.text(t.price, x + 20, 215);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textMuted);
  doc.text(t.period, x + 20, 235);

  doc.setDrawColor(...COLORS.cardBorder);
  doc.line(x + 20, 248, x + colW3 - 20, 248);

  t.features.forEach((f, fIdx) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.textWhite);
    doc.text(`• ${f}`, x + 20, 272 + fIdx * 24);
  });
});

drawFooter(8, "Sales Velocity: Bottom-up developer adoption converting into top-down enterprise contracts");

// ==========================================
// SLIDE 9: Competitive Advantage & Moat
// ==========================================
doc.addPage();
drawBackground();
drawHeader("COMPETITIVE LANDSCAPE", "Market Differentiation");

doc.setFont("helvetica", "bold");
doc.setFontSize(22);
doc.setTextColor(...COLORS.textWhite);
doc.text("Unfair Technical Moat", 40, 85);
doc.setFont("helvetica", "normal");
doc.setFontSize(11);
doc.setTextColor(...COLORS.textMuted);
doc.text("Why Codefy wins against legacy SAST scanners, AI autocomplete, and modern CLI tools.", 40, 105);

drawCard(40, 135, 880, 310);

const tableX = 60;
const tableHeaders = [
  "Capability",
  "Legacy SAST (Sonar)",
  "AI Assistants (Copilot)",
  "Modern SAST (Snyk)",
  "Codefy (WhoAmI)",
];
const colWidths = [150, 160, 160, 160, 180];

let currX = tableX;
doc.setFont("helvetica", "bold");
doc.setFontSize(9.5);
doc.setTextColor(...COLORS.textMuted);
tableHeaders.forEach((h, i) => {
  if (i === 4) doc.setTextColor(...COLORS.cyan);
  doc.text(h, currX, 165);
  currX += colWidths[i];
});

doc.setDrawColor(...COLORS.cardBorder);
doc.line(60, 178, 880, 178);

const rows = [
  ["Feedback Velocity", "15–45 min CI/CD", "Sub-second autocomplete", "1–5 min CLI scan", "Sub-300ms in editor"],
  ["False Positive Rate", "Very High (>80%)", "N/A (Generative)", "Moderate (30–45%)", "Minimal (<5% via Taint+AI)"],
  ["Data Privacy", "Cloud / Server upload", "Full repo telemetry", "CLI / Cloud upload", "Zero-Data-Leakage Slicing"],
  ["Exploit Visualization", "Static tables / logs", "None", "Basic dependency tree", "Interactive Multi-Graph DAG"],
  ["Remediation Action", "Generic doc links", "Probabilistic suggestions", "Static code snippets", "1-Click Verified AST Diff"],
];

rows.forEach((r, rIdx) => {
  const y = 210 + rIdx * 45;
  currX = tableX;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  r.forEach((cell, cIdx) => {
    if (cIdx === 0) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.textWhite);
    } else if (cIdx === 4) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...COLORS.emerald);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...COLORS.textMuted);
    }
    doc.text(cell, currX, y);
    currX += colWidths[cIdx];
  });

  doc.setDrawColor(255, 255, 255, 0.04);
  doc.line(60, y + 14, 880, y + 14);
});

drawFooter(9, "Proprietary In-Process Engine + Narrow Gemini Triage Loop creates sustainable defensibility");

// ==========================================
// SLIDE 10: Milestones & Roadmap
// ==========================================
doc.addPage();
drawBackground();
drawHeader("ROADMAP & MILESTONES", "Execution Trajectory");

doc.setFont("helvetica", "bold");
doc.setFontSize(22);
doc.setTextColor(...COLORS.textWhite);
doc.text("From Buildathon Prototype to Enterprise Standard", 40, 85);
doc.setFont("helvetica", "normal");
doc.setFontSize(11);
doc.setTextColor(...COLORS.textMuted);
doc.text("A disciplined four-quarter product and commercial execution roadmap.", 40, 105);

const quarters = [
  {
    q: "Q4 2026 (Now)",
    title: "Buildathon Core",
    color: COLORS.cyan,
    items: [
      "JS/TS In-Process AST engine",
      "Gemini 2.0 Flash Triage gateway",
      "VS Code & Tauri desktop app",
      "Interactive CLI (@mickey20/codefy)",
      "Zero-leakage privacy redactor",
    ],
  },
  {
    q: "Q1 2027",
    title: "Public Marketplace",
    color: COLORS.emerald,
    items: [
      "VS Code Marketplace launch",
      "24-tool native stdio MCP server",
      "Python & Go language AST rules",
      "GitHub Actions PR diff scanner",
      "Target: 10,000 active devs",
    ],
  },
  {
    q: "Q2 2027",
    title: "Team Cloud Sync",
    color: COLORS.violet,
    items: [
      "Google Cloud Vertex AI private sync",
      "Team GraphRAG shared memory",
      "55+ SAST/DAST orchestrator bridge",
      "First 25 enterprise paid pilots",
      "SOC2 readiness audit",
    ],
  },
  {
    q: "Q3 2027",
    title: "Enterprise Scale",
    color: COLORS.rose,
    items: [
      "Enterprise on-prem VPC deployment",
      "JetBrains & Neovim IDE extensions",
      "Custom AST rule pack builder",
      "$1.2M Annual Recurring Revenue",
      "Global security partner ecosystem",
    ],
  },
];

quarters.forEach((q, idx) => {
  const x = 40 + idx * (colW4 + gap4);
  drawCard(x, 140, colW4, 300, q.color);

  drawPill(q.q, x + 16, 170, q.color);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.textWhite);
  doc.text(q.title, x + 16, 205);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.textMuted);
  q.items.forEach((item, iIdx) => {
    doc.text(`• ${item}`, x + 16, 230 + iIdx * 24);
  });
});

drawFooter(10, "Focus on shipping developer value first, expanding into enterprise governance");

// ==========================================
// SLIDE 11: Founding Team
// ==========================================
doc.addPage();
drawBackground();
drawHeader("FOUNDING TEAM", "Execution Capabilities");

doc.setFont("helvetica", "bold");
doc.setFontSize(22);
doc.setTextColor(...COLORS.textWhite);
doc.text("Built by Systems & Security Engineers", 40, 85);
doc.setFont("helvetica", "normal");
doc.setFontSize(11);
doc.setTextColor(...COLORS.textMuted);
doc.text("Combining deep compiler expertise, application security research, and agentic AI systems design.", 40, 105);

// Team Bio Left
drawCard(40, 135, colW2, 310, COLORS.cyan);
doc.setFillColor(0, 240, 255, 0.2);
doc.circle(75, 175, 25, "F");
doc.setFont("helvetica", "bold");
doc.setFontSize(18);
doc.setTextColor(...COLORS.cyan);
doc.text("J", 70, 182);

doc.setFontSize(15);
doc.setTextColor(...COLORS.textWhite);
doc.text("Jayesh & Founding Team", 115, 172);
doc.setFontSize(10);
doc.setTextColor(...COLORS.cyan);
doc.text("Founder & Lead Architect", 115, 188);

doc.setFont("helvetica", "normal");
doc.setFontSize(9.5);
doc.setTextColor(...COLORS.textMuted);
const bioLines = [
  "• Full-stack systems architecture, compiler AST tooling (web-tree-sitter, ast-grep),",
  "  and agentic AI systems engineering.",
  "",
  "• Architected Codefy's zero-data-leakage privacy redactor, in-process taint engine,",
  "  and cross-platform desktop application (Tauri + React 19).",
  "",
  "• Deep domain expertise in static analysis (SAST), penetration testing (DAST),",
  "  and building high-velocity developer tools.",
];
doc.text(bioLines, 60, 225);

// Advantage Right
drawCard(495, 135, colW2, 310, COLORS.emerald);
drawPill("EXECUTION ADVANTAGE", 515, 165, COLORS.emerald);
doc.setFont("helvetica", "bold");
doc.setFontSize(14);
doc.setTextColor(...COLORS.textWhite);
doc.text("Our Unfair Execution Advantage", 515, 195);

doc.setFont("helvetica", "normal");
doc.setFontSize(9.5);
doc.setTextColor(...COLORS.textMuted);
const advLines = [
  "• Dogfooding in Production:",
  "  Codefy is built and tested using Google Antigravity and our own suite of",
  "  Google Agent Skills (security-auditor, code-review-ai, clean-code).",
  "",
  "• AppSec Research-Grounded:",
  "  Built from real-world penetration testing and bug-bounty methodologies,",
  "  not theoretical checklists.",
  "",
  "• Full-Stack Execution Speed:",
  "  Working VS Code extension and native desktop application already built",
  "  and ready for evaluation.",
];
doc.text(advLines, 515, 225);

drawFooter(11, "Dedicated Builders Committed to Securing the Next Generation of Software");

// ==========================================
// SLIDE 12: The Ask & Call to Action
// ==========================================
doc.addPage();
drawBackground();
drawHeader("THE ASK & CALL TO ACTION", "Startup Buildathon India 2026");

doc.setFont("helvetica", "bold");
doc.setFontSize(30);
doc.setTextColor(...COLORS.textWhite);
doc.text("Partner with Us to Redefine Code Security", 40, 140);

doc.setFont("helvetica", "normal");
doc.setFontSize(13);
doc.setTextColor(...COLORS.textMuted);
doc.text(
  "We are seeking enterprise design partners, cloud credits, and Google AI mentorship to bring Codefy to every developer.",
  40,
  170
);

const askCards = [
  {
    title: "Enterprise Pilots",
    color: COLORS.cyan,
    desc: "Onboarding 5 forward-thinking engineering teams to test real-time in-editor remediation.",
  },
  {
    title: "Google Cloud Credits",
    color: COLORS.emerald,
    desc: "Scaling our Vertex AI private endpoint deployment and multi-agent Antigravity pipelines.",
  },
  {
    title: "Technical Mentorship",
    color: COLORS.violet,
    desc: "Partnering with Google AI research teams to optimize edge Gemini 2.0 AST fine-tuning.",
  },
];

askCards.forEach((a, idx) => {
  const x = 40 + idx * (colW3 + 26);
  drawCard(x, 210, colW3, 160, a.color);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...a.color);
  doc.text(a.title, x + 20, 245);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textMuted);
  const aLines = doc.splitTextToSize(a.desc, colW3 - 40);
  doc.text(aLines, x + 20, 275);
});

drawCard(40, 395, 880, 55, COLORS.cyan);
doc.setFont("helvetica", "bold");
doc.setFontSize(11);
doc.setTextColor(...COLORS.cyan);
doc.text("GET IN TOUCH & TRY THE PREVIEW:", 60, 427);
doc.setFont("helvetica", "normal");
doc.setFontSize(11);
doc.setTextColor(...COLORS.textWhite);
doc.text("founder@codefy.dev  |  startupbuildathon.com  |  Bengaluru & Remote", 290, 427);

drawFooter(12, "Codefy (WhoAmI) • Transforming How Developers Protect What They Build");

// Save output PDF
const outputDir = path.resolve(projectRoot, "docs/pitch/presentation");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
const outputPath = path.resolve(outputDir, "pitch-deck.pdf");
const pdfBytes = doc.output("arraybuffer");
fs.writeFileSync(outputPath, Buffer.from(pdfBytes));

const fileSizeMB = (fs.statSync(outputPath).size / (1024 * 1024)).toFixed(2);
console.log(`[SUCCESS] Generated Pitch Deck PDF: ${outputPath}`);
console.log(`[FILE SIZE] ${fileSizeMB} MB (Limit: 5.0 MB)`);
