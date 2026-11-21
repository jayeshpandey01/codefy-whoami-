import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangleIcon, RefreshCwIcon } from "../components/Icons.js";

export interface GraphErrorBoundaryProps {
  readonly children: ReactNode;
  readonly onReset?: () => void;
}

export interface GraphErrorBoundaryState {
  readonly hasError: boolean;
  readonly error?: Error;
}

/**
 * Resilient error boundary specifically protecting canvas graph visualizers.
 * Prevents sub-pixel layout calculation issues, WebGL/canvas allocation limits,
 * or unexpected element transform exceptions from crashing the parent application.
 */
export class GraphErrorBoundary extends Component<GraphErrorBoundaryProps, GraphErrorBoundaryState> {
  override state: GraphErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): GraphErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("[WhoAmI Graph Error Boundary] Caught canvas rendering crash:", error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full items-center justify-center p-6 bg-vscode-bg font-sans select-none">
          <div className="max-w-md rounded-xl border border-severity-critical/50 bg-vscode-card p-5 shadow-2xl text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-severity-critical/15 text-severity-critical mb-3">
              <AlertTriangleIcon size={20} />
            </div>
            <h3 className="text-sm font-bold text-vscode-fg mb-1">
              Graph Visualization Recovered
            </h3>
            <p className="text-xs text-vscode-muted mb-4 leading-relaxed">
              A rendering memory or transform spike occurred during canvas manipulation. Hardware acceleration protected your session.
            </p>
            {this.state.error?.message && (
              <div className="rounded bg-vscode-bg px-2.5 py-1.5 text-caption2 font-mono text-severity-critical truncate mb-4" title={this.state.error.message}>
                {this.state.error.message}
              </div>
            )}
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-1.5 rounded bg-vscode-focus px-3 py-1.5 text-xs font-semibold text-white hover:bg-vscode-primary-hover transition-colors cursor-pointer"
            >
              <RefreshCwIcon size={12} />
              Reset Viewport
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
