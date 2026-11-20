import React, { useRef } from "react";
import { cx } from "./utils.js";

export interface TabsItem<T extends string> {
  readonly value: T;
  readonly label: React.ReactNode;
  readonly icon?: React.ReactNode;
  /** id of the panel this tab controls (sets aria-controls). */
  readonly panelId?: string;
}

export interface TabsProps<T extends string> {
  readonly items: ReadonlyArray<TabsItem<T>>;
  readonly value: T;
  readonly onChange: (value: T) => void;
  readonly label: string;
  readonly className?: string;
  /** Underline (default) for in-panel tabs; pills for compact toolbars. */
  readonly variant?: "underline" | "pills";
}

/**
 * WAI-ARIA tabs with automatic activation: arrow keys move focus and
 * selection together; only the selected tab is in the Tab order.
 */
export function Tabs<T extends string>({
  items,
  value,
  onChange,
  label,
  className,
  variant = "underline",
}: TabsProps<T>): React.ReactElement {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const onKeyDown = (e: React.KeyboardEvent, index: number): void => {
    let next = -1;
    if (e.key === "ArrowRight") next = (index + 1) % items.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + items.length) % items.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    if (next < 0) return;
    e.preventDefault();
    onChange(items[next]!.value);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      className={cx(
        "flex items-center",
        variant === "underline" ? "gap-4 border-b border-separator" : "gap-0.5 rounded-md bg-fill p-0.5",
        className,
      )}
    >
      {items.map((item, index) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={item.panelId}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.value)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cx(
              "inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium transition-colors cursor-pointer",
              variant === "underline"
                ? cx(
                    "-mb-px h-8 border-b-2",
                    selected ? "border-accent-fill text-label" : "border-transparent text-label-secondary hover:text-label",
                  )
                : cx(
                    "h-6 rounded-[5px] px-2.5",
                    selected
                      ? "bg-surface-elevated text-label shadow-[0_0_0_0.5px_rgb(0_0_0/0.12),0_1px_2px_rgb(0_0_0/0.12)]"
                      : "text-label-secondary hover:text-label",
                  ),
            )}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
