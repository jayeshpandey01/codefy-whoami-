import type { ReactElement } from "react";
import type { Severity } from "@whoami/types";
import { SeverityPill } from "../primitives/Badge.js";

export interface SeverityBadgeProps {
  readonly severity: Severity;
}

/** Severity label with its shape (◆ ▲ ● ○), so it never relies on colour alone. */
export function SeverityBadge({ severity }: SeverityBadgeProps): ReactElement {
  return <SeverityPill severity={severity} />;
}
