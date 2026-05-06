"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Crop, Trash2, Play } from "lucide-react";
import { useWorkflowStore } from "@/stores/workflow-store";
import { useExecutionStore } from "@/stores/execution-store";
import { useWorkflowExecute } from "@/hooks/use-workflow-execute";
import type { CropImageData } from "@/types/workflow";

function SliderField({
  label,
  value,
  defaultValue,
  onChange,
}: {
  label: string;
  value: number | undefined;
  defaultValue: number;
  onChange: (value: number) => void;
}) {
  const currentValue = value ?? defaultValue;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-xs text-muted">{label}</label>
        <span className="text-[10px] text-white">{currentValue}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={currentValue}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-green-400"
      />
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
        id={`${id}-inputImage-image-in`}
        className="!w-3 !h-3 !bg-purple-400 !border-2 !border-[#1a1a2e]"
        style={{ top: "50px" }}
      />

      <div className="px-4 py-3 border-b border-[#2a2a4a] flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-green-500/20 flex items-center justify-center">
          <Crop className="w-3 h-3 text-green-400" />
        </div>
        <span className="text-sm font-medium text-white">Crop Image</span>
        <div className="ml-auto flex items-center gap-1">
          {nodeStatus === "COMPLETED" && (
            <span className="text-xs text-success">Done</span>
          )}
          {nodeStatus === "FAILED" && (
            <span className="text-xs text-danger">Failed</span>
          )}
          {nodeStatus === "PENDING" && (
            <span className="text-xs text-muted animate-pulse">Pending...</span>
          )}
          {nodeStatus === "RUNNING" && (
            <span className="text-xs text-primary animate-pulse">
              Running...
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              execute("SINGLE_NODE", [id]);
            }}
            disabled={isExecuting}
            className="p-1 rounded hover:bg-[#2a2a4a] transition-colors disabled:opacity-30"
            title="Run this node"
          >
            <Play className="w-3 h-3 text-muted hover:text-success" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeNode(id);
            }}
            className="p-1 rounded hover:bg-[#2a2a4a] transition-colors"
            title="Delete node"
          >
            <Trash2 className="w-3 h-3 text-muted hover:text-danger" />
          </button>
        </div>
      </div>

      <div className="p-3 space-y-2">
        {hasImageConnection && (
          <div className="flex items-center gap-2 px-2 py-1.5 bg-[#0a0a0f] rounded border border-[#2a2a4a]">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span className="text-xs text-muted">Image connected from upstream</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <SliderField
            label="X Position"
            value={nodeData.xPosition}
            defaultValue={0}
            onChange={(value) => updateNodeData(id, { xPosition: value })}
          />
          <SliderField
            label="Y Position"
            value={nodeData.yPosition}
            defaultValue={0}
            onChange={(value) => updateNodeData(id, { yPosition: value })}
          />
          <SliderField
            label="Width"
            value={nodeData.width}
            defaultValue={100}
            onChange={(value) => updateNodeData(id, { width: value })}
          />
          <SliderField
            label="Height"
            value={nodeData.height}
            defaultValue={100}
            onChange={(value) => updateNodeData(id, { height: value })}
          />
        </div>

        {typeof nodeOutput === "string" && (
          <div className="mt-2 p-2 bg-[#0a0a0f] rounded border border-[#2a2a4a]">
            <p className="text-xs text-muted mb-1">Output:</p>
            <img
              src={nodeOutput}
              alt="Cropped"
              className="w-full h-20 object-cover rounded"
            />
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id={`${id}-outputImage-image-out`}
        className="!w-3 !h-3 !bg-primary !border-2 !border-[#1a1a2e]"
      />
    </div>
  );
}

export const CropImageNode = memo(CropImageNodeComponent);
