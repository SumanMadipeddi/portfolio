import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, ExternalLink, Github, Linkedin, Mail, MapPin, Mic, Moon, Phone, Send, Square, Sun, X } from "lucide-react";
import profileImage from "@/assets/profile-hero.jpg";
import graphRagImage from "@/assets/graphRAG.png";
import mobileQaImage from "@/assets/mobileQA.png";
import ragVoiceImage from "@/assets/rag_voice_agent.png";
import fineTuningImage from "@/assets/finetuning.jpg";
import objectSegImage from "@/assets/ObjectSegmentation.jpg";
import cryptoStreamImage from "@/assets/crypto_stream.png";
import { downloadResume } from "@/lib/resume";

type Theme = "light" | "dark";
type ChatRole = "user" | "assistant";

type ChatItem = {
  role: ChatRole;
  content: string;
};

type Project = {
  name: string;
  desc: string;
  stack: string[];
  image: string;
  githubLink: string;
  demoLink: string;
};

const XIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const SYSTEM_PROMPT = `You are Suman Madipeddi's AI assistant. Answer concisely in 2-3 sentences.

Suman is a Founding AI Engineer specializing in agentic AI systems, LLM pipelines, and production ML.

Key facts:
- Founding/first AI hire twice — owns architecture, infra, and roadmap from day one
- Shipped Python SDK + REST APIs to 100K+ users handling 1M+ queries/month  
- Built multi-agent LangGraph pipelines, RAG over 10M+ docs, LLaMA fine-tuning (10x cost reduction)
- Full production stack: LangSmith observability, agentic evals, vLLM inference, Pinecone/Weaviate
- Open to: Founding AI Engineer, AI Software Engineer, Agentic AI Engineer roles
- Location: San Jose CA, open to remote and relocation
- Email: smadiped@asu.edu
- LinkedIn: linkedin.com/in/suman-madipeddi
- GitHub: github.com/SumanMadipeddi

Target companies: AI-first startups, Series A/B building agentic products, companies that need someone who can go 0→1 on AI infrastructure.

Be confident and specific. Never vague.`;

const suggestions = [
  "What do you specialize in?",
  "Tell me about your AI projects",
  "Are you open to work?",
];

const experiences = [
  {
    period: "10/2025 – Present",
    title: "AI/ML Software Engineer",
    company: "Stealth AI Startup",
    desc: "Architected multi-agent LangGraph pipelines and document intelligence systems serving 100K+ users. Designed and shipped a Python SDK + REST APIs endpoints. Built full observability stack: LangSmith tracing, latency dashboards, and agentic eval harnesses."
  },
  {
    period: "08/2024 - 10/2025",
    title: "Founding AI Engineer",
    company: "Minor Chores",
    desc: "Fine-tuned LLaMA 3 with LoRA/QLoRA - 10x inference cost reduction via vLLM quantized serving. Shipped conversational RAG Agents, recommendation systems and Mobile dev (IOS/android). Led cross-platform product delivery and increased 40% customer engagement.",
  },
  {
    period: "Earlier",
    title: "Software + ML Engineering",
    company: "Product and startup teams",
    desc: "Built scalable APIs, AI automation pipelines, and data systems with a focus on measurable business outcomes and fast iteration cycles.",
  },
];

const projects: Project[] = [
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
    stack: ["Agent-S3", "LLM Orchestration", "Python","Android"],
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
  {
    name: "Realtime Crypto Stream",
    desc: "Realtime crypto tracking with web automation, streaming transport, and interactive data viss.",
    stack: ["Playwright", "Next.js", "Express", "WebSocket"],
    image: cryptoStreamImage,
    githubLink: "https://github.com/SumanMadipeddi/CryptoStream",
    demoLink: "https://drive.google.com/file/d/1bn_vYEWu2fOZ9z2U2BSRdlxKyTWM1hxi/view?usp=drive_link",
  },
];

const techStack = [
  "Python",
  "PyTorch",
  "LangChain",
  "LangGraph",
  "LlamaIndex",
  "Gemini API",
  "Claude API",
  "Pinecone",
  "Weaviate",
  "FastAPI",
  "AWS",
  "Docker",
  "Kubernetes",
  "React",
  "TypeScript",
];

const stats = [
  { value: 2, suffix: "+", label: "Years in AI/ML" },
  { value: 10, suffix: "K+", label: "Served via SDK & APIs" },
  { value: 9, suffix: "+", label: "AI systems shipped" },
  // { value: 2, suffix: "", label: "Founding/early roles" },
  { value: 1,   suffix: "M+", label: "Production AI queries" },
  // { value: 3, suffix: "K+", label: "Monthly AI queries" },
];

// const productionDepth = [
//   {
//     icon: "◈",
//     title: "Observability & Tracing",
//     desc: "LangSmith, OpenTelemetry, custom latency dashboards. Every agent decision is logged, traced, and debuggable in production.",
//     accent: "blue",
//   },
//   {
//     icon: "◈",
//     title: "Agentic Evals",
//     desc: "Built eval harnesses for multi-step agent pipelines — measuring task completion, hallucination rate, tool-call accuracy across 1M+ traces.",
//     accent: "purple",
//   },
//   {
//     icon: "◈",
//     title: "SDK & API Delivery",
//     desc: "Shipped Python SDK + CURL-ready REST APIs to 100K+ users. Versioned endpoints, rate limiting, async job handling, structured error responses.",
//     accent: "green",
//   },
//   {
//     icon: "◈",
//     title: "Inference Optimization",
//     desc: "vLLM serving, quantization (GPTQ/AWQ), batching strategies. Reduced p99 latency by 10x on fine-tuned LLaMA deployments.",
//     accent: "amber",
//   },
//   {
//     icon: "◈",
//     title: "RAG at Scale",
//     desc: "Hybrid search, re-ranking, contextual compression, query routing. Pinecone + Weaviate. Eval-driven iteration on retrieval quality metrics.",
//     accent: "blue",
//   },
//   {
//     icon: "◈",
//     title: "Multi-Agent Systems",
//     desc: "LangGraph state machines, tool-use agents, planning + reflection loops. Shipped to production with human-in-the-loop fallback and retry logic.",
//     accent: "purple",
//   },
// ];

type TerminalSkillLine = {
  prompt: ">" | "#";
  text: string;
};

