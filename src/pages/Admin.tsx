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
        setMessage('Access granted! You can now update the resume.');
        const info = await getResumeInfo();
        setResumeInfo(info);
        
        // Auto-clear message after 3 seconds
        setTimeout(() => {
          setMessage('');
        }, 3000);
      } else {
        setMessage(result.message || 'Invalid passcode. Access denied.');
      }
    } catch (error) {
      setMessage('Failed to verify passcode. Please try again.');
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
        setMessage('Resume updated successfully! Changes are now live for all users.');
        localStorage.setItem('resumeUrl', result.data?.downloadUrl || '');
        const info = await getResumeInfo();
        setResumeInfo(info);

        // Auto-clear message after 3 seconds
        setTimeout(() => {
          setMessage('');
        }, 3000);
      } else {
        setMessage(result.message || 'Failed to update resume.');
      }
    } catch (error) {
      setMessage('Failed to update resume. Please try again.');
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
    <div className="v2 min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors duration-300 py-20">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold gradient-text mb-4">
            Resume Management
          </h1>
          <p className="text-xl text-[var(--text2)]">
            Secure admin access for resume updates
          </p>
        </div>

        {!isAuthenticated ? (
          <Card className="premium-card max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[var(--text)]">
                <Info className="h-5 w-5 text-[var(--accent)]" />
                Admin Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="passcode" className="text-[var(--text2)]">Enter Passcode</Label>
                <div className="relative mt-1">
                  <Input
                    id="passcode"
                    type={showPasscode ? "text" : "password"}
                    placeholder="Enter admin passcode"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handlePasscodeVerification()}
                    className="premium-input pr-12"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-white/10 dark:hover:bg-black/10 transition-colors"
                    onClick={() => setShowPasscode(!showPasscode)}
                  >
                    {showPasscode ? (
                      <EyeOff className="h-4 w-4 text-[var(--text3)]" />
                    ) : (
                      <Eye className="h-4 w-4 text-[var(--text3)]" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-[var(--text3)] mt-2">
                  Enter the admin passcode to access resume management
                </p>
              </div>
              
              <Button 
                onClick={handlePasscodeVerification} 
                className="w-full btn-primary"
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
                <div className={`py-2.5 px-6 rounded-full text-sm border backdrop-blur-md transition-all text-center ${
                  message.toLowerCase().includes('granted') || message.toLowerCase().includes('success')
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                }`}>
                  {message}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="premium-card max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-[var(--text)]">
                  <Upload className="h-5 w-5 text-[var(--accent)]" />
                  Update Resume
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogout}
                  className="btn-logout"
                >
                  Logout
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="resume-url" className="text-[var(--text2)]">Google Drive File ID or URL</Label>
                <Input
                  id="resume-url"
                  placeholder="16pajWO-QZlmp8CHkFH_c9ce-FbM27hQN"
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  className="premium-input mt-1"
                />
                <p className="text-xs text-[var(--text3)] mt-2">
                  Enter your Google Drive file ID or complete URL
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={handleUrlUpdate} 
                  className="flex-1 btn-primary"
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
                  className="flex-1 btn-secondary"
                >
                  Open Google Drive
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {message && (
                <div className={`py-2.5 px-6 rounded-full text-sm border backdrop-blur-md transition-all text-center ${
                  message.toLowerCase().includes('granted') || message.toLowerCase().includes('success')
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                }`}>
                  {message}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}