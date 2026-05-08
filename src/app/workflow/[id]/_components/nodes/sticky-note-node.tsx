"use client";

import { useCallback } from "react";
import { NodeResizer } from "@xyflow/react";
import { useWorkflowStore } from "@/stores/workflow-store";

interface StickyNoteData {
  text?: string;
  color?: string;
}

const COLORS: Record<string, { bg: string; border: string; ring: string }> = {
  yellow: { bg: "bg-[#fef9c3]", border: "border-[#facc15]", ring: "ring-[#facc15]/30" },
  blue: { bg: "bg-[#dbeafe]", border: "border-[#60a5fa]", ring: "ring-[#60a5fa]/30" },
  green: { bg: "bg-[#dcfce7]", border: "border-[#4ade80]", ring: "ring-[#4ade80]/30" },
  pink: { bg: "bg-[#fce7f3]", border: "border-[#f472b6]", ring: "ring-[#f472b6]/30" },
};

export function StickyNoteNode({ id, data, selected }: { id: string; data: StickyNoteData; selected?: boolean }) {
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const colorKey = data.color || "yellow";
  const c = COLORS[colorKey] || COLORS.yellow;

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeData(id, { text: e.target.value });
    },
    [id, updateNodeData]
  );

  const cycleColor = useCallback(() => {
    const keys = Object.keys(COLORS);
    const idx = keys.indexOf(colorKey);
    const next = keys[(idx + 1) % keys.length];
    updateNodeData(id, { color: next });
  }, [id, colorKey, updateNodeData]);

  return (
    <>
      <NodeResizer
        minWidth={160}
        minHeight={100}
        isVisible={selected}
        lineClassName="!border-[#facc15]"
        handleClassName="!w-2.5 !h-2.5 !bg-white !border-2 !border-[#facc15] !rounded-full"
      />
      <div
        className={`h-60 w-60 rounded-lg border ${c.bg} ${c.border} p-3 shadow-sm ${selected ? `ring-2 ${c.ring}` : ""}`}
      >
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[20px] font-semibold uppercase tracking-wide text-[#78716c]">
            Note
          </span>
          <button
            onClick={cycleColor}
            title="Change color"
            className="flex h-6 w-6 items-center justify-center rounded-full border border-black/10 bg-white/60 text-[9px] leading-none text-[#78716c] hover:bg-white"
          >
            &bull;
          </button>
        </div>
        <textarea
          value={data.text || ""}
          onChange={handleTextChange}
          placeholder="Type a note..."
          className="nodrag nowheel h-full w-full resize-none bg-transparent text-lg text-[#44403c] outline-none placeholder:text-[#a8a29e]"
        />
      </div>
    </>
  );
}