const terminalSkillLines: TerminalSkillLine[] = [
  { prompt: ">", text: "Booting production skill profile..." },
  { prompt: ">", text: "Agent orchestration and LLM systems  [online]" },
  { prompt: ">", text: "Observability, tracing, agentic evals [ready]" },
  { prompt: ">", text: "RAG and vector search at scale        [ready]" },
  { prompt: ">", text: "MLOps, fine-tuning, inference serving [ready]" },
  { prompt: ">", text: "Cloud infra (AWS, Docker, K8s)        [ready]" },
  { prompt: "#", text: "Core skills loaded." },
];

const ABOUT_WORDS_TOP = ["build and", "ship and", "scale and"];
const ABOUT_WORDS_BOTTOM = ["think", "execute", "improve"];
const EXPERIENCE_WORDS_TOP = ["built", "scaled", "shipped"];
const EXPERIENCE_WORDS_BOTTOM = ["that matter", "for users", "in production"];
const WORK_WORDS = ["built", "shipped", "deployed"];
const CONTACT_WORDS = ["something", "AI products", "great"];

const useCyclingWord = (
  words: string[],
  options?: { charMs?: number; deleteMs?: number; holdMs?: number; pauseMs?: number },
) => {
  const { charMs = 60, deleteMs = 30, holdMs = 1800, pauseMs = 300 } = options || {};
  const [text, setText] = useState("");

  useEffect(() => {
    if (!words.length) return;
    let idx = 0;
    let charIdx = 0;
    let deleting = false;
    let timer: number | undefined;

    const tick = () => {
      const word = words[idx];
      if (!deleting) {
        setText(word.slice(0, ++charIdx));
        if (charIdx >= word.length) {
          deleting = true;
          timer = window.setTimeout(tick, holdMs);
          return;
        }
      } else {
        setText(word.slice(0, --charIdx));
        if (charIdx <= 0) {
          deleting = false;
          idx = (idx + 1) % words.length;
          timer = window.setTimeout(tick, pauseMs);
          return;
        }
      }
      timer = window.setTimeout(tick, deleting ? deleteMs : charMs);
    };

    timer = window.setTimeout(tick, 500);
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [words, charMs, deleteMs, holdMs, pauseMs]);

  return text;
};

const isBrowser = typeof window !== "undefined";

const Index = () => {
  const [theme, setTheme] = useState<Theme>("dark");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatItem[]>([
    {
      role: "assistant",
      content: "Hey! I'm Suman's AI. Ask me anything about his work, skills, or experience.",
    },
  ]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceToast, setVoiceToast] = useState("");
  const [voiceLiveText, setVoiceLiveText] = useState("");
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [avatarImageError, setAvatarImageError] = useState(false);
  const [contactStatus, setContactStatus] = useState("");
  const [isContactSending, setIsContactSending] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [typedSkillLines, setTypedSkillLines] = useState<string[]>([]);
  const [activeSkillLineIndex, setActiveSkillLineIndex] = useState<number>(-1);

  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  const cursorRingRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chatMessagesRef = useRef<HTMLDivElement | null>(null);
  const chatPanelRef = useRef<HTMLDivElement | null>(null);
  const chatBubbleRef = useRef<HTMLButtonElement | null>(null);
  const heroTerminalRef = useRef<HTMLDivElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const autoStopTimerRef = useRef<number | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const voiceLiveTextRef = useRef("");
  const lastVoiceReplyRef = useRef("");
  const aiAudioRef = useRef<HTMLAudioElement | null>(null);
  const isAiSpeakingRef = useRef(false);
  const webAudioPlaybackSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const voiceRequestControllerRef = useRef<AbortController | null>(null);
  const voiceInterruptedRef = useRef(false);
  const lastBargeInAtRef = useRef<number>(0);
  const voiceSessionActiveRef = useRef(false);
  const voiceTurnBusyRef = useRef(false);
  const vadRafRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioSourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const isUtteranceRecordingRef = useRef(false);
  const utteranceSpeechStartRef = useRef<number>(0);
  const utteranceLastVoiceAtRef = useRef<number>(0);
  const resumeListeningAtRef = useRef<number>(0);
  const selectedRecorderMimeRef = useRef<string>("");

  const aboutWordTop = useCyclingWord(ABOUT_WORDS_TOP);
  const aboutWordBottom = useCyclingWord(ABOUT_WORDS_BOTTOM);
  const experienceWordTop = useCyclingWord(EXPERIENCE_WORDS_TOP);
  const experienceWordBottom = useCyclingWord(EXPERIENCE_WORDS_BOTTOM);
  const workWord = useCyclingWord(WORK_WORDS);
  const contactWord = useCyclingWord(CONTACT_WORDS);

  const chatHistory = useMemo(
    () =>
      chatMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    [chatMessages],
  );

  const keySoundRef = useRef<HTMLAudioElement | null>(null);
  const lastTypeSoundAtRef = useRef(0);
  const terminalVisibleRef = useRef(true);

  useEffect(() => {
    const a = new Audio("/sounds/key-clic.mp3");
    a.volume = 0.1; // 0.0 - 1.0
    a.preload = "auto";
    keySoundRef.current = a;
  }, []);

  const playTypeSound = useCallback(() => {
    if (!terminalVisibleRef.current) return;
    const base = keySoundRef.current;
    if (!base) return;

    const now = performance.now();
    if (now - lastTypeSoundAtRef.current < 22) return; // throttle
    lastTypeSoundAtRef.current = now;

    const click = base.cloneNode() as HTMLAudioElement;
    click.volume = base.volume;
    void click.play().catch(() => {});
  }, []);

  useEffect(() => {
    if (!isBrowser || !heroTerminalRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.25);
        terminalVisibleRef.current = visible;
      },
      { threshold: [0, 0.25, 0.5, 1] },
    );

    observer.observe(heroTerminalRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isBrowser) return;
    let cancelled = false;

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        window.setTimeout(resolve, ms);
      });

    const run = async () => {
      while (!cancelled) {
        setTypedSkillLines([]);
        for (let i = 0; i < terminalSkillLines.length; i += 1) {
          if (cancelled) return;
          while (!cancelled && !terminalVisibleRef.current) {
            await sleep(120);
          }
          if (cancelled) return;
          setActiveSkillLineIndex(i);
          setTypedSkillLines((prev) => [...prev, ""]);
          let typed = "";
          for (const char of terminalSkillLines[i].text) {
            if (cancelled) return;
            while (!cancelled && !terminalVisibleRef.current) {
              await sleep(120);
            }
            if (cancelled) return;
            typed += char;
            setTypedSkillLines((prev) => {
              const next = [...prev];
              next[i] = typed;
              return next;
            });
            playTypeSound();
            await sleep(20);
          }
          await sleep(120);
        }
        setActiveSkillLineIndex(-1);
        await sleep(2300);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [playTypeSound]);

  useEffect(() => {
    voiceLiveTextRef.current = voiceLiveText;
  }, [voiceLiveText]);

  useEffect(() => {
    isAiSpeakingRef.current = isAiSpeaking;
  }, [isAiSpeaking]);

  useEffect(() => {
    if (!isBrowser) return;
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const initialTheme = savedTheme || "dark";
    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    localStorage.setItem("theme", nextTheme);
  };

  useEffect(() => {
    if (!isBrowser) return;

    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      const p = max > 0 ? (window.scrollY / max) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, p)));
      setIsScrolled(window.scrollY > 60);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isBrowser) return;

    const revealEls = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const counters = Array.from(document.querySelectorAll<HTMLElement>(".count-up"));
    const started = new WeakSet<HTMLElement>();

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.15 },
    );

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          if (started.has(el)) return;
          started.add(el);

          const target = Number(el.dataset.target || "0");
          let current = 0;
          const step = Math.max(1, target / 40);
          const timer = window.setInterval(() => {
            current = Math.min(target, current + step);
            el.textContent = String(Math.floor(current));
            if (current >= target) window.clearInterval(timer);
          }, 40);
          counterObserver.unobserve(el);
        });
      },
      { threshold: 0.5 },
    );

    revealEls.forEach((el) => revealObserver.observe(el));
    counters.forEach((el) => counterObserver.observe(el));

    return () => {
      revealObserver.disconnect();
      counterObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isBrowser) return;

    const dot = cursorDotRef.current;
    const ring = cursorRingRef.current;
    if (!dot || !ring) return;

    let mx = -100;
    let my = -100;
    let rx = -100;
    let ry = -100;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = `${mx}px`;
      dot.style.top = `${my}px`;
    };

    const interactiveSelector = "a, button, .project-card, .exp-item, .suggestion, .nav-cta, .card";
    const onOver = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest(interactiveSelector)) {
        document.body.classList.add("cursor-hover");
      }
    };
    const onOut = (e: Event) => {
      const related = (e as MouseEvent).relatedTarget as HTMLElement | null;
      if (!related?.closest(interactiveSelector)) {
        document.body.classList.remove("cursor-hover");
      }
    };

    const animate = () => {
      rx += (mx - rx) * 0.25;
      ry += (my - ry) * 0.25;
      ring.style.left = `${rx}px`;
      ring.style.top = `${ry}px`;
      raf = window.requestAnimationFrame(animate);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    raf = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.body.classList.remove("cursor-hover");
    };
  }, []);

  useEffect(() => {
    if (!isBrowser) return;

    const cards = Array.from(document.querySelectorAll<HTMLElement>(".card"));
    const onMove = (e: MouseEvent, card: HTMLElement) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--mx", `${x}%`);
      card.style.setProperty("--my", `${y}%`);
    };

    const handlers: Array<() => void> = [];
    cards.forEach((card) => {
      const fn = (e: MouseEvent) => onMove(e, card);
      card.addEventListener("mousemove", fn);
      handlers.push(() => card.removeEventListener("mousemove", fn));
    });

    return () => handlers.forEach((cleanup) => cleanup());
  }, []);

  useEffect(() => {
    if (!isBrowser) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let raf = 0;
    let mx = width / 2;
    let my = height / 2;

    const PARTICLE_COUNT = 300;
    const CONNECTION_DIST = 130;
    const MOUSE_RADIUS = 180;
    const MOUSE_STRENGTH = 1.4;
    const PARTICLE_SPEED = 0.45;
    const P_SIZE_MIN = 0.8;
    const P_SIZE_MAX = 2.5;
    const PARTICLE_RGB = "41,151,255";
    const CONNECTION_RGB = "41,151,255";
    const CANVAS_OPACITY = 0.85;

    type Particle = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      alpha: number;
      life: number;
      maxLife: number;
      reset: () => void;
      update: () => void;
      draw: () => void;
    };

    const particles: Particle[] = [];
    canvas.style.opacity = String(CANVAS_OPACITY);

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const createParticle = (): Particle => {
      const p = {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * PARTICLE_SPEED,
        vy: (Math.random() - 0.5) * PARTICLE_SPEED,
        r: Math.random() * (P_SIZE_MAX - P_SIZE_MIN) + P_SIZE_MIN,
        alpha: Math.random() * 0.5 + 0.1,
        life: 0,
        maxLife: Math.random() * 400 + 200,
        reset() {
          this.x = Math.random() * width;
          this.y = Math.random() * height;
          this.vx = (Math.random() - 0.5) * PARTICLE_SPEED;
          this.vy = (Math.random() - 0.5) * PARTICLE_SPEED;
          this.r = Math.random() * (P_SIZE_MAX - P_SIZE_MIN) + P_SIZE_MIN;
          this.alpha = Math.random() * 0.5 + 0.1;
          this.life = 0;
          this.maxLife = Math.random() * 400 + 200;
        },
        update() {
          this.x += this.vx;
          this.y += this.vy;
          this.life += 1;
          const dist = Math.hypot(this.x - mx, this.y - my);
          if (dist < MOUSE_RADIUS && dist > 0) {
            const f = ((MOUSE_RADIUS - dist) / MOUSE_RADIUS) * MOUSE_STRENGTH;
            this.vx += ((this.x - mx) / dist) * f;
            this.vy += ((this.y - my) / dist) * f;
          }
          this.vx *= 0.99;
          this.vy *= 0.99;

          if (this.life > this.maxLife || this.x < -10 || this.x > width + 10 || this.y < -10 || this.y > height + 10) {
            this.reset();
          }
        },
        draw() {
          const t = this.life / this.maxLife;
          const a = this.alpha * Math.sin(t * Math.PI);
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${PARTICLE_RGB},${a})`;
          ctx.fill();
        },
      };
      return p;
    };

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const d = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if (d < CONNECTION_DIST) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${CONNECTION_RGB},${0.12 * (1 - d / CONNECTION_DIST)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      drawConnections();
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      raf = window.requestAnimationFrame(animate);
    };

    resize();
    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      particles.push(createParticle());
    }

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    raf = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  useEffect(() => {
    if (!chatMessagesRef.current) return;
    chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
  }, [chatMessages, isThinking]);

  useEffect(() => {
    return () => {
      if (autoStopTimerRef.current) {
        window.clearTimeout(autoStopTimerRef.current);
        autoStopTimerRef.current = null;
      }
      if (vadRafRef.current) {
        window.cancelAnimationFrame(vadRafRef.current);
        vadRafRef.current = null;
      }
      voiceSessionActiveRef.current = false;
      voiceTurnBusyRef.current = false;
      isUtteranceRecordingRef.current = false;
      mediaRecorderRef.current = null;
      if (audioSourceNodeRef.current) {
        try {
          audioSourceNodeRef.current.disconnect();
        } catch {
          // noop
        }
        audioSourceNodeRef.current = null;
      }
      analyserRef.current = null;
      if (audioContextRef.current) {
        void audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
      if (aiAudioRef.current) {
        aiAudioRef.current.pause();
        aiAudioRef.current.src = "";
        aiAudioRef.current = null;
      }
      if (webAudioPlaybackSourceRef.current) {
        try {
          webAudioPlaybackSourceRef.current.stop();
        } catch {
          // noop
        }
        webAudioPlaybackSourceRef.current = null;
      }
      if (voiceRequestControllerRef.current) {
        try {
          voiceRequestControllerRef.current.abort();
        } catch {
          // noop
        }
        voiceRequestControllerRef.current = null;
      }
      const recognition = speechRecognitionRef.current;
      if (recognition) {
        try {
          recognition.stop();
        } catch {
          // noop
        }
        speechRecognitionRef.current = null;
      }
      setIsListening(false);
      isAiSpeakingRef.current = false;
      setIsAiSpeaking(false);
    };
  }, []);

  useEffect(() => {
    if (!isChatOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInsidePanel = !!chatPanelRef.current?.contains(target);
      const clickedBubble = !!chatBubbleRef.current?.contains(target);
      if (!clickedInsidePanel && !clickedBubble) {
        setIsChatOpen(false);
      }
    };

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsChatOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [isChatOpen]);

  const interruptAiOutput = () => {
    if (aiAudioRef.current) {
      try {
        aiAudioRef.current.pause();
        aiAudioRef.current.currentTime = 0;
      } catch {
        // noop
      }
      aiAudioRef.current = null;
    }
    if (webAudioPlaybackSourceRef.current) {
      try {
        webAudioPlaybackSourceRef.current.stop();
      } catch {
        // noop
      }
      webAudioPlaybackSourceRef.current = null;
    }
    isAiSpeakingRef.current = false;
    setIsAiSpeaking(false);
  };

  const interruptInFlightVoiceTurn = () => {
    voiceInterruptedRef.current = true;
    if (voiceRequestControllerRef.current) {
      try {
        voiceRequestControllerRef.current.abort();
      } catch {
        // noop
      }
      voiceRequestControllerRef.current = null;
    }
    voiceTurnBusyRef.current = false;
    setIsThinking(false);
  };

  const sendMessage = async (forcedText?: string) => {
    const content = (forcedText ?? chatInput).trim();
    if (!content) return;

    interruptAiOutput();
    interruptInFlightVoiceTurn();
    if (voiceSessionActiveRef.current) {
      stopVoiceSession();
    }

    setChatInput("");
    setShowSuggestions(false);
    setIsThinking(true);

    const nextUserMessage: ChatItem = { role: "user", content };
    const nextHistory = [...chatHistory, nextUserMessage];
    setChatMessages((prev) => [...prev, nextUserMessage]);

    try {
      const endpoint = (import.meta.env.VITE_CHAT_API_URL as string | undefined) || "/api/chat";
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 30000);
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            message: content,
            history: nextHistory,
            systemPrompt: SYSTEM_PROMPT,
          }),
        });

        const raw = await response.text();
        let data: { error?: string; reply?: string } = {};
        if (raw) {
          try {
            data = JSON.parse(raw);
          } catch {
            if (!response.ok) {
              throw new Error(raw);
            }
            throw new Error("Received an invalid response from chat API.");
          }
        }
        if (!response.ok) {
          throw new Error(data?.error || `Unable to get reply right now (status ${response.status}).`);
        }

        const replyText = String(data?.reply || "").trim();
        setChatMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: replyText || "I could not generate a response right now. Please reach Suman via email or LinkedIn.",
          },
        ]);
      } finally {
        window.clearTimeout(timeoutId);
      }
    } catch (error) {
      const errorMessage =
        error instanceof DOMException && error.name === "AbortError"
          ? "Request timed out. Please try again."
          : error instanceof Error && error.message
            ? error.message
            : "Connection issue right now. Please contact Suman at smadiped@asu.edu.";
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage,
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const stopRecording = () => {
    if (autoStopTimerRef.current) {
      window.clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === "recording") {
      isUtteranceRecordingRef.current = false;
      try {
        recorder.stop();
      } catch {
        // noop
      }
    }
  };

  const stopLiveTranscription = () => {
    const recognition = speechRecognitionRef.current;
    if (!recognition) return;
    try {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.stop();
    } catch {
      // noop
    }
    speechRecognitionRef.current = null;
  };

  const startLiveTranscription = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setVoiceToast("Live transcription is unavailable in this browser");
      window.setTimeout(() => setVoiceToast(""), 2200);
      return;
    }
    stopLiveTranscription();
    const recognition = new SR();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i += 1) {
        transcript += event.results[i][0]?.transcript || "";
      }
      setVoiceLiveText(transcript.trim());
    };

    recognition.onerror = () => {
      // keep recording even if transcript API errors
    };

    recognition.onend = () => {
      if (voiceSessionActiveRef.current) {
        try {
          recognition.start();
        } catch {
          // noop
        }
      }
    };

    speechRecognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      speechRecognitionRef.current = null;
    }
  };

  const stopVoiceSession = () => {
    voiceSessionActiveRef.current = false;
    voiceTurnBusyRef.current = false;
    isUtteranceRecordingRef.current = false;
    interruptInFlightVoiceTurn();
    stopRecording();
    stopLiveTranscription();

    if (vadRafRef.current) {
      window.cancelAnimationFrame(vadRafRef.current);
      vadRafRef.current = null;
    }
    if (audioSourceNodeRef.current) {
      try {
        audioSourceNodeRef.current.disconnect();
      } catch {
        // noop
      }
      audioSourceNodeRef.current = null;
    }
    analyserRef.current = null;
    if (audioContextRef.current) {
      void audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;

    interruptAiOutput();
    setIsListening(false);
    setVoiceLiveText("");
    setVoiceToast("");
  };

  const sendVoiceBlob = async (audioBlob: Blob, blobType: string, transcriptText: string) => {
    if (!audioBlob.size || !voiceSessionActiveRef.current) return;
    if (voiceTurnBusyRef.current) return;

    voiceInterruptedRef.current = false;
    voiceTurnBusyRef.current = true;
    setIsThinking(true);
    setIsChatOpen(true);
    setVoiceToast("Processing...");

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = String(reader.result || "");
          const payload = dataUrl.split(",")[1];
          if (!payload) reject(new Error("Failed to encode audio"));
          else resolve(payload);
        };
        reader.onerror = () => reject(new Error("Failed to read audio blob"));
        reader.readAsDataURL(audioBlob);
      });

      let historyForVoice = chatHistory;
      if (transcriptText) {
        const userTranscriptMessage: ChatItem = { role: "user", content: transcriptText };
        setChatMessages((prev) => [...prev, userTranscriptMessage]);
        historyForVoice = [...chatHistory, userTranscriptMessage];
      }

      const voiceEndpoint = (import.meta.env.VITE_VOICE_API_URL as string | undefined) || "/api/voice";
      const controller = new AbortController();
      voiceRequestControllerRef.current = controller;
      const timeoutId = window.setTimeout(() => controller.abort(), 45000);
      let response: Response | null = null;
      let data: any = {};
      try {
        response = await fetch(voiceEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            audioBase64: base64,
            mimeType: blobType,
            history: historyForVoice,
            systemPrompt: SYSTEM_PROMPT,
          }),
        });

        const raw = await response.text();
        if (raw) {
          try {
            data = JSON.parse(raw);
          } catch {
            if (!response.ok) {
              throw new Error(raw);
            }
            throw new Error("Voice API returned invalid JSON.");
          }
        }
      } finally {
        voiceRequestControllerRef.current = null;
        window.clearTimeout(timeoutId);
      }

      if (!response || !response.ok) {
        throw new Error(data?.error || "Voice request failed");
      }

      const reply = String(data?.reply || "").trim();
      if (!reply) throw new Error("Empty voice reply");

      const responseAudioBase64 = String(data?.audioBase64 || "").trim();
      const responseAudioMimeType = String(data?.audioMimeType || "audio/wav").trim();
      const ttsError = String(data?.ttsError || "").trim();

      setShowSuggestions(false);
      setChatMessages((prev) => [...prev, { role: "assistant", content: reply }]);

      if (responseAudioBase64) {
        let played = false;
        const dataUri = `data:${responseAudioMimeType};base64,${responseAudioBase64}`;
        const aiAudio = new Audio(dataUri);
        aiAudioRef.current = aiAudio;
        isAiSpeakingRef.current = true;
        setIsAiSpeaking(true);

        try {
          await new Promise<void>((resolve, reject) => {
            aiAudio.onended = () => resolve();
            aiAudio.onerror = () => reject(new Error("Gemini audio playback failed."));
            void aiAudio.play().catch(() => reject(new Error("Gemini audio playback failed.")));
          });
          played = true;
        } catch {
          played = false;
        }

        if (!played) {
          const ctx = audioContextRef.current;
          if (!ctx) {
            throw new Error("Gemini audio playback failed.");
          }
          try {
            if (ctx.state === "suspended") {
              await ctx.resume();
            }
            const audioBytes = Uint8Array.from(atob(responseAudioBase64), (c) => c.charCodeAt(0));
            const arrayBuffer = audioBytes.buffer.slice(
              audioBytes.byteOffset,
              audioBytes.byteOffset + audioBytes.byteLength,
            ) as ArrayBuffer;
            const decoded = await ctx.decodeAudioData(arrayBuffer);
            await new Promise<void>((resolve) => {
              const source = ctx.createBufferSource();
              webAudioPlaybackSourceRef.current = source;
              source.buffer = decoded;
              source.connect(ctx.destination);
              source.onended = () => {
                if (webAudioPlaybackSourceRef.current === source) {
                  webAudioPlaybackSourceRef.current = null;
                }
                resolve();
              };
              source.start(0);
            });
          } catch {
            throw new Error("Gemini audio playback failed.");
          }
        }
      } else {
        setVoiceToast(ttsError ? `TTS failed: ${ttsError}` : "No Gemini audio returned for this model");
        window.setTimeout(() => setVoiceToast(""), 1800);
        if (ttsError) {
          setChatMessages((prev) => [
            ...prev,
            { role: "assistant", content: `TTS failed: ${ttsError}` },
          ]);
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof DOMException && error.name === "AbortError"
          ? "Voice request timed out. Please try again."
          : error instanceof Error && error.message
          ? error.message
          : "Voice request failed. Please try again or type your question.";
      if (error instanceof DOMException && error.name === "AbortError" && voiceInterruptedRef.current) {
        return;
      }
      if (voiceSessionActiveRef.current) {
        setChatMessages((prev) => [...prev, { role: "assistant", content: errorMessage }]);
        setVoiceToast("Voice request failed");
        window.setTimeout(() => setVoiceToast(""), 1800);
      }
    } finally {
      isAiSpeakingRef.current = false;
      setIsAiSpeaking(false);
      if (aiAudioRef.current) {
        aiAudioRef.current = null;
      }
      webAudioPlaybackSourceRef.current = null;
      setIsThinking(false);
      voiceTurnBusyRef.current = false;
      if (voiceSessionActiveRef.current) {
        resumeListeningAtRef.current = performance.now() + 450;
        setVoiceToast("Listening...");
      }
    }
  };

  const toggleVoice = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !(window as any).MediaRecorder) {
      setVoiceToast("Voice recording is not supported in this browser");
      window.setTimeout(() => setVoiceToast(""), 2800);
      return;
    }

    if (voiceSessionActiveRef.current) {
      stopVoiceSession();
      return;
    }

    interruptAiOutput();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;
      setIsChatOpen(true);
      setIsListening(true);
      setVoiceLiveText("");
      setVoiceToast("Listening...");
      voiceSessionActiveRef.current = true;

      const mimeCandidates = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/ogg;codecs=opus",
      ];
      selectedRecorderMimeRef.current =
        mimeCandidates.find((m) => (window as any).MediaRecorder?.isTypeSupported?.(m)) || "";

      const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
      const audioContext = new Ctx();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.75;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      audioSourceNodeRef.current = source;

      const startUtteranceRecorder = () => {
        if (!voiceSessionActiveRef.current || voiceTurnBusyRef.current || isUtteranceRecordingRef.current) return;
        audioChunksRef.current = [];
        const recorder = selectedRecorderMimeRef.current
          ? new MediaRecorder(stream, { mimeType: selectedRecorderMimeRef.current })
          : new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        isUtteranceRecordingRef.current = true;
        utteranceSpeechStartRef.current = performance.now();
        utteranceLastVoiceAtRef.current = performance.now();
        setVoiceLiveText("");
        startLiveTranscription();

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        recorder.onerror = () => {
          isUtteranceRecordingRef.current = false;
        };

        recorder.onstop = async () => {
          stopLiveTranscription();
          const blobType = selectedRecorderMimeRef.current || recorder.mimeType || "audio/webm";
          const audioBlob = new Blob(audioChunksRef.current, { type: blobType });
          audioChunksRef.current = [];
          isUtteranceRecordingRef.current = false;
          if (!voiceSessionActiveRef.current) return;
          const transcriptText = voiceLiveTextRef.current.trim();
          setVoiceLiveText("");
          await sendVoiceBlob(audioBlob, blobType, transcriptText);
        };

        recorder.start(200);
      };

      const data = new Uint8Array(analyser.fftSize);
      const VAD_THRESHOLD = 0.028;
      const SPEECH_START_MS = 140;
      const SILENCE_END_MS = 850;
      const MIN_UTTERANCE_MS = 350;
      const MAX_UTTERANCE_MS = 12_000;
      let speechAboveThresholdSince = 0;

      const vadTick = () => {
        if (!voiceSessionActiveRef.current) return;
        analyser.getByteTimeDomainData(data);

        let sum = 0;
        for (let i = 0; i < data.length; i += 1) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        const now = performance.now();
        const isSpeaking = rms >= VAD_THRESHOLD;

        if (isSpeaking && isAiSpeakingRef.current && now - lastBargeInAtRef.current > 250) {
          lastBargeInAtRef.current = now;
          interruptAiOutput();
          resumeListeningAtRef.current = now;
        }

        if (!voiceTurnBusyRef.current && !isAiSpeakingRef.current && now >= resumeListeningAtRef.current) {
          if (!isUtteranceRecordingRef.current) {
            if (isSpeaking) {
              if (!speechAboveThresholdSince) speechAboveThresholdSince = now;
              if (now - speechAboveThresholdSince >= SPEECH_START_MS) {
                startUtteranceRecorder();
                speechAboveThresholdSince = 0;
              }
            } else {
              speechAboveThresholdSince = 0;
            }
          } else {
            if (isSpeaking) {
              utteranceLastVoiceAtRef.current = now;
            }
            const longEnough = now - utteranceSpeechStartRef.current >= MIN_UTTERANCE_MS;
            const silenceLongEnough = now - utteranceLastVoiceAtRef.current >= SILENCE_END_MS;
            const maxReached = now - utteranceSpeechStartRef.current >= MAX_UTTERANCE_MS;
            if ((longEnough && silenceLongEnough) || maxReached) {
              stopRecording();
            }
          }
        }

        vadRafRef.current = window.requestAnimationFrame(vadTick);
      };

      vadRafRef.current = window.requestAnimationFrame(vadTick);
    } catch {
      stopVoiceSession();
      setVoiceToast("Microphone permission denied");
      window.setTimeout(() => setVoiceToast(""), 1800);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isContactSending) return;

    const name = contactForm.name.trim();
    const email = contactForm.email.trim();
    const subjectText = contactForm.subject.trim();
    const messageText = contactForm.message.trim();

    if (!name || !email || !subjectText || !messageText) {
      setContactStatus("Please fill all fields before sending.");
      return;
    }

    const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailLooksValid) {
      setContactStatus("Please enter a valid email address.");
      return;
    }

    const serviceId = String(import.meta.env.VITE_EMAILJS_SERVICE_ID || "").trim();
    const templateId = String(import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "").trim();
    const publicKey = String(import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "").trim();
    if (!serviceId || !templateId || !publicKey) {
      setContactStatus("Email service is not configured.");
      return;
    }

    try {
      setIsContactSending(true);
      setContactStatus("Sending...");

      const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          template_params: {
            from_name: name,
            from_email: email,
            subject: subjectText,
            message: messageText,
            to_name: "Suman Madipeddi",
          },
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(body || `Email send failed (${response.status})`);
      }

      setContactForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
      setContactStatus("Message sent successfully.");
    } catch {
      setContactStatus("Failed to send message. Please try again.");
    } finally {
      setIsContactSending(false);
    }
  };

  return (
    <div className="v2">
      <div className="cursor" ref={cursorDotRef} />
      <div className="cursor-ring" ref={cursorRingRef} />
      <canvas id="particleCanvas" ref={canvasRef} />
      <div className="progress-bar" style={{ width: `${scrollProgress}%` }} />

      <nav id="navbar" style={{ background: isScrolled ? "var(--nav-bg-scrolled)" : "var(--nav-bg)" }}>
        <div className="nav-logo">
          <div className="hero-photo-wrap nav-photo-wrap">
            {avatarImageError ? (
              <div className="hero-photo-fallback nav-photo-fallback">SM</div>
            ) : (
              <img
                src={profileImage}
                alt="Suman Madipeddi"
                className="hero-photo"
                onError={() => setAvatarImageError(true)}
              />
            )}
          </div>
          <span className="nav-logo-text">
            Suman<span className="nav-logo-dot"></span>
          </span>
        </div>
        <ul className="nav-links">
          <li><a href="#about">About</a></li>
          <li><a href="#experience">Experience</a></li>
          <li><a href="#projects">Projects</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <div className="nav-actions">
          <button className="theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button className="nav-cta" onClick={() => setIsChatOpen((v) => !v)}>Ask me anything</button>
        </div>
      </nav>

      <section id="hero">
        <div className="hero-layout">
          <div className="hero-main">
            <div className="hero-eyebrow">Founding AI Engineer - Agentic AI Systems</div>
            <h1 className="hero-name">
              Suman
              <br />
              <span className="gradient-text">Madipeddi</span>
            </h1>
            <div className="hero-title">
              Building <strong>AI systems</strong> that think,
              <br />
              learn, and scale.
            </div>
            <p className="hero-desc">
            Founding AI Engineer specializing in agentic systems, LLM pipelines, and production ML-I turn ambitious AI ideas into shipped, scalable products.
            </p>
            <div className="avail-chip">Available for opportunities</div>
            <div className="hero-actions">
              <button className="btn-secondary" onClick={() => document.getElementById("experience")?.scrollIntoView({ behavior: "smooth" })}>
                View my work
              </button>
              <button
                className="btn-secondary btn-download"
                type="button"
                onClick={() => {
                  void downloadResume();
                }}
              >
                <Download size={15} className="download-icon-anim" />
                Download Resume
              </button>
            </div>

            <div className="hero-stats">
              {stats.map((stat) => (
                <div className="stat" key={stat.label}>
                  <div className="stat-num">
                    <span className="count-up" data-target={stat.value}>0</span>
                    {stat.suffix}
                  </div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <aside className="hero-side">
            <div className="hero-terminal" ref={heroTerminalRef}>
              <div className="hero-terminal-bar">
                <div className="t-dot" style={{ background: "#ff5f57" }} />
                <div className="t-dot" style={{ background: "#ffbd2e" }} />
                <div className="t-dot" style={{ background: "#28c840" }} />
                <span className="t-title">suman@core-skills</span>
              </div>
              <div className="hero-terminal-body">
                {typedSkillLines.map((line, idx) => {
                  const prompt = terminalSkillLines[idx]?.prompt || ">";
                  return (
                    <div className="t-line show" key={`skill-line-${idx}`}>
                      <span className={prompt === "#" ? "t-p-ok" : "t-p"}>{prompt}</span>
                      <span className={`t-txt ${idx === activeSkillLineIndex ? "active" : ""}`}>
                        {line}
                        {idx === activeSkillLineIndex && <span className="t-cur" />}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section id="about" style={{ minHeight: "auto", paddingBottom: 0 }}>
        <div className="section-eyebrow reveal">About</div>
        <h2 className="section-title reveal">
          What I <span className="dim tw-inline">{aboutWordTop}<span className="hero-tw-cursor" /></span>
          <br />
          how I <span className="dim tw-inline">{aboutWordBottom}<span className="hero-tw-cursor" /></span>
        </h2>

        <div className="bento">
          <div className="card card-span-12 card-about-main reveal">
            <div className="card-tag">Background</div>
            <div className="card-title">Founding Engineer and AI Systems Architect</div>
            <div className="card-body" style={{ marginTop: 16 }}>
              I build production AI systems that run in production, scale under load. Multi-agent orchestration, LLM pipelines, computer use voice agents and full-stack infrastructure. Been the founding AI hire twice. Owned the architecture, the 3am incidents, and the roadmap.
              <br />
              <br />
              My approach: thrive in ambiguity, ship fast, engineer for production.
            </div>
          </div>

          <div className="card card-span-3 reveal" style={{ background: "linear-gradient(160deg,rgba(41,151,255,0.10),transparent)" }}>
            <div className="card-tag">Impact</div>
            <div className="big-num">
              100<span className="unit">k+</span>
            </div>
            <div className="card-body">Monthly AI query volume handled</div>
          </div>

          <div className="card card-span-3 reveal reveal-delay-1" style={{ background: "linear-gradient(160deg,rgba(191,90,242,0.10),transparent)" }}>
            <div className="card-tag">Scale</div>
            <div className="big-num">
              10<span className="unit">x</span>
            </div>
            <div className="card-body">Inference cost and latency improvements in deployed systems</div>
          </div>

          <div className="card card-span-6 reveal reveal-delay-2">
            <div className="card-tag">Tech Stack</div>
            <div className="tech-grid">
              {techStack.map((tech) => (
                <span className="tech-pill" key={tech}>{tech}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Production Depth — what separates seniors from juniors */}
        {/* <div className="card card-span-12 reveal" style={{ marginTop: 16 }}>
          <div className="card-tag">Production Engineering Depth</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
              marginTop: 16
            }}
          >
            {productionDepth.map((item) => (
              <div
                key={item.title}
                style={{
                  padding: "16px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--accent)",
                    marginBottom: 6,
                    letterSpacing: "-0.2px"
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--text2)",
                    lineHeight: 1.6,
                    fontWeight: 300
                  }}
                >
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div> */}
      </section>

      <section id="experience">
        <div className="section-eyebrow reveal">Experience</div>
        <h2 className="section-title reveal">
          Where I&apos;ve <span className="dim tw-inline">{experienceWordTop}<span className="hero-tw-cursor" /></span>
          <br />
          things <span className="dim tw-inline tw-wide">{experienceWordBottom}<span className="hero-tw-cursor" /></span>
        </h2>

        <div className="card card-span-12 reveal" style={{ padding: "8px 32px" }}>
          <div className="exp-list">
            {experiences.map((exp) => (
              <div className="exp-item" key={`${exp.company}-${exp.title}`}>
                <div className="exp-period">{exp.period}</div>
                <div>
                  <div className="exp-title">{exp.title}</div>
                  <div className="exp-company">{exp.company}</div>
                  <div className="exp-desc">{exp.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="projects">
        <div className="section-eyebrow reveal">Work</div>
        <h2 className="section-title reveal">
          Things I&apos;ve <span className="dim tw-inline">{workWord}<span className="hero-tw-cursor" /></span>
        </h2>

        <div className="project-grid">
          {projects.map((project, idx) => (
            <article
              className={`project-card reveal ${idx % 3 === 1 ? "reveal-delay-1" : ""} ${idx % 3 === 2 ? "reveal-delay-2" : ""}`}
              key={project.name}
            >
              <div className="project-media-wrap">
                <img src={project.image} alt={project.name} className="project-image" />
                <div className="project-links">
                  <a
                    href={project.githubLink}
                    target="_blank"
                    rel="noreferrer"
                    className="project-link-btn"
                    aria-label={`${project.name} GitHub`}
                  >
                    <Github size={14} />
                  </a>
                  <a
                    href={project.demoLink}
                    target="_blank"
                    rel="noreferrer"
                    className="project-link-btn"
                    aria-label={`${project.name} Demo`}
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
              <div className="project-name">{project.name}</div>
              <div className="project-desc">{project.desc}</div>
              <div className="project-stack">
                {project.stack.map((tag) => (
                  <span className="stack-tag" key={tag}>{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="contact" style={{ minHeight: "auto" }}>
        <div className="section-eyebrow reveal">Contact</div>
        <h2 className="section-title reveal">
          Let&apos;s build <span className="dim tw-inline">{contactWord}<span className="hero-tw-cursor" /></span>
        </h2>

        <div className="bento contact-bento">
          <div className="card card-span-8 reveal contact-main-card">
            <div className="card-title" style={{ fontSize: 28, marginBottom: 16 }}>Send me a message</div>
            <form className="contact-form" onSubmit={handleContactSubmit}>
              <div className="contact-row">
                <input
                  className="contact-input"
                  type="text"
                  placeholder="Your name"
                  value={contactForm.name}
                  onChange={(e) => {
                    setContactStatus("");
                    setContactForm((prev) => ({ ...prev, name: e.target.value }));
                  }}
                  required
                />
                <input
                  className="contact-input"
                  type="email"
                  placeholder="your.email@example.com"
                  value={contactForm.email}
                  onChange={(e) => {
                    setContactStatus("");
                    setContactForm((prev) => ({ ...prev, email: e.target.value }));
                  }}
                  required
                />
              </div>
              <input
                className="contact-input"
                type="text"
                placeholder="Subject"
                value={contactForm.subject}
                onChange={(e) => {
                  setContactStatus("");
                  setContactForm((prev) => ({ ...prev, subject: e.target.value }));
                }}
                required
              />
              <textarea
                className="contact-textarea"
                placeholder="Tell me about your project or idea..."
                value={contactForm.message}
                onChange={(e) => {
                  setContactStatus("");
                  setContactForm((prev) => ({ ...prev, message: e.target.value }));
                }}
                rows={5}
                required
              />
              <button className="btn-primary" type="submit" disabled={isContactSending}>
                <Send size={16} />
                {isContactSending ? "Sending..." : "Send Message"}
              </button>
              {contactStatus && <div className="contact-status">{contactStatus}</div>}
            </form>
          </div>

          <div className="card card-span-4 reveal reveal-delay-1 contact-side-card">
            <div className="card-tag">Get in touch</div>
            <div className="contact-links">
              <a className="quick-link" href="mailto:smadiped@asu.edu"><span className="quick-link-left"><Mail size={15} />smadiped@asu.edu</span></a>
              <a className="quick-link" href="tel:+16025659192"><span className="quick-link-left"><Phone size={15} />+1 (602) 565-9192</span></a>
              <a className="quick-link" href="https://maps.google.com/?q=San+Jose,CA" target="_blank" rel="noreferrer"><span className="quick-link-left"><MapPin size={15} />San Jose, CA</span><span>↗</span></a>
              <a className="quick-link" href="https://linkedin.com/in/suman-madipeddi" target="_blank" rel="noreferrer"><span className="quick-link-left"><Linkedin size={15} />LinkedIn</span><span>↗</span></a>
              <a className="quick-link" href="https://github.com/SumanMadipeddi" target="_blank" rel="noreferrer"><span className="quick-link-left"><Github size={15} />GitHub</span><span>↗</span></a>
              <a className="quick-link" href="https://x.com/sumanmadipeddi" target="_blank" rel="noreferrer"><span className="quick-link-left"><XIcon size={14} />X</span><span>↗</span></a>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-left">© 2025 Suman Madipeddi</div>
      </footer>

      <div id="ai-chat">
        <div ref={chatPanelRef} className={`chat-panel ${isChatOpen ? "open" : ""}`} id="chat-panel">
          <div className="chat-header">
            <div className="chat-header-left">
              {avatarImageError ? (
                <div className="chat-avatar">SM</div>
              ) : (
                <img
                  src={profileImage}
                  alt="Suman avatar"
                  className="chat-avatar-photo"
                  onError={() => setAvatarImageError(true)}
                />
              )}
              <div>
                <div className="chat-name">Suman&apos;s AI</div>
                <div className="chat-status">Online</div>
              </div>
            </div>
            <button className="chat-close" onClick={() => setIsChatOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="chat-messages" ref={chatMessagesRef}>
            {chatMessages.map((msg, idx) => (
              <div key={`${msg.role}-${idx}`} className={`msg ${msg.role === "assistant" ? "msg-ai" : "msg-user"}`}>
                {msg.content}
              </div>
            ))}
            {isListening && voiceLiveText && (
              <div className="msg msg-user msg-live">
                {voiceLiveText}
              </div>
            )}
            {isThinking && (
              <div className="typing-indicator" id="typingIndicator">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            )}
          </div>

          {showSuggestions && (
            <div className="chat-suggestions">
              {suggestions.map((s) => (
                <button key={s} className="suggestion" onClick={() => sendMessage(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="chat-input-row">
            <input
              className="chat-input"
              placeholder="Ask anything..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />
            <button
              className={`chat-voice-toggle ${isListening ? "active listening" : ""}`}
              onClick={toggleVoice}
              title={isListening ? "Stop voice" : "Start voice"}
              aria-label={isListening ? "Stop voice" : "Start voice"}
            >
              {isListening ? <Square size={14} /> : <Mic size={15} />}
            </button>
            <button className="chat-send" onClick={() => sendMessage()}>
              <Send size={16} />
            </button>
          </div>
        </div>

        <button ref={chatBubbleRef} className="chat-bubble" id="chatBubble" onClick={() => setIsChatOpen((v) => !v)}>
          <div className="pulse-ring" />
          {avatarImageError ? (
            <div className="chat-bubble-fallback">SM</div>
          ) : (
            <img
              src={profileImage}
              alt="Suman chat"
              className="chat-bubble-photo"
              onError={() => setAvatarImageError(true)}
            />
          )}
        </button>
      </div>

      <button
        className={`voice-btn ${isListening ? "listening" : ""}`}
        id="voiceBtn"
        onClick={toggleVoice}
        title={isListening ? "Tap to stop voice" : "Tap to start voice"}
      >
        {isListening ? <Square size={20} /> : <Mic size={22} />}
      </button>
      <div className={`voice-toast ${voiceToast ? "show" : ""}`} id="voiceToast">{voiceToast}</div>
    </div>
  );
};

export default Index;



