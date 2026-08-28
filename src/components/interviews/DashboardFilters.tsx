import { useEffect, useMemo, useRef, useState } from "react";
import { FilterOptions, Company, InterviewEvent } from "@/types/interview";
import { Search, Calendar, ChevronDown, ChevronRight, X } from "lucide-react";
import { CompanyRow } from "./CompanyRow";

interface DashboardFiltersProps {
  filters: FilterOptions;
  onChange: (newFilters: FilterOptions) => void;
  companies: Company[];
  onSelectEvent: (event: InterviewEvent) => void;
}

export function DashboardFilters({
  filters,
  onChange,
  companies,
  onSelectEvent,
}: DashboardFiltersProps) {
  const dateOptions: { label: string; value: FilterOptions["dateRange"] }[] = [
    { label: "7D", value: "7d" },
    { label: "30D", value: "30d" },
    { label: "90D", value: "90d" },
    { label: "6M", value: "6m" },
    { label: "All", value: "all" },
  ];

  const categories = Array.from(new Set(companies.flatMap((c) => c.roles.map((r) => r.title))));
  const categoryOptions = [
    { label: "All Roles", value: "all" },
    ...categories.map((cat) => ({ label: cat, value: cat })),
  ];
  const selectedCategory =
    categoryOptions.find((opt) => opt.value === filters.category)?.label || "All Roles";

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchQuery = (filters.searchQuery || "").trim().toLowerCase();

  const selectedCompany = useMemo(
    () => companies.find((company) => company.id === filters.companyId) || null,
    [companies, filters.companyId]
  );

  const searchResults = useMemo(() => {
    if (!searchQuery) return companies;
    return companies.filter((company) => {
      const roleText = company.roles.map((role) => `${role.title} ${role.roleCategory}`).join(" ");
      return (
        company.name.toLowerCase().includes(searchQuery) ||
        (company.domain || "").toLowerCase().includes(searchQuery) ||
        roleText.toLowerCase().includes(searchQuery)
      );
    });
  }, [companies, searchQuery]);

  const companyInterviews = useMemo(() => {
    if (!selectedCompany) return [];
    return selectedCompany.roles
      .flatMap((role) => role.interviews)
      .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
  }, [selectedCompany]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!categoryRef.current?.contains(target)) setCategoryOpen(false);
      if (!searchRef.current?.contains(target)) setListOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCategoryOpen(false);
        setListOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const selectCompany = (company: Company) => {
    setListOpen(false);
    onChange({ ...filters, companyId: company.id, searchQuery: "" });
  };

  const clearSelected = () => {
    onChange({ ...filters, companyId: "all", searchQuery: "" });
    setListOpen(true);
  };

  return (
    <div className="iv-card iv-card-sm iv-filters" ref={searchRef}>
      <div className="flex items-center gap-2.5 flex-wrap">
        <label className="iv-input iv-search min-w-[180px] flex-1">
          <Search className="h-4 w-4 shrink-0 text-[var(--text3)]" />
          <input
            type="text"
            placeholder="Search company, role, or interviewer..."
            value={filters.searchQuery || ""}
            onFocus={() => setListOpen(true)}
            onChange={(e) => {
              setListOpen(true);
              onChange({ ...filters, searchQuery: e.target.value, companyId: "all" });
            }}
          />
        </label>

        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-0.5 p-1 rounded-full border border-[var(--border)] bg-[var(--bg3)]">
            <Calendar className="h-3.5 w-3.5 text-[var(--text3)] ml-2 mr-0.5 shrink-0" />
            {dateOptions.map((opt) => (
              <button
                key={opt.value}
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

          <div className="iv-dropdown" ref={categoryRef}>
            <button
              type="button"
              className={`iv-select iv-dropdown-trigger ${categoryOpen ? "is-open" : ""}`}
              onClick={() => setCategoryOpen((open) => !open)}
              aria-haspopup="listbox"
              aria-expanded={categoryOpen}
            >
              <span>{selectedCategory}</span>
              <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-[var(--text3)] transition-transform ${categoryOpen ? "rotate-180" : ""}`} />
            </button>
            {categoryOpen && (
              <div className="iv-dropdown-menu" role="listbox">
                {categoryOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={filters.category === opt.value}
                    className={`iv-dropdown-item ${filters.category === opt.value ? "is-active" : ""}`}
                    onClick={() => {
                      onChange({ ...filters, category: opt.value });
                      setCategoryOpen(false);
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {listOpen && (
        <div className="iv-search-results">
          {searchResults.length === 0 ? (
            <div className="iv-search-empty">No companies match “{filters.searchQuery}”</div>
          ) : (
            searchResults.map((company) => (
              <CompanyRow
                key={company.id}
                company={company}
                onClick={() => selectCompany(company)}
              />
            ))
          )}
        </div>
      )}

      {!listOpen && selectedCompany && (
        <div className="iv-search-selected">
          <CompanyRow
            company={selectedCompany}
            trailing={
              <button
                type="button"
                className="iv-search-clear"
                onClick={clearSelected}
                aria-label="Clear selected company"
              >
                <X className="h-4 w-4" />
              </button>
            }
          />

          <div className="iv-interview-results">
            {companyInterviews.length === 0 ? (
              <div className="iv-search-empty">No interviews for this company</div>
            ) : (
              companyInterviews.map((evt) => (
                <button
                  key={evt.id}
                  type="button"
                  className="iv-row iv-search-row"
                  onClick={() => onSelectEvent(evt)}
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="h-10 w-10 rounded-xl border border-[var(--border)] bg-[var(--bg3)] flex items-center justify-center shrink-0">
                      <Calendar className="h-4 w-4 text-[var(--accent)]" />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <div className="iv-row-title truncate">{evt.role}</div>
                      <div className="iv-row-meta truncate">
                        {new Date(evt.start).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {` · ${evt.durationMinutes} min`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="iv-badge iv-company-count">
                      {evt.interviewType.replace(/_/g, " ")}
                    </span>
                    <ChevronRight className="h-4 w-4 text-[var(--text3)]" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
