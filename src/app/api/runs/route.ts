import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workflowId = req.nextUrl.searchParams.get("workflowId");
  if (!workflowId) {
    return NextResponse.json(
      { error: "workflowId required" },
      { status: 400 }
    );
  }

  const workflow = await db.workflow.findFirst({
    where: { id: workflowId, userId },
  });

  if (!workflow) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const runs = await db.workflowRun.findMany({
    where: { workflowId },
    include: { nodeResults: true },
    orderBy: { startedAt: "desc" },
    take: 50,
  });

  return NextResponse.json(runs);
}
