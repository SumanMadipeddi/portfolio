import { InterviewEvent } from "@/types/interview";
import { Calendar, Clock, Video, User, Building, ChevronRight, ArrowUpRight, Sparkles } from "lucide-react";

interface InterviewHoverCardProps {
  event: InterviewEvent;
  onOpenDrawer?: (event: InterviewEvent) => void;
  onViewRole?: (roleId: string) => void;
}

export function InterviewHoverCard({ event, onOpenDrawer, onViewRole }: InterviewHoverCardProps) {
  const startDate = new Date(event.start);
  const endDate = new Date(event.end);

  const formattedDate = startDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = `${startDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })} – ${endDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;

  // Filter out candidate email from interviewer list
  const validInterviewers = event.interviewers.filter(
    (i) => !i.email?.toLowerCase().includes("madipeddisuman") && !i.name?.toLowerCase().includes("madipeddisuman")
  );

  const interviewer = validInterviewers[0] || {
    name: `${event.company} Hiring Team`,
    title: "Interview Panel",
  };

  return (
    <div className="w-[340px] bg-[#0c1017]/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl p-5 shadow-2xl text-slate-100 font-sans z-50 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto">
      {/* Header: Logo, Company & Role */}
      <div className="flex items-start gap-3.5 mb-4">
        <div className="h-11 w-11 rounded-xl bg-slate-800 border border-slate-700/70 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
          {event.companyLogo ? (
            <img
              src={event.companyLogo}
              alt={event.company}
              className="h-7 w-7 object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <Building className="h-5 w-5 text-cyan-400" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <h4 className="font-bold text-base text-white truncate tracking-tight">
              {event.company}
            </h4>
            <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {event.totalStages > 1
                ? `Round ${event.stage} of ${event.totalStages}`
                : `Round ${event.stage}`}
            </span>
          </div>
          <p className="text-xs font-medium text-slate-400 truncate">
            {event.role}
          </p>
        </div>
      </div>

      {/* Round Category Badge */}
      <div className="mb-4 pb-3 border-b border-slate-800/80 flex items-center justify-between">
        <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          {event.interviewType.toUpperCase()} STAGE
        </div>
        {event.daysSincePreviousRound !== null && event.daysSincePreviousRound !== undefined && (
          <span className="text-[11px] text-slate-400">
            {event.daysSincePreviousRound} days since last round
          </span>
        )}
      </div>

      {/* Date & Time */}
      <div className="space-y-2 text-xs text-slate-300 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-cyan-400 flex-shrink-0" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-cyan-400 flex-shrink-0" />
            <span>{formattedTime}</span>
          </div>
          <span className="text-slate-400 font-medium">
            {event.durationMinutes} min
          </span>
        </div>
      </div>

      {/* Interviewer Info (Excludes Candidate's own email) */}
      <div className="bg-[#141b29] p-3 rounded-xl border border-slate-800 mb-4 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center flex-shrink-0">
          {interviewer.avatar ? (
            <img src={interviewer.avatar} alt={interviewer.name} className="h-full w-full object-cover" />
          ) : (
            <User className="h-4 w-4 text-slate-300" />
          )}
        </div>
        <div className="min-w-0 flex-1 text-xs">
          <div className="font-semibold text-slate-200 truncate">
            {interviewer.name}
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {interviewer.title || `${event.company} Panelist`}
          </div>
        </div>
      </div>

      {/* Status & Result Pill */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
        <div className="bg-[#141b29] p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">
            Status
          </span>
          <span
            className={`font-semibold capitalize ${
              event.status === "completed" ? "text-emerald-400" : "text-cyan-400"
            }`}
          >
            {event.status}
          </span>
        </div>

        <div className="bg-[#141b29] p-2.5 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">
            Result
          </span>
          <span
            className={`font-semibold capitalize ${
              event.outcome === "advanced" || event.outcome === "offer"
                ? "text-emerald-400"
                : event.outcome === "rejected"
                ? "text-rose-400"
                : "text-amber-400"
            }`}
          >
            {event.outcome}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {event.meetingUrl ? (
          <a
            href={event.meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2 px-3 rounded-xl transition-all shadow-md shadow-cyan-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            <Video className="h-3.5 w-3.5" />
            Open Meeting
            <ArrowUpRight className="h-3 w-3" />
          </a>
        ) : (
          <button
            disabled
            className="flex items-center justify-center gap-1.5 bg-slate-800 text-slate-500 font-bold py-2 px-3 rounded-xl"
          >
            <Video className="h-3.5 w-3.5" />
            No Meeting Link
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onOpenDrawer) onOpenDrawer(event);
          }}
          className="flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2 px-3 rounded-xl border border-slate-700/80 transition-all"
        >
          View Details
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
