# Codefy (Axtion)

> **In-Process AST Code Intelligence & Unified Omnichannel Security Platform**  
> Sub-15ms local AST taint analysis, Shannon entropy secret detection ($H \ge 4.0$), and visual attack DAGs — with zero code transit.

[![Version](https://img.shields.io/badge/version-0.3.1-emerald.svg)](https://github.com/jayeshpandey01/codefy-whoami-/releases/tag/v0.3.1)
[![npm](https://img.shields.io/npm/v/@mickey20/codefy.svg?color=yellow)](https://www.npmjs.com/package/@mickey20/codefy)
[![VS Code Marketplace](https://img.shields.io/badge/vscode-Mickey20.codefy--whoami-blue.svg)](https://marketplace.visualstudio.com/items?itemName=Mickey20.codefy-whoami)
[![Website](https://img.shields.io/badge/website-axtion.tech-black.svg)](https://axtion.tech)
[![License](https://img.shields.io/badge/license-Proprietary-lightgrey.svg)](LICENSE)

---

## ⚡ Prototype & Platform Links

### 1. Web Platform & Documentation
- **Live Website**: [https://axtion.tech](https://axtion.tech)
- **Security Research & Architecture Journal**: [https://axtion.tech/blog](https://axtion.tech/blog)  
  *Features 10 comprehensive engineering whitepapers with zero-raster vector SVGs.*
- **Developer Documentation & Quickstart**: [https://axtion.tech/docs](https://axtion.tech/docs)
- **Developer Console**: [https://axtion.tech/dashboard](https://axtion.tech/dashboard)
- **About & Technology**: [https://axtion.tech/about](https://axtion.tech/about)

### 2. Desktop Application (macOS, Windows, Linux)
*Offline-first in-process AST scanner with 60 FPS React Flow + ELK visual attack DAGs and client-side PDF reporting.*
- **GitHub Releases (All Platforms)**: [https://github.com/jayeshpandey01/codefy-whoami-/releases](https://github.com/jayeshpandey01/codefy-whoami-/releases)
- **Latest Release Tag (v0.3.1)**: [https://github.com/jayeshpandey01/codefy-whoami-/releases/tag/v0.3.1](https://github.com/jayeshpandey01/codefy-whoami-/releases/tag/v0.3.1)
- **Direct Installers (Hosted on `axtion.tech`)**:
  - **macOS Universal DMG**: [Codefy-0.2.0-Universal.dmg](https://axtion.tech/downloads/Codefy-0.2.0-Universal.dmg)
  - **macOS Apple Silicon DMG (M1/M2/M3/M4)**: [Codefy-0.2.0-arm64.dmg](https://axtion.tech/downloads/Codefy-0.2.0-arm64.dmg)
  - **Windows User Setup EXE**: [Codefy-UserSetup-0.2.0-x64.exe](https://axtion.tech/downloads/Codefy-UserSetup-0.2.0-x64.exe)
  - **Linux Debian / Ubuntu DEB**: [codefy_0.2.0_amd64.deb](https://axtion.tech/downloads/codefy_0.2.0_amd64.deb)
  - **Linux Fedora / RHEL RPM**: [codefy-0.2.0.x86_64.rpm](https://axtion.tech/downloads/codefy-0.2.0.x86_64.rpm)

### 3. VS Code & Cursor IDE Extension
*Real-time in-editor taint analysis (<15ms keystroke latency), gutter warning icons, hover attack paths, and 1-click code fix transforms.*
- **Visual Studio Marketplace**: [Mickey20.codefy-whoami](https://marketplace.visualstudio.com/items?itemName=Mickey20.codefy-whoami)
- **Direct VSIX Package**: [codefy-whoami-0.2.0.vsix](https://axtion.tech/downloads/codefy-whoami-0.2.0.vsix)
- **Install Command**:
  ```bash
  code --install-extension Mickey20.codefy-whoami
  ```

### 4. Security CLI (`@mickey20/codefy`)
*Interactive ASCII TUI with Quick DAST/SAST, live telemetry streaming, and headless CI/CD SARIF 2.1 PR gating.*
- **npm Registry**: [https://www.npmjs.com/package/@mickey20/codefy](https://www.npmjs.com/package/@mickey20/codefy) (v1.1.1)
- **Run Instantly**:
  ```bash
  # Execute without installation
  npx @mickey20/codefy

  # Or install globally
  npm install -g @mickey20/codefy
  ```

### 5. Stdio MCP Server (24 Tools for Agentic AI)
*Official Model Context Protocol server exposing 24 deterministic security primitives over stdio for Claude Code, Cursor, and Antigravity swarms.*
- **Autonomous Remediation Loop**: Detect flaw → Trace CPG path → Synthesize AST patch → Re-scan in 11ms to verify zero residual risk.

### 6. Pitch Deck & Presentations
- **Google Slides Presentation**: [Google Slides Deck](https://docs.google.com/presentation/d/1j7REnBB7vJ-KVrvOocwOTaNriD3ekJQjN5lXH_YYxrY/edit)
- **Local Interactive HTML Deck**: [pitch-deck.html](docs/pitch/presentation/pitch-deck.html)
- **Local 16:9 Widescreen PDF**: [codefy-pitch-deck.pdf](docs/pitch/presentation/codefy-pitch-deck.pdf)

---

## 🏛️ System Architecture

Codefy is structured as an **omnichannel monorepo** where all client surfaces share the single in-process `@whoami/core` engine:

```text
├── apps/
│   ├── desktop-app/        # Tauri + Rust + React Flow 6-view attack path visualizer
│   └── vscode-extension/   # VS Code extension host, diagnostics, and webview panel
├── packages/
│   ├── core/               # Tree-sitter WASM, CPG taint engine, Shannon entropy scanner
│   ├── types/              # Single source of truth TypeScript AST & SARIF contracts
│   └── ui/                 # Reusable React UI components & ELK graph canvas
└── docs/                   # 10-slide master pitch deck, research benchmarks, and whitepapers
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js >= 22
- pnpm 11.10.0 (pinned in `package.json`)
- Rust toolchain (for Tauri desktop app)

### Installation & Build
```bash
# Install dependencies across all workspaces
pnpm install

# Type check all packages
pnpm run type-check

# Build core and UI packages
pnpm run build

# Run unit test suite
pnpm test

# Run desktop app in local development mode
pnpm run desktop:dev
```

---

## 🔒 Security & Privacy Guarantees
- **100% Zero Source Code Transit:** Local Tree-sitter WASM execution parses source code purely in memory. No proprietary code lines are ever serialized or transmitted across external networks.
- **Deterministic CI/CD SARIF 2.1:** Generates standard OASIS SARIF digests that natively integrate into GitHub Security Code Scanning and enterprise compliance dashboards.

---

## 📄 License & Founder Contact
- **Founder**: Jayesh Pandey · Founder & Compilers Lead
- **Website**: [https://axtion.tech](https://axtion.tech)
- **License**: Private & Proprietary. All Rights Reserved.
