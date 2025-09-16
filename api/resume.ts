// Vercel serverless function for resume management with PERMANENT JSONBin storage
// This works across all domains and persists permanently

interface VercelRequest {
  method?: string;
  body?: any;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
  setHeader: (name: string, value: string) => void;
  end: () => void;
}

// Resume data interface
interface ResumeData {
  downloadUrl: string;
  lastUpdated: string;
  filename: string;
}

// JSONBin configuration - UPDATE THESE WITH YOUR CREDENTIALS
const STORAGE_URL = 'https://api.jsonbin.io/v3/b/68c90385d0ea881f407f8393'; // Replace with your Bin ID
const STORAGE_KEY = process.env.JSONBIN_API_KEY || '$2a$10$yKUUJi95xhXA7hAukjkrCOE2bCBzWf15lXfGE/bz1VW8KrnoeBRDy'; // Fallback for development

// Get resume data from JSONBin (permanent storage)
async function getResumeData(): Promise<ResumeData> {
  try {
    // Try to fetch from JSONBin
    const response = await fetch(STORAGE_URL, {
      headers: {
        'X-Master-Key': STORAGE_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.record && data.record.downloadUrl) {
        return data.record;
      }
    }
  } catch (error) {
    console.log('Failed to fetch from JSONBin, using fallback');
  }

  // Fallback to default
  return {
    downloadUrl: "https://drive.google.com/uc?export=download&id=16pajWO-QZlmp8CHkFH_c9ce-FbM27hQN",
    lastUpdated: "2025-09-16",
    filename: "resume_suman_madipeddi.pdf"
  };
}

// Update resume data in JSONBin (permanent storage)
async function updateResumeData(fileId: string): Promise<ResumeData> {
  const updatedData: ResumeData = {
    downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
    lastUpdated: new Date().toISOString().split('T')[0],
    filename: "resume_suman_madipeddi.pdf"
  };

  try {
    // Update JSONBin
    const response = await fetch(STORAGE_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': STORAGE_KEY
      },
      body: JSON.stringify(updatedData)
    });

    if (response.ok) {
      console.log('Resume data updated in JSONBin permanently');
      const result = await response.json();
      return result.record;
    } else {
      console.log('Failed to update JSONBin:', response.status);
      throw new Error(`Failed to update JSONBin: ${response.statusText}`);
    }
  } catch (error) {
    console.log('Error updating JSONBin:', error);
    throw new Error('Failed to update resume permanently.');
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Verify passcode for POST requests
  if (req.method === 'POST') {
    const { passcode } = req.body;
    const adminPasscode = process.env.ADMIN_PASSCODE; // Fallback for development

    if (!passcode || passcode !== adminPasscode) {
      return res.status(401).json({
        success: false,
        message: 'Invalid passcode. Access denied.',
      });
    }
  }

  if (req.method === 'GET') {
    try {
      const resumeData = await getResumeData();
      
      res.status(200).json({
        success: true,
        data: resumeData,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch resume data.',
        error: error.message,
      });
    }
  } else if (req.method === 'POST') {
    try {
      const { fileId } = req.body;
      console.log('📝 Admin update request received:', { fileId });

      if (!fileId) {
        return res.status(400).json({
          success: false,
          message: 'File ID is required',
        });
      }

      console.log('🔄 Updating JSONBin with file ID:', fileId);
      const updatedData = await updateResumeData(fileId);
      console.log('✅ JSONBin updated successfully:', updatedData);
      
      res.status(200).json({
        success: true,
        message: 'Resume updated permanently! Changes are now live for all users across all domains.',
        data: updatedData,
      });
    } catch (error: any) {
      console.log('❌ Error updating resume:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update resume permanently.',
        error: error.message,
      });
    }
  } else {
    res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }
}