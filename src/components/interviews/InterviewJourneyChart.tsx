import { useState, useMemo } from "react";
import { InterviewEvent } from "@/types/interview";
import { buildJourneyChartData, groupPointsByCompanyAndRole, JourneyChartPoint } from "@/lib/analytics/pipelineMetrics";
import { InterviewHoverCard } from "./InterviewHoverCard";
import { Sparkles, Calendar, Info, Layers } from "lucide-react";

interface InterviewJourneyChartProps {
  events: InterviewEvent[];
  onSelectEvent: (event: InterviewEvent) => void;
  onViewRole?: (roleId: string) => void;
}

const COMPANY_COLORS = [
  { stroke: "#38bdf8", fill: "#0284c7" }, // Cyan
  { stroke: "#10b981", fill: "#059669" }, // Emerald
  { stroke: "#f59e0b", fill: "#d97706" }, // Amber
  { stroke: "#a855f7", fill: "#7e22ce" }, // Purple
  { stroke: "#ec4899", fill: "#be185d" }, // Pink
  { stroke: "#6366f1", fill: "#4338ca" }, // Indigo
];

const Y_STAGES = [
  { level: 5, label: "Offer" },
  { level: 4, label: "Final / Onsite" },
  { level: 3, label: "Technical" },
  { level: 2, label: "Recruiter" },
  { level: 1, label: "Applied" },
];

export function InterviewJourneyChart({ events, onSelectEvent, onViewRole }: InterviewJourneyChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    point: JourneyChartPoint;
    x: number;
    y: number;
  } | null>(null);

  const points = useMemo(() => buildJourneyChartData(events), [events]);
  const groupedSeries = useMemo(() => groupPointsByCompanyAndRole(points), [points]);

  const minTime = useMemo(() => (points.length > 0 ? Math.min(...points.map((p) => p.timestamp)) : Date.now()), [points]);
  const maxTime = useMemo(() => (points.length > 0 ? Math.max(...points.map((p) => p.timestamp)) : Date.now()), [points]);
  const timeSpan = Math.max(maxTime - minTime, 86400000 * 14);

  // SVG Canvas dimensions
  const paddingLeft = 110;
  const paddingRight = 60;
  const paddingTop = 40;
  const paddingBottom = 60;
  const svgWidth = 900;
  const svgHeight = 400;

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

  // Generate 7 crisp date ticks for the X-axis timeline
  const timeTicks = useMemo(() => {
    if (points.length === 0) return [];
    const tickCount = 7;
    const step = (maxTime - minTime) / Math.max(tickCount - 1, 1);
    const ticks = [];
    for (let i = 0; i < tickCount; i++) {
      const t = minTime + i * step;
      const d = new Date(t);
      ticks.push({
        timestamp: t,
        label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      });
    }
    return ticks;
  }, [minTime, maxTime, points]);

  if (events.length === 0) {
    return (
      <div className="bg-[#111622]/90 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-400">
        <Calendar className="h-10 w-10 text-cyan-400 mx-auto mb-3 animate-pulse" />
        <h4 className="text-lg font-bold text-white mb-1">No interviews detected yet</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
          Connect Google Calendar or sync calendar to display candidate interview journey paths.
        </p>
      </div>
    );
  }

  return (
    <div className="relative bg-[#111622]/90 border border-slate-800/80 rounded-2xl p-6 shadow-2xl overflow-visible transition-all">
      {/* Clean Header without Messy Legend Blob */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            <h3 className="text-xl font-extrabold text-white tracking-tight">
              Interview Journey Line Graph
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive timeline tracking company & role progression stages across time
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#0a0e17] px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-semibold text-cyan-400">
          <Layers className="h-3.5 w-3.5" />
          <span>{points.length} Normalized Events</span>
        </div>
      </div>

      {/* Main Interactive SVG Canvas */}
      <div className="relative overflow-x-auto custom-scrollbar">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[750px] select-none"
        >
          {/* Y Axis Grid Lines & Stage Labels */}
          {Y_STAGES.map((stage) => {
            const y = getY(stage.level);
            return (
              <g key={stage.level}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 15}
                  y={y + 4}
                  fill="#94a3b8"
                  fontSize="11"
                  fontWeight="600"
                  textAnchor="end"
                >
                  {stage.label}
                </text>
              </g>
            );
          })}

          {/* X Axis Timeline Grid Lines & Date Ticks */}
          {timeTicks.map((tick, idx) => {
            const x = getX(tick.timestamp);
            return (
              <g key={idx}>
                <line
                  x1={x}
                  y1={paddingTop - 10}
                  x2={x}
                  y2={svgHeight - paddingBottom + 5}
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                  strokeOpacity="0.5"
                />
                <text
                  x={x}
                  y={svgHeight - paddingBottom + 24}
                  fill="#64748b"
                  fontSize="10"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {tick.label}
                </text>
              </g>
            );
          })}

          {/* X Axis Main Baseline */}
          <line
            x1={paddingLeft}
            y1={svgHeight - paddingBottom}
            x2={svgWidth - paddingRight}
            y2={svgHeight - paddingBottom}
            stroke="#334155"
            strokeWidth="1.5"
          />

          {/* Connect points belonging to the SAME Company + Role */}
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
                {/* Outer Glow */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={color.stroke}
                  strokeWidth="5"
                  strokeOpacity="0.25"
                />
                {/* Main Path */}
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

          {/* Interactive Graph Points */}
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
                className="cursor-pointer transition-all duration-200"
                onClick={() => onSelectEvent(point.event)}
                onMouseEnter={() => setHoveredPoint({ point, x: cx, y: cy })}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Outer Halo */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 14 : 7}
                  fill={color.stroke}
                  fillOpacity={isHovered ? 0.4 : 0.2}
                  className="transition-all duration-200"
                />
                {/* Main Point Circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 7 : 4.5}
                  fill={isUpcoming ? "#0f172a" : color.stroke}
                  stroke={color.stroke}
                  strokeWidth={isUpcoming ? "2" : "1.5"}
                  className="transition-all duration-200"
                />
                <circle cx={cx} cy={cy} r="1.5" fill="#ffffff" />

                {/* Show text label ONLY when hovered to prevent text collision blobs */}
                {isHovered && (
                  <g pointerEvents="none">
                    <rect
                      x={cx - 50}
                      y={cy - 28}
                      width="100"
                      height="20"
                      rx="6"
                      fill="#0f172a"
                      stroke={color.stroke}
                      strokeWidth="1"
                    />
                    <text
                      x={cx}
                      y={cy - 14}
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="700"
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

      {/* Floating Hover Card anchored to cursor / hovered point */}
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

      {/* Footer Info Banner */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="font-medium text-slate-400">
          X-Axis: Timeline • Y-Axis: Interview Stage Depth
        </div>
      </div>
    </div>
  );
}
