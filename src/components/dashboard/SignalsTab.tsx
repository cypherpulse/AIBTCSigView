import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchSignals, fetchSignalById } from "@/lib/api";
import type { Signal } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Search, ExternalLink } from "lucide-react";

interface Props {
  address: string;
}

export function SignalsTab({ address }: Props) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [signalIdInput, setSignalIdInput] = useState("");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["signals", address, "all"],
    queryFn: () => fetchSignals({ agent: address, limit: 50 }),
    enabled: !!address,
    staleTime: 60 * 1000,
  });

  const { data: detail, isLoading: detailLoading, error: detailError } = useQuery({
    queryKey: ["signal", selectedId],
    queryFn: () => fetchSignalById(selectedId!),
    enabled: !!selectedId,
    staleTime: 5 * 60 * 1000,
  });

  const signals = data?.signals?.filter((s: Signal) => {
    const normalizedStatus = typeof s.status === "string" ? s.status.toLowerCase() : "";
    if (statusFilter !== "all" && normalizedStatus !== statusFilter) return false;
    const signalId = String(s.id ?? "");
    if (
      search &&
      !s.headline?.toLowerCase().includes(search.toLowerCase()) &&
      !signalId.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  }) ?? [];

  const filters = ["all", "approved", "pending", "brief", "in_review", "rejected"];

  const selectedFromList = selectedId
    ? signals.find((s) => String(s.id) === String(selectedId))
    : undefined;
  const detailToShow = detail ?? selectedFromList;

  const getStatusClass = (status?: string) =>
    cn(
      "px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap",
      status?.toLowerCase() === "approved" && "status-approved",
      status?.toLowerCase() === "brief" && "status-approved",
      status?.toLowerCase() === "pending" && "status-pending",
      status?.toLowerCase() === "in_review" && "status-pending",
      status?.toLowerCase() === "rejected" && "status-rejected"
    );

  const getStatusEmoji = (status?: string) => {
    const normalized = status?.toLowerCase();
    if (normalized === "approved") return "✅";
    if (normalized === "brief") return "📰";
    if (normalized === "pending") return "⏳";
    if (normalized === "in_review") return "🕵️";
    if (normalized === "rejected") return "❌";
    return "•";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-foreground">Signals</h2>

      <div className="flex flex-col lg:flex-row gap-3 flex-wrap items-stretch">
        <div className="relative flex-1 w-full basis-full lg:basis-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by headline or id..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-muted/30 border-border/50"
          />
        </div>
        <div className="flex gap-2 sm:w-auto w-full">
          <Input
            placeholder="Signal id"
            value={signalIdInput}
            onChange={(e) => setSignalIdInput(e.target.value)}
            className="bg-muted/30 border-border/50"
          />
          <Button
            type="button"
            size="sm"
            onClick={() => {
              const id = signalIdInput.trim();
              if (id) setSelectedId(id);
            }}
            disabled={!signalIdInput.trim()}
          >
            Open ID
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 w-full lg:w-auto basis-full">
          {filters.map((f) => (
            <Button
              key={f}
              type="button"
              variant={statusFilter === f ? "default" : "ghost"}
              size="sm"
              onClick={() => setStatusFilter(f)}
              className={cn("capitalize text-xs", statusFilter === f && "btn-glow")}
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      <div className={cn("grid gap-4", selectedId ? "lg:grid-cols-[minmax(0,1fr)_430px] grid-cols-1" : "grid-cols-1")}>
        <div className={cn(selectedId ? "hidden lg:block" : "block")}>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl bg-muted/50" />
              ))}
            </div>
          ) : signals.length === 0 ? (
            <div className="glass-card p-8 text-center text-muted-foreground">No signals found</div>
          ) : (
            <div className="space-y-3">
              {signals.map((sig: Signal) => (
                <button
                  type="button"
                  key={sig.id}
                  onClick={() => {
                    setSignalIdInput(String(sig.id));
                    setSelectedId(String(sig.id));
                  }}
                  className={cn(
                    "w-full text-left glass-card-hover p-4 flex items-start gap-4 transition-all",
                    String(selectedId) === String(sig.id) && "ring-1 ring-primary/50"
                  )}
                >
                  <div className={cn(getStatusClass(sig.status), "mt-0.5")}>
                    {getStatusEmoji(sig.status)} {sig.status}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{sig.headline}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground">#{sig.id}</span>
                      <span className="text-xs text-muted-foreground">
                        {sig.timestamp ? new Date(sig.timestamp).toLocaleString() : "No timestamp"}
                      </span>
                      {sig.beat && <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{sig.beat}</span>}
                    </div>
                    {sig.publisherFeedback && (
                      <p className="text-xs text-muted-foreground mt-2 p-2 rounded bg-muted/30 border border-border/30 line-clamp-3">
                        {sig.publisherFeedback}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedId && (
          <aside className="glass-card flex flex-col p-4 md:p-5 space-y-4 h-fit lg:sticky lg:top-24">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 mb-2 lg:hidden w-full border-b border-border/10 pb-2">
                <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={() => setSelectedId(null)}>
                  &larr; Back to list
                </Button>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground mb-1">Selected signal</p>
                <h3 className="text-base md:text-lg font-semibold text-foreground break-words">
                  {detailToShow?.headline ?? "Loading signal..."}
                </h3>
              </div>
              <Button type="button" variant="ghost" size="icon" className="hidden lg:flex" onClick={() => setSelectedId(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {detailLoading && <Skeleton className="h-24 rounded-xl bg-muted/50" />}
            {detailError && (
              <div className="p-3 text-sm border rounded-lg border-destructive/30 text-destructive bg-destructive/5">
                Could not load signal for ID {selectedId}
              </div>
            )}

            {detailToShow && (
              <>
                <div className="flex gap-2 flex-wrap">
                  <span className={getStatusClass(detailToShow.status)}>{getStatusEmoji(detailToShow.status)} {detailToShow.status}</span>
                  <span className="text-xs text-muted-foreground">#{detailToShow.id}</span>
                  <span className="text-xs text-muted-foreground">{detailToShow.beat ?? "No beat"}</span>
                </div>

                <div className="max-h-[48vh] overflow-y-auto pr-1 space-y-4">
                  {detailToShow.publisherFeedback && (
                    <div className="p-3 text-sm border rounded-lg border-destructive/30 bg-destructive/5 break-words">
                      <strong className="text-destructive">Publisher Feedback:</strong> {detailToShow.publisherFeedback}
                    </div>
                  )}

                  <div className="p-3 text-sm rounded-lg bg-muted/30 border border-border/40 whitespace-pre-wrap break-words leading-6 text-foreground/90">
                    {detailToShow.content ?? detailToShow.body ?? "No content available"}
                  </div>

                  {detailToShow.sources?.length > 0 && (
                    <div>
                      <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Sources</h4>
                      <div className="space-y-2">
                        {detailToShow.sources.map((s, i: number) => (
                          <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 text-sm text-primary hover:underline break-all">
                            <ExternalLink className="w-3 h-3 mt-1 shrink-0" />
                            <span>{s.title ?? s.url}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {detailToShow.disclosure && (
                    <div className="p-3 text-xs rounded-lg bg-muted/30 border border-border/40 text-muted-foreground break-words">
                      <strong>Disclosure:</strong> {detailToShow.disclosure}
                    </div>
                  )}
                </div>
              </>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
