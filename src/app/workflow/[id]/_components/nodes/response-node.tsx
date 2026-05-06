"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { CheckCircle2 } from "lucide-react";
import { useExecutionStore } from "@/stores/execution-store";
import type { ResponseData } from "@/types/workflow";

function ResponseNodeComponent({ id, data }: NodeProps) {
  const nodeData = data as unknown as ResponseData;
  const nodeStatus = useExecutionStore((s) => s.nodeStatuses[id]);
  const nodeOutput = useExecutionStore((s) => s.nodeOutputs[id]);

  const statusClass =
    nodeStatus === "RUNNING"
      ? "node-executing"
      : nodeStatus === "PENDING"
        ? "node-pending"
        : nodeStatus === "COMPLETED"
          ? "node-completed"
          : nodeStatus === "FAILED"
            ? "node-failed"
            : "";

  return (
    <div
      className={`bg-[#1a1a2e] border border-[#2a2a4a] rounded-xl min-w-[260px] shadow-lg ${statusClass}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        id={`${id}-result-text-in`}
        className="!w-3 !h-3 !bg-blue-400 !border-2 !border-[#1a1a2e]"
      />

      <div className="px-4 py-3 border-b border-[#2a2a4a] flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
        </div>
        <span className="text-sm font-medium text-white">Response</span>
      </div>

      <div className="p-3">
        {nodeOutput || nodeData.result ? (
          <div className="p-2 bg-[#0a0a0f] rounded border border-[#2a2a4a]">
            <p className="text-xs text-muted mb-1">Result:</p>
            <p className="text-xs text-white whitespace-pre-wrap max-h-40 overflow-y-auto">
              {(nodeOutput as string) || nodeData.result}
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted">
            Connect a node output to display the final result
          </p>
        )}
      </div>
    </div>
  );
}

export const ResponseNode = memo(ResponseNodeComponent);
