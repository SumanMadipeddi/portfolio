import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const envPath = path.join(rootDir, ".env");
const aiDataPath = path.join(rootDir, "data", "ai-data.txt");

const loadEnvFromFile = () => {
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
};

const json = (res, status, payload) => {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(payload));
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 10_000_000) {
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });

const normalizeHistory = (history, maxItems = 16) => {
  if (!Array.isArray(history)) return [];
  return history
    .map((item) => ({
      role: item?.role,
      content: String(item?.content || "").trim(),
    }))
    .filter((m) => (m.role === "user" || m.role === "assistant") && m.content)
    .slice(-maxItems);
};

const loadDataContext = () => {
  try {
    if (!fs.existsSync(aiDataPath)) return "";
    return fs.readFileSync(aiDataPath, "utf8").trim();
  } catch {
    return "";
  }
};

const DEFAULT_SYSTEM_PROMPT =
  "You are Suman Madipeddi's AI assistant on his portfolio website. Be concise, warm, and truthful.";
const PROVIDER_TIMEOUT_MS = Number(process.env.LLM_TIMEOUT_MS || 12000);
const DEFAULT_GEMINI_VOICE = process.env.GEMINI_VOICE || process.env.GEMINI_VOICE_NAME || "Kore";
const DEFAULT_GEMINI_VOICE_MODEL =
  process.env.GEMINI_VOICE_MODEL || process.env.GEMINI_MODEL || "gemini-2.5-flash";
const DEFAULT_GEMINI_TTS_MODEL = process.env.GEMINI_TTS_MODEL || "gemini-2.5-flash-preview-tts";
const STRICT_GOOGLE_VOICE = String(process.env.GEMINI_VOICE_STRICT || "false").toLowerCase() === "true";
const normalizeModelName = (raw) =>
  String(raw || "")
    .trim()
    .replace(/^models\//, "")
    .replace(/:generateContent$/, "");
const isModelUnavailableError = (message) => {
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
const MIME_MAP = {
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
const toGeminiMimeType = (mimeType) => {
  const raw = String(mimeType || "").toLowerCase().trim();
  if (MIME_MAP[raw]) return MIME_MAP[raw];
  const base = raw.split(";")[0]?.trim();
  if (base && MIME_MAP[base]) return MIME_MAP[base];
  return "audio/ogg";
};

const pcm16ToWavBase64 = (pcmBase64, sampleRate = 24000, channels = 1) => {
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

const normalizeGeminiAudio = ({ audioBase64, audioMimeType }) => {
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

const callGemini = async ({ apiKey, model, systemPrompt, history, message }) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);
  const contents = [...history, { role: "user", content: message }].map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  let response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: {
            maxOutputTokens: 400,
            temperature: 0.6,
          },
        }),
      },
    );
  } catch (error) {
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
  const reply = data?.candidates?.[0]?.content?.parts?.map((p) => p?.text || "").join("\n").trim();
  if (!reply) throw new Error("Gemini returned an empty response.");
  return { reply, provider: "gemini", model };
};

