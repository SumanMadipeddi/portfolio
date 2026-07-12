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
const OUTPUT_STYLE_PROMPT =
  "Formatting rules: keep answers complete (never cut mid-sentence). When user asks for N points/strengths/steps, return exactly N numbered lines (1., 2., 3...) with one point per line. Avoid markdown bold unless explicitly requested.";
const PROVIDER_TIMEOUT_MS = Number(process.env.LLM_TIMEOUT_MS || 15000);
const TTS_TIMEOUT_MS = Number(process.env.LLM_TTS_TIMEOUT_MS || 30000);

const NVIDIA_API_BASE = process.env.NVIDIA_API_BASE || "https://integrate.api.nvidia.com/v1";
const NVIDIA_STT_MODEL = process.env.NVIDIA_STT_MODEL || "openai/whisper-large-v3";
const NVIDIA_LLM_MODEL = process.env.NVIDIA_LLM_MODEL || "meta/llama-3.1-70b-instruct";
const NVIDIA_MULTIMODAL_MODEL = process.env.NVIDIA_MULTIMODAL_MODEL || "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning";
const NVIDIA_TTS_MODEL = process.env.NVIDIA_TTS_MODEL || "nvidia/magpie-multilingual";
const NVIDIA_TTS_VOICE = process.env.NVIDIA_TTS_VOICE || "Magpie-Multilingual.EN-US.Aria";

