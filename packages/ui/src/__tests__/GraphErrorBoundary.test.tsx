import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GraphErrorBoundary } from "../visualization/GraphErrorBoundary.js";

function CrashyComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Simulated canvas transform explosion");
  }
  return <div>Canvas Content Operational</div>;
}

describe("GraphErrorBoundary", () => {
  it("renders children normally when no error occurs", () => {
    render(
      <GraphErrorBoundary>
        <div>Normal Graph View</div>
      </GraphErrorBoundary>,
    );
    expect(screen.getByText("Normal Graph View")).toBeTruthy();
  });

  it("catches runtime errors and renders resilient recovery card with reset button", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const handleReset = vi.fn();

    const { rerender } = render(
      <GraphErrorBoundary onReset={handleReset}>
        <CrashyComponent shouldThrow={true} />
      </GraphErrorBoundary>,
    );

    expect(screen.getByText("Graph Visualization Recovered")).toBeTruthy();
    expect(screen.getByText("Simulated canvas transform explosion")).toBeTruthy();

    const resetBtn = screen.getByRole("button", { name: /reset viewport/i });
    expect(resetBtn).toBeTruthy();

    // Fix the component first, then trigger reset button
    rerender(
      <GraphErrorBoundary onReset={handleReset}>
        <CrashyComponent shouldThrow={false} />
      </GraphErrorBoundary>,
    );

    // Clicking reset clears error state and allows recovered children to render
    fireEvent.click(resetBtn);
    expect(handleReset).toHaveBeenCalledTimes(1);

    expect(screen.getByText("Canvas Content Operational")).toBeTruthy();

    consoleSpy.mockRestore();
  });
});
