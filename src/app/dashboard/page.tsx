"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Pencil,
  Play,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useConsoleLog } from "@/hooks/use-console-log";
import { AppSidebar } from "@/components/app-sidebar";

interface WorkflowItem {
  id: string;
  name: string;
  updatedAt: string;
  createdAt: string;
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

  useEffect(() => {
    let active = true;

    async function loadWorkflows() {
      const res = await fetch("/api/workflows");
      if (!active) return;

      if (res.ok) {
        const data = await res.json();
        if (active) {
          setWorkflows(data);
        }
      }

      if (active) {
        setLoading(false);
      }
    }

    void loadWorkflows();

    return () => {
      active = false;
    };
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

  async function deleteWorkflow(id: string) {
    await fetch(`/api/workflows/${id}`, { method: "DELETE" });
    setWorkflows((prev) => prev.filter((w) => w.id !== id));
    setMenuOpen(null);
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

    const formatter = new Intl.RelativeTimeFormat(undefined, {
      numeric: "auto",
    });

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

  function workflowStatus(timestamp: string) {
    const minutesAgo = (currentTime - new Date(timestamp).getTime()) / 60000;
    return minutesAgo < 5 ? "Running" : null;
  }

  return (
    <div className="min-h-screen bg-[#f6f4ef] text-[#171717]">
      <AppSidebar />

      <main className="min-h-screen pl-[88px] sm:pl-[290px]">
        <div className="px-5 py-6 sm:px-8 sm:py-8">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#171717]">
                My Workflows
              </h1>
              <p className="mt-2 text-lg text-[#7b746a]">
                Create, open, and manage your automation workflows.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="rounded-2xl border border-[#ddd8cd] bg-white px-5 py-3 text-sm font-medium text-[#4b453e] shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition hover:border-[#cfc8ba]"
              >
                Load Sample
              </button>
              <button
                onClick={createWorkflow}
                className="flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#7c3aed,#9827ff)] px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_32px_rgba(124,58,237,0.35)] transition hover:scale-[1.01]"
              >
                <Plus className="h-4 w-4" />
                New Workflow
              </button>
            </div>
          </div>

          <section className="overflow-hidden rounded-[28px] border border-[#ddd8cd] bg-white shadow-[0_20px_50px_rgba(15,23,42,0.07)]">
            <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(180px,1.1fr)_120px] gap-4 border-b border-[#eee8dd] px-5 py-5 text-sm font-semibold text-[#766f65] sm:px-7">
              <div>Name</div>
              <div>Last Edited</div>
              <div>Status</div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center px-6 py-16">
                <div className="h-9 w-9 rounded-full border-2 border-[#7c3aed] border-t-transparent animate-spin" />
              </div>
            ) : workflows.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                <div className="rounded-full bg-[#f4f0e8] p-4 text-[#7c3aed]">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-[#171717]">
                  No workflows yet
                </h2>
                <p className="mt-2 max-w-md text-[#7b746a]">
                  Create your first workflow to start building AI-powered
                  automations.
                </p>
                <button
                  onClick={createWorkflow}
                  className="mt-6 flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#7c3aed,#9827ff)] px-5 py-3 text-sm font-semibold text-white shadow-[0_20px_32px_rgba(124,58,237,0.35)]"
                >
                  <Plus className="h-4 w-4" />
                  Create Workflow
                </button>
              </div>
            ) : (
              workflows.map((workflow) => {
                const status = workflowStatus(workflow.updatedAt);

                return (
                  <div
                    key={workflow.id}
                    className="group grid cursor-pointer grid-cols-[minmax(0,1.6fr)_minmax(180px,1.1fr)_120px] gap-4 border-b border-[#eee8dd] px-5 py-6 transition hover:bg-[#fcfaf6] last:border-b-0 sm:px-7"
                    onClick={() => {
                      if (!renaming && !menuOpen) {
                        router.push(`/workflow/${workflow.id}`);
                      }
                    }}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f4f0e8] text-[#7c3aed]">
                        <Play className="h-4 w-4" />
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
                            className="w-full rounded-xl border border-[#d7d1c5] bg-[#fcfaf6] px-3 py-2 text-sm font-medium text-[#171717] outline-none ring-0"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <p className="truncate text-[1.05rem] font-semibold text-[#171717]">
                            {workflow.name}
                          </p>
                        )}
                      </div>

                      <div
                        className="relative ml-auto"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() =>
                            setMenuOpen(
                              menuOpen === workflow.id ? null : workflow.id
                            )
                          }
                          className="rounded-xl p-2 text-[#8d867b] opacity-0 transition group-hover:opacity-100 hover:bg-[#f4f0e8]"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {menuOpen === workflow.id && (
                          <div className="absolute right-0 top-10 z-50 w-36 rounded-2xl border border-[#ddd8cd] bg-white py-1.5 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
                            <button
                              onClick={() => {
                                setRenaming(workflow.id);
                                setRenameValue(workflow.name);
                                setMenuOpen(null);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[#171717] transition hover:bg-[#f8f5ef]"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Rename
                            </button>
                            <button
                              onClick={() => deleteWorkflow(workflow.id)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[#dc2626] transition hover:bg-[#f8f5ef]"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center text-lg text-[#6f685f]">
                      {formatUpdatedAt(workflow.updatedAt)}
                    </div>

                    <div className="flex items-center">
                      {status ? (
                        <span className="rounded-full bg-[#fff4b8] px-3 py-1 text-sm font-medium text-[#8a6a00]">
                          {status}
                        </span>
                      ) : (
                        <span className="text-xl text-[#c0b7a8]">-</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
