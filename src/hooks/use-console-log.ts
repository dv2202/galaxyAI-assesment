"use client";

import { useEffect } from "react";
import { LINKEDIN_URL } from "@/lib/constants";

export function useConsoleLog() {
  useEffect(() => {
    console.log(`[NextFlow] Candidate LinkedIn: ${LINKEDIN_URL}`);
  }, []);
}
