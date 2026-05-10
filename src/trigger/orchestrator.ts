import { task, batch } from "@trigger.dev/sdk/v3";
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

    try {
      const nodeOutputs: Record<string, unknown> = {};
      const completedNodes = new Set<string>();

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

      const executableNodes = nodes.filter((n) => {
        if (n.type === NODE_TYPES.REQUEST_INPUTS || n.type === NODE_TYPES.RESPONSE) return false;
        if (selectedNodeIds) return selectedNodeIds.includes(n.id);
        return true;
      });

      const executableIds = new Set(executableNodes.map((n) => n.id));
      let hasError = false;

      while (true) {
        const readyNodes = findReadyNodes(
          executableNodes,
          edges,
          completedNodes,
          executableIds
        );

        if (readyNodes.length === 0) break;

        await Promise.all(
          readyNodes.map((nodeId) =>
            db.workflowNodeResult.update({
              where: { runId_nodeId: { runId, nodeId } },
              data: { status: "RUNNING", startedAt: new Date() },
            })
          )
        );

        const batchStartTime = Date.now();

        const batchItems: Array<{ task: typeof cropImageTask | typeof geminiGenerateTask; payload: Record<string, unknown> }> = [];
        const batchNodeIds: string[] = [];

        for (const nodeId of readyNodes) {
          const node = nodes.find((n) => n.id === nodeId);
          if (!node) continue;
          const inputValues = gatherInputs(nodeId, nodes, edges, nodeOutputs);

          if (node.type === NODE_TYPES.CROP_IMAGE) {
            batchItems.push({
              task: cropImageTask,
              payload: {
                imageUrl: inputValues.inputImage as string,
                xPosition: (node.data as { xPosition?: number }).xPosition ?? 0,
                yPosition: (node.data as { yPosition?: number }).yPosition ?? 0,
                width: (node.data as { width?: number }).width ?? 100,
                height: (node.data as { height?: number }).height ?? 100,
              },
            });
            batchNodeIds.push(nodeId);
          } else if (node.type === NODE_TYPES.GEMINI) {
            const nodeData = node.data as { prompt?: string; systemPrompt?: string; model?: string };
            batchItems.push({
              task: geminiGenerateTask,
              payload: {
                prompt: (inputValues.prompt as string) || nodeData.prompt || "",
                systemPrompt: (inputValues.systemPrompt as string) || nodeData.systemPrompt || "",
                model: nodeData.model || "gemini-2.5-flash",
                imageUrls: (inputValues.images as string[]) || [],
              },
            });
            batchNodeIds.push(nodeId);
          }
        }

        if (batchItems.length === 0) break;

        const batchResult = await batch.triggerByTaskAndWait(batchItems as any);

        for (let i = 0; i < batchNodeIds.length; i++) {
          const nodeId = batchNodeIds[i];
          const result = batchResult.runs[i];
          const duration = Date.now() - batchStartTime;

          if (result.ok) {
            nodeOutputs[nodeId] = result.output;
            completedNodes.add(nodeId);
            await db.workflowNodeResult.update({
              where: { runId_nodeId: { runId, nodeId } },
              data: { status: "COMPLETED", output: result.output as unknown as object, completedAt: new Date(), duration },
            });
          } else {
            completedNodes.add(nodeId);
            hasError = true;
            const errorMessage = extractErrorMessage(result.error);
            await db.workflowNodeResult.update({
              where: { runId_nodeId: { runId, nodeId } },
              data: { status: "FAILED", error: errorMessage, completedAt: new Date(), duration },
            });
          }
        }
      }

      const responseNode = nodes.find((n) => n.type === NODE_TYPES.RESPONSE);
      if (responseNode) {
        const incomingEdge = edges.find((e) => e.target === responseNode.id);
        if (incomingEdge) {
          const sourceOutput = nodeOutputs[incomingEdge.source];
          nodeOutputs[responseNode.id] = sourceOutput;
        }
        await db.workflowNodeResult.update({
          where: { runId_nodeId: { runId, nodeId: responseNode.id } },
          data: {
            status: "COMPLETED",
            output: nodeOutputs[responseNode.id] as object ?? null,
            completedAt: new Date(),
          },
        }).catch(() => {});
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
    } catch (error) {
      const duration = Date.now() - startTime;
      await db.workflowRun.update({
        where: { id: runId },
        data: {
          status: "FAILED",
          completedAt: new Date(),
          duration,
        },
      }).catch(() => {});
      throw error;
    }
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

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const e = error as Record<string, unknown>;
    if (typeof e.message === "string") return e.message;
    if (typeof e.error === "string") return e.error;
  }
  return "Unknown error";
}
