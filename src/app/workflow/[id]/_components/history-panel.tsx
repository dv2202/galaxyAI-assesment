"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  XCircle,
  AlertCircle,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";

interface NodeResultData {
  nodeId: string;
  nodeType: string;
  status: string;
  inputs?: Record<string, unknown>;
  output?: unknown;
  duration?: number;
  error?: string;
}

interface RunData {
  id: string;
  status: string;
  scope: string;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  nodeResults: NodeResultData[];
}

export function HistoryPanel({ workflowId }: { workflowId: string }) {
  const [isOpen, setIsOpen] = useState(true);
  const [runs, setRuns] = useState<RunData[]>([]);
  const [expandedRun, setExpandedRun] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchRuns() {
      try {
        const res = await fetch(`/api/runs?workflowId=${workflowId}`);
        if (!active || !res.ok) return;
        const data = await res.json();
        if (active) {
          setRuns(data);
        }
      } catch {
        // Silent fail
      }
    }

    void fetchRuns();
    const interval = setInterval(() => {
      void fetchRuns();
    }, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [workflowId]);

  function getStatusIcon(status: string) {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="w-3.5 h-3.5 text-success" />;
      case "FAILED":
        return <XCircle className="w-3.5 h-3.5 text-danger" />;
      case "RUNNING":
        return (
          <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        );
      default:
        return <AlertCircle className="w-3.5 h-3.5 text-warning" />;
    }
  }

  function getStatusBadge(status: string) {
    const colors: Record<string, string> = {
      COMPLETED: "bg-success/20 text-success",
      FAILED: "bg-danger/20 text-danger",
      RUNNING: "bg-primary/20 text-primary",
      PARTIAL: "bg-warning/20 text-warning",
      PENDING: "bg-muted/20 text-muted",
    };
    return colors[status] || "bg-muted/20 text-muted";
  }

  function getScopeBadge(scope: string) {
    const labels: Record<string, { label: string; cls: string }> = {
      FULL: { label: "full", cls: "bg-blue-500/20 text-blue-400" },
      PARTIAL: { label: "partial", cls: "bg-amber-500/20 text-amber-400" },
      SINGLE_NODE: { label: "single", cls: "bg-cyan-500/20 text-cyan-400" },
    };
    return labels[scope] || { label: scope, cls: "bg-muted/20 text-muted" };
  }

  function formatDuration(ms?: number) {
    if (!ms) return "—";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  }

  function formatOutput(output: unknown): string {
    if (output == null) return "—";
    if (typeof output === "string") {
      if (output.startsWith("data:image") || output.startsWith("http")) {
        return "[image]";
      }
      return output.length > 120 ? output.slice(0, 120) + "..." : output;
    }
    const json = JSON.stringify(output);
    return json.length > 120 ? json.slice(0, 120) + "..." : json;
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="absolute right-4 top-4 p-2 rounded-lg bg-[#1a1a2e] border border-[#2a2a4a] hover:border-primary/50 transition-colors z-10"
      >
        <PanelRightOpen className="w-4 h-4 text-muted" />
      </button>
    );
  }

  return (
    <div className="w-80 border-l border-[#2a2a4a] bg-[#0f0f1a] flex flex-col shrink-0">
      <div className="px-4 py-3 border-b border-[#2a2a4a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted" />
          <span className="text-sm font-medium text-white">History</span>
          <span className="text-xs text-muted">({runs.length})</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 rounded hover:bg-[#1a1a2e] transition-colors"
        >
          <PanelRightClose className="w-4 h-4 text-muted" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {runs.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-8 h-8 text-muted/30 mx-auto mb-2" />
            <p className="text-xs text-muted">No runs yet</p>
          </div>
        ) : (
          runs.map((run, idx) => (
            <div key={run.id} className="rounded-lg border border-[#2a2a4a] overflow-hidden">
              <button
                onClick={() =>
                  setExpandedRun(expandedRun === run.id ? null : run.id)
                }
                className="w-full flex items-center gap-2 p-3 hover:bg-[#1a1a2e] transition-colors text-left"
              >
                {expandedRun === run.id ? (
                  <ChevronDown className="w-3 h-3 text-muted shrink-0" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-muted shrink-0" />
                )}
                {getStatusIcon(run.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white truncate">
                    Run #{runs.length - idx}
                  </p>
                  <p className="text-[10px] text-muted">
                    {new Date(run.startedAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${getStatusBadge(run.status)}`}
                    >
                      {run.status.toLowerCase()}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${getScopeBadge(run.scope).cls}`}
                    >
                      {getScopeBadge(run.scope).label}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted">
                    {formatDuration(run.duration)}
                  </span>
                </div>
              </button>

              {expandedRun === run.id && run.nodeResults.length > 0 && (
                <div className="border-t border-[#2a2a4a] p-2 space-y-1 bg-[#0a0a0f]">
                  {run.nodeResults.map((result) => (
                    <div
                      key={result.nodeId}
                      className="rounded border border-[#2a2a4a] overflow-hidden"
                    >
                      <div className="flex items-center gap-2 px-2 py-1.5 text-xs">
                        {getStatusIcon(result.status)}
                        <span className="text-white flex-1 truncate">
                          {result.nodeType}
                        </span>
                        <span className="text-muted">
                          {formatDuration(result.duration)}
                        </span>
                      </div>
                      {result.error && (
                        <div className="px-2 pb-1.5">
                          <p className="text-[10px] text-danger bg-danger/10 rounded px-1.5 py-1 break-words">
                            {result.error}
                          </p>
                        </div>
                      )}
                      {result.output != null && (
                        <div className="px-2 pb-1.5">
                          <p className="text-[10px] text-muted mb-0.5">Output:</p>
                          <p className="text-[10px] text-emerald-400 bg-emerald-500/10 rounded px-1.5 py-1 break-words">
                            {formatOutput(result.output)}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
