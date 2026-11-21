import { describe, expect, it } from "vitest";
import {
  GRAPH_MIN_ZOOM,
  GRAPH_MAX_ZOOM,
  GRAPH_DEFAULT_ZOOM,
  LOD_COMPACT_ZOOM_THRESHOLD,
  LOD_LOW_ENTER_THRESHOLD,
  LOD_LOW_EXIT_THRESHOLD,
  GRAPH_DEFAULT_FIT_VIEW_OPTIONS,
  formatZoomPercentage,
  clampZoom,
} from "../visualization/zoom-config.js";

describe("zoom-config", () => {
  it("defines bounded safe zoom limits preventing GPU stall and memory overload", () => {
    expect(GRAPH_MIN_ZOOM).toBe(0.15);
    expect(GRAPH_MAX_ZOOM).toBe(4.0);
    expect(GRAPH_DEFAULT_ZOOM).toBe(0.30);
    expect(LOD_COMPACT_ZOOM_THRESHOLD).toBe(0.45);
    expect(LOD_LOW_ENTER_THRESHOLD).toBe(0.38);
    expect(LOD_LOW_EXIT_THRESHOLD).toBe(0.46);
    expect(GRAPH_MIN_ZOOM).toBeLessThan(0.5); // Still provides wide overview beyond React Flow default
    expect(GRAPH_MAX_ZOOM).toBeGreaterThan(2.0); // 2x deeper zoom-in than React Flow default
  });

  it("configures fitViewOptions with safe minZoom and default 30% overview maxZoom", () => {
    expect(GRAPH_DEFAULT_FIT_VIEW_OPTIONS.minZoom).toBe(0.15);
    expect(GRAPH_DEFAULT_FIT_VIEW_OPTIONS.maxZoom).toBe(0.30);
    expect(GRAPH_DEFAULT_FIT_VIEW_OPTIONS.padding).toBe(0.15);
  });

  it("formats decimal zoom values to human-readable percentages", () => {
    expect(formatZoomPercentage(1.0)).toBe("100%");
    expect(formatZoomPercentage(0.45)).toBe("45%");
    expect(formatZoomPercentage(2.5)).toBe("250%");
    expect(formatZoomPercentage(0.15)).toBe("15%");
    expect(formatZoomPercentage(4.0)).toBe("400%");
    expect(formatZoomPercentage(NaN)).toBe("100%");
    expect(formatZoomPercentage(-1)).toBe("100%");
  });

  it("clamps zoom within boundaries", () => {
    expect(clampZoom(0.01)).toBe(0.15);
    expect(clampZoom(5.0)).toBe(4.0);
    expect(clampZoom(1.0)).toBe(1.0);
    expect(clampZoom(0.85)).toBe(0.85);
  });
});
