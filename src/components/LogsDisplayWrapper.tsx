"use client";

import LogsDisplay from "./LogsDisplay";
import { useState, useEffect } from "react";
import { getUserWebhooks, UserWebhook } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/supabase";

interface LogsDisplayWrapperProps {
  selectedTokenId?: string;
}

export default function LogsDisplayWrapper({
  selectedTokenId,
}: LogsDisplayWrapperProps) {
  const [webhooks, setWebhooks] = useState<UserWebhook[]>([]);

  // Fetch webhooks for the current user
  useEffect(() => {
    const fetchWebhooks = async () => {
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
  }, []);

  return <LogsDisplay tokenId={selectedTokenId} webhooks={webhooks} />;
}
