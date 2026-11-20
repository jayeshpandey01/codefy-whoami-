import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { LAYER, cx, getFocusable, isTopEscapeLayer, pushEscapeLayer } from "./utils.js";

// ---------------------------------------------------------------------------
// Positioning: fixed coordinates under (or above) the trigger, kept on screen
// ---------------------------------------------------------------------------

type Align = "start" | "end";

function usePosition(
  open: boolean,
  triggerRef: React.RefObject<HTMLElement | null>,
  panelRef: React.RefObject<HTMLElement | null>,
  align: Align,
): React.CSSProperties {
  const [style, setStyle] = useState<React.CSSProperties>({ position: "fixed", visibility: "hidden" });

  const update = useCallback(() => {
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    if (!trigger || !panel) return;
    const t = trigger.getBoundingClientRect();
    const p = panel.getBoundingClientRect();
    const margin = 8;
    const gap = 4;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = align === "end" ? t.right - p.width : t.left;
    left = Math.max(margin, Math.min(left, vw - p.width - margin));
    const below = t.bottom + gap;
    const fitsBelow = below + p.height <= vh - margin;
    const top = fitsBelow ? below : Math.max(margin, t.top - gap - p.height);
    const maxHeight = fitsBelow ? vh - below - margin : t.top - gap - margin;
    setStyle({ position: "fixed", top, left, maxHeight, visibility: "visible" });
  }, [triggerRef, panelRef, align]);

  useLayoutEffect(() => {
    if (!open) return;
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, update]);

  return style;
}

// ---------------------------------------------------------------------------
// Popover: a non-modal floating panel anchored to a trigger
// ---------------------------------------------------------------------------

export interface PopoverTriggerProps {
  readonly ref: React.Ref<HTMLButtonElement>;
  readonly onClick: () => void;
  readonly "aria-expanded": boolean;
  readonly "aria-haspopup": "dialog" | "menu";
  readonly "aria-controls": string | undefined;
}

export interface PopoverProps {
  /** Renders the trigger; spread the given props onto a <button>. */
  readonly trigger: (props: PopoverTriggerProps) => React.ReactElement;
  readonly children: React.ReactNode | ((close: () => void) => React.ReactNode);
  /** Accessible name of the panel. */
  readonly label: string;
  readonly align?: Align;
  readonly className?: string;
  /** Controlled open state (optional). */
  readonly open?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  /** Internal: popup role. */
  readonly role?: "dialog" | "menu";
  /** Internal: element to focus first. */
  readonly focusFirst?: (panel: HTMLElement) => void;
  readonly onPanelKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export function Popover({
  trigger,
  children,
  label,
  align = "start",
  className,
  open: controlledOpen,
  onOpenChange,
  role = "dialog",
  focusFirst,
  onPanelKeyDown,
}: PopoverProps): React.ReactElement {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const style = usePosition(open, triggerRef, panelRef, align);

  const setOpen = useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );

  const close = useCallback(
    (restoreFocus = true) => {
      setOpen(false);
      if (restoreFocus) triggerRef.current?.focus();
    },
    [setOpen],
  );

  const escape = useCallback(() => close(true), [close]);

