import { supabase, supabaseService, WebhookLog } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const headers: Record<string, string> = {};

  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  // Check for webhook token in the headers
  const webhookToken = headers["x-webhook-token"] || "";

  // If no token is provided, return an error
  if (!webhookToken) {
    return NextResponse.json(
      { error: "Webhook token is required" },
      { status: 401 }
    );
  }
  console.log("webhookToken", webhookToken);
  // Try to find the user associated with this token
  const { data: webhookData, error } = await supabaseService
    .from("user_webhooks")
    .select("user_id, id")
    .eq("token", webhookToken)
    .single();

  console.log("webhookData", webhookData);

  // If token is invalid, return an error
  if (error || !webhookData) {
    return NextResponse.json(
      { error: "Invalid webhook token" },
      { status: 401 }
    );
  }

  const userId = webhookData.user_id;
  const tokenId = webhookData.id;

  const log: WebhookLog = {
    method: request.method,
    headers,
    body,
    source: headers["user-agent"] || "unknown",
    path: request.nextUrl.pathname,
    user_id: userId,
    token_id: tokenId,
  };

  try {
    await supabase.from("webhook_logs").insert(log);
  } catch (error) {
    console.error("Error saving webhook log:", error);
    return NextResponse.json(
      { error: "Failed to save webhook log" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
