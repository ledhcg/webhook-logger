"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserWebhooks, UserWebhook } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Activity, Key, BookOpen, Settings } from "lucide-react";

// Import components
import WebhookTokensTab from "./_components/WebhookTokensTab";
import LogsFilterTab from "./_components/LogsFilterTab";
import GuideTab from "./_components/GuideTab";
import SettingsTab from "./_components/SettingsTab";

export default function DashboardPage() {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [webhooks, setWebhooks] = useState<UserWebhook[]>([]);
  const [selectedToken, setSelectedToken] = useState<string>("your_token_here");
  const [selectedLogToken, setSelectedLogToken] = useState<string | undefined>(
    undefined
  );
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [authLoading, user, router]);

  // Load token ID from URL query parameter
  useEffect(() => {
    const tokenId = searchParams.get("id");
    if (tokenId) {
      setSelectedLogToken(tokenId);
    }
  }, [searchParams]);

  // Force refresh when token changes
  useEffect(() => {
    // This effect will trigger a reload of the logs when selectedLogToken changes
    // The data will be fetched through the child components
  }, [selectedLogToken]);

  // Fetch user's webhook tokens
  useEffect(() => {
    const fetchWebhooks = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const webhooksData = await getUserWebhooks(user.id);
        setWebhooks(webhooksData);
        setError(null);
      } catch {
        // Error fetching webhooks
        setError("Failed to load webhook tokens");
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchWebhooks();
    }
  }, [user]);

  const handleTokenSelect = (tokenValue: string) => {
    setSelectedToken(tokenValue);
    toast.success("Token applied to examples", {
      description: "Code examples updated with selected token",
    });
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Skeleton className="h-32 w-32 rounded-full" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-slate-600">Welcome, {user.email}</p>
          </div>
          <Button variant="outline" onClick={() => signOut()}>
            Sign out
          </Button>
        </div>

        <Tabs defaultValue="logs" className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>Webhook Logs</span>
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              <span>Webhook Tokens</span>
            </TabsTrigger>
            <TabsTrigger value="guide" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Guide</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="webhooks" className="mt-6">
            <WebhookTokensTab
              userId={user.id}
              webhooks={webhooks}
              isLoading={isLoading}
              error={error}
              setWebhooks={setWebhooks}
            />
          </TabsContent>

          <TabsContent value="logs" className="mt-6">
            <LogsFilterTab
              webhooks={webhooks}
              selectedLogToken={selectedLogToken}
              setSelectedLogToken={setSelectedLogToken}
            />
          </TabsContent>

          <TabsContent value="guide" className="mt-6">
            <GuideTab
              webhooks={webhooks}
              selectedToken={selectedToken}
              setSelectedToken={handleTokenSelect}
            />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
