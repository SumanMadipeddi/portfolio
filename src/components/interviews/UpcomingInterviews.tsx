import { InterviewEvent } from "@/types/interview";
import { Calendar, Clock, Video, ChevronRight, Users, MapPin } from "lucide-react";
import { getInterviewDisplayLocation } from "@/lib/google-calendar/location";

interface UpcomingInterviewsProps {
  events: InterviewEvent[];
  onSelectEvent: (event: InterviewEvent) => void;
}

export function UpcomingInterviews({ events, onSelectEvent }: UpcomingInterviewsProps) {
  const upcoming = events
    .filter((e) => e.status === "upcoming" || new Date(e.start) > new Date())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 12);

  if (upcoming.length === 0) {
    return (
      <div className="iv-card iv-card-sm md:only:col-span-2">
        <div className="card-tag flex items-center gap-2" style={{ width: "fit-content" }}>
          <Calendar className="h-3.5 w-3.5" />
          Upcoming Interviews
        </div>
        <p className="iv-row-meta">
          Click <strong className="text-[var(--text)] font-medium">Sync Calendar</strong> to load Google
          Meet / calendar invites. Future interviews from your primary calendar will show here.
        </p>
      </div>
    );
  }

  return (
    <div className="iv-card iv-card-sm md:only:col-span-2">
      <div className="card-tag flex items-center gap-2" style={{ width: "fit-content" }}>
        <Calendar className="h-3.5 w-3.5" />
        Upcoming Interviews ({upcoming.length})
      </div>

      <div className="exp-list">
        {upcoming.map((evt) => {
          const startDate = new Date(evt.start);
          const dateStr = startDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
          const timeStr = startDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
          const interviewer = evt.interviewers?.[0]?.name;
          const location = getInterviewDisplayLocation(evt);

          return (
            <div key={evt.id} className="iv-row" onClick={() => onSelectEvent(evt)}>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="iv-row-title truncate">{evt.company}</span>
                  <span className="iv-badge">Round {evt.stage}</span>
                </div>
                <p className="iv-row-meta truncate">{evt.role}</p>
                <div className="flex flex-wrap items-center gap-3 text-[12px] text-[var(--text3)] mt-1">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-[var(--accent)]" /> {dateStr}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3 text-[var(--accent)]" /> {timeStr}
                  </span>
                  {interviewer && (
                    <span className="inline-flex items-center gap-1 truncate">
                      <Users className="h-3 w-3 text-[var(--accent)]" /> {interviewer}
                    </span>
                  )}
                  {location && (
                    <span className="inline-flex items-center gap-1 truncate">
                      <MapPin className="h-3 w-3 text-[var(--accent)]" /> {location}
                    </span>
                  )}
                </div>
              </div>

              {evt.meetingUrl ? (
                <a
                  href={evt.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="btn-primary text-xs py-1.5 px-3 shrink-0"
                  title="Join meeting invite"
                >
                  <Video className="h-3.5 w-3.5" />
                  Join
                </a>
              ) : (
                <ChevronRight className="h-4 w-4 text-[var(--text3)] shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
