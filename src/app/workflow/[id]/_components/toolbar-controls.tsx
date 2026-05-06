"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Play,
  Square,
  Calculator,
  Clock3,
  FolderOpen,
} from "lucide-react";
import { useWorkflowExecute } from "@/hooks/use-workflow-execute";

interface ToolbarControlsProps {
  workflowName: string;
  workflowId: string;
  historyOpen: boolean;
  onToggleHistory: () => void;
}

export function ToolbarControls({
  workflowName,
  historyOpen,
  onToggleHistory,
}: ToolbarControlsProps) {
  const router = useRouter();
  const { execute, cancelExecution, isExecuting } = useWorkflowExecute();

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between px-5 py-4">
      <div className="pointer-events-auto flex min-w-0 items-center gap-3">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex h-10 w-10 items-center justify-center rounded-[16px] border border-[#e5e7eb] bg-white text-[#5d6470] shadow-[0_8px_18px_rgba(17,24,39,0.08)] transition-colors hover:bg-[#fafafa]"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex min-w-0 items-center gap-2 rounded-[18px] border border-[#e5e7eb] bg-white px-4 py-2.5 shadow-[0_8px_18px_rgba(17,24,39,0.08)]">
          <span className="truncate text-[15px] font-semibold text-[#2c3340]">
            {workflowName}
          </span>
        </div>
      </div>

      <div className="pointer-events-auto flex items-center gap-3">
        <div className="hidden items-center gap-3 xl:flex">
          <div className="flex items-center gap-2 rounded-[14px] border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-[13px] font-semibold text-[#667085] shadow-[0_8px_20px_rgba(17,24,39,0.06)]">
            <Calculator className="h-3.5 w-3.5" />
            <span>Est 0.00 M</span>
          </div>
          <div className="flex items-center gap-2 rounded-[14px] border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-[13px] font-semibold text-[#667085] shadow-[0_8px_20px_rgba(17,24,39,0.06)]">
            <FolderOpen className="h-3.5 w-3.5" />
            <span>Bal 0.00 M</span>
          </div>
        </div>
        {isExecuting ? (
          <button
            onClick={cancelExecution}
            className="flex h-10 items-center gap-2 rounded-[14px] bg-[#efecff] px-4 text-[13px] font-semibold text-[#6d62eb] shadow-[0_8px_20px_rgba(109,98,235,0.16)] transition-colors hover:bg-[#e7e3ff]"
          >
            <Square className="h-3 w-3" />
            Running...
          </button>
        ) : (
          <button
            onClick={() => execute("FULL")}
            className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[linear-gradient(180deg,#9ea0f6,#8a8cf0)] text-white shadow-[0_10px_22px_rgba(138,140,240,0.32)] transition hover:brightness-[0.98]"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
          </button>
        )}
        <button
          onClick={onToggleHistory}
          className={`flex h-10 w-10 items-center justify-center rounded-[14px] border shadow-[0_8px_20px_rgba(17,24,39,0.06)] transition ${
            historyOpen
              ? "border-[#d8d9ff] bg-[#efecff] text-[#6d62eb]"
              : "border-[#e5e7eb] bg-white text-[#4b5563] hover:bg-[#fafafa]"
          }`}
        >
          <Clock3 className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
