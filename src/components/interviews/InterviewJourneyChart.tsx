import { useState, useMemo } from "react";
import { InterviewEvent } from "@/types/interview";
import { buildJourneyChartData, groupPointsByCompanyAndRole, JourneyChartPoint } from "@/lib/analytics/pipelineMetrics";
import { InterviewHoverCard } from "./InterviewHoverCard";
import { Sparkles, Calendar, HelpCircle, Info } from "lucide-react";

interface InterviewJourneyChartProps {
  events: InterviewEvent[];
  onSelectEvent: (event: InterviewEvent) => void;
  onViewRole?: (roleId: string) => void;
}

const COMPANY_COLORS = [
  { stroke: "#38bdf8", fill: "#0284c7" }, // Cyan / Sky
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

  if (events.length === 0) {
    return (
      <div className="bg-[#111622]/90 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-400">
        <Calendar className="h-10 w-10 text-cyan-400 mx-auto mb-3 animate-pulse" />
        <h4 className="text-lg font-bold text-white mb-1">No interviews detected yet</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
          Connect Google Calendar or adjust your search filters to display candidate interview journey paths.
        </p>
      </div>
    );
  }

  // Calculate SVG timeline canvas bounds
  const minTime = Math.min(...points.map((p) => p.timestamp));
  const maxTime = Math.max(...points.map((p) => p.timestamp));
  const timeSpan = Math.max(maxTime - minTime, 86400000 * 14); // Min 14 days span

  const paddingLeft = 110;
  const paddingRight = 60;
  const paddingTop = 40;
  const paddingBottom = 50;
  const svgWidth = 850;
  const svgHeight = 360;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const getX = (timestamp: number) => {
    const ratio = (timestamp - minTime) / timeSpan;
    return paddingLeft + ratio * chartWidth;
  };

  const getY = (level: number) => {
    // level 5 top, level 1 bottom
    const ratio = (5 - level) / 4;
    return paddingTop + ratio * chartHeight;
  };

  // Unique companies map for legend
  const uniqueCompanies = Array.from(
    new Set(points.map((p) => p.company))
  );

  return (
    <div className="relative bg-[#111622]/90 border border-slate-800/80 rounded-2xl p-6 shadow-2xl overflow-visible transition-all">
      {/* Header & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            <h3 className="text-xl font-extrabold text-white tracking-tight">
              Interview Journey Line Graph
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive timeline tracking individual company & role progression stages over time
          </p>
        </div>

        {/* Legend Pills */}
        <div className="flex flex-wrap items-center gap-3">
          {uniqueCompanies.map((company, idx) => {
            const color = COMPANY_COLORS[idx % COMPANY_COLORS.length];
            return (
              <div key={company} className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <span
                  className="h-2.5 w-2.5 rounded-full shadow-sm"
                  style={{ backgroundColor: color.stroke }}
                />
                {company}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Interactive SVG Canvas */}
      <div className="relative overflow-x-auto custom-scrollbar">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[700px] select-none"
        >
          {/* Y Axis Grid Lines & Labels */}
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

          {/* Connect points belonging to the SAME Company + Role */}
          {Object.entries(groupedSeries).map(([seriesKey, seriesPoints], seriesIdx) => {
            const color = COMPANY_COLORS[seriesIdx % COMPANY_COLORS.length];
            if (seriesPoints.length < 2) return null;

            // Construct smooth line path
            const pathD = seriesPoints.reduce((acc, point, idx) => {
              const x = getX(point.timestamp);
              const y = getY(point.stageLevel);
              return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
            }, "");

            return (
              <g key={seriesKey}>
                {/* Glowing Outer Path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={color.stroke}
                  strokeWidth="6"
                  strokeOpacity="0.2"
                />
                {/* Main Sharp Path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={color.stroke}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}

          {/* Interactive Graph Points */}
          {points.map((point) => {
            // Check series color index
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
                className="cursor-pointer transition-transform duration-200"
                onClick={() => onSelectEvent(point.event)}
                onMouseEnter={() => setHoveredPoint({ point, x: cx, y: cy })}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Outer Glow Halo on Hover */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 16 : 10}
                  fill={color.stroke}
                  fillOpacity={isHovered ? 0.35 : 0.15}
                  className="transition-all duration-200"
                />
                {/* Main Interactive Circle */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 8 : 6}
                  fill={isUpcoming ? "#0f172a" : color.stroke}
                  stroke={color.stroke}
                  strokeWidth={isUpcoming ? "3" : "2"}
                  className="transition-all duration-200"
                />
                {/* Center dot */}
                <circle cx={cx} cy={cy} r="2.5" fill="#ffffff" />
                
                {/* Company Label tag on top */}
                <text
                  x={cx}
                  y={cy - 12}
                  fill="#cbd5e1"
                  fontSize="10"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {point.company}
                </text>
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
            left: `${Math.min(hoveredPoint.x, 500)}px`,
            top: `${Math.max(hoveredPoint.y - 120, 20)}px`,
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
        <div className="flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5 text-cyan-400" />
          <span>Hover over any point to preview full interview details. Click to open side drawer.</span>
        </div>
        <div className="font-medium text-slate-400">
          Showing {points.length} normalized interview events
        </div>
      </div>
    </div>
  );
}
