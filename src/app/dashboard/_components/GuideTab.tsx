import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserWebhook } from "@/lib/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CodeExamples from "./CodeExamples";
import { BookOpen } from "lucide-react";

interface GuideTabProps {
  webhooks: UserWebhook[];
  selectedToken: string;
  setSelectedToken: (token: string) => void;
}

export default function GuideTab({
  webhooks,
  selectedToken,
  setSelectedToken,
}: GuideTabProps) {
  // Handle token selection
  const handleTokenSelect = (tokenValue: string) => {
    setSelectedToken(tokenValue);
    // Replace the placeholder in code examples with the selected token
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          Using Your Webhook Logger
        </CardTitle>
        <CardDescription>
          Learn how to integrate and use webhook endpoints in your applications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Authentication</h3>
          <p className="mb-2">
            To authenticate your webhook requests, include your token in the
            request header:
          </p>

          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-1 rounded-md flex-1">
              <code className="font-mono text-sm text-blue-600 px-2 py-1 rounded-md">
                X-Webhook-Token: <b>{selectedToken}</b>
              </code>
            </div>
            <Select onValueChange={handleTokenSelect} value={selectedToken}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a token" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="your_token_here">
                  Choose a token...
                </SelectItem>
                {webhooks.map((webhook) => (
                  <SelectItem key={webhook.id} value={webhook.token}>
                    {webhook.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className="mt-2 text-sm text-slate-600">
            You can create and manage tokens in the &quot;Webhook Tokens&quot;
            tab.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Available Endpoints</h3>
          <div className="flex items-center">
            <Badge className="w-16 justify-center mr-4">POST</Badge>
            <code className="font-mono text-sm">/api/webhook</code>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Send your webhook data to this endpoint with a POST request.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Request Format</h3>
          <p className="mb-2">
            Structure your webhook payload with an event name and data:
          </p>
          <div className="bg-slate-100 p-3 rounded-md">
            <pre className="text-sm overflow-auto">
              <code>{`{
  "event": "user.created",
  "data": {
    // Your event data here
  }
}`}</code>
            </pre>
          </div>
        </div>
      </CardContent>

      <CodeExamples selectedToken={selectedToken} />
    </Card>
  );
}
