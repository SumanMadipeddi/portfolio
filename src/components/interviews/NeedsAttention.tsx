import { InterviewEvent } from "@/types/interview";
import { AlertCircle, Clock, ChevronRight, Video } from "lucide-react";

interface NeedsAttentionProps {
  events: InterviewEvent[];
  onSelectEvent: (event: InterviewEvent) => void;
}

export function NeedsAttention({ events, onSelectEvent }: NeedsAttentionProps) {
  // Find events where outcome is "waiting" or completed > 5 days ago without next round
  const stalled = events.filter(
    (e) => e.outcome === "waiting" || (e.daysSincePreviousRound && e.daysSincePreviousRound > 7)
  ).slice(0, 4);

  if (stalled.length === 0) {
    return (
      <div className="bg-[#111622]/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl text-center text-slate-400 text-xs">
        <AlertCircle className="h-5 w-5 text-emerald-400 mx-auto mb-1.5" />
        <span className="font-semibold text-slate-200 block mb-0.5">All applications active</span>
        No stalled interview loops detected in the last 7 days.
      </div>
    );
  }

  return (
    <div className="bg-[#111622]/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="h-4 w-4 text-amber-400" />
        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
          Needs Attention ({stalled.length})
        </h4>
      </div>

      <div className="space-y-3">
        {stalled.map((evt) => (
          <div
            key={evt.id}
            onClick={() => onSelectEvent(evt)}
            className="p-3 bg-[#0c1017] border border-slate-800/80 hover:border-amber-500/50 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-slate-100 group-hover:text-amber-400 transition-colors">
                  {evt.company}
                </span>
                <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20 font-semibold">
                  Awaiting Feedback
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{evt.role}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </div>
        ))}
      </div>
    </div>
  );
}
