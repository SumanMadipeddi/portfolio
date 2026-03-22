import fs from "node:fs";
import path from "node:path";

interface VercelRequest {
  method?: string;
  body?: any;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
  setHeader: (name: string, value: string) => void;
  end: () => void;
}

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const DEFAULT_SYSTEM_PROMPT =
  "You are Suman Madipeddi's AI assistant on his portfolio website. Be concise, warm, and truthful.";

const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const DEFAULT_CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-3-5-sonnet-20241022";
const DATA_FILE = path.join(process.cwd(), "data", "ai-data.txt");

const setCors = (res: VercelResponse) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
};

const normalizeHistory = (history: any): ChatMessage[] => {
  if (!Array.isArray(history)) return [];

  return history
    .map((item) => ({ role: item?.role, content: String(item?.content || "").trim() }))
    .filter((m) => (m.role === "user" || m.role === "assistant") && m.content.length > 0)
    .slice(-16);
};

const loadDataContext = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) return "";
    return fs.readFileSync(DATA_FILE, "utf8").trim();
  } catch {
    return "";
  }
};

const callGemini = async (params: {
  apiKey: string;
  model: string;
  systemPrompt: string;
  history: ChatMessage[];
  message: string;
}) => {
  const { apiKey, model, systemPrompt, history, message } = params;

  const contents = [...history, { role: "user" as const, content: message }].map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents,
        generationConfig: {
          maxOutputTokens: 600,
          temperature: 0.6,
        },
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini error ${response.status}: ${body.slice(0, 240)}`);
  }

  const data = await response.json();
  const reply = data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text || "").join("\n").trim();
  if (!reply) throw new Error("Gemini returned an empty response.");

  return { reply, provider: "gemini", model };
};

const callClaude = async (params: {
  apiKey: string;
  model: string;
  systemPrompt: string;
  history: ChatMessage[];
  message: string;
}) => {
  const { apiKey, model, systemPrompt, history, message } = params;

  const messages = [...history, { role: "user" as const, content: message }].map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 600,
      temperature: 0.6,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Claude error ${response.status}: ${body.slice(0, 240)}`);
  }

  const data = await response.json();
  const reply = data?.content?.find((c: any) => c?.type === "text")?.text?.trim();
  if (!reply) throw new Error("Claude returned an empty response.");

  return { reply, provider: "claude", model };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const message = String(req.body?.message || "").trim();
    const systemPrompt = String(req.body?.systemPrompt || DEFAULT_SYSTEM_PROMPT).trim();
    const history = normalizeHistory(req.body?.history);
    const dataContext = loadDataContext();
    const mergedSystemPrompt = [DEFAULT_SYSTEM_PROMPT, systemPrompt, dataContext]
      .filter(Boolean)
      .join("\n\n");

    if (!message) {
      res.status(400).json({ error: "Message is required." });
      return;
    }

    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
    const claudeKey = process.env.CLAUDE_API_KEY || "";

    if (!geminiKey && !claudeKey) {
      res.status(500).json({
        error: "No LLM API keys configured. Add GEMINI_API_KEY and/or CLAUDE_API_KEY in environment variables.",
      });
      return;
    }

    const primary = (process.env.LLM_PRIMARY || "gemini").toLowerCase();

    const attempts: Array<() => Promise<{ reply: string; provider: string; model: string }>> =
      primary === "claude"
        ? [
            () => {
              if (!claudeKey) throw new Error("Claude key missing");
              return callClaude({ apiKey: claudeKey, model: DEFAULT_CLAUDE_MODEL, systemPrompt: mergedSystemPrompt, history, message });
            },
            () => {
              if (!geminiKey) throw new Error("Gemini key missing");
              return callGemini({ apiKey: geminiKey, model: DEFAULT_GEMINI_MODEL, systemPrompt: mergedSystemPrompt, history, message });
            },
          ]
        : [
            () => {
              if (!geminiKey) throw new Error("Gemini key missing");
              return callGemini({ apiKey: geminiKey, model: DEFAULT_GEMINI_MODEL, systemPrompt: mergedSystemPrompt, history, message });
            },
            () => {
              if (!claudeKey) throw new Error("Claude key missing");
              return callClaude({ apiKey: claudeKey, model: DEFAULT_CLAUDE_MODEL, systemPrompt: mergedSystemPrompt, history, message });
            },
          ];

    let lastError = "Unknown LLM error";

    for (const attempt of attempts) {
      try {
        const result = await attempt();
        res.status(200).json(result);
        return;
      } catch (error: any) {
        lastError = error?.message || String(error);
      }
    }

    res.status(502).json({ error: `All configured providers failed. Last error: ${lastError}` });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Failed to process chat request." });
  }
}
