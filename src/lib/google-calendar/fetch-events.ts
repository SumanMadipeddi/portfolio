import { normalizeGoogleCalendarEvent, RawGoogleCalendarEvent } from "./normalize-event";
import { InterviewEvent } from "@/types/interview";
import { saveInterviewEvents, getInterviewEvents } from "@/lib/interview-storage";
import { getCalendarFetchWindow, isInInterviewWindow } from "@/lib/interview-window";
import { recalculateStagesForEvents } from "@/lib/analytics/pipelineMetrics";

function mergeLocalEdits(fresh: InterviewEvent[], previous: InterviewEvent[]): InterviewEvent[] {
  const previousMap = new Map(previous.map((event) => [event.calendarEventId, event]));
  return fresh.map((event) => {
    const prev = previousMap.get(event.calendarEventId);
    if (!prev) return event;
    return {
      ...event,
      notes: prev.notes || event.notes,
      preparationScore: prev.preparationScore ?? event.preparationScore,
      outcome: prev.outcome === "offer" || prev.outcome === "rejected" ? prev.outcome : event.outcome,
    };
  });
}

export async function fetchLiveGoogleCalendarEvents(accessToken: string): Promise<InterviewEvent[]> {
  const { timeMin, timeMax } = getCalendarFetchWindow();
  const items: RawGoogleCalendarEvent[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      singleEvents: "true",
      orderBy: "startTime",
      maxResults: "2500",
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      conferenceDataVersion: "1",
    });
    if (pageToken) params.set("pageToken", pageToken);

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google Calendar API error ${response.status}: ${errText.slice(0, 200)}`);
    }

    const data = await response.json();
    items.push(...(data.items || []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  const fetchedEvents = items
    .map((item) => normalizeGoogleCalendarEvent(item))
    .filter((event): event is InterviewEvent => Boolean(event && isInInterviewWindow(event.start)));

  const merged = recalculateStagesForEvents(mergeLocalEdits(fetchedEvents, getInterviewEvents()));
  saveInterviewEvents(merged);
  return merged;
}
