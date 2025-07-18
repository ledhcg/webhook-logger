"use client";

import {
  WebhookLog,
  supabase,
  getCurrentUser,
  UserWebhook,
} from "@/lib/supabase";
import { useState, useEffect, useCallback, useRef, useMemo, memo } from "react";
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Info, Loader2, Activity, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { CodeBlock } from "@/components/ui/code-block";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UpdateMode } from "@/app/dashboard/_components/SettingsTab";

interface LogsDisplayProps {
  tokenId?: string;
  webhooks?: UserWebhook[];
  onTokenChange?: (token: string | undefined) => void;
}

function LogsDisplay({
  tokenId,
  webhooks = [],
  onTokenChange,
}: LogsDisplayProps) {
  const router = useRouter();
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  const [followLatest, setFollowLatest] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState("body");
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedTokenId, setSelectedTokenId] = useState<string | undefined>(
    tokenId
  );
  const [updateMode, setUpdateMode] = useState<UpdateMode>("realtime");
  const [refreshInterval, setRefreshInterval] = useState<number>(5000);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstLoad = useRef(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const LOGS_PER_PAGE = 50;

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("webhookLoggerSettings");
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);

        // Support migration from old settings format
        const updateModeValue =
          settings.updateMode ||
          (settings.enableRealtime
            ? "realtime"
            : settings.autoRefresh
            ? "periodic"
            : "manual");

        const autoFollowValue =
          settings.autoFollow !== undefined
            ? settings.autoFollow
            : settings.autoRefresh || true;

        setUpdateMode(updateModeValue as UpdateMode);
        setFollowLatest(autoFollowValue);
        setRefreshInterval(settings.refreshInterval || 5000);
      } catch {
        // Error parsing settings, use defaults
        // Use defaults if parsing fails
        const defaultSettings = {
          updateMode: "realtime" as UpdateMode,
          autoFollow: true,
          refreshInterval: 5000,
        };
        localStorage.setItem(
          "webhookLoggerSettings",
          JSON.stringify(defaultSettings)
        );
        setUpdateMode(defaultSettings.updateMode);
        setFollowLatest(defaultSettings.autoFollow);
        setRefreshInterval(defaultSettings.refreshInterval);
      }
    } else {
      // If no settings found, save default settings to localStorage
      const defaultSettings = {
        updateMode: "realtime" as UpdateMode,
        autoFollow: true,
        refreshInterval: 5000,
      };
      localStorage.setItem(
        "webhookLoggerSettings",
        JSON.stringify(defaultSettings)
      );
      setUpdateMode(defaultSettings.updateMode);
      setFollowLatest(defaultSettings.autoFollow);
      setRefreshInterval(defaultSettings.refreshInterval);
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
        try {
          const settings = JSON.parse(e.newValue);
          const previousUpdateMode = updateMode;
          const previousFollowLatest = followLatest;

          // Support migration from old settings format
          const updateModeValue =
            settings.updateMode ||
            (settings.enableRealtime
              ? "realtime"
              : settings.autoRefresh
              ? "periodic"
              : "manual");

          const autoFollowValue =
            settings.autoFollow !== undefined
              ? settings.autoFollow
              : settings.autoRefresh || true;

          setUpdateMode(updateModeValue as UpdateMode);
          setFollowLatest(autoFollowValue);
          setRefreshInterval(settings.refreshInterval || 5000);

          // Show notifications for changed settings
          if (previousUpdateMode !== updateModeValue) {
            const modeMessages: Record<UpdateMode, string> = {
              realtime: "Realtime updates enabled",
              periodic: "Periodic refresh enabled",
              manual: "Manual updates only",
            };

            const modeDescriptions: Record<UpdateMode, string> = {
              realtime: "You'll see new webhooks as they arrive in real-time",
              periodic: `Logs will refresh every ${
                settings.refreshInterval / 1000
              } seconds`,
              manual: "Logs will only update when you click refresh",
            };

            toast.info(modeMessages[updateModeValue as UpdateMode], {
              description: modeDescriptions[updateModeValue as UpdateMode],
            });
          }

          if (previousFollowLatest !== autoFollowValue) {
            toast.info(
              `Auto-follow ${autoFollowValue ? "enabled" : "disabled"}`,
              {
                description: autoFollowValue
                  ? "New logs will be automatically selected"
                  : "You'll need to manually select logs",
              }
            );
          }
        } catch {
          // Error parsing settings change
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [updateMode, followLatest]);

  // Check if user is authenticated
  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await getCurrentUser();
        setUserId(user?.id || null);
      } catch {
        // Error checking authentication
      }
    }

    checkAuth();
  }, []);

  // Memoize fetchLogs to prevent recreating on each render
  const fetchLogs = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);

      // First, get the total count
      let countQuery = supabase
        .from("webhook_logs")
        .select("*", { count: "exact", head: true });

      if (userId) {
        countQuery = countQuery.eq("user_id", userId);
      }
      if (selectedTokenId) {
        countQuery = countQuery.eq("token_id", selectedTokenId);
      }

      const { count } = await countQuery;
      const totalCount = count || 0;
      setTotalLogs(totalCount);
      setTotalPages(Math.ceil(totalCount / LOGS_PER_PAGE));

      // Then fetch the logs for the current page
      const offset = (page - 1) * LOGS_PER_PAGE;
      let query = supabase
        .from("webhook_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .range(offset, offset + LOGS_PER_PAGE - 1);

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
      setCurrentPage(page);

      // Return the data so it can be used outside
      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      const userFriendlyMessage = errorMessage.includes("Failed to fetch")
        ? "Unable to load logs. Please check your internet connection and try again."
        : errorMessage.includes("unauthorized") || errorMessage.includes("401")
        ? "You don't have permission to view these logs. Please sign in again."
        : errorMessage.includes("network") || errorMessage.includes("fetch")
        ? "Network error. Please check your connection and try again."
        : "Something went wrong while loading logs. Please try again.";
      setError(userFriendlyMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, [userId, selectedTokenId, LOGS_PER_PAGE]);

  // Interval refresh timer
  useEffect(() => {
    // Clear any existing timer
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    // Only set interval if in periodic mode
    if (updateMode === "periodic") {
      refreshTimerRef.current = setInterval(() => fetchLogs(currentPage), refreshInterval);

      // Log to console
      // Setting refresh interval
    }

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [updateMode, refreshInterval, fetchLogs, currentPage]);

  // Initial data fetch - only run once on component mount or when userId or tokenId changes
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchLogs(1);

      // Always select the first log if data is available and it's the first load
      if (data.length > 0 && (isFirstLoad.current || followLatest)) {
        setSelectedLog(data[0]);
        isFirstLoad.current = false;
      }
    };

    loadData();
  }, [userId, selectedTokenId, fetchLogs, followLatest]);

  // Setup realtime subscription
  useEffect(() => {
    // Only setup realtime subscription if in realtime mode
    if (updateMode !== "realtime") return;

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
      .subscribe(() => {
        // Realtime subscription status updated
      });

    return () => {
      // Clean up subscription when component unmounts or updateMode changes
      supabase.removeChannel(subscription);
    };
  }, [updateMode, followLatest, selectedLog, userId, selectedTokenId]);

  const selectLog = useCallback(
    (log: WebhookLog) => {
      setSelectedLog(log);
      // When manually selecting a log, disable follow latest
      if (followLatest) {
        setFollowLatest(false);

        // Save the updated setting to localStorage
        const savedSettings = localStorage.getItem("webhookLoggerSettings");
        if (savedSettings) {
          try {
            const settings = JSON.parse(savedSettings);
            settings.autoFollow = false;
            localStorage.setItem(
              "webhookLoggerSettings",
              JSON.stringify(settings)
            );
          } catch {
            // Error updating settings
          }
        }

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
    fetchLogs(currentPage);
  }, [fetchLogs, currentPage]);

  const handleTokenFilterChange = useCallback(
    (value: string) => {
      // Reset selected log when changing token
      setSelectedLog(null);
      const newTokenId = value === "all" ? undefined : value;
      setSelectedTokenId(newTokenId);

      // Call the onTokenChange callback if provided
      if (onTokenChange) {
        onTokenChange(newTokenId);
      }

      // Update URL with query parameter
      if (newTokenId) {
        router.push(`/dashboard?id=${newTokenId}`);
      } else {
        router.push("/dashboard");
      }

      // Refresh logs with new token filter and select first log
      setTimeout(async () => {
        const data = await fetchLogs(1);
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
    [fetchLogs, router, webhooks, onTokenChange]
  );

  // Format the last refreshed timestamp
  const formatLastRefreshed = useCallback(() => {
    if (!lastRefreshed) return "Never";
    return lastRefreshed.toLocaleTimeString();
  }, [lastRefreshed]);

  // Get badge color for HTTP method
  const getMethodBadgeVariant = useCallback((method?: string) => {
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
  }, []);

  // Render sidebar with log list
  const renderSidebar = useMemo(() => {
    if (error) {
      return (
        <div className="space-y-3">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Logs</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button
            onClick={() => fetchLogs(currentPage)}
            variant="outline"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </>
            )}
          </Button>
        </div>
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
                  : "hover:bg-slate-50 focus:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              }`}
              onClick={() => selectLog(log)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  selectLog(log);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`${log.method} request to ${log.path} at ${log.created_at ? new Date(log.created_at).toLocaleTimeString() : 'unknown time'}`}
              aria-pressed={selectedLog?.id === log.id}
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
  }, [error, loading, logs, selectedLog, selectLog, getMethodBadgeVariant, currentPage, fetchLogs]);

  // Render main content area with webhook details
  const renderWebhookDetails = useMemo(() => {
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
  }, [logs, selectedLog, activeTab]);

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
                    aria-label="Filter logs by webhook token"
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
                {updateMode !== "realtime" && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleManualRefresh}
                          variant="outline"
                          size="sm"
                          className="h-9 bg-white border-slate-200 hover:bg-slate-50 transition-colors"
                          disabled={loading}
                          aria-label="Refresh logs"
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
                )}
              </CardHeader>
              <CardContent className="py-2">
                {renderSidebar}
                {totalPages > 1 && (
                  <div className="mt-4 flex justify-center">
                    <Pagination aria-label="Logs pagination">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => currentPage > 1 && fetchLogs(currentPage - 1)}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            aria-disabled={currentPage === 1}
                          />
                        </PaginationItem>
                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                          const pageNumber = i + 1;
                          return (
                            <PaginationItem key={pageNumber}>
                              <PaginationLink
                                onClick={() => fetchLogs(pageNumber)}
                                isActive={currentPage === pageNumber}
                                className="cursor-pointer"
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        {totalPages > 5 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => currentPage < totalPages && fetchLogs(currentPage + 1)}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            aria-disabled={currentPage === totalPages}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
                <div className="mt-2 text-center text-sm text-muted-foreground">
                  Showing {logs.length} of {totalLogs} logs
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">{renderWebhookDetails}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default memo(LogsDisplay);
