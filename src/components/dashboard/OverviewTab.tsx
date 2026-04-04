import { useQuery } from "@tanstack/react-query";
import { fetchAgentStatus, fetchCorrespondents, fetchSignals, fetchAgentInfo, fetchEarnings } from "@/lib/api";
import { MetricCard } from "./MetricCard";
import { Radio, Flame, Trophy, Zap, CheckCircle, FileText, ShieldAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Props {
  address: string;
}

export function OverviewTab({ address }: Props) {
  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ["status", address],
    queryFn: () => fetchAgentStatus(address),
    enabled: !!address,
    staleTime: 2 * 60 * 1000,
  });

  const { data: leaderboard } = useQuery({
    queryKey: ["correspondents"],
    queryFn: fetchCorrespondents,
    staleTime: 5 * 60 * 1000,
  });

  const { data: signalsData } = useQuery({
    queryKey: ["signals", address],
    queryFn: () => fetchSignals({ agent: address, limit: 3 }),
    enabled: !!address,
    staleTime: 60 * 1000,
  });

  const { data: allSignalsData } = useQuery({
    queryKey: ["signals", address, "counts"],
    queryFn: () => fetchSignals({ agent: address, limit: 200 }),
    enabled: !!address,
    staleTime: 60 * 1000,
  });

  const { data: agentInfo } = useQuery({
    queryKey: ["agent-info", address],
    queryFn: () => fetchAgentInfo(address),
    enabled: !!address,
    staleTime: 5 * 60 * 1000,
  });

  const { data: earningsData } = useQuery({
    queryKey: ["earnings", address],
    queryFn: () => fetchEarnings(address),
    enabled: !!address,
    staleTime: 60 * 1000,
  });

  const rank =
    leaderboard?.correspondents?.findIndex(
      (c: any) => c.address === address || c.btcAddress === address || c.btc_address === address
    ) ?? -1;
  const me =
    leaderboard?.correspondents?.find(
      (c: any) => c.address === address || c.btcAddress === address || c.btc_address === address
    ) ?? null;
  const rankDisplay = rank >= 0 ? `#${rank + 1}` : "—";
  const satsEarned = (earningsData?.earnings ?? []).reduce(
    (sum: number, e: any) => sum + (Number(e.amount_sats) || 0),
    0
  );

  const achievementStreak =
    (agentInfo as any)?.achievements
      ?.map((a: any) => Number(a?.metadata?.currentStreak))
      ?.filter((n: number) => Number.isFinite(n) && n > 0)
      ?.reduce((max: number, n: number) => Math.max(max, n), 0) ?? 0;

  const currentStreak =
    Number(status?.current_streak) ||
    Number(status?.streak) ||
    Number(me?.streak) ||
    achievementStreak ||
    0;

  const briefSignalsCount = (allSignalsData?.signals ?? []).filter(
    (s: any) => String(s?.status ?? "").toLowerCase() === "brief"
  ).length;

  const rejectedSignalsCount = (allSignalsData?.signals ?? []).filter(
    (s: any) => String(s?.status ?? "").toLowerCase() === "rejected"
  ).length;

  if (statusLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl bg-muted/50" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex flex-wrap items-center gap-3 mb-1">
          <h2 className="text-2xl font-bold text-foreground">Agent Overview</h2>
          {agentInfo?.agent?.displayName && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/15 text-primary border border-primary/20 truncate max-w-full">
              {agentInfo.agent.displayName}
            </span>
          )}
          {agentInfo?.levelName && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-success/15 text-success border border-success/20">
              {agentInfo.levelName}
            </span>
          )}
        </div>
        <p className="text-muted-foreground text-sm font-mono break-all">{address}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard title="Total Signals" value={status?.total_signals ?? status?.totalSignals ?? 0} icon={Radio} color="blue" />
        <MetricCard title="Rejected Signals" value={rejectedSignalsCount} subtitle="needs corrections" icon={ShieldAlert} color="red" />
        <MetricCard title="In Brief Signals" value={briefSignalsCount} subtitle="included in brief" icon={FileText} color="purple" />
        <MetricCard title="Leaderboard Rank" value={rankDisplay} icon={Trophy} color="orange" />
        <MetricCard title="Sats Earned" value={`${satsEarned.toLocaleString()} sats`} icon={Zap} color="green" />
        <MetricCard
          title="Agent Status"
          value={agentInfo?.found ? "Active" : "Unknown"}
          icon={CheckCircle}
          color={agentInfo?.found ? "green" : "default"}
        />
      </div>

      {/* Agent Capabilities */}
      {agentInfo?.capabilities?.length > 0 && (
        <div className="glass-card p-6 bg-gradient-to-br from-white/5 to-transparent border border-white/10 shadow-lg rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-4 relative z-10 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-400" /> Capabilities
          </h3>
          <div className="flex flex-wrap gap-3 relative z-10">
            {agentInfo.capabilities.map((cap: string, i: number) => (
              <span key={i} className="px-4 py-1.5 rounded-xl text-sm font-semibold bg-white/5 text-gray-200 border border-white/10 shadow-sm hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-300 transition-all duration-300 cursor-default">
                {cap}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Latest Signals */}
      {signalsData?.signals?.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-lg font-semibold text-foreground mb-3">Latest Signals</h3>
          <div className="space-y-3">
            {signalsData.signals.slice(0, 3).map((sig: any) => {
                const status = String(sig.status ?? "").toLowerCase();
                return (
                  <div key={sig.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
                    <div
                      className={cn(
                        "px-2 py-0.5 rounded text-xs font-medium",
                        status === "approved" && "status-approved",
                        status === "pending" && "status-pending",
                        status === "rejected" && "status-rejected"
                      )}
                    >
                      {status === "approved" ? "✅" : status === "pending" ? "⏳" : status === "rejected" ? "❌" : "•"} {sig.status}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground truncate">{sig.headline}</p>
                      <p className="text-xs text-muted-foreground">{new Date(sig.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
