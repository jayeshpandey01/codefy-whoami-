---
name: antigravity-design-expert
description: World-class UI/UX engineering skill for spatial, weightless, and glassmorphism web interfaces. Combines high-density dark terminal color palettes, Google Stitch screenshot-to-code workflows, UI/UX Pro Max layout rules, and frontend taste standards.
---

# Antigravity Design Expert Skill

This skill guides AI coding agents in designing and implementing world-class, spatial, weightless, and glassmorphism-based web interfaces. It merges the **Antigravity Design** philosophy with the **SoDEX Dark Glass Terminal** design system, **UI/UX Pro Max** layout intelligence, and **Google Stitch** screenshot-to-code workflows.

---

## 1. Antigravity Design Philosophy & Pillars

### 1.1 Weightlessness & Floating Elevation
Interfaces should convey a physical sense of weightlessness. Rather than flat, rigid borders or heavy opaque boxes, components appear suspended in a 3D coordinate space:
- **Soft Diffused Drop Shadows**: Layer a small contact shadow with an expansive, low-opacity ambient penumbra:
  ```css
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25), 0 20px 48px rgba(0, 0, 0, 0.45);
  ```
- **Z-Axis Hierarchy**:
  - `Z-0`: Ambient background canvas (deep charcoal, subtle glowing mesh orbs, faint geometric grid).
  - `Z-10`: Structural glass panels, charts, data grids.
  - `Z-20`: Floating navigation capsules, control floating docks, HUD status bars.
  - `Z-50+`: Floating inspector modals, contextual popovers, command palettes.

### 1.2 Spatial Glassmorphism & Specular Light
Glass is not just `backdrop-filter: blur()`. Authentic glass requires directional light reflection:
- **Top Specular Inset Highlight**: `inset 0 1px 1px 0 rgba(255, 255, 255, 0.16)` mimics ceiling or ambient light bouncing off the polished upper rim.
- **Bottom Dark Inset Rim**: `inset 0 -1px 1px 0 rgba(0, 0, 0, 0.45)` anchors the bottom bevel against dark surfaces.
- **Layered Optical Filter**:
  ```css
  backdrop-filter: blur(16px) saturate(180%) contrast(105%);
  -webkit-backdrop-filter: blur(16px) saturate(180%) contrast(105%);
  ```

### 1.3 Motion & Spatial Dynamics
- Transitions should never snap abruptly. Use smooth spring-like easings: `transition: all 0.24s cubic-bezier(0.16, 1, 0.3, 1)`.
- Interactive elements slightly depress on click (`active:scale-[0.98]`).
- For 3D or isometric tilt cards, leverage CSS `perspective: 1000px` and subtle mouse-following `rotateX` / `rotateY` transforms.

---

## 2. Dark Glass Terminal Color System (SoDEX Reference)

