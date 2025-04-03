"use client";

import { WebhookLog } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LogModalProps {
  log: WebhookLog | null;
  onClose: () => void;
}

export default function LogModal({ log, onClose }: LogModalProps) {
  if (!log) {
    return null;
  }

  const getMethodColor = (method?: string) => {
    switch (method?.toUpperCase()) {
      case "GET":
        return "bg-green-50 text-green-700 border-green-200";
      case "POST":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "PUT":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "DELETE":
        return "bg-red-50 text-red-700 border-red-200";
      case "PATCH":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getStatusColor = (status?: number) => {
    if (!status) return "bg-slate-50 text-slate-600";
    if (status >= 500) return "bg-red-50 text-red-700";
    if (status >= 400) return "bg-orange-50 text-orange-700";
    if (status >= 300) return "bg-blue-50 text-blue-700";
    if (status >= 200) return "bg-green-50 text-green-700";
    return "bg-slate-50 text-slate-700";
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 -mx-4 -mt-4 mb-4 rounded-t-lg border-b border-slate-200">
          <DialogTitle className="text-lg font-semibold text-slate-800 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Webhook Request Details
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-slate-50">
            <CardContent className="pt-4">
              <div className="flex justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-500 uppercase">
                    Method
                  </span>
                  <div className="mt-1">
                    <span
                      className={`inline-flex font-mono text-sm font-semibold px-2.5 py-1 rounded-md border ${getMethodColor(
                        log.method
                      )}`}
                    >
                      {log.method?.toUpperCase() || "UNKNOWN"}
                    </span>
                  </div>
                </div>
                {log.status_code && (
                  <div>
                    <span className="text-xs font-medium text-slate-500 uppercase">
                      Status
                    </span>
                    <div className="mt-1">
                      <span
                        className={`inline-flex text-sm font-semibold px-2.5 py-1 rounded-md ${getStatusColor(
                          log.status_code
                        )}`}
                      >
                        {log.status_code}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-50">
            <CardContent className="pt-4">
              <span className="text-xs font-medium text-slate-500 uppercase">
                Timestamp
              </span>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {log.created_at
                  ? new Date(log.created_at).toLocaleString()
                  : "N/A"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6 bg-slate-50">
          <CardContent className="pt-4">
            <span className="text-xs font-medium text-slate-500 uppercase">
              Path
            </span>
            <p className="mt-1 text-sm font-medium text-slate-800 break-all">
              {log.path || "/"}
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-800 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Headers
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <pre className="bg-white p-3 text-xs font-mono max-h-40 overflow-y-auto">
                  {JSON.stringify(log.headers, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-slate-800 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              Body
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <pre className="bg-white p-3 text-xs font-mono max-h-60 overflow-y-auto">
                  {log.body
                    ? typeof log.body === "object"
                      ? JSON.stringify(log.body, null, 2)
                      : log.body
                    : "No body content"}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
