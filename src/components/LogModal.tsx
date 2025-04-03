"use client";

import { WebhookLog } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface LogModalProps {
  log: WebhookLog | null;
  onClose: () => void;
}

export default function LogModal({ log, onClose }: LogModalProps) {
  if (!log) {
    return null;
  }

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

  const getStatusBadgeVariant = (status?: number) => {
    if (!status) return "outline";
    if (status >= 500) return "destructive";
    if (status >= 400) return "outline";
    if (status >= 300) return "secondary";
    if (status >= 200) return "default";
    return "outline";
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-600"
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-500 uppercase">
                  Method
                </span>
                <div>
                  <Badge variant={getMethodBadgeVariant(log.method)}>
                    {log.method?.toUpperCase() || "UNKNOWN"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-500 uppercase">
                  Status
                </span>
                <div>
                  {log.status_code ? (
                    <Badge variant={getStatusBadgeVariant(log.status_code)}>
                      {log.status_code}
                    </Badge>
                  ) : (
                    <span className="text-sm text-slate-500">N/A</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-500 uppercase">
                  Timestamp
                </span>
                <p className="text-sm">
                  {log.created_at
                    ? new Date(log.created_at).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-4">
          <CardContent className="pt-4">
            <div className="space-y-1">
              <span className="text-xs font-medium text-slate-500 uppercase">
                Path
              </span>
              <p className="text-sm font-mono bg-slate-50 p-2 rounded-md break-all">
                {log.path || "/"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="headers" className="mb-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="headers">Headers</TabsTrigger>
            <TabsTrigger value="body">Body</TabsTrigger>
          </TabsList>

          <TabsContent value="headers" className="mt-4">
            <Card>
              <CardHeader className="py-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-blue-600"
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
              <CardContent className="py-0">
                <ScrollArea className="h-60">
                  <pre className="text-xs font-mono bg-slate-50 p-3 rounded-md">
                    {JSON.stringify(log.headers, null, 2)}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="body" className="mt-4">
            <Card>
              <CardHeader className="py-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-blue-600"
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
              <CardContent className="py-0">
                <ScrollArea className="h-60">
                  <pre className="text-xs font-mono bg-slate-50 p-3 rounded-md">
                    {log.body
                      ? typeof log.body === "object"
                        ? JSON.stringify(log.body, null, 2)
                        : log.body
                      : "No body content"}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Separator />

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
