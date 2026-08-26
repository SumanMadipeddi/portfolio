import { normalizeGoogleCalendarEvent, RawGoogleCalendarEvent } from "./normalize-event";
import { InterviewEvent } from "@/types/interview";
import { saveInterviewEvents, getInterviewEvents } from "@/lib/interview-storage";

export async function fetchLiveGoogleCalendarEvents(accessToken: string): Promise<InterviewEvent[]> {
  try {
    const response = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&maxResults=250",
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
    const items: RawGoogleCalendarEvent[] = data.items || [];

    const fetchedEvents: InterviewEvent[] = [];
    items.forEach((item, index) => {
      const normalized = normalizeGoogleCalendarEvent(item, (index % 4) + 1, 4);
      if (normalized) {
        fetchedEvents.push(normalized);
      }
    });

    if (fetchedEvents.length > 0) {
      // Merge with existing events
      const existing = getInterviewEvents();
      const existingMap = new Map(existing.map((e) => [e.calendarEventId, e]));

      fetchedEvents.forEach((fe) => {
        existingMap.set(fe.calendarEventId, fe);
      });

      const merged = Array.from(existingMap.values());
      saveInterviewEvents(merged);
      return merged;
    }

    return getInterviewEvents();
  } catch (error) {
    console.error("Failed to fetch live Google Calendar events:", error);
    throw error;
  }
}
