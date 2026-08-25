import { useState, useEffect } from "react";
import { InterviewEvent, InterviewOutcome, InterviewType } from "@/types/interview";
import { X, Calendar, Clock, Video, User, Building, ExternalLink, Save, CheckCircle2, FileText, Sparkles, Tag, ShieldCheck } from "lucide-react";

interface InterviewDetailDrawerProps {
  event: InterviewEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateEvent: (updated: InterviewEvent) => void;
}

export function InterviewDetailDrawer({ event, isOpen, onClose, onUpdateEvent }: InterviewDetailDrawerProps) {
  if (!isOpen || !event) return null;

  const [outcome, setOutcome] = useState<InterviewOutcome>(event.outcome);
  const [interviewType, setInterviewType] = useState<InterviewType>(event.interviewType);
  const [notes, setNotes] = useState(event.notes || "");
  const [prepScore, setPrepScore] = useState(event.preparationScore || 8);
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
  const endDate = new Date(event.end);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0c1017] border-l border-slate-800 text-slate-100 shadow-2xl flex flex-col justify-between">
          
          {/* Drawer Header */}
          <div className="p-6 border-b border-slate-800/80 bg-[#111622]/60">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Round {event.stage} of {event.totalStages}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  {(event.confidenceScore ? event.confidenceScore * 100 : 95)}% confidence
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center overflow-hidden flex-shrink-0">
                {event.companyLogo ? (
                  <img src={event.companyLogo} alt={event.company} className="h-8 w-8 object-contain" />
                ) : (
                  <Building className="h-6 w-6 text-cyan-400" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">{event.company}</h3>
                <p className="text-sm font-medium text-slate-400">{event.role}</p>
                <span className="inline-block mt-1 text-xs text-cyan-400 font-semibold">{event.roleCategory}</span>
              </div>
            </div>
          </div>

          {/* Drawer Body Scrollable */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
            
            {/* Quick Actions & Date/Time */}
            <div className="bg-[#141b29] p-4 rounded-2xl border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-cyan-400" />
                  {startDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-cyan-400" />
                  {event.durationMinutes} min
                </span>
              </div>

              {event.meetingUrl && (
                <a
                  href={event.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-lg shadow-cyan-500/20"
                >
                  <Video className="h-4 w-4" />
                  Launch Video Meeting
                  <ExternalLink className="h-3.5 w-3.5 ml-auto" />
                </a>
              )}
            </div>

            {/* Outcome & Classification Controls */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Tag className="h-4 w-4 text-cyan-400" />
                Stage & Outcome Classification
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">Interview Stage</label>
                  <select
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value as InterviewType)}
                    className="w-full bg-[#141b29] text-xs text-slate-200 p-2.5 rounded-xl border border-slate-800 focus:border-cyan-500 focus:outline-none"
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
                  <label className="text-xs text-slate-400 block mb-1.5">Outcome Result</label>
                  <select
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value as InterviewOutcome)}
                    className="w-full bg-[#141b29] text-xs text-slate-200 p-2.5 rounded-xl border border-slate-800 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="waiting">Waiting for Feedback</option>
                    <option value="advanced">Advanced to Next Stage</option>
                    <option value="offer">Received Offer 🎉</option>
                    <option value="rejected">Rejected / Closed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Preparation Score */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs text-slate-400 font-medium">Preparation Score</label>
                <span className="text-xs font-bold text-cyan-400">{prepScore} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={prepScore}
                onChange={(e) => setPrepScore(Number(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Interviewers Section */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-cyan-400" />
                Interviewer Panel
              </h4>
              <div className="space-y-2">
                {event.interviewers.map((inv, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-[#141b29] rounded-xl border border-slate-800/80">
                    <div className="h-8 w-8 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {inv.avatar ? (
                        <img src={inv.avatar} alt={inv.name} className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-4 w-4 text-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 text-xs">
                      <div className="font-semibold text-slate-200 truncate">{inv.name}</div>
                      <div className="text-slate-400 text-[11px] truncate">{inv.title || inv.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes Section */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-cyan-400" />
                Interview Preparation & Feedback Notes
              </h4>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Log question topics, feedback, behavioral examples, and follow-ups..."
                className="w-full bg-[#141b29] text-xs text-slate-200 p-3 rounded-xl border border-slate-800 focus:border-cyan-500 focus:outline-none resize-none"
              />
            </div>

            {/* Google Calendar Details */}
            <div className="bg-[#141b29]/60 p-4 rounded-xl border border-slate-800/60 text-xs">
              <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">
                Calendar Event Synopsis
              </span>
              <p className="text-slate-300 leading-relaxed italic">
                "{event.calendarDescription || "No calendar description available."}"
              </p>
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-6 border-t border-slate-800 bg-[#111622]/80 flex items-center gap-3">
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md shadow-cyan-500/20"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-slate-950" />
                  Saved Changes!
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
    </div>
  );
}