  useEffect(() => {
    if (!open) return;
    const popLayer = pushEscapeLayer(escape);
    const panel = panelRef.current;
    if (panel) {
      if (focusFirst) focusFirst(panel);
      else (getFocusable(panel)[0] ?? panel).focus();
    }
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape" && isTopEscapeLayer(escape)) {
        e.stopPropagation();
        escape();
      }
    };
    const onPointerDown = (e: MouseEvent): void => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      close(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      popLayer();
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
    // focusFirst is read once on open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, escape, close]);

  const triggerElement = trigger({
    ref: triggerRef,
    onClick: () => setOpen(!open),
    "aria-expanded": open,
    "aria-haspopup": role,
    "aria-controls": open ? panelId : undefined,
  });

  return (
    <>
      {triggerElement}
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            id={panelId}
            role={role}
            aria-label={label}
            tabIndex={-1}
            style={{ ...style, zIndex: LAYER.popover }}
            onKeyDown={(e) => {
              if (e.key === "Tab" && role === "menu") {
                close(false);
                return;
              }
              onPanelKeyDown?.(e);
            }}
            className={cx(
              "material-floating min-w-44 overflow-y-auto rounded-lg border border-separator p-1 text-sm text-label outline-none animate-fade-in",
              className,
            )}
          >
            {typeof children === "function" ? children(() => close(true)) : children}
          </div>,
          document.body,
        )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Menu: a Popover with role="menu" and arrow-key navigation
// ---------------------------------------------------------------------------

const MenuCloseContext = createContext<() => void>(() => void 0);

const ITEM_SELECTOR = '[role="menuitem"],[role="menuitemradio"],[role="menuitemcheckbox"]';

function menuItems(panel: HTMLElement): HTMLElement[] {
  return Array.from(panel.querySelectorAll<HTMLElement>(ITEM_SELECTOR)).filter(
    (el) => el.getAttribute("aria-disabled") !== "true",
  );
}

export interface MenuProps extends Omit<PopoverProps, "role" | "focusFirst" | "onPanelKeyDown" | "children"> {
  readonly children: React.ReactNode;
}

export function Menu({ children, ...popover }: MenuProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const isControlled = popover.open !== undefined;
  const effectiveOpen = isControlled ? popover.open! : open;
  const setEffectiveOpen = (next: boolean): void => {
    if (!isControlled) setOpen(next);
    popover.onOpenChange?.(next);
  };

  return (
    <Popover
      {...popover}
      open={effectiveOpen}
      onOpenChange={setEffectiveOpen}
      role="menu"
      focusFirst={(panel) => {
        const items = menuItems(panel);
        const checked = items.find((el) => el.getAttribute("aria-checked") === "true");
        (checked ?? items[0] ?? panel).focus();
      }}
      onPanelKeyDown={(e) => {
        const panel = e.currentTarget;
        const items = menuItems(panel);
        if (items.length === 0) return;
        const index = items.indexOf(document.activeElement as HTMLElement);
        let next = -1;
        if (e.key === "ArrowDown") next = (index + 1) % items.length;
        else if (e.key === "ArrowUp") next = (index - 1 + items.length) % items.length;
        else if (e.key === "Home") next = 0;
        else if (e.key === "End") next = items.length - 1;
        if (next >= 0) {
          e.preventDefault();
          items[next]!.focus();
        }
      }}
    >
      {(close) => <MenuCloseContext.Provider value={close}>{children}</MenuCloseContext.Provider>}
    </Popover>
  );
}

interface MenuItemBaseProps {
  readonly onSelect?: () => void;
  readonly icon?: React.ReactNode;
  readonly shortcut?: React.ReactNode;
  readonly disabled?: boolean;
  /** Keep the menu open after selection (e.g. multi-select checkboxes). */
  readonly keepOpen?: boolean;
  readonly destructive?: boolean;
  readonly title?: string;
  readonly children: React.ReactNode;
}

function MenuRow({
  role,
  checked,
  onSelect,
  icon,
  shortcut,
  disabled,
  keepOpen,
  destructive,
  title,
  children,
}: MenuItemBaseProps & {
  readonly role: "menuitem" | "menuitemradio" | "menuitemcheckbox";
  readonly checked?: boolean;
}): React.ReactElement {
  const close = useContext(MenuCloseContext);
  const select = (): void => {
    if (disabled) return;
    onSelect?.();
    if (!keepOpen) close();
  };
  const showCheck = role !== "menuitem";
  return (
    <div
      role={role}
      tabIndex={-1}
      title={title}
      aria-checked={showCheck ? Boolean(checked) : undefined}
      aria-disabled={disabled || undefined}
      onClick={select}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          select();
        }
      }}
      className={cx(
        "flex min-h-7 cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm outline-none select-none",
        "hover:bg-accent-fill hover:text-on-accent focus:bg-accent-fill focus:text-on-accent",
        destructive ? "text-danger" : "text-label",
        disabled && "pointer-events-none opacity-40",
      )}
    >
      {showCheck && (
        <span className="inline-flex w-3 shrink-0 justify-center" aria-hidden="true">
          {checked && (
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path d="M1.5 5.2 4 7.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
      )}
      {icon && <span className="shrink-0 opacity-80">{icon}</span>}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {shortcut && <span className="shrink-0 text-xs opacity-60">{shortcut}</span>}
    </div>
  );
}

export function MenuItem(props: MenuItemBaseProps): React.ReactElement {
  return <MenuRow role="menuitem" {...props} />;
}

export function MenuItemRadio(props: MenuItemBaseProps & { readonly checked: boolean }): React.ReactElement {
  return <MenuRow role="menuitemradio" {...props} />;
}

export function MenuItemCheckbox(props: MenuItemBaseProps & { readonly checked: boolean }): React.ReactElement {
  return <MenuRow role="menuitemcheckbox" keepOpen {...props} />;
}

export function MenuSeparator(): React.ReactElement {
  return <div role="separator" className="mx-2 my-1 h-px bg-separator" />;
}

export function MenuSectionLabel({ children }: { readonly children: React.ReactNode }): React.ReactElement {
  return (
    <div role="presentation" className="px-2 pt-2 pb-1 text-caption font-semibold text-label-secondary">
      {children}
    </div>
  );
}

