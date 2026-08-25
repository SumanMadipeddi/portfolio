import { useMemo, useState } from "react";
import { InterviewEvent, RoleCategoryAnalytics } from "@/types/interview";
import { computeRoleCategoryAnalytics } from "@/lib/analytics/roleMetrics";
import { BarChart3, TrendingUp, Filter, Info } from "lucide-react";

interface RoleAnalyticsChartProps {
  events: InterviewEvent[];
}

export function RoleAnalyticsChart({ events }: RoleAnalyticsChartProps) {
  const [hoveredCategory, setHoveredCategory] = useState<RoleCategoryAnalytics | null>(null);

  const analytics = useMemo(() => computeRoleCategoryAnalytics(events), [events]);

  const maxApp = Math.max(...analytics.map((a) => a.applicationsCount), 1);

  return (
    <div className="bg-[#111622]/90 border border-slate-800/80 rounded-2xl p-6 shadow-2xl transition-all">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-400" />
            <h3 className="text-xl font-extrabold text-white tracking-tight">
              Interview Activity & Role Category Analytics
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Role category volume, stage breakdowns, and funnel conversion performance
          </p>
        </div>

        {/* Bar Segment Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="h-3 w-3 rounded bg-blue-500" />
            Applications
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="h-3 w-3 rounded bg-cyan-400" />
            Recruiter
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="h-3 w-3 rounded bg-purple-500" />
            Technical
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="h-3 w-3 rounded bg-amber-400" />
            Final / Onsite
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="h-3 w-3 rounded bg-emerald-400" />
            Offer
          </div>
        </div>
      </div>

      {/* Stacked Horizontal Bar Chart List */}
      <div className="space-y-4">
        {analytics.map((item) => {
          const isHovered = hoveredCategory?.category === item.category;

          return (
            <div
              key={item.category}
              onMouseEnter={() => setHoveredCategory(item)}
              onMouseLeave={() => setHoveredCategory(null)}
              className="p-3.5 rounded-xl bg-[#0e131d] border border-slate-800/70 hover:border-cyan-500/40 transition-all duration-200"
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-slate-200 flex items-center gap-2">
                  {item.category}
                  {item.offerCount > 0 && (
                    <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {item.offerCount} Offer
                    </span>
                  )}
                </span>
                <span className="text-slate-400 font-medium">
                  {item.applicationsCount} total applications
                </span>
              </div>

              {/* Multi-segment Bar */}
              <div className="h-7 w-full bg-slate-900 rounded-lg overflow-hidden flex p-1 gap-1">
                {item.applicationsCount > 0 && (
                  <div
                    style={{ width: `${(item.applicationsCount / maxApp) * 35}%` }}
                    className="h-full bg-blue-600/80 rounded flex items-center justify-center text-[10px] font-bold text-white shadow-inner"
                    title={`Applications: ${item.applicationsCount}`}
                  >
                    {item.applicationsCount}
                  </div>
                )}

                {item.recruiterCount > 0 && (
                  <div
                    style={{ width: `${(item.recruiterCount / maxApp) * 30}%` }}
                    className="h-full bg-cyan-500/90 rounded flex items-center justify-center text-[10px] font-bold text-slate-950 shadow-inner"
                    title={`Recruiter Screens: ${item.recruiterCount}`}
                  >
                    {item.recruiterCount}
                  </div>
                )}

                {item.technicalCount > 0 && (
                  <div
                    style={{ width: `${(item.technicalCount / maxApp) * 25}%` }}
                    className="h-full bg-purple-500/90 rounded flex items-center justify-center text-[10px] font-bold text-white shadow-inner"
                    title={`Technical Rounds: ${item.technicalCount}`}
                  >
                    {item.technicalCount}
                  </div>
                )}

                {item.finalCount > 0 && (
                  <div
                    style={{ width: `${(item.finalCount / maxApp) * 20}%` }}
                    className="h-full bg-amber-400/90 rounded flex items-center justify-center text-[10px] font-bold text-slate-950 shadow-inner"
                    title={`Final Rounds: ${item.finalCount}`}
                  >
                    {item.finalCount}
                  </div>
                )}

                {item.offerCount > 0 && (
                  <div
                    style={{ width: `${(item.offerCount / maxApp) * 15}%` }}
                    className="h-full bg-emerald-400 rounded flex items-center justify-center text-[10px] font-bold text-slate-950 shadow-inner"
                    title={`Offers: ${item.offerCount}`}
                  >
                    {item.offerCount}
                  </div>
                )}
              </div>

              {/* Conversion Statistics Row on Hover / Detailed */}
              <div className="mt-2 pt-2 border-t border-slate-800/50 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
                <span>Screen Rate: <strong className="text-cyan-400">{item.appToScreenRate}%</strong></span>
                <span>Screen $\rightarrow$ Tech: <strong className="text-purple-400">{item.screenToTechRate}%</strong></span>
                <span>Tech $\rightarrow$ Final: <strong className="text-amber-400">{item.techToFinalRate}%</strong></span>
                <span>Final $\rightarrow$ Offer: <strong className="text-emerald-400">{item.finalToOfferRate}%</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center gap-1.5">
        <Info className="h-3.5 w-3.5 text-cyan-400" />
        <span>Conversion rates reflect stage advancement velocity derived from your Google Calendar events.</span>
      </div>
    </div>
  );
}
