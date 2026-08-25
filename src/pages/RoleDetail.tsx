import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInterviewEvents, getCompaniesFromEvents } from "@/lib/interview-storage";
import { ArrowLeft, Briefcase, Calendar, CheckCircle2, Clock, ChevronDown, Sparkles } from "lucide-react";

export default function RoleDetail() {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();

  const events = useMemo(() => getInterviewEvents(), []);
  const companies = useMemo(() => getCompaniesFromEvents(events), [events]);

  let targetRole = null;
  let targetCompany = null;

  for (const c of companies) {
    const r = c.roles.find((role) => role.id === roleId);
    if (r) {
      targetRole = r;
      targetCompany = c;
      break;
    }
  }

  // Fallback to first role
  if (!targetRole && companies.length > 0) {
    targetCompany = companies[0];
    targetRole = targetCompany.roles[0];
  }

  if (!targetRole || !targetCompany) {
    return (
      <div className="min-h-screen bg-[#070a0f] text-slate-100 flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Role Not Found</h2>
          <button onClick={() => navigate("/interviews")} className="text-cyan-400 font-semibold hover:underline">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const roleEvents = targetRole.interviews.sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  return (
    <div className="min-h-screen bg-[#070a0f] text-slate-100 font-sans pb-20">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-[#0c1017]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/interviews")}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            Role Journey Detail
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Role Header Card */}
        <div className="bg-[#111622]/90 border border-slate-800/80 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                {targetCompany.name}
              </span>
              <h1 className="text-2xl font-black text-white tracking-tight">{targetRole.title}</h1>
              <p className="text-xs text-slate-400 mt-1">{targetRole.roleCategory}</p>
            </div>
            <span className="text-xs font-bold uppercase bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
              {targetRole.status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs pt-4 border-t border-slate-800/80">
            <div>
              <span className="text-slate-400 block">Applied Date</span>
              <span className="font-semibold text-slate-200">{targetRole.appliedDate}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Current Stage</span>
              <span className="font-semibold text-slate-200">{targetRole.currentStage}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Total Rounds</span>
              <span className="font-semibold text-cyan-400">{roleEvents.length} Interviews</span>
            </div>
          </div>
        </div>

        {/* STAGE JOURNEY TIMELINE */}
        <section className="bg-[#111622]/90 border border-slate-800/80 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-base font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            Interview Journey Pipeline & Velocity
          </h2>

          <div className="relative space-y-6 pl-6 border-l-2 border-slate-800">
            {/* Applied Initial Node */}
            <div className="relative">
              <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-cyan-500 border-4 border-[#111622]" />
              <div className="bg-[#0c1017] p-4 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-white">Application Submitted</span>
                  <span className="text-slate-400">{targetRole.appliedDate}</span>
                </div>
                <p className="text-xs text-slate-400">Application logged via career portal</p>
              </div>
            </div>

            {/* Event Stage Nodes */}
            {roleEvents.map((evt, idx) => {
              const startDate = new Date(evt.start);
              const formattedDate = startDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div key={evt.id} className="relative space-y-2">
                  {/* Days between rounds indicator */}
                  {evt.daysSincePreviousRound !== null && evt.daysSincePreviousRound !== undefined && (
                    <div className="text-[11px] text-cyan-400 font-semibold italic my-1 pl-2">
                      ↓ {evt.daysSincePreviousRound} days velocity delay
                    </div>
                  )}

                  <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-emerald-500 border-4 border-[#111622]" />
                  
                  <div className="bg-[#0c1017] p-4 rounded-xl border border-slate-800/80">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-white text-sm flex items-center gap-2">
                        {evt.interviewType.toUpperCase()} STAGE
                        <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/20 font-semibold">
                          Round {evt.stage} of {evt.totalStages}
                        </span>
                      </span>
                      <span className="text-slate-400 font-medium">{formattedDate}</span>
                    </div>

                    <p className="text-xs text-slate-300 mb-3">{evt.notes || evt.calendarDescription}</p>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/50">
                      <span className="text-slate-400">Duration: {evt.durationMinutes} min</span>
                      <span className="font-semibold text-emerald-400 capitalize">Outcome: {evt.outcome}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
