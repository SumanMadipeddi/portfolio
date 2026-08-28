import { InterviewEvent, InterviewerInfo } from "@/types/interview";
import { detectInterview } from "./detect-interview";

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
}

const CANDIDATE_EMAILS = [
  "madipeddisuman@gmail.com",
  "madipeddisuman",
  "suman.madipeddi",
  "sumanmadipeddi",
  "suman"
];

export function normalizeGoogleCalendarEvent(
  raw: RawGoogleCalendarEvent,
  stageIndex = 1,
  totalStagesCount = 4
): InterviewEvent | null {
  const organizerEmail = raw.organizer?.email;
  const attendeeEmails = (raw.attendees || []).map((a) => a.email);

  const detection = detectInterview({
    summary: raw.summary,
    description: raw.description,
    organizerEmail,
    attendeeEmails,
  });

  if (!detection.isInterview) {
    return null;
  }

  const startTimeStr = raw.start?.dateTime || raw.start?.date || new Date().toISOString();
  const endTimeStr = raw.end?.dateTime || raw.end?.date || new Date().toISOString();
  const start = new Date(startTimeStr);
  const end = new Date(endTimeStr);

  const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60)) || 45;

  const company = detection.company || "Target Company";

  // Filter out candidate's own email to extract real external interviewers
  const externalAttendees = (raw.attendees || []).filter((a) => {
    if (!a.email) return false;
    const emailLower = a.email.toLowerCase();
    if (emailLower.includes("calendar.google.com")) return false;
    return !CANDIDATE_EMAILS.some((cand) => emailLower.includes(cand));
  });

  let interviewers: InterviewerInfo[] = externalAttendees.map((a) => ({
    name: a.displayName || a.email.split("@")[0],
    email: a.email,
    title: `${company} Panelist`,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(a.displayName || a.email)}`,
  }));

  // Fallback if no external attendee email is present
  if (interviewers.length === 0) {
    interviewers = [
      {
        name: `${company} Interview Team`,
        email: `careers@${company.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
        title: "Hiring Panel",
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(company)}`,
      },
    ];
  }

  const companySlug = company.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const role = detection.role || "Full-Stack AI Engineer";
  const roleSlug = role.toLowerCase().replace(/[^a-z0-9]/g, "-");

  return {
    id: `evt-${raw.id}`,
    calendarEventId: raw.id,
    company,
    companyId: `comp-${companySlug}`,
    companyDomain: `${companySlug}.com`,
    companyWebsite: `https://${companySlug}.com`,
    companyLogo: `https://logo.clearbit.com/${companySlug}.com`,

    role,
    roleId: `role-${companySlug}-${roleSlug}`,
    roleCategory: detection.roleCategory,

    interviewType: detection.interviewType,
    stage: stageIndex,
    totalStages: totalStagesCount,

    interviewers,
    interviewerNames: interviewers.map((i) => i.name),
    interviewerEmails: interviewers.map((i) => i.email),

    start,
    end,
    durationMinutes,

    meetingUrl: raw.hangoutLink || raw.location || "https://meet.google.com",
    location: raw.location || "Remote (Google Meet)",

    status: start > new Date() ? "upcoming" : "completed",
    outcome: start > new Date() ? "waiting" : "advanced",

    confidenceScore: detection.confidenceScore,
    calendarDescription: raw.description || "No calendar description provided.",
    notes: "Prepared background questions on architecture and systems design.",
  };
}
