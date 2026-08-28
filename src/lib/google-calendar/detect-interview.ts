import { InterviewType } from "@/types/interview";

export interface DetectionResult {
  isInterview: boolean;
  confidenceScore: number;
  company: string;
  companyDomain: string | null;
  role: string;
  roleCategory: string;
  interviewType: InterviewType;
}

const PERSONAL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "proton.me",
  "protonmail.com",
  "aol.com",
]);

const IGNORE_DOMAINS = new Set([
  ...PERSONAL_DOMAINS,
  "google.com",
  "calendar.google.com",
  "zoom.us",
  "meet.google.com",
  "teams.microsoft.com",
  "greenhouse.io",
  "lever.co",
  "ashbyhq.com",
  "workable.com",
  "smartrecruiters.com",
  "icims.com",
  "myworkday.com",
  "okta.com",
  "docusign.net",
  "calendly.com",
  "linkedin.com",
]);

const SKIP_SUBDOMAINS = new Set([
  "mail",
  "email",
  "careers",
  "jobs",
  "team",
  "recruiting",
  "talent",
  "calendar",
  "meet",
  "go",
  "info",
  "noreply",
  "no-reply",
]);

const CANDIDATE_TOKENS = ["suman", "madipeddi", "madipeddisuman"];

const STRONG_INTERVIEW_SIGNALS = [
  "interview",
  "recruiter",
  "hiring manager",
  "hiring team",
  "talent partner",
  "talent acquisition",
  "onsite",
  "on-site",
  "on site",
  "coding interview",
  "tech screen",
  "technical screen",
  "phone screen",
  "recruiter screen",
  "system design",
  "take home",
  "take-home",
  "debrief",
  "superday",
  "super day",
  "hirevue",
  "karat",
  "codesignal",
  "loop interview",
  "final round",
  "onsite loop",
];

const NOT_INTERVIEW_SIGNALS = [
  "standup",
  "stand-up",
  "sprint planning",
  "birthday",
  "dentist",
  "doctor",
  "flight",
  "uber",
  "lyft",
  "haircut",
  "1:1 with",
  "one on one",
];

const ROLE_LABEL = /(?:role|position|job title|job|title|applying for|interview for)\s*[:\-–]\s*([^\n|<]+)/i;

const ROLE_PHRASE =
  /\b((?:founding|staff|senior|sr\.?|principal|lead|head of|member of technical staff|mts)\s+)?(?:applied\s+)?(?:ai|ml|machine learning|software|backend|frontend|full[-\s]?stack|infra(?:structure)?|research|solutions|forward[-\s]?deployed|product|data|security|platform|mobile|ios|android|site reliability|sre)?\s*(?:engineer|engineering|scientist|researcher|architect|manager|designer|intern|swe|sde)(?:\s*[,/–-]\s*[A-Za-z][^|\n]{0,40})?/gi;

const JUNK_TITLE =
  /^(interview|intro|intro call|phone screen|recruiter screen|tech screen|technical screen|coding|onsite|on-site|final|final round|round \d+|r\d+|meet|sync|chat|call|conversation|discussion|debrief|hm|hiring manager|google meet|zoom)$/i;

