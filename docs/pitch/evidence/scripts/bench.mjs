// Reproducible timing + fixture-correctness benchmark for the Codefy local engine.
// Usage: node bench.mjs <core-dist-node-index.js> <fixturesDir> [extraDir]
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { performance } from "node:perf_hooks";
import os from "node:os";

delete process.env.OPENROUTER_API_KEY; // force deterministic, offline
const [, , corePath, fixturesDir, extraDir] = process.argv;
import { createRequire } from "node:module"; const core = createRequire(import.meta.url)(corePath);
const engine = core.createAnalysisEngine({ llmProvider: new core.DeterministicOnlyProvider() });

const pct = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
const out = { machine: `${os.cpus()[0].model} · ${os.cpus().length} cores · ${Math.round(os.totalmem() / 2 ** 30)} GB · node ${process.version} · ${os.platform()} ${os.release()}`, date: new Date().toISOString() };

// 1) Fixture correctness + latency
const rules = readdirSync(fixturesDir);
const files = rules.flatMap((r) => ["vulnerable.ts", "safe.ts"].map((f) => ({ rule: r, kind: f.replace(".ts", ""), path: join(fixturesDir, r, f) })));
const t0 = performance.now();
await engine.scanFile(files[0].path, readFileSync(files[0].path, "utf8"));
out.coldStartFirstScanMs = +(performance.now() - t0).toFixed(1);

const rows = [];
for (const f of files) {
  const src = readFileSync(f.path, "utf8");
  const times = []; let res;
  for (let i = 0; i < 20; i++) { const s = performance.now(); res = await engine.scanFile(`src/${f.rule}/${f.kind}.ts`, src); times.push(performance.now() - s); }
  const sec = res.findings.filter((x) => x.ruleId === f.rule);
  rows.push({ rule: f.rule, kind: f.kind, loc: src.split("\n").length, findings: sec.length, statuses: [...new Set(sec.map((x) => x.status))].join("/") || "-", medianMs: +pct(times, 0.5).toFixed(2), p95Ms: +pct(times, 0.95).toFixed(2) });
}
out.fixtures = rows;
const vuln = rows.filter((r) => r.kind === "vulnerable"), safe = rows.filter((r) => r.kind === "safe");
out.fixtureSummary = {
  vulnerableFlagged: `${vuln.filter((r) => r.findings > 0).length}/${vuln.length}`,
  safeFlaggedAsActive: `${safe.filter((r) => r.findings > 0 && r.statuses !== "discarded").length}/${safe.length}`,
};

// 2) Throughput on a real codebase (all .ts/.tsx/.js files)
if (extraDir) {
  const list = [];
  const walk = (d) => { for (const n of readdirSync(d)) { if (["node_modules", "dist", ".git"].includes(n)) continue; const p = join(d, n); const st = statSync(p); if (st.isDirectory()) walk(p); else if (/\.(ts|tsx|js|mjs)$/.test(n)) list.push(p); } };
  walk(extraDir);
  let loc = 0, findings = 0; const per = [];
  const s = performance.now();
  for (const p of list) { const src = readFileSync(p, "utf8"); loc += src.split("\n").length; const a = performance.now(); const r = await engine.scanFile(relative(extraDir, p), src); per.push(performance.now() - a); findings += r.findings.filter((x) => x.ruleId !== "syntax-error").length; }
  out.codebase = { dir: "(external TS codebase)", files: list.length, loc, totalMs: +(performance.now() - s).toFixed(0), perFileMedianMs: +pct(per, 0.5).toFixed(2), perFileP95Ms: +pct(per, 0.95).toFixed(2), securityFindings: findings };
}
console.log(JSON.stringify(out, null, 2));
