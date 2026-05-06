import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { runs } from "@trigger.dev/sdk/v3";
import { db } from "@/lib/db";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { runId } = await params;
  const run = await db.workflowRun.findFirst({
    where: { id: runId, userId },
  });

  if (!run) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (run.status !== "RUNNING") {
    return NextResponse.json({ error: "Run is not active" }, { status: 400 });
  }

  try {
    if (run.triggerRunId) {
      await runs.cancel(run.triggerRunId);
    }

    await db.workflowRun.update({
      where: { id: runId },
      data: { status: "FAILED", completedAt: new Date(), error: "Cancelled by user" },
    });

    await db.workflowNodeResult.updateMany({
      where: { runId, status: { in: ["PENDING", "RUNNING"] } },
      data: { status: "FAILED", completedAt: new Date(), error: "Cancelled" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to cancel" },
      { status: 500 }
    );
  }
}
