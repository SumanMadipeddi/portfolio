// Vercel serverless function for resume management

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
    const adminPasscode = process.env.ADMIN_PASSCODE;

    if (!passcode || passcode !== adminPasscode) {
      return res.status(401).json({
        success: false,
        message: 'Invalid passcode. Access denied.',
      });
    }
  }

  if (req.method === 'GET') {
    // Return current resume info (no file system dependency)
    res.status(200).json({
      success: true,
      data: {
        downloadUrl: "https://drive.google.com/uc?export=download&id=16pajWO-QZlmp8CHkFH_c9ce-FbM27hQN",
        lastUpdated: new Date().toISOString().split('T')[0],
        filename: "SumanMadipeddi_CV.pdf",
      },
    });
  }

  if (req.method === 'POST') {
    try {
      const { fileId, passcode } = req.body;
      const adminPasscode = process.env.ADMIN_PASSCODE;

      if (!fileId) {
        return res.status(400).json({
          success: false,
          message: 'File ID is required',
        });
      }

      if (!passcode || passcode !== adminPasscode) {
        return res.status(401).json({
          success: false,
          message: 'Invalid passcode. Access denied.',
        });
      }

      // Convert file ID to direct download URL
      const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

      res.status(200).json({
        success: true,
        message: 'Resume updated successfully',
        data: {
          downloadUrl: directUrl,
          lastUpdated: new Date().toISOString().split('T')[0],
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update resume',
      });
    }
  }
}