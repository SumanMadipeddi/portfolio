import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInterviewEvents, getCompaniesFromEvents } from "@/lib/interview-storage";
import { Building, ArrowLeft, ExternalLink, Calendar, Briefcase, ChevronRight, CheckCircle2 } from "lucide-react";

export default function CompanyDetail() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();

  const events = useMemo(() => getInterviewEvents(), []);
  const companies = useMemo(() => getCompaniesFromEvents(events), [events]);

  const company = companies.find((c) => c.id === companyId) || companies[0];

  const companyEvents = useMemo(
    () => events.filter((e) => e.companyId === company?.id),
    [events, company]
  );

  if (!company) {
    return (
      <div className="min-h-screen bg-[#070a0f] text-slate-100 flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Company Not Found</h2>
          <button
            onClick={() => navigate("/interviews")}
            className="text-cyan-400 font-semibold hover:underline"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070a0f] text-slate-100 font-sans pb-20">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-[#0c1017]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/interviews")}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            Company Intelligence Detail
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Company Header Card */}
        <div className="bg-[#111622]/90 border border-slate-800/80 rounded-2xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-2xl bg-slate-800 border border-slate-700/80 flex items-center justify-center overflow-hidden shadow-inner">
              {company.logo ? (
                <img src={company.logo} alt={company.name} className="h-10 w-10 object-contain" />
              ) : (
                <Building className="h-8 w-8 text-cyan-400" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">{company.name}</h1>
              <p className="text-xs text-slate-400">{company.domain}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-300">
                <span>{company.roles.length} Active Roles</span>
                <span>•</span>
                <span>{companyEvents.length} Total Interviews</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 px-3.5 rounded-xl border border-slate-700/80 transition-all"
              >
                Website
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* ACTIVE ROLES Section (Demonstrating MULTIPLE ROLES PER COMPANY) */}
        <section>
          <h2 className="text-base font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-cyan-400" />
            Active Application Roles ({company.roles.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {company.roles.map((role) => (
              <div
                key={role.id}
                onClick={() => navigate(`/roles/${role.id}`)}
                className="p-5 bg-[#111622]/90 border border-slate-800/80 hover:border-cyan-500/50 rounded-2xl cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-base text-white group-hover:text-cyan-400 transition-colors">
                    {role.title}
                  </h3>
                  <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </div>

                <div className="text-xs text-slate-400 mb-3">{role.roleCategory}</div>

                <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
                  <span className="text-slate-400">{role.currentStage}</span>
                  <span className="text-cyan-400 font-semibold">{role.interviews.length} Interviews</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CHRONOLOGICAL INTERVIEW HISTORY */}
        <section>
          <h2 className="text-base font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-cyan-400" />
            Chronological Interview History
          </h2>

          <div className="space-y-3">
            {companyEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-4 bg-[#111622]/90 border border-slate-800/80 rounded-2xl flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{evt.role}</span>
                    <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2.5 py-0.5 rounded-full border border-cyan-500/20 font-semibold">
                      {evt.interviewType.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(evt.start).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })} • {evt.durationMinutes} min
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-emerald-400 capitalize block">
                    {evt.outcome}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Round {evt.stage} of {evt.totalStages}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
