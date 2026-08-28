import { useState, useEffect } from "react";
import { InterviewEvent, InterviewOutcome, InterviewType } from "@/types/interview";
import { getInterviewDisplayLocation, stripCalendarHtml } from "@/lib/google-calendar/location";
import {
  X,
  Calendar,
  Clock,
  Video,
  User,
  Building,
  ExternalLink,
  Save,
  CheckCircle2,
  FileText,
  Tag,
  ShieldCheck,
  MapPin,
} from "lucide-react";

interface InterviewDetailDrawerProps {
  event: InterviewEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateEvent: (updated: InterviewEvent) => void;
}

export function InterviewDetailDrawer({ event, isOpen, onClose, onUpdateEvent }: InterviewDetailDrawerProps) {
  const [outcome, setOutcome] = useState<InterviewOutcome>(event?.outcome ?? "waiting");
  const [interviewType, setInterviewType] = useState<InterviewType>(event?.interviewType ?? "recruiter");
  const [notes, setNotes] = useState(event?.notes || "");
  const [prepScore, setPrepScore] = useState(event?.preparationScore || 8);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (event) {
      setOutcome(event.outcome);
      setInterviewType(event.interviewType);
      setNotes(event.notes || "");
      setPrepScore(event.preparationScore || 8);
      setIsSaved(false);
    }
  }, [event]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  const handleSave = () => {
    const updated: InterviewEvent = {
      ...event,
      outcome,
      interviewType,
      notes,
      preparationScore: prepScore,
    };
    onUpdateEvent(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const startDate = new Date(event.start);
  const location = getInterviewDisplayLocation(event);
  const synopsis = stripCalendarHtml(event.calendarDescription || "");
  const mapsUrl = location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`
    : null;

  return (
    <div
      className="iv-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="iv-card iv-modal-card w-full max-w-[560px] max-h-[min(88vh,760px)] text-[var(--text)] flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-[var(--border)] shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="iv-badge">
                Round {event.stage} of {event.totalStages}
              </span>
              {event.confidenceScore != null && (
                <span className="text-xs text-[var(--text3)] inline-flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-[var(--green)]" />
                  {Math.round(event.confidenceScore * 100)}% confidence
                </span>
              )}
            </div>
            <button onClick={onClose} className="theme-btn" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl border border-[var(--border)] bg-[var(--bg3)] flex items-center justify-center overflow-hidden shrink-0">
              {event.companyLogo ? (
                <img src={event.companyLogo} alt={event.company} className="h-8 w-8 object-contain" />
              ) : (
                <Building className="h-6 w-6 text-[var(--accent)]" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-semibold tracking-tight text-[var(--text)]">{event.company}</h3>
              <p className="text-sm text-[var(--text2)]">{event.role}</p>
              {event.roleCategory && event.roleCategory !== "Other" && (
                <span className="inline-block mt-1 text-xs text-[var(--accent)]">{event.roleCategory}</span>
              )}
            </div>
          </div>
        </div>

        <div className="iv-modal-body iv-scroll p-6 space-y-6">
            <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg3)] space-y-3">
              <div className="flex items-center justify-between text-xs text-[var(--text2)]">
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[var(--accent)]" />
                  {startDate.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[var(--accent)]" />
                  {event.durationMinutes} min
                </span>
              </div>

              {location && (
                <div className="flex items-start gap-2 text-xs text-[var(--text2)]">
                  <MapPin className="h-4 w-4 text-[var(--accent)] shrink-0 mt-px" />
                  {mapsUrl ? (
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="leading-relaxed hover:text-[var(--accent)]"
                    >
                      {location}
                    </a>
                  ) : (
                    <span className="leading-relaxed">{location}</span>
                  )}
                </div>
              )}

              {event.meetingUrl && (
                <a
                  href={event.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full justify-center"
                >
                  <Video className="h-4 w-4" />
                  Launch Video Meeting
                  <ExternalLink className="h-3.5 w-3.5 ml-auto" />
                </a>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="card-tag flex items-center gap-2" style={{ marginBottom: 0 }}>
                <Tag className="h-3.5 w-3.5 text-[var(--accent)]" />
                Stage & Outcome
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[var(--text3)] block mb-1.5">Interview Stage</label>
                  <select
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value as InterviewType)}
                    className="iv-select"
                  >
                    <option value="recruiter">Recruiter Screen</option>
                    <option value="hiring_manager">Hiring Manager</option>
                    <option value="technical">Technical Round</option>
                    <option value="coding">Coding Assessment</option>
                    <option value="system_design">System Design</option>
                    <option value="behavioral">Behavioral</option>
                    <option value="onsite">Onsite Loop</option>
                    <option value="final">Final Round</option>
                    <option value="offer">Offer</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-[var(--text3)] block mb-1.5">Outcome Result</label>
                  <select
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value as InterviewOutcome)}
                    className="iv-select"
                  >
                    <option value="waiting">Waiting for Feedback</option>
                    <option value="advanced">Advanced to Next Stage</option>
                    <option value="offer">Received Offer</option>
                    <option value="rejected">Rejected / Closed</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs text-[var(--text3)]">Preparation Score</label>
                <span className="text-xs font-medium text-[var(--accent)]">{prepScore} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={prepScore}
                onChange={(e) => setPrepScore(Number(e.target.value))}
                className="w-full accent-[#2997ff] cursor-pointer"
              />
            </div>

            <div>
              <h4 className="card-tag flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-[var(--accent)]" />
                Interviewer Panel
              </h4>
              <div className="space-y-2">
                {event.interviewers.map((inv, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg3)]"
                  >
                    <div className="h-8 w-8 rounded-full border border-[var(--border)] bg-[var(--bg1)] overflow-hidden flex items-center justify-center shrink-0">
                      {inv.avatar ? (
                        <img src={inv.avatar} alt={inv.name} className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-4 w-4 text-[var(--text3)]" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 text-xs">
                      <div className="font-medium text-[var(--text)] truncate">{inv.name}</div>
                      <div className="text-[var(--text3)] text-[11px] truncate">{inv.title || inv.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="card-tag flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-[var(--accent)]" />
                Notes
              </h4>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Log question topics, feedback, and follow-ups..."
                className="iv-textarea resize-none"
              />
            </div>

            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg3)] text-xs">
              <span className="card-tag">Calendar Event Synopsis</span>
              <p className="text-[var(--text2)] leading-relaxed whitespace-pre-wrap">
                {synopsis || "No calendar description available."}
              </p>
            </div>
          </div>

          <div className="p-6 border-t border-[var(--border)] shrink-0">
            <button onClick={handleSave} className="btn-primary w-full justify-center">
              {isSaved ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Saved Changes
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Updates
                </>
              )}
            </button>
          </div>
      </div>
    </div>
  );
}
