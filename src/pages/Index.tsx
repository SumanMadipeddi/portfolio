/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { 
  Download, 
  ExternalLink, 
  Github, 
  Layers, 
  Linkedin, 
  Mail, 
  MapPin, 
  Mic, 
  Moon, 
  Phone, 
  Send, 
  Square, 
  Sun, 
  X 
} from "lucide-react";
import profileImage from "@/assets/profile-hero.jpg";
import { downloadResume, openResume } from "@/lib/resume";

// Types
import { Theme, ChatItem } from "@/types/portfolio";

// Constants
import {
  SYSTEM_PROMPT,
  suggestions,
  experiences,
  projects,
  techStack,
  stats,
  terminalSkillLines,
  ABOUT_WORDS_TOP,
  ABOUT_WORDS_BOTTOM,
  EXPERIENCE_WORDS_TOP,
  EXPERIENCE_WORDS_BOTTOM,
  WORK_WORDS,
  CONTACT_WORDS
} from "@/constants/portfolioData";

// Hooks
import { useCyclingWord } from "@/hooks/useCyclingWord";

// Utilities
import { isBrowser, formatAssistantMessage } from "@/utils/chatHelpers";

// Components
import { XIcon, MediumIcon } from "@/components/atoms/Icons";
import { DitheringShader } from "@/components/ui/dithering-shader";
import { TechStack } from "@/components/organisms/TechStack";
import { GithubContributions } from "@/components/organisms/GithubContributions";
import { EyeTrackingChatAvatar } from "@/components/organisms/EyeTrackingChatAvatar";

function floatTo16BitPCM(output: DataView, offset: number, input: Float32Array) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function bufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numOfChan = buffer.numberOfChannels;
  const sampleRate = 16000;
  const format = 1;
  const bitDepth = 16;
  const sourceSampleRate = buffer.sampleRate;
  const ratio = sourceSampleRate / sampleRate;
  const newLength = Math.round(buffer.length / ratio);
  const leftData = buffer.getChannelData(0);
  const rightData = numOfChan > 1 ? buffer.getChannelData(1) : null;
  const samples = new Float32Array(newLength);
  for (let i = 0; i < newLength; i++) {
    const srcIndex = Math.round(i * ratio);
    if (rightData) {
      samples[i] = (leftData[srcIndex] + rightData[srcIndex]) / 2;
    } else {
      samples[i] = leftData[srcIndex];
    }
  }
  const result = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(result);
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, "data");
  view.setUint32(40, samples.length * 2, true);
  floatTo16BitPCM(view, 44, samples);
  return result;
}

function encodeWav(samples: Float32Array, sourceSampleRate: number): ArrayBuffer {
  const sampleRate = 16000;
  const ratio = sourceSampleRate / sampleRate;
  const newLength = Math.round(samples.length / ratio);
  const resampled = new Float32Array(newLength);
  
  for (let i = 0; i < newLength; i++) {
    resampled[i] = samples[Math.round(i * ratio)];
  }

  const result = new ArrayBuffer(44 + resampled.length * 2);
  const view = new DataView(result);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + resampled.length * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, resampled.length * 2, true);

  floatTo16BitPCM(view, 44, resampled);

  return result;
}

