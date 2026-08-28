import { InterviewEvent, InterviewerInfo } from "@/types/interview";
import { detectInterview } from "./detect-interview";
import { resolveCalendarLocation } from "./location";

export interface RawGoogleCalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  attendees?: Array<{ email: string; displayName?: string; responseStatus?: string }>;
  organizer?: { email?: string; displayName?: string };
  location?: string;
  hangoutLink?: string;
  htmlLink?: string;
  status?: string;
  conferenceData?: {
    entryPoints?: Array<{ entryPointType?: string; uri?: string }>;
  };
}

const CANDIDATE_EMAILS = [
  "madipeddisuman@gmail.com",
  "madipeddisuman",
  "suman.madipeddi",
  "sumanmadipeddi",
];

function slugify(value: string): string {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug || "unknown";
}

function extractMeetingUrl(raw: RawGoogleCalendarEvent): string | null {
  if (raw.hangoutLink) return raw.hangoutLink;

  const videoEntry = raw.conferenceData?.entryPoints?.find(
    (entry) =>
      entry.uri &&
      (entry.entryPointType === "video" || /meet\.google|zoom\.us|teams\.microsoft/i.test(entry.uri))
  );
  if (videoEntry?.uri) return videoEntry.uri;

  const location = raw.location?.trim() || "";
  if (/^https?:\/\//i.test(location)) return location;

  const description = raw.description || "";
  const meetMatch = description.match(/https?:\/\/meet\.google\.com\/[a-z0-9-]+/i);
  if (meetMatch) return meetMatch[0];
  const zoomMatch = description.match(/https?:\/\/[\w.-]*zoom\.us\/[^\s<>"]+/i);
  if (zoomMatch) return zoomMatch[0].replace(/[.,;)]+$/, "");
  const teamsMatch = description.match(/https?:\/\/teams\.microsoft\.com\/[^\s<>"]+/i);
  if (teamsMatch) return teamsMatch[0].replace(/[.,;)]+$/, "");

  return null;
}

export function normalizeGoogleCalendarEvent(raw: RawGoogleCalendarEvent): InterviewEvent | null {
  if (raw.status === "cancelled") return null;

  const organizerEmail = raw.organizer?.email;
  const attendeeEmails = (raw.attendees || []).map((a) => a.email);
  const meetingUrl = extractMeetingUrl(raw);

  const location = resolveCalendarLocation({
    location: raw.location,
    description: raw.description,
  });

  const detection = detectInterview({
    summary: raw.summary,
    description: raw.description,
    organizerEmail,
    attendeeEmails,
    hasVideoMeeting: Boolean(meetingUrl),
    location: location || raw.location || null,
  });

  if (!detection.isInterview) return null;

  const startTimeStr = raw.start?.dateTime || raw.start?.date || new Date().toISOString();
  const endTimeStr = raw.end?.dateTime || raw.end?.date || new Date().toISOString();
  const start = new Date(startTimeStr);
  const end = new Date(endTimeStr);
  if (Number.isNaN(start.getTime())) return null;

  const durationMinutes = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60)) || 45);
  const company = detection.company;
  const domain = detection.companyDomain;

  const interviewers: InterviewerInfo[] = (raw.attendees || [])
    .filter((a) => {
      if (!a.email) return false;
      const emailLower = a.email.toLowerCase();
      if (emailLower.includes("calendar.google.com")) return false;
      return !CANDIDATE_EMAILS.some((cand) => emailLower.includes(cand));
    })
    .map((a) => ({
      name: a.displayName || a.email.split("@")[0],
      email: a.email,
      title: a.email.split("@")[1] || undefined,
    }));

  const companySlug = slugify(company);
  const role = detection.role;
  const roleSlug = slugify(role);

  return {
    id: `evt-${raw.id}`,
    calendarEventId: raw.id,
    company,
    companyId: `comp-${companySlug}`,
    companyDomain: domain,
    companyWebsite: domain ? `https://${domain}` : null,
    companyLogo: domain ? `https://logo.clearbit.com/${domain}` : null,

    role,
    roleId: `role-${companySlug}-${roleSlug}`,
    roleCategory: detection.roleCategory,

    interviewType: detection.interviewType,
    stage: 1,
    totalStages: 1,

    interviewers,
    interviewerNames: interviewers.map((i) => i.name),
    interviewerEmails: interviewers.map((i) => i.email),

    start,
    end,
    durationMinutes,

    meetingUrl,
    location,

    status: start > new Date() ? "upcoming" : "completed",
    outcome: start > new Date() ? "waiting" : "unknown",

    confidenceScore: detection.confidenceScore,
    calendarDescription: raw.description || "",
    notes: "",
  };
}
