import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: "orange" | "green" | "purple" | "blue" | "red" | "default";
  className?: string;
}

export function MetricCard({ title, value, subtitle, icon: Icon, color = "default", className }: Props) {
  const displayValue = typeof value === "string" || typeof value === "number" ? value : "—";
  
  const colorStyles = {
    orange: "bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)] group-hover:border-amber-500/50 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]",
    green: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)] group-hover:border-emerald-500/50 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]",
    purple: "bg-purple-500/10 border-purple-500/20 text-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.1)] group-hover:border-purple-500/50 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]",
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)] group-hover:border-blue-500/50 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]",
    red: "bg-red-500/10 border-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)] group-hover:border-red-500/50 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]",
    default: "bg-gray-500/10 border-gray-500/20 text-gray-400 group-hover:border-gray-500/50"
  };

  return (
    <div className={cn("glass-card relative overflow-hidden group p-5 border transition-all duration-300 hover:-translate-y-1", colorStyles[color], className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10 flex items-start justify-between mb-4">
        <span className="text-sm font-medium text-gray-400 group-hover:text-gray-200 transition-colors">{title}</span>
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center border backdrop-blur-md transition-all duration-300 group-hover:scale-110",
            color === "orange" && "bg-amber-500/20 border-amber-500/30 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]",
            color === "green" && "bg-emerald-500/20 border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]",
            color === "purple" && "bg-purple-500/20 border-purple-500/30 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]",
            color === "blue" && "bg-blue-500/20 border-blue-500/30 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]",
            color === "red" && "bg-red-500/20 border-red-500/30 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]",
            color === "default" && "bg-gray-500/20 border-gray-500/30 text-gray-300"
          )}
        >
          <Icon className="w-5 h-5 drop-shadow-md" />
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent tracking-tight">{displayValue}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-2 font-medium bg-black/20 inline-block px-2 py-1 rounded-md border border-white/5">{subtitle}</p>}
      </div>
    </div>
  );
}
