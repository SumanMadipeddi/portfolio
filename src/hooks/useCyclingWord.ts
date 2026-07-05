import { useEffect, useState } from "react";

export const useCyclingWord = (
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
