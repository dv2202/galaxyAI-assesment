export type RunStatus =
  | "PENDING"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "PARTIAL";

export type NodeExecutionStatus =
  | "PENDING"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "SKIPPED";

export type RunScope = "FULL" | "PARTIAL" | "SINGLE_NODE";

export interface NodeResult {
  nodeId: string;
  nodeType: string;
  status: NodeExecutionStatus;
  inputs?: Record<string, unknown>;
  output?: unknown;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  error?: string;
}

export interface WorkflowRunData {
  id: string;
  workflowId: string;
  status: RunStatus;
  scope: RunScope;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  nodeResults: NodeResult[];
  error?: string;
}
