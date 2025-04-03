import LogsDisplayWrapper from "@/components/LogsDisplayWrapper";
import { UserWebhook } from "@/lib/supabase";

interface LogsFilterTabProps {
  webhooks: UserWebhook[];
  selectedLogToken: string | undefined;
  setSelectedLogToken: (token: string | undefined) => void;
}

export default function LogsFilterTab({
  selectedLogToken,
}: LogsFilterTabProps) {
  return <LogsDisplayWrapper selectedTokenId={selectedLogToken} />;
}
