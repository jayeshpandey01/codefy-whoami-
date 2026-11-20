import React, { useState, useId, useMemo } from "react";
import { CodefyLogo } from "./Icons";

export type FeatureStatus = "GA" | "Beta" | "Experimental";
export type FeatureCategory = "all" | "sast" | "dast" | "ai" | "topology" | "supply-chain";

export interface FeatureItem {
  id: string;
  name: string;
  category: "sast" | "dast" | "ai" | "topology" | "supply-chain";
  status: FeatureStatus;
  version: string;
  summary: string;
  description: string;
  metrics: {
    label: string;
    value: string;
  }[];
  rolloutPercent: number;
  highlightColor: string;
  engines: string[];
}

export const INITIAL_FEATURES: FeatureItem[] = [
  {
    id: "sast-engine",
    name: "Unified SAST Multi-Engine Scanner",
    category: "sast",
    status: "GA",
    version: "v3.8.0",
    summary: "Orchestrates 25 static security analyzers with sub-second AST parsing.",
    description:
      "Deep semantic scanning across Semgrep, Gitleaks, Bandit, ESLint Security, Checkov, and Trivy. Features intelligent deduplication and cross-engine consensus scoring.",
    metrics: [
      { label: "Precision", value: "99.4%" },
      { label: "Engines", value: "25 Active" },
      { label: "Avg Scan", value: "1.2s" },
    ],
    rolloutPercent: 100,
    highlightColor: "#38bdf8",
    engines: ["Semgrep", "Gitleaks", "Bandit", "Checkov", "Trivy"],
  },
  {
    id: "attack-surface",
    name: "Interactive Attack Surface & Blast Radius",
    category: "topology",
    status: "GA",
    version: "v3.6.2",
    summary: "High-performance Cytoscape & ELK graph visualizing vulnerability propagation.",
    description:
      "Traces data flow from unauthenticated ingress endpoints through microservices into sink databases, calculating upstream and downstream blast radius in real time.",
    metrics: [
      { label: "Graph LOD", value: "Dynamic" },
      { label: "Max Nodes", value: "50,000+" },
      { label: "Sink Tracing", value: "Sub-5ms" },
    ],
    rolloutPercent: 92,
    highlightColor: "#818cf8",
    engines: ["Cytoscape", "ELK", "CFG Engine", "AST Linker"],
  },
  {
    id: "ai-remediation",
    name: "Automated AI Remediation & Fix Synthesis",
    category: "ai",
    status: "Beta",
    version: "v3.9.0-rc1",
    summary: "AST differential patches with zero syntactic and semantic regressions.",
    description:
      "Leverages specialized LLM code models constrained by grammar rules and compiler passes to generate surgical security fixes with unit tests included.",
    metrics: [
      { label: "Success Rate", value: "88.6%" },
      { label: "Verification", value: "Automated" },
      { label: "Diff Mode", value: "Side-by-Side" },
    ],
    rolloutPercent: 65,
    highlightColor: "#a855f7",
    engines: ["Codefy LLM Gateway", "Tree-sitter", "DiffEngine"],
  },
  {
    id: "dast-interceptor",
    name: "DAST Dynamic Gateway Interceptor",
    category: "dast",
    status: "Beta",
    version: "v3.5.0",
    summary: "Autonomous runtime API fuzzing with zero-trust bearer token tracking.",
    description:
      "Passively inspects API contract violations, broken object level authorization (BOLA/IDOR), and injections without impacting live production workloads.",
    metrics: [
      { label: "Endpoints", value: "1,420 Analyzed" },
      { label: "False Positives", value: "< 0.2%" },
      { label: "Latency Impact", value: "0.0ms" },
    ],
    rolloutPercent: 54,
    highlightColor: "#ec4899",
    engines: ["Dynamic Fuzzer", "OAuth Auditor", "Proxy Gateway"],
  },
  {
    id: "supply-chain",
    name: "Software Supply Chain & SBOM Radar",
    category: "supply-chain",
    status: "GA",
    version: "v3.7.1",
    summary: "Continuous transitive dependency graph with CVE reachability analysis.",
    description:
      "Identifies vulnerable dependencies that are actually called in your call graph, eliminating 82% of irrelevant indirect vulnerability alerts.",
    metrics: [
      { label: "Reachability", value: "Call Graph" },
      { label: "SBOM Formats", value: "CycloneDX / SPDX" },
      { label: "Ecosystems", value: "14 Supported" },
    ],
    rolloutPercent: 98,
    highlightColor: "#10b981",
    engines: ["Trivy", "Syft", "Reachability Tracer"],
  },
  {
    id: "desktop-engine",
    name: "Real-Time Desktop & IDE Local Engine",
    category: "sast",
    status: "GA",
    version: "v3.4.0",
    summary: "Zero-network on-device static analysis running locally inside Tauri/Rust.",
    description:
      "Keeps source code 100% private on developer machines. Integrates directly into VS Code and Desktop client via bidirectional JSON-RPC IPC bridge.",
    metrics: [
      { label: "Data Leak Risk", value: "0% (Airgapped)" },
      { label: "Memory Peak", value: "< 140MB" },
      { label: "Startup", value: "180ms" },
    ],
    rolloutPercent: 100,
    highlightColor: "#f59e0b",
    engines: ["Tauri Rust Core", "WebAssembly AST", "Local Cache"],
  },
];

