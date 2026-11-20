---
name: apple-liquid-glass
description: Implements Apple Liquid Glass design specifications featuring real optical rim refraction, chromatic dispersion, specular highlights, multi-layer depth hierarchy, and accessibility fallbacks. Use when designing, styling, or evaluating Apple-grade glassmorphic layouts, dashboards, or floating chrome interfaces.
---

# Apple Liquid Glass Design Specification

This skill enforces Apple's **Liquid Glass** design language—an advanced optical material model introduced to evolve beyond legacy 2020-era frosted blur ("glassmorphism"). Liquid Glass simulates physical lens optics: bending light along surface boundaries (rim refraction), splitting light into faint chromatic prism fringes, bouncing directional light off beveled edges (specular rim highlights), and preserving crisp typography over vibrant dynamic content.

---

## 1. Visual Physics & Core Principles

### 1.1 The Two-Layer Content / Chrome Model
Liquid Glass must never be placed over a flat, empty background. Authentic glass is an optical lens; it requires visual texture beneath it to demonstrate refraction and depth:
1. **Content / Canvas Layer (Z-0)**: Vibrant ambient gradients, mesh orbs, dynamic charts, or scrolling content.
2. **Chrome / Refraction Layer (Z-10+)**: Floating glass planes, cards, navigation capsules, and controls that warp, tint, and focus the underlying content.

### 1.2 True Rim Refraction vs. Simple Blur
- **Legacy Frosted Blur**: Stacking a flat translucent color on `backdrop-filter: blur(20px)` results in dull, plastic-looking gray rectangles.
- **Liquid Glass Refraction**: Glass has a physical index of refraction ($n \approx 1.52$). Light entering perpendicular passes straight through, but light at the perimeter hits a beveled curved rim, bending inwards. Background content visible through the rim is optically magnified and distorted towards the perimeter.

### 1.3 Specular Rim Light & Bevel Highlights
Physical glass catches ambient room light along its cut edges. Every Liquid Glass component must feature:
- **Primary Top/Left Inset Highlight**: `inset 0 1px 1px 0 rgba(255, 255, 255, 0.5)` representing directional ceiling light hitting the polished glass crown.
- **Secondary Bottom Inset Rim**: `inset 0 -1px 1px 0 rgba(255, 255, 255, 0.12)` providing edge separation from deep shadows.
- **Multi-tiered Ambient Drop Shadows**: Combining a crisp contact shadow with a soft diffused ambient penumbra (`0 20px 50px rgba(0, 0, 0, 0.35), 0 2px 4px rgba(0, 0, 0, 0.15)`).

### 1.4 Ambient Light & Color Response
The surface does not wash out colors; it energizes them using a layered filter combination:
```css
backdrop-filter: blur(24px) saturate(180%) contrast(105%);
-webkit-backdrop-filter: blur(24px) saturate(180%) contrast(105%);
```

---

## 2. SVG Optical Refraction Specification

For Chromium/WebKit web targets, real optical rim distortion is generated via an inline or procedural SVG displacement filter:

```html
<svg class="liquid-glass-filters" style="position: absolute; width: 0; height: 0; pointer-events: none;" aria-hidden="true">
  <defs>
    <!-- CRITICAL: color-interpolation-filters must be sRGB to prevent linear RGB upward-left displacement drift -->
    <filter id="liquid-glass-refract" color-interpolation-filters="sRGB" x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.02 0.02" numOctaves="2" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="-18" xChannelSelector="R" yChannelSelector="G" result="displaced" />
      <feGaussianBlur in="displaced" stdDeviation="0.4" result="blurred" />
      <feMerge>
        <feMergeNode in="blurred" />
      </feMerge>
    </filter>
  </defs>
</svg>
```

### Key Parameter Tuning:
- **Displacement Scale**:
  - Subtle (cards, panels): `scale: -12` to `-18`
  - Pronounced (buttons, floating pills): `scale: -24` to `-36`
- **Chromatic Offset**: Small 1px-2px relative channel separation producing optical dispersion along the edge bevel.

---

## 3. Design Tokens & CSS Material Tiers

