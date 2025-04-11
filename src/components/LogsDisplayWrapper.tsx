"use client";

import LogsDisplay from "./LogsDisplay";
import { useState, useEffect } from "react";
import { getUserWebhooks, UserWebhook } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/supabase";

interface LogsDisplayWrapperProps {
  selectedTokenId?: string;
  webhooks?: UserWebhook[];
  onTokenChange?: (token: string | undefined) => void;
}

export default function LogsDisplayWrapper({
  selectedTokenId,
  webhooks: propWebhooks,
  onTokenChange,
}: LogsDisplayWrapperProps) {
  const [webhooks, setWebhooks] = useState<UserWebhook[]>(propWebhooks || []);

  // If webhooks are provided via props, use those
  useEffect(() => {
    if (propWebhooks && propWebhooks.length > 0) {
      setWebhooks(propWebhooks);
    }
  }, [propWebhooks]);

  // Fetch webhooks for the current user if none provided via props
  useEffect(() => {
    const fetchWebhooks = async () => {
      if (propWebhooks && propWebhooks.length > 0) return;

      try {
        const user = await getCurrentUser();
        if (user) {
          const webhooksData = await getUserWebhooks(user.id);
          setWebhooks(webhooksData);
        }
      } catch (err) {
        console.error("Error fetching webhooks:", err);
      }
    };

    fetchWebhooks();
  }, [propWebhooks]);

  return (
    <LogsDisplay
      tokenId={selectedTokenId}
      webhooks={webhooks}
      onTokenChange={onTokenChange}
    />
  );
}
