import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, normalizeAppearance, useTheme } from "../components/ThemeContext.js";
import { ThemePicker } from "../components/ThemePicker.js";

function Probe(): React.ReactElement {
  const { theme, resolvedAppearance } = useTheme();
  return <span data-testid="probe">{`${theme}/${resolvedAppearance}`}</span>;
}

const store = new Map<string, string>();
Object.defineProperty(window, "localStorage", {
  configurable: true,
  value: {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  },
});

let prefersDark = false;
const listeners = new Set<(e: { matches: boolean }) => void>();

beforeEach(() => {
  prefersDark = false;
  listeners.clear();
  window.localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  document.documentElement.removeAttribute("data-host");
  document.body.className = "";
  window.matchMedia = vi.fn().mockImplementation(() => ({
    get matches() {
      return prefersDark;
    },
    addEventListener: (_: string, cb: (e: { matches: boolean }) => void) => listeners.add(cb),
    removeEventListener: (_: string, cb: (e: { matches: boolean }) => void) => listeners.delete(cb),
  })) as unknown as typeof window.matchMedia;
});

afterEach(() => {
  document.body.className = "";
});

describe("normalizeAppearance", () => {
  it("keeps current preferences and maps retired palette ids", () => {
    expect(normalizeAppearance("system")).toBe("system");
    expect(normalizeAppearance("light")).toBe("light");
    expect(normalizeAppearance("solarized-light")).toBe("light");
    expect(normalizeAppearance("dracula")).toBe("dark");
    expect(normalizeAppearance("dark-glass-terminal")).toBe("dark");
    expect(normalizeAppearance(null)).toBe("system");
  });
});

describe("ThemeProvider", () => {
  it("defaults to System and follows the OS appearance live", () => {
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("probe").textContent).toBe("system/light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    act(() => {
      prefersDark = true;
      listeners.forEach((cb) => cb({ matches: true }));
    });
    expect(screen.getByTestId("probe").textContent).toBe("system/dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("migrates a stored legacy palette id", () => {
    window.localStorage.setItem("codefy:theme", "catppuccin");
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId("probe").textContent).toBe("dark/dark");
  });

  it("inside VS Code follows the editor theme and marks the host", () => {
    document.body.className = "vscode-light";
    render(
      <ThemeProvider host="vscode">
        <Probe />
      </ThemeProvider>,
    );
    expect(document.documentElement.getAttribute("data-host")).toBe("vscode");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });
});

describe("ThemePicker", () => {
  it("is a radio group whose arrow keys move selection and focus", () => {
    const onChange = vi.fn();
    render(
      <ThemeProvider>
        <ThemePicker onThemeChange={onChange} />
      </ThemeProvider>,
    );
    const radios = screen.getAllByRole("radio");
    expect(radios.map((r) => r.textContent)).toEqual(["System", "Light", "Dark"]);
    expect(radios[0]!.getAttribute("aria-checked")).toBe("true");
    expect(radios[0]!.tabIndex).toBe(0);
    expect(radios[1]!.tabIndex).toBe(-1);

    radios[0]!.focus();
    fireEvent.keyDown(radios[0]!, { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith("light");
    expect(document.activeElement).toBe(radios[1]);
    expect(radios[1]!.getAttribute("aria-checked")).toBe("true");
  });

  it("explains that VS Code decides the theme instead of offering choices", () => {
    document.body.className = "vscode-dark";
    render(
      <ThemeProvider host="vscode">
        <ThemePicker />
      </ThemeProvider>,
    );
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
    expect(screen.getByText(/follows your VS Code color theme/i)).toBeTruthy();
  });
});
