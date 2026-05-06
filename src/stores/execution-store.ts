import { create } from "zustand";
import type { NodeExecutionStatus } from "@/types/execution";

interface ExecutionState {
  currentRunId: string | null;
  isExecuting: boolean;
  nodeStatuses: Record<string, NodeExecutionStatus>;
  nodeOutputs: Record<string, unknown>;

  startExecution: (runId: string, nodeIds: string[]) => void;
  updateNodeStatus: (
    nodeId: string,
    status: NodeExecutionStatus,
    output?: unknown
  ) => void;
  cancelExecution: () => void;
  clearExecution: () => void;
}

export const useExecutionStore = create<ExecutionState>((set, get) => ({
  currentRunId: null,
  isExecuting: false,
  nodeStatuses: {},
  nodeOutputs: {},

  startExecution: (runId, nodeIds) => {
    const statuses: Record<string, NodeExecutionStatus> = {};
    for (const id of nodeIds) {
      statuses[id] = "PENDING";
    }
    set({
      currentRunId: runId,
      isExecuting: true,
      nodeStatuses: statuses,
      nodeOutputs: {},
    });
  },

  updateNodeStatus: (nodeId, status, output) => {
    const { nodeStatuses, nodeOutputs } = get();
    const newStatuses = { ...nodeStatuses, [nodeId]: status };
    const newOutputs = output
      ? { ...nodeOutputs, [nodeId]: output }
      : nodeOutputs;

    const allDone = Object.values(newStatuses).every(
      (s) => s === "COMPLETED" || s === "FAILED" || s === "SKIPPED"
    );

    set({
      nodeStatuses: newStatuses,
      nodeOutputs: newOutputs,
      isExecuting: !allDone,
    });
  },

  cancelExecution: () => {
    const { nodeStatuses } = get();
    const updated: Record<string, NodeExecutionStatus> = {};
    for (const [id, status] of Object.entries(nodeStatuses)) {
      updated[id] = status === "PENDING" || status === "RUNNING" ? "FAILED" : status;
    }
    set({ nodeStatuses: updated, isExecuting: false });
  },

  clearExecution: () => {
    set({
      currentRunId: null,
      isExecuting: false,
      nodeStatuses: {},
      nodeOutputs: {},
    });
  },
}));
