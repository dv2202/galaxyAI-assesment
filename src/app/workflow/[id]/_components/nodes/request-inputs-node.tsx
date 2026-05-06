"use client";

import { memo, useRef, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Plus, X, Type, Image, Upload, Loader2 } from "lucide-react";
import { useWorkflowStore } from "@/stores/workflow-store";
import { useExecutionStore } from "@/stores/execution-store";
import type { RequestInputsData, FieldDefinition } from "@/types/workflow";

const ACCEPTED_IMAGE_TYPES = ".jpg,.jpeg,.png,.webp,.gif";

function ImageUploadField({
  field,
  onValueChange,
}: {
  field: FieldDefinition;
  onValueChange: (value: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const res = await fetch("/api/upload", { method: "POST" });
      if (!res.ok) throw new Error("Failed to get upload credentials");
      const { params, signature } = await res.json();

      const formData = new FormData();
      formData.append("params", params);
      formData.append("signature", signature);
      formData.append("file", file);

      const assemblyRes = await fetch(
        "https://api2.transloadit.com/assemblies",
        { method: "POST", body: formData }
      );
      if (!assemblyRes.ok) throw new Error("Upload failed");
      let assembly = await assemblyRes.json();

      while (assembly.ok === "ASSEMBLY_UPLOADING" || assembly.ok === "ASSEMBLY_EXECUTING") {
        await new Promise((r) => setTimeout(r, 1500));
        const pollRes = await fetch(assembly.assembly_ssl_url);
        assembly = await pollRes.json();
      }

      if (assembly.ok !== "ASSEMBLY_COMPLETED") {
        throw new Error(assembly.error || "Assembly failed");
      }

      const results = assembly.results;
      const firstResult = results[":original"]?.[0];
      const uploadedUrl = firstResult?.ssl_url || firstResult?.url;

      if (!uploadedUrl) throw new Error("No URL in assembly result");
      onValueChange(uploadedUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="w-full bg-[#0a0a0f] border border-[#2a2a4a] rounded px-2 py-2 text-xs text-muted">
      {field.value ? (
        <img
          src={field.value}
          alt="uploaded"
          className="w-full h-20 object-cover rounded mb-1"
        />
      ) : null}

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        onChange={handleFileSelect}
        className="hidden"
      />

      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-[#1a1a2e] border border-[#2a2a4a] rounded hover:border-primary/50 text-muted hover:text-white transition-colors disabled:opacity-50"
      >
        {uploading ? (
          <>
            <Loader2 className="w-3 h-3 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="w-3 h-3" />
            {field.value ? "Replace image" : "Upload image"}
          </>
        )}
      </button>

      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

function RequestInputsNodeComponent({ id, data }: NodeProps) {
  const nodeData = data as unknown as RequestInputsData;
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const nodeStatus = useExecutionStore((s) => s.nodeStatuses[id]);

  const fields: FieldDefinition[] = nodeData.fields || [];

  function addField(type: "text_field" | "image_field") {
    const count = fields.filter((f) => f.type === type).length;
    const newField: FieldDefinition = {
      id: `${type}_${Date.now()}`,
      name: `${type}${count > 0 ? `_${count + 1}` : ""}`,
      type,
      value: "",
    };
    updateNodeData(id, { fields: [...fields, newField] });
  }

  function removeField(fieldId: string) {
    updateNodeData(id, { fields: fields.filter((f) => f.id !== fieldId) });
  }

  function updateFieldValue(fieldId: string, value: string) {
    updateNodeData(id, {
      fields: fields.map((f) => (f.id === fieldId ? { ...f, value } : f)),
    });
  }

  function updateFieldName(fieldId: string, name: string) {
    updateNodeData(id, {
      fields: fields.map((f) => (f.id === fieldId ? { ...f, name } : f)),
    });
  }

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
      className={`bg-[#1a1a2e] border border-[#2a2a4a] rounded-xl min-w-[280px] shadow-lg ${statusClass}`}
    >
      <div className="px-4 py-3 border-b border-[#2a2a4a] flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center">
          <Type className="w-3 h-3 text-blue-400" />
        </div>
        <span className="text-sm font-medium text-white">Request Inputs</span>
      </div>

      <div className="p-3 space-y-2">
        {fields.map((field) => (
          <div key={field.id} className="relative group">
            <div className="flex items-center gap-2 mb-1">
              {field.type === "image_field" ? (
                <Image className="w-3 h-3 text-purple-400" />
              ) : (
                <Type className="w-3 h-3 text-blue-400" />
              )}
              <input
                value={field.name}
                onChange={(e) => updateFieldName(field.id, e.target.value)}
                className="text-xs bg-transparent border-none text-muted focus:text-white outline-none flex-1"
              />
              <button
                onClick={() => removeField(field.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-muted hover:text-danger" />
              </button>
            </div>
            {field.type === "text_field" ? (
              <textarea
                value={field.value || ""}
                onChange={(e) => updateFieldValue(field.id, e.target.value)}
                placeholder="Enter text..."
                className="w-full bg-[#0a0a0f] border border-[#2a2a4a] rounded px-2 py-1.5 text-xs text-white resize-none h-16"
              />
            ) : (
              <ImageUploadField
                field={field}
                onValueChange={(value) => updateFieldValue(field.id, value)}
              />
            )}
            <Handle
              type="source"
              position={Position.Right}
              id={`${field.id}-${field.type === "image_field" ? "image" : "text"}-out`}
              className="!w-3 !h-3 !bg-primary !border-2 !border-[#1a1a2e]"
            />
          </div>
        ))}

        <div className="flex gap-2 pt-2">
          <button
            onClick={() => addField("text_field")}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-[#0a0a0f] border border-[#2a2a4a] rounded hover:border-primary/50 text-muted hover:text-white transition-colors"
          >
            <Plus className="w-3 h-3" />
            Text
          </button>
          <button
            onClick={() => addField("image_field")}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-[#0a0a0f] border border-[#2a2a4a] rounded hover:border-primary/50 text-muted hover:text-white transition-colors"
          >
            <Plus className="w-3 h-3" />
            Image
          </button>
        </div>
      </div>
    </div>
  );
}

export const RequestInputsNode = memo(RequestInputsNodeComponent);
