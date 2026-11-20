import React, { useCallback, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { LAYER, cx, getFocusable, isTopEscapeLayer, pushEscapeLayer, trapTab } from "./utils.js";

export type DialogSize = "sm" | "md" | "lg" | "xl" | "full";

const SIZE: Record<DialogSize, string> = {
  sm: "w-[440px]",
  md: "w-[560px]",
  lg: "w-[720px] h-[min(560px,calc(100vh-48px))]",
  xl: "w-[880px] h-[min(680px,calc(100vh-48px))]",
  full: "w-[calc(100vw-48px)] h-[calc(100vh-48px)]",
};

export interface DialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  /** Visible title; names the dialog. */
  readonly title?: React.ReactNode;
  /** Accessible name when there is no visible title. */
  readonly ariaLabel?: string;
  readonly description?: React.ReactNode;
  readonly size?: DialogSize;
  /** Element to focus on open; defaults to the first focusable element. */
  readonly initialFocusRef?: React.RefObject<HTMLElement | null>;
  /** Escape and backdrop click close the dialog (default true). Disable while a task must finish. */
  readonly dismissible?: boolean;
  /** Footer row, typically Cancel then the primary action, right-aligned. */
  readonly footer?: React.ReactNode;
  /** Extra controls in the header row, before the close button. */
  readonly headerAccessory?: React.ReactNode;
  /** Render without the standard header (the body provides its own). */
  readonly bare?: boolean;
  readonly className?: string;
  readonly bodyClassName?: string;
  /** Accessible name for the close button. */
  readonly closeLabel?: string;
  /** Tooltip for the close button. */
  readonly closeTitle?: string;
  readonly children?: React.ReactNode;
}

/**
 * Modal dialog. role="dialog" sits on the full-screen wrapper (a click on the
 * wrapper itself is a backdrop click). Handles focus trap, initial focus,
 * focus restore, scroll lock and stacked Escape.
 */
export function Dialog({
  open,
  onClose,
  title,
  ariaLabel,
  description,
  size = "md",
  initialFocusRef,
  dismissible = true,
  footer,
  headerAccessory,
  bare = false,
  className,
  bodyClassName,
  closeLabel = "Close",
  closeTitle,
  children,
}: DialogProps): React.ReactElement | null {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const dismissibleRef = useRef(dismissible);
  dismissibleRef.current = dismissible;

  const handleEscape = useCallback(() => {
    if (dismissibleRef.current) onCloseRef.current();
  }, []);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const popLayer = pushEscapeLayer(handleEscape);

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const focusTarget =
      initialFocusRef?.current ?? (panelRef.current ? getFocusable(panelRef.current)[0] : undefined) ?? panelRef.current;
    focusTarget?.focus();

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape" && isTopEscapeLayer(handleEscape)) {
        event.stopPropagation();
        handleEscape();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      popLayer();
      document.body.style.overflow = overflow;
      if (previouslyFocused && document.contains(previouslyFocused)) previouslyFocused.focus();
    };
    // initialFocusRef is read once on open by design.
  }, [open, handleEscape]);

  if (!open || typeof document === "undefined") return null;

  const labelled = title ? { "aria-labelledby": titleId } : { "aria-label": ariaLabel };

  return createPortal(
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      {...labelled}
      aria-describedby={description ? descriptionId : undefined}
      style={{ zIndex: LAYER.dialog }}
      className="fixed inset-0 flex items-center justify-center bg-black/40 p-6 font-sans animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && dismissibleRef.current) onClose();
      }}
      onKeyDown={(e) => {
        if (panelRef.current) trapTab(e, panelRef.current);
      }}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cx(
          "flex max-h-full max-w-full flex-col overflow-hidden rounded-xl border border-separator bg-surface-elevated",
          "text-label shadow-dialog animate-enter outline-none",
          SIZE[size],
          className,
        )}
      >
        {!bare && (title || headerAccessory) && (
          <div className="flex shrink-0 items-center gap-3 border-b border-separator px-4 py-3">
            <div className="min-w-0 flex-1">
              {title && (
                <h2 id={titleId} className="truncate text-base font-semibold text-label">
                  {title}
                </h2>
              )}
              {description && (
                <p id={descriptionId} className="mt-0.5 text-xs text-label-secondary">
                  {description}
                </p>
              )}
            </div>
            {headerAccessory}
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              title={closeTitle ?? closeLabel}
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-label-secondary hover:bg-hover hover:text-label cursor-pointer"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
        <div className={cx("min-h-0 flex-1 overflow-y-auto", !bare && "px-4 py-4", bodyClassName)}>{children}</div>
        {footer && (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-separator px-4 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
