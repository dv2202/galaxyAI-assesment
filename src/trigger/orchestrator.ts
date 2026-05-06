import { task } from "@trigger.dev/sdk/v3";
import { db } from "@/lib/db";
import { NODE_TYPES } from "@/lib/constants";
import type { WorkflowNode, WorkflowEdge } from "@/types/workflow";
import { cropImageTask } from "./crop-image";
import { geminiGenerateTask } from "./gemini-generate";

interface OrchestratorPayload {
  runId: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  inputs: Record<string, unknown>;
  selectedNodeIds?: string[];
}

export const workflowOrchestrator = task({
  id: "workflow-orchestrator",
  maxDuration: 300,
  run: async (payload: OrchestratorPayload) => {
    const { runId, nodes, edges, inputs, selectedNodeIds } = payload;
    const startTime = Date.now();

    const nodeOutputs: Record<string, unknown> = {};
    const completedNodes = new Set<string>();

    // Seed Request-Inputs outputs
    const requestInputsNode = nodes.find(
      (n) => n.type === NODE_TYPES.REQUEST_INPUTS
    );
    if (requestInputsNode) {
      completedNodes.add(requestInputsNode.id);
      const fields = (requestInputsNode.data as { fields: { id: string; value?: string }[] }).fields || [];
      for (const field of fields) {
        nodeOutputs[`${requestInputsNode.id}:${field.id}`] = field.value || "";
      }
    }

    // Determine which nodes to execute
    const executableNodes = nodes.filter((n) => {
      if (n.type === NODE_TYPES.REQUEST_INPUTS || n.type === NODE_TYPES.RESPONSE) return false;
      if (selectedNodeIds) return selectedNodeIds.includes(n.id);
      return true;
    });

    const executableIds = new Set(executableNodes.map((n) => n.id));
    let hasError = false;

    // Main execution loop
    while (true) {
      const readyNodes = findReadyNodes(
        executableNodes,
        edges,
        completedNodes,
        executableIds
      );

      if (readyNodes.length === 0) break;

      // Execute all ready nodes in parallel
      const results = await Promise.allSettled(
        readyNodes.map((nodeId) =>
          executeNode(nodeId, nodes, edges, nodeOutputs, runId)
        )
      );

      for (let i = 0; i < results.length; i++) {
        const nodeId = readyNodes[i];
        const result = results[i];

        if (result.status === "fulfilled") {
          nodeOutputs[nodeId] = result.value;
          completedNodes.add(nodeId);
        } else {
          completedNodes.add(nodeId);
          hasError = true;
          await db.workflowNodeResult.update({
            where: { runId_nodeId: { runId, nodeId } },
            data: {
              status: "FAILED",
              error: result.reason?.message || "Unknown error",
              completedAt: new Date(),
            },
          });
        }
      }
    }

    // Handle Response node
    const responseNode = nodes.find((n) => n.type === NODE_TYPES.RESPONSE);
    if (responseNode) {
      const incomingEdge = edges.find((e) => e.target === responseNode.id);
      if (incomingEdge) {
        const sourceOutput = nodeOutputs[incomingEdge.source];
        nodeOutputs[responseNode.id] = sourceOutput;
      }
    }

    const duration = Date.now() - startTime;
    const finalStatus = hasError ? "PARTIAL" : "COMPLETED";

    await db.workflowRun.update({
      where: { id: runId },
      data: {
        status: finalStatus,
        completedAt: new Date(),
        duration,
      },
    });

    return { status: finalStatus, nodeOutputs, duration };
  },
});

function findReadyNodes(
  executableNodes: WorkflowNode[],
  edges: WorkflowEdge[],
  completedNodes: Set<string>,
  executableIds: Set<string>
): string[] {
  const ready: string[] = [];

  for (const node of executableNodes) {
    if (completedNodes.has(node.id)) continue;

    const incomingEdges = edges.filter((e) => e.target === node.id);
    const allDepsComplete = incomingEdges.every(
      (e) => completedNodes.has(e.source) || !executableIds.has(e.source)
    );

    if (allDepsComplete) {
      ready.push(node.id);
    }
  }

  return ready;
}

