import React from "react";
import { cx } from "./utils.js";

export interface SegmentedOption<T extends string> {
  readonly value: T;
  readonly label: React.ReactNode;
  /** Accessible name when `label` is icon-only or ambiguous. */
  readonly ariaLabel?: string;
  readonly icon?: React.ReactNode;
  readonly title?: string;
  readonly disabled?: boolean;
}

export interface SegmentedControlProps<T extends string> {
  readonly options: ReadonlyArray<SegmentedOption<T>>;
  readonly value: T;
  readonly onChange: (value: T) => void;
  /** Names the group for screen readers. */
  readonly label: string;
  readonly size?: "sm" | "md";
  /** Stretch segments to fill the container. */
  readonly fill?: boolean;
  readonly className?: string;
}

/**
 * A row of mutually exclusive toggle buttons (aria-pressed). Each segment is
 * a real <button>, so it stays reachable by Tab and queryable by role.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  size = "md",
  fill = false,
  className,
}: SegmentedControlProps<T>): React.ReactElement {
  return (
    <div
      role="group"
      aria-label={label}
      className={cx("inline-flex items-center gap-0.5 rounded-md bg-fill p-0.5", fill && "flex w-full", className)}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            aria-label={option.ariaLabel}
            title={option.title}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={cx(
              "inline-flex min-w-0 items-center justify-center gap-1.5 rounded-[5px] font-medium whitespace-nowrap",
              "transition-colors cursor-pointer disabled:cursor-default disabled:opacity-40",
              size === "sm" ? "h-5 px-2 text-caption" : "h-6 px-2.5 text-xs",
              fill && "flex-1",
              selected
                ? "bg-surface-elevated text-label shadow-[0_0_0_0.5px_rgb(0_0_0/0.12),0_1px_2px_rgb(0_0_0/0.12)]"
                : "text-label-secondary hover:text-label",
            )}
          >
            {option.icon}
            {option.label !== undefined && option.label !== null && option.label !== "" && (
              <span className="truncate">{option.label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
