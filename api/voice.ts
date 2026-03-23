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

const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const DEFAULT_GEMINI_VOICE_MODEL =
  process.env.GEMINI_VOICE_MODEL || process.env.GEMINI_MODEL || "gemini-2.5-flash";
const DEFAULT_GEMINI_TTS_MODEL = process.env.GEMINI_TTS_MODEL || "gemini-2.5-flash-preview-tts";
const DEFAULT_GEMINI_VOICE =
  process.env.GEMINI_VOICE || process.env.GEMINI_VOICE_NAME || "Kore";
const PROVIDER_TIMEOUT_MS = Number(process.env.LLM_TIMEOUT_MS || 15000);
const TTS_TIMEOUT_MS = Number(process.env.LLM_TTS_TIMEOUT_MS || 30000);
const STRICT_GOOGLE_VOICE = String(process.env.GEMINI_VOICE_STRICT || "false").toLowerCase() === "true";
const DATA_FILE = path.join(process.cwd(), "data", "ai-data.txt");

const normalizeModelName = (raw: string) =>
  String(raw || "")
    .trim()
    .replace(/^models\//, "")
    .replace(/:generateContent$/, "");

const isModelUnavailableError = (message: string) => {
  const m = String(message || "").toLowerCase();
  return m.includes("not found for api version") || m.includes("model not found") || m.includes("404");
};

const KNOWN_GEMINI_VOICES = new Set([
  "aoede",
  "leda",
  "kore",
  "charon",
  "fenrir",
  "orus",
  "zephyr",
  "puck",
]);

const MIME_MAP: Record<string, string> = {
  "audio/webm": "audio/ogg",
  "audio/webm;codecs=opus": "audio/ogg",
  "audio/webm;codecs=pcm": "audio/ogg",
  "audio/ogg": "audio/ogg",
  "audio/ogg;codecs=opus": "audio/ogg",
  "audio/mp4": "audio/mp4",
  "audio/mpeg": "audio/mp3",
  "audio/wav": "audio/wav",
  "audio/flac": "audio/flac",
};

const toGeminiMimeType = (mimeType: string) => {
  const raw = String(mimeType || "").toLowerCase().trim();
  if (MIME_MAP[raw]) return MIME_MAP[raw];
  const base = raw.split(";")[0]?.trim();
  if (base && MIME_MAP[base]) return MIME_MAP[base];
  return "audio/ogg";
};

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

const callGeminiVoiceText = async (params: {
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
          text: "Answer the user's request directly. Do not narrate what you heard. Never begin with phrases like 'I heard someone say'.",
        },
      ],
    },
  ];

  const controller = new AbortController();
  const timeoutId =
    PROVIDER_TIMEOUT_MS > 0 ? setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS) : null;
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
            maxOutputTokens: 700,
            temperature: 0.25,
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
    if (timeoutId) clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini voice error ${response.status}: ${body.slice(0, 240)}`);
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
  return { reply };
};

const callGeminiTts = async (params: {
  apiKey: string;
  model: string;
  text: string;
  voiceName: string;
}) => {
  const { apiKey, model, text, voiceName } = params;
  const controller = new AbortController();
  const timeoutId =
    TTS_TIMEOUT_MS > 0 ? setTimeout(() => controller.abort(), TTS_TIMEOUT_MS) : null;
  let response: Response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 700,
            temperature: 0.35,
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName,
                },
              },
            },
          },
        }),
      },
    );
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new Error(`Gemini TTS timed out after ${TTS_TIMEOUT_MS}ms`);
    }
    throw error;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini TTS error ${response.status}: ${body.slice(0, 240)}`);
  }

  const data = await response.json();
  const parts = Array.isArray(data?.candidates?.[0]?.content?.parts)
    ? data.candidates[0].content.parts
    : [];
  const inlineData = parts.find((p: any) => p?.inlineData)?.inlineData;
  if (!inlineData?.data) return { audioBase64: "", audioMimeType: "" };

  return normalizeGeminiAudio(String(inlineData.data), String(inlineData.mimeType || ""));
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
    const safeMimeType = toGeminiMimeType(mimeType);
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

    const mergedPrompt = [DEFAULT_SYSTEM_PROMPT, OUTPUT_STYLE_PROMPT, requestPrompt, loadDataContext()]
      .filter(Boolean)
      .join("\n\n");

    const rawConfiguredVoiceModel = normalizeModelName(DEFAULT_GEMINI_VOICE_MODEL);
    const textFallbackModel = normalizeModelName(DEFAULT_GEMINI_MODEL);
    const configuredTtsModel = normalizeModelName(DEFAULT_GEMINI_TTS_MODEL);
    const resolvedVoiceName = KNOWN_GEMINI_VOICES.has(rawConfiguredVoiceModel.toLowerCase())
      ? rawConfiguredVoiceModel
      : DEFAULT_GEMINI_VOICE;
    const configuredVoiceModel = KNOWN_GEMINI_VOICES.has(rawConfiguredVoiceModel.toLowerCase())
      ? textFallbackModel
      : rawConfiguredVoiceModel;

    let usedVoiceModel = configuredVoiceModel;
    let textResult;
    try {
      textResult = await callGeminiVoiceText({
        apiKey: geminiKey,
        model: usedVoiceModel,
        systemPrompt: mergedPrompt,
        history,
        audioBase64,
        mimeType: safeMimeType,
      });
    } catch (err: any) {
      const msg = String(err?.message || "");
      if (isModelUnavailableError(msg) && textFallbackModel && textFallbackModel !== usedVoiceModel) {
        usedVoiceModel = textFallbackModel;
        textResult = await callGeminiVoiceText({
          apiKey: geminiKey,
          model: usedVoiceModel,
          systemPrompt: mergedPrompt,
          history,
          audioBase64,
          mimeType: safeMimeType,
        });
      } else {
        throw err;
      }
    }

    let usedTtsModel = configuredTtsModel;
    let ttsError: string | null = null;
    let ttsAudio = { audioBase64: "", audioMimeType: "" };
    if (configuredTtsModel) {
      try {
        ttsAudio = await callGeminiTts({
          apiKey: geminiKey,
          model: configuredTtsModel,
          text: textResult.reply,
          voiceName: resolvedVoiceName,
        });
      } catch (err: any) {
        const msg = String(err?.message || "");
        ttsError = msg || "Unknown TTS error";
        if (isModelUnavailableError(msg)) {
          usedTtsModel = "";
        } else if (STRICT_GOOGLE_VOICE) {
          throw err;
        }
      }
    }

    if (STRICT_GOOGLE_VOICE && !ttsAudio.audioBase64) {
      res.status(500).json({
        error:
          "Google voice audio was not returned by Gemini. Try another GEMINI_VOICE or model.",
      });
      return;
    }

    res.status(200).json({
      reply: textResult.reply,
      provider: "gemini",
      model: usedVoiceModel,
      ttsModel: usedTtsModel || null,
      voice: resolvedVoiceName,
      audioBase64: ttsAudio.audioBase64,
      audioMimeType: ttsAudio.audioMimeType,
      usedGoogleVoice: Boolean(ttsAudio.audioBase64),
      ttsError,
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Voice request failed." });
  }
}
