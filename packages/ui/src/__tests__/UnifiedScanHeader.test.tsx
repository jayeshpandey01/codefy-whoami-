import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { UnifiedScanHeader } from "../components/UnifiedScanHeader.js";

afterEach(cleanup);

describe("UnifiedScanHeader", () => {
  it("renders Local Scan mode controls by default", () => {
    render(<UnifiedScanHeader scanMode="local" />);

    expect(screen.getByText("Directory:")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Scan Folder" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "All Flows" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Selected Flow" })).toBeTruthy();
  });

  it("triggers onScanLocal with the selected folder path", () => {
    const handleScanLocal = vi.fn();
    render(
      <UnifiedScanHeader
        scanMode="local"
        currentFolderPath="/mock/project/path"
        onScanLocal={handleScanLocal}
      />,
    );

    const scanBtn = screen.getByRole("button", { name: "Scan Folder" });
    fireEvent.click(scanBtn);

    expect(handleScanLocal).toHaveBeenCalledTimes(1);
    expect(handleScanLocal).toHaveBeenCalledWith("/mock/project/path");
  });

  it("allows browsing for a folder and populating the directory input", async () => {
    const handleBrowseFolder = vi.fn().mockResolvedValue("/chosen/directory/path");
    const handleScanLocal = vi.fn();
    const handleFolderChange = vi.fn();

    render(
      <UnifiedScanHeader
        scanMode="local"
        onBrowseFolder={handleBrowseFolder}
        onFolderChange={handleFolderChange}
        onScanLocal={handleScanLocal}
      />,
    );

    const browseBtn = screen.getByRole("button", { name: "Browse folder" });
    fireEvent.click(browseBtn);

    expect(handleBrowseFolder).toHaveBeenCalledTimes(1);

    // Wait for promise resolution and input update
    await vi.waitFor(() => {
      expect(handleFolderChange).toHaveBeenCalledWith("/chosen/directory/path");
      const input = screen.getByPlaceholderText("Workspace folder…") as HTMLInputElement;
      expect(input.value).toBe("/chosen/directory/path");
    });

    // Now click Scan Folder
    const scanBtn = screen.getByRole("button", { name: "Scan Folder" });
    fireEvent.click(scanBtn);

    expect(handleScanLocal).toHaveBeenCalledTimes(1);
    expect(handleScanLocal).toHaveBeenCalledWith("/chosen/directory/path");
  });

  it("renders Orchestrator Scan mode controls when scanMode is orchestrator", () => {
    render(<UnifiedScanHeader scanMode="orchestrator" />);

    expect(screen.getByText("Target:")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Scan Target" })).toBeTruthy();
  });

  it("allows selecting multiple tasks via checkboxes in Orchestrator mode", () => {
    const handleScanOrchestrator = vi.fn();
    render(
      <UnifiedScanHeader
        scanMode="orchestrator"
        onScanOrchestrator={handleScanOrchestrator}
      />,
    );

    // Open task dropdown
    const taskDropdownBtn = screen.getByText(/Tasks Active/);
    fireEvent.click(taskDropdownBtn);

    // Check that tasks are displayed with checkboxes
    expect(screen.getByText("Scan Task Profiles")).toBeTruthy();
    expect(screen.getByText("Fast Recon")).toBeTruthy();
    expect(screen.getByText("Full Network Scan")).toBeTruthy();

    // Toggle a task
    fireEvent.click(screen.getByText("Full Network Scan"));

    // Run orchestrator scan
    const runBtn = screen.getByRole("button", { name: "Scan Target" });
    expect(runBtn.hasAttribute("disabled")).toBe(false);
    fireEvent.click(runBtn);

    expect(handleScanOrchestrator).toHaveBeenCalledTimes(1);
    expect(handleScanOrchestrator).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.any(String),
        profiles: expect.arrayContaining([expect.stringMatching(/network-portscan|nmap/)]),
      }),
    );
    expect(screen.queryByLabelText("Authorization reference")).toBeNull();
    expect(screen.queryByLabelText("I am authorized to assess this target")).toBeNull();
  });

  it("triggers onAnalysisPipelineModeChange when switching between Bugs and Full Codebase view", () => {
    const handlePipelineChange = vi.fn();
    render(
      <UnifiedScanHeader
        analysisPipelineMode="bugs"
        onAnalysisPipelineModeChange={handlePipelineChange}
      />,
    );

    const fullCodeBtn = screen.getByTitle("Full Codebase Architecture & Unified Pipeline");
    fireEvent.click(fullCodeBtn);

    expect(handlePipelineChange).toHaveBeenCalledWith("full");

    const bugsBtn = screen.getByTitle("Bugs & Vulnerability Analysis Pipeline (Focus View)");
    fireEvent.click(bugsBtn);

    expect(handlePipelineChange).toHaveBeenCalledWith("bugs");
  });

  it("renders pause icon and updates title when local scan is in progress", () => {
    render(<UnifiedScanHeader scanMode="local" isLocalScanning={true} />);
    const scanBtn = screen.getByRole("button", { name: "Scan Folder" });
    expect(scanBtn.getAttribute("title")).toContain("Pause");
  });

  it("renders pause icon and updates title when orchestrator scan is in progress", () => {
    render(<UnifiedScanHeader scanMode="orchestrator" isOrchestratorScanning={true} />);
    const scanBtn = screen.getByRole("button", { name: "Scan Target" });
    expect(scanBtn.getAttribute("title")).toContain("Pause");
  });

  it("opens Whole Code architecture dropdown and selects a diagram", () => {
    const handleSelectGraph = vi.fn();
    const handlePipelineChange = vi.fn();
    render(
      <UnifiedScanHeader
        activeGraph="graph"
        analysisPipelineMode="bugs"
        onSelectGraph={handleSelectGraph}
        onAnalysisPipelineModeChange={handlePipelineChange}
      />,
    );

    const wholeCodeBtn = screen.getByTitle("Full Codebase Architecture & Unified Pipeline");
    fireEvent.click(wholeCodeBtn);

    // Verify Whole Code architecture options appear
    expect(screen.getByText("Whole Code Architecture Diagrams")).toBeTruthy();
    expect(screen.getByText("Control Flow & Decision Gates")).toBeTruthy();

    // Select an architecture diagram
    fireEvent.click(screen.getByText("Control Flow & Decision Gates"));

    expect(handlePipelineChange).toHaveBeenCalledWith("full");
    expect(handleSelectGraph).toHaveBeenCalledWith("control_flow");
  });

  it("renders Left Sidebar toggle button and triggers callback", () => {
    const handleToggleLeft = vi.fn();
    render(
      <UnifiedScanHeader
        onToggleLeftSidebar={handleToggleLeft}
        isLeftSidebarOpen={false}
      />,
    );

    const toggleBtn = screen.getByRole("button", { name: "Show Primary Side Bar" });
    expect(toggleBtn).toBeTruthy();

    fireEvent.click(toggleBtn);
    expect(handleToggleLeft).toHaveBeenCalledTimes(1);
  });

  it("renders Right Section toggle button and triggers callback", () => {
    const handleToggleRight = vi.fn();
    render(
      <UnifiedScanHeader
        onToggleRightSection={handleToggleRight}
        isRightSectionOpen={false}
      />,
    );

    const toggleBtn = screen.getByRole("button", { name: "Show Right Section" });
    expect(toggleBtn).toBeTruthy();

    fireEvent.click(toggleBtn);
    expect(handleToggleRight).toHaveBeenCalledTimes(1);
  });

  it("renders Cloud SAST mode controls when scanMode is cloud-sast", () => {
    const handleScanCloudSast = vi.fn();
    render(
      <UnifiedScanHeader
        scanMode="cloud-sast"
        currentFolderPath="/mock/cloud-project"
        onScanCloudSast={handleScanCloudSast}
      />,
    );

    expect(screen.getByText("Directory:")).toBeTruthy();
    expect(screen.getByText("3 SAST Active")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Scan Cloud SAST" })).toBeTruthy();

    // Trigger Cloud SAST
    const sastBtn = screen.getByRole("button", { name: "Scan Cloud SAST" });
    expect(sastBtn.hasAttribute("disabled")).toBe(false);
    fireEvent.click(sastBtn);

    expect(handleScanCloudSast).toHaveBeenCalledTimes(1);
    expect(handleScanCloudSast).toHaveBeenCalledWith({
      folderPath: "/mock/cloud-project",
      profiles: ["sast-joern", "sast-semgrep", "sast-trufflehog"],
      ruleTags: undefined,
    });
  });

  it("renders Search button and triggers onOpenSearch callback", () => {
    const handleOpenSearch = vi.fn();
    render(
      <UnifiedScanHeader
        onOpenSearch={handleOpenSearch}
      />,
    );

    const searchBtn = screen.getByRole("button", { name: "Search files, folders, and issues" });
    expect(searchBtn).toBeTruthy();

    fireEvent.click(searchBtn);
    expect(handleOpenSearch).toHaveBeenCalledTimes(1);
  });

  it("renders SAST engines dropdown with fixed scrollable height and All/Clear actions", () => {
    render(
      <UnifiedScanHeader
        scanMode="cloud-sast"
        currentFolderPath="/mock/cloud-project"
      />,
    );

    // Open SAST dropdown
    const sastDropdownBtn = screen.getByText(/SAST Active/);
    fireEvent.click(sastDropdownBtn);

    expect(screen.getByText("Cloud SAST Engines")).toBeTruthy();
    expect(screen.getByText("Semgrep AST Rules")).toBeTruthy();

    // Verify container has fixed height and overflow-y-auto class
    const scrollContainer = screen.getByText("Semgrep AST Rules").closest(".overflow-y-auto");
    expect(scrollContainer).toBeTruthy();
    expect(scrollContainer?.className).toContain("max-h-56");
    expect(scrollContainer?.className).toContain("overflow-y-auto");

    // Test All and Clear buttons
    const clearBtn = screen.getByRole("button", { name: "Clear" });
    fireEvent.click(clearBtn);
    expect(screen.getByText("0 SAST Active")).toBeTruthy();

    const allBtn = screen.getByRole("button", { name: "All" });
    fireEvent.click(allBtn);
    expect(screen.getByText(/SAST Active/)).toBeTruthy();
  });

  it("ticks exactly the default SAST engines the trigger counts", () => {
    render(
      <UnifiedScanHeader
        scanMode="cloud-sast"
        currentFolderPath="/mock/cloud-project"
      />,
    );
    fireEvent.click(screen.getByText(/SAST Active/));

    const checked = screen
      .getAllByRole("checkbox")
      .filter((el) => (el as HTMLInputElement).checked);
    expect(checked).toHaveLength(3);
    const isChecked = (name: string): boolean =>
      (screen.getByText(name).closest("label")?.querySelector("input") as HTMLInputElement)
        .checked;
    expect(isChecked("Semgrep AST Rules")).toBe(true);
    expect(isChecked("Joern CPG Taint Scan")).toBe(true);
  });

  it("displays Running (1/3) instead of tool name during SAST scan and has tool name in title", () => {
    render(
      <UnifiedScanHeader
        scanMode="cloud-sast"
        isCloudSastScanning={true}
        cloudSastProgress={{
          currentTask: "Running sast-joern…",
          completed: 1,
          total: 3,
        }}
      />,
    );

    // It should display 'Running (1/3)' and NOT 'Running sast-joern…'
    expect(screen.getByText("Running (1/3)")).toBeTruthy();
    expect(screen.queryByText("Running sast-joern…")).toBeNull();

    // The tool name should still be accessible via title attribute for tooltip
    const progressEl = screen.getByText("Running (1/3)");
    expect(progressEl.getAttribute("title")).toBe("Running sast-joern…");
  });

  it("displays Running (1/3) instead of tool name during DAST scan and has tool name in title", () => {
    render(
      <UnifiedScanHeader
        scanMode="orchestrator"
        isOrchestratorScanning={true}
        orchestratorProgress={{
          currentTask: "Running recon…",
          completed: 1,
          total: 3,
        }}
      />,
    );

    // It should display 'Running (1/3)' and NOT 'Running recon… (1/3)'
    expect(screen.getByText("Running (1/3)")).toBeTruthy();
    expect(screen.queryByText("Running recon… (1/3)")).toBeNull();

    // The tool name should still be accessible via title attribute for tooltip
    const progressEl = screen.getByText("Running (1/3)");
    expect(progressEl.getAttribute("title")).toBe("Running recon…");
  });

  it("isolates wheel events in DAST dropdown so it does not auto-close", () => {
    render(<UnifiedScanHeader scanMode="orchestrator" />);

    // Open DAST task dropdown
    const taskDropdownBtn = screen.getByText(/Tasks Active/);
    fireEvent.click(taskDropdownBtn);

    expect(screen.getByText("Scan Task Profiles")).toBeTruthy();
    const scrollContainer = screen.getByText("Fast Recon").closest(".overflow-y-auto") as HTMLElement;
    expect(scrollContainer).toBeTruthy();

    // Fire wheel event inside the scrollable container
    fireEvent.wheel(scrollContainer, { deltaY: 50 });

    // The dropdown should stay open
    expect(screen.getByText("Scan Task Profiles")).toBeTruthy();
  });

  it("displays Safe indicator badge when target is safe (SSRF preflight passes)", () => {
    render(<UnifiedScanHeader scanMode="orchestrator" defaultTarget="scanme.nmap.org" />);

    expect(screen.getByLabelText("Target Safe")).toBeTruthy();
    expect(screen.getByText("Safe")).toBeTruthy();

    const scanBtn = screen.getByRole("button", { name: "Scan Target" });
    expect(scanBtn.hasAttribute("disabled")).toBe(false);
  });

  it("displays Blocked indicator badge and disables scan when target resolves to loopback/private/metadata (SSRF guardrail)", () => {
    render(<UnifiedScanHeader scanMode="orchestrator" defaultTarget="127.0.0.1" />);

    expect(screen.getByLabelText("Target Unsafe")).toBeTruthy();
    expect(screen.getByText("Blocked")).toBeTruthy();

    const scanBtn = screen.getByRole("button", { name: "Scan Target" });
    expect(scanBtn.hasAttribute("disabled")).toBe(true);
  });

  it("dynamically updates SSRF preflight feedback when target input changes", () => {
    render(<UnifiedScanHeader scanMode="orchestrator" defaultTarget="example.com" />);

    expect(screen.getByLabelText("Target Safe")).toBeTruthy();

    const targetInput = screen.getByPlaceholderText("Host or IP (e.g. example.com)");
    fireEvent.change(targetInput, { target: { value: "169.254.169.254" } });

    expect(screen.getByLabelText("Target Unsafe")).toBeTruthy();
    expect(screen.getByText("Blocked")).toBeTruthy();

    const scanBtn = screen.getByRole("button", { name: "Scan Target" });
    expect(scanBtn.hasAttribute("disabled")).toBe(true);
  });

  it("allows selecting all 30 DAST engines using the 'All' button", () => {
    render(<UnifiedScanHeader scanMode="orchestrator" />);

    const taskDropdownBtn = screen.getByText(/Tasks Active/);
    fireEvent.click(taskDropdownBtn);

    const allBtn = screen.getByRole("button", { name: "All" });
    fireEvent.click(allBtn);

    expect(screen.getByText("30 Tasks Active")).toBeTruthy();
  });

  it("allows selecting Passive (15) and Active (15) DAST engine groups", () => {
    render(<UnifiedScanHeader scanMode="orchestrator" />);

    const taskDropdownBtn = screen.getByText(/Tasks Active/);
    fireEvent.click(taskDropdownBtn);

    const passiveBtn = screen.getByRole("button", { name: "Passive" });
    fireEvent.click(passiveBtn);
    expect(screen.getByText("15 Tasks Active")).toBeTruthy();

    const activeBtn = screen.getByRole("button", { name: "Active" });
    fireEvent.click(activeBtn);
    expect(screen.getByText("15 Tasks Active")).toBeTruthy();
  });
});
