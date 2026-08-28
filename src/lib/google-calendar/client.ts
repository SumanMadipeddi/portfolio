export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  error?: string;
}

const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events.readonly";
const CONNECTED_KEY = "interview_google_calendar_connected";

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: GoogleTokenResponse) => void;
            error_callback?: (error: { type?: string; message?: string }) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
          revoke: (token: string, done: () => void) => void;
        };
      };
    };
  }
}

let cachedToken: { token: string; expiresAt: number } | null = null;

export function getGoogleClientId(): string {
  return (
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    "932745157899-87093h8a9bboh0rs9m8donjap3716qrk.apps.googleusercontent.com"
  );
}

export function isGoogleCalendarConnected(): boolean {
  return localStorage.getItem(CONNECTED_KEY) === "true";
}

export function setGoogleCalendarConnected(connected: boolean): void {
  if (connected) localStorage.setItem(CONNECTED_KEY, "true");
  else localStorage.removeItem(CONNECTED_KEY);
}

export function loadGoogleIdentityScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
}

export async function requestGoogleCalendarAccessToken(options?: { silent?: boolean }): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  await loadGoogleIdentityScript();
  const clientId = getGoogleClientId();
  const silent = Boolean(options?.silent);

  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) {
      reject(new Error("Google Identity Services script failed to load."));
      return;
    }

    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: CALENDAR_SCOPE,
      callback: (response) => {
        if (response.error) {
          reject(new Error(`Google Auth error: ${response.error}`));
          return;
        }
        if (!response.access_token) {
          reject(new Error("No access token returned from Google"));
          return;
        }
        cachedToken = {
          token: response.access_token,
          expiresAt: Date.now() + (response.expires_in || 3600) * 1000,
        };
        resolve(response.access_token);
      },
      error_callback: (error) => {
        reject(new Error(error.message || error.type || "Google sign-in was cancelled"));
      },
    });

    client.requestAccessToken({ prompt: silent ? "" : "consent" });
  });
}

export async function disconnectGoogleCalendar(): Promise<void> {
  const token = cachedToken?.token;
  cachedToken = null;
  setGoogleCalendarConnected(false);

  if (!token) return;
  await loadGoogleIdentityScript().catch(() => undefined);
  await new Promise<void>((resolve) => {
    if (!window.google?.accounts?.oauth2.revoke) {
      resolve();
      return;
    }
    window.google.accounts.oauth2.revoke(token, () => resolve());
  });
}
