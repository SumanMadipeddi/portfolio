import { InterviewEvent, OverallMetrics, FilterOptions } from "@/types/interview";
import { getCompaniesFromEvents } from "@/lib/interview-storage";
import { getFilterRangeStart } from "@/lib/interview-window";

export function filterInterviewEvents(events: InterviewEvent[], filters: FilterOptions): InterviewEvent[] {
  let result = [...events];

  // Search Query
  if (filters.searchQuery?.trim()) {
    const q = filters.searchQuery.toLowerCase().trim();
    result = result.filter(
      (e) =>
        e.company.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q) ||
        e.roleCategory.toLowerCase().includes(q) ||
        e.interviewerNames.some((n) => n.toLowerCase().includes(q))
    );
  }

  const pastLimit = getFilterRangeStart(filters.dateRange);
  result = result.filter((e) => new Date(e.start) >= pastLimit);

  // Company Filter
  if (filters.companyId && filters.companyId !== "all") {
    result = result.filter((e) => e.companyId === filters.companyId);
  }

  // Role Filter
  if (filters.roleId && filters.roleId !== "all") {
    result = result.filter((e) => e.roleId === filters.roleId);
  }

  // Category Filter
  if (filters.category && filters.category !== "all") {
    result = result.filter((e) => e.role === filters.category);
  }

  // Status Filter
  if (filters.status && filters.status !== "all") {
    result = result.filter((e) => e.status === filters.status);
  }

  return result;
}

export function computeOverallMetrics(events: InterviewEvent[]): OverallMetrics {
  const companies = getCompaniesFromEvents(events);
  const now = new Date();

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(now.getDate() - 7);

  const oneMonthAgo = new Date();
  oneMonthAgo.setDate(now.getDate() - 30);

  const activeCompaniesCount = new Set(events.map((e) => e.companyId)).size;
  const activeRolesCount = new Set(events.map((e) => e.roleId)).size;

  const interviewsThisWeek = events.filter((e) => new Date(e.start) >= oneWeekAgo).length;
  const interviewsThisMonth = events.filter((e) => new Date(e.start) >= oneMonthAgo).length;

  const finalOrOnsiteCount = events.filter(
    (e) => e.interviewType === "final" || e.interviewType === "onsite"
  ).length;

  const offersCount = events.filter((e) => e.outcome === "offer").length;

  // Average duration
  const totalDuration = events.reduce((acc, e) => acc + (e.durationMinutes || 0), 0);
  const avgDurationMinutes = events.length > 0 ? Math.round(totalDuration / events.length) : 0;

  // Days between rounds calculation
  const gaps: number[] = events
    .map((e) => e.daysSincePreviousRound)
    .filter((g): g is number => g !== null && g !== undefined);
  const avgDaysBetweenRounds =
    gaps.length > 0
      ? Number((gaps.reduce((a, b) => a + b, 0) / gaps.length).toFixed(1))
      : 0;

  // Stalled companies (>7 days without activity and no upcoming interview)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(now.getDate() - 7);

  const stalledCompaniesCount = companies.filter((comp) => {
    const allCompEvents = events.filter((e) => e.companyId === comp.id);
    const hasUpcoming = allCompEvents.some((e) => new Date(e.start) > now);
    if (hasUpcoming) return false;

    const latestEvent = allCompEvents.reduce((latest, curr) => {
      const currStart = new Date(curr.start);
      return !latest || currStart > new Date(latest.start) ? curr : latest;
    }, null as InterviewEvent | null);

    return latestEvent ? new Date(latestEvent.start) < sevenDaysAgo : false;
  }).length;

  // Conversion rate (offers + advanced / total completed)
  const completedEvents = events.filter((e) => e.status === "completed");
  const successfulEvents = completedEvents.filter(
    (e) => e.outcome === "advanced" || e.outcome === "offer"
  );
  const interviewConversionRate =
    completedEvents.length > 0
      ? Math.round((successfulEvents.length / completedEvents.length) * 100)
      : 0;

  const lastPast = events
    .map((e) => new Date(e.start).getTime())
    .filter((t) => t <= now.getTime())
    .sort((a, b) => b - a)[0];
  const daysSinceLastInterview =
    lastPast != null ? Math.max(0, Math.round((now.getTime() - lastPast) / (1000 * 60 * 60 * 24))) : 0;

  return {
    activeCompanies: activeCompaniesCount,
    activeRoles: activeRolesCount,
    interviewsThisWeek,
    finalOrOnsiteCount,
    offersCount,
    interviewConversionRate,
    avgDurationMinutes,
    avgDaysBetweenRounds,
    interviewsThisMonth,
    stalledCompaniesCount,
    daysSinceLastInterview,
  };
}
