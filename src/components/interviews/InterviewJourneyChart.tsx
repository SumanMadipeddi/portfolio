import { useState, useMemo } from "react";
import { InterviewEvent } from "@/types/interview";
import { buildJourneyChartData, groupPointsByCompanyAndRole, JourneyChartPoint } from "@/lib/analytics/pipelineMetrics";
import { InterviewHoverCard } from "./InterviewHoverCard";
import { Calendar, Layers } from "lucide-react";

interface InterviewJourneyChartProps {
  events: InterviewEvent[];
  rangeStart?: Date;
  rangeEnd?: Date;
  onSelectEvent: (event: InterviewEvent) => void;
  onViewRole?: (roleId: string) => void;
}

const COMPANY_COLORS = [
  { stroke: "#2997ff", fill: "#0a84ff" },
  { stroke: "#bf5af2", fill: "#bf5af2" },
  { stroke: "#30d158", fill: "#30d158" },
  { stroke: "#ff9f0a", fill: "#ff9f0a" },
  { stroke: "#64d2ff", fill: "#64d2ff" },
  { stroke: "#ff5f57", fill: "#ff5f57" },
];

const Y_STAGES = [
  { level: 5, label: "Offer" },
  { level: 4, label: "Final / Onsite" },
  { level: 3, label: "Technical" },
  { level: 2, label: "Recruiter" },
  { level: 1, label: "Applied" },
];

