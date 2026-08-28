import { useState, type ReactNode } from "react";
import { Building2, ChevronRight } from "lucide-react";
import { Company } from "@/types/interview";

function CompanyMark({ name, logo }: { name: string; logo?: string }) {
  const [failed, setFailed] = useState(false);
  if (!logo || failed) {
    return <Building2 className="h-4 w-4 text-[var(--accent)]" />;
  }
  return (
    <img
      src={logo}
      alt={name}
      className="h-6 w-6 object-contain"
      onError={() => setFailed(true)}
    />
  );
}

interface CompanyRowProps {
  company: Company;
  onClick?: () => void;
  trailing?: ReactNode;
}

export function CompanyRow({ company, onClick, trailing }: CompanyRowProps) {
  const interviewCount = company.roles.reduce((sum, role) => sum + role.interviews.length, 0);
  const className = `iv-row iv-search-row${onClick ? "" : " iv-search-row-static"}`;

  const body = (
    <>
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="h-10 w-10 rounded-xl border border-[var(--border)] bg-[var(--bg3)] flex items-center justify-center overflow-hidden shrink-0">
          <CompanyMark name={company.name} logo={company.logo} />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <div className="iv-row-title truncate">{company.name}</div>
          <div className="iv-row-meta truncate">
            {company.roles.length} {company.roles.length === 1 ? "role" : "roles"}
            {company.domain ? ` · ${company.domain}` : ""}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="iv-badge iv-company-count">
          {interviewCount} {interviewCount === 1 ? "interview" : "interviews"}
        </span>
        {trailing ?? <ChevronRight className="h-4 w-4 text-[var(--text3)]" />}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button type="button" className={className} onClick={onClick}>
        {body}
      </button>
    );
  }

  return <div className={className}>{body}</div>;
}
