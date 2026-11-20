import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { DastStreamFindingData, DastStreamLogData, DastStreamStatusData, ScanRead, ScanResultRead } from "@whoami/types";
import { RemoteScanPanel, generateDastSarif } from "../components/RemoteScanPanel.js";

afterEach(cleanup);

describe("RemoteScanPanel", () => {
  it("renders target inputs and profile selector", () => {
    render(<RemoteScanPanel />);

    expect(screen.getByText("Authorized Scan Orchestrator")).toBeTruthy();
    expect(screen.getByPlaceholderText("example.com")).toBeTruthy();
    expect(screen.getByPlaceholderText("SEC-AUTH-2026")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Launch Authorized Scan" })).toBeTruthy();
  });

  it("switches between SAST and DAST profile categories", () => {
    render(<RemoteScanPanel />);

    const dastCategoryBtn = screen.getByRole("button", { name: "Network & Web (DAST)" });
    fireEvent.click(dastCategoryBtn);

    expect(screen.getByText("Fast Recon")).toBeTruthy();
    expect(screen.getByText("Full Network Scan")).toBeTruthy();
  });

  it("renders real-time SSE stream telemetry (running tool name and progress percentage)", () => {
    const mockScan: ScanRead = {
      id: "scan-job-123",
      target_id: "tgt-1",
      profile: "vuln-assessment",
      status: "running",
      controller_job_id: "dast-job-123",
      failure_reason: null,
      created_at: new Date().toISOString(),
    };

    render(
      <RemoteScanPanel
        streamTelemetry={{
          currentTool: "nuclei",
          progressPercent: 45,
          status: "running",
        }}
      />,
    );

    // Shows Live Telemetry Stream with active tool and percentage
    expect(screen.getByText("Live Telemetry Stream")).toBeTruthy();
    expect(screen.getByText("Tool: nuclei")).toBeTruthy();
    expect(screen.getByText("45%")).toBeTruthy();

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar.getAttribute("aria-valuenow")).toBe("45");
  });

  it("dynamically updates stream telemetry via window message events", () => {
    const handleStatus = vi.fn();
    const handleFinding = vi.fn();

    render(
      <RemoteScanPanel
        onStreamStatus={handleStatus}
        onStreamFinding={handleFinding}
      />,
    );

    // Simulate window message for dast-stream-status
    const statusMsg: DastStreamStatusData = {
      job_id: "job-999",
      status: "running",
      progress_percent: 65,
      current_tool: "dalfox",
    };
    fireEvent(window, new MessageEvent("message", {
      data: {
        type: "dast-stream-status",
        data: statusMsg,
      },
    }));

    expect(handleStatus).toHaveBeenCalledWith(statusMsg);
    expect(screen.getByText("Tool: dalfox")).toBeTruthy();
    expect(screen.getByText("65%")).toBeTruthy();

    // Simulate window message for dast-stream-finding
    const findingMsg: DastStreamFindingData = {
      tool_name: "dalfox",
      title: "Reflected XSS in search parameter",
      severity: "HIGH",
      target_url: "https://example.com/search?q=1",
      cwe_id: "CWE-79",
    };
    fireEvent(window, new MessageEvent("message", {
      data: {
        type: "dast-stream-finding",
        data: findingMsg,
      },
    }));

    expect(handleFinding).toHaveBeenCalledWith(findingMsg);
    expect(screen.getByText("Reflected XSS in search parameter")).toBeTruthy();
    expect(screen.getByText("CWE-79")).toBeTruthy();
  });

  it("renders SARIF export button and invokes onExportSarif and onSaveFile when clicked", async () => {
    const handleExportSarif = vi.fn().mockResolvedValue({
      $schema: "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
      version: "2.1.0",
      runs: [],
    });
    const handleSaveFile = vi.fn().mockResolvedValue(true);

    const mockScan: ScanRead = {
      id: "scan-job-456",
      target_id: "tgt-1",
      profile: "recon",
      status: "completed",
      controller_job_id: "dast-job-456",
      failure_reason: null,
      created_at: new Date().toISOString(),
    };

    const mockResult: ScanResultRead = {
      id: "scan-job-456",
      scan_job_id: "scan-job-456",
      summary: {
        total_findings: 1,
        risk_summary: { critical: 1, high: 0, medium: 0, low: 0, info: 0 },
        findings: [
          {
            title: "Dangerous CORS Misconfiguration",
            severity: "critical",
            cwe: "CWE-942",
            host: "https://example.com",
            description: "Arbitrary origin reflection with credentials",
          },
        ],
      },
      created_at: new Date().toISOString(),
      artifact: null,
      error_logs: null,
    };

    const handlePollScan = vi.fn().mockResolvedValue({
      scan: mockScan,
      result: mockResult,
    });

    render(
      <RemoteScanPanel
        onPollScan={handlePollScan}
        onExportSarif={handleExportSarif}
        onSaveFile={handleSaveFile}
      />,
    );

    // Launch scan to trigger result display
    const scanBtn = screen.getByRole("button", { name: "Launch Authorized Scan" });
    fireEvent.click(scanBtn);

    // Wait for completed scan result
    await vi.waitFor(() => {
      expect(screen.getByRole("button", { name: "Export SARIF" })).toBeTruthy();
    });

    const exportBtn = screen.getByRole("button", { name: "Export SARIF" });
    fireEvent.click(exportBtn);

    await vi.waitFor(() => {
      expect(handleExportSarif).toHaveBeenCalledWith("scan-job-456");
      expect(handleSaveFile).toHaveBeenCalledWith(
        "whoami-dast-scan-job-456.sarif",
        expect.stringContaining('"version": "2.1.0"'),
        "utf-8",
        "application/sarif+json",
      );
    });
  });
});

