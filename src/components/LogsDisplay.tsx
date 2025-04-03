"use client";

import {
  WebhookLog,
  supabase,
  getCurrentUser,
  UserWebhook,
} from "@/lib/supabase";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Info, Loader2, Activity } from "lucide-react";
import { toast } from "sonner";
import { CodeBlock } from "@/components/ui/code-block";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LogsDisplayProps {
  tokenId?: string;
  webhooks?: UserWebhook[];
}

export default function LogsDisplay({
  tokenId,
  webhooks = [],
}: LogsDisplayProps) {
  const router = useRouter();
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  const [isRealtimeEnabled, setIsRealtimeEnabled] = useState<boolean>(true);
  const [followLatest, setFollowLatest] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState("body");
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedTokenId, setSelectedTokenId] = useState<string | undefined>(
    tokenId
  );
  const isFirstLoad = useRef(true);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("webhookLoggerSettings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setIsRealtimeEnabled(settings.enableRealtime);
      setFollowLatest(settings.autoRefresh);
    }
  }, []);

  // Update selected token when tokenId prop changes
  useEffect(() => {
    setSelectedTokenId(tokenId);
  }, [tokenId]);

  // Listen for settings changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "webhookLoggerSettings" && e.newValue) {
        const settings = JSON.parse(e.newValue);
        setIsRealtimeEnabled(settings.enableRealtime);
        setFollowLatest(settings.autoRefresh);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Check if user is authenticated
  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await getCurrentUser();
        setUserId(user?.id || null);
      } catch (err) {
        console.error("Error checking authentication:", err);
      }
    }

    checkAuth();
  }, []);

  // Memoize fetchLogs to prevent recreating on each render
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("webhook_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      // If user is authenticated, filter logs by user_id
      if (userId) {
        query = query.eq("user_id", userId);
      }

      // If a specific token is selected, filter logs by token_id
      if (selectedTokenId) {
        query = query.eq("token_id", selectedTokenId);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message || "Failed to fetch logs");
      }

      setLogs(data || []);
      setLastRefreshed(new Date());
      setError(null);

      // Return the data so it can be used outside
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      return [];
    } finally {
      setLoading(false);
    }
  }, [userId, selectedTokenId]);

  // Initial data fetch - only run once on component mount or when userId or tokenId changes
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchLogs();

      // Always select the first log if data is available
      if (data.length > 0) {
        setSelectedLog(data[0]);
        isFirstLoad.current = false;
      }
    };

    loadData();
  }, [userId, selectedTokenId, fetchLogs]);

  // Setup realtime subscription
  useEffect(() => {
    if (!isRealtimeEnabled) return;
    // Create a unique channel name based on the token ID
    const channelName = selectedTokenId
      ? `webhook_logs_token_${selectedTokenId}`
      : "webhook_logs_changes";

    const subscription = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "webhook_logs",
          filter: userId
            ? selectedTokenId
              ? `token_id=eq.${selectedTokenId}`
              : `user_id=eq.${userId}`
            : undefined,
        },
        (payload) => {
          if (payload.new.user_id === userId) {
            const newLog = payload.new as WebhookLog;

            // When a new record is inserted, add it to the logs array
            setLogs((currentLogs) => [newLog, ...currentLogs]);

            // If follow latest is enabled or no log is selected, select the new one
            if (followLatest || !selectedLog) {
              setSelectedLog(newLog);
            }

            setLastRefreshed(new Date());

            // Notify user of new webhook
            toast.success(`New webhook received`, {
              description: selectedTokenId
                ? `New log for selected token`
                : `New webhook log received`,
            });
          }
        }
      )
      .subscribe((status) => {
        console.log(
          `Realtime subscription status: ${status} for channel ${channelName}`
        );
      });

    return () => {
      // Clean up subscription when component unmounts or isRealtimeEnabled changes
      supabase.removeChannel(subscription);
    };
  }, [isRealtimeEnabled, followLatest, selectedLog, userId, selectedTokenId]);

  const selectLog = useCallback(
    (log: WebhookLog) => {
      setSelectedLog(log);
      // When manually selecting a log, disable follow latest
      if (followLatest) {
        setFollowLatest(false);
        toast.info("Auto-follow disabled", {
          description:
            "You've manually selected a log, auto-follow has been disabled",
          duration: 2000,
        });
      }
    },
    [followLatest]
  );

  const handleManualRefresh = useCallback(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleTokenFilterChange = useCallback(
    (value: string) => {
      // Reset selected log when changing token
      setSelectedLog(null);
      const newTokenId = value === "all" ? undefined : value;
      setSelectedTokenId(newTokenId);

      // Update URL with query parameter
      if (newTokenId) {
        router.push(`/dashboard?id=${newTokenId}`);
      } else {
        router.push("/dashboard");
      }

      // Refresh logs with new token filter and select first log
      setTimeout(async () => {
        const data = await fetchLogs();
        // Select the first log if available
        if (data.length > 0) {
          setSelectedLog(data[0]);
        }
      }, 0);

      // Show toast notification
      const tokenName = newTokenId
        ? webhooks.find((w) => w.id === newTokenId)?.name || "selected token"
        : "all tokens";

      toast.info(`Showing logs for ${tokenName}`, {
        description: newTokenId
          ? `Filtered to show logs for: ${tokenName}`
          : "Showing logs from all webhook tokens",
      });
    },
    [fetchLogs, router, webhooks]
  );

  // Format the last refreshed timestamp
  const formatLastRefreshed = () => {
    if (!lastRefreshed) return "Never";
    return lastRefreshed.toLocaleTimeString();
  };

  // Get badge color for HTTP method
  const getMethodBadgeVariant = (method?: string) => {
    switch (method?.toUpperCase()) {
      case "GET":
        return "secondary";
      case "POST":
        return "default";
      case "PUT":
        return "outline";
      case "DELETE":
        return "destructive";
      case "PATCH":
        return "secondary";
      default:
        return "outline";
    }
  };

  // Render sidebar with log list
  const renderSidebar = () => {
    if (error) {
      return (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (loading && logs.length === 0) {
      return (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      );
    }

    if (logs.length === 0) {
      return (
        <Alert className="bg-amber-50 border-amber-200">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertTitle>No logs found</AlertTitle>
          <AlertDescription>
            Send a webhook request to any of the supported endpoints to see logs
            here.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <ScrollArea className="h-[600px]">
        <div className="space-y-1 pr-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className={`flex items-center p-3 rounded-md cursor-pointer transition-colors ${
                selectedLog?.id === log.id
                  ? "bg-slate-100 border-l-4 border-blue-500"
                  : "hover:bg-slate-50"
              }`}
              onClick={() => selectLog(log)}
            >
              <div className="space-y-1 w-full">
                <div className="flex items-center justify-between">
                  <Badge variant={getMethodBadgeVariant(log.method)}>
                    {log.method?.toUpperCase() || "UNKNOWN"}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {log.created_at
                      ? new Date(log.created_at).toLocaleTimeString()
                      : "N/A"}
                  </span>
                </div>
                <p className="font-mono text-xs truncate text-slate-700">
                  {log.path || "/"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  };

  // Render main content area with webhook details
  const renderWebhookDetails = () => {
    if (logs.length === 0) {
      return (
        <div className="flex items-center justify-center h-[600px] bg-slate-50 rounded-md">
          <div className="text-center">
            <Info className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No webhook logs available</p>
          </div>
        </div>
      );
    }

    if (!selectedLog) {
      return (
        <div className="flex items-center justify-center h-[600px] bg-slate-50 rounded-md">
          <div className="text-center">
            <Info className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Select a webhook to view details</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge
              variant={getMethodBadgeVariant(selectedLog.method)}
              className="px-2 py-1"
            >
              {selectedLog.method?.toUpperCase() || "UNKNOWN"}
            </Badge>
            <h2 className="text-lg font-semibold">{selectedLog.path || "/"}</h2>
          </div>
          <div className="text-sm text-slate-500">
            From IP {selectedLog.source} at{" "}
            {selectedLog.created_at
              ? new Date(selectedLog.created_at).toLocaleString()
              : "N/A"}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="body">Body</TabsTrigger>
            <TabsTrigger value="headers">Headers</TabsTrigger>
          </TabsList>

          <TabsContent value="body" className="mt-4">
            <Card>
              <CardContent className="py-2">
                <ScrollArea className="h-full">
                  <CodeBlock
                    code={
                      selectedLog.body
                        ? JSON.stringify(selectedLog.body, null, 2)
                        : "No body content"
                    }
                    language="json"
                    showLanguage={true}
                    showLineNumbers={true}
                    filename="request-body.json"
                  />
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="headers" className="mt-4">
            <Card>
              <CardContent className="py-2">
                <ScrollArea className="h-full">
                  <div className="space-y-2">
                    {selectedLog.headers &&
                    Object.keys(selectedLog.headers).length > 0 ? (
                      Object.entries(selectedLog.headers).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="grid grid-cols-3 gap-2 border-b pb-2"
                          >
                            <div className="text-sm font-medium">{key}</div>
                            <div className="col-span-2 text-sm text-slate-700 break-all">
                              {value}
                            </div>
                          </div>
                        )
                      )
                    ) : (
                      <p className="text-slate-500 text-sm">No headers found</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Webhook Logs
        </CardTitle>
        <CardDescription>
          View and monitor incoming webhook requests
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Select
                    value={selectedTokenId || "all"}
                    onValueChange={handleTokenFilterChange}
                  >
                    <SelectTrigger className="w-full h-9 text-sm bg-white border-slate-200 hover:bg-slate-50 transition-colors">
                      <SelectValue placeholder="All webhooks" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectItem
                        value="all"
                        className="font-medium text-blue-600"
                      >
                        All webhooks
                      </SelectItem>
                      {webhooks.map((webhook) => (
                        <SelectItem
                          key={webhook.id}
                          value={webhook.id || ""}
                          className="text-sm py-2.5"
                        >
                          {webhook.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleManualRefresh}
                        variant="outline"
                        size="sm"
                        className="h-9 bg-white border-slate-200 hover:bg-slate-50 transition-colors"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4 text-blue-500" />
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-slate-800 text-white">
                      <p>Last updated: {formatLastRefreshed()}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardHeader>
              <CardContent className="py-2">{renderSidebar()}</CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">{renderWebhookDetails()}</div>
        </div>
      </CardContent>
    </Card>
  );
}
