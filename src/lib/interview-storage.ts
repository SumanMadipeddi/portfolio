import { InterviewEvent, Company, FilterOptions, OverallMetrics } from "@/types/interview";

const STORAGE_KEY = "interview_intelligence_events_aug2024_v2";

const INITIAL_MOCK_EVENTS: InterviewEvent[] = [
  // ----------------------------------------------------
  // 1. OpenAI - Founding AI Engineer (Aug 2024 - Sep 2024)
  // ----------------------------------------------------
  {
    id: "evt-oai-aug24-1",
    calendarEventId: "gcal-oai-101",
    company: "OpenAI",
    companyId: "comp-openai",
    companyDomain: "openai.com",
    companyWebsite: "https://openai.com",
    companyLogo: "https://logo.clearbit.com/openai.com",
    role: "Founding AI Engineer",
    roleId: "role-openai-founding-ai",
    roleCategory: "Founding Engineer",
    interviewType: "recruiter",
    stage: 1,
    totalStages: 4,
    interviewers: [
      { name: "Elena Rostova", email: "elena@openai.com", title: "Head of AI Talent", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80" }
    ],
    interviewerNames: ["Elena Rostova"],
    interviewerEmails: ["elena@openai.com"],
    start: "2024-08-15T16:00:00Z",
    end: "2024-08-15T16:45:00Z",
    durationMinutes: 45,
    meetingUrl: "https://meet.google.com/oai-screen-aug24",
    location: "Google Meet",
    status: "completed",
    outcome: "advanced",
    confidenceScore: 0.99,
    notes: "Discussed Agentic harness design, multi-agent evaluation frameworks, and context caching.",
    calendarDescription: "OpenAI Initial Recruiter Screen for Agent Infrastructure.",
    daysSincePreviousRound: null,
    preparationScore: 9,
  },
  {
    id: "evt-oai-aug24-2",
    calendarEventId: "gcal-oai-102",
    company: "OpenAI",
    companyId: "comp-openai",
    companyDomain: "openai.com",
    companyWebsite: "https://openai.com",
    companyLogo: "https://logo.clearbit.com/openai.com",
    role: "Founding AI Engineer",
    roleId: "role-openai-founding-ai",
    roleCategory: "Founding Engineer",
    interviewType: "technical",
    stage: 2,
    totalStages: 4,
    interviewers: [
      { name: "Ilya S.", email: "ilya@openai.com", title: "Research Lead", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80" }
    ],
    interviewerNames: ["Ilya S."],
    interviewerEmails: ["ilya@openai.com"],
    start: "2024-08-25T17:00:00Z",
    end: "2024-08-25T18:15:00Z",
    durationMinutes: 75,
    meetingUrl: "https://meet.google.com/oai-tech-eval-aug24",
    location: "Google Meet",
    status: "completed",
    outcome: "advanced",
    confidenceScore: 0.98,
    notes: "Deep dive into KV-cache routing, streaming token latency, and sub-500ms voice pipeline design.",
    calendarDescription: "OpenAI Technical Deep Dive & Systems Evaluation.",
    daysSincePreviousRound: 10,
    preparationScore: 10,
  },
  {
    id: "evt-oai-sep24-3",
    calendarEventId: "gcal-oai-103",
    company: "OpenAI",
    companyId: "comp-openai",
    companyDomain: "openai.com",
    companyWebsite: "https://openai.com",
    companyLogo: "https://logo.clearbit.com/openai.com",
    role: "Founding AI Engineer",
    roleId: "role-openai-founding-ai",
    roleCategory: "Founding Engineer",
    interviewType: "onsite",
    stage: 3,
    totalStages: 4,
    interviewers: [
      { name: "Greg Brockman", email: "greg@openai.com", title: "President", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80" }
    ],
    interviewerNames: ["Greg Brockman"],
    interviewerEmails: ["greg@openai.com"],
    start: "2024-09-10T15:00:00Z",
    end: "2024-09-10T17:30:00Z",
    durationMinutes: 150,
    meetingUrl: "https://meet.google.com/oai-onsite-sep24",
    location: "San Francisco HQ",
    status: "completed",
    outcome: "offer",
    confidenceScore: 0.99,
    notes: "Executive alignment on agent harness layer and foundation model developer ecosystem.",
    calendarDescription: "OpenAI Onsite Loop & Leadership Conversation.",
    daysSincePreviousRound: 16,
    preparationScore: 10,
  },

  // ----------------------------------------------------
  // 2. Anthropic - Software Engineer - AI (Nov 2024 - Dec 2024)
  // ----------------------------------------------------
  {
    id: "evt-ant-nov24-1",
    calendarEventId: "gcal-ant-201",
    company: "Anthropic",
    companyId: "comp-anthropic",
    companyDomain: "anthropic.com",
    companyWebsite: "https://anthropic.com",
    companyLogo: "https://logo.clearbit.com/anthropic.com",
    role: "Software Engineer - AI",
    roleId: "role-anthropic-swe-ai",
    roleCategory: "Software Engineer - AI",
    interviewType: "recruiter",
    stage: 1,
    totalStages: 4,
    interviewers: [
      { name: "Claire Dupont", email: "cdupont@anthropic.com", title: "Technical Recruiter" }
    ],
    interviewerNames: ["Claire Dupont"],
    interviewerEmails: ["cdupont@anthropic.com"],
    start: "2024-11-04T11:00:00Z",
    end: "2024-11-04T11:45:00Z",
    durationMinutes: 45,
    meetingUrl: "https://meet.google.com/anthropic-screen",
    location: "Google Meet",
    status: "completed",
    outcome: "advanced",
    confidenceScore: 0.97,
    notes: "Discussed Claude 3.5 Sonnet tool-use agent evaluation and safety guardrails.",
    calendarDescription: "Anthropic Recruiter Introductory Screen.",
    daysSincePreviousRound: null,
    preparationScore: 9,
  },
  {
    id: "evt-ant-nov24-2",
    calendarEventId: "gcal-ant-202",
    company: "Anthropic",
    companyId: "comp-anthropic",
    companyDomain: "anthropic.com",
    companyWebsite: "https://anthropic.com",
    companyLogo: "https://logo.clearbit.com/anthropic.com",
    role: "Software Engineer - AI",
    roleId: "role-anthropic-swe-ai",
    roleCategory: "Software Engineer - AI",
    interviewType: "technical",
    stage: 2,
    totalStages: 4,
    interviewers: [
      { name: "Darius Vance", email: "dvance@anthropic.com", title: "Staff Agent Infrastructure Engineer" }
    ],
    interviewerNames: ["Darius Vance"],
    interviewerEmails: ["dvance@anthropic.com"],
    start: "2024-11-18T14:00:00Z",
    end: "2024-11-18T15:00:00Z",
    durationMinutes: 60,
    meetingUrl: "https://meet.google.com/anthropic-tech",
    location: "Google Meet",
    status: "completed",
    outcome: "advanced",
    confidenceScore: 0.98,
    notes: "Pair coding exercise on synthetic benchmark evaluation pipelines.",
    calendarDescription: "Anthropic Technical Pair Coding Round.",
    daysSincePreviousRound: 14,
    preparationScore: 9,
  },

  // ----------------------------------------------------
  // 3. Amazon AWS - Applied Scientist / AI Engineer (Jan 2025 - Feb 2025)
  // ----------------------------------------------------
  {
    id: "evt-amz-jan25-1",
    calendarEventId: "gcal-amz-301",
    company: "Amazon",
    companyId: "comp-amazon",
    companyDomain: "amazon.com",
    companyWebsite: "https://amazon.com",
    companyLogo: "https://logo.clearbit.com/amazon.com",
    role: "AI Engineer",
    roleId: "role-amazon-ai-eng",
    roleCategory: "AI Engineer",
    interviewType: "recruiter",
    stage: 1,
    totalStages: 4,
    interviewers: [
      { name: "Sarah Jenkins", email: "sarahj@amazon.com", title: "AWS AI Recruiting Lead" }
    ],
    interviewerNames: ["Sarah Jenkins"],
    interviewerEmails: ["sarahj@amazon.com"],
    start: "2025-01-12T10:00:00Z",
    end: "2025-01-12T10:45:00Z",
    durationMinutes: 45,
    meetingUrl: "https://chime.aws/amazon-jan25-screen",
    location: "Amazon Chime",
    status: "completed",
    outcome: "advanced",
    confidenceScore: 0.96,
    notes: "Bedrock generative AI applications and multi-modal pipeline scaling.",
    calendarDescription: "Amazon AWS AI Engineer Screen.",
    daysSincePreviousRound: null,
    preparationScore: 8,
  },
  {
    id: "evt-amz-feb25-2",
    calendarEventId: "gcal-amz-302",
    company: "Amazon",
    companyId: "comp-amazon",
    companyDomain: "amazon.com",
    companyWebsite: "https://amazon.com",
    companyLogo: "https://logo.clearbit.com/amazon.com",
    role: "Applied Scientist",
    roleId: "role-amazon-appsci",
    roleCategory: "Applied Scientist",
    interviewType: "technical",
    stage: 2,
    totalStages: 4,
    interviewers: [
      { name: "David Chen", email: "dchen@amazon.com", title: "Principal Applied Scientist" }
    ],
    interviewerNames: ["David Chen"],
    interviewerEmails: ["dchen@amazon.com"],
    start: "2025-02-03T14:00:00Z",
    end: "2025-02-03T15:00:00Z",
    durationMinutes: 60,
    meetingUrl: "https://chime.aws/amazon-feb25-tech",
    location: "Amazon Chime",
    status: "completed",
    outcome: "advanced",
    confidenceScore: 0.95,
    notes: "GraphRAG knowledge graph extraction and vector index optimization.",
    calendarDescription: "Amazon Applied Scientist Technical Deep Dive.",
    daysSincePreviousRound: 22,
    preparationScore: 9,
  },

  // ----------------------------------------------------
  // 4. Kinetic Systems - Full-Stack AI Engineer (May 2025 - Jun 2025)
  // ----------------------------------------------------
  {
    id: "evt-ks-may25-1",
    calendarEventId: "gcal-ks-401",
    company: "Kinetic Systems",
    companyId: "comp-kinetic-systems",
    companyDomain: "kineticsystems.io",
    companyWebsite: "https://kineticsystems.io",
    companyLogo: "https://logo.clearbit.com/kineticsystems.io",
    role: "Full-Stack AI Engineer",
    roleId: "role-kinetic-fullstack",
    roleCategory: "Full-Stack Engineer",
    interviewType: "recruiter",
    stage: 1,
    totalStages: 4,
    interviewers: [
      { name: "Amanda Hayes", email: "amanda@kineticsystems.io", title: "Head of People" }
    ],
    interviewerNames: ["Amanda Hayes"],
    interviewerEmails: ["amanda@kineticsystems.io"],
    start: "2025-05-14T10:30:00Z",
    end: "2025-05-14T11:15:00Z",
    durationMinutes: 45,
    meetingUrl: "https://meet.google.com/ks-screen-may25",
    location: "Google Meet",
    status: "completed",
    outcome: "advanced",
    confidenceScore: 0.94,
    notes: "Intro call for real-time websocket AI voice interface platform.",
    calendarDescription: "Kinetic Systems Recruiter Chat.",
    daysSincePreviousRound: null,
    preparationScore: 9,
  },
  {
    id: "evt-ks-jun25-2",
    calendarEventId: "gcal-ks-402",
    company: "Kinetic Systems",
    companyId: "comp-kinetic-systems",
    companyDomain: "kineticsystems.io",
    companyWebsite: "https://kineticsystems.io",
    companyLogo: "https://logo.clearbit.com/kineticsystems.io",
    role: "Full-Stack AI Engineer",
    roleId: "role-kinetic-fullstack",
    roleCategory: "Full-Stack Engineer",
    interviewType: "technical",
    stage: 2,
    totalStages: 4,
    interviewers: [
      { name: "Michael Wornow", email: "michael@kineticsystems.io", title: "CEO & Co-founder", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80" }
    ],
    interviewerNames: ["Michael Wornow"],
    interviewerEmails: ["michael@kineticsystems.io"],
    start: "2025-06-02T10:30:00Z",
    end: "2025-06-02T11:30:00Z",
    durationMinutes: 60,
    meetingUrl: "https://meet.google.com/ks-tech-jun25",
    location: "Google Meet",
    status: "completed",
    outcome: "advanced",
    confidenceScore: 0.96,
    notes: "Pair coding local-first audio pipeline and Next.js state sync.",
    calendarDescription: "Coding Round with CEO Michael Wornow.",
    daysSincePreviousRound: 19,
    preparationScore: 9,
  },

  // ----------------------------------------------------
  // 5. Google DeepMind - Software Engineer - AI (Jan 2026 - Mar 2026)
  // ----------------------------------------------------
  {
    id: "evt-goog-jan26-1",
    calendarEventId: "gcal-goog-501",
    company: "Google",
    companyId: "comp-google",
    companyDomain: "google.com",
    companyWebsite: "https://google.com",
    companyLogo: "https://logo.clearbit.com/google.com",
    role: "Software Engineer - AI",
    roleId: "role-google-swe-ai",
    roleCategory: "Software Engineer - AI",
    interviewType: "recruiter",
    stage: 1,
    totalStages: 4,
    interviewers: [
      { name: "Rachel Vance", email: "rachelv@google.com", title: "Google DeepMind Recruiter" }
    ],
    interviewerNames: ["Rachel Vance"],
    interviewerEmails: ["rachelv@google.com"],
    start: "2026-01-20T15:00:00Z",
    end: "2026-01-20T15:30:00Z",
    durationMinutes: 30,
    meetingUrl: "https://meet.google.com/goog-jan26-screen",
    location: "Google Meet",
    status: "completed",
    outcome: "advanced",
    confidenceScore: 0.99,
    notes: "Discussion regarding Gemini 1.5 Pro agentic harnesses and clinical AI research.",
    calendarDescription: "Google DeepMind Engineering Screen.",
    daysSincePreviousRound: null,
    preparationScore: 9,
  },
  {
    id: "evt-goog-feb26-2",
    calendarEventId: "gcal-goog-502",
    company: "Google",
    companyId: "comp-google",
    companyDomain: "google.com",
    companyWebsite: "https://google.com",
    companyLogo: "https://logo.clearbit.com/google.com",
    role: "Software Engineer - AI",
    roleId: "role-google-swe-ai",
    roleCategory: "Software Engineer - AI",
    interviewType: "technical",
    stage: 2,
    totalStages: 4,
    interviewers: [
      { name: "Brian K.", email: "briank@google.com", title: "Staff Software Engineer" }
    ],
    interviewerNames: ["Brian K."],
    interviewerEmails: ["briank@google.com"],
    start: "2026-02-12T16:00:00Z",
    end: "2026-02-12T16:45:00Z",
    durationMinutes: 45,
    meetingUrl: "https://meet.google.com/goog-feb26-tech",
    location: "Google Meet",
    status: "completed",
    outcome: "advanced",
    confidenceScore: 0.98,
    notes: "Dynamic programming and graph traversal algorithms for memory management.",
    calendarDescription: "Google Technical Screen.",
    daysSincePreviousRound: 23,
    preparationScore: 9,
  },

  // ----------------------------------------------------
  // 6. Recent Active & Upcoming Rounds (July 2026 - Aug 2026)
  // ----------------------------------------------------
  {
    id: "evt-snowflake-jul26-1",
    calendarEventId: "gcal-snow-601",
    company: "Snowflake",
    companyId: "comp-snowflake",
    companyDomain: "snowflake.com",
    companyWebsite: "https://snowflake.com",
    companyLogo: "https://logo.clearbit.com/snowflake.com",
    role: "Backend / Infrastructure Engineer",
    roleId: "role-snowflake-backend",
    roleCategory: "Backend / Infrastructure",
    interviewType: "technical",
    stage: 2,
    totalStages: 4,
    interviewers: [
      { name: "Marcus Thorne", email: "mthorne@snowflake.com", title: "Principal Infra Engineer" }
    ],
    interviewerNames: ["Marcus Thorne"],
    interviewerEmails: ["mthorne@snowflake.com"],
    start: "2026-07-28T14:00:00Z",
    end: "2026-07-28T15:00:00Z",
    durationMinutes: 60,
    meetingUrl: "https://meet.google.com/snowflake-tech-jul26",
    location: "Google Meet",
    status: "completed",
    outcome: "advanced",
    confidenceScore: 0.97,
    notes: "Distributed vector index storage and multi-tenant reconciliation engine.",
    calendarDescription: "Snowflake Infrastructure Deep Dive.",
    daysSincePreviousRound: 7,
    preparationScore: 9,
  },
  {
    id: "evt-ks-aug26-3",
    calendarEventId: "gcal-ks-602",
    company: "Kinetic Systems",
    companyId: "comp-kinetic-systems",
    companyDomain: "kineticsystems.io",
    companyWebsite: "https://kineticsystems.io",
    companyLogo: "https://logo.clearbit.com/kineticsystems.io",
    role: "Full-Stack AI Engineer",
    roleId: "role-kinetic-fullstack",
    roleCategory: "Full-Stack Engineer",
    interviewType: "technical",
    stage: 3,
    totalStages: 4,
    interviewers: [
      { name: "Michael Wornow", email: "michael@kineticsystems.io", title: "CEO", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80" },
      { name: "John Mathe", email: "john@kineticsystems.io", title: "Staff Architect" }
    ],
    interviewerNames: ["Michael Wornow", "John Mathe"],
    interviewerEmails: ["michael@kineticsystems.io", "john@kineticsystems.io"],
    start: "2026-08-28T10:30:00Z",
    end: "2026-08-28T11:30:00Z",
    durationMinutes: 60,
    meetingUrl: "https://meet.google.com/ks-aug26-round3",
    location: "Google Meet",
    status: "upcoming",
    outcome: "waiting",
    confidenceScore: 0.97,
    notes: "Round 3 of 4: Deep dive into real-time voice latency and state management.",
    calendarDescription: "Kinetic Systems Technical Round 3 of 4.",
    daysSincePreviousRound: 14,
    preparationScore: 9,
  },
  {
    id: "evt-goog-sep26-3",
    calendarEventId: "gcal-goog-603",
    company: "Google",
    companyId: "comp-google",
    companyDomain: "google.com",
    companyWebsite: "https://google.com",
    companyLogo: "https://logo.clearbit.com/google.com",
    role: "Software Engineer - AI",
    roleId: "role-google-swe-ai",
    roleCategory: "Software Engineer - AI",
    interviewType: "onsite",
    stage: 3,
    totalStages: 4,
    interviewers: [
      { name: "Suresh P.", email: "sureshp@google.com", title: "Engineering Manager" }
    ],
    interviewerNames: ["Suresh P."],
    interviewerEmails: ["sureshp@google.com"],
    start: "2026-09-02T14:00:00Z",
    end: "2026-09-02T18:00:00Z",
    durationMinutes: 240,
    meetingUrl: "https://meet.google.com/goog-onsite-sep26",
    location: "Virtual Onsite",
    status: "upcoming",
    outcome: "waiting",
    confidenceScore: 0.99,
    notes: "Scheduled full day virtual onsite for Google DeepMind.",
    calendarDescription: "Google DeepMind Virtual Onsite Loop.",
    daysSincePreviousRound: 21,
    preparationScore: 9,
  },
];

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

  // Persist initial authentic August 2024 - August 2026 dataset
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
