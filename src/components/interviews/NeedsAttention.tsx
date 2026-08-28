import { InterviewEvent } from "@/types/interview";
import { AlertCircle, ChevronRight } from "lucide-react";

interface NeedsAttentionProps {
  events: InterviewEvent[];
  onSelectEvent: (event: InterviewEvent) => void;
}

export function NeedsAttention({ events, onSelectEvent }: NeedsAttentionProps) {
  const stalled = events
    .filter(
      (e) => e.outcome === "waiting" || (e.daysSincePreviousRound && e.daysSincePreviousRound > 7)
    )
    .slice(0, 4);

  if (stalled.length === 0) return null;

  return (
    <div className="iv-card iv-card-sm">
      <div className="card-tag flex items-center gap-2" style={{ width: "fit-content" }}>
        <AlertCircle className="h-3.5 w-3.5 text-[#ff9f0a]" />
        Needs Attention ({stalled.length})
      </div>

      <div className="exp-list">
        {stalled.map((evt) => (
          <div key={evt.id} className="iv-row" onClick={() => onSelectEvent(evt)}>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="iv-row-title truncate">{evt.company}</span>
                <span className="iv-badge iv-badge-amber">Awaiting Feedback</span>
              </div>
              <p className="iv-row-meta truncate">{evt.role}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-[var(--text3)] shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
