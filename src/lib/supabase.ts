import { createClient } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey =
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || "";

// Direct client for non-auth operations or server-side code
export const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Service role client with admin privileges to bypass RLS
export const supabaseService = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Client component client with automatic cookie handling
export const supabase = createClientComponentClient<Database>();

export type WebhookLog = {
  id?: string;
  created_at?: string;
  method: string;
  headers: Record<string, string>;
  body: Record<string, unknown>;
  source: string;
  path: string;
  status_code?: number;
  user_id?: string;
  token_id?: string;
};

export type UserWebhook = {
  id?: string;
  user_id: string;
  token: string;
  name?: string;
  created_at?: string;
};

export type AuthUser = {
  id: string;
  email: string;
};

// Helper function to get current user
export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

// Function to get user webhook tokens
export const getUserWebhooks = async (userId: string) => {
  const { data, error } = await supabase
    .from("user_webhooks")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;
  return data as UserWebhook[];
};

// Function to create a new webhook token
export const createWebhookToken = async (userId: string, name?: string) => {
  // Generate a random token
  const token = crypto.randomUUID();

  const { data, error } = await supabase
    .from("user_webhooks")
    .insert({
      user_id: userId,
      token,
      name: name || "My Webhook",
    })
    .select()
    .single();

  if (error) throw error;
  return data as UserWebhook;
};
