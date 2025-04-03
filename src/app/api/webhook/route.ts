import { supabase, WebhookLog } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const headers: Record<string, string> = {};

  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const log: WebhookLog = {
    method: request.method,
    headers,
    body,
    source: headers["user-agent"] || "unknown",
    path: request.nextUrl.pathname,
  };

  try {
    await supabase.from("webhook_logs").insert(log);
  } catch (error) {
    console.error("Error saving webhook log:", error);
  }

  return NextResponse.json({ success: true });
}
