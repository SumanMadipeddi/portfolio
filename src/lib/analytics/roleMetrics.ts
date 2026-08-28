import { InterviewEvent, RoleCategoryAnalytics } from "@/types/interview";

export function computeRoleCategoryAnalytics(events: InterviewEvent[]): RoleCategoryAnalytics[] {
  const categoryMap = new Map<string, RoleCategoryAnalytics>();

  events.forEach((e) => {
    const roleCat = e.roleCategory || "Software Engineer - AI";
    let stat = categoryMap.get(roleCat);
    if (!stat) {
      stat = {
        category: roleCat,
        applicationsCount: 0,
        recruiterCount: 0,
        technicalCount: 0,
        finalCount: 0,
        offerCount: 0,
        appToScreenRate: 0,
        screenToTechRate: 0,
        techToFinalRate: 0,
        finalToOfferRate: 0,
      };
      categoryMap.set(roleCat, stat);
    }

    if (e.interviewType === "recruiter") stat.recruiterCount++;
    if (e.interviewType === "technical" || e.interviewType === "coding" || e.interviewType === "system_design") stat.technicalCount++;
    if (e.interviewType === "final" || e.interviewType === "onsite") stat.finalCount++;
    if (e.outcome === "offer") stat.offerCount++;
  });

  const result: RoleCategoryAnalytics[] = [];
  categoryMap.forEach((stat) => {
    // Total interviews count across stages
    const totalInterviews = stat.recruiterCount + stat.technicalCount + stat.finalCount + stat.offerCount;
    stat.applicationsCount = totalInterviews;

    if (stat.recruiterCount > 0) {
      stat.screenToTechRate = Math.min(100, Math.round((stat.technicalCount / stat.recruiterCount) * 100));
    } else {
      stat.screenToTechRate = 0;
    }

    if (stat.technicalCount > 0) {
      stat.techToFinalRate = Math.min(100, Math.round((stat.finalCount / stat.technicalCount) * 100));
    } else {
      stat.techToFinalRate = 0;
    }

    if (stat.finalCount > 0) {
      stat.finalToOfferRate = Math.min(100, Math.round((stat.offerCount / stat.finalCount) * 100));
    } else {
      stat.finalToOfferRate = 0;
    }

    if (totalInterviews > 0) {
      result.push(stat);
    }
  });

  return result.sort((a, b) => b.applicationsCount - a.applicationsCount);
}
