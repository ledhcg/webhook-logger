"use client";

import { WebhookLog } from "@/lib/supabase";
import { useState, useEffect } from "react";
import LogModal from "./LogModal";

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

  const handleRefreshIntervalChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setRefreshInterval(Number(e.target.value));
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
      <div className="mb-6 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <h3 className="text-base font-semibold text-slate-800 mb-3 flex items-center">
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
        </h3>
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
                <select
                  id="refreshInterval"
                  value={refreshInterval}
                  onChange={handleRefreshIntervalChange}
                  className="rounded border border-blue-200 py-1.5 px-3 text-sm bg-white shadow-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[120px] font-medium"
                >
                  <option value={1000}>1 second</option>
                  <option value={3000}>3 seconds</option>
                  <option value={5000}>5 seconds</option>
                  <option value={10000}>10 seconds</option>
                  <option value={30000}>30 seconds</option>
                  <option value={60000}>1 minute</option>
                </select>
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
            <button
              onClick={handleManualRefresh}
              className="py-1.5 px-4 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md border border-blue-200 flex items-center font-medium shadow-sm transition-colors"
              disabled={loading}
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
            </button>

            <button
              onClick={togglePolling}
              className={`py-1.5 px-4 text-sm rounded-md border flex items-center font-medium shadow-sm transition-colors ${
                isPolling
                  ? "bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                  : "bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
              }`}
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
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render the logs table
  const renderLogs = () => {
    if (loading && logs.length === 0) {
      return (
        <div className="flex justify-center items-center p-12 bg-slate-50 rounded-lg border border-slate-200">
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
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
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
        </div>
      );
    }

    if (logs.length === 0) {
      return (
        <div className="bg-blue-50 p-8 rounded-lg border border-blue-100 text-center">
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
        </div>
      );
    }

    return (
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-24"
              >
                Method
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >
                Path
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >
                Time
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-32"
              >
                Status
              </th>
              <th scope="col" className="relative px-4 py-3 w-16">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
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
              if (log.status_code >= 500) {
                statusColor = "text-red-600 bg-red-50";
              } else if (log.status_code >= 400) {
                statusColor = "text-orange-600 bg-orange-50";
              } else if (log.status_code >= 300) {
                statusColor = "text-blue-600 bg-blue-50";
              } else if (log.status_code >= 200) {
                statusColor = "text-green-600 bg-green-50";
              } else {
                statusColor = "text-slate-600 bg-slate-50";
              }

              return (
                <tr
                  key={log.id}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => openLogDetails(log)}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex font-mono text-xs font-semibold px-2.5 py-1 rounded-md border ${methodColor}`}
                    >
                      {method?.toUpperCase() || "UNKNOWN"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-slate-800 font-medium truncate max-w-xs">
                      {log.path || "/"}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {new Date(log.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-md ${statusColor}`}
                    >
                      {log.status_code || "N/A"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      className="text-blue-600 hover:text-blue-800 transition-colors flex items-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        openLogDetails(log);
                      }}
                    >
                      <span className="hidden sm:inline mr-1">View</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderRefreshControls()}
      {renderLogs()}
      {isModalOpen && selectedLog && (
        <LogModal log={selectedLog} onClose={closeModal} />
      )}
    </div>
  );
}
