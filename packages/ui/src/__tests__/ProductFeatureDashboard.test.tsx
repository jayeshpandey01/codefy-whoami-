import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  ProductFeatureDashboard,
  INITIAL_FEATURES,
} from "../components/ProductFeatureDashboard";

describe("ProductFeatureDashboard", () => {
  it("renders header, aggregate statistics, and initial feature cards", () => {
    render(<ProductFeatureDashboard />);

    expect(screen.getByTestId("product-feature-dashboard")).toBeDefined();
    expect(screen.getByText("Codefy Features")).toBeDefined();
    expect(screen.getByText("Apple Liquid Glass")).toBeDefined();
    expect(screen.getByText("Fleet Coverage")).toBeDefined();
    expect(screen.getByText("Unified SAST Multi-Engine Scanner")).toBeDefined();
    expect(screen.getByText("Interactive Attack Surface & Blast Radius")).toBeDefined();
  });

  it("filters features when a category tab is clicked", () => {
    render(<ProductFeatureDashboard />);

    const dastTab = screen.getByRole("button", { name: "DAST Fuzzing" });
    fireEvent.click(dastTab);

    expect(screen.getByText("DAST Dynamic Gateway Interceptor")).toBeDefined();
    expect(screen.queryByText("Unified SAST Multi-Engine Scanner")).toBeNull();
  });

  it("filters features in real time when searching", () => {
    render(<ProductFeatureDashboard />);

    const searchInput = screen.getByPlaceholderText("Search capabilities, engines...");
    fireEvent.change(searchInput, { target: { value: "Blast Radius" } });

    expect(screen.getByText("Interactive Attack Surface & Blast Radius")).toBeDefined();
    expect(screen.queryByText("Unified SAST Multi-Engine Scanner")).toBeNull();
  });

  it("toggles optical refraction mode and theme", () => {
    render(<ProductFeatureDashboard />);

    const refractionBtn = screen.getByTitle("Toggle real optical rim refraction");
    expect(refractionBtn.textContent).toContain("Optical Refraction: ON");

    fireEvent.click(refractionBtn);
    expect(refractionBtn.textContent).toContain("Standard Blur");

    const themeBtn = screen.getByLabelText("Toggle Light / Dark mode");
    expect(themeBtn.textContent).toContain("Dark Glass");

    fireEvent.click(themeBtn);
    expect(themeBtn.textContent).toContain("Light Glass");
    expect(screen.getByTestId("product-feature-dashboard").getAttribute("data-theme")).toBe("light");
  });

  it("opens feature detail modal on card click and allows closing", () => {
    const handleSelect = vi.fn();
    render(<ProductFeatureDashboard onFeatureSelect={handleSelect} />);

    const sastCard = screen.getByText("Unified SAST Multi-Engine Scanner");
    fireEvent.click(sastCard);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getAllByRole("heading", { name: "Unified SAST Multi-Engine Scanner" }).length).toBeGreaterThan(0);
    expect(screen.getByText("Engine Architecture & Subsystems")).toBeDefined();

    const closeBtn = screen.getByLabelText("Close feature details");
    fireEvent.click(closeBtn);

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("updates rollout percentage dynamically in modal", () => {
    render(<ProductFeatureDashboard />);

    fireEvent.click(screen.getByText("Unified SAST Multi-Engine Scanner"));
    const slider = screen.getByRole("slider");

    fireEvent.change(slider, { target: { value: "75" } });
    expect(screen.getByText("75% fleet deployment")).toBeDefined();
  });
});
