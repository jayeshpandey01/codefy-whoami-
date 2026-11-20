import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// ---------------------------------------------------------------------------
// Appearance model
// ---------------------------------------------------------------------------
//
// The app has one token set with a light and a dark appearance
// (styles/tailwind.css). People choose System, Light or Dark; System follows
// the OS. Inside VS Code the panel follows the editor's own theme instead, so
// it always matches the workbench around it.
//
// The 13 named editor palettes were retired. Their ids are still accepted
// (older saved settings contain them) and resolve to light or dark.

export type AppearancePreference = "system" | "light" | "dark";
export type ResolvedAppearance = "light" | "dark";

/** Kept for API compatibility: a theme id is now an appearance preference. */
export type ThemeId = AppearancePreference;

export interface ThemeMeta {
  readonly id: AppearancePreference;
  readonly label: string;
  readonly description: string;
}

export const THEMES: readonly ThemeMeta[] = [
  { id: "system", label: "System", description: "Match your computer’s appearance" },
  { id: "light", label: "Light", description: "Always light" },
  { id: "dark", label: "Dark", description: "Always dark" },
];

const LEGACY_LIGHT_THEMES = new Set(["light", "solarized-light"]);

/** Maps any stored value, including retired palette ids, to a preference. */
export function normalizeAppearance(value: string | null | undefined): AppearancePreference {
  if (value === "system" || value === "light" || value === "dark") return value;
  if (!value) return "system";
  return LEGACY_LIGHT_THEMES.has(value) ? "light" : "dark";
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const STORAGE_KEY = "codefy:theme";

interface ThemeContextValue {
  /** The person's preference. */
  readonly theme: AppearancePreference;
  /** Accepts a preference or any legacy palette id. */
  readonly setTheme: (id: string) => void;
  /** What is actually on screen. */
  readonly resolvedAppearance: ResolvedAppearance;
  /** True inside VS Code, where the editor theme decides and the preference is ignored. */
  readonly followsHost: boolean;
  readonly themes: typeof THEMES;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  setTheme: () => void 0,
  resolvedAppearance: "dark",
  followsHost: false,
  themes: THEMES,
});

function readStoredPreference(): AppearancePreference {
  if (typeof window === "undefined") return "system";
  try {
    return normalizeAppearance(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return "system";
  }
}

function systemPrefersDark(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return true;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

interface HostAppearance {
  readonly appearance: ResolvedAppearance;
  readonly highContrast: boolean;
}

/** VS Code puts vscode-light / vscode-dark / vscode-high-contrast(-light) on <body>. */
function readVsCodeAppearance(): HostAppearance {
  const cls = typeof document === "undefined" ? undefined : document.body?.classList;
  if (!cls) return { appearance: "dark", highContrast: false };
  const highContrast = cls.contains("vscode-high-contrast") || cls.contains("vscode-high-contrast-light");
  const light = cls.contains("vscode-light") || cls.contains("vscode-high-contrast-light");
  return { appearance: light ? "light" : "dark", highContrast };
}

function applyToDocument(appearance: ResolvedAppearance, host: "vscode" | null, highContrast: boolean): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-theme", appearance);
  if (host) root.setAttribute("data-host", host);
  else root.removeAttribute("data-host");
  if (highContrast) root.setAttribute("data-contrast", "more");
  else root.removeAttribute("data-contrast");
}

export interface ThemeProviderProps {
  readonly children: React.ReactNode;
  /**
   * "vscode": follow the editor theme from VS Code's body classes and map the
   * token set onto VS Code's own --vscode-* colours.
   */
  readonly host?: "vscode";
}

export function ThemeProvider({ children, host }: ThemeProviderProps): React.ReactElement {
  const followsHost = host === "vscode";
  const [theme, setThemeState] = useState<AppearancePreference>(readStoredPreference);
  const [systemDark, setSystemDark] = useState<boolean>(systemPrefersDark);
  const [hostAppearance, setHostAppearance] = useState<HostAppearance>(() =>
    followsHost ? readVsCodeAppearance() : { appearance: "dark", highContrast: false },
  );

  // Follow the OS appearance while the preference is "system".
  useEffect(() => {
    if (followsHost || typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent): void => setSystemDark(e.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [followsHost]);

  // Follow the VS Code editor theme.
  useEffect(() => {
    if (!followsHost || typeof document === "undefined" || !document.body) return;
    const observer = new MutationObserver(() => setHostAppearance(readVsCodeAppearance()));
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [followsHost]);

  const resolvedAppearance: ResolvedAppearance = followsHost
    ? hostAppearance.appearance
    : theme === "system"
      ? systemDark
        ? "dark"
        : "light"
      : theme;

  useEffect(() => {
    applyToDocument(
      resolvedAppearance,
      followsHost ? "vscode" : null,
      followsHost && hostAppearance.highContrast,
    );
  }, [resolvedAppearance, followsHost, hostAppearance.highContrast]);

  const setTheme = useCallback((id: string) => {
    const next = normalizeAppearance(id);
    setThemeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage can be unavailable (private mode, blocked site data); the
      // preference still applies for this session.
    }
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, resolvedAppearance, followsHost, themes: THEMES }),
    [theme, setTheme, resolvedAppearance, followsHost],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
