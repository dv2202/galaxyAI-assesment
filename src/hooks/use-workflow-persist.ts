"use client";

import { useEffect, useRef } from "react";
import { useWorkflowStore } from "@/stores/workflow-store";

export function useWorkflowPersist() {
  const { nodes, edges, workflowId, isDirty, markClean } = useWorkflowStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isDirty || !workflowId) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        await fetch(`/api/workflows/${workflowId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nodes, edges }),
        });
        markClean();
      } catch {
        // Silent fail on auto-save
      }
    }, 1500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [nodes, edges, workflowId, isDirty, markClean]);
}