async function executeNode(
  nodeId: string,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  nodeOutputs: Record<string, unknown>,
  runId: string
): Promise<unknown> {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) throw new Error(`Node ${nodeId} not found`);

  await db.workflowNodeResult.update({
    where: { runId_nodeId: { runId, nodeId } },
    data: { status: "RUNNING", startedAt: new Date() },
  });

  const nodeStart = Date.now();
  let result: unknown;

  try {
    const inputValues = gatherInputs(nodeId, nodes, edges, nodeOutputs);

    switch (node.type) {
      case NODE_TYPES.CROP_IMAGE: {
        const cropResult = await cropImageTask.triggerAndWait({
          imageUrl: inputValues.inputImage as string,
          xPosition: (node.data as { xPosition?: number }).xPosition ?? 0,
          yPosition: (node.data as { yPosition?: number }).yPosition ?? 0,
          width: (node.data as { width?: number }).width ?? 100,
          height: (node.data as { height?: number }).height ?? 100,
        });
        if (cropResult.ok) {
          result = cropResult.output;
        } else {
          throw new Error("Crop task failed");
        }
        break;
      }
      case NODE_TYPES.GEMINI: {
        const nodeData = node.data as {
          prompt?: string;
          systemPrompt?: string;
          model?: string;
        };
        const prompt = (inputValues.prompt as string) || nodeData.prompt || "";
        const systemPrompt = (inputValues.systemPrompt as string) || nodeData.systemPrompt || "";

        const geminiResult = await geminiGenerateTask.triggerAndWait({
          prompt,
          systemPrompt,
          model: nodeData.model || "gemini-2.5-pro",
          imageUrls: (inputValues.images as string[]) || [],
        });
        if (geminiResult.ok) {
          result = geminiResult.output;
        } else {
          throw new Error("Gemini task failed");
        }
        break;
      }
      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }

    const duration = Date.now() - nodeStart;
    await db.workflowNodeResult.update({
      where: { runId_nodeId: { runId, nodeId } },
      data: {
        status: "COMPLETED",
        output: result as object,
        completedAt: new Date(),
        duration,
      },
    });

    return result;
  } catch (error) {
    const duration = Date.now() - nodeStart;
    await db.workflowNodeResult.update({
      where: { runId_nodeId: { runId, nodeId } },
      data: {
        status: "FAILED",
        error: error instanceof Error ? error.message : "Unknown error",
        completedAt: new Date(),
        duration,
      },
    });
    throw error;
  }
}

function gatherInputs(
  nodeId: string,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
  nodeOutputs: Record<string, unknown>
): Record<string, unknown> {
  const inputs: Record<string, unknown> = {};
  const images: string[] = [];

  const incomingEdges = edges.filter((e) => e.target === nodeId);

  for (const edge of incomingEdges) {
    const targetHandle = edge.targetHandle || "";
    const sourceNode = nodes.find((n) => n.id === edge.source);

    let sourceValue: unknown;

    if (sourceNode?.type === NODE_TYPES.REQUEST_INPUTS) {
      const sourceHandle = edge.sourceHandle || "";
      const fieldId = sourceHandle.split("-").slice(0, -2).join("-");
      sourceValue = nodeOutputs[`${edge.source}:${fieldId}`];
    } else {
      sourceValue = nodeOutputs[edge.source];
    }

    if (targetHandle.includes("inputImage")) {
      inputs.inputImage = sourceValue;
    } else if (targetHandle.includes("image")) {
      if (sourceValue) images.push(sourceValue as string);
    } else if (targetHandle.includes("systemPrompt")) {
      inputs.systemPrompt = sourceValue;
    } else if (targetHandle.includes("prompt")) {
      inputs.prompt = sourceValue;
    } else if (targetHandle.includes("result")) {
      inputs.result = sourceValue;
    }
  }

  if (images.length > 0) inputs.images = images;

  return inputs;
}
