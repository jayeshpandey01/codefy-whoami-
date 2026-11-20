import React from "react";
import { cx } from "./utils.js";

// ---------------------------------------------------------------------------
// Spinner
// ---------------------------------------------------------------------------

export interface SpinnerProps {
  readonly size?: number;
  /** When set, the spinner is announced; otherwise it is decorative. */
  readonly label?: string;
  readonly className?: string;
}

export function Spinner({ size = 14, label, className }: SpinnerProps): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cx("animate-spin shrink-0", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// ProgressBar
// ---------------------------------------------------------------------------

export interface ProgressBarProps {
  /** 0..max. Omit for an indeterminate bar. */
  readonly value?: number;
  readonly max?: number;
  readonly label: string;
  readonly className?: string;
}

export function ProgressBar({ value, max = 100, label, className }: ProgressBarProps): React.ReactElement {
  const determinate = typeof value === "number";
  const percent = determinate ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={determinate ? 0 : undefined}
      aria-valuemax={determinate ? max : undefined}
      aria-valuenow={determinate ? value : undefined}
      className={cx("relative h-1 w-full overflow-hidden rounded-full bg-fill", className)}
    >
      {determinate ? (
        <div
          className="h-full rounded-full bg-accent-fill transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      ) : (
        <div className="absolute inset-y-0 w-1/3 rounded-full bg-accent-fill animate-pulse" />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Callout: inline status message (errors, warnings, notices)
// ---------------------------------------------------------------------------

export type CalloutTone = "info" | "success" | "warning" | "danger";

const CALLOUT_TONE: Record<CalloutTone, string> = {
  info: "bg-info-bg text-label border-info/30",
  success: "bg-success-bg text-label border-success/30",
  warning: "bg-warning-bg text-label border-warning/30",
  danger: "bg-danger-bg text-label border-danger/30",
};

const CALLOUT_ICON_COLOR: Record<CalloutTone, string> = {
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

export interface CalloutProps {
  readonly tone?: CalloutTone;
  readonly title?: React.ReactNode;
  readonly icon?: React.ReactNode;
  readonly children?: React.ReactNode;
  /** Buttons shown on the trailing edge (or below the text when narrow). */
  readonly actions?: React.ReactNode;
  readonly className?: string;
}

export function Callout({
  tone = "info",
  title,
  icon,
  children,
  actions,
  className,
}: CalloutProps): React.ReactElement {
  const urgent = tone === "danger" || tone === "warning";
  return (
    <div
      role={urgent ? "alert" : "status"}
      className={cx("flex flex-wrap items-start gap-x-3 gap-y-2 rounded-lg border px-3 py-2.5", CALLOUT_TONE[tone], className)}
    >
      {icon && <span className={cx("mt-px shrink-0", CALLOUT_ICON_COLOR[tone])}>{icon}</span>}
      <div className="min-w-0 flex-1 basis-48">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {children && <div className="text-xs text-label-secondary">{children}</div>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// EmptyState
// ---------------------------------------------------------------------------

export interface EmptyStateProps {
  readonly icon?: React.ReactNode;
  readonly title: React.ReactNode;
  readonly description?: React.ReactNode;
  readonly action?: React.ReactNode;
  readonly className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps): React.ReactElement {
  return (
    <div className={cx("flex flex-col items-center justify-center gap-2 px-6 py-10 text-center", className)}>
      {icon && <div className="mb-1 text-label-tertiary">{icon}</div>}
      <div className="text-sm font-semibold text-label">{title}</div>
      {description && <div className="max-w-xs text-xs text-label-secondary">{description}</div>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Kbd
// ---------------------------------------------------------------------------

export function Kbd({ children, className }: { readonly children: React.ReactNode; readonly className?: string }): React.ReactElement {
  return (
    <kbd
      className={cx(
        "inline-flex h-4 min-w-4 items-center justify-center rounded-sm border border-separator bg-bg px-1",
        "font-sans text-caption2 text-label-secondary",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
