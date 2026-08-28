import { InterviewType } from "@/types/interview";

export interface DetectionResult {
  isInterview: boolean;
  confidenceScore: number; // 0.0 to 1.0
  company: string | null;
  role: string | null;
  interviewType: InterviewType;
  roleCategory: string;
}

const INTERVIEW_KEYWORDS = [
  "interview", "technical", "recruiter", "hiring manager", "coding",
  "onsite", "on-site", "final round", "screen", "intro call", "intro",
  "candidate", "assessment", "system design", "behavioral", "pair programming",
  "take home", "debrief", "reference", "culture fit", "chat", "sync", "meet",
  "conversation", "discussion", "call", "connect", "mts", "staff"
];

const KNOWN_DOMAINS_TO_IGNORE = [
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "google.com",
  "calendar.google.com", "zoom.us", "meet.google.com"
];

export function detectInterview(event: {
  summary?: string;
  description?: string;
  organizerEmail?: string;
  attendeeEmails?: string[];
}): DetectionResult {
  const summary = (event.summary || "").toLowerCase();
  const description = (event.description || "").toLowerCase();
  const fullText = `${summary} ${description}`;

  let matchedKeywordCount = 0;
  for (const keyword of INTERVIEW_KEYWORDS) {
    if (fullText.includes(keyword)) {
      matchedKeywordCount++;
    }
  }

  // Check external domain among attendees
  let companyFromDomain: string | null = null;
  if (event.attendeeEmails && event.attendeeEmails.length > 0) {
    for (const email of event.attendeeEmails) {
      const domain = email.split("@")[1]?.toLowerCase();
      if (domain && !KNOWN_DOMAINS_TO_IGNORE.includes(domain)) {
        const namePart = domain.split(".")[0];
        if (namePart && namePart.length > 2) {
          companyFromDomain = namePart.charAt(0).toUpperCase() + namePart.slice(1);
          break;
        }
      }
    }
  }

  const isInterview = matchedKeywordCount > 0 || Boolean(companyFromDomain);
  const confidenceScore = Math.min(
    1.0,
    (matchedKeywordCount * 0.3) + (companyFromDomain ? 0.4 : 0.0)
  );

  // Smart stage classification
  let interviewType: InterviewType = "recruiter";
  if (
    fullText.includes("final") ||
    fullText.includes("onsite") ||
    fullText.includes("on-site") ||
    fullText.includes("loop") ||
    fullText.includes("debrief")
  ) {
    interviewType = "final";
  } else if (
    fullText.includes("technical") ||
    fullText.includes("coding") ||
    fullText.includes("system design") ||
    fullText.includes("pair") ||
    fullText.includes("take home") ||
    fullText.includes("assessment") ||
    fullText.includes("architecture")
  ) {
    interviewType = "technical";
  } else if (fullText.includes("hiring manager") || fullText.includes("hm")) {
    interviewType = "hiring_manager";
  } else if (
    fullText.includes("recruiter") ||
    fullText.includes("screen") ||
    fullText.includes("intro") ||
    fullText.includes("chat") ||
    fullText.includes("sync") ||
    fullText.includes("call")
  ) {
    interviewType = "recruiter";
  }

  // Extract authentic Role Title & Category directly from calendar event text
  let roleCategory = "Software Engineer - AI";
  if (fullText.includes("founding")) {
    roleCategory = "Founding AI Engineer";
  } else if (fullText.includes("mts") || fullText.includes("member of technical staff")) {
    roleCategory = "MTS (Member of Technical Staff)";
  } else if (fullText.includes("applied scientist") || fullText.includes("research scientist")) {
    roleCategory = "Applied Scientist";
  } else if (fullText.includes("applied ai") || fullText.includes("applied ml")) {
    roleCategory = "Applied AI Engineer";
  } else if (fullText.includes("solutions") || fullText.includes("forward deployed")) {
    roleCategory = "Solutions Engineer";
  } else if (fullText.includes("backend") || fullText.includes("infrastructure") || fullText.includes("infra")) {
    roleCategory = "Backend / Infrastructure";
  } else if (fullText.includes("fullstack") || fullText.includes("full stack") || fullText.includes("full-stack")) {
    roleCategory = "Full-Stack Engineer";
  } else if (fullText.includes("ai engineer") || fullText.includes("llm")) {
    roleCategory = "AI Engineer";
  } else if (fullText.includes("software engineer") || fullText.includes("swe")) {
    roleCategory = "Software Engineer - AI";
  } else if (fullText.includes("product") || fullText.includes("pm")) {
    roleCategory = "Product Lead";
  }

  // Clean company name extraction
  let company = companyFromDomain;
  if (summary.includes(" - ")) {
    const parts = summary.split(" - ");
    if (parts[0]) company = parts[0].trim();
  } else if (summary.includes(" with ")) {
    const parts = summary.split(" with ");
    if (parts[1]) company = parts[1].trim();
  } else if (summary.includes(" <> ")) {
    const parts = summary.split(" <> ");
    if (parts[0]) company = parts[0].trim();
  } else if (!company) {
    company = summary.split(" ")[0] || "Target Company";
  }

  if (company) {
    company = company.charAt(0).toUpperCase() + company.slice(1);
  }

  return {
    isInterview,
    confidenceScore: Number(confidenceScore.toFixed(2)),
    company: company || "Target Company",
    role: roleCategory,
    interviewType,
    roleCategory,
  };
}
