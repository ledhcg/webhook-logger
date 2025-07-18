import { useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { createWebhookToken, UserWebhook } from "@/lib/supabase";
import { toast } from "sonner";
import { Copy, Key, Plus, AlertCircle, Loader2 } from "lucide-react";

interface WebhookTokensTabProps {
  userId: string;
  webhooks: UserWebhook[];
  isLoading: boolean;
  error: string | null;
  setWebhooks: (webhooks: UserWebhook[]) => void;
}

function WebhookTokensTab({
  userId,
  webhooks,
  isLoading,
  error,
  setWebhooks,
}: WebhookTokensTabProps) {
  const [tokenName, setTokenName] = useState("");
  const [isCreatingToken, setIsCreatingToken] = useState(false);

  const handleCreateToken = async () => {
    try {
      setIsCreatingToken(true);
      const name = tokenName.trim() || "My Webhook";

      // Check if a webhook with the same name already exists
      const nameExists = webhooks.some((webhook) => webhook.name === name);
      if (nameExists) {
        toast.error("Token name already exists", {
          description: "Please choose a different name for your webhook token",
        });
        return;
      }

      const newWebhook = await createWebhookToken(userId, name);
      setWebhooks([...webhooks, newWebhook]);
      setTokenName("");
      toast.success("Webhook token created", {
        description: "Your new webhook token is ready to use",
      });
    } catch {
      // Error creating webhook token
      toast.error("Failed to create webhook token");
    } finally {
      setIsCreatingToken(false);
    }
  };

  const copyToClipboard = useCallback((text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard", {
      description: message,
    });
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5 text-blue-600" />
          Your Webhook Tokens
        </CardTitle>
        <CardDescription>Create and manage your webhook tokens</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Label htmlFor="token-name" className="mb-2">
              Token Name
            </Label>
            <Input
              id="token-name"
              placeholder="My Project Webhook"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
            />
          </div>
          <Button
            className="self-end"
            onClick={handleCreateToken}
            disabled={isCreatingToken}
          >
            {isCreatingToken ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-1" />
            )}
            {isCreatingToken ? "Creating..." : "Create Token"}
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : webhooks.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Token</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {webhooks.map((webhook) => (
                <TableRow key={webhook.id}>
                  <TableCell>{webhook.name}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {webhook.token.substring(0, 8)}...
                  </TableCell>
                  <TableCell>
                    {new Date(webhook.created_at!).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          webhook.token,
                          "Token copied to clipboard"
                        )
                      }
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <p>You don&apos;t have any webhook tokens yet.</p>
            <p className="text-sm mt-1">
              Create one to start receiving webhook logs.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default memo(WebhookTokensTab);
