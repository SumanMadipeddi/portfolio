import { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: ReactNode;
  accentColor?: string;
}

export function MetricCard({
  title,
  value,
  subtext,
  change,
  trend = "up",
  icon,
  accentColor = "from-cyan-500/20 to-blue-500/10",
}: MetricCardProps) {
  return (
    <div className="relative overflow-hidden bg-[#111622]/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl transition-all duration-300 hover:border-slate-700/80 hover:shadow-cyan-500/5 group">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${accentColor} blur-2xl opacity-40 group-hover:opacity-70 transition-opacity`} />
      
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className="p-2 rounded-xl bg-slate-800/60 text-cyan-400 border border-slate-700/50">
          {icon}
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <div className="text-3xl font-extrabold text-white tracking-tight">
          {value}
        </div>
        {change && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${
              trend === "up"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : trend === "down"
                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                : "bg-slate-700/30 text-slate-400 border-slate-600/20"
            }`}
          >
            {trend === "up" && <TrendingUp className="h-3 w-3" />}
            {trend === "down" && <TrendingDown className="h-3 w-3" />}
            {trend === "neutral" && <Minus className="h-3 w-3" />}
            {change}
          </div>
        )}
      </div>

      {subtext && (
        <p className="text-xs text-slate-400 mt-2 font-medium">
          {subtext}
        </p>
      )}
    </div>
  );
}
