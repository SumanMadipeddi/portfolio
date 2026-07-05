export type Theme = "light" | "dark";
export type ChatRole = "user" | "assistant";

export type ChatItem = {
  role: ChatRole;
  content: string;
};

export type Project = {
  name: string;
  desc: string;
  stack: string[];
  image: string;
  githubLink: string;
  demoLink: string;
};

export type TerminalSkillLine = {
  prompt: ">" | "#";
  text: string;
};

export interface Contribution {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ApiResponse {
  total: Record<string, number>;
  contributions: Contribution[];
}
