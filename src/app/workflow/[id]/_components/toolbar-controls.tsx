"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  History,
  Play,
  Square,
  Calculator,
  WalletCards,
} from "lucide-react";
import { useWorkflowExecute } from "@/hooks/use-workflow-execute";

interface ToolbarControlsProps {
  workflowName: string;
  workflowId: string;
  historyOpen: boolean;
  onToggleHistory: () => void;
}

export function ToolbarControls(props: ToolbarControlsProps) {
  const router = useRouter();
  const { execute, cancelExecution, isExecuting } = useWorkflowExecute();

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-4 px-5 py-3">
      <div className="relative pointer-events-auto flex min-w-0 items-center gap-2.5 left-9">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#e5e7eb] bg-white text-[#5d6470] shadow-sm transition-colors hover:bg-[#fafafa]"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex min-w-0 items-center gap-1.5 rounded-xl border border-[#e5e7eb] bg-white px-3 py-1.5 shadow-sm">
          <span className="truncate text-sm font-medium text-[#1f2937]">
            {props.workflowName}
          </span>
        </div>
      </div>

      <div className="pointer-events-auto flex shrink-0 items-center gap-2">
        <div className="hidden items-center gap-2 lg:flex">
          <div className="flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-white px-2.5 py-1.5 text-xs font-medium text-[#667085] shadow-sm">
            <Calculator className="h-3 w-3" />
            <span>Est</span>
            <span className="text-xs text-[#4b5563]">0.01 M</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] bg-white px-2.5 py-1.5 text-xs font-medium text-[#667085] shadow-sm">
            <WalletCards className="h-3 w-3" />
            <span>Bal</span>
            <span className="text-xs text-[#4b5563]">0.00 M</span>
          </div>
        </div>
        {isExecuting ? (
          <button
            onClick={cancelExecution}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-[#efecff] px-3 text-xs font-semibold text-[#6d62eb] shadow-sm transition-colors hover:bg-[#e7e3ff]"
          >
            <Square className="h-2.5 w-2.5" />
            Running...
          </button>
        ) : (
          <button
            onClick={() => execute("FULL")}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-[#b7efc4] bg-[#dcfce7] px-3 text-xs font-semibold text-[#1ea44b] shadow-sm transition hover:bg-[#d2f8dd]"
          >
            <Play className="h-3 w-3 fill-current" />
            Run
          </button>
        )}
        <button
          type="button"
          onClick={props.onToggleHistory}
          title="Run History"
          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition shadow-sm ${
            props.historyOpen
              ? "border-[#c7c3ff] bg-[#efecff] text-[#6258e5]"
              : "border-[#e5e7eb] bg-white text-[#4b5563] hover:bg-[#fafafa]"
          }`}
        >
          <History className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
}
