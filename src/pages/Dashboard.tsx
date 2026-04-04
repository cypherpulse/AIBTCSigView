import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { OverviewTab } from "@/components/dashboard/OverviewTab";
import { SignalsTab } from "@/components/dashboard/SignalsTab";
import { InboxTab } from "@/components/dashboard/InboxTab";
import { EarningsTab } from "@/components/dashboard/EarningsTab";
import { BalancesTab } from "@/components/dashboard/BalancesTab";
import { LeaderboardTab } from "@/components/dashboard/LeaderboardTab";
import { ParticleBackground } from "@/components/ParticleBackground";

export type DashboardTab = "overview" | "signals" | "inbox" | "earnings" | "balances" | "leaderboard";

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const address = searchParams.get("address") || "";
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderTab = () => {
    switch (activeTab) {
      case "overview": return <OverviewTab address={address} />;
      case "signals": return <SignalsTab address={address} />;
      case "inbox": return <InboxTab address={address} />;
      case "earnings": return <EarningsTab address={address} />;
      case "balances": return <BalancesTab address={address} />;
      case "leaderboard": return <LeaderboardTab address={address} />;
      default: return <OverviewTab address={address} />;
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-background via-[#090b14] to-background text-foreground relative selection:bg-primary/30 align-top overflow-x-hidden">
      <ParticleBackground />
      <DashboardNavbar address={address} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex relative z-10 pt-16 h-[calc(100vh)]">
        <DashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-3 sm:p-5 md:p-8 md:ml-64 w-full h-full overflow-y-auto transition-all duration-300 ease-in-out">
          <div className="max-w-[1600px] mx-auto min-h-full">
            <div className="bg-black/20 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-white/5 shadow-2xl p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-8rem)] mb-8">
              {renderTab()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
