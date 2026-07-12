/* eslint-disable @typescript-eslint/no-explicit-any */
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
const NVIDIA_LLM_MODEL = process.env.NVIDIA_LLM_MODEL || "meta/llama-3.1-70b-instruct";
const NVIDIA_MULTIMODAL_MODEL = process.env.NVIDIA_MULTIMODAL_MODEL || "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning";

const PROVIDER_TIMEOUT_MS = Number(process.env.LLM_TIMEOUT_MS || 15000);
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

    const nvidiaKey = process.env.NVIDIA_API_KEY || "";
    if (!nvidiaKey) {
      res.status(500).json({ error: "NVIDIA_API_KEY is not configured." });
      return;
    }

    const mergedPrompt = [DEFAULT_SYSTEM_PROMPT, OUTPUT_STYLE_PROMPT, requestPrompt, loadDataContext()]
      .filter(Boolean)
      .join("\n\n");

    let reply = "";
    let userQuery = "";

    // 1. DUAL-PATH: Check if client already transcribed the audio using web speech API
    const lastMessage = history[history.length - 1];
    if (lastMessage && lastMessage.role === "user" && lastMessage.content) {
      userQuery = lastMessage.content;
      const historySlice = history.slice(0, -1);

      // Call standard Text LLM
      const controller = new AbortController();
      const timeoutId = PROVIDER_TIMEOUT_MS > 0 ? setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS) : null;
      let response: Response;
      try {
        const messages = [
          { role: "system", content: mergedPrompt },
          ...historySlice,
          { role: "user", content: userQuery },
        ];
        response = await fetch(`${NVIDIA_API_BASE}/chat/completions`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${nvidiaKey}`,
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: NVIDIA_LLM_MODEL,
            messages,
            max_tokens: 700,
            temperature: 0.25,
          }),
        });
      } catch (err: any) {
        if (err?.name === "AbortError") {
          throw new Error(`NVIDIA LLM timed out after ${PROVIDER_TIMEOUT_MS}ms`);
        }
        throw err;
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`NVIDIA LLM error ${response.status}: ${errText.slice(0, 240)}`);
      }

      const data = await response.json();
      reply = String(data?.choices?.[0]?.message?.content || "").trim();
    } else {
      // 2. FALLBACK PATH: Send audio to the multimodal model
      if (!audioBase64) {
        res.status(400).json({ error: "audioBase64 or client transcript is required." });
        return;
      }

      userQuery = "(Audio Input)";
      const controller = new AbortController();
      const timeoutId = PROVIDER_TIMEOUT_MS > 0 ? setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS) : null;
      let response: Response;
      try {
        const messages = [
          { role: "system", content: mergedPrompt },
          ...history,
          {
            role: "user",
            content: [
              { type: "text", text: "Answer the user's spoken request in the attached audio." },
              {
                type: "input_audio",
                input_audio: {
                  data: audioBase64,
                  format: mimeType.includes("mp4") ? "mp4" : "wav"
                }
              }
            ]
          }
        ];

        response = await fetch(`${NVIDIA_API_BASE}/chat/completions`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${nvidiaKey}`,
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: NVIDIA_MULTIMODAL_MODEL,
            messages,
            max_tokens: 700,
            temperature: 0.25,
          }),
        });
      } catch (err: any) {
        if (err?.name === "AbortError") {
          throw new Error(`NVIDIA LLM timed out after ${PROVIDER_TIMEOUT_MS}ms`);
        }
        throw err;
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`NVIDIA Multimodal error ${response.status}: ${errText.slice(0, 240)}`);
      }

      const data = await response.json();
      reply = String(data?.choices?.[0]?.message?.content || "").trim();
    }

    if (!reply) {
      throw new Error("NVIDIA LLM returned an empty response.");
    }

    res.status(200).json({
      reply,
      userQuery,
      provider: "nvidia",
      model: NVIDIA_LLM_MODEL,
      audioBase64: "", // client-side TTS fallback will handle playback
      audioMimeType: "audio/wav",
      ttsError: null,
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Voice request failed." });
  }
}
