import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Github, ExternalLink } from "lucide-react";
import { Contribution, ApiResponse } from "@/types/portfolio";

const LEVEL_COLORS = [
  "bg-zinc-100 dark:bg-white/[0.04]",
  "bg-emerald-500/20 dark:bg-emerald-500/25",
  "bg-emerald-500/40 dark:bg-emerald-500/45",
  "bg-emerald-500/70 dark:bg-emerald-500/70",
  "bg-emerald-500 dark:bg-emerald-500",
];

const getOrdinalSuffix = (day: number): string => {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

const formatTooltipDate = (dateStr: string): string => {
  const date = new Date(dateStr + "T00:00:00");
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const month = monthNames[date.getMonth()];
  const day = date.getDate();
  return `${month} ${day}${getOrdinalSuffix(day)}`;
};

export const GithubContributions = ({ username = "SumanMadipeddi" }: { username?: string }) => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredDay, setHoveredDay] = useState<Contribution | null>(null);
  const [hoveredElement, setHoveredElement] = useState<HTMLDivElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const updatePosition = () => {
      if (hoveredElement) {
        const cellRect = hoveredElement.getBoundingClientRect();
        setTooltipPosition({
          x: cellRect.left + cellRect.width / 2,
          y: cellRect.top,
        });
      }
    };

    if (hoveredElement) {
      updatePosition();
      const scrollEl = scrollRef.current;
      if (scrollEl) {
        scrollEl.addEventListener("scroll", updatePosition, { passive: true });
      }
      window.addEventListener("scroll", updatePosition, { passive: true });
      window.addEventListener("resize", updatePosition, { passive: true });
      return () => {
        if (scrollEl) {
          scrollEl.removeEventListener("scroll", updatePosition);
        }
        window.removeEventListener("scroll", updatePosition);
        window.removeEventListener("resize", updatePosition);
      };
    } else {
      setTooltipPosition(null);
    }
  }, [hoveredElement]);

  useEffect(() => {
    const token = import.meta.env.VITE_GITHUB_TOKEN;
    if (token) {
      fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          Authorization: `bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            query($username: String!) {
              user(login: $username) {
                contributionsCollection {
                  contributionCalendar {
                    totalContributions
                    weeks {
                      contributionDays {
                        date
                        contributionCount
                        color
                      }
                    }
                  }
                }
              }
            }
          `,
          variables: { username },
        }),
      })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((res) => {
          const calendar = res.data?.user?.contributionsCollection?.contributionCalendar;
          if (!calendar) throw new Error("No calendar data");

          const totalContributions = calendar.totalContributions;
          const contributions: Contribution[] = [];

          calendar.weeks.forEach((w: any) => {
            w.contributionDays.forEach((d: any) => {
              let level: 0 | 1 | 2 | 3 | 4 = 0;
              const count = d.contributionCount;
              if (count === 0) level = 0;
              else if (count <= 2) level = 1;
              else if (count <= 5) level = 2;
              else if (count <= 8) level = 3;
              else level = 4;

              contributions.push({
                date: d.date,
                count: count,
                level: level,
              });
            });
          });

          setData({
            total: { lastYear: totalContributions },
            contributions,
          });
        })
        .catch(() => {
          fetchScraperAPI();
        });
    } else {
      fetchScraperAPI();
    }

    function fetchScraperAPI() {
      fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`)
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((json: ApiResponse) => setData(json))
        .catch(() => setError(true));
    }
  }, [username]);

  useEffect(() => {
    if (data && scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [data]);

  const contribs = data?.contributions ?? [];
  const total = contribs.reduce((s, c) => s + c.count, 0);
  const lastActive = [...contribs].reverse().find((c) => c.count > 0);
  const lastDate = lastActive
    ? new Date(lastActive.date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  // Build weeks (columns) of 7 days
  const weeks: Contribution[][] = [];
  if (contribs.length) {
    const first = new Date(contribs[0].date);
    const startDow = first.getDay(); // 0 = Sunday
    let cursor = 0;
    let week: Contribution[] = new Array(startDow).fill(null);
    while (cursor < contribs.length) {
      week.push(contribs[cursor]);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
      cursor++;
    }
    if (week.length) {
      while (week.length < 7) week.push(null as any);
      weeks.push(week);
    }
  }

  const displayedWeeks = weeks.slice(-38);

  return (
    <div className="relative flex h-full flex-col justify-between" ref={containerRef}>
      <div className="flex-grow flex flex-col justify-between">
        <div className="mb-4 flex items-center justify-between">
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 hover:text-[#2997ff] transition-colors group cursor-pointer"
          >
            <Github className="w-4 h-4 text-zinc-500 dark:text-zinc-400 group-hover:text-[#2997ff] transition-colors" />
            <div className="card-tag flex items-center gap-1.5" style={{ marginBottom: 0 }}>
              Github activity
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
            </div>
          </a>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {data ? `${total} contributions in the last year` : error ? "Unavailable" : "Loading…"}
          </span>
        </div>

        <div className="flex-1 flex items-center overflow-hidden scrollbar-hide" ref={scrollRef} style={{ marginTop: "12px", minHeight: "95px" }}>
          <div className="flex gap-[3px] min-w-max justify-end w-full">
            {displayedWeeks.map((week, i) => (
              <div key={i} className="flex flex-col gap-[3px]">
                {week.map((day, j) =>
                  day ? (
                    <div
                      key={j}
                      className={`h-[11px] w-[11px] rounded-[2px] transition-colors duration-100 cursor-pointer ${LEVEL_COLORS[day.level]}`}
                      onMouseEnter={(e) => {
                        setHoveredDay(day);
                        setHoveredElement(e.currentTarget);
                      }}
                      onMouseLeave={() => {
                        setHoveredDay(null);
                        setHoveredElement(null);
                      }}
                    />
                  ) : (
                    <div key={j} className="h-[11px] w-[11px] rounded-[2px]" />
                  )
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {lastDate && (
        <div className="mt-4 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
          Last pushed on {lastDate}
        </div>
      )}

      {hoveredDay && tooltipPosition && createPortal(
        <div
          className="fixed z-[9999] pointer-events-none bg-white text-zinc-900 border border-zinc-200/80 dark:bg-[#1F2328] dark:text-[#ffffff] dark:border-zinc-700/50 text-[11px] font-sans px-2.5 py-1.5 rounded-md shadow-lg whitespace-nowrap"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y - 7}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          {hoveredDay.count === 0 ? "No contributions" : hoveredDay.count === 1 ? "1 contribution" : `${hoveredDay.count} contributions`} on {formatTooltipDate(hoveredDay.date)}
          
          <div
            className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-0 h-0 border-solid border-t-white dark:border-t-[#1F2328] border-r-transparent border-b-transparent border-l-transparent"
            style={{
              borderWidth: "4px 4px 0 4px",
            }}
          />
        </div>,
        document.body
      )}
    </div>
  );
};
