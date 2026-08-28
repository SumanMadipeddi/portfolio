import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInterviewEvents, getCompaniesFromEvents } from "@/lib/interview-storage";
import { ArrowLeft } from "lucide-react";

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

  if (!targetRole && companies.length > 0) {
    targetCompany = companies[0];
    targetRole = targetCompany.roles[0];
  }

  if (!targetRole || !targetCompany) {
    return (
      <div className="v2 iv-app flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Role Not Found</h2>
          <button onClick={() => navigate("/interviews")} className="text-[var(--accent)] hover:underline">
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
    <div className="v2 iv-app pb-20">
      <header className="iv-topbar">
        <div className="max-w-[900px] mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/interviews")}
            className="inline-flex items-center gap-2 text-sm text-[var(--text2)] hover:text-[var(--text)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
          <div className="section-eyebrow" style={{ marginBottom: 0 }}>
            Role Journey
          </div>
        </div>
      </header>

      <main className="max-w-[900px] mx-auto px-6 pt-10 space-y-6">
        <div className="iv-card">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <span className="card-tag" style={{ marginBottom: 6 }}>
                {targetCompany.name}
              </span>
              <h1 className="text-2xl font-semibold tracking-tight text-[var(--text)]">{targetRole.title}</h1>
              <p className="iv-row-meta mt-1">{targetRole.roleCategory}</p>
            </div>
            <span className="iv-badge iv-badge-green">{targetRole.status}</span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm pt-4 border-t border-[var(--border)]">
            <div>
              <span className="card-tag">Applied Date</span>
              <span className="font-medium text-[var(--text)]">{targetRole.appliedDate}</span>
            </div>
            <div>
              <span className="card-tag">Current Stage</span>
              <span className="font-medium text-[var(--text)]">{targetRole.currentStage}</span>
            </div>
            <div>
              <span className="card-tag">Total Rounds</span>
              <span className="font-medium text-[var(--accent)]">{roleEvents.length} Interviews</span>
            </div>
          </div>
        </div>

        <section className="iv-card">
          <div className="card-tag">Interview Journey Pipeline</div>

          <div className="relative space-y-6 pl-6 border-l border-[var(--border)] mt-2">
            <div className="relative">
              <div className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full bg-[var(--accent)] border-[3px] border-[var(--bg1)]" />
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg3)]">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="iv-row-title">Application Submitted</span>
                  <span className="iv-row-meta">{targetRole.appliedDate}</span>
                </div>
                <p className="iv-row-meta">Application logged via career portal</p>
              </div>
            </div>

            {roleEvents.map((evt) => {
              const startDate = new Date(evt.start);
              const formattedDate = startDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div key={evt.id} className="relative space-y-2">
                  {evt.daysSincePreviousRound != null && (
                    <div className="text-[11px] text-[var(--accent)] italic my-1 pl-2">
                      ↓ {evt.daysSincePreviousRound} days between rounds
                    </div>
                  )}

                  <div className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full bg-[var(--green)] border-[3px] border-[var(--bg1)]" />

                  <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg3)]">
                    <div className="flex items-center justify-between text-sm mb-2 gap-3">
                      <span className="iv-row-title flex items-center gap-2 flex-wrap">
                        {evt.interviewType.replace(/_/g, " ")}
                        <span className="iv-badge">
                          Round {evt.stage} of {evt.totalStages}
                        </span>
                      </span>
                      <span className="iv-row-meta shrink-0">{formattedDate}</span>
                    </div>

                    <p className="text-sm text-[var(--text2)] mb-3 font-light">
                      {evt.notes || evt.calendarDescription}
                    </p>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--border)]">
                      <span className="text-[var(--text3)]">Duration: {evt.durationMinutes} min</span>
                      <span className="font-medium text-[var(--green)] capitalize">Outcome: {evt.outcome}</span>
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
