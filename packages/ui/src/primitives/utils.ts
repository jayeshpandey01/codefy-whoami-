/** Joins class names, skipping falsy values. */
export function cx(...parts: Array<string | false | null | undefined | 0>): string {
  return parts.filter(Boolean).join(" ");
}

/**
 * Stacking order for overlays. Dialogs sit above page chrome; popovers sit
 * above dialogs so a menu opened inside a dialog is never hidden.
 */
export const LAYER = {
  dialog: 10000,
  popover: 10100,
  toast: 10200,
} as const;

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable='true']",
].join(",");

/** Focusable, visible descendants in DOM order. */
export function getFocusable(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.hasAttribute("inert") && el.getAttribute("aria-hidden") !== "true",
  );
}

/** Keeps Tab / Shift+Tab inside `root`. Call from a keydown handler. */
export function trapTab(event: KeyboardEvent | React.KeyboardEvent, root: HTMLElement): void {
  if (event.key !== "Tab") return;
  const items = getFocusable(root);
  if (items.length === 0) {
    event.preventDefault();
    root.focus();
    return;
  }
  const first = items[0]!;
  const last = items[items.length - 1]!;
  const active = document.activeElement;
  if (event.shiftKey && (active === first || active === root)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

/**
 * Escape handling for stacked layers: only the most recently opened layer
 * responds, so Escape closes one thing at a time.
 */
const escapeStack: Array<() => void> = [];

export function pushEscapeLayer(onEscape: () => void): () => void {
  escapeStack.push(onEscape);
  return () => {
    const index = escapeStack.lastIndexOf(onEscape);
    if (index !== -1) escapeStack.splice(index, 1);
  };
}

export function isTopEscapeLayer(onEscape: () => void): boolean {
  return escapeStack[escapeStack.length - 1] === onEscape;
}

/** True when any shared layer (dialog, popover) is open. */
export function hasOpenEscapeLayer(): boolean {
  return escapeStack.length > 0;
}
