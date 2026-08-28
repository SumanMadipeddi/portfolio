import { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: ReactNode;
  accent?: "blue" | "green" | "amber" | "purple";
}

const ACCENT_BG: Record<NonNullable<MetricCardProps["accent"]>, string> = {
  blue: "linear-gradient(160deg, rgba(41,151,255,0.12), transparent)",
  green: "linear-gradient(160deg, rgba(48,209,88,0.12), transparent)",
  amber: "linear-gradient(160deg, rgba(255,159,10,0.12), transparent)",
  purple: "linear-gradient(160deg, rgba(191,90,242,0.12), transparent)",
};

export function MetricCard({
  title,
  value,
  subtext,
  change,
  trend = "up",
  icon,
  accent = "blue",
}: MetricCardProps) {
  return (
    <div className="iv-card iv-card-sm iv-metric h-full" style={{ background: ACCENT_BG[accent] }}>
      <div className="flex items-center justify-between mb-3">
        <span className="card-tag" style={{ marginBottom: 0 }}>
          {title}
        </span>
        <div className="text-[var(--accent)]">{icon}</div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="text-[26px] font-semibold tracking-tight text-[var(--text)] leading-none">
          {value}
        </div>
        {change && (
          <div
            className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${
              trend === "up"
                ? "iv-badge-green border-[rgba(48,209,88,0.2)]"
                : trend === "down"
                ? "iv-badge-rose"
                : "text-[var(--text3)] border-[var(--border)]"
            }`}
          >
            {trend === "up" && <TrendingUp className="h-3 w-3" />}
            {trend === "down" && <TrendingDown className="h-3 w-3" />}
            {trend === "neutral" && <Minus className="h-3 w-3" />}
            {change}
          </div>
        )}
      </div>

      {subtext && <p className="card-body mt-2" style={{ fontSize: 12 }}>{subtext}</p>}
    </div>
  );
}
