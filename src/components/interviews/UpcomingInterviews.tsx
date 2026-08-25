import { InterviewEvent } from "@/types/interview";
import { Calendar, Clock, Video, ArrowUpRight, ChevronRight } from "lucide-react";

interface UpcomingInterviewsProps {
  events: InterviewEvent[];
  onSelectEvent: (event: InterviewEvent) => void;
}

export function UpcomingInterviews({ events, onSelectEvent }: UpcomingInterviewsProps) {
  const upcoming = events
    .filter((e) => e.status === "upcoming" || new Date(e.start) > new Date())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 4);

  if (upcoming.length === 0) {
    return (
      <div className="bg-[#111622]/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl text-center text-slate-400 text-xs">
        <Calendar className="h-5 w-5 text-cyan-400 mx-auto mb-1.5" />
        <span className="font-semibold text-slate-200 block mb-0.5">No upcoming interviews</span>
        New calendar events synced from Google Calendar will appear here.
      </div>
    );
  }

  return (
    <div className="bg-[#111622]/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-4 w-4 text-cyan-400" />
        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
          Upcoming Interviews ({upcoming.length})
        </h4>
      </div>

      <div className="space-y-3">
        {upcoming.map((evt) => {
          const startDate = new Date(evt.start);
          const dateStr = startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          const timeStr = startDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

          return (
            <div
              key={evt.id}
              onClick={() => onSelectEvent(evt)}
              className="p-3 bg-[#0c1017] border border-slate-800/80 hover:border-cyan-500/50 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-100 group-hover:text-cyan-400 transition-colors truncate">
                    {evt.company}
                  </span>
                  <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/20 font-semibold flex-shrink-0">
                    Round {evt.stage}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">{evt.role}</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-cyan-400" /> {dateStr}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-cyan-400" /> {timeStr}
                  </span>
                </div>
              </div>

              {evt.meetingUrl ? (
                <a
                  href={evt.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-colors ml-2 flex-shrink-0"
                  title="Join Meeting"
                >
                  <Video className="h-4 w-4" />
                </a>
              ) : (
                <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition-colors ml-2" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
