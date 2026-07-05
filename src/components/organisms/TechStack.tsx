import React from "react";
import { Layers } from "lucide-react";

export const ICONS: { slug: string; name: string }[] = [
  { slug: "python", name: "Python" },
  { slug: "pytorch", name: "PyTorch" },
  { slug: "fastapi", name: "FastAPI" },
  { slug: "langchain", name: "LangChain" },
  { slug: "typescript", name: "TypeScript" },
  { slug: "react", name: "React" },
  { slug: "nextdotjs", name: "Next.js" },
  { slug: "nodedotjs", name: "Node.js" },
  { slug: "claude", name: "Claude API" },
  { slug: "googlegemini", name: "Gemini API" },
  { slug: "openai", name: "OpenAI" },
  { slug: "pinecone", name: "Pinecone" },
  { slug: "docker", name: "Docker" },
  { slug: "kubernetes", name: "Kubernetes" },
  { slug: "amazonaws", name: "AWS" },
  { slug: "googlecloud", name: "GCP" },
  { slug: "tailwindcss", name: "Tailwind" },
  { slug: "vercel", name: "Vercel" },
  { slug: "livekit", name: "LiveKit" },
  { slug: "twilio", name: "Twilio" },
  { slug: "neo4j", name: "Neo4j" },
  { slug: "redis", name: "Redis" },
];

