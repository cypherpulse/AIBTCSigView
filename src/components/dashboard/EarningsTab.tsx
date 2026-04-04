import { useQuery } from "@tanstack/react-query";
import { fetchEarnings } from "@/lib/api";
import { MetricCard } from "./MetricCard";
import { DollarSign, TrendingUp, Award, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface Props {
  address: string;
}

export function EarningsTab({ address }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["earnings", address],
    queryFn: () => fetchEarnings(address),
    enabled: !!address,
    staleTime: 60 * 1000,
  });

  const earnings = data?.earnings ?? [];

  // Handle the actual API shape: { id, btc_address, amount_sats, reason, reference_id, created_at, payout_txid, voided_at }
  const totalSats = earnings.reduce((sum: number, e: any) => sum + (Number(e.amount_sats) || 0), 0);
  const chartData = earnings.map((e: any, i: number) => ({
    name: e.created_at ? new Date(e.created_at).toLocaleDateString() : `#${i + 1}`,
    amount: Number(e.amount_sats) || 0,
  }));

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48 bg-muted/50" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl bg-muted/50" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl bg-muted/50" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-foreground">Earnings</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard title="Total Earned" value={`${totalSats.toLocaleString()} sats`} icon={DollarSign} color="green" />
        <MetricCard title="Payouts" value={earnings.length} icon={FileText} color="orange" />
        <MetricCard title="Avg per Payout" value={earnings.length > 0 ? `${Math.round(totalSats / earnings.length).toLocaleString()} sats` : "—"} icon={Award} color="green" />
      </div>

      {chartData.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-lg font-semibold text-foreground mb-4">Earnings Over Time</h3>
          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142,71%,45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(142,71%,45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,15%)" />
                <XAxis dataKey="name" stroke="hsl(215,20%,65%)" fontSize={12} />
                <YAxis stroke="hsl(215,20%,65%)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(0,0%,7%)",
                    border: "1px solid hsl(0,0%,15%)",
                    borderRadius: "8px",
                    color: "hsl(210,40%,98%)",
                  }}
                  formatter={(value: number) => [`${value.toLocaleString()} sats`, "Amount"]}
                />
                <Area type="monotone" dataKey="amount" stroke="hsl(142,71%,45%)" fillOpacity={1} fill="url(#earningsGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Earnings table */}
      {earnings.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-lg font-semibold text-foreground mb-3">Payout History</h3>
          <div className="space-y-2">
            {earnings.map((e: any) => (
              <div key={e.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{e.reason || "Payout"}</p>
                  <p className="text-xs text-muted-foreground">{e.created_at ? new Date(e.created_at).toLocaleString() : "—"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-success">{Number(e.amount_sats).toLocaleString()} sats</p>
                  {e.voided_at && <p className="text-xs text-destructive">Voided</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {earnings.length === 0 && (
        <div className="glass-card p-12 text-center text-muted-foreground">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No earnings data available yet</p>
        </div>
      )}
    </div>
  );
}
