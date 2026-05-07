"use client";

import { memo, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  ChevronDown,
  ChevronRight,
  ImageIcon,
  Plus,
  X,
  Sparkles,
} from "lucide-react";
import { useWorkflowStore } from "@/stores/workflow-store";
import { useExecutionStore } from "@/stores/execution-store";
import { useWorkflowExecute } from "@/hooks/use-workflow-execute";
import type { GeminiData } from "@/types/workflow";
import {
  FieldBox,
  FieldLabel,
  imageInputHandleClass,
  inputHandleClass,
  MiniInfoDot,
  NodeShell,
  outputHandleClass,
  SectionDivider,
  SectionTitle,
  StatusPill,
  TextareaInput,
  TextInput,
} from "./node-shell";

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
    (e) =>
      e.target === id &&
      e.targetHandle?.includes("prompt") &&
      !e.targetHandle?.includes("system")
  );
  const hasSystemPromptConnection = edges.some(
    (e) => e.target === id && e.targetHandle?.includes("systemPrompt")
  );

  const connectedHandles = new Set(
    edges.filter((e) => e.target === id).map((e) => e.targetHandle || "")
  );
  const selectedModel = nodeData.model || "gemini-2.5-flash";
  const allNodes = useWorkflowStore((s) => s.nodes);
  const geminiIndex = allNodes.filter((n) => n.type === "gemini").findIndex((n) => n.id === id) + 1;
  const title = `Gemini #${geminiIndex || 1}`;

  return (
    <NodeShell
      title={title}
      status={nodeStatus}
      onRun={() => execute("SINGLE_NODE", [id])}
      onDelete={() => removeNode(id)}
      isExecuting={isExecuting}
      widthClass="min-w-[480px] max-w-[540px]"
      actions={
        <div className="flex h-9 items-center rounded-xl border border-[#e7eaf0] bg-[#f8fafc] px-3">
          <Sparkles className="mr-1.5 h-4 w-4 text-[#7c3aed]" />
          <select
            value={selectedModel}
            onChange={(e) => updateNodeData(id, { model: e.target.value })}
            className="nodrag bg-transparent text-[15px] font-medium text-[#344054] outline-none"
          >
            {MODEL_OPTIONS.map((m) => (
              <option key={m.value} value={m.value} className="bg-white">
                {m.label}
              </option>
            ))}
          </select>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="relative">
          <Handle
            type="target"
            position={Position.Left}
            id={`${id}-prompt-text-in`}
            className={inputHandleClass}
          />
          <FieldLabel required info={<MiniInfoDot />}>
            Prompt
          </FieldLabel>
          <TextareaInput
            value={nodeData.prompt || ""}
            onChange={(value) => updateNodeData(id, { prompt: value })}
            disabled={hasPromptConnection}
            placeholder={
              hasPromptConnection
                ? "Connected from upstream"
                : "Describe the content you want generated..."
            }
            className="h-28"
          />
          {hasPromptConnection ? (
            <div className="mt-2">
              <StatusPill tone="connected">Connected</StatusPill>
            </div>
          ) : null}
        </div>

        <div className="relative">
          <Handle
            type="target"
            position={Position.Left}
            id={`${id}-systemPrompt-text-in`}
            className={inputHandleClass}
          />
          <FieldLabel>System Prompt</FieldLabel>
          <TextareaInput
            value={nodeData.systemPrompt || ""}
            onChange={(value) => updateNodeData(id, { systemPrompt: value })}
            disabled={hasSystemPromptConnection}
            placeholder={
              hasSystemPromptConnection
                ? "Connected from upstream"
                : "Enter system prompt..."
            }
            className="h-24"
          />
        </div>

        <div className="space-y-2.5">
          {Array.from({ length: nodeData.imageInputCount ?? 1 }).map((_, i) => (
            <div key={i} className="group/img relative flex items-center gap-2.5">
              <Handle
                type="target"
                position={Position.Left}
                id={`${id}-image_${i}-image-in`}
                className={imageInputHandleClass}
              />
              <ImageIcon className="h-4 w-4 text-[#ec4899]" />
              <span className="text-[15px] text-[#475467]">
                Image{(nodeData.imageInputCount ?? 1) > 1 ? ` ${i + 1}` : ""} (Vision)
              </span>
              {connectedHandles.has(`${id}-image_${i}-image-in`) && (
                <StatusPill tone="connected">Connected</StatusPill>
              )}
              {(nodeData.imageInputCount ?? 1) > 1 && (
                <button
                  onClick={() =>
                    updateNodeData(id, {
                      imageInputCount: (nodeData.imageInputCount ?? 1) - 1,
                    })
                  }
                  className="ml-auto rounded p-0.5 opacity-0 transition-opacity group-hover/img:opacity-100 hover:bg-[#f5f7fa]"
                >
                  <X className="h-4 w-4 text-[#98a2b3] hover:text-[#ef4444]" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() =>
              updateNodeData(id, {
                imageInputCount: (nodeData.imageInputCount ?? 1) + 1,
              })
            }
            className="flex items-center gap-1.5 rounded-xl border border-dashed border-[#d0d5dd] px-4 py-3 text-[15px] text-[#667085] transition-colors hover:border-[#bfc7d4] hover:text-[#101828]"
          >
            <Plus className="h-4 w-4" />
            Add image input
          </button>
        </div>

        <SectionDivider />

        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="flex items-center gap-1.5 text-[15px] text-[#667085] transition-colors hover:text-[#101828]"
        >
          {settingsOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          Settings
        </button>
        {settingsOpen && (
          <div className="space-y-4">
            <div>
              <FieldLabel>Temperature</FieldLabel>
              <TextInput
                value={String(nodeData.temperature ?? 1)}
                onChange={(value) =>
                  updateNodeData(id, { temperature: Number(value) || 0 })
                }
              />
            </div>
            <div>
              <FieldLabel>Max Tokens</FieldLabel>
              <TextInput
                value={String(nodeData.maxTokens ?? 8192)}
                onChange={(value) =>
                  updateNodeData(id, { maxTokens: Number(value) || 0 })
                }
              />
            </div>
          </div>
        )}

        <div className="relative">
          <Handle
            type="source"
            position={Position.Right}
            id={`${id}-response-text-out`}
            className={outputHandleClass}
          />
          <SectionTitle>Response</SectionTitle>
          <FieldBox className="mt-2.5 min-h-32 py-8 text-center text-[#98a2b3]">
            {(nodeOutput || nodeData.response) ? (
              <p className="max-h-40 overflow-y-auto whitespace-pre-wrap text-left text-[15px] text-[#101828] nowheel">
                {(nodeOutput as string) || nodeData.response}
              </p>
            ) : (
              "No output yet"
            )}
          </FieldBox>
        </div>
      </div>
    </NodeShell>
  );
}

export const GeminiNode = memo(GeminiNodeComponent);
