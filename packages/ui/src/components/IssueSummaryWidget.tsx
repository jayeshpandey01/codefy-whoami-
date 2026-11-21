import React from "react";
import type { Finding } from "@whoami/types";
import { AlertTriangleIcon } from "./Icons.js";

export interface IssueSummaryWidgetProps {
  findings: readonly Finding[];
  metrics?: {
    sla_breached_count?: number;
    verified_issues?: number;
    risk_accepted_issues?: number;
  } | null;
}

export function IssueSummaryWidget({
  findings,
  metrics,
}: IssueSummaryWidgetProps): React.ReactElement {
  const counts = {
    total: findings.length,
    critical: findings.filter((f) => f.severity === "critical").length,
    high: findings.filter((f) => f.severity === "high").length,
    medium: findings.filter((f) => f.severity === "medium").length,
  };

  const slaBreached = metrics?.sla_breached_count ?? 0;

  return (
    <div className="flex flex-col gap-1.5 p-2 font-sans select-none">
      <div className="grid grid-cols-4 gap-1.5">
        {/* Total Tile */}
        <div className="flex flex-col items-center justify-center rounded border border-[#30363D] bg-[#161B22] py-2 px-1 text-center shadow-sm">
          <span className="text-base font-bold text-[#E6EDF3] leading-none">
            {counts.total}
          </span>
          <span className="text-caption font-medium text-[#8B949E] mt-1 leading-tight">
            Total Findings
          </span>
        </div>

        {/* Critical Tile */}
        <div className="flex flex-col items-center justify-center rounded border border-[#F85149]/40 bg-[#F85149]/10 py-2 px-1 text-center shadow-sm">
          <span className="text-base font-bold text-[#F85149] leading-none">
            {counts.critical}
          </span>
          <span className="text-caption font-semibold text-[#F85149] mt-1 leading-tight">
            Critical
          </span>
        </div>

        {/* High Tile */}
        <div className="flex flex-col items-center justify-center rounded border border-[#F0883E]/40 bg-[#F0883E]/10 py-2 px-1 text-center shadow-sm">
          <span className="text-base font-bold text-[#F0883E] leading-none">
            {counts.high}
          </span>
          <span className="text-caption font-semibold text-[#F0883E] mt-1 leading-tight">
            High
          </span>
        </div>

        {/* Medium Tile */}
        <div className="flex flex-col items-center justify-center rounded border border-[#D29922]/40 bg-[#D29922]/10 py-2 px-1 text-center shadow-sm">
          <span className="text-base font-bold text-[#D29922] leading-none">
            {counts.medium}
          </span>
          <span className="text-caption font-semibold text-[#D29922] mt-1 leading-tight">
            Medium
          </span>
        </div>
      </div>

      {slaBreached > 0 && (
        <div className="flex items-center justify-between rounded border border-[#F85149]/40 bg-[#F85149]/15 px-2.5 py-1 text-xs text-[#F85149]">
          <span className="font-semibold text-caption tracking-wider uppercase inline-flex items-center gap-1">
            <AlertTriangleIcon size={12} />
            SLA Policy Breach
          </span>
          <span className="font-mono font-bold text-caption">
            {slaBreached} {slaBreached === 1 ? "Issue" : "Issues"}
          </span>
        </div>
      )}
    </div>
  );
}
