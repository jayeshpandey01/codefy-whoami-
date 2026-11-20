// Minimal Tauri v2 IPC stand-in so the real desktop frontend runs in Chromium.
// Only OS-level file/dialog calls are stubbed; the analysis engine, UI and
// worker are the real application code. window.__DEMO_VFS__ = {absPath: content}.
(() => {
  const HOME = "/Users/demo";
  const vfs = Object.assign({}, window.__DEMO_VFS__ || {});
  const appStore = {}; // ~/.codefy/*.json written by the app itself
  const dirs = new Set([HOME]);
  const addDirs = (p) => { const parts = p.split("/"); for (let i = 2; i < parts.length; i++) dirs.add(parts.slice(0, i).join("/")); };
  Object.keys(vfs).forEach(addDirs);
  const enc = new TextEncoder(), dec = new TextDecoder();
  const callbacks = new Map(); let nextId = 1;
  const norm = (p) => p.replace(/\/+/g, "/").replace(/\/$/, "") || "/";
  const decodePath = (args, opts) => {
    if (args && typeof args.path === "string") return norm(args.path);
    const h = opts && opts.headers; if (h && h.path) return norm(decodeURIComponent(h.path));
    return "";
  };
  async function invoke(cmd, args = {}, opts) {
    switch (cmd) {
      case "plugin:path|resolve_directory": return HOME;
      case "plugin:path|join": return norm(args.paths.join("/"));
      case "plugin:path|resolve": return norm(args.paths.join("/"));
      case "plugin:path|normalize": return norm(args.path);
      case "plugin:path|basename": return norm(args.path).split("/").pop();
      case "plugin:path|dirname": return norm(args.path).split("/").slice(0, -1).join("/") || "/";
      case "plugin:path|extname": { const b = args.path.split("/").pop(); const i = b.lastIndexOf("."); return i > 0 ? b.slice(i + 1) : ""; }
      case "plugin:path|is_absolute": return args.path.startsWith("/");
      case "plugin:fs|exists": { const p = norm(args.path); return p in vfs || p in appStore || dirs.has(p); }
      case "plugin:fs|mkdir": dirs.add(norm(args.path)); addDirs(norm(args.path) + "/x"); return null;
      case "plugin:fs|size": { const p = norm(args.path); return enc.encode(vfs[p] ?? appStore[p] ?? "").length; }
      case "plugin:fs|read_text_file": case "plugin:fs|read_file": {
        const p = norm(args.path); const c = p in vfs ? vfs[p] : appStore[p];
        if (c === undefined) throw new Error("No such file: " + p);
        return Array.from(enc.encode(c));
      }
      case "plugin:fs|write_text_file": case "plugin:fs|write_file": {
        const p = decodePath(args, opts); const body = args instanceof Uint8Array ? args : new Uint8Array(args);
        appStore[p] = dec.decode(body); addDirs(p); return null;
      }
      case "plugin:fs|read_dir": {
        const p = norm(args.path); const seen = new Map();
        for (const f of [...Object.keys(vfs), ...dirs]) {
          if (!f.startsWith(p + "/")) continue;
          const rest = f.slice(p.length + 1); const name = rest.split("/")[0];
          const isDir = rest.includes("/") || dirs.has(f);
          if (!seen.has(name)) seen.set(name, { name, isDirectory: isDir, isFile: !isDir, isSymlink: false });
          else if (isDir) seen.get(name).isDirectory = true, seen.get(name).isFile = false;
        }
        return [...seen.values()];
      }
      case "plugin:dialog|open": return window.__DEMO_OPEN__ || null;
      case "plugin:dialog|save": return null;
      case "plugin:dialog|message": case "plugin:dialog|ask": case "plugin:dialog|confirm": return true;
      case "plugin:app|version": return "0.3.0";
      case "plugin:app|name": return "Codefy";
      case "plugin:app|tauri_version": return "2.9.0";
      case "plugin:updater|check": return null;
      case "plugin:event|listen": return nextId++;
      case "plugin:event|unlisten": case "plugin:event|emit": return null;
      case "log_scan_diagnostic": console.log("[scan]", args.level, args.message); return null;
      default:
        if (cmd.startsWith("plugin:http|")) throw new Error("network disabled in screenshot harness");
        console.warn("[tauri-mock] unhandled", cmd, JSON.stringify(args).slice(0, 200));
        return null;
    }
  }
  window.__TAURI_INTERNALS__ = {
    invoke,
    transformCallback(cb, once) { const id = nextId++; callbacks.set(id, (d) => { if (once) callbacks.delete(id); return cb && cb(d); }); window["_" + id] = callbacks.get(id); return id; },
    unregisterCallback(id) { callbacks.delete(id); },
    convertFileSrc(p) { return p; },
    metadata: { currentWindow: { label: "main" }, currentWebview: { windowLabel: "main", label: "main" } },
    plugins: {},
  };
  window.__TAURI_EVENT_PLUGIN_INTERNALS__ = { unregisterListener() {} };
  window.isTauri = true;
})();
