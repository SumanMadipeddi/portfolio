import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const envPath = path.join(rootDir, ".env");
const aiDataPath = path.join(rootDir, "data", "ai-data.txt");
const port = Number(process.env.LOCAL_API_PORT || 3001);

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

const callGemini = async ({ apiKey, model, systemPrompt, history, message }) => {
  const contents = [...history, { role: "user", content: message }].map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
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
  const reply = data?.candidates?.[0]?.content?.parts?.map((p) => p?.text || "").join("\n").trim();
  if (!reply) throw new Error("Gemini returned an empty response.");
  return { reply, provider: "gemini", model };
};

const callClaude = async ({ apiKey, model, systemPrompt, history, message }) => {
  const messages = [...history, { role: "user", content: message }].map((m) => ({
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
  const reply = data?.content?.find((c) => c?.type === "text")?.text?.trim();
  if (!reply) throw new Error("Claude returned an empty response.");
  return { reply, provider: "claude", model };
};

const callGeminiVoice = async ({ apiKey, model, systemPrompt, history, audioBase64, mimeType }) => {
  const contents = [
    ...history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    {
      role: "user",
      parts: [
        { inlineData: { mimeType, data: audioBase64 } },
        { text: "Please respond to what you heard in this recording. Keep it concise and useful." },
      ],
    },
  ];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { maxOutputTokens: 700, temperature: 0.55 },
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Gemini voice error ${response.status}: ${body.slice(0, 240)}`);
  }

  const data = await response.json();
  const reply = data?.candidates?.[0]?.content?.parts?.map((p) => p?.text || "").join("\n").trim();
  if (!reply) throw new Error("Gemini voice returned an empty response.");
  return { reply, provider: "gemini", model };
};

loadEnvFromFile();

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
      const claudeKey = process.env.CLAUDE_API_KEY || "";
      const geminiModel = process.env.GEMINI_MODEL || "gemini-2.0-flash";
      const claudeModel = process.env.CLAUDE_MODEL || "claude-3-5-sonnet-20241022";
      const primary = (process.env.LLM_PRIMARY || "gemini").toLowerCase();

      if (!geminiKey && !claudeKey) {
        return json(res, 500, {
          error: "No LLM API keys configured. Add GEMINI_API_KEY and/or CLAUDE_API_KEY in .env.",
        });
      }

      const attempts =
        primary === "claude"
          ? [
              () => {
                if (!claudeKey) throw new Error("Claude key missing");
                return callClaude({ apiKey: claudeKey, model: claudeModel, systemPrompt: mergedPrompt, history, message });
              },
              () => {
                if (!geminiKey) throw new Error("Gemini key missing");
                return callGemini({ apiKey: geminiKey, model: geminiModel, systemPrompt: mergedPrompt, history, message });
              },
            ]
          : [
              () => {
                if (!geminiKey) throw new Error("Gemini key missing");
                return callGemini({ apiKey: geminiKey, model: geminiModel, systemPrompt: mergedPrompt, history, message });
              },
              () => {
                if (!claudeKey) throw new Error("Claude key missing");
                return callClaude({ apiKey: claudeKey, model: claudeModel, systemPrompt: mergedPrompt, history, message });
              },
            ];

      let lastError = "Unknown LLM error";
      for (const attempt of attempts) {
        try {
          const result = await attempt();
          return json(res, 200, result);
        } catch (error) {
          lastError = error instanceof Error ? error.message : String(error);
        }
      }

      return json(res, 502, { error: `All configured providers failed. Last error: ${lastError}` });
    }

    if (req.url === "/api/voice" && req.method === "POST") {
      const body = await readBody(req);
      const audioBase64 = String(body?.audioBase64 || "").trim();
      const mimeType = String(body?.mimeType || "audio/webm").trim();
      if (!audioBase64) return json(res, 400, { error: "audioBase64 is required." });

      const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
      if (!geminiKey) return json(res, 500, { error: "GEMINI_API_KEY is not configured." });

      const history = normalizeHistory(body?.history, 10);
      const requestPrompt = String(body?.systemPrompt || DEFAULT_SYSTEM_PROMPT).trim();
      const mergedPrompt = [DEFAULT_SYSTEM_PROMPT, requestPrompt, loadDataContext()].filter(Boolean).join("\n\n");
      const geminiModel = process.env.GEMINI_MODEL || "gemini-2.0-flash";

      const result = await callGeminiVoice({
        apiKey: geminiKey,
        model: geminiModel,
        systemPrompt: mergedPrompt,
        history,
        audioBase64,
        mimeType,
      });

      return json(res, 200, result);
    }

    return json(res, 404, { error: "Not found" });
  } catch (error) {
    return json(res, 500, { error: error instanceof Error ? error.message : "Local API server error" });
  }
});

server.listen(port, () => {
  console.log(`[local-api] listening on http://localhost:${port}`);
});

