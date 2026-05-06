import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { NODE_TYPES } from "@/lib/constants";

const DEFAULT_NODES = [
  {
    id: "request-inputs-1",
    type: NODE_TYPES.REQUEST_INPUTS,
    position: { x: 100, y: 200 },
    data: { fields: [] },
  },
  {
    id: "response-1",
    type: NODE_TYPES.RESPONSE,
    position: { x: 900, y: 200 },
    data: { result: undefined },
  },
];

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
    },
  });

  return NextResponse.json(workflows);
}

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workflow = await db.workflow.create({
    data: {
      userId,
      name: "Untitled Workflow",
      nodes: DEFAULT_NODES,
      edges: [],
    },
  });

  return NextResponse.json(workflow);
}
