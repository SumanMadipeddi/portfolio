import { InterviewEvent, RoleCategoryAnalytics } from "@/types/interview";

export function computeRoleCategoryAnalytics(events: InterviewEvent[]): RoleCategoryAnalytics[] {
  const categories = [
    "AI Engineer",
    "Applied AI Engineer",
    "Software Engineer - AI",
    "Founding Engineer",
    "Solutions Engineer",
    "Backend / Infrastructure",
    "Applied Scientist",
    "Full-Stack Engineer",
  ];

  const categoryMap = new Map<string, RoleCategoryAnalytics>();

  categories.forEach((cat) => {
    categoryMap.set(cat, {
      category: cat,
      applicationsCount: 0,
      recruiterCount: 0,
      technicalCount: 0,
      finalCount: 0,
      offerCount: 0,
      appToScreenRate: 0,
      screenToTechRate: 0,
      techToFinalRate: 0,
      finalToOfferRate: 0,
    });
  });

  events.forEach((e) => {
    let stat = categoryMap.get(e.roleCategory);
    if (!stat) {
      stat = {
        category: e.roleCategory,
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
      categoryMap.set(e.roleCategory, stat);
    }

    if (e.interviewType === "recruiter") stat.recruiterCount++;
    if (e.interviewType === "technical" || e.interviewType === "coding" || e.interviewType === "system_design") stat.technicalCount++;
    if (e.interviewType === "final" || e.interviewType === "onsite") stat.finalCount++;
    if (e.outcome === "offer") stat.offerCount++;
  });

  // Base applications estimate & calculate conversion rates
  const result: RoleCategoryAnalytics[] = [];
  categoryMap.forEach((stat) => {
    // Fill realistic baseline application count
    stat.applicationsCount = Math.max(
      stat.recruiterCount + 10,
      Math.round(stat.recruiterCount * 1.6)
    );

    if (stat.recruiterCount > 0) {
      stat.appToScreenRate = Math.round((stat.recruiterCount / stat.applicationsCount) * 100);
      stat.screenToTechRate = Math.round((stat.technicalCount / stat.recruiterCount) * 100);
    }
    if (stat.technicalCount > 0) {
      stat.techToFinalRate = Math.round((stat.finalCount / stat.technicalCount) * 100);
    }
    if (stat.finalCount > 0) {
      stat.finalToOfferRate = Math.round((stat.offerCount / stat.finalCount) * 100);
    }

    if (stat.recruiterCount > 0 || stat.technicalCount > 0 || stat.finalCount > 0) {
      result.push(stat);
    }
  });

  return result.sort((a, b) => b.applicationsCount - a.applicationsCount);
}
