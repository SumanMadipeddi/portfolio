import { FilterOptions } from "@/types/interview";
import { Calendar } from "lucide-react";

interface DashboardFiltersProps {
  filters: FilterOptions;
  onChange: (newFilters: FilterOptions) => void;
}

const DATE_OPTIONS: { label: string; value: FilterOptions["dateRange"] }[] = [
  { label: "7D", value: "7d" },
  { label: "30D", value: "30d" },
  { label: "90D", value: "90d" },
  { label: "6M", value: "6m" },
  { label: "All", value: "all" },
];

export function DashboardFilters({ filters, onChange }: DashboardFiltersProps) {
  return (
    <div className="flex items-center gap-0.5 p-1 rounded-full border border-[var(--border)] bg-[var(--bg3)]">
      <Calendar className="h-3.5 w-3.5 text-[var(--text3)] ml-2 mr-0.5 shrink-0" />
      {DATE_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange({ ...filters, dateRange: opt.value })}
          className={`px-2.5 py-1 text-xs rounded-full whitespace-nowrap transition-all ${
            filters.dateRange === opt.value
              ? "bg-[var(--accent)] text-white font-medium"
              : "text-[var(--text2)] hover:text-[var(--text)]"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
