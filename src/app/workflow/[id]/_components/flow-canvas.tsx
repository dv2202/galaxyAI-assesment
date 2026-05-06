"use client";

import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  type IsValidConnection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useWorkflowStore } from "@/stores/workflow-store";
import { useCanvasModeStore } from "@/stores/canvas-mode-store";
import { useWorkflowPersist } from "@/hooks/use-workflow-persist";
import { RequestInputsNode } from "./nodes/request-inputs-node";
import { CropImageNode } from "./nodes/crop-image-node";
import { GeminiNode } from "./nodes/gemini-node";
import { ResponseNode } from "./nodes/response-node";

const nodeTypes = {
  "request-inputs": RequestInputsNode,
  "crop-image": CropImageNode,
  gemini: GeminiNode,
  response: ResponseNode,
};

function parseHandleType(handleId: string | null | undefined): string | null {
  if (!handleId) return null;
  const parts = handleId.split("-");
  if (parts.length >= 2) {
    return parts[parts.length - 2];
  }
  return null;
}

export function FlowCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } =
    useWorkflowStore();
  const selectMode = useCanvasModeStore((s) => s.selectMode);

  useWorkflowPersist();

  const isValidConnection: IsValidConnection = useCallback((connection) => {
    if (connection.source === connection.target) return false;

    const sourceType = parseHandleType(connection.sourceHandle);
    const targetType = parseHandleType(connection.targetHandle);

    if (!sourceType || !targetType) return true;
    return sourceType === targetType;
  }, []);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      isValidConnection={isValidConnection}
      fitView
      minZoom={0.1}
      maxZoom={2}
      panOnDrag={!selectMode}
      selectionOnDrag={selectMode}
      multiSelectionKeyCode="Shift"
      deleteKeyCode={["Backspace", "Delete"]}
      className="bg-[#ffffff]"
      defaultEdgeOptions={{
        animated: true,
        style: { stroke: "#f6a31a", strokeWidth: 2.2 },
      }}
      connectionLineStyle={{ stroke: "#f6a31a", strokeWidth: 2.2 }}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={19}
        size={1.15}
        color="#d6d9de"
      />
    </ReactFlow>
  );
}
