"use client";

import { useEffect } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { useConsoleLog } from "@/hooks/use-console-log";
import { useWorkflowStore } from "@/stores/workflow-store";
import type { WorkflowNode, WorkflowEdge } from "@/types/workflow";
import { AppSidebar } from "@/components/app-sidebar";
import { FlowCanvas } from "./flow-canvas";
import { ToolbarControls } from "./toolbar-controls";
import { NodePickerToolbar } from "./node-picker-toolbar";
import { HistoryPanel } from "./history-panel";

interface CanvasShellProps {
  workflowId: string;
  workflowName: string;
  initialNodes: WorkflowNode[];
  initialEdges: WorkflowEdge[];
}

export function CanvasShell({
  workflowId,
  workflowName,
  initialNodes,
  initialEdges,
}: CanvasShellProps) {
  useConsoleLog();
  const hydrate = useWorkflowStore((s) => s.hydrate);

  useEffect(() => {
    hydrate(initialNodes, initialEdges, workflowId);
  }, [hydrate, initialNodes, initialEdges, workflowId]);

  return (
    <ReactFlowProvider>
      <div className="min-h-screen bg-[#f6f4ef]">
        <AppSidebar />
        <div className="pl-[88px] sm:pl-[290px]">
          <div className="flex h-screen flex-col gap-4 p-3 sm:p-5">
            <ToolbarControls workflowName={workflowName} workflowId={workflowId} />
            <div className="flex flex-1 overflow-hidden rounded-[28px] border border-[#d8d5cb] bg-[#0a0a0f] shadow-[0_30px_60px_rgba(15,23,42,0.18)]">
              <div className="relative flex-1">
                <FlowCanvas />
                <NodePickerToolbar />
              </div>
              <HistoryPanel workflowId={workflowId} />
            </div>
          </div>
        </div>
      </div>
    </ReactFlowProvider>
  );
}
