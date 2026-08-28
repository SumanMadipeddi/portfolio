import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getInterviewEvents, getCompaniesFromEvents } from "@/lib/interview-storage";
import { ArrowLeft, Calendar, Briefcase, ChevronRight } from "lucide-react";
import { CompanyRow } from "@/components/interviews/CompanyRow";

export default function CompanyDetail() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();

  const events = useMemo(() => getInterviewEvents(), []);
  const companies = useMemo(() => getCompaniesFromEvents(events), [events]);

  const company = companies.find((c) => c.id === companyId) || companies[0];

  const companyEvents = useMemo(
    () =>
      events
        .filter((e) => e.companyId === company?.id)
        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()),
    [events, company]
  );

  if (!company) {
    return (
      <div className="v2 iv-app flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Company Not Found</h2>
          <button onClick={() => navigate("/interviews")} className="text-[var(--accent)] hover:underline">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="v2 iv-app pb-20">
      <header className="iv-topbar">
        <div className="max-w-[1100px] mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/interviews")}
            className="inline-flex items-center gap-2 text-sm text-[var(--text2)] hover:text-[var(--text)] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-6 pt-10 space-y-4">
        <div className="iv-card iv-card-sm">
          <CompanyRow company={company} />
        </div>

        <section className="iv-card iv-card-sm">
          <div className="card-tag flex items-center gap-2">
            <Briefcase className="h-3.5 w-3.5" />
            Roles ({company.roles.length})
          </div>
          {company.roles.map((role) => (
            <button
              key={role.id}
              type="button"
              className="iv-row iv-search-row"
              onClick={() => navigate(`/roles/${role.id}`)}
            >
              <div className="min-w-0 flex-1 text-left">
                <div className="iv-row-title truncate">{role.title}</div>
                <div className="iv-row-meta truncate">{role.roleCategory}</div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="iv-badge iv-company-count">
                  {role.interviews.length} {role.interviews.length === 1 ? "interview" : "interviews"}
                </span>
                <ChevronRight className="h-4 w-4 text-[var(--text3)]" />
              </div>
            </button>
          ))}
        </section>

        <section className="iv-card iv-card-sm">
          <div className="card-tag flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            Interviews ({companyEvents.length})
          </div>
          <div className="iv-search-results" style={{ maxHeight: 288, marginTop: 0, borderTop: "none" }}>
            {companyEvents.map((evt) => (
              <div key={evt.id} className="iv-row iv-search-row iv-search-row-static">
                <div className="min-w-0 flex-1">
                  <div className="iv-row-title truncate">{evt.role}</div>
                  <div className="iv-row-meta truncate">
                    {new Date(evt.start).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {` · ${evt.durationMinutes} min`}
                  </div>
                </div>
                <span className="iv-badge iv-company-count shrink-0">
                  Round {evt.stage} of {evt.totalStages}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
