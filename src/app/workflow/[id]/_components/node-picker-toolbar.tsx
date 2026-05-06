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
    color: "text-green-400",
    bgColor: "bg-green-500/20",
  },
  {
    type: NODE_TYPES.GEMINI,
    label: "Gemini 3.1 Pro",
    icon: Sparkles,
    category: "LLM",
    description: "Generate text with Google Gemini",
    color: "text-violet-400",
    bgColor: "bg-violet-500/20",
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
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
      {isOpen && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-72 bg-[#1a1a2e] border border-[#2a2a4a] rounded-xl shadow-2xl overflow-hidden">
          <div className="p-3 border-b border-[#2a2a4a]">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search nodes..."
                className="w-full bg-[#0a0a0f] border border-[#2a2a4a] rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder:text-muted"
              />
            </div>
          </div>
          <div className="p-2 max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-xs text-muted text-center py-4">
                No nodes found
              </p>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => handleAddNode(opt.type)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#2a2a4a] transition-colors text-left"
                >
                  <div
                    className={`w-8 h-8 rounded-lg ${opt.bgColor} flex items-center justify-center shrink-0`}
                  >
                    <opt.icon className={`w-4 h-4 ${opt.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">
                      {opt.label}
                    </p>
                    <p className="text-xs text-muted">{opt.description}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${
          isOpen
            ? "bg-[#2a2a4a] border border-[#3a3a5a] rotate-45"
            : "bg-primary hover:bg-primary-hover border border-primary"
        }`}
      >
        {isOpen ? (
          <X className="w-4 h-4 text-white" />
        ) : (
          <Plus className="w-4 h-4 text-white" />
        )}
      </button>
    </div>
  );
}
