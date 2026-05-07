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
    <NodeShell title="Response" status={nodeStatus} widthClass="w-[420px]">
      <Handle
        type="target"
        position={Position.Left}
        id={`${id}-result-text-in`}
        className={inputHandleClass}
      />
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ecfdf3] text-[#22c55e]">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <FieldLabel>Generated Result</FieldLabel>
      </div>
      <div>
        {nodeOutput || nodeData.result ? (
          <FieldBox className="min-h-36">
            <p className="max-h-48 overflow-y-auto whitespace-pre-wrap break-words text-[15px] text-[#101828]">
              {(nodeOutput as string) || nodeData.result}
            </p>
          </FieldBox>
        ) : (
          <FieldBox className="py-10 text-center text-[15px] text-[#98a2b3]">
            Connect a node output to display the final result
          </FieldBox>
        )}
      </div>
    </NodeShell>
  );
}

export const ResponseNode = memo(ResponseNodeComponent);
