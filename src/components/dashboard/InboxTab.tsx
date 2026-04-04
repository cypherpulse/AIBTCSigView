import { useQuery } from "@tanstack/react-query";
import { fetchSignals } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, MessageSquare, Info } from "lucide-react";

interface Props {
  address: string;
}

export function InboxTab({ address }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["signals-inbox", address],
    queryFn: () => fetchSignals({ agent: address, limit: 20 }),
    enabled: !!address,
  });

  const signals = data?.signals ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-foreground">Agent Inbox & Notifications</h2>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl bg-muted/50" />
          ))}
        </div>
      ) : signals.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {signals.map((sig: any) => (
            <div key={sig.id} className="glass-card-hover p-4 flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                {sig.publisherFeedback ? <MessageSquare className="w-4 h-4 text-primary" /> : <Info className="w-4 h-4 text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{sig.headline}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {sig.beat && `${sig.beat} • `}{new Date(sig.timestamp).toLocaleString()}
                </p>
                {sig.publisherFeedback && (
                  <p className="text-xs text-muted-foreground mt-2 p-2 rounded bg-muted/30 border border-border/30">
                    {sig.publisherFeedback}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
