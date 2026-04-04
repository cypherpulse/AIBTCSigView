import { LayoutDashboard, Radio, Inbox, DollarSign, Wallet, Trophy, X } from "lucide-react";
import type { DashboardTab } from "@/pages/Dashboard";
import { cn } from "@/lib/utils";

const items: { id: DashboardTab; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "signals", label: "Signals", icon: Radio },
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "earnings", label: "Earnings", icon: DollarSign },
  { id: "balances", label: "Balances", icon: Wallet },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
];

interface Props {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  open: boolean;
  onClose: () => void;
}

export function DashboardSidebar({ activeTab, onTabChange, open, onClose }: Props) {
  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )} 
        onClick={onClose} 
      />
      <aside
        className={cn(
          "fixed top-16 left-0 bottom-0 w-64 z-50 border-r border-white/10 bg-background/80 backdrop-blur-2xl flex flex-col py-6 transition-transform duration-300 shadow-[4px_0_24px_rgba(0,0,0,0.5)] md:shadow-none",
          "md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="flex flex-col gap-2 px-4 relative z-10 flex-1 overflow-y-auto">
          {items.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => { onTabChange(item.id); onClose(); }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden group w-full",
                  active
                    ? "text-white shadow-[0_0_15px_rgba(var(--primary),0.15)]"
                    : "text-gray-400 hover:text-gray-100 hover:bg-white/5"
                )}
              >
                {active && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/5 rounded-xl border border-primary/30 shadow-inner opacity-100" />
                )}
                <div className={cn("relative z-10 transition-transform duration-300 flex-shrink-0", active ? "scale-110" : "group-hover:scale-110")}>
                  <item.icon className={cn("w-5 h-5", active ? "text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.8)]" : "opacity-70 group-hover:text-primary transition-colors")} />
                </div>
                <span className="relative z-10 tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
