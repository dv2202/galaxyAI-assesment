"use client";

import { memo, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  Sparkles,
  ChevronDown,
  ChevronRight,
  Image,
  Trash2,
  Play,
} from "lucide-react";
import { useWorkflowStore } from "@/stores/workflow-store";
import { useExecutionStore } from "@/stores/execution-store";
import { useWorkflowExecute } from "@/hooks/use-workflow-execute";
import type { GeminiData } from "@/types/workflow";

const MODEL_OPTIONS = [
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
];

function GeminiNodeComponent({ id, data }: NodeProps) {
  const nodeData = data as unknown as GeminiData;
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const removeNode = useWorkflowStore((s) => s.removeNode);
  const nodeStatus = useExecutionStore((s) => s.nodeStatuses[id]);
  const nodeOutput = useExecutionStore((s) => s.nodeOutputs[id]);
  const { execute, isExecuting } = useWorkflowExecute();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const edges = useWorkflowStore((s) => s.edges);
  const hasPromptConnection = edges.some(
    (e) => e.target === id && e.targetHandle?.includes("prompt") && !e.targetHandle?.includes("system")
  );
  const hasSystemPromptConnection = edges.some(
    (e) => e.target === id && e.targetHandle?.includes("systemPrompt")
  );

  const connectedHandles = new Set(
    edges.filter((e) => e.target === id).map((e) => e.targetHandle || "")
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
      className={`bg-[#1a1a2e] border border-[#2a2a4a] rounded-xl min-w-[300px] max-w-[340px] shadow-lg ${statusClass}`}
    >
      {/* Header with model selector */}
      <div className="px-4 py-3 border-b border-[#2a2a4a] flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-violet-500/20 flex items-center justify-center shrink-0">
          <Sparkles className="w-3 h-3 text-violet-400" />
        </div>
        <select
          value={nodeData.model || "gemini-2.5-pro"}
          onChange={(e) => updateNodeData(id, { model: e.target.value })}
          className="bg-transparent text-sm font-medium text-white outline-none cursor-pointer flex-1 min-w-0"
        >
          {MODEL_OPTIONS.map((m) => (
            <option key={m.value} value={m.value} className="bg-[#1a1a2e]">
              {m.label}
            </option>
          ))}
        </select>
        <div className="ml-auto flex items-center gap-1 shrink-0">
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

      {/* Body */}
      <div className="p-3 space-y-3">
        {/* Prompt */}
        <div className="relative">
          <Handle
            type="target"
            position={Position.Left}
            id={`${id}-prompt-text-in`}
            className="!w-3 !h-3 !bg-blue-400 !border-2 !border-[#1a1a2e]"
          />
          <label className="text-xs text-muted block mb-1">
            Prompt <span className="text-red-400">*</span>
          </label>
          <textarea
            value={nodeData.prompt || ""}
            onChange={(e) => updateNodeData(id, { prompt: e.target.value })}
            disabled={hasPromptConnection}
            placeholder={
              hasPromptConnection ? "Connected from upstream" : "Enter prompt..."
            }
            className={`w-full bg-[#0a0a0f] border border-[#2a2a4a] rounded px-2 py-1.5 text-xs text-white resize-none h-14 ${
              hasPromptConnection ? "opacity-50 cursor-not-allowed" : ""
            }`}
          />
        </div>

        {/* System Prompt */}
        <div className="relative">
          <Handle
            type="target"
            position={Position.Left}
            id={`${id}-systemPrompt-text-in`}
            className="!w-3 !h-3 !bg-blue-400 !border-2 !border-[#1a1a2e]"
          />
          <label className="text-xs text-muted block mb-1">System Prompt</label>
          <textarea
            value={nodeData.systemPrompt || ""}
            onChange={(e) =>
              updateNodeData(id, { systemPrompt: e.target.value })
            }
            disabled={hasSystemPromptConnection}
            placeholder={
              hasSystemPromptConnection
                ? "Connected from upstream"
                : "Enter system prompt..."
            }
            className={`w-full bg-[#0a0a0f] border border-[#2a2a4a] rounded px-2 py-1.5 text-xs text-white resize-none h-14 ${
              hasSystemPromptConnection ? "opacity-50 cursor-not-allowed" : ""
            }`}
          />
        </div>

        {/* Image (Vision) */}
        <div className="relative flex items-center gap-2 py-1">
          <Handle
            type="target"
            position={Position.Left}
            id={`${id}-image-image-in`}
            className="!w-3 !h-3 !bg-purple-400 !border-2 !border-[#1a1a2e]"
          />
          <Image className="w-3 h-3 text-purple-400" />
          <span className="text-xs text-muted">Image (Vision)</span>
          {connectedHandles.has(`${id}-image-image-in`) && (
            <span className="w-2 h-2 rounded-full bg-purple-400 ml-auto" />
          )}
        </div>

        {/* Settings (collapsed) */}
        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="flex items-center gap-1 text-xs text-muted hover:text-white transition-colors"
        >
          {settingsOpen ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
          Settings
        </button>
        {settingsOpen && (
          <div className="space-y-2 pl-2">
            <div>
              <label className="text-xs text-muted block mb-1">
                Temperature
              </label>
              <input
                type="number"
                min={0}
                max={2}
                step={0.1}
                value={nodeData.temperature ?? 1}
                onChange={(e) =>
                  updateNodeData(id, { temperature: Number(e.target.value) })
                }
                className="w-full bg-[#0a0a0f] border border-[#2a2a4a] rounded px-2 py-1 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-xs text-muted block mb-1">
                Max Tokens
              </label>
              <input
                type="number"
                min={1}
                max={65536}
                value={nodeData.maxTokens ?? 8192}
                onChange={(e) =>
                  updateNodeData(id, { maxTokens: Number(e.target.value) })
                }
                className="w-full bg-[#0a0a0f] border border-[#2a2a4a] rounded px-2 py-1 text-xs text-white"
              />
            </div>
          </div>
        )}

        {/* Response display (inline) */}
        {(nodeOutput || nodeData.response) && (
          <div className="mt-2 p-2 bg-[#0a0a0f] rounded border border-[#2a2a4a]">
            <p className="text-xs text-muted mb-1">Response:</p>
            <p className="text-xs text-white whitespace-pre-wrap max-h-32 overflow-y-auto">
              {(nodeOutput as string) || nodeData.response}
            </p>
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id={`${id}-response-text-out`}
        className="!w-3 !h-3 !bg-primary !border-2 !border-[#1a1a2e]"
      />
    </div>
  );
}

export const GeminiNode = memo(GeminiNodeComponent);