export function InterviewJourneyChart({
  events,
  rangeStart,
  rangeEnd,
  onSelectEvent,
  onViewRole,
}: InterviewJourneyChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    point: JourneyChartPoint;
    x: number;
    y: number;
  } | null>(null);

  const points = useMemo(() => buildJourneyChartData(events), [events]);
  const groupedSeries = useMemo(() => groupPointsByCompanyAndRole(points), [points]);

  const minTime = useMemo(() => {
    const fromEvents = points.length > 0 ? Math.min(...points.map((p) => p.timestamp)) : Date.now();
    return rangeStart ? rangeStart.getTime() : fromEvents;
  }, [points, rangeStart]);
  const maxTime = useMemo(() => {
    const fromEvents = points.length > 0 ? Math.max(...points.map((p) => p.timestamp)) : Date.now();
    return Math.max(fromEvents, Date.now(), rangeEnd ? rangeEnd.getTime() : 0);
  }, [points, rangeEnd]);
  const timeSpan = Math.max(maxTime - minTime, 86400000 * 14);

  const paddingLeft = 110;
  const paddingRight = 48;
  const paddingTop = 20;
  const paddingBottom = 40;
  const svgWidth = 900;
  const svgHeight = 300;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const getX = (timestamp: number) => {
    const ratio = timeSpan > 0 ? (timestamp - minTime) / timeSpan : 0.5;
    return paddingLeft + ratio * chartWidth;
  };

  const getY = (level: number) => {
    const ratio = (5 - level) / 4;
    return paddingTop + ratio * chartHeight;
  };

  const nowTs = Date.now();
  const nowX = getX(nowTs);
  const showToday = nowTs >= minTime && nowTs <= maxTime;

  const timeTicks = useMemo(() => {
    if (points.length === 0) return [];
    const tickCount = 7;
    const step = (maxTime - minTime) / Math.max(tickCount - 1, 1);
    const spanDays = (maxTime - minTime) / 86400000;
    const ticks = [];
    for (let i = 0; i < tickCount; i++) {
      const t = minTime + i * step;
      const d = new Date(t);
      ticks.push({
        timestamp: t,
        label:
          spanDays > 120
            ? d.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
            : d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      });
    }
    return ticks;
  }, [minTime, maxTime, points]);

  if (events.length === 0) {
    return (
      <div className="iv-card text-center py-14">
        <Calendar className="h-8 w-8 text-[var(--accent)] mx-auto mb-3" />
        <h4 className="card-title mb-1">No interviews detected yet</h4>
        <p className="card-body max-w-sm mx-auto">
          Connect Google Calendar to display company interview journey paths.
        </p>
      </div>
    );
  }

  return (
    <div className="relative iv-card overflow-visible">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div>
          <div className="card-tag" style={{ marginBottom: 4 }}>Timeline</div>
          <h3 className="card-title">Interview Journey</h3>
          <p className="card-body" style={{ marginTop: 2 }}>
            Company and role progression across stages over time
          </p>
        </div>

        <div className="iv-badge inline-flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5" />
          {points.length} events
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[750px] select-none"
        >
          {Y_STAGES.map((stage) => {
            const y = getY(stage.level);
            return (
              <g key={stage.level}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="var(--border)"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 15}
                  y={y + 4}
                  fill="var(--text3)"
                  fontSize="11"
                  fontWeight="500"
                  textAnchor="end"
                >
                  {stage.label}
                </text>
              </g>
            );
          })}

          {timeTicks.map((tick, idx) => {
            const x = getX(tick.timestamp);
            return (
              <g key={idx}>
                <line
                  x1={x}
                  y1={paddingTop - 10}
                  x2={x}
                  y2={svgHeight - paddingBottom + 5}
                  stroke="var(--border)"
                  strokeDasharray="3 3"
                  strokeOpacity="0.7"
                />
                <text
                  x={x}
                  y={svgHeight - paddingBottom + 24}
                  fill="var(--text3)"
                  fontSize="10"
                  fontWeight="500"
                  textAnchor="middle"
                >
                  {tick.label}
                </text>
              </g>
            );
          })}

          <line
            x1={paddingLeft}
            y1={svgHeight - paddingBottom}
            x2={svgWidth - paddingRight}
            y2={svgHeight - paddingBottom}
            stroke="var(--border-hover)"
            strokeWidth="1.5"
          />

          {showToday && (
            <g>
              <line
                x1={nowX}
                y1={paddingTop - 8}
                x2={nowX}
                y2={svgHeight - paddingBottom}
                stroke="var(--accent)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                strokeOpacity="0.75"
              />
              <text
                x={nowX}
                y={paddingTop - 14}
                fill="var(--accent)"
                fontSize="10"
                fontWeight="600"
                textAnchor="middle"
              >
                Today
              </text>
            </g>
          )}

          {Object.entries(groupedSeries).map(([seriesKey, seriesPoints], seriesIdx) => {
            const color = COMPANY_COLORS[seriesIdx % COMPANY_COLORS.length];
            if (seriesPoints.length < 2) return null;

            const pathD = seriesPoints.reduce((acc, point, idx) => {
              const x = getX(point.timestamp);
              const y = getY(point.stageLevel);
              return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
            }, "");

            return (
              <g key={seriesKey}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={color.stroke}
                  strokeWidth="5"
                  strokeOpacity="0.18"
                />
                <path
                  d={pathD}
                  fill="none"
                  stroke={color.stroke}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}

          {points.map((point) => {
            const seriesKeys = Object.keys(groupedSeries);
            const seriesIdx = seriesKeys.findIndex(
              (k) => k === `${point.companyId}__${point.roleId}`
            );
            const color = COMPANY_COLORS[(seriesIdx >= 0 ? seriesIdx : 0) % COMPANY_COLORS.length];

            const cx = getX(point.timestamp);
            const cy = getY(point.stageLevel);
            const isHovered = hoveredPoint?.point.id === point.id;
            const isUpcoming = point.status === "upcoming";

            return (
              <g
                key={point.id}
                className="cursor-pointer"
                onClick={() => onSelectEvent(point.event)}
                onMouseEnter={() => setHoveredPoint({ point, x: cx, y: cy })}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 14 : 7}
                  fill={color.stroke}
                  fillOpacity={isHovered ? 0.35 : 0.16}
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 7 : 4.5}
                  fill={isUpcoming ? "var(--bg1)" : color.stroke}
                  stroke={color.stroke}
                  strokeWidth={isUpcoming ? "2" : "1.5"}
                />
                <circle cx={cx} cy={cy} r="1.5" fill="#ffffff" />

                {isHovered && (
                  <g pointerEvents="none">
                    <rect
                      x={cx - 50}
                      y={cy - 28}
                      width="100"
                      height="20"
                      rx="6"
                      fill="var(--bg1)"
                      stroke={color.stroke}
                      strokeWidth="1"
                    />
                    <text
                      x={cx}
                      y={cy - 14}
                      fill="var(--text)"
                      fontSize="10"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {point.company}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {hoveredPoint && (
        <div
          className="absolute z-50 pointer-events-auto"
          style={{
            left: `${Math.min(hoveredPoint.x, 520)}px`,
            top: `${Math.max(hoveredPoint.y - 130, 20)}px`,
          }}
          onMouseEnter={() => setHoveredPoint(hoveredPoint)}
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <InterviewHoverCard
            event={hoveredPoint.point.event}
            onOpenDrawer={onSelectEvent}
            onViewRole={onViewRole}
          />
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-[var(--border)] text-xs text-[var(--text3)]">
        X-axis: Timeline · Y-axis: Interview stage
      </div>
    </div>
  );
}
