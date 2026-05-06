"use client";

import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Play,
  Square,
  Download,
  Upload,
  Workflow,
  PlayCircle,
} from "lucide-react";
import { useWorkflowStore } from "@/stores/workflow-store";
import { useWorkflowExecute } from "@/hooks/use-workflow-execute";
import { NON_DELETABLE_NODES } from "@/lib/constants";

interface ToolbarControlsProps {
  workflowName: string;
  workflowId: string;
}

export function ToolbarControls({
  workflowName,
  workflowId,
}: ToolbarControlsProps) {
  const router = useRouter();
  const { nodes, edges } = useWorkflowStore();
  const { execute, cancelExecution, isExecuting } = useWorkflowExecute();

  const selectedNodes = nodes.filter(
    (n) => n.selected && !NON_DELETABLE_NODES.includes(n.type as string)
  );
  const hasSelection = selectedNodes.length > 0;

  function handleUndo() {
    useWorkflowStore.temporal.getState().undo();
  }

  function handleRedo() {
    useWorkflowStore.temporal.getState().redo();
  }

  function handleExport() {
    const data = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${workflowName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const data = JSON.parse(text);
        if (data.nodes && data.edges) {
          useWorkflowStore.getState().setNodes(data.nodes);
          useWorkflowStore.getState().setEdges(data.edges);
        }
      } catch {
        alert("Invalid workflow JSON");
      }
    };
    input.click();
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between rounded-[24px] border border-[#d8d5cb] bg-white px-4 shadow-[0_16px_40px_rgba(15,23,42,0.07)]">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-xl p-2 transition-colors hover:bg-[#f3efe7]"
        >
          <ArrowLeft className="h-4 w-4 text-[#7d766c]" />
        </button>
        <div className="flex items-center gap-2">
          <Workflow className="h-4 w-4 text-[#7c3aed]" />
          <span className="text-sm font-semibold text-[#171717]">
            {workflowName}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={handleUndo}
          className="rounded-xl p-2 transition-colors hover:bg-[#f3efe7]"
          title="Undo"
        >
          <Undo2 className="h-4 w-4 text-[#7d766c]" />
        </button>
        <button
          onClick={handleRedo}
          className="rounded-xl p-2 transition-colors hover:bg-[#f3efe7]"
          title="Redo"
        >
          <Redo2 className="h-4 w-4 text-[#7d766c]" />
        </button>
        <div className="mx-2 h-6 w-px bg-[#e6e0d6]" />
        <button
          onClick={handleImport}
          className="rounded-xl p-2 transition-colors hover:bg-[#f3efe7]"
          title="Import"
        >
          <Upload className="h-4 w-4 text-[#7d766c]" />
        </button>
        <button
          onClick={handleExport}
          className="rounded-xl p-2 transition-colors hover:bg-[#f3efe7]"
          title="Export"
        >
          <Download className="h-4 w-4 text-[#7d766c]" />
        </button>
        <div className="mx-2 h-6 w-px bg-[#e6e0d6]" />
        {hasSelection && (
          <button
            onClick={() =>
              execute(
                "PARTIAL",
                selectedNodes.map((n) => n.id)
              )
            }
            disabled={isExecuting}
            className={`flex items-center gap-2 rounded-2xl px-3 py-2 font-medium text-xs transition-colors ${
              isExecuting
                ? "cursor-not-allowed bg-[#d1fae5] text-emerald-400/70"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
            }`}
          >
            <PlayCircle className="h-3 w-3" />
            Run Selected ({selectedNodes.length})
          </button>
        )}
        {isExecuting ? (
          <button
            onClick={cancelExecution}
            className="flex items-center gap-2 rounded-2xl px-4 py-2 font-medium text-sm transition-colors bg-red-500 text-white hover:bg-red-600 shadow-[0_14px_26px_rgba(239,68,68,0.25)]"
          >
            <Square className="h-3 w-3" />
            Stop
          </button>
        ) : (
          <button
            onClick={() => execute("FULL")}
            className="flex items-center gap-2 rounded-2xl px-4 py-2 font-medium text-sm transition-colors bg-[linear-gradient(135deg,#7c3aed,#9827ff)] text-white shadow-[0_14px_26px_rgba(124,58,237,0.25)]"
          >
            <Play className="h-3 w-3" />
            Run
          </button>
        )}
        <div className="mx-2 h-6 w-px bg-[#e6e0d6]" />
        <UserButton />
      </div>
    </header>
  );
}
