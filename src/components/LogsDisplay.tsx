"use client";

import { WebhookLog, supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Clock, RefreshCw, Info, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

export default function LogsDisplay() {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  const [isRealtimeEnabled, setIsRealtimeEnabled] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState("body");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("webhook_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        throw new Error(error.message || "Failed to fetch logs");
      }

      setLogs(data || []);

      // Select the first log by default if there are logs and none are currently selected
      if (data && data.length > 0 && !selectedLog) {
        setSelectedLog(data[0]);
      }

      setLastRefreshed(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    // Set up realtime subscription
    const subscription = isRealtimeEnabled
      ? supabase
          .channel("webhook_logs_changes")
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "webhook_logs",
            },
            (payload) => {
              // When a new record is inserted, add it to the logs array
              setLogs((currentLogs) => [
                payload.new as WebhookLog,
                ...currentLogs,
              ]);

              // If no log is selected, select the new one
              if (!selectedLog) {
                setSelectedLog(payload.new as WebhookLog);
              }

              setLastRefreshed(new Date());
            }
          )
          .subscribe()
      : null;

    return () => {
      // Clean up subscription when component unmounts
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [isRealtimeEnabled, selectedLog]);

  const selectLog = (log: WebhookLog) => {
    setSelectedLog(log);
  };

  const toggleRealtime = () => {
    setIsRealtimeEnabled(!isRealtimeEnabled);
  };

  const handleManualRefresh = () => {
    fetchLogs();
  };

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

  // Copy JSON content to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard", {
      description: "JSON content has been copied to clipboard",
      duration: 2000,
    });
  };

  // Render refresh controls
  const renderRefreshControls = () => {
    return (
      <Card className="mb-6">
        <CardHeader className="py-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            Realtime Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="realtime"
                checked={isRealtimeEnabled}
                onCheckedChange={toggleRealtime}
              />
              <Label htmlFor="realtime">Realtime updates</Label>
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleManualRefresh}
                    variant="outline"
                    size="sm"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh Now
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Last updated: {formatLastRefreshed()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
    );
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
              <CardHeader className="py-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm">Body</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(
                            JSON.stringify(selectedLog.body, null, 2)
                          )
                        }
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy to clipboard</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardHeader>
              <CardContent className="py-2">
                <ScrollArea className="h-[400px]">
                  <pre className="text-sm font-mono bg-slate-50 p-4 rounded-md overflow-auto">
                    {selectedLog.body
                      ? JSON.stringify(selectedLog.body, null, 2)
                      : "No body content"}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="headers" className="mt-4">
            <Card>
              <CardHeader className="py-2">
                <CardTitle className="text-sm">Headers</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <ScrollArea className="h-[400px]">
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
    <div className="space-y-6">
      {renderRefreshControls()}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="py-2">
              <CardTitle className="text-sm">Recent Webhooks</CardTitle>
            </CardHeader>
            <CardContent className="py-2">{renderSidebar()}</CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">{renderWebhookDetails()}</div>
      </div>
    </div>
  );
}
