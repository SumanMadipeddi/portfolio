import { normalizeGoogleCalendarEvent, RawGoogleCalendarEvent } from "./normalize-event";
import { InterviewEvent } from "@/types/interview";
import { saveInterviewEvents, getInterviewEvents } from "@/lib/interview-storage";
import { getCalendarFetchWindow, isInInterviewWindow } from "@/lib/interview-window";
import { recalculateStagesForEvents } from "@/lib/analytics/pipelineMetrics";

export async function fetchLiveGoogleCalendarEvents(accessToken: string): Promise<InterviewEvent[]> {
  const { timeMin, timeMax } = getCalendarFetchWindow();

  try {
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

    const fetchedEvents: InterviewEvent[] = [];
    items.forEach((item) => {
      const normalized = normalizeGoogleCalendarEvent(item);
      if (normalized && isInInterviewWindow(normalized.start)) {
        fetchedEvents.push(normalized);
      }
    });

    if (fetchedEvents.length > 0) {
      const existing = getInterviewEvents();
      const existingMap = new Map(existing.map((e) => [e.calendarEventId, e]));

      fetchedEvents.forEach((fe) => {
        const prev = existingMap.get(fe.calendarEventId);
        existingMap.set(
          fe.calendarEventId,
          prev
            ? {
                ...fe,
                notes: prev.notes || fe.notes,
                preparationScore: prev.preparationScore ?? fe.preparationScore,
                outcome:
                  prev.outcome === "offer" || prev.outcome === "rejected" ? prev.outcome : fe.outcome,
              }
            : fe
        );
      });

      const merged = recalculateStagesForEvents(
        Array.from(existingMap.values()).filter((event) => isInInterviewWindow(event.start))
      );
      saveInterviewEvents(merged);
      return merged;
    }

    return getInterviewEvents();
  } catch (error) {
    console.error("Failed to fetch live Google Calendar events:", error);
    throw error;
  }
}

function parseIcalDate(value: string | undefined): string {
  if (!value) return new Date().toISOString();
  const cleaned = value.replace(/VALUE=DATE:/i, "").replace(/TZID=[^:]+:/i, "").trim();
  if (/^\d{8}T\d{6}Z?$/.test(cleaned)) {
    const y = cleaned.slice(0, 4);
    const m = cleaned.slice(4, 6);
    const d = cleaned.slice(6, 8);
    const hh = cleaned.slice(9, 11);
    const mm = cleaned.slice(11, 13);
    const ss = cleaned.slice(13, 15);
    const iso = `${y}-${m}-${d}T${hh}:${mm}:${ss}${cleaned.endsWith("Z") ? "Z" : ""}`;
    const parsed = new Date(iso);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }
  const parsed = new Date(cleaned);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  return new Date().toISOString();
}

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
      const descMatch = block.match(/DESCRIPTION:([\s\S]*?)(?=\n[A-Z-]+:|$)/);
      const startMatch = block.match(/DTSTART[^:]*:(.*)/);
      const endMatch = block.match(/DTEND[^:]*:(.*)/);
      const locMatch = block.match(/LOCATION:(.*)/);

      items.push({
        id: `ical-${count++}`,
        summary: summaryMatch ? summaryMatch[1].trim() : "Interview Event",
        description: descMatch ? descMatch[1].replace(/\\n/g, "\n").trim() : "",
        start: { dateTime: parseIcalDate(startMatch?.[1]) },
        end: { dateTime: parseIcalDate(endMatch?.[1]) },
        location: locMatch ? locMatch[1].trim() : undefined,
      });
    }

    const fetchedEvents: InterviewEvent[] = [];
    items.forEach((item) => {
      const normalized = normalizeGoogleCalendarEvent(item);
      if (normalized && isInInterviewWindow(normalized.start)) fetchedEvents.push(normalized);
    });

    if (fetchedEvents.length > 0) {
      const staged = recalculateStagesForEvents(fetchedEvents);
      saveInterviewEvents(staged);
      return staged;
    }
    return getInterviewEvents();
  } catch (err) {
    console.error("Failed to parse iCal link:", err);
    throw err;
  }
}
