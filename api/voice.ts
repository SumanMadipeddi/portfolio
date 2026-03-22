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
const DEFAULT_GEMINI_VOICE_MODEL = "gemini-2.5-flash-native-audio-preview-12-2025";
const DEFAULT_GEMINI_VOICE = process.env.GEMINI_VOICE || "Aoede";
const PROVIDER_TIMEOUT_MS = Number(process.env.LLM_TIMEOUT_MS || 15000);
const STRICT_GOOGLE_VOICE = String(process.env.GEMINI_VOICE_STRICT || "false").toLowerCase() === "true";
const DATA_FILE = path.join(process.cwd(), "data", "ai-data.txt");

const normalizeModelName = (raw: string) =>
  String(raw || "")
    .trim()
    .replace(/^models\//, "")
    .replace(/:generateContent$/, "");

const pcm16ToWavBase64 = (pcmBase64: string, sampleRate = 24000, channels = 1) => {
  const pcm = Buffer.from(pcmBase64, "base64");
  const bytesPerSample = 2;
  const blockAlign = channels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = pcm.length;
  const wavHeader = Buffer.alloc(44);

  wavHeader.write("RIFF", 0);
  wavHeader.writeUInt32LE(36 + dataSize, 4);
  wavHeader.write("WAVE", 8);
  wavHeader.write("fmt ", 12);
  wavHeader.writeUInt32LE(16, 16);
  wavHeader.writeUInt16LE(1, 20);
  wavHeader.writeUInt16LE(channels, 22);
  wavHeader.writeUInt32LE(sampleRate, 24);
  wavHeader.writeUInt32LE(byteRate, 28);
  wavHeader.writeUInt16LE(blockAlign, 32);
  wavHeader.writeUInt16LE(16, 34);
  wavHeader.write("data", 36);
  wavHeader.writeUInt32LE(dataSize, 40);

  return Buffer.concat([wavHeader, pcm]).toString("base64");
};

const normalizeGeminiAudio = (audioBase64: string, audioMimeType: string) => {
  if (!audioBase64) return { audioBase64: "", audioMimeType: "" };
  const mime = String(audioMimeType || "").toLowerCase();
  if (mime.includes("audio/l16") || mime.includes("audio/pcm")) {
    const rateMatch = mime.match(/rate=(\d+)/);
    const sampleRate = rateMatch ? Number(rateMatch[1]) : 24000;
    return {
      audioBase64: pcm16ToWavBase64(audioBase64, Number.isFinite(sampleRate) ? sampleRate : 24000),
      audioMimeType: "audio/wav",
    };
  }
  return {
    audioBase64,
    audioMimeType: audioMimeType || "audio/wav",
  };
};

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
  voiceName: string;
}) => {
  const { apiKey, model, systemPrompt, history, audioBase64, mimeType, voiceName } = params;
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
          text: "Answer the user's request directly. Do not narrate what you heard. Never begin with phrases like 'I heard someone say'.",
        },
      ],
    },
  ];

  const requestGemini = async (withAudio: boolean) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);
    try {
      return await fetch(
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
            generationConfig: withAudio
              ? {
                  maxOutputTokens: 700,
                  temperature: 0.55,
                  responseModalities: ["TEXT", "AUDIO"],
                  speechConfig: {
                    voiceConfig: {
                      prebuiltVoiceConfig: {
                        voiceName,
                      },
                    },
                  },
                }
              : {
                  maxOutputTokens: 700,
                  temperature: 0.55,
                },
          }),
        },
      );
    } catch (error: any) {
      if (error?.name === "AbortError") {
        throw new Error(`Gemini voice timed out after ${PROVIDER_TIMEOUT_MS}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  let response = await requestGemini(true);
  if (!response.ok) {
    const body = await response.text();
    if (response.status === 400 && body.includes("only supports text output")) {
      response = await requestGemini(false);
      if (!response.ok) {
        const retryBody = await response.text();
        throw new Error(`Gemini voice error ${response.status}: ${retryBody.slice(0, 240)}`);
      }
    } else {
      throw new Error(`Gemini voice error ${response.status}: ${body.slice(0, 240)}`);
    }
  }

  const data = await response.json();
  const parts = Array.isArray(data?.candidates?.[0]?.content?.parts)
    ? data.candidates[0].content.parts
    : [];
  const reply = parts
    .map((p: any) => p?.text || "")
    .join("\n")
    .trim();
  if (!reply) throw new Error("Gemini voice returned an empty response.");
  const inlineData = parts.find((p: any) => p?.inlineData)?.inlineData;
  const normalizedAudio = normalizeGeminiAudio(
    inlineData?.data ? String(inlineData.data) : "",
    inlineData?.mimeType ? String(inlineData.mimeType) : "",
  );
  return {
    reply,
    audioBase64: normalizedAudio.audioBase64,
    audioMimeType: normalizedAudio.audioMimeType,
  };
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

    const configuredVoiceModel = normalizeModelName(
      process.env.GEMINI_VOICE_MODEL || DEFAULT_GEMINI_VOICE_MODEL,
    );
    const fallbackVoiceModel = normalizeModelName(DEFAULT_GEMINI_VOICE_MODEL);

    let usedVoiceModel = configuredVoiceModel;
    let result = await callGeminiVoice({
      apiKey: geminiKey,
      model: usedVoiceModel,
      systemPrompt: mergedPrompt,
      history,
      audioBase64,
      mimeType,
      voiceName: DEFAULT_GEMINI_VOICE,
    });
    if (!result.audioBase64 && usedVoiceModel !== fallbackVoiceModel) {
      const fallbackResult = await callGeminiVoice({
        apiKey: geminiKey,
        model: fallbackVoiceModel,
        systemPrompt: mergedPrompt,
        history,
        audioBase64,
        mimeType,
        voiceName: DEFAULT_GEMINI_VOICE,
      });
      if (fallbackResult.audioBase64) {
        result = fallbackResult;
        usedVoiceModel = fallbackVoiceModel;
      }
    }
    if (STRICT_GOOGLE_VOICE && !result.audioBase64) {
      res.status(500).json({
        error:
          "Google voice audio was not returned by Gemini. Try another GEMINI_VOICE or model.",
      });
      return;
    }

    res.status(200).json({
      reply: result.reply,
      provider: "gemini",
      model: usedVoiceModel,
      voice: DEFAULT_GEMINI_VOICE,
      audioBase64: result.audioBase64,
      audioMimeType: result.audioMimeType,
      usedGoogleVoice: Boolean(result.audioBase64),
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Voice request failed." });
  }
}
