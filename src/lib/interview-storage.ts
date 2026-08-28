import { InterviewEvent, Company, FilterOptions, OverallMetrics } from "@/types/interview";

const STORAGE_KEY = "interview_intelligence_events_live_v4";

// Set initial dataset to empty so only real live synced Google Calendar events are rendered
const INITIAL_MOCK_EVENTS: InterviewEvent[] = [];

export function getInterviewEvents(): InterviewEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.map((e: any) => ({
        ...e,
        start: new Date(e.start),
        end: new Date(e.end),
      }));
    }
  } catch (err) {
    console.error("Failed to read stored interviews:", err);
  }

  saveInterviewEvents(INITIAL_MOCK_EVENTS);
  return INITIAL_MOCK_EVENTS;
}

export function saveInterviewEvents(events: InterviewEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (err) {
    console.error("Failed to save interviews:", err);
  }
}

export function updateInterviewEvent(updated: InterviewEvent): InterviewEvent[] {
  const current = getInterviewEvents();
  const index = current.findIndex((e) => e.id === updated.id);
  if (index !== -1) {
    current[index] = updated;
  } else {
    current.push(updated);
  }
  saveInterviewEvents(current);
  return current;
}

export function clearInterviewEvents(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem("interview_intelligence_events_aug2024_v2");
  localStorage.removeItem("interview_intelligence_events_v1");
}

export function getCompaniesFromEvents(events: InterviewEvent[]): Company[] {
  const companyMap = new Map<string, Company>();

  events.forEach((evt) => {
    let company = companyMap.get(evt.companyId);
    if (!company) {
      company = {
        id: evt.companyId,
        name: evt.company,
        domain: evt.companyDomain || `${evt.company.toLowerCase()}.com`,
        website: evt.companyWebsite || `https://${evt.company.toLowerCase()}.com`,
        logo: evt.companyLogo || `https://logo.clearbit.com/${evt.company.toLowerCase()}.com`,
        roles: [],
      };
      companyMap.set(evt.companyId, company);
    }

    let role = company.roles.find((r) => r.id === evt.roleId);
    if (!role) {
      role = {
        id: evt.roleId,
        companyId: evt.companyId,
        companyName: evt.company,
        title: evt.role,
        roleCategory: evt.roleCategory,
        appliedDate: typeof evt.start === "string" ? evt.start : evt.start.toISOString().split("T")[0],
        currentStage: `Stage ${evt.stage} of ${evt.totalStages}`,
        status: evt.outcome === "offer" ? "offer" : evt.outcome === "rejected" ? "rejected" : "active",
        interviews: [],
      };
      company.roles.push(role);
    }

    role.interviews.push(evt);
  });

  return Array.from(companyMap.values());
}
