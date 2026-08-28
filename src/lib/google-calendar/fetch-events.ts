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

// 1-Click Secret iCal (.ics) Link Sync (Zero Google Cloud Console / OAuth required!)
export async function fetchGoogleCalendarICalEvents(icalUrl: string): Promise<InterviewEvent[]> {
  try {
    const response = await fetch(icalUrl);
    if (!response.ok) throw new Error(`iCal Fetch error ${response.status}`);
    const text = await response.text();

    const veventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;
    let match;
    const items: RawGoogleCalendarEvent[] = [];

    let count = 0;
    while ((match = veventRegex.exec(text)) !== null) {
      const block = match[1];
      const summaryMatch = block.match(/SUMMARY:(.*)/);
      const descMatch = block.match(/DESCRIPTION:(.*)/);
      const startMatch = block.match(/DTSTART[:;](.*)/);
      const endMatch = block.match(/DTEND[:;](.*)/);

      items.push({
        id: `ical-${count++}`,
        summary: summaryMatch ? summaryMatch[1].trim() : "Interview Event",
        description: descMatch ? descMatch[1].trim() : "",
        start: { dateTime: new Date().toISOString() },
        end: { dateTime: new Date().toISOString() },
      });
    }

    const fetchedEvents: InterviewEvent[] = [];
    items.forEach((item, idx) => {
      const normalized = normalizeGoogleCalendarEvent(item, (idx % 4) + 1, 4);
      if (normalized) fetchedEvents.push(normalized);
    });

    if (fetchedEvents.length > 0) {
      saveInterviewEvents(fetchedEvents);
      return fetchedEvents;
    }
    return getInterviewEvents();
  } catch (err) {
    console.error("Failed to parse iCal link:", err);
    throw err;
  }
}
