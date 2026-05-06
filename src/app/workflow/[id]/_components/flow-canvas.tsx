"use client";

import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  MiniMap,
  Controls,
  BackgroundVariant,
  type IsValidConnection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useWorkflowStore } from "@/stores/workflow-store";
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
      multiSelectionKeyCode="Shift"
      deleteKeyCode={["Backspace", "Delete"]}
      className="bg-[#0a0a0f]"
      defaultEdgeOptions={{
        animated: true,
        style: { stroke: "#8b5cf6", strokeWidth: 2 },
      }}
      connectionLineStyle={{ stroke: "#8b5cf6", strokeWidth: 2 }}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={20}
        size={1}
        color="#2a2a4a"
      />
      <MiniMap
        nodeColor="#8b5cf6"
        maskColor="rgba(10, 10, 15, 0.8)"
        position="bottom-right"
      />
      <Controls position="bottom-left" />
    </ReactFlow>
  );
}
