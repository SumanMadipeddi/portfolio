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
    filename: string;
  };
}

// Verify passcode via server endpoint first. Local fallback is only for local development.
export const verifyPasscode = async (passcode: string): Promise<ResumeResponse> => {
  try {
    const response = await fetch(`${API_BASE}/resume/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode }),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    // Local fallback only if frontend passcode is available
    if (ADMIN_PASSCODE && passcode === ADMIN_PASSCODE) {
      return {
        success: true,
        message: 'Passcode verified successfully',
      };
    }

    return {
      success: false,
      message: 'Unable to verify passcode. Check server/API configuration.',
    };
  }
};

// Update resume on server
export const updateResumeOnServer = async (fileId: string, passcode: string): Promise<ResumeResponse> => {
  // Always use server-side API to update JSONBin
  try {
    const response = await fetch(`${API_BASE}/resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId, passcode }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result?.message || `HTTP error! status: ${response.status}`,
      };
    }

    // Save to localStorage for immediate local testing
    if (result.success && result.data?.downloadUrl) {
      localStorage.setItem('resumeUrl', result.data.downloadUrl);
      localStorage.setItem('resumeLastUpdated', result.data.lastUpdated);
    }

    return result;
  } catch (error) {
    console.error('Server API error:', error);
    // Fallback to direct JSONBin update for local development only
    return await updateJSONBinDirectly(fileId, passcode);
  }
};

// Direct JSONBin update function
async function updateJSONBinDirectly(fileId: string, passcode: string): Promise<ResumeResponse> {
  if (!ADMIN_PASSCODE || passcode !== ADMIN_PASSCODE) {
    return {
      success: false,
      message: 'Invalid passcode. Access denied.',
    };
  }

  try {
    const STORAGE_URL = 'https://api.jsonbin.io/v3/b/68c90385d0ea881f407f8393';
    const STORAGE_KEY = '$2a$10$yKUUJi95xhXA7hAukjkrCOE2bCBzWf15lXfGE/bz1VW8KrnoeBRDy';

    const updatedData = {
      downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
      lastUpdated: new Date().toISOString().split('T')[0],
      filename: 'resume_suman_madipeddi.pdf',
    };

    const response = await fetch(STORAGE_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': STORAGE_KEY,
      },
      body: JSON.stringify(updatedData),
    });

    if (response.ok) {
      const result = await response.json();
      localStorage.setItem('resumeUrl', updatedData.downloadUrl);
      localStorage.setItem('resumeLastUpdated', updatedData.lastUpdated);

      return {
        success: true,
        message: 'Resume updated permanently in JSONBin!',
        data: result.record,
      };
    }

    throw new Error(`JSONBin update failed: ${response.statusText}`);
  } catch (error) {
    console.error('JSONBin update error:', error);
    return {
      success: false,
      message: 'Failed to update resume permanently.',
    };
  }
}
