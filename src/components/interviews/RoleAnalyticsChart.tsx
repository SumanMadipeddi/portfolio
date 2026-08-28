import { useMemo } from "react";
import { InterviewEvent } from "@/types/interview";
import { computeRoleCategoryAnalytics } from "@/lib/analytics/roleMetrics";
import { Info } from "lucide-react";

interface RoleAnalyticsChartProps {
  events: InterviewEvent[];
}

export function RoleAnalyticsChart({ events }: RoleAnalyticsChartProps) {
  const analytics = useMemo(() => {
    return computeRoleCategoryAnalytics(events)
      .map((item) => ({
        ...item,
        totalRounds: item.recruiterCount + item.technicalCount + item.finalCount + item.offerCount,
      }))
      .filter((item) => item.totalRounds > 0)
      .sort((a, b) => b.lastInterviewAt - a.lastInterviewAt || b.totalRounds - a.totalRounds);
  }, [events]);

  const maxTotal = Math.max(...analytics.map((a) => a.totalRounds), 1);

  return (
    <div className="iv-card">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <div className="card-tag" style={{ marginBottom: 4 }}>Roles</div>
          <h3 className="card-title">Interview Activity</h3>
          <p className="card-body" style={{ marginTop: 2 }}>
            Stage volume across extracted roles
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text2)]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#2997ff]" />
            Recruiter
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#bf5af2]" />
            Technical
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff9f0a]" />
            Final / Onsite
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#30d158]" />
            Offers
          </span>
        </div>
      </div>

      <div className="iv-activity-list iv-scroll">
        {analytics.length === 0 && (
          <p className="iv-row-meta">
            Sync Calendar to pull role titles from invite names, descriptions, and interviewer email
            domains.
          </p>
        )}
        {analytics.map((item) => {
          const { totalRounds } = item;

          return (
            <div
              key={`${item.company || ""}::${item.category}`}
              className="iv-row"
              style={{ cursor: "default", alignItems: "stretch", flexDirection: "column", gap: 10 }}
            >
              <div className="flex items-center justify-between w-full gap-3">
                <span className="iv-row-title flex flex-col items-start gap-0.5 min-w-0">
                  <span className="truncate">{item.category}</span>
                  {item.company && (
                    <span className="iv-row-meta font-normal normal-case tracking-normal">{item.company}</span>
                  )}
                </span>
                <span className="iv-row-meta shrink-0">
                  {totalRounds} {totalRounds === 1 ? "round" : "rounds"}
                  {item.offerCount > 0 ? ` · ${item.offerCount} offer` : ""}
                </span>
              </div>

              <div className="h-6 w-full rounded-full overflow-hidden flex gap-1 bg-[var(--bg3)] p-0.5">
                {item.recruiterCount > 0 && (
                  <div
                    style={{ width: `${(item.recruiterCount / maxTotal) * 100}%`, background: "#2997ff" }}
                    className="h-full rounded-full flex items-center justify-center text-[10px] font-semibold text-white"
                    title={`Recruiter Screens: ${item.recruiterCount}`}
                  >
                    {item.recruiterCount}
                  </div>
                )}
                {item.technicalCount > 0 && (
                  <div
                    style={{ width: `${(item.technicalCount / maxTotal) * 100}%`, background: "#bf5af2" }}
                    className="h-full rounded-full flex items-center justify-center text-[10px] font-semibold text-white"
                    title={`Technical Rounds: ${item.technicalCount}`}
                  >
                    {item.technicalCount}
                  </div>
                )}
                {item.finalCount > 0 && (
                  <div
                    style={{ width: `${(item.finalCount / maxTotal) * 100}%`, background: "#ff9f0a" }}
                    className="h-full rounded-full flex items-center justify-center text-[10px] font-semibold text-white"
                    title={`Final / Onsite: ${item.finalCount}`}
                  >
                    {item.finalCount}
                  </div>
                )}
                {item.offerCount > 0 && (
                  <div
                    style={{ width: `${(item.offerCount / maxTotal) * 100}%`, background: "#30d158" }}
                    className="h-full rounded-full flex items-center justify-center text-[10px] font-semibold text-white"
                    title={`Offers: ${item.offerCount}`}
                  >
                    {item.offerCount}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-[var(--text3)] w-full">
                <span>
                  Screen → Tech: <strong className="text-[var(--accent)] font-medium">{item.screenToTechRate}%</strong>
                </span>
                <span>
                  Tech → Final: <strong className="text-[var(--purple)] font-medium">{item.techToFinalRate}%</strong>
                </span>
                <span>
                  Final → Offer: <strong className="text-[var(--green)] font-medium">{item.finalToOfferRate}%</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 pt-3 border-t border-[var(--border)] text-xs text-[var(--text3)] flex items-center gap-1.5">
        <Info className="h-3.5 w-3.5 text-[var(--accent)]" />
        Stage activity and role titles extracted from Google Calendar invites.
      </div>
    </div>
  );
}
