import { useCallback, useRef } from "react";
import { useWorkflowStore } from "@/stores/workflow-store";
import { useExecutionStore } from "@/stores/execution-store";
import type { RunScope } from "@/types/execution";

export function useWorkflowExecute() {
  const workflowId = useWorkflowStore((s) => s.workflowId);
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const isDirty = useWorkflowStore((s) => s.isDirty);
  const markClean = useWorkflowStore((s) => s.markClean);
  const startExecution = useExecutionStore((s) => s.startExecution);
  const updateNodeStatus = useExecutionStore((s) => s.updateNodeStatus);
  const cancelExecutionStore = useExecutionStore((s) => s.cancelExecution);
  const currentRunId = useExecutionStore((s) => s.currentRunId);
  const isExecuting = useExecutionStore((s) => s.isExecuting);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pollRunStatus = useCallback(
    (runId: string) => {
      if (intervalRef.current) clearInterval(intervalRef.current);

      const poll = async () => {
        try {
          const res = await fetch(`/api/runs/${runId}`);
          if (!res.ok) return;
          const run = await res.json();
          for (const result of run.nodeResults) {
            updateNodeStatus(result.nodeId, result.status, result.output);
          }
          if (["COMPLETED", "FAILED", "PARTIAL"].includes(run.status)) {
            if (intervalRef.current) clearInterval(intervalRef.current);
          }
        } catch {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      };

      poll();
      intervalRef.current = setInterval(poll, 1000);
    },
    [updateNodeStatus]
  );

  const execute = useCallback(
    async (scope: RunScope, selectedNodes?: string[]) => {
      if (isExecuting || !workflowId) return;

      const nodeIdsToExecute =
        scope === "FULL"
          ? nodes
              .filter((n) => n.type !== "request-inputs")
              .map((n) => n.id)
          : selectedNodes || [];

      startExecution("pending", nodeIdsToExecute);

      try {
        const savePromise = isDirty
          ? fetch(`/api/workflows/${workflowId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ nodes, edges }),
            }).then(() => markClean())
          : Promise.resolve();

        const [, executeRes] = await Promise.all([
          savePromise,
          fetch(`/api/workflows/${workflowId}/execute`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ scope, selectedNodes }),
          }),
        ]);

        if (!executeRes.ok) {
          const err = await executeRes.json();
          cancelExecutionStore();
          alert(`Execution failed: ${err.error || "Unknown error"}`);
          return;
        }

        const { runId } = await executeRes.json();
        startExecution(runId, nodeIdsToExecute);
        pollRunStatus(runId);
      } catch {
        cancelExecutionStore();
        alert("Failed to start execution");
      }
    },
    [isExecuting, workflowId, isDirty, nodes, edges, markClean, startExecution, cancelExecutionStore, pollRunStatus]
  );

  const cancelExecution = useCallback(async () => {
    if (!currentRunId) return;
    if (intervalRef.current) clearInterval(intervalRef.current);

    try {
      await fetch(`/api/runs/${currentRunId}/cancel`, { method: "POST" });
    } catch {
      // Best-effort cancel
    }
    cancelExecutionStore();
  }, [currentRunId, cancelExecutionStore]);

  return { execute, cancelExecution, isExecuting };
}
