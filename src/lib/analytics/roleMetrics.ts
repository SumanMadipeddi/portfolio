import { InterviewEvent, RoleCategoryAnalytics } from "@/types/interview";

function bucketType(type: InterviewEvent["interviewType"]): "recruiter" | "technical" | "final" | null {
  if (type === "recruiter" || type === "hiring_manager" || type === "behavioral" || type === "other") {
    return "recruiter";
  }
  if (type === "technical" || type === "coding" || type === "system_design" || type === "take_home") {
    return "technical";
  }
  if (type === "final" || type === "onsite" || type === "reference") return "final";
  return null;
}

export function computeRoleCategoryAnalytics(events: InterviewEvent[]): RoleCategoryAnalytics[] {
  const roleMap = new Map<string, RoleCategoryAnalytics>();

  events.forEach((e) => {
    const key = `${e.companyId}::${e.roleId}`;
    let stat = roleMap.get(key);
    if (!stat) {
      stat = {
        category: e.role,
        company: e.company,
        applicationsCount: 0,
        recruiterCount: 0,
        technicalCount: 0,
        finalCount: 0,
        offerCount: 0,
        appToScreenRate: 0,
        screenToTechRate: 0,
        techToFinalRate: 0,
        finalToOfferRate: 0,
        lastInterviewAt: 0,
      };
      roleMap.set(key, stat);
    }

    const ts = new Date(e.start).getTime();
    if (ts > stat.lastInterviewAt) stat.lastInterviewAt = ts;

    const bucket = bucketType(e.interviewType);
    if (bucket === "recruiter") stat.recruiterCount++;
    if (bucket === "technical") stat.technicalCount++;
    if (bucket === "final") stat.finalCount++;
    if (e.outcome === "offer") stat.offerCount++;
  });

  const result: RoleCategoryAnalytics[] = [];
  roleMap.forEach((stat) => {
    const totalInterviews = stat.recruiterCount + stat.technicalCount + stat.finalCount + stat.offerCount;
    stat.applicationsCount = totalInterviews;

    stat.screenToTechRate =
      stat.recruiterCount > 0 ? Math.min(100, Math.round((stat.technicalCount / stat.recruiterCount) * 100)) : 0;
    stat.techToFinalRate =
      stat.technicalCount > 0 ? Math.min(100, Math.round((stat.finalCount / stat.technicalCount) * 100)) : 0;
    stat.finalToOfferRate =
      stat.finalCount > 0 ? Math.min(100, Math.round((stat.offerCount / stat.finalCount) * 100)) : 0;

    if (totalInterviews > 0) result.push(stat);
  });

  return result.sort((a, b) => b.lastInterviewAt - a.lastInterviewAt || b.applicationsCount - a.applicationsCount);
}
