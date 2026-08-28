export const INTERVIEW_TIMELINE_START = new Date(Date.UTC(2024, 7, 1));

export function getCalendarFetchWindow() {
  const timeMin = new Date(INTERVIEW_TIMELINE_START);
  const timeMax = new Date();
  timeMax.setFullYear(timeMax.getFullYear() + 1);
  return { timeMin, timeMax };
}

export function getFilterRangeStart(dateRange: "7d" | "30d" | "90d" | "6m" | "all"): Date {
  if (dateRange === "all") return new Date(INTERVIEW_TIMELINE_START);

  const start = new Date();
  if (dateRange === "7d") start.setDate(start.getDate() - 7);
  else if (dateRange === "30d") start.setDate(start.getDate() - 30);
  else if (dateRange === "90d") start.setDate(start.getDate() - 90);
  else start.setMonth(start.getMonth() - 6);

  return start.getTime() < INTERVIEW_TIMELINE_START.getTime()
    ? new Date(INTERVIEW_TIMELINE_START)
    : start;
}

export function isInInterviewWindow(start: Date | string): boolean {
  return new Date(start).getTime() >= INTERVIEW_TIMELINE_START.getTime();
}
