import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { NODE_TYPES } from "@/lib/constants";
import { SAMPLE_NODES, SAMPLE_EDGES } from "@/lib/sample-workflow";
import type { WorkflowNode } from "@/types/workflow";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workflows = await db.workflow.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      updatedAt: true,
      createdAt: true,
      runs: {
        orderBy: { startedAt: "desc" },
        take: 1,
        select: { status: true },
      },
    },
  });

  const result = workflows.map((w) => ({
    id: w.id,
    name: w.name,
    updatedAt: w.updatedAt,
    createdAt: w.createdAt,
    lastRunStatus: w.runs[0]?.status ?? null,
  }));

  return NextResponse.json(result);
}

const DEFAULT_NODES: WorkflowNode[] = [
  {
    id: "request-inputs-node",
    type: NODE_TYPES.REQUEST_INPUTS,
    position: { x: 100, y: 200 },
    data: { fields: [] },
    deletable: false,
  },
  {
    id: "response-node",
    type: NODE_TYPES.RESPONSE,
    position: { x: 900, y: 200 },
    data: {},
    deletable: false,
  },
];

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const useSample = searchParams.get("sample") === "true";

  const count = await db.workflow.count({ where: { userId } });
  const name = useSample ? `Sample Workflow ${count + 1}` : `Workflow ${count + 1}`;

  const workflow = await db.workflow.create({
    data: {
      userId,
      name,
      nodes: (useSample ? SAMPLE_NODES : DEFAULT_NODES) as unknown as Prisma.InputJsonValue,
      edges: (useSample ? SAMPLE_EDGES : []) as unknown as Prisma.InputJsonValue,
    },
  });

  return NextResponse.json(workflow);
}