describe("generateDastSarif", () => {
  it("generates a valid SARIF v2.1.0 report with driver, rules, and results", () => {
    const mockScan: ScanRead = {
      id: "scan-test-1",
      target_id: "example.com",
      profile: "nuclei",
      status: "completed",
      controller_job_id: "controller-1",
      failure_reason: null,
      created_at: new Date().toISOString(),
    };

    const mockResult: ScanResultRead = {
      id: "scan-test-1",
      scan_job_id: "scan-test-1",
      summary: {
        total_findings: 1,
        findings: [
          {
            title: "Exposed Environment File",
            severity: "high",
            cwe: "CWE-552",
            host: "https://example.com/.env",
            description: "Found exposed .env configuration file",
            remediation: "Block external HTTP access to dotfiles",
          },
        ],
      },
      created_at: new Date().toISOString(),
      artifact: null,
      error_logs: null,
    };

    const streamFindings: DastStreamFindingData[] = [
      {
        tool_name: "katana",
        title: "Sensitive API route discovered",
        severity: "medium",
        cwe_id: "CWE-200",
        target_url: "https://example.com/api/internal",
      },
    ];

    const sarif = generateDastSarif(mockScan, mockResult, streamFindings) as {
      $schema: string;
      version: string;
      runs: Array<{
        tool: { driver: { name: string; version: string; rules: unknown[] } };
        results: Array<{ ruleId: string; level: string; message: { text: string } }>;
      }>;
    };

    expect(sarif.version).toBe("2.1.0");
    expect(sarif.$schema).toContain("sarif-schema-2.1.0.json");
    expect(sarif.runs[0]!.tool.driver.name).toBe("WhoAmI DAST Orchestrator");
    expect(sarif.runs[0]!.results.length).toBe(2);

    const nucleiFinding = sarif.runs[0]!.results[0]!;
    expect(nucleiFinding.level).toBe("error"); // high -> error
    expect(nucleiFinding.message.text).toContain("Found exposed .env");

    const katanaFinding = sarif.runs[0]!.results[1]!;
    expect(katanaFinding.level).toBe("warning"); // medium -> warning
    expect(katanaFinding.message.text).toBe("Sensitive API route discovered");
  });
});
