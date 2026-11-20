// Step 1: open the app, dump visible text + buttons, screenshot. Used to learn the flow.
import { chromium } from "playwright-core";
import { readFileSync, readdirSync, statSync, mkdirSync } from "node:fs";
import { join, relative } from "node:path";

const DEMO = process.env.DEMO_DIR;
const OUT = process.env.OUT_DIR; mkdirSync(OUT, { recursive: true });
const ROOT = "/Users/demo/demo-payments-api";
const vfs = {};
const walk = (d) => { for (const n of readdirSync(d)) { const p = join(d, n); statSync(p).isDirectory() ? walk(p) : (vfs[ROOT + "/" + relative(DEMO, p)] = readFileSync(p, "utf8")); } };
walk(DEMO);

const exe = process.env.CHROME;
const browser = await chromium.launch({ executablePath: exe, headless: true });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2, colorScheme: process.env.SCHEME || "dark" });
await ctx.addInitScript(({ vfs, root }) => { window.__DEMO_VFS__ = vfs; window.__DEMO_OPEN__ = root; }, { vfs, root: ROOT });
await ctx.addInitScript({ path: new URL("./tauri-mock.js", import.meta.url).pathname });
await ctx.route((u) => !/^https?:\/\/localhost/.test(u.toString()), (r) => r.abort());
const page = await ctx.newPage();
const logs = []; page.on("console", (m) => logs.push(m.type() + ": " + m.text())); page.on("pageerror", (e) => logs.push("PAGEERROR: " + e.message + "\n" + (e.stack||"").split("\n").slice(0,8).join("\n")));
await page.goto("http://localhost:1420/", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
const steps = JSON.parse(process.env.STEPS || "[]");
for (const s of steps) {
  try {
    if (s.click) await page.getByText(s.click, { exact: !!s.exact }).first().click({ timeout: 8000 });
    if (s.sel) await page.locator(s.sel).first().click({ timeout: 8000 });
    if (s.key) await page.keyboard.press(s.key);
    if (s.wait) await page.waitForTimeout(s.wait);
    if (s.shot) await page.screenshot({ path: join(OUT, s.shot + ".png") });
    if (s.dump) { const b = await page.$$eval("button, [role=button], [role=tab], [role=option], a", (els) => els.map((e) => (e.innerText || e.getAttribute("aria-label") || e.title || "").trim().replace(/\s+/g," ")).filter(Boolean)); console.log("BUTTONS@" + s.dump + ":", JSON.stringify([...new Set(b)].slice(0, 120))); }
  } catch (e) { console.log("STEP FAIL", JSON.stringify(s), e.message.split("\n")[0]); }
}
const buttons = await page.$$eval("button, [role=button], a", (els) => els.map((e) => (e.innerText || e.getAttribute("aria-label") || e.title || "").trim()).filter(Boolean));
console.log("BUTTONS:", JSON.stringify([...new Set(buttons)].slice(0, 80)));
console.log("TEXT:", (await page.innerText("body")).slice(0, 1500));
console.log("LOGS:\n" + logs.filter((l) => !l.includes("[vite]")).slice(-25).join("\n"));
await browser.close();
