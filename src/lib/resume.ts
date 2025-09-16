// Resume management utilities
export interface ResumeInfo {
  filename: string;
  downloadUrl: string;
  lastUpdated: string;
  size: string;
}

const RESUME_CONFIG = {
  directUrl: "https://drive.google.com/uc?export=download&id=16pajWO-QZlmp8CHkFH_c9ce-FbM27hQN",
  fallbackUrl: "/resume/SumanMadipeddi_CV.pdf"
};

export const getResumeInfo = async (): Promise<ResumeInfo> => {
  // In production, use server API; in development, fetch directly from JSONBin
  if (import.meta.env.NODE_ENV === 'production') {
    // Production: Use server API
    try {
      const response = await fetch('/api/resume');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          console.log('✅ Using updated resume from JSONBin (via server):', result.data.downloadUrl);
          return {
            filename: result.data.filename || "resume_suman_madipeddi.pdf",
            downloadUrl: result.data.downloadUrl,
            lastUpdated: result.data.lastUpdated || new Date().toLocaleDateString(),
            size: "~2.5 MB"
          };
        }
      }
    } catch (error) {
      console.log('⚠️ Server API failed in production');
    }
  } else {
    // Development: Fetch directly from JSONBin
    try {
      const STORAGE_URL = 'https://api.jsonbin.io/v3/b/68c90385d0ea881f407f8393';
      const STORAGE_KEY = '$2a$10$yKUUJi95xhXA7hAukjkrCOE2bCBzWf15lXfGE/bz1VW8KrnoeBRDy';
      
      const response = await fetch(STORAGE_URL, {
        headers: {
          'X-Master-Key': STORAGE_KEY,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.record && data.record.downloadUrl) {
          console.log('✅ Using updated resume from JSONBin (direct):', data.record.downloadUrl);
          return {
            filename: data.record.filename || "resume_suman_madipeddi.pdf",
            downloadUrl: data.record.downloadUrl,
            lastUpdated: data.record.lastUpdated || new Date().toLocaleDateString(),
            size: "~2.5 MB"
          };
        }
      }
    } catch (error) {
      console.log('⚠️ Direct JSONBin fetch failed, trying localStorage');
    }
  }

  // Check localStorage for admin updates (fallback)
  const customUrl = localStorage.getItem('resumeUrl');
  if (customUrl) {
    console.log('✅ Using resume from localStorage:', customUrl);
    return {
      filename: "resume_suman_madipeddi.pdf",
      downloadUrl: customUrl,
      lastUpdated: new Date().toLocaleDateString(),
      size: "~2.5 MB"
    };
  }
  
  // Final fallback to hardcoded URL
  console.log('⚠️ Using hardcoded fallback URL');
  return {
    filename: "resume_suman_madipeddi.pdf",
    downloadUrl: RESUME_CONFIG.directUrl || RESUME_CONFIG.fallbackUrl,
    lastUpdated: new Date().toLocaleDateString(),
    size: "~2.5 MB"
  };
};

export const downloadResume = async () => {
  const resumeInfo = await getResumeInfo();
  
  // Create a temporary link to download the resume
  const link = document.createElement('a');
  link.href = resumeInfo.downloadUrl;
  link.download = resumeInfo.filename;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};