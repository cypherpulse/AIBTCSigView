import { useQuery } from "@tanstack/react-query";
import { Wallet, Bitcoin, Coins, AlertTriangle } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { fetchAgentInfo, fetchStxBalances } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  address: string;
}

function formatStx(microStx: string | number): string {
  const val = Number(microStx) / 1_000_000;
  return val.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

function formatTokenBalance(raw: string | number, decimals: number): string {
  const amount = Number(raw);
  const value = amount / Math.pow(10, decimals);
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: Math.min(decimals, 8),
  });
}

function tokenDecimals(tokenKey: string): number {
  const lower = tokenKey.toLowerCase();
  if (lower.includes("sbtc")) return 8;
  return 6;
}

function findSbtcBalance(fungibleTokens: Record<string, any>): string {
  for (const [key, val] of Object.entries(fungibleTokens)) {
    if (key.toLowerCase().includes("sbtc") || key.toLowerCase().includes("s-btc")) {
      return formatTokenBalance(val.balance ?? 0, 8);
    }
  }
  return "0";
}

export function BalancesTab({ address }: Props) {
  const { data: agentData, isLoading: agentLoading, error: agentError } = useQuery({
    queryKey: ["agent-info", address],
    queryFn: () => fetchAgentInfo(address),
    enabled: !!address,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const stxAddress = agentData?.agent?.stxAddress ?? (address.toUpperCase().startsWith("SP") || address.toUpperCase().startsWith("SM") ? address : "");
  const btcAddress = agentData?.agent?.btcAddress ?? (address.toLowerCase().startsWith("bc1") ? address : "");
  const agentName = agentData?.agent?.displayName ?? "Agent";
  const levelName = agentData?.levelName ?? "Unknown";
  const checkIns = agentData?.checkIn?.checkInCount ?? agentData?.activity?.checkInCount;
  const unreadInbox = agentData?.activity?.unreadInboxCount;
  const description = agentData?.agent?.description;

  const { data: balances, isLoading: balancesLoading } = useQuery({
    queryKey: ["stx-balances", stxAddress],
    queryFn: () => fetchStxBalances(stxAddress),
    enabled: !!stxAddress,
    staleTime: 2 * 60 * 1000,
  });

  const isLoading = agentLoading || balancesLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-foreground">Balances</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl bg-muted/50" />
          ))}
        </div>
      </div>
    );
  }

  const stxBalance = balances?.stx?.balance ? formatStx(balances.stx.balance) : "0";
  const sbtcBalance = balances?.fungible_tokens ? findSbtcBalance(balances.fungible_tokens) : "0";

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Balances</h2>
        {stxAddress && (
          <p className="text-muted-foreground text-sm font-mono">STX: {stxAddress}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard title="STX Balance" value={stxBalance} subtitle="Stacks" icon={Coins} color="orange" />
        <MetricCard title="sBTC Balance" value={sbtcBalance} subtitle="Stacks Bitcoin" icon={Bitcoin} color="green" />
        <MetricCard title="BTC Address" value={btcAddress ? `${btcAddress.slice(0, 10)}...` : "Unknown"} subtitle={agentName} icon={Wallet} color="default" />
      </div>

      <div className="glass-card p-5 space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Resolved Agent Identity</h3>
        <div className="grid gap-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Display Name</span>
            <span className="text-foreground font-medium">{agentName}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Level</span>
            <span className="text-foreground font-medium">{levelName}</span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-muted-foreground">BTC Address</span>
            <span className="text-foreground font-mono text-xs break-all text-right">{btcAddress || "Not found"}</span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-muted-foreground">STX Address</span>
            <span className="text-foreground font-mono text-xs break-all text-right">{stxAddress || "Not found"}</span>
          </div>
          {typeof checkIns === "number" && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Check-ins</span>
              <span className="text-foreground font-medium">{checkIns}</span>
            </div>
          )}
          {typeof unreadInbox === "number" && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Unread Inbox</span>
              <span className="text-foreground font-medium">{unreadInbox}</span>
            </div>
          )}
        </div>
        {description && <p className="text-xs text-muted-foreground leading-5">{description}</p>}
      </div>

      {/* Fungible tokens list */}
      {balances?.fungible_tokens && Object.keys(balances.fungible_tokens).length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-lg font-semibold text-foreground mb-3">All Fungible Tokens</h3>
          <div className="space-y-2">
            {Object.entries(balances.fungible_tokens).map(([token, val]: [string, any]) => {
              const name = token.split("::").pop() ?? token;
              const decimals = tokenDecimals(token);
              return (
                <div key={token} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                  <span className="text-sm text-foreground font-medium truncate max-w-[60%]">{name}</span>
                  <span className="text-sm text-muted-foreground font-mono">{formatTokenBalance(val.balance ?? 0, decimals)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!stxAddress && (
        <div className="glass-card p-8 text-center text-muted-foreground">
          <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Could not resolve STX address from agent profile.</p>
          <p className="text-xs mt-2">You can still use dashboard data with BTC address, but STX/sBTC balances require a resolved STX address.</p>
        </div>
      )}

      {agentError && (
        <div className="glass-card p-4 border border-destructive/30 bg-destructive/5 text-sm text-destructive flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5" />
          <span>Agent lookup failed for the provided address. Please verify the address format and try again.</span>
        </div>
      )}
    </div>
  );
}
