import graphRagImage from "@/assets/graphRAG.png";
import mobileQaImage from "@/assets/mobileQA.png";
import ragVoiceImage from "@/assets/rag_voice_agent.png";
import fineTuningImage from "@/assets/finetuning.jpg";
import objectSegImage from "@/assets/ObjectSegmentation.jpg";
import cryptoStreamImage from "@/assets/crypto_stream.png";
import aiEnvironmentsImage from "@/assets/ai_environments.png";
import rlOption3Image from "@/assets/rl_env.png";
import { Project, TerminalSkillLine } from "@/types/portfolio";

export const SYSTEM_PROMPT = `You are Suman Madipeddi's AI assistant.

RESPONSE RULES — follow these exactly, every single time:
- Maximum 4-5 sentences when required.
- No asterisks. No bold. No em-dashes. No markdown need the structure formats.
- If asked for a list (top 3, main skills, strengths, abilities) - respond with ONLY the numbered points, nothing else before or after. Each point MUST be on its own line. No intro sentence. No closing sentence.

Format Example structure: each point in each line seperately in this order 
you no need to asnwer only these  3 strictly use my data and answer
User: what are his 3 strengths 
Answer: 
1. Founding AI engineer: owns architecture and production stack from day one. 
2. Agentic systems expert: multi-agent orchestration, RAG, LLM pipelines at scale. 
3. Ships to production: 100K+ users, 1M+ queries/month, full observability.

User: what are his top skills
Answer: 
1. Multi-agent orchestration with LangGraph. 
2. RAG pipelines over 10M+ docs. 
3. LLM fine-tuning with 10x cost reduction via vLLM.
- If asked a casual/off-topic question — one sentence redirect back to Suman's work.
- Never repeat the same phrasing across two answers.
- Sound like a sharp recruiter briefing, not a chatbot and answer to the question no fluff.

Suman is a Founding AI Engineer specializing in agentic AI systems, LLM pipelines, and production ML.

Key facts:
- Founding/first AI hire 3x — owns architecture, infra, and roadmap from day one
- Shipped Python SDK + REST APIs to 100K+ users handling 1M+ queries/month  
- Built Atimuss Flow: local-first voice agent with sub-500ms latency and 159 WPM capture
- Built Atimuss (Helios): AI personal assistant with EQ & IQ, smart meeting detection, and calendar sync
- Shipped multi-agent LangGraph pipelines, RAG over 10M+ docs, LLaMA fine-tuning (10x cost reduction)
- Full production stack: LangSmith observability, agentic evals, vLLM inference, Pinecone/Weaviate
- Projects: Atimuss Flow, Atimuss (Helios), GraphRAG multi-agent, MobileQA agent, RAG Voice AI, fine-tuning pipeline.
- Open to: Founding AI Engineer, AI Software Engineer, Agentic AI roles at AI-Native startups.
- Location: San Jose CA, open to remote and relocation
- Email: smadiped@asu.edu
- LinkedIn: linkedin.com/in/suman-madipeddi
- GitHub: github.com/SumanMadipeddi
- Medium: medium.com/@madipeddisuman

Target companies: AI-Native startups, Series A/B building agentic products, companies that need someone who can go 0→1 on AI infrastructure.

Be confident and specific. Never vague.`;

export const suggestions = [
  "What do you specialize in?",
  "Tell me about your AI projects",
  "Are you open to work?",
];

export const experiences = [
  {
    period: "10/2025 – Present",
    title: "Founding AI/ML Engineer",
    company: "Stealth AI Startup",
    desc: "Architected multi-agent LangGraph pipelines and document intelligence systems serving 100K+ users. Designed and shipped a Python SDK + REST APIs endpoints. Built full observability stack: LangSmith tracing, guardrails, RAGAS, latency tracking, model evals, and agentic eval harnesses."
  },
  {
    period: "08/2024 - 10/2025",
    title: "Founding AI Engineer",
    company: "Minor Chores",
    link: "https://minorchores.com/",
    desc: "Fine-tuned LLaMA 3.3-70B with LoRA/QLoRA - reduced 78% inference cost via vLLM quantized serving. Shipped conversational RAG Agents, recommendation systems and Mobile dev (IOS/android). Led cross-platform product delivery and increased 40% customer engagement.",
  },
  {
    period: "May 2024",
    title: "Founder",
    company: "Atimuss",
    link: "https://atimuss.com/",
    desc: `Architected an on-device intelligence orchestration system with local wake-word detection, ASR/TTS routing, and context-aware task execution, achieving sub-500ms speech to speech latency through optimized WebRTC, Whisper, and streaming audio pipelines.
Developed the voice interaction layer around raw Intelligence and Emotional Intelligence, IQ for context, executing tasks, and reasoning across apps; EQ for natural, low-friction interaction that feels personal, proactive and context-aware.`,
  },
];

