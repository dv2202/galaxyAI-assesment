"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { CheckCircle2 } from "lucide-react";
import { useExecutionStore } from "@/stores/execution-store";
import type { ResponseData } from "@/types/workflow";
import {
  FieldBox,
  FieldLabel,
  inputHandleClass,
  NodeShell,
} from "./node-shell";

function ResponseNodeComponent({ id, data }: NodeProps) {
  const nodeData = data as unknown as ResponseData;
  const nodeStatus = useExecutionStore((s) => s.nodeStatuses[id]);
  const nodeOutput = useExecutionStore((s) => s.nodeOutputs[id]);

  return (
    <NodeShell title="Response" status={nodeStatus} widthClass="min-w-[320px]">
      <Handle
        type="target"
        position={Position.Left}
        id={`${id}-result-text-in`}
        className={inputHandleClass}
      />
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-[#ecfdf3] text-[#22c55e]">
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <FieldLabel>Generated Result</FieldLabel>
      </div>
      <div>
        {nodeOutput || nodeData.result ? (
          <FieldBox className="min-h-28">
            <p className="max-h-40 overflow-y-auto whitespace-pre-wrap text-[12px] text-[#101828]">
              {(nodeOutput as string) || nodeData.result}
            </p>
          </FieldBox>
        ) : (
          <FieldBox className="py-8 text-center text-[#98a2b3]">
            Connect a node output to display the final result
          </FieldBox>
        )}
      </div>
    </NodeShell>
  );
}

export const ResponseNode = memo(ResponseNodeComponent);
