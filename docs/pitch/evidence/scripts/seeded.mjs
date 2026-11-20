import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { createRequire } from "node:module";
delete process.env.OPENROUTER_API_KEY;
const core = createRequire(import.meta.url)(process.argv[2]);
const engine = core.createAnalysisEngine({ llmProvider: new core.DeterministicOnlyProvider() });
const root = process.argv[3]; const res = [];
const walk = (d) => { for (const n of readdirSync(d)) { const p = join(d, n); statSync(p).isDirectory() ? walk(p) : res.push(p); } }; walk(root);
for (const p of res.filter((f) => /\.ts$/.test(f))) {
  const r = await engine.scanFile(relative(root, p), readFileSync(p, "utf8"));
  for (const f of r.findings) console.log(relative(root, p), f.ruleId, f.status, f.severity, f.trace?.steps?.map((s) => s.line).join("->") ?? "");
}
