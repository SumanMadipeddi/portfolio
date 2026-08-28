import { InterviewEvent } from "@/types/interview";
import { Calendar, Clock, Video, User, Building, ChevronRight, ArrowUpRight, MapPin } from "lucide-react";
import { getInterviewDisplayLocation } from "@/lib/google-calendar/location";

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

  const validInterviewers = event.interviewers.filter(
    (i) => !i.email?.toLowerCase().includes("madipeddisuman") && !i.name?.toLowerCase().includes("madipeddisuman")
  );

  const interviewer = validInterviewers[0] || {
    name: `${event.company} Hiring Team`,
    title: "Interview Panel",
  };
  const location = getInterviewDisplayLocation(event);

  return (
    <div className="w-[340px] iv-card iv-card-sm z-50 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto">
      <div className="flex items-start gap-3 mb-4">
        <div className="h-11 w-11 rounded-xl border border-[var(--border)] bg-[var(--bg3)] flex items-center justify-center overflow-hidden shrink-0">
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
            <Building className="h-5 w-5 text-[var(--accent)]" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="iv-row-title truncate">{event.company}</h4>
            <span className="iv-badge">
              {event.totalStages > 1 ? `Round ${event.stage} of ${event.totalStages}` : `Round ${event.stage}`}
            </span>
          </div>
          <p className="iv-row-meta truncate">{event.role}</p>
        </div>
      </div>

      <div className="mb-4 pb-3 border-b border-[var(--border)] flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--text2)] uppercase tracking-wide">
          {event.interviewType.replace(/_/g, " ")} stage
        </span>
        {event.daysSincePreviousRound != null && (
          <span className="text-[11px] text-[var(--text3)]">
            {event.daysSincePreviousRound} days since last round
          </span>
        )}
      </div>

      <div className="space-y-2 text-xs text-[var(--text2)] mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-[var(--accent)] shrink-0" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-[var(--accent)] shrink-0" />
            <span>{formattedTime}</span>
          </div>
          <span className="text-[var(--text3)]">{event.durationMinutes} min</span>
        </div>
        {location && (
          <div className="flex items-start gap-2">
            <MapPin className="h-3.5 w-3.5 text-[var(--accent)] shrink-0 mt-px" />
            <span className="leading-relaxed">{location}</span>
          </div>
        )}
      </div>

      <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--bg3)] mb-4 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-[var(--bg1)] border border-[var(--border)] overflow-hidden flex items-center justify-center shrink-0">
          {interviewer.avatar ? (
            <img src={interviewer.avatar} alt={interviewer.name} className="h-full w-full object-cover" />
          ) : (
            <User className="h-4 w-4 text-[var(--text3)]" />
          )}
        </div>
        <div className="min-w-0 flex-1 text-xs">
          <div className="font-medium text-[var(--text)] truncate">{interviewer.name}</div>
          <div className="text-[11px] text-[var(--text3)] truncate">
            {interviewer.title || `${event.company} Panelist`}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
        <div className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg3)]">
          <span className="card-tag" style={{ marginBottom: 4 }}>
            Status
          </span>
          <span
            className={`font-medium capitalize ${
              event.status === "completed" ? "text-[var(--green)]" : "text-[var(--accent)]"
            }`}
          >
            {event.status}
          </span>
        </div>
        <div className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg3)]">
          <span className="card-tag" style={{ marginBottom: 4 }}>
            Result
          </span>
          <span
            className={`font-medium capitalize ${
              event.outcome === "advanced" || event.outcome === "offer"
                ? "text-[var(--green)]"
                : event.outcome === "rejected"
                ? "text-[#ff453a]"
                : "text-[#ff9f0a]"
            }`}
          >
            {event.outcome}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {event.meetingUrl ? (
          <a
            href={event.meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary justify-center py-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Video className="h-3.5 w-3.5" />
            Open Meeting
            <ArrowUpRight className="h-3 w-3" />
          </a>
        ) : (
          <button disabled className="btn-secondary justify-center py-2 opacity-50 cursor-not-allowed">
            <Video className="h-3.5 w-3.5" />
            No Link
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onOpenDrawer) onOpenDrawer(event);
          }}
          className="btn-secondary justify-center py-2"
        >
          View Details
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
