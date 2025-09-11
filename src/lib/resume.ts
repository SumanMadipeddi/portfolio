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
  // Check localStorage first (for admin updates)
  const customUrl = localStorage.getItem('resumeUrl');
  
  return {
    filename: "SumanMadipeddi_CV.pdf",
    downloadUrl: customUrl || RESUME_CONFIG.directUrl || RESUME_CONFIG.fallbackUrl,
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