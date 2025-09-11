// Environment configuration for secure passcode management
export const ENV_CONFIG = {
  // Admin passcode from environment variables
  ADMIN_PASSCODE: import.meta.env.VITE_ADMIN_PASSCODE || import.meta.env.ADMIN_PASSCODE,
  
  // API base URL
  API_BASE: import.meta.env.VITE_API_URL || import.meta.env.API_URL || 'http://localhost:3000/api',
  
  // Environment
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  
  // Check if we're in production
  IS_PRODUCTION: import.meta.env.NODE_ENV === 'production',
};

// Security validation - fail if no passcode is set
if (!ENV_CONFIG.ADMIN_PASSCODE) {
  console.error('❌ ADMIN_PASSCODE not set in environment variables!');
  console.error('❌ Create .env.local file with ADMIN_PASSCODE=your_secure_passcode');
  console.error('❌ For production, set ADMIN_PASSCODE in Vercel environment variables');
  throw new Error('ADMIN_PASSCODE environment variable is required');
}