const Index = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as Theme | null;
      if (savedTheme) return savedTheme;
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      return systemPrefersDark ? "dark" : "light";
    }
    return "dark";
  });
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
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

  const lastScrollY = useRef(0);
  const isCollapsedRef = useRef(false);
  const isScrolledRef = useRef(false);
  const navProgressRef = useRef<HTMLDivElement | null>(null);
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
  const pcmSamplesRef = useRef<number[]>([]);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

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

  const keySoundPoolRef = useRef<HTMLAudioElement[]>([]);
  const poolIndexRef = useRef(0);
  const lastTypeSoundAtRef = useRef(0);
  const terminalVisibleRef = useRef(true);

  useEffect(() => {
    const pool: HTMLAudioElement[] = [];
    for (let i = 0; i < 5; i++) {
      const a = new Audio("/sounds/key-clic.mp3");
      a.volume = 0.1;
      a.preload = "auto";
      pool.push(a);
    }
    keySoundPoolRef.current = pool;
  }, []);

  const playTypeSound = useCallback(() => {
    if (!terminalVisibleRef.current) return;
    const pool = keySoundPoolRef.current;
    if (pool.length === 0) return;

    const now = performance.now();
    if (now - lastTypeSoundAtRef.current < 22) return; // throttle
    lastTypeSoundAtRef.current = now;

    const click = pool[poolIndexRef.current];
    if (click) {
      poolIndexRef.current = (poolIndexRef.current + 1) % pool.length;
      try {
        click.currentTime = 0;
        void click.play().catch(() => { });
      } catch {
        // noop
      }
    }
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
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    if (!isBrowser) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem("theme");
      if (!savedTheme) {
        setTheme(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === "dark" ? "light" : "dark";
      localStorage.setItem("theme", newTheme);
      return newTheme;
    });
  };

  useEffect(() => {
    if (!isBrowser) return;

    const COLLAPSE_OFFSET = 80;
    const SCROLL_DELTA = 12;

    const setCollapsed = (next: boolean) => {
      if (isCollapsedRef.current === next) return;
      isCollapsedRef.current = next;
      setIsCollapsed(next);
    };

    const setScrolled = (next: boolean) => {
      if (isScrolledRef.current === next) return;
      isScrolledRef.current = next;
      setIsScrolled(next);
    };

    const onScroll = () => {
      const currentScrollY = window.scrollY;
      const max = document.body.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, currentScrollY / max)) : 0;

      // Drive progress bar without React re-renders every frame
      if (navProgressRef.current) {
        navProgressRef.current.style.transform = `scaleX(${progress})`;
      }

      setScrolled(currentScrollY > COLLAPSE_OFFSET);

      const delta = currentScrollY - lastScrollY.current;

      if (currentScrollY <= COLLAPSE_OFFSET) {
        setCollapsed(false);
        lastScrollY.current = currentScrollY;
        return;
      }

      // Ignore tiny trackpad jitter so collapse/expand doesn't thrash
      if (Math.abs(delta) < SCROLL_DELTA) return;

      setCollapsed(delta > 0);
      lastScrollY.current = currentScrollY;
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

    const dpr = window.devicePixelRatio || 1;
    let W = 0, H = 0;
    let raf = 0;
    let t = 0;
    let rotY = 0, rotX = 0;

    const mouse = { x: -9999, y: -9999 };

    // Google Antigravity color palette (warm reds/oranges → magentas → cool blues)
    const COLORS = [
      '#E8412A', '#E8502A', '#E8622A', '#E87A2A', '#E89A2A',
      '#D4602A', '#C8443A', '#BC3A60', '#A83A90', '#8830C0',
      '#6830D8', '#5038E0', '#3A50E8', '#3A72E8', '#3A96E0', '#3AAED0'
    ];

    type Pill = {
      bx: number; by: number; bz: number;
      x: number; y: number; z: number;
      vx: number; vy: number; vz: number;
      angle: number; va: number;
      color: string;
      w: number; h: number;
    };

    let pills: Pill[] = [];

    const FOV = 900;

    const proj3d = (x: number, y: number, z: number) => {
      const s = FOV / (FOV + z + 400);
      return { sx: W / 2 + x * s, sy: H / 2 + y * s, s };
    };

    const rot3d = (x: number, y: number, z: number, ry: number, rx: number) => {
      const x1 = x * Math.cos(ry) - z * Math.sin(ry);
      const z1 = x * Math.sin(ry) + z * Math.cos(ry);
      const y1 = y * Math.cos(rx) - z1 * Math.sin(rx);
      const z2 = y * Math.sin(rx) + z1 * Math.cos(rx);
      return { x: x1, y: y1, z: z2 };
    };

    const init = () => {
      pills = [];
      // ==========================================
      // 1. SPHERE RADIUS CONTROL (Overall Circle Size)
      // Change 0.45 below to make the sphere bigger or smaller (e.g., 0.35 is smaller, 0.55 is larger)
      // ==========================================
      const R = Math.min(W, H) * 0.37;

      // 2. TOTAL PILL COUNT
      const N = 240;

      for (let i = 0; i < N; i++) {
        const phi = Math.acos(1 - 2 * (i + 0.5) / N);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const sx = Math.sin(phi) * Math.cos(theta);
        const sy = Math.sin(phi) * Math.sin(theta);
        const sz = Math.cos(phi);
        const ci = Math.floor(((sx + 1) / 2) * (COLORS.length - 1));
        pills.push({
          bx: sx * R, by: sy * R, bz: sz * R,
          x: sx * R, y: sy * R, z: sz * R,
          vx: 0, vy: 0, vz: 0,
          angle: Math.random() * Math.PI,
          va: (Math.random() - 0.5) * 0.004,
          color: COLORS[Math.max(0, Math.min(COLORS.length - 1, ci))],
          // ==========================================
          // 3. INDIVIDUAL PILL SIZE CONTROL
          // w = Pill Length (how long the dash is)
          // h = Pill Thickness (how fat/thick the pill is)
          // ==========================================
          w: (Math.random() * 7 + 6) * dpr,
          h: (Math.random() * 3.5 + 3.5) * dpr,
        });
      }
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      W = canvas.width = rect.width * dpr;
      H = canvas.height = rect.height * dpr;
      init();
    };

    const update = () => {
      t += 0.008;
      // ==========================================
      // 4. MOUSE REPEL RADIUS CONTROL
      // Change 140 below to adjust how far away the mouse pushes pills
      // ==========================================
      const fr = 140 * dpr;
      for (const p of pills) {
        const rv = rot3d(p.x, p.y, p.z, rotY, rotX);
        const pj = proj3d(rv.x, rv.y, rv.z);
        const dx = pj.sx - mouse.x;
        const dy = pj.sy - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < fr && dist > 1) {
          const f = (1 - dist / fr) * (1 - dist / fr) * 3.5;
          p.vx += (dx / dist) * f * 2.5;
          p.vy += (dy / dist) * f * 2.5;
          p.vz += (1 - dist / fr) * f * 30;
        }
        p.vx += (p.bx - p.x) * 0.032;
        p.vy += (p.by - p.y) * 0.032;
        p.vz += (p.bz - p.z) * 0.032;
        p.vx *= 0.82; p.vy *= 0.82; p.vz *= 0.82;
        p.x += p.vx; p.y += p.vy; p.z += p.vz;
        p.angle += p.va;
      }
      rotY += 0.003;
      rotX = Math.sin(t * 0.4) * 0.12;
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const sorted = pills.slice().sort((a, b) => {
        const ra = rot3d(a.x, a.y, a.z, rotY, rotX);
        const rb = rot3d(b.x, b.y, b.z, rotY, rotX);
        return rb.z - ra.z;
      });
      for (const p of sorted) {
        const rv = rot3d(p.x, p.y, p.z, rotY, rotX);
        const pj = proj3d(rv.x, rv.y, rv.z);
        const depth = (rv.z + 500) / 900;
        const alpha = 0.25 + depth * 0.75;
        const rw = p.w * pj.s * (0.6 + depth * 0.5);
        const rh = p.h * pj.s * (0.6 + depth * 0.5);
        const r = Math.max(rh / 2, 0.5);
        ctx.save();
        ctx.translate(pj.sx, pj.sy);
        ctx.rotate(p.angle);
        ctx.globalAlpha = Math.min(1, alpha);
        ctx.fillStyle = p.color;
        if (rw > r * 2) {
          ctx.beginPath();
          ctx.moveTo(-rw / 2 + r, -r);
          ctx.lineTo(rw / 2 - r, -r);
          ctx.arc(rw / 2 - r, 0, r, -Math.PI / 2, Math.PI / 2);
          ctx.lineTo(-rw / 2 + r, r);
          ctx.arc(-rw / 2 + r, 0, r, Math.PI / 2, -Math.PI / 2);
          ctx.closePath();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.restore();
      }
    };

    const loop = () => {
      update();
      draw();
      raf = window.requestAnimationFrame(loop);
    };

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX * dpr;
      mouse.y = e.clientY * dpr;
    };
    const onMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    raf = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
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
        void audioContextRef.current.close().catch(() => { });
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
    if (typeof window !== "undefined" && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // noop
      }
    }
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
      const timeoutId = window.setTimeout(() => controller.abort(), 6000);
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

        const replyText = formatAssistantMessage(String(data?.reply || "").trim());
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

  const stopRecording = async () => {
    if (autoStopTimerRef.current) {
      window.clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
    if (!isUtteranceRecordingRef.current) return;
    isUtteranceRecordingRef.current = false;
    stopLiveTranscription();

    if (!voiceSessionActiveRef.current) return;
    const transcriptText = voiceLiveTextRef.current.trim();
    setVoiceLiveText("");

    const samples = new Float32Array(pcmSamplesRef.current);
    pcmSamplesRef.current = [];

    if (samples.length > 0) {
      try {
        const sourceSR = audioContextRef.current?.sampleRate || 48000;
        const wavBuffer = encodeWav(samples, sourceSR);
        const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });
        await sendVoiceBlob(wavBlob, "audio/wav", transcriptText);
      } catch (err) {
        console.error("Failed to package PCM WAV:", err);
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
      const trimmed = transcript.trim();
      setVoiceLiveText(trimmed);
      voiceLiveTextRef.current = trimmed;
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
    if (scriptProcessorRef.current) {
      try {
        scriptProcessorRef.current.disconnect();
      } catch {
        // noop
      }
      scriptProcessorRef.current = null;
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
      void audioContextRef.current.close().catch(() => { });
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
      }

      if (!response || !response.ok) {
        throw new Error(data?.error || "Voice request failed");
      }

      const reply = formatAssistantMessage(String(data?.reply || "").trim());
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
            aiAudio.onerror = () => reject(new Error("AI audio playback failed."));
            void aiAudio.play().catch(() => reject(new Error("AI audio playback failed.")));
          });
          played = true;
        } catch {
          played = false;
        }

        if (!played) {
          const ctx = audioContextRef.current;
          if (!ctx) {
            throw new Error("AI audio playback failed.");
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
            throw new Error("AI audio playback failed.");
          }
        }
      } else {
        if (typeof window !== "undefined" && window.speechSynthesis) {
          const cleanText = reply.replace(/[*#_`~]/g, "").trim();
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.lang = "en-US";
          const voices = window.speechSynthesis.getVoices();
          const preferredVoice = voices.find(
            (v) =>
              v.lang.startsWith("en") &&
              (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Premium") || v.name.includes("Microsoft"))
          ) || voices.find((v) => v.lang.startsWith("en"));
          if (preferredVoice) {
            utterance.voice = preferredVoice;
          }
          await new Promise<void>((resolve) => {
            utterance.onstart = () => {
              isAiSpeakingRef.current = true;
              setIsAiSpeaking(true);
            };
            utterance.onend = () => {
              isAiSpeakingRef.current = false;
              setIsAiSpeaking(false);
              resolve();
            };
            utterance.onerror = () => {
              isAiSpeakingRef.current = false;
              setIsAiSpeaking(false);
              resolve();
            };
            if (window.speechSynthesis.paused) {
              try {
                window.speechSynthesis.resume();
              } catch {
                // noop
              }
            }
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
          });
        } else {
          setVoiceToast(ttsError ? `TTS failed: ${ttsError}` : "No AI audio returned for this model");
          window.setTimeout(() => setVoiceToast(""), 1800);
          if (ttsError) {
            setChatMessages((prev) => [
              ...prev,
              { role: "assistant", content: `TTS failed: ${ttsError}` },
            ]);
          }
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

    if (typeof window !== "undefined" && window.speechSynthesis) {
      try {
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(""));
      } catch {
        // noop
      }
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

      // Initialize ScriptProcessorNode for Safari/Chrome PCM capture
      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
      scriptProcessor.onaudioprocess = (event) => {
        if (!voiceSessionActiveRef.current || voiceTurnBusyRef.current || !isUtteranceRecordingRef.current) return;
        const inputData = event.inputBuffer.getChannelData(0);
        for (let i = 0; i < inputData.length; i++) {
          pcmSamplesRef.current.push(inputData[i]);
        }
      };
      source.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);
      scriptProcessorRef.current = scriptProcessor;

      const startUtteranceRecorder = () => {
        if (!voiceSessionActiveRef.current || voiceTurnBusyRef.current || isUtteranceRecordingRef.current) return;
        pcmSamplesRef.current = [];
        isUtteranceRecordingRef.current = true;
        utteranceSpeechStartRef.current = performance.now();
        utteranceLastVoiceAtRef.current = performance.now();
        setVoiceLiveText("");
        startLiveTranscription();
      };

      const data = new Uint8Array(analyser.fftSize);
      const VAD_THRESHOLD = 0.015;
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
      <canvas id="particleCanvas" ref={canvasRef} />
      <nav id="navbar" className={`${isScrolled ? "scrolled" : ""} ${isCollapsed ? "collapsed" : ""}`}>
        {/* Inset floating page scroll progress indicator */}
        <div className="nav-scroll-progress" ref={navProgressRef} />

        <div className="nav-logo">
          <a href="#hero" className="hero-photo-wrap nav-photo-wrap cursor-pointer" aria-label="Go to top">
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
          </a>
        </div>
        <ul className="nav-links">
          <li><a href="#about">About</a></li>
          <li><a href="#experience">Experience</a></li>
          <li><a href="#projects">Research & Projects</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
        <div className="nav-actions">
          <div className="nav-actions-inner">
            <div className="nav-social-pill">
              <a href="https://linkedin.com/in/suman-madipeddi" target="_blank" rel="noreferrer" className="nav-social-btn" aria-label="LinkedIn">
                <Linkedin size={16} />
              </a>
              <a href="https://github.com/SumanMadipeddi" target="_blank" rel="noreferrer" className="nav-social-btn" aria-label="GitHub">
                <Github size={16} />
              </a>
              <a href="https://medium.com/@madipeddisuman" target="_blank" rel="noreferrer" className="nav-social-btn" aria-label="Medium">
                <MediumIcon size={16} />
              </a>
            </div>
            <button className="theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button className="dither-btn" onClick={() => setIsChatOpen((v) => !v)}>
              <span className="dither-btn__bg" aria-hidden="true">
                <DitheringShader
                  shape="sphere"
                  type="4x4"
                  colorBack={theme === "dark" ? "#000000" : "#ffffff"}
                  colorFront="#2997ff"
                  pxSize={1.25}
                  speed={1.5}
                  fit="cover"
                  scale={1.05}
                  offsetY={0}
                />
              </span>
              <span className="dither-btn__label">Ask me anything</span>
            </button>
          </div>
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
              Founding AI Engineer specializing in agentic systems, LLM Evals, and production AI/ML. I turn research into scalable products.
            </p>
            <div className="hero-chips flex flex-wrap gap-3" style={{ marginTop: "16px" }}>
              <a
                href="https://applyloom.atimuss.com/"
                target="_blank"
                rel="noreferrer"
                className="dither-btn"
                aria-label="ApplyLoom"
              >
                <span className="dither-btn__bg" aria-hidden="true">
                  <DitheringShader
                    shape="sphere"
                    type="4x4"
                    colorBack={theme === "dark" ? "#000000" : "#ffffff"}
                    colorFront="#2997ff"
                    pxSize={1.25}
                    speed={1.5}
                    fit="cover"
                    scale={1.05}
                    offsetY={0}
                  />
                </span>
                <span className="dither-btn__label flex items-center gap-1.5">
                  ApplyLoom <ExternalLink size={13} />
                </span>
              </a>

              <a
                href="https://atimuss.com/"
                target="_blank"
                rel="noreferrer"
                className="dither-btn"
                aria-label="Atimuss"
              >
                <span className="dither-btn__bg" aria-hidden="true">
                  <DitheringShader
                    shape="sphere"
                    type="4x4"
                    colorBack={theme === "dark" ? "#000000" : "#ffffff"}
                    colorFront="#bf5af2"
                    pxSize={1.25}
                    speed={1.5}
                    fit="cover"
                    scale={1.05}
                    offsetY={0}
                  />
                </span>
                <span className="dither-btn__label flex items-center gap-1.5">
                  Atimuss <ExternalLink size={13} />
                </span>
              </a>

              <button
                onClick={openResume}
                className="dither-btn"
                aria-label="View Resume"
              >
                <span className="dither-btn__bg" aria-hidden="true">
                  <DitheringShader
                    shape="sphere"
                    type="4x4"
                    colorBack={theme === "dark" ? "#000000" : "#ffffff"}
                    colorFront="#2997ff"
                    pxSize={1.25}
                    speed={1.5}
                    fit="cover"
                    scale={1.05}
                    offsetY={0}
                  />
                </span>
                <span className="dither-btn__label flex items-center gap-1.5">
                  View Resume <Download size={13} />
                </span>
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
          <div className="card card-span-6 card-about-main reveal">
            <div className="card-tag">Background</div>
            <div className="card-title">Founding Engineer and AI Systems Architect</div>
            <div className="card-body" style={{ marginTop: 10 }}>
              I build production AI systems that run in production, scale under load. Multi-agent orchestration, LLM pipelines, computer use voice agents and full-stack infrastructure. Been the founding AI hire twice. Owned the architecture, the 3am incidents, and the roadmap.
              <br />
              <br />
              My approach: thrive in ambiguity, ship fast, research to production.
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

          <div className="card card-span-6 reveal reveal-delay-1">
            <GithubContributions username="SumanMadipeddi" />
          </div>

          <div className="card card-span-6 reveal reveal-delay-2">
            <TechStack />
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
                  <div className="exp-company">
                    {exp.link ? (
                      <a href={exp.link} target="_blank" rel="noopener noreferrer">
                        {exp.company}
                        <ExternalLink size={12} style={{ display: "inline-block", marginLeft: "4px", verticalAlign: "middle" }} />
                      </a>
                    ) : (
                      exp.company
                    )}
                  </div>
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
              <a className="quick-link" href="https://medium.com/@madipeddisuman" target="_blank" rel="noreferrer"><span className="quick-link-left"><MediumIcon size={15} />Medium</span><span>↗</span></a>
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
            <button className="chat-close" onClick={() => {
              setIsChatOpen(false);
              stopVoiceSession();
            }}>
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

        <button ref={chatBubbleRef} className="chat-bubble" id="chatBubble" onClick={() => setIsChatOpen((v) => !v)} aria-label="Open AI Chatbot">
          <EyeTrackingChatAvatar isOpen={isChatOpen} />
        </button>
      </div>


      <div className={`voice-toast ${voiceToast ? "show" : ""}`} id="voiceToast">{voiceToast}</div>
    </div>
  );
};

export default Index;



