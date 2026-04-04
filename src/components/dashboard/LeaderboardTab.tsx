import { useQuery } from "@tanstack/react-query";
import { fetchCorrespondents } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Flame, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  address: string;
}

export function LeaderboardTab({ address }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["correspondents"],
    queryFn: fetchCorrespondents,
  });

  const correspondents = data?.correspondents ?? [];
  const getAddress = (c: any) => c?.address || c?.btcAddress || c?.btc_address || c?.stxAddress || c?.stx_address;
  const myIndex = correspondents.findIndex((c: any) => getAddress(c) === address);
  const me = myIndex >= 0 ? correspondents[myIndex] : null;

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48 bg-muted/50" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl bg-muted/50" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-foreground">Leaderboard</h2>

      <div className="glass-card p-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Your Position</p>
          <p className="text-lg font-semibold text-foreground">{myIndex >= 0 ? `#${myIndex + 1}` : "Not ranked"}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-foreground font-medium">{me?.display_name || me?.addressShort || (getAddress(me) ? String(getAddress(me)).slice(0, 12) : "—")}</p>
          <p className="text-xs text-muted-foreground">{me?.score ?? "—"} score • {me?.signalCount ?? 0} signals</p>
        </div>
      </div>

      <div className="space-y-2">
        {correspondents.map((c: any, i: number) => {
          const isMe = getAddress(c) === address;
          return (
            <div
              key={getAddress(c) || i}
              className={cn(
                "glass-card-hover p-4 flex items-center gap-4",
                isMe && "border-primary/40 glow-orange"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm",
                i === 0 && "bg-warning/20 text-warning",
                i === 1 && "bg-muted text-muted-foreground",
                i === 2 && "bg-primary/15 text-primary",
                i > 2 && "bg-muted/50 text-muted-foreground"
              )}>
                {i < 3 ? <Trophy className="w-4 h-4" /> : `#${i + 1}`}
              </div>

              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium truncate", isMe ? "text-primary" : "text-foreground")}>
                  {c.display_name || c.addressShort || c.address?.slice(0, 12)}
                  {isMe && <span className="ml-2 text-xs text-primary">(You)</span>}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Radio className="w-3 h-3" />{c.signalCount} signals</span>
                  <span className="flex items-center gap-1"><Flame className="w-3 h-3" />{c.streak} streak</span>
                  <span>{c.daysActive}d active</span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">{c.score ?? "—"}</p>
                <p className="text-xs text-muted-foreground">score</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
