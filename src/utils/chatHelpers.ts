export const isBrowser = typeof window !== "undefined";

export const formatAssistantMessage = (input: string): string => {
  const text = String(input || "").trim();
  if (!text) return text;

  // Ensure inline numbered lists become line-separated:
  // "1. ... 2. ... 3. ..." -> each point on a new line
  const withNumberedLines = text
    .replace(/\s+([2-9]|[1-9]\d+)\.\s+/g, "\n$1. ")
    .replace(/\n{3,}/g, "\n\n");

  return withNumberedLines;
};
