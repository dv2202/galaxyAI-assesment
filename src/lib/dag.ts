import type { WorkflowNode, WorkflowEdge } from "@/types/workflow";
import { NODE_TYPES } from "./constants";

export interface DAGGraph {
  adjacency: Map<string, string[]>;
  reverseAdj: Map<string, string[]>;
  inDegree: Map<string, number>;
  nodes: Map<string, WorkflowNode>;
}

export function buildDAG(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): DAGGraph {
  const adjacency = new Map<string, string[]>();
  const reverseAdj = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  const nodeMap = new Map<string, WorkflowNode>();

  for (const node of nodes) {
    adjacency.set(node.id, []);
    reverseAdj.set(node.id, []);
    inDegree.set(node.id, 0);
    nodeMap.set(node.id, node);
  }

  for (const edge of edges) {
    const existing = adjacency.get(edge.source) ?? [];
    if (!existing.includes(edge.target)) {
      existing.push(edge.target);
      adjacency.set(edge.source, existing);
    }

    const rev = reverseAdj.get(edge.target) ?? [];
    if (!rev.includes(edge.source)) {
      rev.push(edge.source);
      reverseAdj.set(edge.target, rev);
    }

    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  }

  return { adjacency, reverseAdj, inDegree, nodes: nodeMap };
}

export function hasCycle(nodes: WorkflowNode[], edges: WorkflowEdge[]): boolean {
  const graph = buildDAG(nodes, edges);
  const inDegree = new Map(graph.inDegree);
  const queue: string[] = [];

  for (const [nodeId, degree] of inDegree) {
    if (degree === 0) queue.push(nodeId);
  }

  let visited = 0;
  while (queue.length > 0) {
    const current = queue.shift()!;
    visited++;
    const neighbors = graph.adjacency.get(current) ?? [];
    for (const neighbor of neighbors) {
      const newDegree = (inDegree.get(neighbor) ?? 0) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) queue.push(neighbor);
    }
  }

  return visited < nodes.length;
}

export function topologicalSort(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): string[] {
  const graph = buildDAG(nodes, edges);
  const inDegree = new Map(graph.inDegree);
  const queue: string[] = [];
  const sorted: string[] = [];

  for (const [nodeId, degree] of inDegree) {
    if (degree === 0) queue.push(nodeId);
  }

  while (queue.length > 0) {
    const current = queue.shift()!;
    sorted.push(current);
    const neighbors = graph.adjacency.get(current) ?? [];
    for (const neighbor of neighbors) {
      const newDegree = (inDegree.get(neighbor) ?? 0) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) queue.push(neighbor);
    }
  }

  return sorted;
}

export function findReadyNodes(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  completedNodes: Set<string>,
  nodesToExecute: Set<string>
): string[] {
  const ready: string[] = [];

  for (const node of nodes) {
    if (!nodesToExecute.has(node.id)) continue;
    if (completedNodes.has(node.id)) continue;
    if (node.type === NODE_TYPES.REQUEST_INPUTS) continue;
    if (node.type === NODE_TYPES.RESPONSE) continue;

    const incomingEdges = edges.filter((e) => e.target === node.id);
    const allDepsComplete = incomingEdges.every(
      (e) =>
        completedNodes.has(e.source) ||
        !nodesToExecute.has(e.source) ||
        nodes.find((n) => n.id === e.source)?.type === NODE_TYPES.REQUEST_INPUTS
    );

    if (allDepsComplete) {
      ready.push(node.id);
    }
  }

  return ready;
}

export function getExecutableNodes(nodes: WorkflowNode[]): Set<string> {
  return new Set(
    nodes
      .filter(
        (n) =>
          n.type !== NODE_TYPES.REQUEST_INPUTS &&
          n.type !== NODE_TYPES.RESPONSE
      )
      .map((n) => n.id)
  );
}
