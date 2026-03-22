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

const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const PROVIDER_TIMEOUT_MS = Number(process.env.LLM_TIMEOUT_MS || 12000);
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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

  const contents = [...history, { role: "user" as const, content: message }].map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  let response: Response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents,
          generationConfig: {
            maxOutputTokens: 400,
            temperature: 0.6,
          },
        }),
      },
    );
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new Error(`Gemini timed out after ${PROVIDER_TIMEOUT_MS}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini error ${response.status}: ${body.slice(0, 240)}`);
  }

  const data = await response.json();
  const reply = data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text || "").join("\n").trim();
  if (!reply) throw new Error("Gemini returned an empty response.");

  return { reply, provider: "gemini", model };
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
    if (!geminiKey) {
      res.status(500).json({
        error: "No Gemini API key configured. Add GEMINI_API_KEY in environment variables.",
      });
      return;
    }
    const result = await callGemini({
      apiKey: geminiKey,
      model: DEFAULT_GEMINI_MODEL,
      systemPrompt: mergedSystemPrompt,
      history,
      message,
    });
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Failed to process chat request." });
  }
}
