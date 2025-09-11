// Vercel serverless function for passcode verification

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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { passcode } = req.body;
      const adminPasscode = process.env.ADMIN_PASSCODE;

      if (!passcode) {
        return res.status(400).json({
          success: false,
          message: 'Passcode is required',
        });
      }

      if (passcode !== adminPasscode) {
        return res.status(401).json({
          success: false,
          message: 'Invalid passcode. Access denied.',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Passcode verified successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to verify passcode',
      });
    }
  } else {
    res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  }
}