Directly derived from high-performance trading and security operations terminals ([color.md](file:///Users/jayesh/Documents/codefy/color.md)):

### 2.1 Surfaces & Canvases
- **Canvas Base**: `#101018` — Deepest charcoal tone, comfortable for hours of viewing.
- **Pure Black Contrast**: `#000000` — Outer frame, contrast dividers.
- **Glass Panel**: `rgba(24, 24, 32, 0.72)` — Semi-transparent frosted cards and containers.
- **Elevated Surface**: `#242428` — Active tabs, input boxes, button backgrounds.
- **Subtle Divider**: `#303038` — Structure without visual noise.

### 2.2 Semantic Financial & Indicator Accents
Never use green or red as random decorative colors. Reserve them for status and semantic meaning:
- **Profit / Success / Healthy**: `#00B887` (Hover: `#00D49A`, Subtle BG: `rgba(0, 184, 135, 0.12)`)
- **Loss / Error / Critical**: `#E03858` (Hover: `#F04B68`, Subtle BG: `rgba(224, 56, 88, 0.12)`)
- **Asset / Warning / Highlight**: `#F7931A` (Bitcoin Orange), `#C18B45` (Warning Amber)
- **Info / Network / Live**: `#6CA6E8` (Info Blue), `#38BDF8` (Sky)

### 2.3 Typography Palette
- **Bright Headline**: `#F8F8F8` — Key figures (`93,226`), active headings.
- **Primary Body**: `#E0E0E0` — High-contrast text without the eye strain of `#FFFFFF`.
- **Secondary**: `#A8A8A8` — Metadata labels, column headers, inactive tabs.
- **Muted**: `#686870` — Timestamps, disabled controls, subtle hints.

---

## 3. UI/UX Pro Max: Layout & Typography Intelligence

### 3.1 60–30–10 Visual Weight Distribution
- **60% Neutral Canvas**: Ground the interface in dark resting tones (`#101018`, `#181820`).
- **30% Structure & Text**: Crisp typography (`#E0E0E0`), subtle borders (`#303038`), and muted metadata.
- **10% Semantic Accents**: Focused color sparks (`#00B887`, `#E03858`, `#F7931A`) that draw the eye immediately to critical data.

### 3.2 Typography Rules
- **Font Stack**: Pair a modern sans-serif (`Inter`, `Geist`, or system fonts) with an ultra-clean monospace (`JetBrains Mono`, `Geist Mono`, `SF Mono`) for numbers, prices, hashes, and code.
- **Tabular Figures**: Always apply `tabular-nums font-mono` to financial and metric figures to ensure columns align perfectly across rapid updates.
- **Minimum Font Floor**: Never use microtext below `12px` (`text-xs`). Important labels should be `13px`–`14px`, hero metrics `24px`–`32px`.

### 3.3 Information Density Management
- Group related controls into unified floating glass capsules (e.g., Timeframe tabs `[1m | 5m | 15m | 1H | 1D]`).
- Use dual-encoding: combine color with an icon or sign (`+` for profit, `-` for loss, `↑` / `↓` arrows) to support accessibility.

---

## 4. Google Stitch Workflow: Screenshot-to-Code Pipeline

When translating a design mockup, wireframe, or screenshot (such as the SoDEX terminal) into production-grade React code:

### Step 1: Structural Layout Decomposition
Break the visual target into an orthodox semantic grid:
1. **Top Chrome**: Floating header bar (Branding, Navigation links, Action buttons, Account chip).
2. **Main Stage**: Primary focal point (e.g., Candlestick Chart, Graph Visualizer, Attack Surface).
3. **Aside Inspector / Auxiliary**: Order Book, Telemetry Feed, Properties Sidebar.
4. **Dock / Matrix**: Trading Execution Form, Filter controls.
5. **Bottom Anchor**: Tabbed Data Table (Positions, Findings, Audit Logs) and Status HUD.

### Step 2: Component Modularity & Type Safety
Scaffold each visual slice into an independent, strongly typed React component:
- `TerminalHeader.tsx`
- `CandlestickChart.tsx`
- `OrderBookPanel.tsx`
- `TradeExecutionCard.tsx`
- `PositionHistoryTable.tsx`
- `StatusFooterBar.tsx`

### Step 3: Token Injection & Glass Styling
Replace ad-hoc colors with semantic CSS custom properties or Tailwind classes from `color.md`:
- Glass panels: `bg-[var(--terminal-glass-surface)] backdrop-blur-md border border-[var(--terminal-border-glass)]`
- Specular highlights: `shadow-[var(--terminal-highlight-top),var(--terminal-shadow-md)]`
- Data badges: `bg-[var(--terminal-profit-bg)] text-[var(--terminal-profit)] border border-[var(--terminal-profit)]/30`

---

## 5. Frontend Design & Taste Principles: Avoiding Generic "AI Aesthetics"

AI-generated interfaces often suffer from common design flaws. Enforce these strict taste rules:
1. **NO Giant Rainbow Gradients**: Avoid tacky full-screen purple/pink gradient backgrounds. Use deep, deliberate tones (`#101018`) with localized, subtle ambient blur orbs.
2. **NO Hard 1px Pure White Borders**: Hard white borders look cheap and noisy. Use soft, translucent borders (`rgba(255, 255, 255, 0.08)`) with specular top bevels.
3. **Continuous Squircle Radii**:
   - Container panels: `20px` to `24px` (`rounded-[22px]`)
   - Internal cards and tables: `12px` to `16px` (`rounded-xl`)
   - Interactive pills, chips, and badges: `9999px` (`rounded-full`)
4. **Tactile Feedback**:
   - Hover states must subtly brighten the surface tint (`bg-white/[0.04]` hover overlay).
   - Active buttons must visibly depress with micro-scaling (`scale-[0.98]`).

---

## 6. Accessibility & System Preferences

```css
/* Reduced Transparency: Solid fallback for users with accessibility overrides */
@media (prefers-reduced-transparency: reduce) {
  .terminal-glass-panel,
  .terminal-glass-card,
  .terminal-glass-capsule {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    background: #181820 !important;
    border: 1px solid #303038 !important;
  }
}

/* Reduced Motion: Disable transforms and animations */
@media (prefers-reduced-motion: reduce) {
  * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    transform: none !important;
  }
}
```

