"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  ChevronsUpDown,
  XCircle,
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

const RUN_FILTERS = [
  { value: "ALL", label: "All" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
  { value: "PARTIAL", label: "Partial" },
  { value: "PENDING", label: "Queued" },
  { value: "RUNNING", label: "Running" },
] as const;

export function HistoryPanel({
  workflowId,
  isOpen,
  onClose,
}: {
  workflowId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [runs, setRuns] = useState<RunData[]>([]);
  const [expandedRun, setExpandedRun] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"ui" | "api">("ui");
  const [selectedFilter, setSelectedFilter] =
    useState<(typeof RUN_FILTERS)[number]["value"]>("ALL");

  useEffect(() => {
    let active = true;

    async function fetchRuns() {
      try {
        const res = await fetch(`/api/runs?workflowId=${workflowId}`);
        if (!active || !res.ok) return;
        const data = await res.json();
        if (active) setRuns(data);
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
        return <CheckCircle2 className="h-3.5 w-3.5 text-success" />;
      case "FAILED":
        return <XCircle className="h-3.5 w-3.5 text-danger" />;
      case "RUNNING":
        return (
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        );
      default:
        return <AlertCircle className="h-3.5 w-3.5 text-warning" />;
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
      FULL: { label: "full", cls: "bg-blue-500/20 text-blue-500" },
      PARTIAL: { label: "partial", cls: "bg-amber-500/20 text-amber-500" },
      SINGLE_NODE: { label: "single", cls: "bg-cyan-500/20 text-cyan-500" },
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

  const filteredRuns = runs.filter((run) => {
    if (selectedFilter === "ALL") return true;
    return run.status === selectedFilter;
  });

  if (!isOpen) return null;

  return (
    <aside className="flex h-full w-full flex-col bg-white">
      <div className="border-b border-[#e9edf3] px-4 py-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-[18px] font-semibold tracking-[-0.03em] text-[#182230]">
            Execution History
          </h2>
          <button
            onClick={onClose}
            className="text-[14px] font-medium text-[#111827] transition hover:text-[#6b7280]"
          >
            Close
          </button>
        </div>

        <div className="mt-4 rounded-[18px] border border-[#e3e7ee] bg-[#f3f5f9] p-1">
          <button
            onClick={() => setActiveTab("ui")}
            className={`w-1/2 rounded-[14px] px-2 py-2 text-[14px] font-semibold transition ${
              activeTab === "ui"
                ? "bg-white text-[#182230] shadow-[0_1px_4px_rgba(17,24,39,0.08)]"
                : "text-[#6b7280]"
            }`}
          >
            UI Runs
          </button>
          <button
            onClick={() => setActiveTab("api")}
            className={`w-1/2 rounded-[14px] px-2 py-2 text-[14px] font-semibold transition ${
              activeTab === "api"
                ? "bg-white text-[#182230] shadow-[0_1px_4px_rgba(17,24,39,0.08)]"
                : "text-[#6b7280]"
            }`}
          >
            API Runs
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="border-b border-[#e9edf3] px-3 py-3">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-[15px] font-semibold text-[#4a5568]">
              Run history
            </h3>
            <div className="relative">
              <select
                value={selectedFilter}
                onChange={(e) =>
                  setSelectedFilter(
                    e.target.value as (typeof RUN_FILTERS)[number]["value"]
                  )
                }
                className="nodrag appearance-none rounded-[10px] border border-[#e1e6ee] bg-white py-2.5 pl-4 pr-8 text-[10px] font-medium text-[#6b7280] shadow-[0_1px_2px_rgba(17,24,39,0.04)] outline-none"
              >
                {RUN_FILTERS.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
              <ChevronsUpDown className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-[#98a2b3]" />
            </div>
          </div>
        </div>

        {filteredRuns.length === 0 ? (
          <div className="px-6 py-6">
            <div className="rounded-[20px] border border-[#e3e7ee] bg-white px-5 py-8 text-center text-[14px] font-medium text-[#6b7280]">
              No runs for this filter yet.
            </div>
          </div>
        ) : (
          <div className="space-y-4 px-6 py-6">
            {filteredRuns.map((run, idx) => (
              <div
                key={run.id}
                className="overflow-hidden rounded-[20px] border border-[#e3e7ee] bg-white"
              >
                <button
                  onClick={() =>
                    setExpandedRun(expandedRun === run.id ? null : run.id)
                  }
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#fafbfd]"
                >
                  {expandedRun === run.id ? (
                    <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-[#98a2b3]" />
                  ) : (
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[#98a2b3]" />
                  )}
                  <div className="mt-0.5 shrink-0">{getStatusIcon(run.status)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-[#182230]">
                          Run #{filteredRuns.length - idx}
                        </p>
                        <p className="mt-1 text-[10px] leading-5 text-[#98a2b3]">
                          {new Date(run.startedAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <div className="flex flex-nowrap gap-1">
                          <span
                            className={`whitespace-nowrap rounded-full px-1.5 py-1 text-[8.5px] leading-none ${getStatusBadge(run.status)}`}
                          >
                            {run.status.toLowerCase()}
                          </span>
                          {/* <span
                            className={`whitespace-nowrap rounded-full px-1.5 py-1 text-[8.5px] leading-none ${getScopeBadge(run.scope).cls}`}
                          >
                            {getScopeBadge(run.scope).label}
                          </span> */}
                        </div>
                        <span className="text-[10px] leading-none text-[#98a2b3]">
                          {formatDuration(run.duration)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>

                {expandedRun === run.id && run.nodeResults.length > 0 && (
                  <div className="space-y-2 border-t border-[#eceef2] bg-[#fcfcfd] p-1">
                    {run.nodeResults.map((result) => (
                      <div
                        key={result.nodeId}
                        className="overflow-hidden rounded-[14px] border border-[#e5e7eb] bg-white"
                      >
                        <div className="flex items-start gap-2 px-3 py-2.5">
                          <div className="mt-0.5 shrink-0">
                            {getStatusIcon(result.status)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[12px] font-medium text-[#182230]">
                              {result.nodeType}
                            </p>
                            <p className="mt-1 text-[10px] text-[#98a2b3]">
                              {formatDuration(result.duration)}
                            </p>
                          </div>
                        </div>
                        {result.error && (
                          <div className="px-3 pb-3">
                            <p className="break-words rounded-lg bg-danger/10 px-2.5 py-2 text-[10px] text-danger">
                              {result.error}
                            </p>
                          </div>
                        )}
                        {result.output != null && (
                          <div className="px-3 pb-3">
                            <p className="mb-1 text-[10px] text-[#98a2b3]">Output:</p>
                            <p className="break-words rounded-lg bg-emerald-500/10 px-2.5 py-2 text-[10px] text-emerald-700">
                              {formatOutput(result.output)}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
