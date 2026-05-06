"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Search, Crop, Sparkles, X } from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { useWorkflowStore } from "@/stores/workflow-store";
import { NODE_TYPES } from "@/lib/constants";

const NODE_OPTIONS = [
  {
    type: NODE_TYPES.CROP_IMAGE,
    label: "Crop Image",
    icon: Crop,
    category: "Image",
    description: "Crop an image by percentage coordinates",
    color: "text-green-500",
    bgColor: "bg-green-500/15",
  },
  {
    type: NODE_TYPES.GEMINI,
    label: "Gemini 3.1 Pro",
    icon: Sparkles,
    category: "LLM",
    description: "Generate text with Google Gemini",
    color: "text-violet-500",
    bgColor: "bg-violet-500/15",
  },
];

export function NodePickerToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const addNode = useWorkflowStore((s) => s.addNode);
  const { getViewport } = useReactFlow();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const filtered = NODE_OPTIONS.filter(
    (opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase()) ||
      opt.category.toLowerCase().includes(search.toLowerCase())
  );

  function handleAddNode(type: string) {
    const viewport = getViewport();
    const position = {
      x: (-viewport.x + 400) / viewport.zoom,
      y: (-viewport.y + 300) / viewport.zoom,
    };

    const id = `${type}-${crypto.randomUUID()}`;
    let data: Record<string, unknown> = {};

    if (type === NODE_TYPES.CROP_IMAGE) {
      data = { xPosition: 0, yPosition: 0, width: 100, height: 100 };
    } else if (type === NODE_TYPES.GEMINI) {
      data = {
        model: "gemini-2.5-pro",
        prompt: "",
        systemPrompt: "",
        imageInputs: [],
      };
    }

    addNode({
      id,
      type,
      position,
      data,
    });

    setIsOpen(false);
    setSearch("");
  }

  return (
    <div className="absolute bottom-6 left-1/2 z-10 ml-[380px] -translate-x-1/2">
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 overflow-hidden rounded-[22px] border border-[#e5e7eb] bg-white shadow-[0_24px_60px_rgba(17,24,39,0.12)]">
          <div className="border-b border-[#eef0f3] p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9ca3af]" />
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search nodes..."
                className="nodrag w-full rounded-xl border border-[#e5e7eb] bg-[#f8fafc] py-2 pl-9 pr-3 text-xs text-[#2d2a24] placeholder:text-[#9ca3af]"
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <p className="py-4 text-center text-xs text-[#9e9689]">
                No nodes found
              </p>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => handleAddNode(opt.type)}
                  className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-[#f7f9fc]"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${opt.bgColor}`}
                  >
                    <opt.icon className={`h-4 w-4 ${opt.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#201d18]">
                      {opt.label}
                    </p>
                    <p className="text-xs text-[#8f877a]">{opt.description}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-16 w-16 items-center justify-center rounded-[18px] border shadow-[0_18px_32px_rgba(17,24,39,0.12)] transition-all ${
          isOpen
            ? "rotate-45 border-[#dddffd] bg-[#f1f2ff]"
            : "border-[#e5e7eb] bg-white hover:bg-[#fafafa]"
        }`}
      >
        {isOpen ? (
          <X className="h-5 w-5 text-[#6e56cf]" />
        ) : (
          <Plus className="h-5 w-5 text-[#6b7280]" />
        )}
      </button>
    </div>
  );
}
