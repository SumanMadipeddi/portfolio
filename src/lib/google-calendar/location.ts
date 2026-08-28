import { InterviewEvent } from "@/types/interview";

const VIDEO_OR_URL =
  /^(https?:\/\/|www\.)|meet\.google\.com|zoom\.us|teams\.microsoft|webex\.com|whereby\.com/i;

function decodeLocation(value: string): string {
  return value
    .replace(/\\,/g, ",")
    .replace(/\\n/g, ", ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function stripCalendarHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|div|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function isPlace(value: string): boolean {
  if (!value || VIDEO_OR_URL.test(value)) return false;
  if (/^remote(\s*\((?:video|virtual|online)\))?$/i.test(value)) return false;
  return value.length > 1;
}

export function resolveCalendarLocation(input: {
  location?: string | null;
  description?: string | null;
}): string | null {
  const loc = input.location ? decodeLocation(input.location) : "";
  if (isPlace(loc)) return loc;

  const plain = stripCalendarHtml(input.description || "");
  const labeled = plain.match(/(?:^|\n)\s*(?:location|where|address|onsite)\s*[:\-]\s*(.+)/i);
  if (labeled?.[1]) {
    const value = decodeLocation(labeled[1].split("\n")[0]);
    if (isPlace(value)) return value;
  }

  return null;
}

export function getInterviewDisplayLocation(event: InterviewEvent): string | null {
  return resolveCalendarLocation({
    location: event.location,
    description: event.calendarDescription,
  });
}
