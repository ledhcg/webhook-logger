"use client";

import LogsDisplay from "./LogsDisplay";
import { useState, useEffect } from "react";
import { getUserWebhooks, UserWebhook } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(!propWebhooks);
  const [error, setError] = useState<string | null>(null);

  // If webhooks are provided via props, use those
  useEffect(() => {
    if (propWebhooks && propWebhooks.length > 0) {
      setWebhooks(propWebhooks);
    }
  }, [propWebhooks]);

  // Fetch webhooks for the current user if none provided via props
  useEffect(() => {
    const fetchWebhooks = async () => {
      if (propWebhooks && propWebhooks.length > 0) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const user = await getCurrentUser();
        if (user) {
          const webhooksData = await getUserWebhooks(user.id);
          setWebhooks(webhooksData);
        }
      } catch {
        setError("Failed to load webhook tokens. Please try refreshing the page.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWebhooks();
  }, [propWebhooks]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full">
        {/* Sidebar skeleton */}
        <div className="w-80 border-r bg-background p-4">
          <Skeleton className="h-10 w-full mb-4" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
        {/* Main content skeleton */}
        <div className="flex-1 p-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <LogsDisplay
      tokenId={selectedTokenId}
      webhooks={webhooks}
      onTokenChange={onTokenChange}
    />
  );
}
