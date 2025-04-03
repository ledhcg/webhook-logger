import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Key } from "lucide-react";
import { UserWebhook } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LogsDisplayWrapper from "@/components/LogsDisplayWrapper";

interface LogsFilterTabProps {
  webhooks: UserWebhook[];
  selectedLogToken: string | undefined;
  setSelectedLogToken: (token: string | undefined) => void;
}

export default function LogsFilterTab({
  webhooks,
  selectedLogToken,
  setSelectedLogToken,
}: LogsFilterTabProps) {
  const router = useRouter();

  // Update URL when token selection changes
  const handleTokenFilterChange = (value: string) => {
    const newValue = value === "all" ? undefined : value;
    setSelectedLogToken(newValue);

    // Update URL with query parameter
    if (newValue) {
      router.push(`/dashboard?id=${newValue}`);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="py-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="h-4 w-4 text-blue-500" />
            Filter Logs by Token
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Select
              onValueChange={handleTokenFilterChange}
              defaultValue={selectedLogToken || "all"}
              value={selectedLogToken || "all"}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select token to filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tokens</SelectItem>
                {webhooks.map((webhook) => (
                  <SelectItem key={webhook.id} value={webhook.id || ""}>
                    {webhook.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-slate-500">
              {selectedLogToken
                ? `Showing logs for: ${
                    webhooks.find((w) => w.id === selectedLogToken)?.name ||
                    "Selected token"
                  }`
                : "Showing logs for all your tokens"}
            </span>
          </div>
        </CardContent>
      </Card>
      <LogsDisplayWrapper selectedTokenId={selectedLogToken} />
    </>
  );
}
