import { memo, useState, type ReactElement } from "react";
import { Handle, Position, NodeToolbar, type NodeProps } from "@xyflow/react";
import type { TaintNodeData } from "./SourceNode.js";
import {
  BoxIcon,
  FileCodeIcon,
  FolderIcon,
  FunctionIcon,
  RefreshCwIcon,
} from "../../components/Icons.js";
import { NodeInfoCard } from "./NodeInfoCard.js";
import { useGraphLod } from "../useGraphLod.js";

function getNodeRoleDetails(role?: string, type?: string): {
  icon: ReactElement;
  title: string;
} {
  const r = role || type || "";
  switch (r) {
    case "directory":
      return {
        icon: <FolderIcon size={11} className="text-severity-high" />,
        title: "Directory",
      };
    case "file":
      return {
        icon: <FileCodeIcon size={11} className="text-[#4EC9B0]" />,
        title: "Source File",
      };
    case "class":
      return {
        icon: <BoxIcon size={11} className="text-[#4EC9B0]" />,
        title: "Class Definition",
      };
    case "function":
      return {
        icon: <FunctionIcon size={11} className="text-[#DCDCAA]" />,
        title: "Function",
      };
    default:
      return {
        icon: <RefreshCwIcon size={11} className="text-vscode-muted" />,
        title: "Propagation Hop",
      };
  }
}

export const PassthroughNode = memo(function PassthroughNode(props: NodeProps): ReactElement {
  const [isHovered, setIsHovered] = useState(false);
  const { isLowLod } = useGraphLod();
  const data = props.data as TaintNodeData;
  const fileBasename = data.filePath
    ? data.filePath.split(/[/\\]/).pop() || data.filePath
    : "";

  const isDimmed = data.isDimmed;
  const isHighlighted = data.isHighlighted;
  const cleanLabel = (data.label || "").replace(/^[📁🔷\s]+/, "");
  const role = (data.role as string) || props.type;
  const { icon, title } = getNodeRoleDetails(role, props.type);

  if (isLowLod) {
    return (
      <div
        className={[
          "relative w-[230px] rounded border bg-vscode-card px-2 py-1 select-none pointer-events-none flex items-center gap-1.5",
          isHighlighted
            ? "border-severity-medium ring-2 ring-severity-medium"
            : "border-vscode-border",
          isDimmed ? "opacity-35" : "opacity-100",
        ].join(" ")}
      >
        <span className="shrink-0">{icon}</span>
        <div className="truncate text-xs font-mono text-vscode-fg">
          {cleanLabel}
        </div>
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          className="!bg-vscode-dim !w-1 !h-1 !border-none !opacity-0"
        />
        <Handle
          type="target"
          position={Position.Top}
          id="top"
          className="!bg-vscode-dim !w-1 !h-1 !border-none !opacity-0"
        />
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          className="!bg-vscode-dim !w-1 !h-1 !border-none !opacity-0"
        />
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          className="!bg-vscode-dim !w-1 !h-1 !border-none !opacity-0"
        />
      </div>
    );
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={[
        "relative w-[230px] rounded-lg border bg-vscode-card p-2.5 shadow-md transition-colors duration-150 select-none",
        isHighlighted
          ? "border-severity-medium ring-2 ring-severity-medium shadow-[0_0_12px_rgba(117,190,255,0.3)]"
          : props.selected
            ? "border-vscode-focus ring-2 ring-severity-medium ring-offset-1 ring-offset-vscode-bg"
            : "border-vscode-border hover:border-severity-medium/60",
        isDimmed ? "opacity-35" : "opacity-100",
      ].join(" ")}
    >
      <NodeToolbar
        isVisible={isHovered || props.selected}
        position={Position.Bottom}
        offset={8}
        className="z-50 pointer-events-auto !p-0 !bg-transparent !border-none !shadow-none"
      >
        <NodeInfoCard
          data={{ ...data, label: cleanLabel }}
          type={role}
          selected={props.selected}
          onClose={() => setIsHovered(false)}
        />
      </NodeToolbar>

      {/* Target handles (Left & Top) */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!bg-vscode-dim !w-2 !h-2 !border-none"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!bg-vscode-dim !w-2 !h-2 !border-none"
      />

      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="text-caption2 font-bold uppercase tracking-wider text-vscode-muted">
            {title}
          </span>
        </div>
      </div>

      <div className="truncate text-xs font-mono text-vscode-fg" title={cleanLabel}>
        {cleanLabel}
      </div>

      <div className="flex items-center justify-between mt-1 text-caption2 font-mono text-vscode-muted">
        <span className="truncate max-w-[160px]" title={data.filePath}>
          {fileBasename}:{data.line || 1}
        </span>
      </div>

      {/* Source handles (Right & Bottom) */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!bg-vscode-dim !w-2 !h-2 !border-none"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!bg-vscode-dim !w-2 !h-2 !border-none"
      />
    </div>
  );
});
