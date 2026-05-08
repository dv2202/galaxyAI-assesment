"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Undo2,
  Redo2,
  Command,
  ZoomOut,
  ZoomIn,
  Maximize2,
  LayoutGrid,
  Move,
  MousePointer2,
} from "lucide-react";
import { useReactFlow, useViewport } from "@xyflow/react";
import { useWorkflowStore } from "@/stores/workflow-store";
import { useCanvasModeStore } from "@/stores/canvas-mode-store";
import Dagre from "@dagrejs/dagre";
import { NON_DELETABLE_NODES } from "@/lib/constants";
import { KeyboardShortcutsModal } from "./keyboard-shortcuts-modal";
import type { WorkflowNode, WorkflowEdge } from "@/types/workflow";

const CANVAS_TOOLBAR_COLLAPSED_KEY = "galaxy-canvas-toolbar-collapsed";

function readToolbarCollapsedState() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(CANVAS_TOOLBAR_COLLAPSED_KEY) === "true";
}

function Sep() {
  return <div className="h-5 w-px bg-[#e5e7eb]" />;
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
      className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
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

  const g = new Dagre.graphlib.Graph({ directed: true, compound: false });
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "LR", nodesep: 80, ranksep: 200, marginx: 40, marginy: 40 });

  for (const node of nodes) {
    const w = node.measured?.width ?? 340;
    const h = node.measured?.height ?? 200;
    g.setNode(node.id, { width: w, height: h });
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  Dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    const w = node.measured?.width ?? 340;
    const h = node.measured?.height ?? 200;
    return {
      ...node,
      position: { x: pos.x - w / 2, y: pos.y - h / 2 },
    };
  });
}

export function CanvasToolbar() {
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const selectMode = useCanvasModeStore((s) => s.selectMode);
  const toggleSelectMode = useCanvasModeStore((s) => s.toggleSelectMode);
  const [collapsed, setCollapsed] = useState(readToolbarCollapsedState);
  const { zoomIn, zoomOut, fitView, setNodes } = useReactFlow();
  const viewport = useViewport();
  const clipboardRef = useRef<WorkflowNode[]>([]);

  useEffect(() => {
    function syncToolbarCollapsed() {
      setCollapsed(readToolbarCollapsedState());
    }

    window.addEventListener("storage", syncToolbarCollapsed);
    return () => window.removeEventListener("storage", syncToolbarCollapsed);
  }, []);

  const zoomPercent = Math.round(viewport.zoom * 100);

  const toggleCollapsed = useCallback(() => {
    const nextValue = !readToolbarCollapsedState();
    window.localStorage.setItem(
      CANVAS_TOOLBAR_COLLAPSED_KEY,
      String(nextValue)
    );
    setCollapsed(nextValue);
  }, []);

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
    toggleSelectMode();
  }, [toggleSelectMode]);

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
      <div className="absolute bottom-5 left-5 z-10">
        {collapsed ? (
          <button
            type="button"
            onClick={toggleCollapsed}
            title="Expand toolbar"
            className="flex items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 text-[#6b7280] shadow-[0_12px_30px_rgba(17,24,39,0.06)] transition hover:bg-[#fafafa] hover:text-[#374151]"
          >
            <ChevronRight className="h-4 w-4" />
            {/* <span className="text-[11px] font-medium">{zoomPercent}%</span> */}
          </button>
        ) : (
          <div className="flex items-center gap-0.5 rounded-2xl border border-[#e5e7eb] bg-white px-2.5 py-1.5 shadow-[0_12px_30px_rgba(17,24,39,0.06)]">
            <Btn onClick={toggleCollapsed} title="Collapse toolbar">
              <ChevronLeft className="h-3.5 w-3.5" />
            </Btn>

            <Sep />

            <Btn onClick={handleUndo} title="Undo (⌘Z)">
              <Undo2 className="h-3.5 w-3.5" />
            </Btn>
            <Btn onClick={handleRedo} title="Redo (⌘⇧Z)">
              <Redo2 className="h-3.5 w-3.5" />
            </Btn>
            <Btn
              onClick={() => setShortcutsOpen(true)}
              title="Keyboard Shortcuts"
            >
              <Command className="h-3.5 w-3.5" />
            </Btn>

            <Sep />

            <Btn onClick={() => zoomOut({ duration: 200 })} title="Zoom Out (-)">
              <ZoomOut className="h-3.5 w-3.5" />
            </Btn>
            <span className="min-w-[36px] text-center text-[11px] font-medium text-[#6b7280]">
              {zoomPercent}%
            </span>
            <Btn onClick={() => zoomIn({ duration: 200 })} title="Zoom In (+)">
              <ZoomIn className="h-3.5 w-3.5" />
            </Btn>

            <Sep />

            <Btn onClick={handleFitView} title="Fit View (F)">
              <Maximize2 className="h-3.5 w-3.5" />
            </Btn>
            <Btn onClick={handleAutoArrange} title="Auto-arrange (⇧A)">
              <LayoutGrid className="h-3.5 w-3.5" />
            </Btn>
            <Btn
              onClick={handleToggleSelectMode}
              title="Toggle Select Mode (S)"
              active={selectMode}
            >
              {selectMode ? (
                <MousePointer2 className="h-3.5 w-3.5" />
              ) : (
                <Move className="h-3.5 w-3.5" />
              )}
            </Btn>

          </div>
        )}
      </div>

      <KeyboardShortcutsModal
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </>
  );
}