const callNvidiaChat = async ({ apiKey, model, systemPrompt, history, message }) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);
  const messages = [
    { role: "system", content: systemPrompt },
    ...history,
    { role: "user", content: message },
  ];

  let response;
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
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(`NVIDIA LLM timed out after ${PROVIDER_TIMEOUT_MS}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
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
    if (req.url === "/api/debug" && req.method === "GET") {
      return json(res, 200, {
        success: true,
        runtime: "local-api-server",
        now: new Date().toISOString(),
        env: {
          nodeEnv: process.env.NODE_ENV || "development",
          hasNvidiaKey: Boolean(process.env.NVIDIA_API_KEY),
          nvidiaApiBase: NVIDIA_API_BASE,
          nvidiaSttModel: NVIDIA_STT_MODEL,
          nvidiaLlmModel: NVIDIA_LLM_MODEL,
          nvidiaTtsModel: NVIDIA_TTS_MODEL,
          nvidiaTtsVoice: NVIDIA_TTS_VOICE,
          llmTimeoutMs: process.env.LLM_TIMEOUT_MS || "default",
          llmTtsTimeoutMs: process.env.LLM_TTS_TIMEOUT_MS || "default",
          hasAdminPasscode: Boolean(process.env.ADMIN_PASSCODE),
          hasJsonbinKey: Boolean(process.env.JSONBIN_API_KEY),
          hasEmailJsService: Boolean(process.env.VITE_EMAILJS_SERVICE_ID),
          hasEmailJsTemplate: Boolean(process.env.VITE_EMAILJS_TEMPLATE_ID),
          hasEmailJsPublicKey: Boolean(process.env.VITE_EMAILJS_PUBLIC_KEY),
        },
      });
    }

    if (req.url === "/api/chat" && req.method === "POST") {
      const body = await readBody(req);
      const message = String(body?.message || "").trim();
      if (!message) return json(res, 400, { error: "Message is required." });

      const history = normalizeHistory(body?.history, 16);
      const requestPrompt = String(body?.systemPrompt || DEFAULT_SYSTEM_PROMPT).trim();
      const mergedPrompt = [DEFAULT_SYSTEM_PROMPT, OUTPUT_STYLE_PROMPT, requestPrompt, loadDataContext()].filter(Boolean).join("\n\n");

      const nvidiaKey = process.env.NVIDIA_API_KEY || "";

      if (!nvidiaKey) {
        return json(res, 500, {
          error: "No NVIDIA API key configured. Add NVIDIA_API_KEY in .env.",
        });
      }
      const result = await callNvidiaChat({ apiKey: nvidiaKey, model: NVIDIA_LLM_MODEL, systemPrompt: mergedPrompt, history, message });
      return json(res, 200, result);
    }

    if (req.url === "/api/voice" && req.method === "POST") {
      const body = await readBody(req);
      const audioBase64 = String(body?.audioBase64 || "").trim();
      const mimeType = String(body?.mimeType || "audio/webm").trim();

      const nvidiaKey = process.env.NVIDIA_API_KEY || "";
      if (!nvidiaKey) return json(res, 500, { error: "NVIDIA_API_KEY is not configured." });

      const history = normalizeHistory(body?.history, 10);
      const requestPrompt = String(body?.systemPrompt || DEFAULT_SYSTEM_PROMPT).trim();
      const mergedPrompt = [DEFAULT_SYSTEM_PROMPT, OUTPUT_STYLE_PROMPT, requestPrompt, loadDataContext()].filter(Boolean).join("\n\n");

      let reply = "";
      let userQuery = "";

      // 1. DUAL-PATH: Check if client already transcribed the audio using web speech API
      const lastMessage = history[history.length - 1];
      if (lastMessage && lastMessage.role === "user" && lastMessage.content) {
        userQuery = lastMessage.content;
        const historySlice = history.slice(0, -1);

        const controller = new AbortController();
        const timeoutId = PROVIDER_TIMEOUT_MS > 0 ? setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS) : null;
        let response;
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
              model: process.env.NVIDIA_LLM_MODEL || NVIDIA_LLM_MODEL,
              messages,
              max_tokens: 700,
              temperature: 0.25,
            }),
          });
        } catch (err) {
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
          return json(res, 400, { error: "audioBase64 or client transcript is required." });
        }

        userQuery = "(Audio Input)";
        const controller = new AbortController();
        const timeoutId = PROVIDER_TIMEOUT_MS > 0 ? setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS) : null;
        let response;
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
              model: process.env.NVIDIA_MULTIMODAL_MODEL || NVIDIA_MULTIMODAL_MODEL,
              messages,
              max_tokens: 700,
              temperature: 0.25,
            }),
          });
        } catch (err) {
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

      return json(res, 200, {
        reply,
        userQuery,
        provider: "nvidia",
        model: process.env.NVIDIA_LLM_MODEL || NVIDIA_LLM_MODEL,
        audioBase64: "", // client-side fallback
        audioMimeType: "audio/wav",
        ttsError: null,
      });
    }

    // Resume routes
    if (req.url === "/api/resume" && req.method === "GET") {
      try {
        const resumeUrl = process.env.LOCAL_RESUME_URL || "https://drive.google.com/uc?export=download&id=16pajWO-QZlmp8CHkFH_c9ce-FbM27hQN";
        return json(res, 200, {
          success: true,
          data: {
            downloadUrl: resumeUrl,
            lastUpdated: new Date().toISOString().split('T')[0],
            filename: "resume_suman_madipeddi.pdf"
          }
        });
      } catch (error) {
        return json(res, 500, { success: false, message: "Failed to fetch resume data.", error: error.message });
      }
    }

    if (req.url === "/api/resume/verify" && req.method === "POST") {
      try {
        const body = await readBody(req);
        const { passcode } = body;
        const adminPasscode = process.env.VITE_ADMIN_PASSCODE || process.env.ADMIN_PASSCODE;

        if (!passcode) {
          return json(res, 400, { success: false, message: "Passcode is required" });
        }

        if (passcode !== adminPasscode) {
          return json(res, 401, { success: false, message: "Invalid passcode. Access denied." });
        }

        return json(res, 200, {
          success: true,
          message: "Passcode verified successfully"
        });
      } catch (error) {
        return json(res, 500, { success: false, message: "Failed to verify passcode" });
      }
    }

    if (req.url === "/api/resume" && req.method === "POST") {
      try {
        const body = await readBody(req);
        const { fileId, passcode } = body;
        const adminPasscode = process.env.VITE_ADMIN_PASSCODE || process.env.ADMIN_PASSCODE;

        if (!passcode || passcode !== adminPasscode) {
          return json(res, 401, { success: false, message: "Invalid passcode. Access denied." });
        }

        if (!fileId) {
          return json(res, 400, { success: false, message: "File ID is required" });
        }

        // Direct update to JSONBin
        const STORAGE_URL = 'https://api.jsonbin.io/v3/b/68c90385d0ea881f407f8393';
        const STORAGE_KEY = process.env.JSONBIN_API_KEY || '$2a$10$yKUUJi95xhXA7hAukjkrCOE2bCBzWf15lXfGE/bz1VW8KrnoeBRDy';

        const updatedData = {
          downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
          lastUpdated: new Date().toISOString().split('T')[0],
          filename: 'resume_suman_madipeddi.pdf',
        };

        const response = await fetch(STORAGE_URL, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': STORAGE_KEY,
          },
          body: JSON.stringify(updatedData),
        });

        if (response.ok) {
          process.env.LOCAL_RESUME_URL = updatedData.downloadUrl; // update cache
          return json(res, 200, {
            success: true,
            message: 'Resume updated permanently! Changes are now live for all users across all domains.',
            data: updatedData
          });
        } else {
          return json(res, 500, { success: false, message: "Failed to update JSONBin." });
        }
      } catch (error) {
        return json(res, 500, { success: false, message: "Failed to update resume permanently.", error: error.message });
      }
    }

    return json(res, 404, { error: "Not found" });
  } catch (error) {
    return json(res, 500, { error: error instanceof Error ? error.message : "Local API server error" });
  }
});

server.listen(port, () => {
  console.log(`[local-api] listening on http://localhost:${port}`);
});
