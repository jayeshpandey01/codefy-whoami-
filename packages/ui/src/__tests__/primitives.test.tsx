import React, { useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  Button,
  Callout,
  Dialog,
  IconButton,
  Menu,
  MenuItem,
  MenuItemRadio,
  SearchField,
  SegmentedControl,
  SeverityPill,
  Switch,
  Tabs,
  TextField,
} from "../primitives/index.js";

function DialogHarness({ onClose }: { readonly onClose?: () => void }): React.ReactElement {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <Dialog
        open={open}
        title="Delete session"
        onClose={() => {
          onClose?.();
          setOpen(false);
        }}
        footer={
          <>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="destructive">Delete</Button>
          </>
        }
      >
        <p>This can’t be undone.</p>
      </Dialog>
    </>
  );
}

describe("Dialog", () => {
  it("is labelled by its title, focuses inside, traps Tab and restores focus", () => {
    render(<DialogHarness />);
    const opener = screen.getByRole("button", { name: "Open" });
    opener.focus();
    fireEvent.click(opener);

    const dialog = screen.getByRole("dialog", { name: "Delete session" });
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    const close = screen.getByRole("button", { name: "Close" });
    expect(document.activeElement).toBe(close);
    expect(document.body.style.overflow).toBe("hidden");

    // Shift+Tab from the first focusable wraps to the last
    fireEvent.keyDown(close, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Delete" }));

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(opener);
    expect(document.body.style.overflow).toBe("");
  });

  it("closes on a backdrop click but not on a click inside the panel", () => {
    const onClose = vi.fn();
    render(<DialogHarness onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    fireEvent.mouseDown(screen.getByText("This can’t be undone."));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.mouseDown(screen.getByRole("dialog"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes only the topmost of two stacked dialogs on Escape", () => {
    const outer = vi.fn();
    const inner = vi.fn();
    render(
      <>
        <Dialog open title="Outer" onClose={outer} />
        <Dialog open title="Inner" onClose={inner} />
      </>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(inner).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();
  });
});

describe("Menu", () => {
  it("exposes menu semantics, moves focus with arrows, and returns focus on Escape", () => {
    const onSort = vi.fn();
    render(
      <Menu
        label="Group by"
        trigger={(props) => (
          <button type="button" {...props}>
            Group
          </button>
        )}
      >
        <MenuItemRadio checked={false} onSelect={() => onSort("file")}>
          By File
        </MenuItemRadio>
        <MenuItemRadio checked onSelect={() => onSort("severity")}>
          By Severity
        </MenuItemRadio>
        <MenuItem onSelect={() => onSort("export")}>Export…</MenuItem>
      </Menu>,
    );
    const trigger = screen.getByRole("button", { name: "Group" });
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    const items = screen.getAllByRole("menuitemradio");
    expect(document.activeElement).toBe(items[1]); // the checked item
    expect(items[1]!.getAttribute("aria-checked")).toBe("true");

    fireEvent.keyDown(items[1]!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Export…" }));

    fireEvent.keyDown(document.activeElement!, { key: "Enter" });
    expect(onSort).toHaveBeenCalledWith("export");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});

describe("Tabs", () => {
  it("uses roving tabindex and arrow keys", () => {
    const onChange = vi.fn();
    render(
      <Tabs
        label="Finding detail"
        value="flow"
        onChange={onChange}
        items={[
          { value: "flow", label: "Flow" },
          { value: "fix", label: "Remediation" },
        ]}
      />,
    );
    const [flow, fix] = screen.getAllByRole("tab");
    expect(flow!.getAttribute("aria-selected")).toBe("true");
    expect(fix!.tabIndex).toBe(-1);
    fireEvent.keyDown(flow!, { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith("fix");
    expect(document.activeElement).toBe(fix);
  });
});

describe("controls", () => {
  it("SegmentedControl reports pressed state on real buttons", () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl
        label="Scan mode"
        value="local"
        onChange={onChange}
        options={[
          { value: "local", label: "Local" },
          { value: "cloud", label: "Cloud" },
        ]}
      />,
    );
    expect(screen.getByRole("group", { name: "Scan mode" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Local" }).getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Cloud" }));
    expect(onChange).toHaveBeenCalledWith("cloud");
  });

  it("Switch toggles aria-checked", () => {
    function Harness(): React.ReactElement {
      const [on, setOn] = useState(false);
      return <Switch label="Hide test files" checked={on} onChange={setOn} />;
    }
    render(<Harness />);
    const sw = screen.getByRole("switch", { name: "Hide test files" });
    expect(sw.getAttribute("aria-checked")).toBe("false");
    fireEvent.click(sw);
    expect(sw.getAttribute("aria-checked")).toBe("true");
  });

  it("IconButton always has an accessible name", () => {
    render(
      <IconButton label="Close panel">
        <svg aria-hidden="true" />
      </IconButton>,
    );
    expect(screen.getByRole("button", { name: "Close panel" })).toBeTruthy();
  });

  it("TextField ties label, hint and error to the input", () => {
    render(<TextField label="Email" hint="We never share it." error="Enter a valid email." />);
    const input = screen.getByLabelText("Email");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    const describedBy = input.getAttribute("aria-describedby")!;
    expect(document.getElementById(describedBy.split(" ")[0]!)?.textContent).toBe("Enter a valid email.");
  });

  it("SearchField clears with Escape and with its labelled clear button", () => {
    function Harness(): React.ReactElement {
      const [q, setQ] = useState("sqli");
      return <SearchField label="Filter issues" value={q} onChange={setQ} />;
    }
    render(<Harness />);
    const input = screen.getByRole("searchbox", { name: "Filter issues" }) as HTMLInputElement;
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(input.value).toBe("");
    act(() => {
      fireEvent.change(input, { target: { value: "xss" } });
    });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input.value).toBe("");
  });

  it("Callout uses alert for danger and status for info", () => {
    render(
      <>
        <Callout tone="danger" title="Scan failed" />
        <Callout tone="info" title="Update ready" />
      </>,
    );
    expect(screen.getByRole("alert").textContent).toContain("Scan failed");
    expect(screen.getByRole("status").textContent).toContain("Update ready");
  });

  it("SeverityPill shows a text label next to its shape", () => {
    render(<SeverityPill severity="high" />);
    expect(screen.getByText("High")).toBeTruthy();
  });
});
