import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, ExternalLink, Info, Loader2, Eye, EyeOff } from "lucide-react";
import { getResumeInfo } from "@/lib/resume";
import { updateResumeOnServer, verifyPasscode } from "../lib/resume-api";

export default function Admin() {
  const [resumeUrl, setResumeUrl] = useState("");
  const [instructions, setInstructions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);
  const [resumeInfo, setResumeInfo] = useState({
    filename: "SumanMadipeddi_CV.pdf",
    downloadUrl: "",
    lastUpdated: "",
    size: "~2.5 MB"
  });

  useEffect(() => {
    const loadResumeInfo = async () => {
      const info = await getResumeInfo();
      setResumeInfo(info);
    };
    loadResumeInfo();
  }, []);

  const handlePasscodeVerification = async () => {
    if (!passcode.trim()) {
      setMessage('Please enter the passcode');
      return;
    }

    setIsVerifying(true);
    setMessage('');

    try {
      const result = await verifyPasscode(passcode);
      
      if (result.success) {
        setIsAuthenticated(true);
        setMessage('✅ Access granted! You can now update the resume.');
        const info = await getResumeInfo();
        setResumeInfo(info);
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch (error) {
      setMessage('❌ Failed to verify passcode. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUrlUpdate = async () => {
    if (!resumeUrl.trim()) {
      setMessage('Please enter a valid file ID or URL');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Extract file ID from URL if full URL is provided
      let fileId = resumeUrl.trim();
      if (fileId.includes('drive.google.com/file/d/')) {
        const match = fileId.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (match) {
          fileId = match[1];
        }
      }

      const result = await updateResumeOnServer(fileId, passcode);
      
      if (result.success) {
        setMessage('✅ Resume updated successfully! The download button will now use the new resume.');
        localStorage.setItem('resumeUrl', result.data?.downloadUrl || '');
        const info = await getResumeInfo();
        setResumeInfo(info);
      } else {
        setMessage(`❌ ${result.message}`);
      }
    } catch (error) {
      setMessage('❌ Failed to update resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPasscode('');
    setResumeUrl('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text mb-4">
            Resume Management
          </h1>
          <p className="text-xl text-muted-foreground">
            Secure admin access for resume updates
          </p>
        </div>

        {!isAuthenticated ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Admin Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="passcode">Enter Passcode</Label>
                <div className="relative">
                  <Input
                    id="passcode"
                    type={showPasscode ? "text" : "password"}
                    placeholder="Enter admin passcode"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handlePasscodeVerification()}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setShowPasscode(!showPasscode)}
                  >
                    {showPasscode ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the admin passcode to access resume management
                </p>
              </div>
              
              <Button 
                onClick={handlePasscodeVerification} 
                className="w-full"
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Access'
                )}
              </Button>

              {message && (
                <div className={`p-3 rounded-md text-sm ${
                  message.includes('✅') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {message}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Update Resume
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700"
                >
                  Logout
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="resume-url">Google Drive File ID or URL</Label>
                <Input
                  id="resume-url"
                  placeholder="16pajWO-QZlmp8CHkFH_c9ce-FbM27hQN"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your Google Drive file ID or complete URL
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={handleUrlUpdate} 
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Resume URL'
                  )}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.open('https://drive.google.com', '_blank')}
                  className="flex-1"
                >
                  Open Google Drive
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {message && (
                <div className={`p-3 rounded-md text-sm ${
                  message.includes('✅') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {message}
                </div>
              )}

              <div className="pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setInstructions(!instructions)}
                  className="w-full"
                >
                  <Info className="mr-2 h-4 w-4" />
                  {instructions ? 'Hide' : 'Show'} Setup Instructions
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {instructions && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Google Drive Setup</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Upload your resume to Google Drive</li>
                  <li>Right-click the file and select 'Get link'</li>
                  <li>Change sharing to 'Anyone with the link can view'</li>
                  <li>Copy the file ID from the URL</li>
                  <li>Use this format: https://drive.google.com/uc?export=download&id=YOUR_FILE_ID</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Dropbox Setup</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Upload your resume to Dropbox</li>
                  <li>Right-click the file and select 'Share'</li>
                  <li>Click 'Create link' and copy the link</li>
                  <li>Replace the 'dl=0' at the end with 'dl=1'</li>
                  <li>Use that URL in the admin interface</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}