import React from "react";
import type { Severity } from "@whoami/types";
import { cx } from "./utils.js";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";

const TONE: Record<BadgeTone, string> = {
  neutral: "bg-fill text-label-secondary",
  accent: "bg-info-bg text-accent",
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
};

export interface BadgeProps {
  readonly tone?: BadgeTone;
  readonly children: React.ReactNode;
  readonly icon?: React.ReactNode;
  readonly className?: string;
  readonly title?: string;
}

/** Small status label. Text always carries the meaning; colour reinforces it. */
export function Badge({ tone = "neutral", children, icon, className, title }: BadgeProps): React.ReactElement {
  return (
    <span
      title={title}
      className={cx(
        "inline-flex h-[18px] shrink-0 items-center gap-1 rounded-sm px-1.5 text-caption font-medium whitespace-nowrap",
        TONE[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Severity: a shape per level so it never depends on colour alone
// ◆ critical · ▲ high · ● medium · ○ low
// ---------------------------------------------------------------------------

export type SeverityLevel = Severity | "info";

export const SEVERITY_LABEL: Record<SeverityLevel, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  info: "Info",
};

/** Text colour class for a severity (for counts and inline labels). */
export const SEVERITY_TEXT: Record<SeverityLevel, string> = {
  critical: "text-sev-critical",
  high: "text-sev-high",
  medium: "text-sev-medium",
  low: "text-sev-low",
  info: "text-sev-info",
};

const SEVERITY_BADGE: Record<SeverityLevel, string> = {
  critical: "bg-sev-critical-bg text-sev-critical",
  high: "bg-sev-high-bg text-sev-high",
  medium: "bg-sev-medium-bg text-sev-medium",
  low: "bg-sev-low-bg text-sev-low",
  info: "bg-sev-info-bg text-sev-info",
};

export interface SeverityShapeProps {
  readonly severity: SeverityLevel;
  readonly size?: number;
  readonly className?: string;
  /** When set, the shape is announced (use when no text label is next to it). */
  readonly label?: string;
}

export function SeverityShape({ severity, size = 8, className, label }: SeverityShapeProps): React.ReactElement {
  const a11y = label
    ? { role: "img" as const, "aria-label": label }
    : { "aria-hidden": true as const };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 10 10"
      className={cx("shrink-0", SEVERITY_TEXT[severity], className)}
      {...a11y}
    >
      {severity === "critical" && <path d="M5 0.5 9.5 5 5 9.5 0.5 5Z" fill="currentColor" />}
      {severity === "high" && <path d="M5 1 9.5 9H0.5Z" fill="currentColor" />}
      {severity === "medium" && <circle cx="5" cy="5" r="4" fill="currentColor" />}
      {severity === "low" && <circle cx="5" cy="5" r="3.25" fill="none" stroke="currentColor" strokeWidth="1.5" />}
      {severity === "info" && <rect x="1.5" y="4" width="7" height="2" rx="1" fill="currentColor" />}
    </svg>
  );
}

export interface SeverityPillProps {
  readonly severity: SeverityLevel;
  readonly className?: string;
}

/** Shape + label on the severity tint. The canonical severity badge. */
export function SeverityPill({ severity, className }: SeverityPillProps): React.ReactElement {
  return (
    <span
      className={cx(
        "inline-flex h-[18px] shrink-0 items-center gap-1 rounded-sm px-1.5 text-caption font-semibold whitespace-nowrap",
        SEVERITY_BADGE[severity],
        className,
      )}
    >
      <SeverityShape severity={severity} size={7} />
      {SEVERITY_LABEL[severity]}
    </span>
  );
}
