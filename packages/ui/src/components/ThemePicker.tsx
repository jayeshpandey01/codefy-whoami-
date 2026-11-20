import React, { useRef } from "react";
import { THEMES, useTheme } from "./ThemeContext.js";
import type { AppearancePreference, ThemeId } from "./ThemeContext.js";

// ---------------------------------------------------------------------------
// Appearance thumbnails: a miniature window in the light and/or dark token
// colours. Fixed colours on purpose -- each thumbnail shows that appearance
// regardless of the one currently active.
// ---------------------------------------------------------------------------

const PREVIEW = {
  light: { window: "#ffffff", sidebar: "#f5f5f7", line: "#d2d2d7", accent: "#0071e3" },
  dark: { window: "#1c1c1e", sidebar: "#161618", line: "#3a3a3c", accent: "#0a84ff" },
} as const;

function MiniWindow({ mode }: { readonly mode: "light" | "dark" }): React.ReactElement {
  const c = PREVIEW[mode];
  return (
    <g>
      <rect width="120" height="76" fill={c.window} />
      <rect width="34" height="76" fill={c.sidebar} />
      <rect x="6" y="10" width="22" height="4" rx="2" fill={c.accent} />
      <rect x="6" y="20" width="18" height="4" rx="2" fill={c.line} />
      <rect x="6" y="30" width="20" height="4" rx="2" fill={c.line} />
      <rect x="44" y="10" width="60" height="5" rx="2.5" fill={c.line} />
      <rect x="44" y="22" width="44" height="4" rx="2" fill={c.line} />
      <rect x="44" y="32" width="52" height="4" rx="2" fill={c.line} />
      <rect x="44" y="56" width="28" height="10" rx="3" fill={c.accent} />
    </g>
  );
}

function AppearanceThumbnail({ id }: { readonly id: AppearancePreference }): React.ReactElement {
  return (
    <svg viewBox="0 0 120 76" className="block h-full w-full" aria-hidden="true">
      {id === "system" ? (
        <>
          <defs>
            <clipPath id="appearance-system-right">
              <rect x="60" width="60" height="76" />
            </clipPath>
          </defs>
          <MiniWindow mode="light" />
          <g clipPath="url(#appearance-system-right)">
            <MiniWindow mode="dark" />
          </g>
        </>
      ) : (
        <MiniWindow mode={id} />
      )}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// ThemePicker: a radio group of System / Light / Dark
// ---------------------------------------------------------------------------

export interface ThemePickerProps {
  /** Called when the preference changes (to persist it in settings). */
  readonly onThemeChange?: (themeId: ThemeId) => void;
  /** Shows a one-line explanation above the options. */
  readonly showHint?: boolean;
  readonly className?: string;
}

export function ThemePicker({
  onThemeChange,
  showHint = false,
  className = "",
}: ThemePickerProps): React.ReactElement {
  const { theme, setTheme, followsHost } = useTheme();
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  if (followsHost) {
    return (
      <p className={`text-sm text-label-secondary ${className}`}>
        Codefy follows your VS Code color theme. Change it with{" "}
        <span className="font-medium text-label">Preferences: Color Theme</span>.
      </p>
    );
  }

  const select = (id: AppearancePreference): void => {
    setTheme(id);
    onThemeChange?.(id);
  };

  // Radio-group keyboard model: arrows move focus and selection together;
  // only the selected option is in the tab order.
  const onKeyDown = (e: React.KeyboardEvent, index: number): void => {
    const delta =
      e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (delta === 0) return;
    e.preventDefault();
    const next = (index + delta + THEMES.length) % THEMES.length;
    const option = THEMES[next];
    if (!option) return;
    select(option.id);
    optionRefs.current[next]?.focus();
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {showHint && (
        <p className="text-xs text-label-secondary">
          System matches your computer and switches automatically.
        </p>
      )}
      <div role="radiogroup" aria-label="Appearance" className="grid grid-cols-3 gap-3">
        {THEMES.map((option, index) => {
          const selected = theme === option.id;
          return (
            <button
              key={option.id}
              ref={(el) => {
                optionRefs.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(option.id)}
              onKeyDown={(e) => onKeyDown(e, index)}
              className="group flex flex-col items-center gap-2 rounded-lg p-1 text-center cursor-pointer"
            >
              <span
                className={`block aspect-[120/76] w-full overflow-hidden rounded-md border ${
                  selected
                    ? "border-accent-fill ring-2 ring-accent-fill"
                    : "border-separator group-hover:border-control-border"
                }`}
              >
                <AppearanceThumbnail id={option.id} />
              </span>
              <span className={`text-xs ${selected ? "font-semibold text-label" : "text-label-secondary"}`}>
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
