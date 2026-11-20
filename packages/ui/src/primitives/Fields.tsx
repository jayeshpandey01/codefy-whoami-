import React, { forwardRef, useId } from "react";
import { cx } from "./utils.js";

const FIELD_FRAME =
  "flex items-center gap-1.5 rounded-md border border-control-border/60 bg-field px-2 text-sm text-label " +
  "transition-colors focus-within:border-focus hover:border-control-border";

// ---------------------------------------------------------------------------
// TextField: label + input + hint/error, wired with ids
// ---------------------------------------------------------------------------

export interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  readonly label: React.ReactNode;
  /** Visually hide the label (still read by screen readers). */
  readonly hideLabel?: boolean;
  readonly hint?: React.ReactNode;
  readonly error?: React.ReactNode;
  readonly leading?: React.ReactNode;
  readonly trailing?: React.ReactNode;
  readonly size?: "sm" | "md";
  readonly containerClassName?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hideLabel, hint, error, leading, trailing, size = "md", id, className, containerClassName, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  return (
    <div className={cx("flex flex-col gap-1", containerClassName)}>
      <label htmlFor={inputId} className={cx("text-xs font-medium text-label", hideLabel && "sr-only")}>
        {label}
      </label>
      <div
        className={cx(
          FIELD_FRAME,
          size === "sm" ? "h-6" : "h-7",
          Boolean(error) && "border-danger hover:border-danger focus-within:border-danger",
        )}
      >
        {leading && <span className="shrink-0 text-label-secondary">{leading}</span>}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={[errorId, hintId].filter(Boolean).join(" ") || undefined}
          className={cx(
            "min-w-0 flex-1 bg-transparent text-sm text-label placeholder:text-label-secondary outline-none",
            className,
          )}
          {...rest}
        />
        {trailing}
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-label-secondary">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

// ---------------------------------------------------------------------------
// SearchField
// ---------------------------------------------------------------------------

export interface SearchFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "onChange" | "value"> {
  readonly value: string;
  readonly onChange: (value: string) => void;
  /** Accessible name (the field has no visible label). */
  readonly label: string;
  readonly size?: "sm" | "md";
  readonly className?: string;
}

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  { value, onChange, label, size = "md", className, placeholder, onKeyDown, ...rest },
  ref,
) {
  return (
    <div className={cx(FIELD_FRAME, size === "sm" ? "h-6" : "h-7", className)}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" className="shrink-0 text-label-secondary" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        ref={ref}
        type="search"
        aria-label={label}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && value) {
            e.stopPropagation();
            onChange("");
          }
          onKeyDown?.(e);
        }}
        className="min-w-0 flex-1 bg-transparent text-sm text-label placeholder:text-label-secondary outline-none [&::-webkit-search-cancel-button]:hidden"
        {...rest}
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          title="Clear search"
          onClick={() => onChange("")}
          className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-label-tertiary/40 text-bg hover:bg-label-tertiary cursor-pointer"
        >
          <svg width="8" height="8" viewBox="0 0 10 10" aria-hidden="true">
            <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
});

// ---------------------------------------------------------------------------
// Select (native, styled)
// ---------------------------------------------------------------------------

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  /** Accessible name when there is no visible <label>. */
  readonly label?: string;
  readonly size?: "sm" | "md";
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, size = "md", className, children, ...rest },
  ref,
) {
  return (
    <div className={cx("relative inline-flex", className)}>
      <select
        ref={ref}
        aria-label={label}
        className={cx(
          "w-full appearance-none rounded-md border border-control-border/60 bg-field pl-2 pr-6 text-label",
          "hover:border-control-border focus-visible:border-focus cursor-pointer",
          size === "sm" ? "h-6 text-xs" : "h-7 text-sm",
        )}
        {...rest}
      >
        {children}
      </select>
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-label-secondary">
        <path d="M2.5 3.75 5 6.25l2.5-2.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Checkbox (native input, labelled)
// ---------------------------------------------------------------------------

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  readonly label: React.ReactNode;
  readonly description?: React.ReactNode;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, description, className, id, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <label htmlFor={inputId} className={cx("flex items-start gap-2 cursor-pointer select-none", className)}>
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        className="mt-0.5 h-3.5 w-3.5 shrink-0 cursor-pointer accent-[var(--color-accent-fill)]"
        {...rest}
      />
      <span className="flex min-w-0 flex-col">
        <span className="text-sm text-label">{label}</span>
        {description && <span className="text-xs text-label-secondary">{description}</span>}
      </span>
    </label>
  );
});

// ---------------------------------------------------------------------------
// Switch
// ---------------------------------------------------------------------------

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
  /** Accessible name when no visible label is associated. */
  readonly label?: string;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(function Switch(
  { checked, onChange, label, className, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx(
        "relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-full transition-colors cursor-pointer",
        "disabled:cursor-default disabled:opacity-40",
        checked ? "bg-accent-fill" : "bg-fill-hover",
        className,
      )}
      {...rest}
    >
      <span
        aria-hidden="true"
        className={cx(
          "inline-block h-[14px] w-[14px] rounded-full bg-white shadow-[0_1px_2px_rgb(0_0_0/0.3)] transition-transform",
          checked ? "translate-x-[16px]" : "translate-x-[2px]",
        )}
      />
    </button>
  );
});
