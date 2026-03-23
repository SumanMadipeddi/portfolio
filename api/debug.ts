interface VercelRequest {
  method?: string;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
  setHeader: (name: string, value: string) => void;
  end: () => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ success: false, message: "Method not allowed" });
    return;
  }

  res.status(200).json({
    success: true,
    runtime: "vercel-serverless",
    now: new Date().toISOString(),
    commit: process.env.VERCEL_GIT_COMMIT_SHA || null,
    branch: process.env.VERCEL_GIT_COMMIT_REF || null,
    env: {
      nodeEnv: process.env.NODE_ENV || null,
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
      geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash (default)",
      geminiVoiceModel: process.env.GEMINI_VOICE_MODEL || process.env.GEMINI_MODEL || "gemini-2.5-flash (default)",
      geminiTtsModel: process.env.GEMINI_TTS_MODEL || "gemini-2.5-flash-preview-tts (default)",
      geminiVoice: process.env.GEMINI_VOICE || process.env.GEMINI_VOICE_NAME || "Kore (default)",
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

