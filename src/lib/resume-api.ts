// Resume API for production server-side updates
import { ENV_CONFIG } from '@/config/env';

const API_BASE = ENV_CONFIG.API_BASE;
const ADMIN_PASSCODE = ENV_CONFIG.ADMIN_PASSCODE;

export interface ResumeResponse {
  success: boolean;
  message: string;
  data?: {
    downloadUrl: string;
    lastUpdated: string;
  };
}

// Verify passcode
export const verifyPasscode = async (passcode: string): Promise<ResumeResponse> => {
  if (!ADMIN_PASSCODE) {
    return {
      success: false,
      message: 'System configuration error. Please contact administrator.',
    };
  }

  if (passcode === ADMIN_PASSCODE) {
    return {
      success: true,
      message: 'Passcode verified successfully',
    };
  }

  return {
    success: false,
    message: 'Invalid passcode. Access denied.',
  };
};

// Update resume on server
export const updateResumeOnServer = async (fileId: string, passcode: string): Promise<ResumeResponse> => {
  if (!ADMIN_PASSCODE) {
    return {
      success: false,
      message: 'System configuration error. Please contact administrator.',
    };
  }

  // In production, use server-side API
  if (ENV_CONFIG.IS_PRODUCTION) {
    try {
      const response = await fetch(`${API_BASE}/resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId, passcode }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Save to localStorage for immediate local testing
      if (result.success && result.data?.downloadUrl) {
        localStorage.setItem('resumeUrl', result.data.downloadUrl);
      }
      
      return result;
    } catch (error) {
      console.error('Production API error:', error);
      // Fallback to client-side update
    }
  }

  // Client-side verification and update (development or fallback)
  if (passcode !== ADMIN_PASSCODE) {
    return {
      success: false,
      message: 'Invalid passcode. Access denied.',
    };
  }

  // Convert file ID to direct download URL
  const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  
  // Save to localStorage
  localStorage.setItem('resumeUrl', directUrl);
  
  return {
    success: true,
    message: 'Resume updated successfully',
    data: {
      downloadUrl: directUrl,
      lastUpdated: new Date().toISOString().split('T')[0],
    },
  };
};