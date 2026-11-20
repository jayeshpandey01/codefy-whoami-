import React, { forwardRef } from "react";
import { cx } from "./utils.js";
import { Spinner } from "./Feedback.js";

export type ButtonVariant = "primary" | "secondary" | "plain" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium " +
  "transition-colors cursor-pointer select-none disabled:cursor-default disabled:opacity-40";

const SIZE: Record<ButtonSize, string> = {
  sm: "h-6 px-2 text-xs",
  md: "h-7 px-3 text-sm",
  lg: "h-8 px-4 text-sm",
};

const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-accent-fill text-on-accent hover:bg-accent-fill-hover disabled:hover:bg-accent-fill",
  secondary: "bg-fill text-label hover:bg-fill-hover disabled:hover:bg-fill",
  plain: "text-accent hover:bg-hover disabled:hover:bg-transparent",
  destructive: "bg-danger-bg text-danger hover:brightness-95 disabled:hover:brightness-100",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  /** Leading icon. */
  readonly icon?: React.ReactNode;
  /** Shows a spinner, disables the button and sets aria-busy. */
  readonly loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "secondary", size = "md", icon, loading = false, className, children, disabled, type, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type ?? "button"}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(BASE, SIZE[size], VARIANT[variant], className)}
      {...rest}
    >
      {loading ? <Spinner size={size === "sm" ? 12 : 14} /> : icon}
      {children}
    </button>
  );
});

export type IconButtonSize = "sm" | "md";

const ICON_SIZE: Record<IconButtonSize, string> = {
  sm: "h-6 w-6",
  md: "h-7 w-7",
};

export interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> {
  /** Accessible name; also shown as the tooltip unless `title` is given. */
  readonly label: string;
  readonly size?: IconButtonSize;
  /** Pressed state for toggle buttons (sets aria-pressed). */
  readonly pressed?: boolean;
  readonly children: React.ReactNode;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, size = "md", pressed, className, children, title, type, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type ?? "button"}
      aria-label={label}
      title={title ?? label}
      aria-pressed={pressed}
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-md transition-colors cursor-pointer",
        "text-label-secondary hover:bg-hover hover:text-label disabled:cursor-default disabled:opacity-40",
        pressed && "bg-selection text-accent hover:text-accent",
        ICON_SIZE[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
});
