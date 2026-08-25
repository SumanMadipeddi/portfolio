export type InterviewType =
  | "recruiter"
  | "hiring_manager"
  | "technical"
  | "coding"
  | "system_design"
  | "behavioral"
  | "take_home"
  | "onsite"
  | "final"
  | "reference"
  | "other";

export type InterviewStatus = "upcoming" | "completed" | "cancelled";

export type InterviewOutcome = "advanced" | "rejected" | "waiting" | "offer" | "unknown";

export interface InterviewerInfo {
  name: string;
  email: string;
  title?: string;
  avatar?: string;
  linkedInUrl?: string;
}

export interface InterviewEvent {
  id: string;
  calendarEventId: string;
  company: string;
  companyId: string;
  companyDomain?: string | null;
  companyWebsite?: string | null;
  companyLogo?: string | null;

  role: string;
  roleId: string;
  roleCategory: string; // e.g. "AI Engineer", "Backend / Infrastructure", "Applied Scientist"

  interviewType: InterviewType;
  stage: number; // e.g. 1, 2, 3, 4
  totalStages: number; // e.g. 4

  interviewers: InterviewerInfo[];
  interviewerNames: string[];
  interviewerEmails: string[];

  start: Date | string;
  end: Date | string;
  durationMinutes: number;

  meetingUrl?: string | null;
  location?: string | null;

  status: InterviewStatus;
  outcome: InterviewOutcome;

  confidenceScore?: number; // 0.0 to 1.0
  notes?: string;
  calendarDescription?: string;

  daysSincePreviousRound?: number | null;
  previousRoundId?: string | null;
  nextRoundId?: string | null;
  preparationScore?: number; // 1-10 rating
}

export interface ApplicationRole {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  roleCategory: string;
  jobUrl?: string;
  location?: string;
  appliedDate: string;
  currentStage: string;
  status: "active" | "offer" | "rejected" | "stalled" | "withdrawn";
  interviews: InterviewEvent[];
}

export interface Company {
  id: string;
  name: string;
  domain?: string;
  website?: string;
  logo?: string;
  linkedInUrl?: string;
  careersUrl?: string;
  location?: string;
  roles: ApplicationRole[];
}

export interface FilterOptions {
  dateRange: "7d" | "30d" | "90d" | "6m" | "all";
  companyId: string;
  roleId: string;
  category: string;
  stage: string;
  status: "all" | "active" | "completed";
  searchQuery?: string;
}

export interface RoleCategoryAnalytics {
  category: string;
  applicationsCount: number;
  recruiterCount: number;
  technicalCount: number;
  finalCount: number;
  offerCount: number;
  appToScreenRate: number;
  screenToTechRate: number;
  techToFinalRate: number;
  finalToOfferRate: number;
}

export interface OverallMetrics {
  activeCompanies: number;
  activeRoles: number;
  interviewsThisWeek: number;
  finalOrOnsiteCount: number;
  offersCount: number;
  interviewConversionRate: number;
  avgDurationMinutes: number;
  avgDaysBetweenRounds: number;
  interviewsThisMonth: number;
  stalledCompaniesCount: number;
  daysSinceLastInterview: number;
}
