"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  GripVertical,
  ImageIcon,
  Loader2,
  Trash2,
  Type,
  Upload,
} from "lucide-react";
import { useWorkflowStore } from "@/stores/workflow-store";
import { useExecutionStore } from "@/stores/execution-store";
import type { RequestInputsData, FieldDefinition } from "@/types/workflow";
import { MiniInfoDot, NodeShell, TextareaInput } from "./node-shell";

const ACCEPTED_IMAGE_TYPES = ".jpg,.jpeg,.png,.webp,.gif";

const FIELD_TYPE_OPTIONS: {
  type: "text_field" | "image_field";
  label: string;
  icon: typeof Type;
  color: string;
}[] = [
  { type: "text_field", label: "Text", icon: Type, color: "text-[#ff9f0a]" },
  {
    type: "image_field",
    label: "Image",
    icon: ImageIcon,
    color: "text-[#ec4899]",
  },
];

function AddFieldDropdown({
  onAdd,
}: {
  onAdd: (type: "text_field" | "image_field") => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        title="Add field"
        className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#e7eaf0] bg-[#f8fafc] text-[#667085] transition hover:border-[#d7dde7] hover:bg-white hover:text-[#101828]"
      >
        <span className="text-xl leading-none">+</span>
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-50 w-40 overflow-hidden rounded-[14px] border border-[#e4e7ec] bg-white py-1 shadow-[0_18px_40px_rgba(16,24,40,0.14)]">
          {FIELD_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              onClick={() => {
                onAdd(opt.type);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[15px] text-[#344054] transition-colors hover:bg-[#f5f7fa]"
            >
              <opt.icon className={`h-4 w-4 ${opt.color}`} />
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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

      while (
        assembly.ok === "ASSEMBLY_UPLOADING" ||
        assembly.ok === "ASSEMBLY_EXECUTING"
      ) {
        await new Promise((r) => setTimeout(r, 1500));
        const pollRes = await fetch(assembly.assembly_ssl_url);
        assembly = await pollRes.json();
      }

      if (assembly.ok !== "ASSEMBLY_COMPLETED") {
        throw new Error(assembly.error || "Assembly failed");
      }

      const uploadedUrl = assembly.uploads?.[0]?.url;
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
    <div className="w-full">
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="flex w-full nodrag items-center justify-center gap-2 rounded-xl border border-[#e4e7ec] bg-[#f8fafc] py-3 text-[15px] text-[#475467] transition-colors hover:border-[#d0d5dd] hover:text-[#101828] disabled:opacity-50"
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Upload image
          </>
        )}
      </button>

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES}
        onChange={handleFileSelect}
        className="hidden"
      />

      {field.value && (
        <div className="mt-2 overflow-hidden rounded-[10px] border border-[#e4e7ec]">
          <img
            src={field.value}
            alt="uploaded"
            className="h-36 w-full object-cover"
          />
        </div>
      )}

      {error && <p className="mt-1 text-xs text-[#ef4444]">{error}</p>}
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

  return (
    <NodeShell
      title="Request-Inputs"
      status={nodeStatus}
      widthClass="min-w-[560px]"
      actions={<AddFieldDropdown onAdd={addField} />}
    >
      <div className="space-y-4">
        {fields.length === 0 && (
          <p className="py-5 text-center text-[15px] text-[#98a2b3]">
            Click <span className="font-medium text-[#667085]">+</span> to add
            an input field
          </p>
        )}

        {fields.map((field) => (
          <div key={field.id} className="group relative">
            <div className="mb-2.5 flex items-center gap-2.5">
              <GripVertical className="h-4 w-4 text-[#98a2b3]" />
              {field.type === "image_field" ? (
                <ImageIcon className="h-4 w-4 text-[#ec4899]" />
              ) : (
                <Type className="h-4 w-4 text-[#ff9f0a]" />
              )}
              <input
                value={field.name}
                onChange={(e) => updateFieldName(field.id, e.target.value)}
                className="nodrag flex-1 border-none bg-transparent text-base font-medium text-[#344054] outline-none"
              />
              <MiniInfoDot />
              <button
                onClick={() => removeField(field.id)}
                className="opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4 text-[#98a2b3] hover:text-[#ef4444]" />
              </button>
            </div>
            {field.type === "text_field" ? (
              <TextareaInput
                value={field.value || ""}
                onChange={(value) => updateFieldValue(field.id, value)}
                placeholder="Enter text..."
                className="h-24 rounded-xl border-[#dde2e8] bg-[#f7f7f8]"
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
              className={
                field.type === "image_field"
                  ? "!h-[12px] !w-[12px] !-right-[6px] !border-[2px] !border-white !bg-[#ec4899] !shadow-[0_0_0_1px_rgba(236,72,153,0.25)]"
                  : "!h-[12px] !w-[12px] !-right-[6px] !border-[2px] !border-white !bg-[#ff9f0a] !shadow-[0_0_0_1px_rgba(255,159,10,0.25)]"
              }
            />
          </div>
        ))}
      </div>
    </NodeShell>
  );
}

export const RequestInputsNode = memo(RequestInputsNodeComponent);
