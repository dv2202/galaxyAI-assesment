"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Upload, RotateCcw, Info, Plus } from "lucide-react";
import { useWorkflowStore } from "@/stores/workflow-store";
import { useExecutionStore } from "@/stores/execution-store";
import { useWorkflowExecute } from "@/hooks/use-workflow-execute";
import type { CropImageData } from "@/types/workflow";
import {
  FieldLabel,
  NodeShell,
} from "./node-shell";

const INPUT_HANDLE =
  "!h-[16px] !w-[16px] !-left-[8px] !border-[3px] !border-white !bg-[#3b82f6] !shadow-[0_0_0_1.5px_rgba(59,130,246,0.25)]";
const OUTPUT_HANDLE =
  "!h-[16px] !w-[16px] !-right-[8px] !border-[3px] !border-white !bg-[#3b82f6] !shadow-[0_0_0_1.5px_rgba(59,130,246,0.25)]";

function SliderRow({
  label,
  value,
  defaultValue,
  onChange,
}: {
  label: string;
  value: number | undefined;
  defaultValue: number;
  onChange: (v: number) => void;
}) {
  const current = value ?? defaultValue;
  const isDefault = current === defaultValue;

  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <span className="w-[110px] shrink-0 text-[15px] font-medium text-[#475467]">
        {label}
      </span>

      <button
        className="nodrag flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[#98a2b3] transition-colors hover:bg-[#f2f4f7] hover:text-[#475467]"
        title={`Info: default ${defaultValue}`}
      >
        <Info className="h-3.5 w-3.5" />
      </button>

      <input
        type="range"
        min={0}
        max={100}
        value={current}
        onChange={(e) => onChange(Number(e.target.value))}
        className="nodrag h-[7px] min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-[#e4e7ec] accent-[#3b82f6] [&::-webkit-slider-thumb]:h-[16px] [&::-webkit-slider-thumb]:w-[16px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#3b82f6] [&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgba(59,130,246,0.4)]"
      />

      <button
        onClick={() => onChange(defaultValue)}
        disabled={isDefault}
        className="nodrag flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[#98a2b3] transition-colors hover:bg-[#f2f4f7] hover:text-[#475467] disabled:cursor-default disabled:opacity-30"
        title={`Reset to ${defaultValue}`}
      >
        <RotateCcw className="h-4 w-4" />
      </button>

      <div className="flex h-9 w-[56px] shrink-0 items-center justify-center rounded-xl border border-[#e4e7ec] bg-[#f8fafc] text-[15px] font-medium text-[#101828]">
        {current}
      </div>

      <button
        onClick={() => onChange(Math.min(100, current + 1))}
        disabled={current >= 100}
        className="nodrag flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[#98a2b3] transition-colors hover:bg-[#f2f4f7] hover:text-[#475467] disabled:cursor-default disabled:opacity-30"
        title="Increment"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function CropImageNodeComponent({ id, data }: NodeProps) {
  const nodeData = data as unknown as CropImageData;
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const removeNode = useWorkflowStore((s) => s.removeNode);
  const edges = useWorkflowStore((s) => s.edges);
  const nodeStatus = useExecutionStore((s) => s.nodeStatuses[id]);
  const nodeOutput = useExecutionStore((s) => s.nodeOutputs[id]);
  const { execute, isExecuting } = useWorkflowExecute();

  const hasImageConnection = edges.some(
    (e) => e.target === id && e.targetHandle?.includes("inputImage")
  );

  return (
    <NodeShell
      title="Crop Image"
      status={nodeStatus}
      onRun={() => execute("SINGLE_NODE", [id])}
      onDelete={() => removeNode(id)}
      isExecuting={isExecuting}
      widthClass="min-w-[560px]"
    >
      <div className="relative flex items-center gap-3 px-1 pb-1">
        <Handle
          type="target"
          position={Position.Left}
          id={`${id}-inputImage-image-in`}
          className={INPUT_HANDLE}
        />
        <div className="min-w-0 flex-1">
          <span className="text-[15px] font-medium text-[#344054]">
            Input Image<span className="text-[#ef4444]">*</span>
          </span>
        </div>
        {hasImageConnection ? (
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-dashed border-[#e4e7ec] bg-[#fbfbfc] px-4 py-3 text-[15px] text-[#98a2b3]"
          >
            <Upload className="h-4 w-4" />
            Change image
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-[#e4e7ec] bg-[#fbfbfc] px-4 py-3 text-[15px] text-[#98a2b3]">
            <Upload className="h-4 w-4" />
            Upload image
          </div>
        )}
      </div>


      <div className="space-y-2.5 pt-1">
        <SliderRow
          label="X Position (%)"
          value={nodeData.xPosition}
          defaultValue={0}
          onChange={(v) => updateNodeData(id, { xPosition: v })}
        />
        <SliderRow
          label="Y Position (%)"
          value={nodeData.yPosition}
          defaultValue={0}
          onChange={(v) => updateNodeData(id, { yPosition: v })}
        />
        <SliderRow
          label="Width (%)"
          value={nodeData.width}
          defaultValue={100}
          onChange={(v) => updateNodeData(id, { width: v })}
        />
        <SliderRow
          label="Height (%)"
          value={nodeData.height}
          defaultValue={100}
          onChange={(v) => updateNodeData(id, { height: v })}
        />
      </div>

      {/* Output Image */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <FieldLabel>Output Image</FieldLabel>
        </div>
        {typeof nodeOutput === "string" ? (
          <div className="relative rounded-[12px] border border-[#e4e7ec] bg-[#f8fafc] p-2">
            <Handle
              type="source"
              position={Position.Right}
              id={`${id}-outputImage-image-out`}
              className={OUTPUT_HANDLE}
            />
            <img
              src={nodeOutput}
              alt="Cropped"
              className="h-36 w-full rounded-xl object-cover"
            />
          </div>
        ) : (
          <div className="relative rounded-xl border border-[#e4e7ec] bg-[#f8fafc] py-16 text-center text-[15px] text-[#98a2b3]">
            <Handle
              type="source"
              position={Position.Right}
              id={`${id}-outputImage-image-out`}
              className={OUTPUT_HANDLE}
            />
            No output yet
          </div>
        )}
      </div>
    </NodeShell>
  );
}

export const CropImageNode = memo(CropImageNodeComponent);
