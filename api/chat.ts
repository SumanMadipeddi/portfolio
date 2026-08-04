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
const OUTPUT_STYLE_PROMPT =
  "Formatting rules: keep answers complete (never cut mid-sentence). When user asks for N points/strengths/steps, return exactly N numbered lines (1., 2., 3...) with one point per line. Avoid markdown bold unless explicitly requested.";

const NVIDIA_API_BASE = process.env.NVIDIA_API_BASE || "https://integrate.api.nvidia.com/v1";
const DEFAULT_NVIDIA_LLM_MODEL = process.env.NVIDIA_LLM_MODEL || "meta/llama-3.1-70b-instruct";
const PROVIDER_TIMEOUT_MS = Number(process.env.LLM_TIMEOUT_MS ?? 6000);
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

const callNvidiaChat = async (params: {
  apiKey: string;
  model: string;
  systemPrompt: string;
  history: ChatMessage[];
  message: string;
}) => {
  const { apiKey, model, systemPrompt, history, message } = params;
  const controller = new AbortController();
  const timeoutId = PROVIDER_TIMEOUT_MS > 0 ? setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS) : null;

  const messages = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: message },
  ];

  let response: Response;
  try {
    response = await fetch(
      `${NVIDIA_API_BASE}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 700,
          temperature: 0.25,
        }),
      },
    );
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new Error(`NVIDIA LLM timed out after ${PROVIDER_TIMEOUT_MS}ms`);
    }
    throw error;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`NVIDIA LLM error ${response.status}: ${body.slice(0, 240)}`);
  }

  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content?.trim();
  if (!reply) throw new Error("NVIDIA LLM returned an empty response.");

  return { reply, provider: "nvidia", model };
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
    const mergedSystemPrompt = [DEFAULT_SYSTEM_PROMPT, OUTPUT_STYLE_PROMPT, systemPrompt, dataContext]
      .filter(Boolean)
      .join("\n\n");

    if (!message) {
      res.status(400).json({ error: "Message is required." });
      return;
    }

    const nvidiaKey = process.env.NVIDIA_API_KEY || "";
    if (!nvidiaKey) {
      res.status(500).json({
        error: "No NVIDIA API key configured. Add NVIDIA_API_KEY in environment variables.",
      });
      return;
    }
    const result = await callNvidiaChat({
      apiKey: nvidiaKey,
      model: DEFAULT_NVIDIA_LLM_MODEL,
      systemPrompt: mergedSystemPrompt,
      history,
      message,
    });
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Failed to process chat request." });
  }
}
