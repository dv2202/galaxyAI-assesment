"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  Workflow,
  Clock,
} from "lucide-react";
import { useConsoleLog } from "@/hooks/use-console-log";
import { useSidebarCollapse } from "@/hooks/use-sidebar-collapse";
import { AppSidebar } from "@/components/app-sidebar";

interface WorkflowItem {
  id: string;
  name: string;
  updatedAt: string;
  createdAt: string;
  lastRunStatus: string | null;
}

export default function DashboardPage() {
  useConsoleLog();
  const router = useRouter();
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<WorkflowItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { collapsed, toggleCollapsed } = useSidebarCollapse();

  useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    let active = true;
    async function loadWorkflows() {
      const res = await fetch("/api/workflows");
      if (!active) return;
      if (res.ok) {
        const data = await res.json();
        if (active) setWorkflows(data);
      }
      if (active) setLoading(false);
    }
    void loadWorkflows();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const syncTime = () => setCurrentTime(Date.now());
    syncTime();
    const interval = setInterval(syncTime, 60000);
    return () => clearInterval(interval);
  }, []);

  async function createWorkflow() {
    const res = await fetch("/api/workflows", { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      router.push(`/workflow/${data.id}`);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/workflows/${deleteTarget.id}`, { method: "DELETE" });
    setWorkflows((prev) => prev.filter((w) => w.id !== deleteTarget.id));
    setDeleting(false);
    setDeleteTarget(null);
  }

  async function renameWorkflow(id: string) {
    if (!renameValue.trim()) return;
    await fetch(`/api/workflows/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: renameValue }),
    });
    setWorkflows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, name: renameValue } : w))
    );
    setRenaming(null);
    setMenuOpen(null);
  }

  function formatUpdatedAt(timestamp: string) {
    const diffMinutes = Math.round(
      (new Date(timestamp).getTime() - currentTime) / 60000
    );
    const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
    const ranges: Array<[Intl.RelativeTimeFormatUnit, number]> = [
      ["year", 525600],
      ["month", 43200],
      ["day", 1440],
      ["hour", 60],
      ["minute", 1],
    ];
    for (const [unit, minutes] of ranges) {
      if (Math.abs(diffMinutes) >= minutes || unit === "minute") {
        return formatter.format(Math.round(diffMinutes / minutes), unit);
      }
    }
    return "just now";
  }

  function statusDisplay(lastRunStatus: string | null) {
    switch (lastRunStatus) {
      case "RUNNING":
      case "PENDING":
        return { label: "Running", color: "bg-emerald-50 text-emerald-600", dot: "bg-emerald-500 animate-pulse" };
      case "COMPLETED":
        return { label: "Completed", color: "bg-blue-50 text-blue-600", dot: "bg-blue-500" };
      case "FAILED":
        return { label: "Failed", color: "bg-red-50 text-red-600", dot: "bg-red-500" };
      case "PARTIAL":
        return { label: "Partial", color: "bg-amber-50 text-amber-600", dot: "bg-amber-500" };
      default:
        return { label: "Idle", color: "bg-[#f3f4f6] text-[#9ca3af]", dot: "bg-[#d1d5db]" };
    }
  }

  return (
    <div className="min-h-screen bg-white text-[#111]">
      <AppSidebar collapsed={collapsed} onToggleCollapse={toggleCollapsed} />

      <main
        className={`min-h-screen transition-[padding] duration-300 ${
          collapsed ? "pl-0" : "pl-[88px] sm:pl-[256px]"
        }`}
      >
        <div className="mx-auto max-w-[1100px] px-6 py-10 sm:px-10">
          {/* Header */}
          <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-[28px] font-bold tracking-tight text-[#111]">
                Workflows
              </h1>
              <p className="mt-1 text-[15px] text-[#6b7280]">
                Build and manage your AI automation pipelines.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-xl border border-[#e5e7eb] bg-white px-4 py-2.5 text-[13px] font-medium text-[#374151] transition hover:bg-[#f9fafb]"
              >
                Load Sample
              </button>
              <button
                onClick={createWorkflow}
                className="flex items-center gap-2 rounded-xl bg-[#111] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#222]"
              >
                <Plus className="h-3.5 w-3.5" />
                New Workflow
              </button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#111] border-t-transparent" />
            </div>
          ) : workflows.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#e5e7eb] py-24 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f3f4f6]">
                <Sparkles className="h-6 w-6 text-[#6b7280]" />
              </div>
              <h2 className="mt-5 text-[17px] font-semibold text-[#111]">
                No workflows yet
              </h2>
              <p className="mt-1.5 max-w-sm text-[14px] text-[#6b7280]">
                Create your first workflow to start building AI-powered automations.
              </p>
              <button
                onClick={createWorkflow}
                className="mt-6 flex items-center gap-2 rounded-xl bg-[#111] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#222]"
              >
                <Plus className="h-3.5 w-3.5" />
                Create Workflow
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#e5e7eb]">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_160px_100px_48px] items-center gap-4 border-b border-[#f3f4f6] bg-[#fafafa] px-5 py-3 text-[12px] font-semibold uppercase tracking-wider text-[#9ca3af]">
                <div>Name</div>
                <div>Last Edited</div>
                <div>Status</div>
                <div />
              </div>

              {/* Rows */}
              {workflows.map((workflow) => {
                const status = statusDisplay(workflow.lastRunStatus);
                const isRunning = workflow.lastRunStatus === "RUNNING" || workflow.lastRunStatus === "PENDING";

                return (
                  <div
                    key={workflow.id}
                    className="group grid cursor-pointer grid-cols-[1fr_160px_100px_48px] items-center gap-4 border-b border-[#f3f4f6] px-5 py-4 transition-colors last:border-b-0 hover:bg-[#fafafa]"
                    onClick={() => {
                      if (!renaming && !menuOpen) {
                        router.push(`/workflow/${workflow.id}`);
                      }
                    }}
                  >
                    {/* Name */}
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isRunning ? "bg-emerald-50" : "bg-[#f3f4f6]"}`}>
                        <Workflow className={`h-4 w-4 ${isRunning ? "text-emerald-500" : "text-[#9ca3af]"}`} />
                      </div>
                      <div className="min-w-0">
                        {renaming === workflow.id ? (
                          <input
                            autoFocus
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") renameWorkflow(workflow.id);
                              if (e.key === "Escape") setRenaming(null);
                            }}
                            onBlur={() => renameWorkflow(workflow.id)}
                            className="w-full rounded-lg border border-[#d1d5db] bg-white px-2.5 py-1.5 text-[14px] font-medium text-[#111] outline-none ring-2 ring-[#111]/10"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <p className="truncate text-[14px] font-semibold text-[#111]">
                            {workflow.name}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Last edited */}
                    <div className="flex items-center gap-1.5 text-[13px] text-[#6b7280]">
                      <Clock className="h-3.5 w-3.5 text-[#9ca3af]" />
                      {formatUpdatedAt(workflow.updatedAt)}
                    </div>

                    {/* Status */}
                    <div>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ${status.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </div>

                    {/* Menu */}
                    <div
                      ref={menuOpen === workflow.id ? menuRef : undefined}
                      className="relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() =>
                          setMenuOpen(menuOpen === workflow.id ? null : workflow.id)
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9ca3af] opacity-0 transition-all group-hover:opacity-100 hover:bg-[#f3f4f6] hover:text-[#374151]"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>

                      {menuOpen === workflow.id && (
                        <div className="absolute right-0 top-9 z-50 w-40 overflow-hidden rounded-xl border border-[#e5e7eb] bg-white py-1 shadow-[0_10px_40px_rgba(0,0,0,0.10)]">
                          <button
                            onClick={() => {
                              setRenaming(workflow.id);
                              setRenameValue(workflow.name);
                              setMenuOpen(null);
                            }}
                            className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-[#374151] transition hover:bg-[#f9fafb]"
                          >
                            <Pencil className="h-3.5 w-3.5 text-[#9ca3af]" />
                            Rename
                          </button>
                          <button
                            onClick={() => {
                              setDeleteTarget(workflow);
                              setMenuOpen(null);
                            }}
                            className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-red-600 transition hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-[0_24px_60px_rgba(0,0,0,0.15)]">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
              <Trash2 className="h-5 w-5 text-red-500" />
            </div>
            <h2 className="text-[16px] font-semibold text-[#111]">
              Delete workflow
            </h2>
            <p className="mt-1.5 text-[14px] text-[#6b7280]">
              Are you sure you want to delete{" "}
              <span className="font-medium text-[#111]">
                {deleteTarget.name}
              </span>
              ? This cannot be undone.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="rounded-xl border border-[#e5e7eb] bg-white px-4 py-2.5 text-[13px] font-medium text-[#374151] transition hover:bg-[#f9fafb] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
