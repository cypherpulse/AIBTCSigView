import { Copy, RefreshCw, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  address: string;
  onMenuToggle: () => void;
}

export function DashboardNavbar({ address, onMenuToggle }: Props) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const short = address.length > 16 ? `${address.slice(0, 8)}...${address.slice(-6)}` : address;

  const copy = () => {
    navigator.clipboard.writeText(address);
    toast.success("Address copied!");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur-xl border-b border-white/10 flex items-center px-3 sm:px-6 gap-2 sm:gap-4 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      <Button variant="ghost" size="icon" className="md:hidden hover:bg-white/10 text-white transition-colors" onClick={onMenuToggle}>
        <Menu className="w-5 h-5" />
      </Button>

      <button type="button" onClick={() => navigate("/")} className="flex items-center gap-3 sm:mr-4 group">
        <img src="/favicon.svg" alt="AIBTCSigView" className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl shadow-[0_0_15px_rgba(var(--primary),0.2)] group-hover:shadow-[0_0_25px_rgba(var(--primary),0.4)] transition-all duration-300" />
        <span className="font-bold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent hidden sm:block">AIBTCSigView</span>
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-2 sm:gap-3 bg-white/5 border border-white/10 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-sm shadow-inner transition-all hover:bg-white/10 cursor-pointer group" onClick={copy} title="Copy Address">
        <div className="hidden sm:flex items-center justify-center w-4 h-4 rounded-full bg-green-500/20">
          <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
        </div>
        <span className="text-gray-300 font-mono text-xs sm:text-sm tracking-wider">{short}</span>
        <button type="button" className="text-gray-400 hover:text-white transition-colors">
          <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => queryClient.invalidateQueries()}
        className="text-gray-300 hover:text-white border-white/10 bg-white/5 hover:bg-white/10 transition-all rounded-xl gap-2 shadow-sm px-3"
      >
        <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="hidden md:inline font-medium">Sync Data</span>
      </Button>
    </nav>
  );
}