export const renderTechIcon = (icon: { slug: string; name: string }) => {
  if (icon.slug === "pinecone") {
    return (
      <svg viewBox="0 0 760 810" fill="currentColor" className="h-5 w-5 opacity-80 text-zinc-700 dark:text-zinc-200 shrink-0">
        <path fillRule="evenodd" clipRule="evenodd" d="M471.826 24.0936C464.116 14.9134 450.95 12.5551 440.534 18.4886L430.803 24.0322L430.679 24.0093L430.659 24.1139L325.85 83.8204L350.42 126.977L418.874 87.9814L402.035 179.236L450.859 188.251L467.791 96.4974L518.212 156.532L556.227 124.585L479.472 33.1965L479.503 33.0244L479.295 32.9859L471.826 24.0936ZM324.08 794.824C349.328 794.824 369.795 774.868 369.795 750.25C369.795 725.633 349.328 705.676 324.08 705.676C298.833 705.676 278.366 725.633 278.366 750.25C278.366 774.868 298.833 794.824 324.08 794.824ZM385.561 550.209L369.091 642.069L320.221 633.302L336.586 542.025L268.375 581.205L243.651 538.136L348.033 478.18L348.056 478.049L348.212 478.077L358.011 472.449C368.389 466.488 381.541 468.781 389.29 477.903L396.851 486.803L396.926 486.816L396.915 486.879L474.358 578.039L436.524 610.2L385.561 550.209ZM425.11 330.935L408.652 422.737L359.782 413.971L376.085 323.035L308.091 361.894L283.461 318.771L387.51 259.306L387.617 258.708L388.331 258.836L397.847 253.398C408.224 247.468 421.351 249.774 429.086 258.887L436.356 267.451L436.487 267.475L436.467 267.583L513.866 358.765L476.019 390.91L425.11 330.935ZM104.667 693.368L104.394 693.554L104.171 693.225L94.0456 690.317C83.3324 687.24 76.2404 677.074 77.0484 665.954L86.0484 542.094L133.05 545.511L127.574 620.869L200.8 571.19L227.251 610.203L155.455 658.912L228.701 679.952L215.694 725.26L104.667 693.368ZM590.296 744.836L590.301 744.844L590.291 744.852L586.988 755.721C583.802 766.205 573.813 773.109 562.883 772.383L552.56 771.698L551.9 772.167L551.517 771.629L436.444 763.986L439.566 716.95L516.258 722.044L466.25 651.718L504.651 624.395L555.789 696.309L577.921 623.484L623.009 637.195L590.296 744.836ZM725.177 489.19L725.322 489.215L725.29 489.393L730.774 499.22C736.394 509.291 734.104 521.931 725.309 529.389L717.018 536.42L716.96 536.747L716.688 536.699L627.257 612.532L596.06 575.717L654.901 525.823L566.796 510.314L575.158 462.783L663.903 478.404L626.686 411.712L668.814 388.189L725.177 489.19ZM634.493 282.027L554.909 324.863L532.047 282.364L610.263 240.264L538.372 211.176L556.464 166.435L665.478 210.544L665.964 210.283L666.279 210.868L676.146 214.861C686.737 219.146 692.871 230.276 690.839 241.522L688.81 252.753L688.826 252.782L688.802 252.795L668.319 366.171L620.841 357.589L634.493 282.027ZM100.963 381.58L189.25 396.607L181.156 444.185L92.111 429.029L130.083 495.958L88.1229 519.778L30.7057 418.577L30.665 418.57L30.6735 418.52L25.1727 408.825C19.4828 398.796 21.6815 386.142 30.4207 378.621L38.6678 371.524L38.7583 370.992L39.1988 371.067L127.517 295.067L158.982 331.653L100.963 381.58ZM234.324 175.801L293.072 241.268L257.168 273.506L197.06 206.523L183.065 282.822L135.61 274.113L156.332 161.138L156.228 161.021L156.379 160.886L158.474 149.463C160.507 138.378 169.941 130.177 181.199 129.708L191.582 129.276L192.131 128.783L192.539 129.236L310.473 124.33L312.478 172.55L234.324 175.801Z" />
      </svg>
    );
  }
  if (icon.slug === "langchain") {
    return (
      <svg role="img" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 opacity-80 text-zinc-700 dark:text-zinc-200 shrink-0">
        <title>LangChain Corporate</title>
        <path d="M7.53 15.975a7.53 7.53 0 0 0 2.206-5.325A7.54 7.54 0 0 0 7.53 5.325L2.205 0A7.54 7.54 0 0 0 0 5.325a7.54 7.54 0 0 0 2.205 5.325zm11.144.493a7.54 7.54 0 0 0-5.325-2.206 7.54 7.54 0 0 0-5.325 2.206l5.325 5.325a7.54 7.54 0 0 0 5.325 2.205A7.54 7.54 0 0 0 24 21.793zM2.219 21.78a7.54 7.54 0 0 0 5.325 2.205v-7.53H.014a7.54 7.54 0 0 0 2.205 5.325M20.73 8.595a7.53 7.53 0 0 0-5.327-2.206 7.53 7.53 0 0 0-5.325 2.207l5.325 5.325z"/>
      </svg>
    );
  }
  if (icon.slug === "openai") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 opacity-80 text-zinc-700 dark:text-zinc-200 shrink-0">
        <path d="M22.282 9.821a6 6 0 0 0-.516-4.91 6.05 6.05 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a6 6 0 0 0-3.998 2.9 6.05 6.05 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.05 6.05 0 0 0 6.515 2.9A6 6 0 0 0 13.26 24a6.06 6.06 0 0 0 5.772-4.206 6 6 0 0 0 3.997-2.9 6.06 6.06 0 0 0-.747-7.073M13.26 22.43a4.48 4.48 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.8.8 0 0 0 .392-.681v-6.737l2.02 1.168a.07.07 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494M3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.77.77 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646M2.34 7.896a4.5 4.5 0 0 1 2.366-1.973V11.6a.77.77 0 0 0 .388.677l5.815 3.354-2.02 1.168a.08.08 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855-5.833-3.387L15.119 7.2a.08.08 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667m2.01-3.023-.141-.085-4.774-2.782a.78.78 0 0 0-.785 0L9.409 9.23V6.897a.07.07 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.8.8 0 0 0-.393.681zm1.097-2.365 2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5Z" />
      </svg>
    );
  }
  if (icon.slug === "twilio") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd" className="h-5 w-5 opacity-80 text-zinc-700 dark:text-zinc-200 shrink-0">
        <path d="M12 2c5.522 0 10 4.478 10 10s-4.478 10-10 10S2 17.522 2 12 6.478 2 12 2zm-3.5 11.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm7 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-7-5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm7 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
      </svg>
    );
  }
  if (icon.slug === "amazonaws") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 opacity-80 text-zinc-700 dark:text-zinc-200 shrink-0">
        <path d="M5 12h14M5 12a2 2 0 1 0 0 4h14a2 2 0 1 0 0-4M5 6h14M5 6a2 2 0 1 0 0 4h14a2 2 0 1 0 0-4M5 18h14M5 18a2 2 0 1 0 0 4h14a2 2 0 1 0 0-4" />
      </svg>
    );
  }
  return (
    <>
      <img
        src={`https://cdn.simpleicons.org/${icon.slug}/333333`}
        alt={icon.name}
        className="h-5 w-5 opacity-80 block dark:hidden shrink-0"
        loading="lazy"
      />
      <img
        src={`https://cdn.simpleicons.org/${icon.slug}/ffffff`}
        alt={icon.name}
        className="h-5 w-5 opacity-80 hidden dark:block shrink-0"
        loading="lazy"
      />
    </>
  );
};

export const TechStack = () => {
  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-5">
          <Layers className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
          <div className="card-tag" style={{ marginBottom: 0 }}>Tech Stack</div>
        </div>

        <h3 className="card-title">
          Tech stacks I'm familiar with
        </h3>
        <p className="card-body" style={{ marginTop: 8 }}>
          Primarily focused on building intelligent agentic systems and scalable AI infrastructure, but always eager to explore and learn new technologies.
        </p>
      </div>

      <div className="relative mt-4 w-full overflow-hidden py-1 [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]">
        <div className="flex gap-4 animate-marquee py-2 whitespace-nowrap hover:[animation-play-state:paused]">
          {[...ICONS, ...ICONS].map((icon, idx) => (
            <div
              key={`${icon.slug}-${idx}`}
              title={icon.name}
              className="flex shrink-0 items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 px-4 py-3 transition-all hover:border-emerald-500/40 dark:hover:border-emerald-500/40 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40"
            >
              {renderTechIcon(icon)}
              <span className="font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-200 uppercase tracking-wider">
                {icon.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
