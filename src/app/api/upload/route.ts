import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const authKey = process.env.NEXT_PUBLIC_TRANSLOADIT_AUTH_KEY;
  const authSecret = process.env.TRANSLOADIT_AUTH_SECRET;

  if (!authKey || !authSecret) {
    return NextResponse.json(
      { error: "Transloadit not configured" },
      { status: 500 }
    );
  }

  const expires = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  const params = JSON.stringify({
    auth: {
      key: authKey,
      expires,
    },
    steps: {
      ":original": {
        robot: "/upload/handle",
      },
    },
  });

  const signature = crypto
    .createHmac("sha384", authSecret)
    .update(Buffer.from(params, "utf-8"))
    .digest("hex");

  return NextResponse.json({
    params,
    signature: `sha384:${signature}`,
  });
}
