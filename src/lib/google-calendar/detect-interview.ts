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
  "onsite", "on-site", "final round", "screen", "intro call", "candidate",
  "assessment", "system design", "behavioral", "pair programming",
  "take home", "debrief", "reference", "debrief", "culture fit"
];

const KNOWN_DOMAINS_TO_IGNORE = [
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "google.com",
  "calendar.google.com", "zoom.us", "meet.google.com"
];

const ROLE_CATEGORIES_KEYWORDS: Record<string, string[]> = {
  "AI Engineer": ["ai engineer", "generative ai", "llm", "ai agent", "ai developer"],
  "Applied AI Engineer": ["applied ai", "applied ml", "ai solutions"],
  "Applied Scientist": ["applied scientist", "research scientist", "ml scientist"],
  "Founding Engineer": ["founding engineer", "founding developer", "lead engineer"],
  "Software Engineer - AI": ["software engineer", "swe - ai", "ai fullstack"],
  "Solutions Engineer": ["solutions engineer", "sales engineer", "forward deployed"],
  "Backend / Infrastructure": ["backend", "infrastructure", "distributed systems", "platform engineer", "site reliability"],
  "Full-Stack Engineer": ["fullstack", "full stack", "frontend", "react", "next.js"],
};

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

  // Classify interview type
  let interviewType: InterviewType = "other";
  if (fullText.includes("recruiter") || fullText.includes("screen") || fullText.includes("intro call")) {
    interviewType = "recruiter";
  } else if (fullText.includes("hiring manager") || fullText.includes("hm round")) {
    interviewType = "hiring_manager";
  } else if (fullText.includes("coding") || fullText.includes("pair programming")) {
    interviewType = "coding";
  } else if (fullText.includes("system design") || fullText.includes("architecture")) {
    interviewType = "system_design";
  } else if (fullText.includes("behavioral") || fullText.includes("culture")) {
    interviewType = "behavioral";
  } else if (fullText.includes("take home") || fullText.includes("assessment")) {
    interviewType = "take_home";
  } else if (fullText.includes("onsite") || fullText.includes("on-site")) {
    interviewType = "onsite";
  } else if (fullText.includes("final round") || fullText.includes("final")) {
    interviewType = "final";
  } else if (fullText.includes("reference")) {
    interviewType = "reference";
  } else if (fullText.includes("technical")) {
    interviewType = "technical";
  }

  // Classify role category
  let roleCategory = "Software Engineer - AI";
  for (const [cat, keywords] of Object.entries(ROLE_CATEGORIES_KEYWORDS)) {
    if (keywords.some((kw) => fullText.includes(kw))) {
      roleCategory = cat;
      break;
    }
  }

  // Extract Company Name from summary if present (e.g. "Amazon - Technical Interview")
  let company = companyFromDomain;
  if (summary.includes(" - ")) {
    const parts = summary.split(" - ");
    if (parts[0]) company = parts[0].trim();
  } else if (summary.includes(" with ")) {
    const parts = summary.split(" with ");
    if (parts[1]) company = parts[1].trim();
  }

  // Extract Role Title
  let role = `${roleCategory}`;
  if (summary.toLowerCase().includes("engineer")) {
    role = summary.split("interview")[0].trim();
  }

  return {
    isInterview,
    confidenceScore: Number(confidenceScore.toFixed(2)),
    company: company || "Target Company",
    role: role || "Senior AI Engineer",
    interviewType,
    roleCategory,
  };
}
