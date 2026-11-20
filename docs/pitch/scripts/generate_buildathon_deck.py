import os
import pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_buildathon_deck():
    prs = pptx.Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Theme colors
    C_BG = RGBColor(11, 11, 15)
    C_RAIL = RGBColor(224, 17, 127)
    C_CARD = RGBColor(16, 25, 43)
    C_CARD_BORDER = RGBColor(42, 61, 92)
    C_SUBCARD = RGBColor(15, 22, 35)
    C_SUBCARD_BORDER = RGBColor(30, 45, 72)
    C_WHITE = RGBColor(255, 255, 255)
    C_TEXT_SEC = RGBColor(203, 213, 225)
    C_TEXT_MUTED = RGBColor(148, 163, 184)
    C_GREEN = RGBColor(16, 185, 129)
    C_BLUE = RGBColor(59, 130, 246)
    C_AMBER = RGBColor(245, 158, 11)
    C_PINK = RGBColor(224, 17, 127)

    def base_slide(num, total, section, kicker, title, footer="GOOGLE DEEPMIND | GOOGLE CLOUD STARTUP BUILDATHON INDIA 2026 · CONFIDENTIAL BRIEFING"):
        slide = prs.slides.add_slide(blank_layout)

        # Background
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = C_BG
        bg.line.fill.background()

        # Vertical Magenta Rail
        rail = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.6), Inches(0.45), Inches(0.025), Inches(6.55))
        rail.fill.solid()
        rail.fill.fore_color.rgb = C_RAIL
        rail.line.fill.background()

        # Header Track
        tb = slide.shapes.add_textbox(Inches(0.85), Inches(0.35), Inches(11.8), Inches(0.28))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = f"{str(num).zfill(2)} · {section.upper()}  |  GOOGLE DEEPMIND & CLOUD BUILDATHON 2026 · {num} / {total}"
        p.font.name = "Courier New"
        p.font.size = Pt(9)
        p.font.bold = True
        p.font.color.rgb = C_TEXT_MUTED

        # Kicker
        tb_k = slide.shapes.add_textbox(Inches(0.85), Inches(0.68), Inches(11.8), Inches(0.25))
        tf_k = tb_k.text_frame
        tf_k.word_wrap = True
        tf_k.margin_left = tf_k.margin_top = tf_k.margin_right = tf_k.margin_bottom = 0
        pk = tf_k.paragraphs[0]
        pk.text = f"§ {kicker.upper()}"
        pk.font.name = "Courier New"
        pk.font.size = Pt(10)
        pk.font.bold = True
        pk.font.color.rgb = C_RAIL

        # Title
        tb_t = slide.shapes.add_textbox(Inches(0.85), Inches(0.95), Inches(11.8), Inches(0.55))
        tf_t = tb_t.text_frame
        tf_t.word_wrap = True
        tf_t.margin_left = tf_t.margin_top = tf_t.margin_right = tf_t.margin_bottom = 0
        pt = tf_t.paragraphs[0]
        pt.text = title
        pt.font.name = "Georgia"
        pt.font.size = Pt(21)
        pt.font.bold = True
        pt.font.color.rgb = C_WHITE

        # Footer
        tb_f = slide.shapes.add_textbox(Inches(0.85), Inches(7.05), Inches(11.8), Inches(0.25))
        tf_f = tb_f.text_frame
        tf_f.word_wrap = True
        tf_f.margin_left = tf_f.margin_top = tf_f.margin_right = tf_f.margin_bottom = 0
        pf = tf_f.paragraphs[0]
        pf.text = footer
        pf.font.name = "Courier New"
        pf.font.size = Pt(8.5)
        pf.font.color.rgb = C_TEXT_MUTED

        return slide

    def make_card(slide, left, top, width, height, bg_col=C_CARD, border_col=C_CARD_BORDER):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
        card.fill.solid()
        card.fill.fore_color.rgb = bg_col
        card.line.color.rgb = border_col
        card.line.width = Pt(1)
        return card

    # =========================================================================
    # SLIDE 1: COVER
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    bg1 = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = C_BG
    bg1.line.fill.background()

    rail1 = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.0), Inches(0.04), Inches(5.5))
    rail1.fill.solid()
    rail1.fill.fore_color.rgb = C_RAIL
    rail1.line.fill.background()

    # Cover Header
    tb_c1 = s1.shapes.add_textbox(Inches(1.2), Inches(1.2), Inches(11.0), Inches(0.5))
    p = tb_c1.text_frame.paragraphs[0]
    p.text = "GOOGLE DEEPMIND | GOOGLE CLOUD — STARTUP BUILDATHON INDIA 2026"
    p.font.name = "Courier New"
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = C_RAIL

    # Main Brand Name
    tb_c2 = s1.shapes.add_textbox(Inches(1.2), Inches(1.8), Inches(11.0), Inches(1.2))
    p = tb_c2.text_frame.paragraphs[0]
    p.text = "CODEFY"
    p.font.name = "Georgia"
    p.font.size = Pt(56)
    p.font.bold = True
    p.font.color.rgb = C_WHITE

    # Tagline
    tb_c3 = s1.shapes.add_textbox(Inches(1.2), Inches(3.0), Inches(11.0), Inches(0.8))
    p = tb_c3.text_frame.paragraphs[0]
    p.text = "Developer-First Autonomous Application Security Intelligence"
    p.font.name = "Georgia"
    p.font.size = Pt(22)
    p.font.color.rgb = C_WHITE
    p2 = tb_c3.text_frame.add_paragraph()
    p2.text = "Unified Local AST Taint Tracing, Entropy Secrets & Opt-In Cloud DAST Probes"
    p2.font.name = "Arial"
    p2.font.size = Pt(14)
    p2.font.color.rgb = C_TEXT_SEC

    # 3 Summary Pillar Cards
    c1 = make_card(s1, 1.2, 4.2, 3.4, 2.0)
    tb = s1.shapes.add_textbox(Inches(1.35), Inches(4.35), Inches(3.1), Inches(1.7))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "01 · LOCAL FIRST"; p.font.name = "Courier New"; p.font.size = Pt(10); p.font.bold = True; p.font.color.rgb = C_GREEN
    p = tf.add_paragraph(); p.text = "Zero Code Upload"; p.font.name = "Georgia"; p.font.size = Pt(15); p.font.bold = True; p.font.color.rgb = C_WHITE
    p = tf.add_paragraph(); p.text = "Sub-millisecond AST taint tracing directly inside VS Code and CLI. Confidential code stays local."; p.font.name = "Arial"; p.font.size = Pt(11); p.font.color.rgb = C_TEXT_SEC

    c2 = make_card(s1, 4.9, 4.2, 3.4, 2.0)
    tb = s1.shapes.add_textbox(Inches(5.05), Inches(4.35), Inches(3.1), Inches(1.7))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "02 · VISUAL ATTACK PATHS"; p.font.name = "Courier New"; p.font.size = Pt(10); p.font.bold = True; p.font.color.rgb = C_PINK
    p = tf.add_paragraph(); p.text = "Traced Flow Graphs"; p.font.name = "Georgia"; p.font.size = Pt(15); p.font.bold = True; p.font.color.rgb = C_WHITE
    p = tf.add_paragraph(); p.text = "6 interactive React Flow DAGs map source-to-sink vulnerability reachability with 1-click diff fixes."; p.font.name = "Arial"; p.font.size = Pt(11); p.font.color.rgb = C_TEXT_SEC

    c3 = make_card(s1, 8.6, 4.2, 3.4, 2.0)
    tb = s1.shapes.add_textbox(Inches(8.75), Inches(4.35), Inches(3.1), Inches(1.7))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "03 · ACCESSIBLE RUPEES"; p.font.name = "Courier New"; p.font.size = Pt(10); p.font.bold = True; p.font.color.rgb = C_BLUE
    p = tf.add_paragraph(); p.text = "Built for Indian Startups"; p.font.name = "Georgia"; p.font.size = Pt(15); p.font.bold = True; p.font.color.rgb = C_WHITE
    p = tf.add_paragraph(); p.text = "Proposed ₹4,999/mo replaces foreign enterprise tools costing ₹25k–₹33k/mo. 78% savings for Indian SaaS."; p.font.name = "Arial"; p.font.size = Pt(11); p.font.color.rgb = C_TEXT_SEC

    # Metadata bottom bar
    tb_bot = s1.shapes.add_textbox(Inches(1.2), Inches(6.5), Inches(11.0), Inches(0.4))
    p = tb_bot.text_frame.paragraphs[0]
    p.text = "FOUNDER: Jayesh Pandey  ·  TEAM SIZE: 1 Founder + Open-Source Contributors  ·  TRACK: Developer Tools & AI Security"
    p.font.name = "Courier New"; p.font.size = Pt(9); p.font.color.rgb = C_TEXT_MUTED

    # =========================================================================
    # SLIDE 2: TEAM & PROBLEM STATEMENT
    # =========================================================================
    s2 = base_slide(2, 16, "Team & Problem Statement", "The Security Squeeze", "Vulnerabilities are the #1 breach entry vector; manual testing is slow & costly.")
    
    make_card(s2, 0.85, 1.65, 3.6, 5.2)
    tb = s2.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(3.3), Inches(4.8))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "TEAM DETAILS"; p.font.name = "Courier New"; p.font.size = Pt(10); p.font.bold = True; p.font.color.rgb = C_PINK
    p = tf.add_paragraph(); p.text = "Codefy (WhoAmI)"; p.font.name = "Georgia"; p.font.size = Pt(18); p.font.bold = True; p.font.color.rgb = C_WHITE
    p = tf.add_paragraph(); p.text = "• Team Size: 1 Founder + Community Contributors\n• Founder: Jayesh Pandey\n• Role: Full-Stack Security Engineering & Architecture\n• Surface Ownership: CLI, VS Code Extension, Tauri App, Stdio MCP Server\n• Mission: Bring enterprise-grade AppSec to Indian developer budgets."; p.font.name = "Arial"; p.font.size = Pt(11.5); p.font.color.rgb = C_TEXT_SEC

    make_card(s2, 4.65, 1.65, 7.8, 5.2)
    tb = s2.shapes.add_textbox(Inches(4.85), Inches(1.8), Inches(7.4), Inches(4.8))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "CORE PROBLEM STATEMENT: THREE CRITICAL PRESSURES"; p.font.name = "Courier New"; p.font.size = Pt(10); p.font.bold = True; p.font.color.rgb = C_BLUE
    
    p = tf.add_paragraph(); p.text = "1. Vulnerabilities are Now #1 Breach Entry Vector (31%)"; p.font.name = "Georgia"; p.font.size = Pt(14); p.font.bold = True; p.font.color.rgb = C_WHITE
    p = tf.add_paragraph(); p.text = "Verizon 2026 DBIR confirms software vulnerabilities overtook stolen credentials for the first time in 19 years. Third-party dependency risk reached 48%."; p.font.name = "Arial"; p.font.size = Pt(11); p.font.color.rgb = C_TEXT_SEC

    p = tf.add_paragraph(); p.text = "2. Indian Breach Cost Hit an All-Time High of ₹25.5 Crore"; p.font.name = "Georgia"; p.font.size = Pt(14); p.font.bold = True; p.font.color.rgb = C_PINK
    p = tf.add_paragraph(); p.text = "IBM 2026 Cost of a Data Breach (India) reports a 15.9% YoY increase. Offensive testing was the single largest cost saver, saving ₹2.47 crore per breach incident."; p.font.name = "Arial"; p.font.size = Pt(11); p.font.color.rgb = C_TEXT_SEC

    p = tf.add_paragraph(); p.text = "3. Manual VAPTs are Too Slow (1–3 Weeks) & Foreign Tools Costly ($25–$35/user)"; p.font.name = "Georgia"; p.font.size = Pt(14); p.font.bold = True; p.font.color.rgb = C_AMBER
    p = tf.add_paragraph(); p.text = "Manual pentests cost ₹40,000–₹1,50,000 per pass, causing startups to test only once a year. DPDP Act 2025 (up to ₹250 Cr penalties) and RBI/SEBI CSCRF now mandate continuous verification."; p.font.name = "Arial"; p.font.size = Pt(11); p.font.color.rgb = C_TEXT_SEC

    # =========================================================================
    # SLIDE 3: BRIEF ABOUT THE IDEA
    # =========================================================================
    s3 = base_slide(3, 16, "Brief About Idea", "Unified Solution", "Local AST analysis, secret detection & cloud probes — unified into attack paths.")
    
    make_card(s3, 0.85, 1.65, 3.8, 5.2)
    tb = s3.shapes.add_textbox(Inches(1.05), Inches(1.85), Inches(3.4), Inches(4.7))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "WHAT WE BUILD"; p.font.name = "Courier New"; p.font.size = Pt(10); p.font.bold = True; p.font.color.rgb = C_PINK
    p = tf.add_paragraph(); p.text = "Unified Security Core"; p.font.name = "Georgia"; p.font.size = Pt(16); p.font.bold = True; p.font.color.rgb = C_WHITE
    p = tf.add_paragraph(); p.text = "Codefy eliminates the fragmented AppSec stack by combining deterministic local AST taint tracing (JS/TS & Python), Shannon entropy secret scanning (≥4.0), and opt-in cloud DAST probes into one continuous workflow."; p.font.name = "Arial"; p.font.size = Pt(11.5); p.font.color.rgb = C_TEXT_SEC

    make_card(s3, 4.85, 1.65, 3.8, 5.2)
    tb = s3.shapes.add_textbox(Inches(5.05), Inches(1.85), Inches(3.4), Inches(4.7))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "HOW IT OPERATES"; p.font.name = "Courier New"; p.font.size = Pt(10); p.font.bold = True; p.font.color.rgb = C_BLUE
    p = tf.add_paragraph(); p.text = "Local-First Privacy"; p.font.name = "Georgia"; p.font.size = Pt(16); p.font.bold = True; p.font.color.rgb = C_WHITE
    p = tf.add_paragraph(); p.text = "Developers scan in VS Code or CLI with zero source code upload. Local Tree-sitter WASM and ast-grep N-API execute in under 1 millisecond per file. Cloud runners are strictly opt-in for multi-scanner CI/CD gates."; p.font.name = "Arial"; p.font.size = Pt(11.5); p.font.color.rgb = C_TEXT_SEC

    make_card(s3, 8.85, 1.65, 3.8, 5.2)
    tb = s3.shapes.add_textbox(Inches(9.05), Inches(1.85), Inches(3.4), Inches(4.7))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "HOW IT DELIVERS"; p.font.name = "Courier New"; p.font.size = Pt(10); p.font.bold = True; p.font.color.rgb = C_GREEN
    p = tf.add_paragraph(); p.text = "Traced Attack DAGs & MCP"; p.font.name = "Georgia"; p.font.size = Pt(16); p.font.bold = True; p.font.color.rgb = C_WHITE
    p = tf.add_paragraph(); p.text = "Instead of noisy 100-page issue lists, Codefy renders 6 interactive React Flow attack graphs showing exact source-to-sink reachability, plus a 24-tool Stdio MCP Server for autonomous AI remediation."; p.font.name = "Arial"; p.font.size = Pt(11.5); p.font.color.rgb = C_TEXT_SEC

    # =========================================================================
    # SLIDE 4: OPPORTUNITIES & 4 USPs
    # =========================================================================
    s4 = base_slide(4, 16, "Opportunities & Differences", "Market Differentiation", "Four defensible advantages built specifically for Indian engineering economics.")
    
    usps = [
        ("01 · UNIFIED APPSEC WORKFLOW", "One Platform, Zero Tool Sprawl", "Local AST + cloud SAST + 27 dynamic probes + secret entropy in one developer tool instead of 4 fragmented vendor subscriptions.", C_BLUE),
        ("02 · OFFLINE LOCAL ENGINE", "Zero Code Upload Privacy", "Proprietary source code never leaves the developer laptop during in-editor passes. Sub-millisecond execution via Tree-sitter WASM.", C_GREEN),
        ("03 · VISUAL ATTACK PATHS", "Source-to-Sink Taint DAGs", "6 interactive React Flow views replace flat alarm lists. Trace exact user input to vulnerable database sinks with 1-click diff preview.", C_PINK),
        ("04 · 24-TOOL AGENT MCP SERVER", "Autonomous AI Remediation", "Native stdio Model Context Protocol server lets Claude Code, Cursor, and Google Antigravity inspect findings and self-heal vulnerabilities.", C_AMBER)
    ]
    for idx, (usp_k, usp_t, usp_d, col) in enumerate(usps):
        col_idx = idx % 2
        row_idx = idx // 2
        l = 0.85 + col_idx * 5.9
        t = 1.65 + row_idx * 2.6
        make_card(s4, l, t, 5.7, 2.4)
        tb = s4.shapes.add_textbox(Inches(l + 0.2), Inches(t + 0.15), Inches(5.3), Inches(2.1))
        tf = tb.text_frame; tf.word_wrap = True
        p = tf.paragraphs[0]; p.text = usp_k; p.font.name = "Courier New"; p.font.size = Pt(10); p.font.bold = True; p.font.color.rgb = col
        p = tf.add_paragraph(); p.text = usp_t; p.font.name = "Georgia"; p.font.size = Pt(15); p.font.bold = True; p.font.color.rgb = C_WHITE
        p = tf.add_paragraph(); p.text = usp_d; p.font.name = "Arial"; p.font.size = Pt(11); p.font.color.rgb = C_TEXT_SEC

    # =========================================================================
    # SLIDE 5: FEATURES OFFERED
    # =========================================================================
    s5 = base_slide(5, 16, "Features Offered", "Core Capabilities", "Deterministic local static analysis, secret entropy, dynamic probes & agent tools.")
    
    features = [
        ("LOCAL AST TAINT ENGINE", "Tree-sitter WASM + ast-grep N-API", "Sub-millisecond intra-procedural taint flow analysis across JavaScript/TypeScript and Python codebases.", C_GREEN),
        ("SHANNON ENTROPY SECRETS", "Entropy Threshold ≥ 4.0", "Detects hardcoded API keys, private certificates, JWT tokens, AWS/Stripe keys before git commits occur.", C_BLUE),
        ("27 LIGHTWEIGHT DAST PROBES", "Python Async HTTP Engine", "Audits CORS wildcards, SSL/TLS ciphers, open redirects, missing HSTS, CSP headers, and SSRF guardrails.", C_AMBER),
        ("6 REACT FLOW ATTACK VIEWS", "ELK.js Algorithmic Layout", "Visualizes Unified Architecture, Taint Flows, Control Decisions, Supply Chain Dependencies & Threat Matrix.", C_PINK),
        ("24-TOOL STDIO MCP SERVER", "AI Agent Interoperability", "Exposes project security telemetry directly into Claude Code, Cursor, and Google Antigravity reasoning loops.", C_BLUE),
        ("CANONICAL SARIF & PDF EXPORT", "SARIF v2.1.0 Compliance", "Emits standard compliance files for GitHub Advanced Security and executive PDF audit handover certificates.", C_GREEN)
    ]
    for idx, (fk, ft, fd, col) in enumerate(features):
        col_idx = idx % 3
        row_idx = idx // 3
        l = 0.85 + col_idx * 3.9
        t = 1.65 + row_idx * 2.6
        make_card(s5, l, t, 3.75, 2.4)
        tb = s5.shapes.add_textbox(Inches(l + 0.15), Inches(t + 0.15), Inches(3.45), Inches(2.1))
        tf = tb.text_frame; tf.word_wrap = True
        p = tf.paragraphs[0]; p.text = fk; p.font.name = "Courier New"; p.font.size = Pt(9.5); p.font.bold = True; p.font.color.rgb = col
        p = tf.add_paragraph(); p.text = ft; p.font.name = "Georgia"; p.font.size = Pt(14); p.font.bold = True; p.font.color.rgb = C_WHITE
        p = tf.add_paragraph(); p.text = fd; p.font.name = "Arial"; p.font.size = Pt(10.5); p.font.color.rgb = C_TEXT_SEC

    # =========================================================================
    # SLIDE 6: PROCESS FLOW / USE-CASE DIAGRAM
    # =========================================================================
    s6 = base_slide(6, 16, "Process Flow & Use-Case", "Execution Workflow", "From code commit to local AST parsing, taint DAG rendering, and CI/CD gating.")
    
    steps = [
        ("STEP 01", "Developer Action", "Developer edits code in VS Code or executes CLI runner across local workspace.", C_GREEN),
        ("STEP 02", "In-Process Core", "Tree-sitter WASM parses AST; ast-grep traces intra-procedural taint flows (<1 ms).", C_BLUE),
        ("STEP 03", "Entropy Analysis", "Shannon entropy scanner flags credentials (entropy ≥ 4.0) with zero network transit.", C_AMBER),
        ("STEP 04", "Attack DAG Engine", "Graph store constructs interactive React Flow nodes showing complete source-to-sink path.", C_PINK),
        ("STEP 05", "Agent / Fix Loop", "24-Tool Stdio MCP Server feeds context to LLM agent for 1-click diff patch synthesis.", C_BLUE),
        ("STEP 06", "Opt-In CI/CD Gate", "Cloud workers run Semgrep/Trufflehog/Trivy and export canonical SARIF to block bad PRs.", C_GREEN)
    ]
    for idx, (st_k, st_t, st_d, col) in enumerate(steps):
        l = 0.85 + idx * 1.95
        make_card(s6, l, 1.65, 1.85, 5.2)
        tb = s6.shapes.add_textbox(Inches(l + 0.1), Inches(1.8), Inches(1.65), Inches(4.8))
        tf = tb.text_frame; tf.word_wrap = True
        p = tf.paragraphs[0]; p.text = st_k; p.font.name = "Courier New"; p.font.size = Pt(10); p.font.bold = True; p.font.color.rgb = col
        p = tf.add_paragraph(); p.text = st_t; p.font.name = "Georgia"; p.font.size = Pt(13); p.font.bold = True; p.font.color.rgb = C_WHITE
        p = tf.add_paragraph(); p.text = st_d; p.font.name = "Arial"; p.font.size = Pt(10.5); p.font.color.rgb = C_TEXT_SEC

    # =========================================================================
    # SLIDE 7: WIREFRAMES / RUNNING SURFACES
    # =========================================================================
    s7 = base_slide(7, 16, "Wireframes & Running Surfaces", "Omnichannel Delivery", "Demonstrated across Terminal CLI, VS Code Extension, and Agent MCP Server.")
    
    p_cli = "docs/pitch/assets/screenshots/presentation/cli-version.png"
    p_ext = "docs/pitch/assets/screenshots/presentation/extension-version.jpg"
    p_mcp = "docs/pitch/assets/screenshots/presentation/mcp-antigravity.jpg"

    surfaces = [
        ("SURFACE 01 · CLI RUNNER", "Terminal CLI v1.1.1", p_cli, C_GREEN),
        ("SURFACE 02 · IDE INTEGRATION", "VS Code Extension v0.3.1", p_ext, C_PINK),
        ("SURFACE 03 · AI REASONING", "Antigravity Stdio MCP", p_mcp, C_BLUE)
    ]
    for idx, (sk, st, img_path, col) in enumerate(surfaces):
        l = 0.85 + idx * 3.9
        make_card(s7, l, 1.65, 3.8, 5.2)
        tb = s7.shapes.add_textbox(Inches(l + 0.15), Inches(1.75), Inches(3.5), Inches(0.6))
        tf = tb.text_frame; tf.word_wrap = True
        p = tf.paragraphs[0]; p.text = sk; p.font.name = "Courier New"; p.font.size = Pt(9.5); p.font.bold = True; p.font.color.rgb = col
        p = tf.add_paragraph(); p.text = st; p.font.name = "Georgia"; p.font.size = Pt(14); p.font.bold = True; p.font.color.rgb = C_WHITE

        if os.path.exists(img_path):
            s7.shapes.add_picture(img_path, Inches(l + 0.15), Inches(2.45), Inches(3.5), Inches(4.25))

    # =========================================================================
    # SLIDE 8: ARCHITECTURE DIAGRAM
    # =========================================================================
    s8 = base_slide(8, 16, "Technical Architecture", "System Design", "4-Tier Architecture: Client Surfaces, Local Core, Edge Gateway & Cloud Workers.")
    
    tiers = [
        ("TIER 01 · CLIENT SURFACES & AGENT MCP", "VS Code (v0.3.1) · Tauri Desktop (v0.3.0) · CLI (@mickey20/codefy 1.1.1) · Stdio MCP Server (24 Tools)", "Multi-surface entry points communicating over IPC or standard stdio JSON-RPC.", C_PINK),
        ("TIER 02 · LOCAL IN-PROCESS CORE ENGINE", "Tree-sitter WASM + ast-grep N-API · 10 Taint Rules · Shannon Entropy Scanner (≥ 4.0) · React Flow Views", "Sub-millisecond static parsing and graph construction. Zero network dependency in offline mode.", C_BLUE),
        ("TIER 03 · CLOUDFLARE EDGE PROXY & AUTH", "Cloudflare Workers reverse proxy · JWT token authentication on Vercel · Axiom SSRF controller", "Blocks requests to private subnets (RFC 1918) and cloud metadata IP endpoints (169.254.169.254).", C_GREEN),
        ("TIER 04 · CLOUD SAST & DAST WORKERS", "Celery workers on Redis queue · Semgrep, Gitleaks, Trivy · 27 Python DAST probes · Firebase RTDB", "Opt-in cloud runners for scheduled PR checks and multi-scanner heavy regression suites.", C_AMBER)
    ]
    for idx, (tk, tt, td, col) in enumerate(tiers):
        t = 1.65 + idx * 1.3
        make_card(s8, 0.85, t, 11.8, 1.15)
        tb = s8.shapes.add_textbox(Inches(1.05), Inches(t + 0.1), Inches(11.4), Inches(0.95))
        tf = tb.text_frame; tf.word_wrap = True
        p = tf.paragraphs[0]; p.text = tk; p.font.name = "Courier New"; p.font.size = Pt(10); p.font.bold = True; p.font.color.rgb = col
        p = tf.add_paragraph(); p.text = tt; p.font.name = "Georgia"; p.font.size = Pt(13); p.font.bold = True; p.font.color.rgb = C_WHITE
        p = tf.add_paragraph(); p.text = td; p.font.name = "Arial"; p.font.size = Pt(10.5); p.font.color.rgb = C_TEXT_SEC

    # =========================================================================
    # SLIDE 9: TECHNOLOGIES USED
    # =========================================================================
    s9 = base_slide(9, 16, "Technologies Used", "Tech Stack & Frameworks", "Leveraging Google DeepMind Gemini Flash, Rust AST engines, React 19 & Python.")
    
    stacks = [
        ("AI & AGENT REASONING", "Google DeepMind Gemini 3.8 Flash & Stdio MCP", "Gemini Flash provides low-latency vulnerability classification, JEV hypothesis reasoning, and schema-enforced patch validation. Model Context Protocol provides agent tool discovery.", C_BLUE),
        ("STATIC AST PARSING", "Tree-sitter WASM & ast-grep N-API", "High-performance incremental syntax tree parsing compiled to WebAssembly and native N-API bindings. Enables sub-millisecond local taint reachability evaluation.", C_GREEN),
        ("FRONTEND & GRAPH VISUALIZATION", "React 19, TypeScript, React Flow & Tauri", "Custom-built reactive canvas powered by React Flow and ELK layout algorithms. Tauri provides cross-platform desktop security without Chromium memory bloat.", C_PINK),
        ("BACKEND & CLOUD DISTRIBUTED QUEUE", "FastAPI, Celery, Redis & Cloudflare Edge", "Asynchronous Python 3.12 microservices, distributed Redis queuing on Render, and Cloudflare Workers providing zero-trust edge token authentication.", C_AMBER)
    ]
    for idx, (sk, st, sd, col) in enumerate(stacks):
        col_idx = idx % 2
        row_idx = idx // 2
        l = 0.85 + col_idx * 5.9
        t = 1.65 + row_idx * 2.6
        make_card(s9, l, t, 5.7, 2.4)
        tb = s9.shapes.add_textbox(Inches(l + 0.2), Inches(t + 0.15), Inches(5.3), Inches(2.1))
        tf = tb.text_frame; tf.word_wrap = True
        p = tf.paragraphs[0]; p.text = sk; p.font.name = "Courier New"; p.font.size = Pt(10); p.font.bold = True; p.font.color.rgb = col
        p = tf.add_paragraph(); p.text = st; p.font.name = "Georgia"; p.font.size = Pt(15); p.font.bold = True; p.font.color.rgb = C_WHITE
        p = tf.add_paragraph(); p.text = sd; p.font.name = "Arial"; p.font.size = Pt(11); p.font.color.rgb = C_TEXT_SEC

    # =========================================================================
    # SLIDE 10: IMPLEMENTATION COST & UNIT ECONOMICS
    # =========================================================================
    s10 = base_slide(10, 16, "Implementation Cost", "Commercial Sustainability", "Fixed infrastructure dominates early costs; break-even achieved at 3 customers.")
    
    make_card(s10, 0.85, 1.65, 3.8, 5.2)
    tb = s10.shapes.add_textbox(Inches(1.05), Inches(1.85), Inches(3.4), Inches(4.7))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "PROPOSED PRICING (EX-GST)"; p.font.name = "Courier New"; p.font.size = Pt(10); p.font.bold = True; p.font.color.rgb = C_PINK
    p = tf.add_paragraph(); p.text = "₹4,999 /mo Hero Tier"; p.font.name = "Georgia"; p.font.size = Pt(16); p.font.bold = True; p.font.color.rgb = C_WHITE
    p = tf.add_paragraph(); p.text = "• Free Tier: ₹0 (Unlimited offline scans & AST DAGs)\n• Developer: ₹499/user/mo (Cloud SAST/DAST + SARIF)\n• Startup (Hero): ₹4,999/org/mo (Up to 10 devs)\n• Growth: ₹19,999/org/mo (Up to 40 devs)\n• Enterprise: Custom VPC & custom AST rules\n\nDirect UPI / NetBanking billing eliminates USD forex friction."; p.font.name = "Arial"; p.font.size = Pt(11.5); p.font.color.rgb = C_TEXT_SEC

    make_card(s10, 4.85, 1.65, 3.8, 5.2)
    tb = s10.shapes.add_textbox(Inches(5.05), Inches(1.85), Inches(3.4), Inches(4.7))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "INFRASTRUCTURE COSTS"; p.font.name = "Courier New"; p.font.size = Pt(10); p.font.bold = True; p.font.color.rgb = C_BLUE
    p = tf.add_paragraph(); p.text = "Unit Model Scaling"; p.font.name = "Georgia"; p.font.size = Pt(16); p.font.bold = True; p.font.color.rgb = C_WHITE
    p = tf.add_paragraph(); p.text = "• MVP (10 Users): ₹10,528/mo\n  - Cloudflare Workers: ₹467\n  - Render Celery Workers: ₹6,535\n  - Managed Redis Queue: ₹1,400\n  - Firebase Realtime DB: ₹2,126\n• Growth (100 Users): ₹26,568/mo\n• Scale (1,000 Users): ₹90,352/mo\n\nCost per cloud scan falls from ₹131.60 to ₹11.29 at scale."; p.font.name = "Arial"; p.font.size = Pt(11.5); p.font.color.rgb = C_TEXT_SEC

    make_card(s10, 8.85, 1.65, 3.8, 5.2)
    tb = s10.shapes.add_textbox(Inches(9.05), Inches(1.85), Inches(3.4), Inches(4.7))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "BREAK-EVEN ANALYSIS"; p.font.name = "Courier New"; p.font.size = Pt(10); p.font.bold = True; p.font.color.rgb = C_GREEN
    p = tf.add_paragraph(); p.text = "3 Customers to Profit"; p.font.name = "Georgia"; p.font.size = Pt(16); p.font.bold = True; p.font.color.rgb = C_WHITE
    p = tf.add_paragraph(); p.text = "• 3 Paying Startups (₹15,000 MRR) fully covers entire monthly cloud infra + Gemini LLM tokens.\n\n• 23 Paying Startups covers all cloud operations PLUS a ₹1,00,000/month full-time founder stipend.\n\n• Gross Margin expands from 35.5% at 100 users to 70.6% at 1,000 users."; p.font.name = "Arial"; p.font.size = Pt(11.5); p.font.color.rgb = C_TEXT_SEC

    # =========================================================================
    # SLIDE 11: PROTOTYPE SNAPSHOTS
    # =========================================================================
    s11 = base_slide(11, 16, "Prototype Snapshots", "Working Implementation", "Operational taint DAG, automated 1-click diff fix, and terminal CLI runner.")
    
    p_dag = "docs/pitch/assets/screenshots/presentation/crop_image.png"
    p_diff = "docs/pitch/assets/screenshots/presentation/desktop-remediation.png"
    p_run = "docs/pitch/assets/screenshots/presentation/cli-sast.png"

    shots = [
        ("IN-EDITOR TAINT DAG", "VS Code Real-Time Blast Radius", p_dag, C_PINK),
        ("1-CLICK REMEDIATION", "Automated Safe Sanitization", p_diff, C_GREEN),
        ("TERMINAL AUDIT ENGINE", "Multi-Engine Progress Stream", p_run, C_BLUE)
    ]
    for idx, (sk, st, img_path, col) in enumerate(shots):
        l = 0.85 + idx * 3.9
        make_card(s11, l, 1.65, 3.8, 5.2)
        tb = s11.shapes.add_textbox(Inches(l + 0.15), Inches(1.75), Inches(3.5), Inches(0.6))
        tf = tb.text_frame; tf.word_wrap = True
        p = tf.paragraphs[0]; p.text = sk; p.font.name = "Courier New"; p.font.size = Pt(9.5); p.font.bold = True; p.font.color.rgb = col
        p = tf.add_paragraph(); p.text = st; p.font.name = "Georgia"; p.font.size = Pt(14); p.font.bold = True; p.font.color.rgb = C_WHITE

        if os.path.exists(img_path):
            s11.shapes.add_picture(img_path, Inches(l + 0.15), Inches(2.45), Inches(3.5), Inches(4.25))

    # =========================================================================
    # SLIDE 12: PROTOTYPE PERFORMANCE & BENCHMARKING
    # =========================================================================
    s12 = base_slide(12, 16, "Performance & Benchmarks", "Empirical Evidence", "Verified speed metrics on Apple M5 hardware and honest seeded repository audits.")
    
    make_card(s12, 0.85, 1.65, 5.7, 5.2)
    tb = s12.shapes.add_textbox(Inches(1.05), Inches(1.85), Inches(5.3), Inches(4.7))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "MEASURED SCAN BENCHMARKS (APPLE M5)"; p.font.name = "Courier New"; p.font.size = Pt(10); p.font.bold = True; p.font.color.rgb = C_GREEN
    p = tf.add_paragraph(); p.text = "Sub-Millisecond Engine Speed"; p.font.name = "Georgia"; p.font.size = Pt(18); p.font.bold = True; p.font.color.rgb = C_WHITE
    p = tf.add_paragraph(); p.text = "• 0.24 ms: Median AST scan time per file on test fixtures.\n• 126 ms: Complete repository audit across 40 files / 10,116 lines of code.\n• 94 s: Complete multi-engine cloud pipeline (Semgrep, Gitleaks, Trivy).\n• 2–3 Days vs ≈1 Second: Senior QA tester reported 2–3 days to manually discover and prove a complex injection vulnerability; Codefy surfaced it in ~1 second."; p.font.name = "Arial"; p.font.size = Pt(12); p.font.color.rgb = C_TEXT_SEC

    make_card(s12, 6.75, 1.65, 5.7, 5.2)
    tb = s12.shapes.add_textbox(Inches(6.95), Inches(1.85), Inches(5.3), Inches(4.7))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "EMPIRICAL SEEDED TEST AUDIT"; p.font.name = "Courier New"; p.font.size = Pt(10); p.font.bold = True; p.font.color.rgb = C_PINK
    p = tf.add_paragraph(); p.text = "4 of 5 Planted Flaws Detected"; p.font.name = "Georgia"; p.font.size = Pt(18); p.font.bold = True; p.font.color.rgb = C_WHITE
    p = tf.add_paragraph(); p.text = "• Seeded Repository: 7 real test files with 5 deliberate vulnerabilities planted (SQLi, Command Injection, Path Traversal, Eval, Hardcoded Secret).\n• Local AST Engine: Detected 3 of 5 flaws.\n• Cloud SAST Engine: Detected 3 of 5 flaws.\n• Combined Codefy Engines: Successfully detected 4 of 5 planted flaws.\n\nHonest Assessment: Codefy does not fabricate 100% claims. Its wedge is instant speed, offline privacy, and Indian Rupee accessibility."; p.font.name = "Arial"; p.font.size = Pt(12); p.font.color.rgb = C_TEXT_SEC

    # =========================================================================
    # SLIDE 13: FUTURE ROADMAP & GLOBAL EXPANSION
    # =========================================================================
    s13 = base_slide(13, 16, "Future Development", "Technology Phasing", "From verified developer scanner to intelligent evidence-based security testing.")
    
    phases = [
        ("PHASE 01 · NOW (IMPLEMENTED)", "Multi-Surface AST Scanner", "• Intra-procedural taint tracing (JS/TS & Python)\n• Shannon entropy secret scanner (≥4.0)\n• Terminal CLI, VS Code & Tauri Desktop\n• 24-tool Stdio MCP Server for AI coding agents\n• 6 interactive React Flow DAG views & SARIF export", C_GREEN),
        ("PHASE 02 · NEXT (ARCHITECTURE)", "Joint Evidence & Validation (JEV)", "• Unified evidence graph combining SAST, DAST & secrets\n• Google DeepMind Gemini reasoning for narrow questions\n• Deterministic runtime validation (BugBound oracle)\n• AST-level 1-click diff patch synthesis with automated rescan\n• Eliminates LLM hallucinations via execution proofs", C_BLUE),
        ("PHASE 03 · FUTURE (RESEARCH)", "Guarded Recon & Auth Testing", "• Automated asset, service & API endpoint discovery\n• State-aware authentication and BOLA testing\n• Strict safety guardrails: written authorization, rate limits, immutable audit log, and emergency kill switch\n• Automated pytest regression test generation", C_AMBER)
    ]
    for idx, (pk, pt, pd, col) in enumerate(phases):
        l = 0.85 + idx * 3.9
        make_card(s13, l, 1.65, 3.8, 5.2)
        tb = s13.shapes.add_textbox(Inches(l + 0.15), Inches(1.85), Inches(3.5), Inches(4.7))
        tf = tb.text_frame; tf.word_wrap = True
        p = tf.paragraphs[0]; p.text = pk; p.font.name = "Courier New"; p.font.size = Pt(9.5); p.font.bold = True; p.font.color.rgb = col
        p = tf.add_paragraph(); p.text = pt; p.font.name = "Georgia"; p.font.size = Pt(14); p.font.bold = True; p.font.color.rgb = C_WHITE
        p = tf.add_paragraph(); p.text = pd; p.font.name = "Arial"; p.font.size = Pt(10.5); p.font.color.rgb = C_TEXT_SEC

    # =========================================================================
    # SLIDE 14: MARKET OPPORTUNITY & BOTTOM-UP SIZING
    # =========================================================================
    s14 = base_slide(14, 16, "Market Opportunity", "Bottom-Up Sizing", "Analyst estimates vary by 20x ($74M to $1.7B); our bottom-up model grounds reality.")
    
    make_card(s14, 0.85, 1.65, 5.7, 5.2)
    tb = s14.shapes.add_textbox(Inches(1.05), Inches(1.85), Inches(5.3), Inches(4.7))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "BOTTOM-UP SIZING IN RUPEES"; p.font.name = "Courier New"; p.font.size = Pt(10); p.font.bold = True; p.font.color.rgb = C_PINK
    p = tf.add_paragraph(); p.text = "TAM, SAM & SOM"; p.font.name = "Georgia"; p.font.size = Pt(18); p.font.bold = True; p.font.color.rgb = C_WHITE
    p = tf.add_paragraph(); p.text = "• TAM: ₹5,416 Crore ($579M)\n  2.05L DPIIT recognized tech startups + 20,000 dev agencies spending ₹60k–₹1.2L annually on AppSec.\n\n• SAM: ₹500 Crore ($53.5M)\n  60% of engineering teams building primarily in JavaScript, TypeScript, and Python.\n\n• SOM: ₹4.6 Crore ($490k)\n  Year-3 beachhead target of ~390 paying organizations (0.9% SAM penetration)."; p.font.name = "Arial"; p.font.size = Pt(12); p.font.color.rgb = C_TEXT_SEC

    make_card(s14, 6.75, 1.65, 5.7, 5.2)
    tb = s14.shapes.add_textbox(Inches(6.95), Inches(1.85), Inches(5.3), Inches(4.7))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "REGULATORY TRIGGERS FORCING ADOPTION"; p.font.name = "Courier New"; p.font.size = Pt(10); p.font.bold = True; p.font.color.rgb = C_BLUE
    p = tf.add_paragraph(); p.text = "Compliance Mandates in India"; p.font.name = "Georgia"; p.font.size = Pt(18); p.font.bold = True; p.font.color.rgb = C_WHITE
    p = tf.add_paragraph(); p.text = "• DPDP Rules 2025 (Notified 14 Nov 2025):\n  Statutory penalties up to ₹250 crore for inadequate technical safeguards and unaddressed vulnerabilities.\n\n• RBI & SEBI CSCRF Framework:\n  Mandatory continuous API security and periodic VAPT testing for fintechs, payment brokers, and NBFCs.\n\n• Enterprise Vendor Questionnaires:\n  Indian B2B SaaS startups require SARIF audit certificates to unblock deals with US and European clients."; p.font.name = "Arial"; p.font.size = Pt(12); p.font.color.rgb = C_TEXT_SEC

    # =========================================================================
    # SLIDE 15: 5-YEAR FINANCIAL MODEL & VALUATION
    # =========================================================================
    s15 = base_slide(15, 16, "Financial & Valuation Model", "5-Year Growth Forecast", "Revenue waterfall based on 20,000 monthly active developer funnel.")
    
    make_card(s15, 0.85, 1.65, 11.8, 5.2)
    tb = s15.shapes.add_textbox(Inches(1.05), Inches(1.85), Inches(11.4), Inches(4.7))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "5-YEAR REVENUE & VALUATION WATERFALL"; p.font.name = "Courier New"; p.font.size = Pt(10); p.font.bold = True; p.font.color.rgb = C_GREEN
    p = tf.add_paragraph(); p.text = "Scaling from ₹79.2 Lakh to ₹31.5 Crore ARR"; p.font.name = "Georgia"; p.font.size = Pt(18); p.font.bold = True; p.font.color.rgb = C_WHITE
    p = tf.add_paragraph(); p.text = """Year 1 (Beachhead):
• Paid Orgs: 132  ·  ARR: ₹79.2 Lakh ($95k)  ·  Gross Margin: 35.5%
• Valuation: ₹7.1 Crore ($850k) at 9x ARR multiple

Year 2 (Expansion):
• Paid Orgs: 440  ·  ARR: ₹2.64 Crore ($315k)  ·  Gross Margin: 58.2%
• Valuation: ₹23.8 Crore ($2.85M) at 9x ARR multiple

Year 3 (Scale):
• Paid Orgs: 1,320  ·  ARR: ₹7.92 Crore ($950k)  ·  Gross Margin: 72.4%
• Valuation: ₹67.3 Crore ($8.05M) at 8.5x ARR multiple

Year 4 (Market Leader):
• Paid Orgs: 2,750  ·  ARR: ₹16.50 Crore ($1.97M)  ·  Gross Margin: 78.6%
• Valuation: ₹132.0 Crore ($15.8M) at 8x ARR multiple

Year 5 (Global Maturity):
• Paid Orgs: 5,250  ·  ARR: ₹31.50 Crore ($3.77M)  ·  Gross Margin: 82.4%
• Valuation: ₹252.0 Crore ($30.1M) at 8x ARR multiple"""; p.font.name = "Courier New"; p.font.size = Pt(11); p.font.color.rgb = C_TEXT_SEC

    # =========================================================================
    # SLIDE 16: CLOSING & 30-MINUTE PILOT OFFER
    # =========================================================================
    s16 = base_slide(16, 16, "Closing & Next Steps", "Pilot Proposal", "Start testing on your own machine today: zero upload, instant speed, free.")
    
    make_card(s16, 0.85, 1.65, 7.6, 5.2)
    tb = s16.shapes.add_textbox(Inches(1.05), Inches(1.85), Inches(7.2), Inches(4.7))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "PROPOSED NEXT STEP: FREE 30-MINUTE SECURITY AUDIT PILOT"; p.font.name = "Courier New"; p.font.size = Pt(10); p.font.bold = True; p.font.color.rgb = C_PINK
    p = tf.add_paragraph(); p.text = "Let's scan one of your repositories together."; p.font.name = "Georgia"; p.font.size = Pt(20); p.font.bold = True; p.font.color.rgb = C_WHITE
    p = tf.add_paragraph(); p.text = "• Zero-Upload Local Scan: Run Codefy CLI or VS Code on 1 target repository in under 2 minutes.\n\n• Interactive Attack Path: Inspect the visual blast radius and root cause in the React Flow DAG.\n\n• 1-Click Fix Preview: Review automated AST sanitization diffs directly in your editor.\n\n• Compliance Audit Report: Export a verified SARIF and executive PDF report for your stakeholders.\n\n• Zero Commitment: Free local engine forever; opt-in cloud features only when ready."; p.font.name = "Arial"; p.font.size = Pt(12); p.font.color.rgb = C_TEXT_SEC

    make_card(s16, 8.65, 1.65, 3.8, 5.2)
    tb = s16.shapes.add_textbox(Inches(8.85), Inches(1.85), Inches(3.4), Inches(4.7))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = "FOUNDER & LINKS"; p.font.name = "Courier New"; p.font.size = Pt(10); p.font.bold = True; p.font.color.rgb = C_GREEN
    p = tf.add_paragraph(); p.text = "Connect With Us"; p.font.name = "Georgia"; p.font.size = Pt(18); p.font.bold = True; p.font.color.rgb = C_WHITE
    p = tf.add_paragraph(); p.text = "• Founder: Jayesh Pandey\n• Website: https://axtion.tech\n• VS Code Extension: Mickey20.codefy-whoami\n• CLI Package: npm i -g @mickey20/codefy\n• GitHub: github.com/jayeshpandey01/codefy\n• Stdio MCP Server: 24 Tools available for Claude Code, Cursor, and Antigravity\n\nGoogle Cloud & DeepMind Startup Buildathon India 2026"; p.font.name = "Arial"; p.font.size = Pt(11.5); p.font.color.rgb = C_TEXT_SEC

    out_path = "docs/pitch/google_slides/Codefy_Startup_Buildathon_2026.pptx"
    prs.save(out_path)
    print(f"Buildathon presentation generated successfully at: {out_path} ({len(prs.slides)} slides)")

if __name__ == "__main__":
    create_buildathon_deck()
