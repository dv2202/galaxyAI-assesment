"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Search, Crop, Sparkles, StickyNote, X } from "lucide-react";
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

export function CenterToolbar() {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { getViewport } = useReactFlow();
  const addNode = useWorkflowStore((s) => s.addNode);

  useEffect(() => {
    if (pickerOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [pickerOpen]);

  const filtered = NODE_OPTIONS.filter(
    (opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase()) ||
      opt.category.toLowerCase().includes(search.toLowerCase()),
  );

  function handleAddNode(type: string) {
    const vp = getViewport();
    const position = {
      x: (-vp.x + 400) / vp.zoom,
      y: (-vp.y + 300) / vp.zoom,
    };
    const id = `${type}-${crypto.randomUUID()}`;
    let data: Record<string, unknown> = {};
    if (type === NODE_TYPES.CROP_IMAGE) {
      data = { xPosition: 0, yPosition: 0, width: 100, height: 100 };
    } else if (type === NODE_TYPES.GEMINI) {
      data = {
        model: "gemini-2.5-flash",
        prompt: "",
        systemPrompt: "",
        imageInputs: [],
      };
    }
    addNode({ id, type, position, data });
    setPickerOpen(false);
    setSearch("");
  }

  function handleAddStickyNote() {
    const vp = getViewport();
    const position = {
      x: (-vp.x + 400) / vp.zoom,
      y: (-vp.y + 300) / vp.zoom,
    };
    const id = `sticky-note-${crypto.randomUUID()}`;
    addNode({
      id,
      type: NODE_TYPES.STICKY_NOTE,
      position,
      data: { text: "", color: "yellow" },
      style: { width: 200, height: 150 },
    });
  }

  return (
    <div className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2">
      <div className="relative flex items-center gap-1 rounded-2xl border border-[#e5e7eb] bg-white px-2 py-1.5 shadow-[0_12px_30px_rgba(17,24,39,0.06)]">
        <div className="relative">
          {pickerOpen && (
            <div className="absolute bottom-11 left-1/2 w-72 -translate-x-1/2 overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_16px_40px_rgba(17,24,39,0.10)]">
              <div className="border-b border-[#eef0f3] p-2.5">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-[#9ca3af]" />
                  <input
                    ref={searchInputRef}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search nodes..."
                    className="nodrag w-full rounded-lg border border-[#e5e7eb] bg-[#f8fafc] py-1.5 pl-8 pr-2.5 text-xs text-[#2d2a24] placeholder:text-[#9ca3af]"
                  />
                </div>
              </div>
              <div className="max-h-52 overflow-y-auto p-1.5">
                {filtered.length === 0 ? (
                  <p className="py-3 text-center text-xs text-[#9e9689]">
                    No nodes found
                  </p>
                ) : (
                  filtered.map((opt) => (
                    <button
                      key={opt.type}
                      onClick={() => handleAddNode(opt.type)}
                      className="flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition-colors hover:bg-[#f7f9fc]"
                    >
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${opt.bgColor}`}
                      >
                        <opt.icon className={`h-3.5 w-3.5 ${opt.color}`} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#201d18]">
                          {opt.label}
                        </p>
                        <p className="text-[11px] text-[#8f877a]">
                          {opt.description}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
          <div className="flex flex-row justify-between items-center gap-2">
          <button
            onClick={handleAddStickyNote}
            title="Add Sticky Note"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[#6b7280] transition-colors hover:bg-[#fef9c3] hover:text-[#a16207]"
          >
            <StickyNote className="h-4 w-4" />
          </button>
          <div className="h-5 w-px bg-[#e5e7eb]" />
          <button
            onClick={() => {
              setPickerOpen(!pickerOpen);
              setSearch("");
            }}
            title="Add Node"
            className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
              pickerOpen
                ? "bg-[#efecff] text-[#6258e5]"
                : "text-[#6b7280] hover:bg-[#f5f7fb] hover:text-[#374151]"
            }`}
          >
            {pickerOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </button>
          </div>
        </div>

        
      </div>
    </div>
  );
}
