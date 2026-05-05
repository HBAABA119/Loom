"use client";

import { Component, ReactNode, ErrorInfo } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex h-full flex-col items-center justify-center p-8 bg-[#0d1117] rounded-lg">
          <AlertTriangle size={48} className="text-[#f85149] mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Something went wrong</h3>
          <p className="text-[#8b949e] text-center mb-4 max-w-md">
            There was an error loading this component. Try refreshing the page.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="flex items-center gap-2 px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg transition-colors"
          >
            <RefreshCw size={16} />
            Try again
          </button>
          {this.state.error && (
            <pre className="mt-4 p-4 bg-[#161b22] rounded text-xs text-[#f85149] overflow-auto max-w-full">
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export function VisualizerErrorFallback() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 bg-[#0d1117]">
      <AlertTriangle size={48} className="text-[#f0883e] mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">Visualizer Error</h3>
      <p className="text-[#8b949e] text-center">
        Unable to load the visualizer. Please try refreshing the page.
      </p>
    </div>
  );
}

export function MinigameErrorFallback() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 bg-[#0d1117]">
      <AlertTriangle size={48} className="text-[#f0883e] mb-4" />
      <h3 className="text-xl font-semibold text-white mb-2">Minigame Error</h3>
      <p className="text-[#8b949e] text-center">
        Unable to load the minigame. Please try refreshing the page.
      </p>
    </div>
  );
}
