// Environment configuration for secure passcode management
export const ENV_CONFIG = {
  // Optional frontend passcode (server-side passcode check is still authoritative)
  ADMIN_PASSCODE: import.meta.env.VITE_ADMIN_PASSCODE || import.meta.env.ADMIN_PASSCODE,

  // API base URL (same-origin by default so /admin works in prod and dev)
  API_BASE: import.meta.env.VITE_API_URL || import.meta.env.API_URL || '/api',

  // Environment
  NODE_ENV: import.meta.env.NODE_ENV || 'development',

  // Check if we're in production
  IS_PRODUCTION: import.meta.env.NODE_ENV === 'production',
};
