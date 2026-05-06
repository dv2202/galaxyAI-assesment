import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { CanvasShell } from "./_components/canvas-shell";

export default async function WorkflowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;
  const workflow = await db.workflow.findFirst({
    where: { id, userId },
  });

  if (!workflow) redirect("/dashboard");

  return (
    <CanvasShell
      workflowId={workflow.id}
      workflowName={workflow.name}
      initialNodes={workflow.nodes as never[]}
      initialEdges={workflow.edges as never[]}
    />
  );
}
