import { FilterOptions, Company } from "@/types/interview";
import { Search, Calendar, Building, Briefcase, Filter } from "lucide-react";

interface DashboardFiltersProps {
  filters: FilterOptions;
  onChange: (newFilters: FilterOptions) => void;
  companies: Company[];
}

export function DashboardFilters({ filters, onChange, companies }: DashboardFiltersProps) {
  const dateOptions: { label: string; value: FilterOptions["dateRange"] }[] = [
    { label: "7D", value: "7d" },
    { label: "30D", value: "30d" },
    { label: "90D", value: "90d" },
    { label: "6M", value: "6m" },
    { label: "All", value: "all" },
  ];

  // Extract unique categories & roles
  const categories = Array.from(
    new Set(companies.flatMap((c) => c.roles.map((r) => r.roleCategory)))
  );

  return (
    <div className="bg-[#111622]/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 shadow-xl mb-6 transition-all">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search company, role, or interviewer..."
            value={filters.searchQuery || ""}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            className="w-full bg-[#0a0e17] text-slate-100 text-sm pl-10 pr-4 py-2 rounded-xl border border-slate-800 focus:border-cyan-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1 bg-[#0a0e17] p-1 rounded-xl border border-slate-800/80">
          <Calendar className="h-4 w-4 text-slate-400 ml-2.5 mr-1" />
          {dateOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange({ ...filters, dateRange: opt.value })}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                filters.dateRange === opt.value
                  ? "bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Company Dropdown */}
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-slate-400 hidden sm:inline" />
          <select
            value={filters.companyId}
            onChange={(e) => onChange({ ...filters, companyId: e.target.value })}
            className="bg-[#0a0e17] text-slate-200 text-xs py-2 px-3 rounded-xl border border-slate-800 focus:border-cyan-500 focus:outline-none"
          >
            <option value="all">All Companies</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.roles.length} roles)
              </option>
            ))}
          </select>
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-slate-400 hidden sm:inline" />
          <select
            value={filters.category}
            onChange={(e) => onChange({ ...filters, category: e.target.value })}
            className="bg-[#0a0e17] text-slate-200 text-xs py-2 px-3 rounded-xl border border-slate-800 focus:border-cyan-500 focus:outline-none"
          >
            <option value="all">All Role Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 hidden sm:inline" />
          <select
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value as any })}
            className="bg-[#0a0e17] text-slate-200 text-xs py-2 px-3 rounded-xl border border-slate-800 focus:border-cyan-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="completed">Completed Only</option>
          </select>
        </div>
      </div>
    </div>
  );
}