export interface ProductFeatureDashboardProps {
  initialFeatures?: FeatureItem[];
  className?: string;
  onFeatureSelect?: (feature: FeatureItem) => void;
  showDevControls?: boolean;
}

export function ProductFeatureDashboard({
  initialFeatures = INITIAL_FEATURES,
  className = "",
  onFeatureSelect,
  showDevControls = true,
}: ProductFeatureDashboardProps): React.ReactElement {
  const [features, setFeatures] = useState<FeatureItem[]>(initialFeatures);
  const [selectedCategory, setSelectedCategory] = useState<FeatureCategory>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [refractionMode, setRefractionMode] = useState<boolean>(true);
  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");
  const [activeFeature, setActiveFeature] = useState<FeatureItem | null>(null);

  // SVG filter ID generated stably
  const filterId = useId().replace(/:/g, "") || "apple-liquid-glass-refract";

  // Filter features
  const filteredFeatures = useMemo(() => {
    return features.filter((feat) => {
      if (selectedCategory !== "all" && feat.category !== selectedCategory) {
        return false;
      }
      if (statusFilter !== "all" && feat.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = feat.name.toLowerCase().includes(q);
        const matchesSummary = feat.summary.toLowerCase().includes(q);
        const matchesEngines = feat.engines.some((e) => e.toLowerCase().includes(q));
        if (!matchesName && !matchesSummary && !matchesEngines) {
          return false;
        }
      }
      return true;
    });
  }, [features, selectedCategory, statusFilter, searchQuery]);

  // Aggregate Metrics
  const totalCount = features.length;
  const avgRollout = Math.round(
    features.reduce((acc, f) => acc + f.rolloutPercent, 0) / (totalCount || 1)
  );
  const gaCount = features.filter((f) => f.status === "GA").length;

  const handleRolloutChange = (id: string, newRollout: number) => {
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, rolloutPercent: newRollout } : f))
    );
    if (activeFeature && activeFeature.id === id) {
      setActiveFeature((prev) => (prev ? { ...prev, rolloutPercent: newRollout } : null));
    }
  };

  const handleCardClick = (feature: FeatureItem) => {
    setActiveFeature(feature);
    if (onFeatureSelect) {
      onFeatureSelect(feature);
    }
  };

  const isLight = themeMode === "light";

  return (
    <div
      data-testid="product-feature-dashboard"
      data-theme={themeMode}
      className={`relative w-full min-h-screen overflow-hidden font-sans select-none transition-colors duration-500 ${
        isLight ? "bg-[#f1f5f9] text-[#0f172a]" : "bg-[#090a0f] text-[#f8fafc]"
      } ${className}`}
    >
      {/* SVG Optical Refraction Filter Specification (Apple Liquid Glass) */}
      <svg
        className="pointer-events-none absolute w-0 h-0 overflow-hidden"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter
            id={filterId}
            colorInterpolationFilters="sRGB"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.02 0.02"
              numOctaves={2}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={refractionMode ? -16 : 0}
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feGaussianBlur in="displaced" stdDeviation="0.4" result="blurred" />
            <feMerge>
              <feMergeNode in="blurred" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* ============================================================
          LAYER 1: Dynamic Optical Background Canvas (Z-0)
          Apple Liquid Glass requires luminous background texture
          ============================================================ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Ambient Gradient Mesh Orbs */}
        <div
          className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[110px] opacity-60 transition-colors duration-1000 ${
            isLight ? "bg-indigo-300" : "bg-indigo-600/40"
          }`}
        />
        <div
          className={`absolute top-1/4 -right-24 w-[32rem] h-[32rem] rounded-full blur-[130px] opacity-50 transition-colors duration-1000 ${
            isLight ? "bg-cyan-200" : "bg-cyan-500/30"
          }`}
        />
        <div
          className={`absolute bottom-10 left-1/3 w-[28rem] h-[28rem] rounded-full blur-[120px] opacity-45 transition-colors duration-1000 ${
            isLight ? "bg-purple-200" : "bg-purple-600/35"
          }`}
        />
        <div
          className={`absolute -bottom-20 right-1/4 w-80 h-80 rounded-full blur-[100px] opacity-40 transition-colors duration-1000 ${
            isLight ? "bg-emerald-200" : "bg-emerald-500/25"
          }`}
        />

        {/* Subtle Geometric Optics Grid */}
        <div
          className={`absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:32px_32px] ${
            isLight ? "opacity-20" : "opacity-40"
          }`}
        />
      </div>

      {/* ============================================================
          LAYER 2: Floating Refractive Chrome Layer (Z-10)
          Apple Liquid Glass panels, capsules, and interactive cards
          ============================================================ */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Navigation Bar / Glass Header */}
        <header
          style={{
            background: isLight
              ? "linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.45) 100%)"
              : "linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 100%)",
            backdropFilter: "blur(32px) saturate(190%) contrast(105%)",
            WebkitBackdropFilter: "blur(32px) saturate(190%) contrast(105%)",
            border: isLight ? "1px solid rgba(255, 255, 255, 0.7)" : "1px solid rgba(255, 255, 255, 0.18)",
            boxShadow: isLight
              ? "inset 0 1px 2px 0 rgba(255, 255, 255, 0.95), 0 12px 32px rgba(0, 0, 0, 0.06)"
              : "inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.55), inset 0 -1px 1px 0 rgba(255, 255, 255, 0.1), 0 20px 48px rgba(0, 0, 0, 0.4)",
          }}
          className="rounded-[24px] px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 transition-colors duration-300"
        >
          {/* Brand & Badge */}
          <div className="flex items-center gap-3.5">
            <div
              style={{
                background: isLight
                  ? "linear-gradient(135deg, #0284c7 0%, #6366f1 100%)"
                  : "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)",
                boxShadow: "0 4px 14px rgba(56, 189, 248, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.6)",
              }}
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white"
            >
              <CodefyLogo size={22} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight">Codefy Features</h1>
                <span
                  style={{
                    background: isLight ? "rgba(14, 165, 233, 0.12)" : "rgba(56, 189, 248, 0.15)",
                    border: isLight ? "1px solid rgba(14, 165, 233, 0.3)" : "1px solid rgba(56, 189, 248, 0.3)",
                    boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.4)",
                  }}
                  className="px-2.5 py-0.5 rounded-full text-xs font-medium text-cyan-400"
                >
                  Apple Liquid Glass
                </span>
              </div>
              <p
                className={`text-xs ${
                  isLight ? "text-slate-500" : "text-slate-400"
                } tracking-normal`}
              >
                Enterprise Telemetry & Security Engine Rollout Management
              </p>
            </div>
          </div>

          {/* Controls Capsule */}
          {showDevControls && (
            <div className="flex items-center gap-2">
              {/* Refraction Mode Toggle */}
              <button
                type="button"
                onClick={() => setRefractionMode((prev) => !prev)}
                title="Toggle real optical rim refraction"
                style={{
                  background: refractionMode
                    ? isLight
                      ? "rgba(14, 165, 233, 0.16)"
                      : "rgba(56, 189, 248, 0.2)"
                    : isLight
                    ? "rgba(255, 255, 255, 0.5)"
                    : "rgba(255, 255, 255, 0.05)",
                  border: isLight
                    ? "1px solid rgba(255, 255, 255, 0.6)"
                    : "1px solid rgba(255, 255, 255, 0.16)",
                  boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.4)",
                }}
                className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer hover:scale-102"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    refractionMode ? "bg-cyan-400 animate-pulse" : "bg-slate-500"
                  }`}
                />
                <span>{refractionMode ? "Optical Refraction: ON" : "Standard Blur"}</span>
              </button>

              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={() => setThemeMode((prev) => (prev === "dark" ? "light" : "dark"))}
                style={{
                  background: isLight
                    ? "rgba(255, 255, 255, 0.6)"
                    : "rgba(255, 255, 255, 0.07)",
                  border: isLight
                    ? "1px solid rgba(255, 255, 255, 0.8)"
                    : "1px solid rgba(255, 255, 255, 0.16)",
                  boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.4)",
                }}
                className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer hover:scale-102"
                aria-label="Toggle Light / Dark mode"
              >
                <span>{isLight ? "☀️ Light Glass" : "🌙 Dark Glass"}</span>
              </button>
            </div>
          )}
        </header>

        {/* Aggregate KPI Glass Bar */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              title: "Fleet Coverage",
              value: `${avgRollout}%`,
              sub: "Global Production Nodes",
              color: "#38bdf8",
            },
            {
              title: "Active Features",
              value: `${totalCount}`,
              sub: `${gaCount} General Availability`,
              color: "#10b981",
            },
            {
              title: "Threats Blocked",
              value: "14.2k",
              sub: "Zero False Negatives",
              color: "#a855f7",
            },
            {
              title: "Analysis Latency",
              value: "1.2ms",
              sub: "Sub-millisecond AST Parser",
              color: "#f59e0b",
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              style={{
                background: isLight
                  ? "linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.45) 100%)"
                  : "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.02) 100%)",
                backdropFilter: "blur(24px) saturate(190%) contrast(105%)",
                WebkitBackdropFilter: "blur(24px) saturate(190%) contrast(105%)",
                border: isLight
                  ? "1px solid rgba(255, 255, 255, 0.65)"
                  : "1px solid rgba(255, 255, 255, 0.16)",
                boxShadow: isLight
                  ? "inset 0 1px 2px 0 rgba(255, 255, 255, 0.9), 0 10px 24px rgba(0, 0, 0, 0.05)"
                  : "inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.5), inset 0 -1px 1px 0 rgba(255, 255, 255, 0.1), 0 14px 36px rgba(0, 0, 0, 0.35)",
              }}
              className="rounded-[20px] p-5 flex flex-col justify-between transition-colors duration-300 hover:translate-y-[-2px]"
            >
              <span
                className={`text-xs font-medium tracking-wide uppercase ${
                  isLight ? "text-slate-500" : "text-slate-400"
                }`}
              >
                {stat.title}
              </span>
              <div className="my-2">
                <span
                  style={{ color: stat.color }}
                  className="text-3xl font-bold tracking-tight"
                >
                  {stat.value}
                </span>
              </div>
              <span
                className={`text-xs ${
                  isLight ? "text-slate-600" : "text-slate-400"
                }`}
              >
                {stat.sub}
              </span>
            </div>
          ))}
        </section>

        {/* Controls & Filter Bar (Apple Clear Glass Capsule) */}
        <div
          style={{
            background: isLight
              ? "linear-gradient(135deg, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.35) 100%)"
              : "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)",
            backdropFilter: "blur(28px) saturate(190%) contrast(105%)",
            WebkitBackdropFilter: "blur(28px) saturate(190%) contrast(105%)",
            border: isLight
              ? "1px solid rgba(255, 255, 255, 0.7)"
              : "1px solid rgba(255, 255, 255, 0.16)",
            boxShadow: isLight
              ? "inset 0 1px 1.5px rgba(255, 255, 255, 0.9), 0 8px 24px rgba(0, 0, 0, 0.04)"
              : "inset 0 1px 1.5px rgba(255, 255, 255, 0.45), 0 12px 32px rgba(0, 0, 0, 0.3)",
          }}
          className="rounded-[22px] p-3 flex flex-col md:flex-row items-center justify-between gap-3"
        >
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {(
              [
                { id: "all", label: "All Features" },
                { id: "sast", label: "SAST & AST" },
                { id: "dast", label: "DAST Fuzzing" },
                { id: "ai", label: "AI Remediation" },
                { id: "topology", label: "Blast Radius" },
                { id: "supply-chain", label: "Supply Chain" },
              ] as const
            ).map((tab) => {
              const active = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  style={{
                    background: active
                      ? isLight
                        ? "linear-gradient(135deg, #0284c7 0%, #6366f1 100%)"
                        : "linear-gradient(135deg, rgba(56, 189, 248, 0.4) 0%, rgba(129, 140, 248, 0.3) 100%)"
                      : "transparent",
                    border: active
                      ? isLight
                        ? "1px solid rgba(255, 255, 255, 0.8)"
                        : "1px solid rgba(255, 255, 255, 0.35)"
                      : "1px solid transparent",
                    boxShadow: active
                      ? "inset 0 1px 1px rgba(255, 255, 255, 0.6), 0 4px 12px rgba(0, 0, 0, 0.2)"
                      : "none",
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors duration-200 cursor-pointer ${
                    active
                      ? "text-white scale-102"
                      : isLight
                      ? "text-slate-600 hover:text-slate-900 hover:bg-white/40"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Capsule Input */}
          <div className="flex items-center gap-2 w-full md:w-72">
            <div
              style={{
                background: isLight
                  ? "rgba(255, 255, 255, 0.7)"
                  : "rgba(0, 0, 0, 0.35)",
                border: isLight
                  ? "1px solid rgba(255, 255, 255, 0.9)"
                  : "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.1)",
              }}
              className="flex-1 rounded-full px-3.5 py-1.5 flex items-center gap-2"
            >
              <svg
                className="w-3.5 h-3.5 text-slate-400 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <circle cx={11} cy={11} r={8} />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search capabilities, engines..."
                className="w-full bg-transparent text-xs outline-none placeholder:text-slate-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-slate-400 hover:text-slate-200 text-xs px-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                background: isLight
                  ? "rgba(255, 255, 255, 0.7)"
                  : "rgba(0, 0, 0, 0.35)",
                border: isLight
                  ? "1px solid rgba(255, 255, 255, 0.9)"
                  : "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.3)",
              }}
              className="px-3 py-1.5 rounded-full text-xs font-medium outline-none cursor-pointer text-slate-300"
            >
              <option value="all">All Stages</option>
              <option value="GA">GA Only</option>
              <option value="Beta">Beta</option>
              <option value="Experimental">Experimental</option>
            </select>
          </div>
        </div>

        {/* ============================================================
            FEATURE CARDS GRID (Apple Liquid Glass Cards)
            Regular glass with continuous squircle border-radius,
            specular top rim highlight, and optical refraction
            ============================================================ */}
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFeatures.map((feat) => {
            const isSelected = activeFeature?.id === feat.id;
            return (
              <article
                key={feat.id}
                onClick={() => handleCardClick(feat)}
                style={{
                  background: isLight
                    ? "linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.4) 100%)"
                    : "linear-gradient(135deg, rgba(255, 255, 255, 0.11) 0%, rgba(255, 255, 255, 0.02) 100%)",
                  backdropFilter: "blur(28px) saturate(190%) contrast(105%)",
                  WebkitBackdropFilter: "blur(28px) saturate(190%) contrast(105%)",
                  border: isSelected
                    ? `1px solid ${feat.highlightColor}`
                    : isLight
                    ? "1px solid rgba(255, 255, 255, 0.75)"
                    : "1px solid rgba(255, 255, 255, 0.18)",
                  boxShadow: isLight
                    ? "inset 0 1px 2px 0 rgba(255, 255, 255, 0.95), inset 0 -1px 1px 0 rgba(0, 0, 0, 0.04), 0 12px 30px rgba(0, 0, 0, 0.06)"
                    : "inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.55), inset 0 -1px 1px 0 rgba(255, 255, 255, 0.1), 0 18px 48px rgba(0, 0, 0, 0.4)",
                }}
                className={`group relative rounded-[22px] p-6 flex flex-col justify-between cursor-pointer transition-colors duration-300 hover:translate-y-[-3px] ${
                  isSelected ? "ring-2 ring-cyan-400/40" : ""
                }`}
              >
                {/* Header & Status */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      style={{
                        background:
                          feat.status === "GA"
                            ? "rgba(16, 185, 129, 0.15)"
                            : feat.status === "Beta"
                            ? "rgba(168, 85, 247, 0.15)"
                            : "rgba(245, 158, 11, 0.15)",
                        border:
                          feat.status === "GA"
                            ? "1px solid rgba(16, 185, 129, 0.35)"
                            : feat.status === "Beta"
                            ? "1px solid rgba(168, 85, 247, 0.35)"
                            : "1px solid rgba(245, 158, 11, 0.35)",
                        color:
                          feat.status === "GA"
                            ? "#34d399"
                            : feat.status === "Beta"
                            ? "#c084fc"
                            : "#fbbf24",
                        boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.3)",
                      }}
                      className="px-2.5 py-0.5 rounded-full text-caption font-semibold tracking-wide uppercase"
                    >
                      {feat.status}
                    </span>
                    <span
                      className={`text-xs font-mono ${
                        isLight ? "text-slate-500" : "text-slate-400"
                      }`}
                    >
                      {feat.version}
                    </span>
                  </div>

                  {/* Title & Summary */}
                  <h2 className="text-base font-semibold tracking-tight group-hover:text-cyan-400 transition-colors">
                    {feat.name}
                  </h2>
                  <p
                    className={`mt-2 text-xs leading-relaxed ${
                      isLight ? "text-slate-600" : "text-slate-300"
                    }`}
                  >
                    {feat.summary}
                  </p>
                </div>

                {/* Metrics Pill Grid */}
                <div className="my-5 grid grid-cols-3 gap-2">
                  {feat.metrics.map((m, mIdx) => (
                    <div
                      key={mIdx}
                      style={{
                        background: isLight
                          ? "rgba(255, 255, 255, 0.6)"
                          : "rgba(0, 0, 0, 0.25)",
                        border: isLight
                          ? "1px solid rgba(255, 255, 255, 0.8)"
                          : "1px solid rgba(255, 255, 255, 0.1)",
                        boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.2)",
                      }}
                      className="rounded-[12px] p-2 text-center"
                    >
                      <div className="text-caption text-slate-400 font-medium">
                        {m.label}
                      </div>
                      <div className="text-xs font-bold mt-0.5">{m.value}</div>
                    </div>
                  ))}
                </div>

                {/* Rollout Progress & Engines */}
                <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Production Rollout</span>
                    <span className="font-semibold">{feat.rolloutPercent}%</span>
                  </div>
                  {/* Progress Bar with Liquid Glow */}
                  <div className="w-full h-1.5 rounded-full bg-black/30 overflow-hidden p-[1px] border border-white/10">
                    <div
                      style={{
                        width: `${feat.rolloutPercent}%`,
                        background: `linear-gradient(90deg, ${feat.highlightColor}, #38bdf8)`,
                        boxShadow: `0 0 8px ${feat.highlightColor}`,
                      }}
                      className="h-full rounded-full transition-colors duration-500"
                    />
                  </div>

                  {/* Engine Badges */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {feat.engines.slice(0, 3).map((eng, eIdx) => (
                      <span
                        key={eIdx}
                        className={`text-caption px-2 py-0.5 rounded-md ${
                          isLight
                            ? "bg-slate-200/60 text-slate-700"
                            : "bg-white/5 text-slate-400"
                        }`}
                      >
                        {eng}
                      </span>
                    ))}
                    {feat.engines.length > 3 && (
                      <span className="text-caption px-1.5 py-0.5 text-slate-500">
                        +{feat.engines.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </main>

        {filteredFeatures.length === 0 && (
          <div
            style={{
              background: isLight
                ? "rgba(255, 255, 255, 0.6)"
                : "rgba(255, 255, 255, 0.05)",
              border: "1px dashed rgba(255, 255, 255, 0.2)",
            }}
            className="rounded-[24px] p-12 text-center"
          >
            <p className="text-sm text-slate-400">
              No features match your active search or filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setStatusFilter("all");
              }}
              className="mt-3 text-xs text-cyan-400 underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* ============================================================
            FEATURE DETAIL MODAL (Apple Heavy Glass Chrome)
            Modal dialog with deep 36px blur, specular bevel, and controls
            ============================================================ */}
        {activeFeature && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="feature-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setActiveFeature(null)}
          >
            <div
              style={{
                background: isLight
                  ? "linear-gradient(135deg, rgba(255, 255, 255, 0.88) 0%, rgba(255, 255, 255, 0.6) 100%)"
                  : "linear-gradient(135deg, rgba(28, 28, 38, 0.85) 0%, rgba(14, 14, 20, 0.9) 100%)",
                backdropFilter: "blur(36px) saturate(190%) contrast(105%)",
                WebkitBackdropFilter: "blur(36px) saturate(190%) contrast(105%)",
                border: isLight
                  ? "1px solid rgba(255, 255, 255, 0.9)"
                  : "1px solid rgba(255, 255, 255, 0.22)",
                boxShadow: isLight
                  ? "inset 0 1px 2px 0 rgba(255, 255, 255, 1), 0 24px 64px rgba(0, 0, 0, 0.15)"
                  : "inset 0 1px 2px 0 rgba(255, 255, 255, 0.65), inset 0 -1px 1px 0 rgba(255, 255, 255, 0.12), 0 32px 80px rgba(0, 0, 0, 0.6)",
              }}
              className="w-full max-w-2xl rounded-[28px] p-6 sm:p-8 flex flex-col gap-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      style={{
                        background:
                          activeFeature.status === "GA"
                            ? "rgba(16, 185, 129, 0.15)"
                            : activeFeature.status === "Beta"
                            ? "rgba(168, 85, 247, 0.15)"
                            : "rgba(245, 158, 11, 0.15)",
                        border:
                          activeFeature.status === "GA"
                            ? "1px solid rgba(16, 185, 129, 0.35)"
                            : activeFeature.status === "Beta"
                            ? "1px solid rgba(168, 85, 247, 0.35)"
                            : "1px solid rgba(245, 158, 11, 0.35)",
                        color:
                          activeFeature.status === "GA"
                            ? "#34d399"
                            : activeFeature.status === "Beta"
                            ? "#c084fc"
                            : "#fbbf24",
                      }}
                      className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase"
                    >
                      {activeFeature.status}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {activeFeature.version}
                    </span>
                  </div>
                  <h3
                    id="feature-modal-title"
                    className="text-xl font-bold tracking-tight"
                  >
                    {activeFeature.name}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveFeature(null)}
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close feature details"
                >
                  ✕
                </button>
              </div>

              {/* Description */}
              <p
                className={`text-sm leading-relaxed ${
                  isLight ? "text-slate-700" : "text-slate-300"
                }`}
              >
                {activeFeature.description}
              </p>

              {/* Rollout Adjustment Slider */}
              <div
                style={{
                  background: isLight ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.25)",
                  border: isLight
                    ? "1px solid rgba(255, 255, 255, 0.8)"
                    : "1px solid rgba(255, 255, 255, 0.12)",
                }}
                className="rounded-[20px] p-4 flex flex-col gap-2.5"
              >
                <div className="flex items-center justify-between text-xs font-medium">
                  <span>Dynamic Rollout Gate</span>
                  <span className="text-cyan-400 font-bold">
                    {activeFeature.rolloutPercent}% fleet deployment
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={activeFeature.rolloutPercent}
                  onChange={(e) =>
                    handleRolloutChange(activeFeature.id, parseInt(e.target.value, 10))
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Engine Architecture Tags */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Engine Architecture & Subsystems
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activeFeature.engines.map((eng, idx) => (
                    <span
                      key={idx}
                      style={{
                        background: isLight
                          ? "rgba(255, 255, 255, 0.8)"
                          : "rgba(255, 255, 255, 0.08)",
                        border: "1px solid rgba(255, 255, 255, 0.18)",
                        boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.3)",
                      }}
                      className="px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {eng}
                    </span>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveFeature(null)}
                  style={{
                    background: isLight ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                  }}
                  className="px-4 py-2 rounded-full text-xs font-medium cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFeature(null)}
                  style={{
                    background: "linear-gradient(135deg, #0284c7 0%, #6366f1 100%)",
                    border: "1px solid rgba(255, 255, 255, 0.4)",
                    boxShadow: "0 4px 16px rgba(2, 132, 199, 0.4)",
                  }}
                  className="px-5 py-2 rounded-full text-xs font-semibold text-white cursor-pointer hover:scale-102 transition-transform"
                >
                  Apply Rollout Policy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