function decodeCalendarText(value: string): string {
  return value
    .replace(/\\n/g, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCaseBrand(slug: string): string {
  const special: Record<string, string> = {
    openai: "OpenAI",
    anthropic: "Anthropic",
    nvidia: "NVIDIA",
    ibm: "IBM",
    aws: "AWS",
    gcp: "GCP",
  };
  if (special[slug]) return special[slug];
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function companyFromEmail(email: string): { name: string; domain: string } | null {
  const domain = email.split("@")[1]?.toLowerCase().trim();
  if (!domain || IGNORE_DOMAINS.has(domain)) return null;

  const parts = domain.split(".");
  if (parts.length < 2) return null;

  let brand = parts[0];
  if (SKIP_SUBDOMAINS.has(brand) && parts.length >= 3) {
    brand = parts[1];
  }

  const root = parts.slice(-2).join(".");
  if (IGNORE_DOMAINS.has(root) || IGNORE_DOMAINS.has(brand + ".com")) return null;
  if (brand.length < 2) return null;

  return { name: titleCaseBrand(brand), domain };
}

function pickCompanyFromEmails(emails: string[]): { name: string; domain: string } | null {
  const counts = new Map<string, { name: string; domain: string; count: number }>();
  for (const email of emails) {
    if (!email) continue;
    const lower = email.toLowerCase();
    if (CANDIDATE_TOKENS.some((token) => lower.includes(token))) continue;
    const parsed = companyFromEmail(email);
    if (!parsed) continue;
    const current = counts.get(parsed.domain);
    if (current) current.count += 1;
    else counts.set(parsed.domain, { ...parsed, count: 1 });
  }
  let best: { name: string; domain: string; count: number } | null = null;
  for (const value of counts.values()) {
    if (!best || value.count > best.count) best = value;
  }
  return best;
}

function stripCandidateAndCompany(text: string, company: string | null): string {
  let next = text;
  for (const token of CANDIDATE_TOKENS) {
    next = next.replace(new RegExp(token, "ig"), " ");
  }
  if (company) {
    next = next.replace(new RegExp(company.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "ig"), " ");
  }
  return next.replace(/\s+/g, " ").trim();
}

function looksLikeRole(segment: string): boolean {
  const value = segment.trim();
  if (value.length < 4 || value.length > 90) return false;
  if (JUNK_TITLE.test(value)) return false;
  return /\b(engineer|engineering|scientist|researcher|architect|manager|designer|intern|founder|founding|staff|mts|swe|sde|pm)\b/i.test(
    value
  );
}

function cleanRole(value: string, company: string | null): string {
  return stripCandidateAndCompany(value, company)
    .replace(/\b(round|r)\s*\d+\b/gi, "")
    .replace(/\b(interview|screen|onsite|on-site|final|intro|call)\b/gi, "")
    .replace(/[|<>/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractRole(summary: string, description: string, company: string | null): string | null {
  const labeled = `${summary}\n${description}`.match(ROLE_LABEL);
  if (labeled?.[1]) {
    const cleaned = cleanRole(labeled[1], company);
    if (cleaned.length >= 3) return cleaned;
  }

  const segments = summary.split(/\s*(?:\||–|—|<>|\/)\s*/).map((part) => part.trim()).filter(Boolean);
  const roleSegments = segments
    .map((part) => cleanRole(part, company))
    .filter((part) => looksLikeRole(part));
  if (roleSegments.length > 0) {
    return roleSegments.sort((a, b) => b.length - a.length)[0];
  }

  const haystack = `${summary} ${description}`;
  const phrases: string[] = [];
  let match: RegExpExecArray | null;
  const matcher = new RegExp(ROLE_PHRASE.source, ROLE_PHRASE.flags);
  while ((match = matcher.exec(haystack)) !== null) {
    const phrase = cleanRole(match[0], company);
    if (phrase.length >= 6 && looksLikeRole(phrase)) phrases.push(phrase);
  }
  if (phrases.length > 0) {
    return phrases.sort((a, b) => b.length - a.length)[0];
  }

  const remainder = cleanRole(summary, company);
  if (looksLikeRole(remainder)) return remainder;
  return null;
}

function extractCompanyFromTitle(summary: string): string | null {
  const atMatch = summary.match(/@\s*([A-Za-z0-9&.\- ]{2,40})/);
  if (atMatch?.[1] && !JUNK_TITLE.test(atMatch[1].trim())) return atMatch[1].trim();

  const parenMatch = summary.match(/\(([A-Za-z0-9&.\- ]{2,40})\)/);
  if (parenMatch?.[1] && !looksLikeRole(parenMatch[1]) && !JUNK_TITLE.test(parenMatch[1])) {
    return parenMatch[1].trim();
  }

  const pipeParts = summary.split("|").map((part) => part.trim()).filter(Boolean);
  if (pipeParts.length >= 2) {
    const last = pipeParts[pipeParts.length - 1];
    if (!looksLikeRole(last) && !JUNK_TITLE.test(last) && last.split(" ").length <= 4) return last;
  }

  return null;
}

function classifyInterviewType(text: string): InterviewType {
  if (/\b(coding|leetcode|pair programming|codesignal|karat|hackerrank)\b/.test(text)) return "coding";
  if (/\b(system design|architecture)\b/.test(text)) return "system_design";
  if (/\b(take[-\s]?home|hirevue|assessment)\b/.test(text)) return "take_home";
  if (/\b(onsite|on-site|on site|loop|superday|super day)\b/.test(text)) return "onsite";
  if (/\b(final|offer)\b/.test(text)) return "final";
  if (/\b(hiring manager|\bhm\b|hm screen)\b/.test(text)) return "hiring_manager";
  if (/\b(technical|tech screen|vo interview|virtual onsite)\b/.test(text)) return "technical";
  if (/\b(behavioral|values|culture)\b/.test(text)) return "behavioral";
  if (/\b(recruiter|sourcer|talent|intro|phone screen|recruiter screen)\b/.test(text)) return "recruiter";
  return "other";
}

function classifyCategory(role: string): string {
  const text = role.toLowerCase();
  if (text.includes("founding")) return "Founding";
  if (text.includes("mts") || text.includes("member of technical staff")) return "MTS";
  if (text.includes("scientist") || text.includes("research")) return "Science / Research";
  if (text.includes("applied ai") || text.includes("applied ml")) return "Applied AI";
  if (text.includes("solutions") || text.includes("forward deployed") || text.includes("fwd")) return "Solutions";
  if (text.includes("backend") || text.includes("infra") || text.includes("sre") || text.includes("platform")) {
    return "Backend / Infra";
  }
  if (text.includes("full") && text.includes("stack")) return "Full-Stack";
  if (/\b(ai|ml|llm|machine learning)\b/.test(text)) return "AI / ML";
  if (text.includes("product") || /\bpm\b/.test(text)) return "Product";
  if (text.includes("engineer") || text.includes("swe") || text.includes("sde")) return "Engineering";
  return "Other";
}

export function detectInterview(event: {
  summary?: string;
  description?: string;
  organizerEmail?: string;
  attendeeEmails?: string[];
  hasVideoMeeting?: boolean;
  location?: string | null;
}): DetectionResult {
  const summary = decodeCalendarText(event.summary || "");
  const description = decodeCalendarText(event.description || "");
  const fullText = `${summary} ${description} ${event.location || ""}`.toLowerCase();

  const emails = [...(event.attendeeEmails || []), event.organizerEmail || ""].filter(Boolean);
  const fromEmail = pickCompanyFromEmails(emails);
  const fromTitle = extractCompanyFromTitle(summary);
  const company = fromEmail?.name || fromTitle || "Unknown company";
  const companyDomain = fromEmail?.domain || null;

  const hasVideoLink =
    Boolean(event.hasVideoMeeting) ||
    /meet\.google\.com|zoom\.us|teams\.microsoft|webex\.com/.test(fullText);
  const locationText = (event.location || "").trim();
  const hasPhysicalLocation = Boolean(
    locationText &&
      !/^(https?:\/\/|www\.)|meet\.google|zoom\.us|teams\.microsoft|webex\.com/i.test(locationText) &&
      !/^remote(\s*\((?:video|virtual|online)\))?$/i.test(locationText)
  );
  const hasMeetingPlace = hasVideoLink || hasPhysicalLocation;

  const strongHits = STRONG_INTERVIEW_SIGNALS.filter((signal) => fullText.includes(signal)).length;
  const rejected = NOT_INTERVIEW_SIGNALS.some((signal) => fullText.includes(signal));
  const isInterview =
    !rejected &&
    (strongHits > 0 ||
      Boolean(
        fromEmail &&
          (hasMeetingPlace ||
            /\b(screen|round|loop|hm|recruiter|intro|interview)\b/.test(fullText))
      ));

  const extractedRole = extractRole(summary, description, company === "Unknown company" ? null : company);
  const role = extractedRole || (company === "Unknown company" ? summary.slice(0, 80) || "Untitled interview" : `${company} interview`);
  const interviewType = classifyInterviewType(fullText);
  const roleCategory = classifyCategory(extractedRole || "");

  const confidenceScore = Math.min(
    1,
    strongHits * 0.25 + (fromEmail ? 0.35 : 0) + (extractedRole ? 0.3 : 0) + (hasMeetingPlace ? 0.1 : 0)
  );

  return {
    isInterview,
    confidenceScore: Number(confidenceScore.toFixed(2)),
    company,
    companyDomain,
    role,
    roleCategory,
    interviewType,
  };
}
