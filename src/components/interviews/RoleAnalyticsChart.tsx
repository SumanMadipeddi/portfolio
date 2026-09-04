import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { InterviewEvent } from "@/types/interview";
import { computeRoleCategoryAnalytics } from "@/lib/analytics/roleMetrics";

interface RoleAnalyticsChartProps {
  events: InterviewEvent[];
}

const STAGES = [
  { key: "screen", label: "Screen", color: "#2997ff" },
  { key: "technical", label: "Technical", color: "#bf5af2" },
  { key: "final", label: "Final", color: "#ff9f0a" },
  { key: "offer", label: "Offer", color: "#30d158" },
] as const;

type StageKey = (typeof STAGES)[number]["key"];

function stageCount(
  item: {
    recruiterCount: number;
    technicalCount: number;
    finalCount: number;
    offerCount: number;
  },
  key: StageKey
) {
  if (key === "screen") return item.recruiterCount;
  if (key === "technical") return item.technicalCount;
  if (key === "final") return item.finalCount;
  return item.offerCount;
}

function stageShare(count: number, total: number) {
  if (count <= 0 || total <= 0) return 0;
  return Math.round((count / total) * 100);
}

export function RoleAnalyticsChart({ events }: RoleAnalyticsChartProps) {
  const [tip, setTip] = useState<{
    label: string;
    count: number;
    total: number;
    color: string;
    x: number;
    y: number;
  } | null>(null);

  const analytics = useMemo(() => {
    return computeRoleCategoryAnalytics(events)
      .map((item) => ({
        ...item,
        totalRounds: item.recruiterCount + item.technicalCount + item.finalCount + item.offerCount,
      }))
      .filter((item) => item.totalRounds > 0)
      .sort((a, b) => b.lastInterviewAt - a.lastInterviewAt || b.totalRounds - a.totalRounds);
  }, [events]);

  return (
    <div className="iv-card">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-baseline gap-2 min-w-0">
          <div className="card-title">Interview Activity</div>
          {analytics.length > 0 && (
            <span className="iv-row-meta">
              {analytics.length} {analytics.length === 1 ? "role" : "roles"}
            </span>
          )}
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
          const visibleStages = STAGES.filter((stage) => stageCount(item, stage.key) > 0);

          return (
            <div key={`${item.company || ""}::${item.category}`} className="iv-activity-item">
              <div className="flex items-center justify-between w-full gap-3">
                <span className="iv-row-title flex flex-col items-start gap-0.5 min-w-0">
                  <span className="truncate max-w-full">{item.category}</span>
                  {item.company && (
                    <span className="iv-row-meta font-normal normal-case tracking-normal">
                      {item.company}
                    </span>
                  )}
                </span>
                <span className="iv-row-meta shrink-0">
                  {totalRounds} {totalRounds === 1 ? "round" : "rounds"}
                  {item.offerCount > 0 ? ` · ${item.offerCount} offer` : ""}
                </span>
              </div>

              <div className="iv-activity-bar" aria-label={`${item.category} stages`}>
                {visibleStages.map((stage) => {
                  const count = stageCount(item, stage.key);
                  return (
                    <div
                      key={stage.key}
                      className="iv-activity-bar-seg"
                      style={{ flexGrow: count, background: stage.color }}
                      aria-label={`${stage.label}: ${count} of ${totalRounds}`}
                      onMouseEnter={(event) => {
                        const rect = event.currentTarget.getBoundingClientRect();
                        setTip({
                          label: stage.label,
                          count,
                          total: totalRounds,
                          color: stage.color,
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                        });
                      }}
                      onMouseLeave={() => setTip(null)}
                    />
                  );
                })}
              </div>

              <div className="iv-activity-rates">
                {visibleStages.map((stage) => {
                  const count = stageCount(item, stage.key);
                  return (
                    <div
                      key={stage.key}
                      className="iv-activity-rate"
                      style={{ flexGrow: count, color: stage.color }}
                    >
                      {stage.label} — {stageShare(count, totalRounds)}%
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {tip &&
        createPortal(
          <div className="iv-activity-tip" style={{ left: tip.x, top: tip.y }} role="tooltip">
            <span className="iv-activity-tip-dot" style={{ background: tip.color }} />
            <span>
              {tip.label} — {tip.count} of {tip.total}
            </span>
          </div>,
          document.body
        )}
    </div>
  );
}
