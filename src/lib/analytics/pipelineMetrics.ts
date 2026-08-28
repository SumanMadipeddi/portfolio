import { InterviewEvent } from "@/types/interview";

export interface JourneyChartPoint {
  id: string;
  eventId: string;
  dateStr: string; // e.g. "Aug 10"
  fullDateStr: string; // e.g. "Aug 10, 2026"
  timestamp: number;
  stageName: string;
  stageLevel: number; // 1 to 5
  company: string;
  companyId: string;
  role: string;
  roleId: string;
  roleCategory: string;
  companyLogo?: string | null;
  interviewType: string;
  status: "upcoming" | "completed" | "cancelled";
  outcome: string;
  event: InterviewEvent;
  clusterCount?: number;
  clusterEvents?: InterviewEvent[];
}

export function recalculateStagesForEvents(events: InterviewEvent[]): InterviewEvent[] {
  const grouped = new Map<string, InterviewEvent[]>();

  events.forEach((evt) => {
    const key = `${evt.companyId}__${evt.roleId}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(evt);
  });

  const updatedEvents: InterviewEvent[] = [];

  grouped.forEach((series) => {
    series.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    const total = series.length;

    series.forEach((evt, idx) => {
      const prevEvt = idx > 0 ? series[idx - 1] : null;
      let daysSincePrev: number | null = null;
      if (prevEvt) {
        const ms = new Date(evt.start).getTime() - new Date(prevEvt.start).getTime();
        daysSincePrev = Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
      }

      updatedEvents.push({
        ...evt,
        stage: idx + 1,
        totalStages: total,
        daysSincePreviousRound: daysSincePrev,
      });
    });
  });

  return updatedEvents;
}

export function mapStageToLevel(interviewType: string, outcome?: string): { level: number; name: string } {
  if (outcome === "offer") return { level: 5, name: "Offer" };
  if (
    interviewType === "final" ||
    interviewType === "onsite" ||
    interviewType === "reference"
  ) {
    return { level: 4, name: "Final / Onsite" };
  }
  if (
    interviewType === "technical" ||
    interviewType === "coding" ||
    interviewType === "system_design" ||
    interviewType === "take_home"
  ) {
    return { level: 3, name: "Technical" };
  }
  if (
    interviewType === "recruiter" ||
    interviewType === "hiring_manager" ||
    interviewType === "other"
  ) {
    return { level: 2, name: "Recruiter" };
  }
  return { level: 1, name: "Applied" };
}

export function buildJourneyChartData(events: InterviewEvent[]): JourneyChartPoint[] {
  const recalculated = recalculateStagesForEvents(events);
  const sorted = recalculated.sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  const points: JourneyChartPoint[] = sorted.map((evt) => {
    const startDate = new Date(evt.start);
    const dateStr = startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const fullDateStr = startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const stageInfo = mapStageToLevel(evt.interviewType, evt.outcome);

    return {
      id: evt.id,
      eventId: evt.id,
      dateStr,
      fullDateStr,
      timestamp: startDate.getTime(),
      stageName: stageInfo.name,
      stageLevel: stageInfo.level,
      company: evt.company,
      companyId: evt.companyId,
      role: evt.role,
      roleId: evt.roleId,
      roleCategory: evt.roleCategory,
      companyLogo: evt.companyLogo,
      interviewType: evt.interviewType,
      status: evt.status,
      outcome: evt.outcome,
      event: evt,
    };
  });

  return points;
}

export function groupPointsByCompanyAndRole(points: JourneyChartPoint[]): Record<string, JourneyChartPoint[]> {
  const grouped: Record<string, JourneyChartPoint[]> = {};

  points.forEach((p) => {
    const key = `${p.companyId}__${p.roleId}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(p);
  });

  return grouped;
}
