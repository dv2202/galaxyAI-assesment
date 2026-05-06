"use client";

import { SignUp } from "@clerk/nextjs";
import { useConsoleLog } from "@/hooks/use-console-log";

export default function SignUpPage() {
  useConsoleLog();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f]">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-[#1a1a2e] border border-[#2a2a4a]",
          },
        }}
      />
    </div>
  );
}