### 3.1 CSS Custom Properties (Tokens)
```css
:root {
  /* Surface Tints */
  --liquid-glass-bg: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 100%);
  --liquid-glass-bg-hover: linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.06) 100%);
  --liquid-glass-bg-active: linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.08) 100%);

  /* Borders & Highlights */
  --liquid-glass-border: 1px solid rgba(255, 255, 255, 0.18);
  --liquid-glass-border-subtle: 1px solid rgba(255, 255, 255, 0.08);
  --liquid-glass-highlight-top: inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.55);
  --liquid-glass-highlight-bottom: inset 0 -1px 1px 0 rgba(255, 255, 255, 0.1);
  --liquid-glass-rim-glow: inset 0 0 12px 0 rgba(255, 255, 255, 0.05);

  /* Shadows */
  --liquid-glass-shadow-sm: 0 4px 16px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.15);
  --liquid-glass-shadow-md: 0 12px 32px rgba(0, 0, 0, 0.35), 0 2px 6px rgba(0, 0, 0, 0.2);
  --liquid-glass-shadow-lg: 0 24px 64px rgba(0, 0, 0, 0.45), 0 4px 12px rgba(0, 0, 0, 0.25);

  /* Blur & Saturation */
  --liquid-glass-blur: blur(28px);
  --liquid-glass-saturate: saturate(190%);
}

/* Light Mode Overrides */
[data-theme="light"], .light {
  --liquid-glass-bg: linear-gradient(135deg, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.35) 100%);
  --liquid-glass-bg-hover: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.5) 100%);
  --liquid-glass-border: 1px solid rgba(255, 255, 255, 0.6);
  --liquid-glass-highlight-top: inset 0 1px 2px 0 rgba(255, 255, 255, 0.9);
  --liquid-glass-highlight-bottom: inset 0 -1px 1px 0 rgba(0, 0, 0, 0.05);
  --liquid-glass-shadow-md: 0 12px 32px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04);
}
```

### 3.2 Material Tiers
1. **Regular Glass (Cards & Containers)**:
   - Background: `var(--liquid-glass-bg)`
   - Border: `var(--liquid-glass-border)`
   - Box-Shadow: `var(--liquid-glass-highlight-top), var(--liquid-glass-highlight-bottom), var(--liquid-glass-shadow-md)`
   - Backdrop-Filter: `var(--liquid-glass-blur) var(--liquid-glass-saturate) contrast(105%)`
   - Corner Radius: `20px` to `24px` continuous squircle
2. **Clear Glass (Buttons, Floating Pills, Filter Badges)**:
   - Higher transparency, prominent top specular rim highlight.
   - Corner Radius: `9999px` (full capsule)
   - Hover state increases brightness and expands ambient shadow.
3. **Heavy / Nav Chrome Glass (Header, Sidebars, Modals)**:
   - Deeper blur (`36px`), higher base opacity (18%-25%), anchoring the layout.

---

## 4. Layout & HIG Guidelines for Dashboards

When building dashboards using Apple Liquid Glass:
1. **Mesh Canvas Atmosphere**:
   - Provide deep, rich ambient background gradients (e.g., violet, indigo, cyan, emerald gradients) with dynamic blur orbs (`filter: blur(80px)`). The glass elements float over this tapestry.
2. **Squircle Curvature**:
   - Standard panels: `border-radius: 22px`
   - Nested sub-items: `border-radius: 14px`
   - Interactive pills/chips: `border-radius: 9999px`
3. **Typography & Contrast Standards**:
   - Maintain strict WCAG AA contrast ($\ge 4.5:1$).
   - Foreground text on dark glass: high-contrast white `#FFFFFF` for headings, `#A1A1AA` / `#CBD5E1` for secondary labels.
   - Minimum font size: `12px` (never use sub-12px micro-text).
4. **Performance Guardrails**:
   - Avoid applying heavy dynamic displacement to elements larger than `800px` by `800px`. Use CSS multi-layer inset box-shadows for large canvas containers and targeted displacement for cards, buttons, and badges.
   - Apply hardware acceleration hints: `transform: translateZ(0); will-change: transform, backdrop-filter;`.

---

## 5. Accessibility Fallbacks

Always include graceful degradation for accessibility modes and older browser engines:

```css
/* Accessibility: Reduced Transparency */
@media (prefers-reduced-transparency: reduce) {
  .liquid-glass-panel,
  .liquid-glass-card,
  .liquid-glass-pill {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    background: #18181b !important; /* solid fallback */
    border: 1px solid #3f3f46 !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
  }
}

/* Accessibility: Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .liquid-glass-card,
  .liquid-glass-pill,
  .liquid-glass-interactive {
    transition: none !important;
    transform: none !important;
    animation: none !important;
  }
}
```

