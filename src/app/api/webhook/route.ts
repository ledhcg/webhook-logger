import { supabase, supabaseService, WebhookLog } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// Helper function to set CORS headers
export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Webhook-Token",
  };
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

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
      { status: 401, headers: corsHeaders() }
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
      { status: 401, headers: corsHeaders() }
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

  // Insert the log asynchronously (don't wait for completion)
  supabase
    .from("webhook_logs")
    .insert(log)
    .then(({ error }) => {
      if (error) {
        console.error("Error saving webhook log asynchronously:", error);
        // Optional: Add more robust error handling here if needed,
        // e.g., send to an error tracking service.
      }
    });

  // Return success with CORS headers
  return NextResponse.json({ success: true }, { headers: corsHeaders() });
}
