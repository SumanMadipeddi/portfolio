import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, ExternalLink, Github, Linkedin, Mail, MapPin, Mic, Moon, Phone, Send, Square, Sun, X } from "lucide-react";
import profileImage from "@/assets/profile-hero.jpg";
import graphRagImage from "@/assets/graphRAG.png";
import mobileQaImage from "@/assets/mobileQA.png";
import ragVoiceImage from "@/assets/rag_voice_agent.png";
import fineTuningImage from "@/assets/finetuning.jpg";
import objectSegImage from "@/assets/ObjectSegmentation.jpg";
import cryptoStreamImage from "@/assets/crypto_stream.png";

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

const SYSTEM_PROMPT = `You are Suman Madipeddi's AI assistant on his portfolio website. Answer questions about Suman concisely and warmly in 2-4 sentences.

About Suman:
- Founding Engineer specializing in AI/ML, LLM pipelines, RAG, and autonomous agents
- Experience building production AI products at startups and early-stage teams
- Expert in LangChain, LangGraph, LlamaIndex, PyTorch, OpenAI/Anthropic/Gemini APIs, Pinecone, Weaviate, FastAPI, AWS, Docker, Kubernetes
- Key project areas: multi-agent orchestration, RAG systems, fine-tuning pipelines, MLOps infrastructure
- Open to founding ai engineer / AI lead opportunities
- Email: smadiped@asu.edu
- LinkedIn: linkedin.com/in/suman-madipeddi

Be concise, confident, and helpful. Don't invent personal facts that are not provided.`;

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
    desc: "Architected multi-agent LangGraph pipelines and document intelligence systems serving 100K+ users. Built and shipped Python SDK + REST APIs consumed by external developers. Implemented production observability with LangSmith tracing, latency dashboards, and agentic eval harnesses."
  },
  {
    period: "08/2024 - 10/2025",
    title: "Founding AI Engineer",
    company: "Minor Chores",
    desc: "Fine-tuned LLaMA models with LoRA/QLoRA and deployed low-latency serving stacks. Shipped RAG and recommendation systems and led cross-platform product delivery.",
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
    desc: "Graph extraction and retrieval from unstructured PDFs using multi-agent workflows and visual knowledge mapping.",
    stack: ["LangGraph", "LangChain", "Supabase"],
    image: graphRagImage,
    githubLink: "https://github.com/SumanMadipeddi/graphRAG-Agent",
    demoLink: "https://drive.google.com/file/d/1yu_3kWcr04DUCoJ8W04dtCgAta9hCPHp/view?usp=drive_link",
  },
  {
    name: "MobileQA Multi Agent",
    desc: "Automated mobile QA with planning agents, ADB tool execution, and vision-grounded validation loops.",
    stack: ["Python", "LLM Orchestration", "Android"],
    image: mobileQaImage,
    githubLink: "https://github.com/SumanMadipeddi/mobile-QA-Agent",
    demoLink: "https://drive.google.com/file/d/1vqaf3gtaYZeliB1yow5v4HuSNcNp-OAA/view?usp=sharing",
  },
  {
    name: "RAG Voice AI",
    desc: "Voice-enabled multi-agent assistant with retrieval, tool calls, and live real-time conversational workflows.",
    stack: ["LiveKit", "Pinecone", "OpenAI"],
    image: ragVoiceImage,
    githubLink: "https://github.com/SumanMadipeddi/voice-agent",
    demoLink: "https://www.loom.com/share/c7950b8eda37434893fb03e091a89ebe",
  },
  {
    name: "Fine-Tuning and Inference",
    desc: "LoRA/QLoRA fine-tuning and optimized inference serving for domain-specific AI assistants.",
    stack: ["PyTorch", "PEFT", "vLLM"],
    image: fineTuningImage,
    githubLink: "https://github.com/SumanMadipeddi/vllm-finetuned-inference-serving",
    demoLink: "https://github.com/SumanMadipeddi/vllm-finetuned-inference-serving",
  },
  {
    name: "Object Segmentation",
    desc: "High-performance object segmentation experiments and benchmark-focused computer vision pipelines.",
    stack: ["CV", "Python", "Research"],
    image: objectSegImage,
    githubLink: "https://github.com/SumanMadipeddi/Object-Segmentation-on-ARMBENCH",
    demoLink: "https://www.linkedin.com/feed/update/urn:li:activity:7195244374438424577/",
  },
  {
    name: "Realtime Crypto Stream",
    desc: "Realtime crypto tracking with web automation, streaming transport, and interactive data visualization.",
    stack: ["Next.js", "Express", "WebSocket"],
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
      }
      mediaRecorderRef.current = null;
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
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

  const sendMessage = async (forcedText?: string) => {
    const content = (forcedText ?? chatInput).trim();
    if (!content || isThinking) return;

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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const toggleVoice = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setVoiceToast("Voice recording is not supported in this browser");
      window.setTimeout(() => setVoiceToast(""), 2800);
      return;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      stopRecording();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const mimeCandidates = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/ogg;codecs=opus",
      ];
      const selectedMimeType =
        mimeCandidates.find((m) => (window as any).MediaRecorder?.isTypeSupported?.(m)) || "";

      const recorder = selectedMimeType
        ? new MediaRecorder(stream, { mimeType: selectedMimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.onstart = () => {
        setIsListening(true);
        setVoiceToast("Listening... tap again to stop");
      };

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onerror = () => {
        setIsListening(false);
        setVoiceToast("Voice capture failed");
        window.setTimeout(() => setVoiceToast(""), 1600);
      };

      recorder.onstop = async () => {
        setIsListening(false);
        setVoiceToast("Processing voice...");

        mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;

        const blobType = selectedMimeType || recorder.mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: blobType });
        audioChunksRef.current = [];

        if (!audioBlob.size) {
          setVoiceToast("No audio captured");
          window.setTimeout(() => setVoiceToast(""), 1400);
          return;
        }

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

          setIsChatOpen(true);
          setIsThinking(true);

          const voiceEndpoint = (import.meta.env.VITE_VOICE_API_URL as string | undefined) || "/api/voice";
          const response = await fetch(voiceEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              audioBase64: base64,
              mimeType: blobType,
              history: chatHistory,
              systemPrompt: SYSTEM_PROMPT,
            }),
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data?.error || "Voice request failed");
          }

          const reply = String(data?.reply || "").trim();
          if (!reply) {
            throw new Error("Empty voice reply");
          }

          setShowSuggestions(false);
          setChatMessages((prev) => [
            ...prev,
            { role: "assistant", content: reply },
          ]);

          if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(reply);
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            window.speechSynthesis.speak(utterance);
          }

          setVoiceToast("Done");
          window.setTimeout(() => setVoiceToast(""), 900);
        } catch (error) {
          const errorMessage =
            error instanceof Error && error.message
              ? error.message
              : "Voice request failed. Please try again or type your question.";
          setChatMessages((prev) => [
            ...prev,
            { role: "assistant", content: errorMessage },
          ]);
          setVoiceToast("Voice request failed");
          window.setTimeout(() => setVoiceToast(""), 1400);
        } finally {
          setIsThinking(false);
        }
      };

      recorder.start();
      autoStopTimerRef.current = window.setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, 10000);
    } catch {
      setIsListening(false);
      setVoiceToast("Microphone permission denied");
      window.setTimeout(() => setVoiceToast(""), 1800);
    }
  };

  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const subject = encodeURIComponent(contactForm.subject || "Portfolio inquiry");
    const body = encodeURIComponent(
      `Name: ${contactForm.name}\nEmail: ${contactForm.email}\n\n${contactForm.message}`,
    );
    window.location.href = `mailto:smadiped@asu.edu?subject=${subject}&body=${body}`;
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
            <div className="hero-eyebrow">AI / ML Engineer - Founding AI Engineer</div>
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
              Founding AI Engineer specializing in LLM pipelines, autonomous agents, and production-grade ML systems. I turn ambitious AI ideas into shipped products.
            </p>
            <div className="avail-chip">Available for opportunities</div>
            <div className="hero-actions">
              <button className="btn-secondary" onClick={() => document.getElementById("experience")?.scrollIntoView({ behavior: "smooth" })}>
                View my work
              </button>
              <a className="btn-secondary btn-download" href="/resume/SumanMadipeddi_CV.pdf" download>
                <Download size={15} className="download-icon-anim" />
                Download Resume
              </a>
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
              I build production AI systems from zero: LLM pipelines, RAG architectures, autonomous agents, and full-stack infrastructure. I have worked as an early technical hire shaping both systems and execution speed.
              <br />
              <br />
              My approach: fast prototypes, rigorous production engineering.
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
                  onChange={(e) => setContactForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
                <input
                  className="contact-input"
                  type="email"
                  placeholder="your.email@example.com"
                  value={contactForm.email}
                  onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <input
                className="contact-input"
                type="text"
                placeholder="Subject"
                value={contactForm.subject}
                onChange={(e) => setContactForm((prev) => ({ ...prev, subject: e.target.value }))}
                required
              />
              <textarea
                className="contact-textarea"
                placeholder="Tell me about your project or idea..."
                value={contactForm.message}
                onChange={(e) => setContactForm((prev) => ({ ...prev, message: e.target.value }))}
                rows={5}
                required
              />
              <button className="btn-primary" type="submit">
                <Send size={16} />
                Send Message
              </button>
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



