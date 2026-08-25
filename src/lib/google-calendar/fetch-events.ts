import { normalizeGoogleCalendarEvent, RawGoogleCalendarEvent } from "./normalize-event";
import { InterviewEvent } from "@/types/interview";

export interface GoogleAuthConfig {
  clientId?: string;
  scopes: string[];
}

export const GOOGLE_CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events.readonly",
];

export async function fetchGoogleCalendarEvents(accessToken: string): Promise<InterviewEvent[]> {
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
      throw new Error(`Google Calendar API Error ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    const items: RawGoogleCalendarEvent[] = data.items || [];

    const normalizedEvents: InterviewEvent[] = [];
    items.forEach((item, index) => {
      const normalized = normalizeGoogleCalendarEvent(item, (index % 4) + 1, 4);
      if (normalized) {
        normalizedEvents.push(normalized);
      }
    });

    return normalizedEvents;
  } catch (error) {
    console.error("Failed to fetch Google Calendar events:", error);
    throw error;
  }
}
