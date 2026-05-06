"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Undo2,
  Redo2,
  Command,
  ZoomOut,
  ZoomIn,
  Maximize2,
  LayoutGrid,
  Move,
  MousePointer2,
  Plus,
  Search,
  Crop,
  Sparkles,
  X,
} from "lucide-react";
import { useReactFlow, useViewport } from "@xyflow/react";
import { useWorkflowStore } from "@/stores/workflow-store";
import { NON_DELETABLE_NODES, NODE_TYPES } from "@/lib/constants";
import { buildDAG } from "@/lib/dag";
import { KeyboardShortcutsModal } from "./keyboard-shortcuts-modal";
import type { WorkflowNode, WorkflowEdge } from "@/types/workflow";

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

function Sep() {
  return <div className="h-7 w-px bg-[#e5e7eb]" />;
}

function Btn({
  onClick,
  title,
  active,
  children,
}: {
  onClick: () => void;
  title: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
        active
          ? "bg-[#efecff] text-[#6258e5]"
          : "text-[#6b7280] hover:bg-[#f5f7fb] hover:text-[#374151]"
      }`}
    >
      {children}
    </button>
  );
}

function autoArrange(nodes: WorkflowNode[], edges: WorkflowEdge[]) {
  if (nodes.length === 0) return nodes;

  const graph = buildDAG(nodes, edges);
  const layers = new Map<string, number>();

  const queue: string[] = [];
  for (const [id, deg] of graph.inDegree) {
    if (deg === 0) {
      queue.push(id);
      layers.set(id, 0);
    }
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentLayer = layers.get(current) ?? 0;
    for (const neighbor of graph.adjacency.get(current) ?? []) {
      const existing = layers.get(neighbor) ?? 0;
      layers.set(neighbor, Math.max(existing, currentLayer + 1));
      const newDeg = (graph.inDegree.get(neighbor) ?? 1) - 1;
      graph.inDegree.set(neighbor, newDeg);
      if (newDeg === 0) queue.push(neighbor);
    }
  }

  for (const node of nodes) {
    if (!layers.has(node.id)) layers.set(node.id, 0);
  }

  const columns = new Map<number, string[]>();
  for (const [id, layer] of layers) {
    const col = columns.get(layer) ?? [];
    col.push(id);
    columns.set(layer, col);
  }

  const X_GAP = 350;
  const Y_GAP = 200;

  return nodes.map((node) => {
    const layer = layers.get(node.id) ?? 0;
    const col = columns.get(layer) ?? [];
    const idx = col.indexOf(node.id);
    const colHeight = col.length * Y_GAP;
    return {
      ...node,
      position: {
        x: 100 + layer * X_GAP,
        y: 100 + idx * Y_GAP - colHeight / 2 + Y_GAP / 2,
      },
    };
  });
}

export function CanvasToolbar() {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { zoomIn, zoomOut, fitView, setNodes, getViewport } = useReactFlow();
  const viewport = useViewport();
  const clipboardRef = useRef<WorkflowNode[]>([]);
  const addNode = useWorkflowStore((s) => s.addNode);

  useEffect(() => {
    if (pickerOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [pickerOpen]);

  const filtered = NODE_OPTIONS.filter(
    (opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase()) ||
      opt.category.toLowerCase().includes(search.toLowerCase())
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
      data = { model: "gemini-2.5-pro", prompt: "", systemPrompt: "", imageInputs: [] };
    }
    addNode({ id, type, position, data });
    setPickerOpen(false);
    setSearch("");
  }

  const zoomPercent = Math.round(viewport.zoom * 100);

  const handleUndo = useCallback(() => {
    useWorkflowStore.temporal.getState().undo();
  }, []);

  const handleRedo = useCallback(() => {
    useWorkflowStore.temporal.getState().redo();
  }, []);

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.2, duration: 300 });
  }, [fitView]);

  const handleAutoArrange = useCallback(() => {
    const { nodes, edges } = useWorkflowStore.getState();
    const arranged = autoArrange(nodes, edges);
    useWorkflowStore.getState().setNodes(arranged);
    setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
  }, [fitView]);

  const handleToggleSelectMode = useCallback(() => {
    setSelectMode((prev) => !prev);
    const flow = document.querySelector(".react-flow");
    if (flow) {
      if (!selectMode) {
        flow.classList.add("select-mode");
      } else {
        flow.classList.remove("select-mode");
      }
    }
  }, [selectMode]);

  const handleSelectAll = useCallback(() => {
    const { nodes } = useWorkflowStore.getState();
    const updated = nodes.map((n) => ({ ...n, selected: true }));
    setNodes(updated);
  }, [setNodes]);

  const handleDeselectAll = useCallback(() => {
    const { nodes } = useWorkflowStore.getState();
    const updated = nodes.map((n) => ({ ...n, selected: false }));
    setNodes(updated);
  }, [setNodes]);

  const handleCopy = useCallback(() => {
    const { nodes } = useWorkflowStore.getState();
    clipboardRef.current = nodes.filter(
      (n) => n.selected && !NON_DELETABLE_NODES.includes(n.type as string)
    );
  }, []);

  const handlePaste = useCallback(() => {
    if (clipboardRef.current.length === 0) return;
    const store = useWorkflowStore.getState();
    const offset = 50;
    const newNodes = clipboardRef.current.map((n) => ({
      ...n,
      id: `${n.type}-${crypto.randomUUID()}`,
      position: { x: n.position.x + offset, y: n.position.y + offset },
      selected: true,
    }));
    const deselected = store.nodes.map((n) => ({ ...n, selected: false }));
    store.setNodes([...deselected, ...newNodes]);
  }, []);

  const handleDuplicate = useCallback(() => {
    const store = useWorkflowStore.getState();
    const selected = store.nodes.filter(
      (n) => n.selected && !NON_DELETABLE_NODES.includes(n.type as string)
    );
    if (selected.length === 0) return;
    const newNodes = selected.map((n) => ({
      ...n,
      id: `${n.type}-${crypto.randomUUID()}`,
      position: { x: n.position.x + 50, y: n.position.y + 50 },
      selected: true,
    }));
    const deselected = store.nodes.map((n) => ({ ...n, selected: false }));
    store.setNodes([...deselected, ...newNodes]);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      if (e.key === "Escape") {
        if (shortcutsOpen) {
          setShortcutsOpen(false);
          return;
        }
        handleDeselectAll();
        return;
      }

      if (isInput) return;

      const meta = e.metaKey || e.ctrlKey;

      if (meta && e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        handleRedo();
        return;
      }
      if (meta && e.key.toLowerCase() === "z") {
        e.preventDefault();
        handleUndo();
        return;
      }
      if (meta && e.key.toLowerCase() === "a") {
        e.preventDefault();
        handleSelectAll();
        return;
      }
      if (meta && e.key.toLowerCase() === "c") {
        e.preventDefault();
        handleCopy();
        return;
      }
      if (meta && e.key.toLowerCase() === "v") {
        e.preventDefault();
        handlePaste();
        return;
      }
      if (meta && e.key.toLowerCase() === "d") {
        e.preventDefault();
        handleDuplicate();
        return;
      }

      if (e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        handleAutoArrange();
        return;
      }

      if (!meta && !e.shiftKey) {
        switch (e.key) {
          case "=":
          case "+":
            e.preventDefault();
            zoomIn({ duration: 200 });
            break;
          case "-":
            e.preventDefault();
            zoomOut({ duration: 200 });
            break;
          case "f":
            e.preventDefault();
            handleFitView();
            break;
          case "s":
            e.preventDefault();
            handleToggleSelectMode();
            break;
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    shortcutsOpen,
    handleUndo,
    handleRedo,
    handleSelectAll,
    handleDeselectAll,
    handleCopy,
    handlePaste,
    handleDuplicate,
    handleAutoArrange,
    handleFitView,
    handleToggleSelectMode,
    zoomIn,
    zoomOut,
  ]);

  return (
    <>
      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
        <div className="flex items-center gap-1 rounded-[20px] border border-[#e5e7eb] bg-white px-3 py-2 shadow-[0_18px_40px_rgba(17,24,39,0.08)]">
          <Btn onClick={handleUndo} title="Undo (⌘Z)">
            <Undo2 className="h-4 w-4" />
          </Btn>
          <Btn onClick={handleRedo} title="Redo (⌘⇧Z)">
            <Redo2 className="h-4 w-4" />
          </Btn>
          <Btn
            onClick={() => setShortcutsOpen(true)}
            title="Keyboard Shortcuts"
          >
            <Command className="h-4 w-4" />
          </Btn>

          <Sep />

          <Btn onClick={() => zoomOut({ duration: 200 })} title="Zoom Out (-)">
            <ZoomOut className="h-4 w-4" />
          </Btn>
          <span className="min-w-[42px] text-center text-xs font-medium text-[#6b7280]">
            {zoomPercent}%
          </span>
          <Btn onClick={() => zoomIn({ duration: 200 })} title="Zoom In (+)">
            <ZoomIn className="h-4 w-4" />
          </Btn>

          <Sep />

          <Btn onClick={handleFitView} title="Fit View (F)">
            <Maximize2 className="h-4 w-4" />
          </Btn>
          <Btn onClick={handleAutoArrange} title="Auto-arrange (⇧A)">
            <LayoutGrid className="h-4 w-4" />
          </Btn>
          <Btn
            onClick={handleToggleSelectMode}
            title="Toggle Select Mode (S)"
            active={selectMode}
          >
            {selectMode ? (
              <MousePointer2 className="h-4 w-4" />
            ) : (
              <Move className="h-4 w-4" />
            )}
          </Btn>

          <Sep />

          <div className="relative">
            {pickerOpen && (
              <div className="absolute bottom-14 right-0 w-80 overflow-hidden rounded-[22px] border border-[#e5e7eb] bg-white shadow-[0_24px_60px_rgba(17,24,39,0.12)]">
                <div className="border-b border-[#eef0f3] p-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9ca3af]" />
                    <input
                      ref={searchInputRef}
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
            <Btn
              onClick={() => {
                setPickerOpen(!pickerOpen);
                setSearch("");
              }}
              title="Add Node"
              active={pickerOpen}
            >
              {pickerOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Btn>
          </div>
        </div>
      </div>

      <KeyboardShortcutsModal
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </>
  );
}
