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
    .slice(-10);
};

const loadDataContext = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) return "";
    return fs.readFileSync(DATA_FILE, "utf8").trim();
  } catch {
    return "";
  }
};

const callGeminiVoice = async (params: {
  apiKey: string;
  model: string;
  systemPrompt: string;
  history: ChatMessage[];
  audioBase64: string;
  mimeType: string;
}) => {
  const { apiKey, model, systemPrompt, history, audioBase64, mimeType } = params;

  const contents = [
    ...history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    {
      role: "user",
      parts: [
        {
          inlineData: {
            mimeType,
            data: audioBase64,
          },
        },
        {
          text: "Please respond to what you heard in this recording. Keep it concise and useful.",
        },
      ],
    },
  ];

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
          maxOutputTokens: 700,
          temperature: 0.55,
        },
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini voice error ${response.status}: ${body.slice(0, 240)}`);
  }

  const data = await response.json();
  const reply = data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text || "").join("\n").trim();
  if (!reply) throw new Error("Gemini voice returned an empty response.");

  return reply;
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
    const audioBase64 = String(req.body?.audioBase64 || "").trim();
    const mimeType = String(req.body?.mimeType || "audio/webm").trim();
    const history = normalizeHistory(req.body?.history);
    const requestPrompt = String(req.body?.systemPrompt || DEFAULT_SYSTEM_PROMPT).trim();

    if (!audioBase64) {
      res.status(400).json({ error: "audioBase64 is required." });
      return;
    }

    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
    if (!geminiKey) {
      res.status(500).json({ error: "GEMINI_API_KEY is not configured." });
      return;
    }

    const mergedPrompt = [DEFAULT_SYSTEM_PROMPT, requestPrompt, loadDataContext()]
      .filter(Boolean)
      .join("\n\n");

    const reply = await callGeminiVoice({
      apiKey: geminiKey,
      model: DEFAULT_GEMINI_MODEL,
      systemPrompt: mergedPrompt,
      history,
      audioBase64,
      mimeType,
    });

    res.status(200).json({ reply, provider: "gemini", model: DEFAULT_GEMINI_MODEL });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Voice request failed." });
  }
}
