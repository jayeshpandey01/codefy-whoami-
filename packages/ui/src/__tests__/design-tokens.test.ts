import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Guards the colour contract in styles/tailwind.css: every documented
// foreground/background pair must meet WCAG AA in both appearances
// (4.5:1 for text, 3:1 for control boundaries and focus rings).

const css = readFileSync(
  resolve(process.cwd(), "src/styles/tailwind.css"),
  "utf8",
);

function block(startMarker: string): string {
  const start = css.indexOf(startMarker);
  if (start === -1) throw new Error(`Missing CSS block: ${startMarker}`);
  const open = css.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    if (css[i] === "}" && --depth === 0) return css.slice(open + 1, i);
  }
  throw new Error(`Unclosed CSS block: ${startMarker}`);
}

function tokens(body: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of body.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-f]{6})\s*;/gi)) {
    out[m[1]!] = m[2]!.toLowerCase();
  }
  return out;
}

const light = tokens(block("@theme {"));
const dark = { ...light, ...tokens(block(':root[data-theme="dark"] {')) };

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

const TEXT_PAIRS: Array<[string, string]> = [
  ["label", "bg"],
  ["label", "bg-secondary"],
  ["label", "surface-elevated"],
  ["label-secondary", "bg"],
  ["label-secondary", "bg-secondary"],
  ["label-secondary", "surface"],
  ["label-secondary", "surface-elevated"],
  ["accent", "bg"],
  ["accent", "surface-elevated"],
  ["on-accent", "accent-fill"],
  ["on-accent", "accent-fill-hover"],
  ["danger", "bg"],
  ["warning", "bg"],
  ["success", "bg"],
  ["danger", "danger-bg"],
  ["sev-critical", "sev-critical-bg"],
  ["sev-high", "sev-high-bg"],
  ["sev-medium", "sev-medium-bg"],
  ["sev-low", "sev-low-bg"],
  ["sev-info", "sev-info-bg"],
  ["sev-critical", "bg"],
  ["sev-high", "bg"],
  ["sev-medium", "bg"],
  ["sev-low", "bg"],
  ["role-source", "surface"],
  ["diff-add", "diff-add-bg"],
  ["diff-del", "diff-del-bg"],
  ["syntax-comment", "bg"],
];

const NON_TEXT_PAIRS: Array<[string, string]> = [
  ["control-border", "bg"],
  ["control-border", "field"],
  ["focus", "bg"],
  ["focus", "bg-secondary"],
];

describe.each([
  ["light", light],
  ["dark", dark],
] as const)("design tokens (%s)", (_name, t) => {
  it.each(TEXT_PAIRS)("%s on %s meets 4.5:1", (fg, bg) => {
    expect(t[fg], `missing --color-${fg}`).toBeDefined();
    expect(t[bg], `missing --color-${bg}`).toBeDefined();
    expect(contrast(t[fg]!, t[bg]!)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(NON_TEXT_PAIRS)("%s on %s meets 3:1", (fg, bg) => {
    expect(contrast(t[fg]!, t[bg]!)).toBeGreaterThanOrEqual(3);
  });
});