const callGeminiVoiceText = async ({ apiKey, model, systemPrompt, history, audioBase64, mimeType }) => {
  const contents = [
    ...history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    {
      role: "user",
      parts: [
        { inlineData: { mimeType, data: audioBase64 } },
        { text: "Answer the user's request directly. Do not narrate what you heard. Never begin with phrases like 'I heard someone say'." },
      ],
    },
  ];
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: {
            maxOutputTokens: 700,
            temperature: 0.55,
          },
        }),
      },
    );
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(`Gemini voice timed out after ${PROVIDER_TIMEOUT_MS}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
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
    .map((p) => p?.text || "")
    .join("\n")
    .trim();
  if (!reply) throw new Error("Gemini voice returned an empty response.");
  return { reply, provider: "gemini", model };
};

const callGeminiTts = async ({ apiKey, model, text, voiceName }) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);
  let response;
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
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(`Gemini TTS timed out after ${PROVIDER_TIMEOUT_MS}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini TTS error ${response.status}: ${body.slice(0, 240)}`);
  }

  const data = await response.json();
  const parts = Array.isArray(data?.candidates?.[0]?.content?.parts)
    ? data.candidates[0].content.parts
    : [];
  const inlineData = parts.find((p) => p?.inlineData)?.inlineData;
  if (!inlineData?.data) return { audioBase64: "", audioMimeType: "" };
  const normalizedAudio = normalizeGeminiAudio({
    audioBase64: inlineData?.data ? String(inlineData.data) : "",
    audioMimeType: inlineData?.mimeType ? String(inlineData.mimeType) : "",
  });
  return {
    audioBase64: normalizedAudio.audioBase64,
    audioMimeType: normalizedAudio.audioMimeType,
  };
};

loadEnvFromFile();
const port = Number(process.env.LOCAL_API_PORT || 3001);

const server = http.createServer(async (req, res) => {
  if (!req.url) return json(res, 404, { error: "Not found" });

  if (req.method === "OPTIONS") {
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  try {
    if (req.url === "/api/chat" && req.method === "POST") {
      const body = await readBody(req);
      const message = String(body?.message || "").trim();
      if (!message) return json(res, 400, { error: "Message is required." });

      const history = normalizeHistory(body?.history, 16);
      const requestPrompt = String(body?.systemPrompt || DEFAULT_SYSTEM_PROMPT).trim();
      const mergedPrompt = [DEFAULT_SYSTEM_PROMPT, requestPrompt, loadDataContext()].filter(Boolean).join("\n\n");

      const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
      const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";

      if (!geminiKey) {
        return json(res, 500, {
          error: "No Gemini API key configured. Add GEMINI_API_KEY in .env.",
        });
      }
      const result = await callGemini({ apiKey: geminiKey, model: geminiModel, systemPrompt: mergedPrompt, history, message });
      return json(res, 200, result);
    }

    if (req.url === "/api/voice" && req.method === "POST") {
      const body = await readBody(req);
      const audioBase64 = String(body?.audioBase64 || "").trim();
      const mimeType = String(body?.mimeType || "audio/webm").trim();
      const safeMimeType = toGeminiMimeType(mimeType);
      if (!audioBase64) return json(res, 400, { error: "audioBase64 is required." });

      const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
      if (!geminiKey) return json(res, 500, { error: "GEMINI_API_KEY is not configured." });

      const history = normalizeHistory(body?.history, 10);
      const requestPrompt = String(body?.systemPrompt || DEFAULT_SYSTEM_PROMPT).trim();
      const mergedPrompt = [DEFAULT_SYSTEM_PROMPT, requestPrompt, loadDataContext()].filter(Boolean).join("\n\n");
      const rawConfiguredVoiceModel = normalizeModelName(DEFAULT_GEMINI_VOICE_MODEL);
      const textFallbackModel = normalizeModelName(process.env.GEMINI_MODEL || "gemini-2.5-flash");
      const configuredTtsModel = normalizeModelName(DEFAULT_GEMINI_TTS_MODEL);
      const resolvedVoiceName = KNOWN_GEMINI_VOICES.has(rawConfiguredVoiceModel.toLowerCase())
        ? rawConfiguredVoiceModel
        : DEFAULT_GEMINI_VOICE;
      const configuredVoiceModel = KNOWN_GEMINI_VOICES.has(rawConfiguredVoiceModel.toLowerCase())
        ? textFallbackModel
        : rawConfiguredVoiceModel;
      let geminiModel = configuredVoiceModel;

      let textResult;
      try {
        textResult = await callGeminiVoiceText({
          apiKey: geminiKey,
          model: geminiModel,
          systemPrompt: mergedPrompt,
          history,
          audioBase64,
          mimeType: safeMimeType,
        });
      } catch (err) {
        const msg = String(err?.message || "");
        if (isModelUnavailableError(msg) && textFallbackModel && textFallbackModel !== geminiModel) {
          geminiModel = textFallbackModel;
          textResult = await callGeminiVoiceText({
            apiKey: geminiKey,
            model: geminiModel,
            systemPrompt: mergedPrompt,
            history,
            audioBase64,
            mimeType: safeMimeType,
          });
        } else {
          throw err;
        }
      }

      let ttsAudio = { audioBase64: "", audioMimeType: "" };
      let usedTtsModel = configuredTtsModel;
      let ttsError = null;
      if (configuredTtsModel) {
        try {
          ttsAudio = await callGeminiTts({
            apiKey: geminiKey,
            model: configuredTtsModel,
            text: textResult.reply,
            voiceName: resolvedVoiceName,
          });
        } catch (err) {
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
        return json(res, 500, {
          error:
            "Google voice audio was not returned by Gemini. Try another GEMINI_VOICE or model.",
        });
      }

      return json(res, 200, {
        reply: textResult.reply,
        provider: "gemini",
        model: geminiModel,
        ttsModel: usedTtsModel || null,
        audioBase64: ttsAudio.audioBase64,
        audioMimeType: ttsAudio.audioMimeType,
        voice: resolvedVoiceName,
        usedGoogleVoice: Boolean(ttsAudio.audioBase64),
        ttsError,
      });
    }

    return json(res, 404, { error: "Not found" });
  } catch (error) {
    return json(res, 500, { error: error instanceof Error ? error.message : "Local API server error" });
  }
});

server.listen(port, () => {
  console.log(`[local-api] listening on http://localhost:${port}`);
});
