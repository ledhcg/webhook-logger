"use client";

import { WebhookLog } from "@/lib/supabase";
import { useState, useEffect } from "react";
import LogModal from "./LogModal";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LogsDisplay() {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [refreshInterval, setRefreshInterval] = useState<number>(5000); // Default: 5 seconds
  const [isPolling, setIsPolling] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/logs");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch logs");
      }

      setLogs(data.logs || []);
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

    let interval: NodeJS.Timeout | null = null;

    if (isPolling) {
      interval = setInterval(fetchLogs, refreshInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [refreshInterval, isPolling]);

  const openLogDetails = (log: WebhookLog) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleRefreshIntervalChange = (value: string) => {
    setRefreshInterval(Number(value));
  };

  const togglePolling = () => {
    setIsPolling(!isPolling);
  };

  const handleManualRefresh = () => {
    fetchLogs();
  };

  // Format the last refreshed timestamp
  const formatLastRefreshed = () => {
    if (!lastRefreshed) return "Never";

    return lastRefreshed.toLocaleTimeString();
  };

  // Render refresh controls
  const renderRefreshControls = () => {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-blue-500"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Auto-Refresh Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center bg-blue-50 px-3 py-2 rounded-md border border-blue-100">
                <label
                  htmlFor="refreshInterval"
                  className="mr-2 text-sm font-medium text-blue-700 whitespace-nowrap"
                >
                  Refresh every:
                </label>
                <div className="relative">
                  <Select
                    value={refreshInterval.toString()}
                    onValueChange={handleRefreshIntervalChange}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Select interval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1000">1 second</SelectItem>
                      <SelectItem value="3000">3 seconds</SelectItem>
                      <SelectItem value="5000">5 seconds</SelectItem>
                      <SelectItem value="10000">10 seconds</SelectItem>
                      <SelectItem value="30000">30 seconds</SelectItem>
                      <SelectItem value="60000">1 minute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-md border border-slate-200">
                <span className="font-medium text-slate-700 mr-1">
                  Last updated:
                </span>
                <span className="inline-block px-2 py-1 bg-white rounded border border-slate-200 text-slate-800 font-medium">
                  {formatLastRefreshed()}
                </span>
                {loading && (
                  <span className="ml-2 text-blue-600 flex items-center text-xs">
                    <svg
                      className="animate-spin -ml-1 mr-1 h-3 w-3 text-blue-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    refreshing
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleManualRefresh}
                variant="outline"
                size="sm"
                disabled={loading}
                className="text-blue-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </Button>

              <Button
                onClick={togglePolling}
                variant="outline"
                size="sm"
                className={isPolling ? "text-green-700" : "text-red-700"}
              >
                {isPolling ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Auto-refresh on
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Auto-refresh off
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Render the logs table
  const renderLogs = () => {
    if (loading && logs.length === 0) {
      return (
        <Card>
          <CardContent className="flex justify-center items-center p-12">
            <div className="flex flex-col items-center">
              <svg
                className="animate-spin h-8 w-8 text-blue-500 mb-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="text-slate-600">Loading webhook logs...</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (error) {
      return (
        <Card>
          <CardContent className="p-4 text-red-700">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 mr-2 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p>Error: {error}</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (logs.length === 0) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <svg
              className="h-12 w-12 text-blue-400 mx-auto mb-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="text-lg font-semibold text-blue-800 mb-1">
              No webhook logs yet
            </h3>
            <p className="text-blue-600 max-w-md mx-auto">
              Send a request to the endpoints above to see your webhook logs
              appear here
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Method</TableHead>
                <TableHead>Path</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="w-32">Status</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => {
                const { method } = log;

                let methodColor;
                switch (method?.toUpperCase()) {
                  case "GET":
                    methodColor = "text-green-600 bg-green-50 border-green-200";
                    break;
                  case "POST":
                    methodColor = "text-blue-600 bg-blue-50 border-blue-200";
                    break;
                  case "PUT":
                    methodColor =
                      "text-orange-600 bg-orange-50 border-orange-200";
                    break;
                  case "DELETE":
                    methodColor = "text-red-600 bg-red-50 border-red-200";
                    break;
                  case "PATCH":
                    methodColor =
                      "text-purple-600 bg-purple-50 border-purple-200";
                    break;
                  default:
                    methodColor = "text-slate-600 bg-slate-50 border-slate-200";
                }

                let statusColor;
                if ((log.status_code || 0) >= 500) {
                  statusColor = "text-red-600 bg-red-50";
                } else if ((log.status_code || 0) >= 400) {
                  statusColor = "text-orange-600 bg-orange-50";
                } else if ((log.status_code || 0) >= 300) {
                  statusColor = "text-blue-600 bg-blue-50";
                } else if ((log.status_code || 0) >= 200) {
                  statusColor = "text-green-600 bg-green-50";
                } else {
                  statusColor = "text-slate-600 bg-slate-50";
                }

                return (
                  <TableRow
                    key={log.id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => openLogDetails(log)}
                  >
                    <TableCell className="whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-md border ${methodColor}`}
                      >
                        {method?.toUpperCase() || "UNKNOWN"}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate font-medium">
                      {log.path || "/"}
                    </TableCell>
                    <TableCell>
                      {log.created_at
                        ? new Date(log.created_at).toLocaleString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {log.status_code && (
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-md ${statusColor}`}
                        >
                          {log.status_code}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      {renderRefreshControls()}
      {renderLogs()}
      <LogModal log={selectedLog} onClose={closeModal} />
    </div>
  );
}
