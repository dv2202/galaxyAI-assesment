import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk/v3";
import { db } from "@/lib/db";
import { NODE_TYPES } from "@/lib/constants";
import type { WorkflowNode } from "@/types/workflow";
import type { workflowOrchestrator } from "@/trigger/orchestrator";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const scope = body.scope || "FULL";
  const selectedNodes: string[] = body.selectedNodes || [];

  const workflow = await db.workflow.findFirst({
    where: { id, userId },
  });

  if (!workflow) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const nodes = workflow.nodes as unknown as WorkflowNode[];
  const edges = workflow.edges as unknown as { source: string; target: string; sourceHandle?: string; targetHandle?: string; id: string }[];

  const requestInputsNode = nodes.find(
    (n) => n.type === NODE_TYPES.REQUEST_INPUTS
  );
  const inputs: Record<string, unknown> = {};
  if (requestInputsNode && "fields" in requestInputsNode.data) {
    const fields = (requestInputsNode.data as { fields: { id: string; value?: string; type: string }[] }).fields;
    for (const field of fields) {
      inputs[field.id] = field.value || "";
    }
  }

  const executableNodeIds = nodes
    .filter(
      (n) =>
        n.type !== NODE_TYPES.REQUEST_INPUTS &&
        n.type !== NODE_TYPES.RESPONSE
    )
    .map((n) => n.id);

  const nodeIdsToExecute =
    scope === "FULL" ? executableNodeIds : selectedNodes;

  const run = await db.workflowRun.create({
    data: {
      workflowId: id,
      userId,
      status: "RUNNING",
      scope,
      selectedNodes: nodeIdsToExecute,
      inputs: inputs as object,
    },
  });

  // Create node result placeholders
  for (const nodeId of nodeIdsToExecute) {
    const node = nodes.find((n) => n.id === nodeId);
    await db.workflowNodeResult.create({
      data: {
        runId: run.id,
        nodeId,
        nodeType: node?.type || "unknown",
        status: "PENDING",
      },
    });
  }

  // Trigger the orchestrator
  try {
    const handle = await tasks.trigger<typeof workflowOrchestrator>(
      "workflow-orchestrator",
      {
        runId: run.id,
        nodes: nodes as never[],
        edges: edges as never[],
        inputs,
        selectedNodeIds: scope !== "FULL" ? nodeIdsToExecute : undefined,
      }
    );

    await db.workflowRun.update({
      where: { id: run.id },
      data: { triggerRunId: handle.id },
    });
  } catch (error) {
    await db.workflowRun.update({
      where: { id: run.id },
      data: { status: "FAILED", error: "Failed to trigger execution" },
    });
  }

  return NextResponse.json({
    runId: run.id,
    nodeIds: nodeIdsToExecute,
  });
}