export const projects: Project[] = [
  {
    name: "Building RL Environments Frontier Models",
    desc: "Architecture & systems insight on building synthetic RL environments, reward loops, and benchmark sandboxes for frontier LLMs like Claude Opus.",
    stack: ["RL Environments", "Frontier LLMs", "Reward Modeling", "Agent Evals"],
    image: rlOption3Image,
    githubLink: "https://www.linkedin.com/feed/update/urn:li:activity:7475300633395347456/",
    demoLink: "https://medium.com/@madipeddisuman/the-next-ai-bottleneck-isnt-models-it-s-environments-b7fa0b632bc4",
  },
  {
    name: "GraphRAG Multi Agent",
    desc: "Knowledge Graph extraction from unstructured PDFs using multi-agent workflows for multi hop reasoning.",
    stack: ["LangGraph", "LangChain", "Supabase", "TypeScript"],
    image: graphRagImage,
    githubLink: "https://github.com/SumanMadipeddi/graphRAG-Agent",
    demoLink: "https://drive.google.com/file/d/1yu_3kWcr04DUCoJ8W04dtCgAta9hCPHp/view?usp=drive_link",
  },
  {
    name: "MobileQA Multi Agent",
    desc: "Automated mobile QA with planning agents, ADB tool execution, and vision-grounded validation loops.",
    stack: ["Agent-S3", "LLM Orchestration", "Python", "Android"],
    image: mobileQaImage,
    githubLink: "https://github.com/SumanMadipeddi/mobile-QA-Agent",
    demoLink: "https://drive.google.com/file/d/1vqaf3gtaYZeliB1yow5v4HuSNcNp-OAA/view?usp=sharing",
  },
  {
    name: "RAG Voice AI",
    desc: "Voice-enabled multi-agent assistant. Retrieval, tool calls, and real-time conversational AI in one pipeline.",
    stack: ["LiveKit", "Pinecone", "OpenAI", "Deepgram"],
    image: ragVoiceImage,
    githubLink: "https://github.com/SumanMadipeddi/voice-agent",
    demoLink: "https://www.loom.com/share/c7950b8eda37434893fb03e091a89ebe",
  },
  {
    name: "Fine-Tuning and Inference",
    desc: "LoRA/QLoRA fine-tuning pipeline with Quantization and vLLM inference serving. 10x cost reduction.",
    stack: ["PyTorch", "PEFT", "vLLM", "Unsloth"],
    image: fineTuningImage,
    githubLink: "https://github.com/SumanMadipeddi/vllm-finetuned-inference-serving",
    demoLink: "https://github.com/SumanMadipeddi/vllm-finetuned-inference-serving",
  },
  {
    name: "Object Segmentation",
    desc: "High-performance object segmentation experiments and benchmark-focused computer vision pipelines.",
    stack: ["Mask-RCNN", "PyTorch", "ResNet-50", "Research"],
    image: objectSegImage,
    githubLink: "https://github.com/SumanMadipeddi/Object-Segmentation-on-ARMBENCH",
    demoLink: "https://www.linkedin.com/feed/update/urn:li:activity:7195244374438424577/",
  },
  // {
  //   name: "Realtime Crypto Stream",
  //   desc: "Realtime crypto tracking with web automation, streaming transport, and interactive data viss.",
  //   stack: ["Playwright", "Next.js", "Express", "WebSocket"],
  //   image: cryptoStreamImage,
  //   githubLink: "https://github.com/SumanMadipeddi/CryptoStream",
  //   demoLink: "https://drive.google.com/file/d/1bn_vYEWu2fOZ9z2U2BSRdlxKyTWM1hxi/view?usp=drive_link",
  // },
];

export const techStack = [
  "Python",
  "PyTorch",
  "LangChain",
  "LangGraph",
  "NVIDIA API",
  "Claude API",
  "Pinecone",
  "FastAPI",
  "AWS",
  "Docker",
  "Kubernetes",
  "React",
  "TypeScript",
];

export const stats = [
  { value: 3, suffix: "", label: "Years in AI/ML" },
  { value: 10, suffix: "K+", label: "Served via SDK & APIs" },
  { value: 8, suffix: "+", label: "AI systems shipped" },
  { value: 3, suffix: "", label: "Founding/early roles" },
  { value: 1, suffix: "M+", label: "Production AI queries" },
];

export const terminalSkillLines: TerminalSkillLine[] = [
  { prompt: "$", text: "open-source --active" },
  { prompt: ">", text: "Contributor: OpenWork & Dimos (Multi-Agent RAG & Orchestration)" },
  { prompt: ">", text: "Agent orchestration and LLM systems  [online]" },
  { prompt: ">", text: "Observability, tracing, agentic evals [active]" },
  { prompt: ">", text: "RAG and vector search at scale      [indexed]" },
  { prompt: ">", text: "MLOps, fine-tuning, inference serving  [vLLM]" },
  { prompt: ">", text: "Multi-agent pipelines & custom SDKs [shipped]" },
  { prompt: ">", text: "Cloud infra (AWS, Docker, K8s)       [scaled]" },
  { prompt: "#", text: "All systems operational." },
];

export const ABOUT_WORDS_TOP = ["build and", "ship and", "scale and"];
export const ABOUT_WORDS_BOTTOM = ["think", "execute", "improve"];
export const EXPERIENCE_WORDS_TOP = ["built", "scaled", "shipped"];
export const EXPERIENCE_WORDS_BOTTOM = ["that matter", "for users", "in production"];
export const WORK_WORDS = ["built", "shipped", "deployed"];
export const CONTACT_WORDS = ["something", "AI products", "great"];
