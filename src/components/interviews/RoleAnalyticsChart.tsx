import { useMemo, useState } from "react";
import { InterviewEvent, RoleCategoryAnalytics } from "@/types/interview";
import { computeRoleCategoryAnalytics } from "@/lib/analytics/roleMetrics";
import { BarChart3, Info } from "lucide-react";

interface RoleAnalyticsChartProps {
  events: InterviewEvent[];
}

export function RoleAnalyticsChart({ events }: RoleAnalyticsChartProps) {
  const [hoveredCategory, setHoveredCategory] = useState<RoleCategoryAnalytics | null>(null);

  const analytics = useMemo(() => computeRoleCategoryAnalytics(events), [events]);

  const maxTotal = Math.max(
    ...analytics.map((a) => a.recruiterCount + a.technicalCount + a.finalCount + a.offerCount),
    1
  );

  return (
    <div className="bg-[#111622]/90 border border-slate-800/80 rounded-2xl p-6 shadow-2xl transition-all">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-400" />
            <h3 className="text-xl font-extrabold text-white tracking-tight">
              Interview Activity & Role Analytics
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Stage volume breakdown across calendar roles (MTS, Founding Engineer, AI Engineer, etc.)
          </p>
        </div>

        {/* Bar Segment Legend without Blue Applications Bar */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="h-3 w-3 rounded bg-cyan-400" />
            Recruiter Screens
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="h-3 w-3 rounded bg-purple-500" />
            Technical Rounds
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="h-3 w-3 rounded bg-amber-400" />
            Final / Onsite
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="h-3 w-3 rounded bg-emerald-400" />
            Offers
          </div>
        </div>
      </div>

      {/* Stacked Horizontal Bar Chart List */}
      <div className="space-y-4">
        {analytics.map((item) => {
          const totalRounds = item.recruiterCount + item.technicalCount + item.finalCount + item.offerCount;
          if (totalRounds === 0) return null;

          return (
            <div
              key={item.category}
              onMouseEnter={() => setHoveredCategory(item)}
              onMouseLeave={() => setHoveredCategory(null)}
              className="p-4 rounded-xl bg-[#0e131d] border border-slate-800/70 hover:border-cyan-500/40 transition-all duration-200"
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  {item.category}
                  {item.offerCount > 0 && (
                    <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      {item.offerCount} Offer
                    </span>
                  )}
                </span>
                <span className="text-slate-400 font-semibold text-xs">
                  {totalRounds} total interview rounds
                </span>
              </div>

              {/* Multi-segment Bar for Actual Interview Stages */}
              <div className="h-7 w-full bg-slate-900 rounded-lg overflow-hidden flex p-1 gap-1">
                {item.recruiterCount > 0 && (
                  <div
                    style={{ width: `${(item.recruiterCount / maxTotal) * 100}%` }}
                    className="h-full bg-cyan-400 rounded flex items-center justify-center text-[11px] font-extrabold text-slate-950 shadow-inner"
                    title={`Recruiter Screens: ${item.recruiterCount}`}
                  >
                    {item.recruiterCount}
                  </div>
                )}

                {item.technicalCount > 0 && (
                  <div
                    style={{ width: `${(item.technicalCount / maxTotal) * 100}%` }}
                    className="h-full bg-purple-500 rounded flex items-center justify-center text-[11px] font-extrabold text-white shadow-inner"
                    title={`Technical Rounds: ${item.technicalCount}`}
                  >
                    {item.technicalCount}
                  </div>
                )}

                {item.finalCount > 0 && (
                  <div
                    style={{ width: `${(item.finalCount / maxTotal) * 100}%` }}
                    className="h-full bg-amber-400 rounded flex items-center justify-center text-[11px] font-extrabold text-slate-950 shadow-inner"
                    title={`Final / Onsite: ${item.finalCount}`}
                  >
                    {item.finalCount}
                  </div>
                )}

                {item.offerCount > 0 && (
                  <div
                    style={{ width: `${(item.offerCount / maxTotal) * 100}%` }}
                    className="h-full bg-emerald-400 rounded flex items-center justify-center text-[11px] font-extrabold text-slate-950 shadow-inner"
                    title={`Offers: ${item.offerCount}`}
                  >
                    {item.offerCount}
                  </div>
                )}
              </div>

              {/* Clean Conversion Statistics Row */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between text-xs text-slate-400">
                <span>
                  Screen → Tech: <strong className="text-cyan-400">{item.screenToTechRate}%</strong>
                </span>
                <span>
                  Tech → Final: <strong className="text-purple-400">{item.techToFinalRate}%</strong>
                </span>
                <span>
                  Final → Offer: <strong className="text-emerald-400">{item.finalToOfferRate}%</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex items-center gap-1.5">
        <Info className="h-3.5 w-3.5 text-cyan-400" />
        <span>Stage activity automatically derived from your Google Calendar events.</span>
      </div>
    </div>
  );
}
