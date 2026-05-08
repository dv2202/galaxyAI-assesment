"use client";

import { useEffect, useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { useConsoleLog } from "@/hooks/use-console-log";
import { useSidebarCollapse } from "@/hooks/use-sidebar-collapse";
import { useWorkflowStore } from "@/stores/workflow-store";
import type { WorkflowNode, WorkflowEdge } from "@/types/workflow";
import { AppSidebar } from "@/components/app-sidebar";
import { FlowCanvas } from "./flow-canvas";
import { ToolbarControls } from "./toolbar-controls";
import { CanvasToolbar } from "./canvas-toolbar";
import { CenterToolbar } from "./center-toolbar";
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
  const [historyOpen, setHistoryOpen] = useState(false);
  const { collapsed, toggleCollapsed } = useSidebarCollapse();

  useEffect(() => {
    hydrate(initialNodes, initialEdges, workflowId);
  }, [hydrate, initialNodes, initialEdges, workflowId]);

  return (
    <ReactFlowProvider>
      <div className="min-h-screen bg-[#ffffff]">
        <AppSidebar collapsed={collapsed} onToggleCollapse={toggleCollapsed} />
        <div className={`transition-[padding] duration-300 ${collapsed ? "pl-0" : "pl-[88px] sm:pl-[256px]"}`}>
          <div className="flex h-screen overflow-hidden bg-white">
            <div className="relative min-w-0 flex-1">
              <ToolbarControls
                workflowName={workflowName}
                workflowId={workflowId}
                historyOpen={historyOpen}
                onToggleHistory={() => setHistoryOpen((open) => !open)}
              />
              <FlowCanvas />
              <CanvasToolbar />
              <CenterToolbar />
            </div>
            <div
              className={`relative shrink-0 overflow-hidden border-l border-[#e7e8ec] bg-white transition-[width] duration-300 ${
                historyOpen ? "w-[300px]" : "w-0 border-l-0"
              }`}
            >
              <HistoryPanel
                workflowId={workflowId}
                isOpen={historyOpen}
                onClose={() => setHistoryOpen(false)}
              />
            </div>
          </div>
        </div>
      </div>
    </ReactFlowProvider>
  );
}
