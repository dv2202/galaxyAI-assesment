import { create } from "zustand";
import { temporal } from "zundo";
import {
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type Connection,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react";
import { NON_DELETABLE_NODES } from "@/lib/constants";
import { hasCycle } from "@/lib/dag";
import type { WorkflowNode, WorkflowEdge } from "@/types/workflow";

interface WorkflowState {
  workflowId: string | null;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  isDirty: boolean;

  setWorkflowId: (id: string) => void;
  setNodes: (nodes: WorkflowNode[]) => void;
  setEdges: (edges: WorkflowEdge[]) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  addNode: (node: WorkflowNode) => void;
  removeNode: (id: string) => void;
  updateNodeData: (id: string, data: Partial<Record<string, unknown>>) => void;
  hydrate: (nodes: WorkflowNode[], edges: WorkflowEdge[], workflowId: string) => void;
  markClean: () => void;
}

export const useWorkflowStore = create<WorkflowState>()(
  temporal(
    (set, get) => ({
      workflowId: null,
      nodes: [],
      edges: [],
      isDirty: false,

      setWorkflowId: (id) => set({ workflowId: id }),

      setNodes: (nodes) => set({ nodes, isDirty: true }),

      setEdges: (edges) => set({ edges, isDirty: true }),

      onNodesChange: (changes) => {
        const filteredChanges = changes.filter((change) => {
          if (change.type === "remove") {
            const node = get().nodes.find((n) => n.id === change.id);
            if (node && NON_DELETABLE_NODES.includes(node.type as string)) {
              return false;
            }
          }
          return true;
        });
        set({
          nodes: applyNodeChanges(filteredChanges, get().nodes) as WorkflowNode[],
          isDirty: true,
        });
      },

      onEdgesChange: (changes) => {
        set({
          edges: applyEdgeChanges(changes, get().edges) as WorkflowEdge[],
          isDirty: true,
        });
      },

      onConnect: (connection) => {
        const { nodes, edges } = get();
        const newEdge: Edge = {
          ...connection,
          id: `edge-${connection.source}-${connection.sourceHandle}-${connection.target}-${connection.targetHandle}`,
          animated: true,
          style: { stroke: "#8b5cf6", strokeWidth: 2 },
        };
        const newEdges = addEdge(newEdge, edges);

        if (hasCycle(nodes, newEdges as WorkflowEdge[])) {
          return;
        }

        set({ edges: newEdges as WorkflowEdge[], isDirty: true });
      },

      addNode: (node) => {
        set({ nodes: [...get().nodes, node], isDirty: true });
      },

      removeNode: (id) => {
        const node = get().nodes.find((n) => n.id === id);
        if (node && NON_DELETABLE_NODES.includes(node.type as string)) return;
        set({
          nodes: get().nodes.filter((n) => n.id !== id),
          edges: get().edges.filter(
            (e) => e.source !== id && e.target !== id
          ),
          isDirty: true,
        });
      },

      updateNodeData: (id, data) => {
        set({
          nodes: get().nodes.map((node) =>
            node.id === id
              ? { ...node, data: { ...node.data, ...data } }
              : node
          ),
          isDirty: true,
        });
      },

      hydrate: (nodes, edges, workflowId) => {
        set({ nodes, edges, workflowId, isDirty: false });
      },

      markClean: () => set({ isDirty: false }),
    }),
    { limit: 50 }
  )
);
