import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { InterviewEvent, FilterOptions } from "@/types/interview";
import { getInterviewEvents, updateInterviewEvent, getCompaniesFromEvents } from "@/lib/interview-storage";
import { computeOverallMetrics, filterInterviewEvents } from "@/lib/analytics/interviewMetrics";
import { MetricCard } from "@/components/interviews/MetricCard";
import { DashboardFilters } from "@/components/interviews/DashboardFilters";
import { InterviewJourneyChart } from "@/components/interviews/InterviewJourneyChart";
import { RoleAnalyticsChart } from "@/components/interviews/RoleAnalyticsChart";
import { NeedsAttention } from "@/components/interviews/NeedsAttention";
import { UpcomingInterviews } from "@/components/interviews/UpcomingInterviews";
import { InterviewDetailDrawer } from "@/components/interviews/InterviewDetailDrawer";
import { verifyPasscode } from "@/lib/resume-api";
import { requestGoogleCalendarAccessToken } from "@/lib/google-calendar/client";
import { fetchLiveGoogleCalendarEvents } from "@/lib/google-calendar/fetch-events";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Briefcase,
  Calendar,
  Trophy,
  Zap,
  Shield,
  RefreshCw,
  Sparkles,
  Lock,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Globe,
} from "lucide-react";

export default function Interviews() {
  const navigate = useNavigate();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

  // Data & Dashboard State
  const [events, setEvents] = useState<InterviewEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<InterviewEvent | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusText, setSyncStatusText] = useState("");
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: "all",
    companyId: "all",
    roleId: "all",
    category: "all",
    stage: "all",
    status: "all",
    searchQuery: "",
  });

  useEffect(() => {
    // Check if session is authenticated
    const authed = sessionStorage.getItem("interviews_auth_token");
    if (authed === "true") {
      setIsAuthenticated(true);
    }

    const loaded = getInterviewEvents();
    setEvents(loaded);
  }, []);

  const handlePasscodeVerification = async () => {
    if (!passcode.trim()) {
      setAuthMessage("Please enter the passcode");
      return;
    }

    setIsVerifying(true);
    setAuthMessage("");

    try {
      const result = await verifyPasscode(passcode);
      if (result.success || passcode === "Suman@0216") {
        setIsAuthenticated(true);
        sessionStorage.setItem("interviews_auth_token", "true");
        setAuthMessage("Access granted! Opening Intelligence Dashboard...");
      } else {
        setAuthMessage(result.message || "Invalid passcode. Access denied.");
      }
    } catch (err) {
      if (passcode === "Suman@0216") {
        setIsAuthenticated(true);
        sessionStorage.setItem("interviews_auth_token", "true");
      } else {
        setAuthMessage("Invalid passcode. Please try again.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("interviews_auth_token");
    setIsAuthenticated(false);
    setPasscode("");
    setAuthMessage("");
  };

  // Google OAuth Authorization & Calendar Fetch
  const handleConnectGoogleCalendar = async () => {
    setIsSyncing(true);
    setSyncStatusText("Connecting to Google OAuth 2.0 Identity Services...");

    try {
      const clientId =
        import.meta.env.VITE_GOOGLE_CLIENT_ID ||
        "932745157899-87093h8a9bboh0rs9m8donjap3716qrk.apps.googleusercontent.com";

      const token = await requestGoogleCalendarAccessToken(clientId);
      setGoogleAccessToken(token);
      setSyncStatusText("Fetching live calendar events from Google API...");

      const freshEvents = await fetchLiveGoogleCalendarEvents(token);
      setEvents(freshEvents);
      setSyncStatusText("Synced latest Google Calendar events!");
      setTimeout(() => setSyncStatusText(""), 3500);
    } catch (err: any) {
      console.warn("Google OAuth popup error:", err);
      const isAccessDenied = String(err?.message || "").includes("access_denied") || String(err?.message || "").includes("403");

      if (isAccessDenied) {
        setSyncStatusText(
          "Google OAuth 403 Error: App is in 'Testing' mode in Google Cloud Console. Add madipeddisuman@gmail.com under 'Test Users' in OAuth consent screen!"
        );
      } else {
        setSyncStatusText(`Google Auth: ${err?.message || "Popup closed or unverified"}`);
      }

      // Prompt optional Google Access Token or API Key fallback
      const manualToken = prompt(
        "Google OAuth Setup Helper:\n\n1. Go to Google Cloud Console -> OAuth consent screen -> Test users -> Add 'madipeddisuman@gmail.com'\nOR\n2. Paste a Google Calendar Access Token to sync immediately:"
      );

      if (manualToken && manualToken.trim()) {
        try {
          setSyncStatusText("Fetching events via Google API...");
          const fresh = await fetchLiveGoogleCalendarEvents(manualToken.trim());
          setEvents(fresh);
          setSyncStatusText("Synced Google Calendar events!");
          setTimeout(() => setSyncStatusText(""), 3500);
        } catch (e: any) {
          setSyncStatusText(`Sync error: ${e.message || "Failed to fetch events"}`);
        }
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const filteredEvents = useMemo(() => filterInterviewEvents(events, filters), [events, filters]);
  const metrics = useMemo(() => computeOverallMetrics(filteredEvents), [filteredEvents]);
  const companies = useMemo(() => getCompaniesFromEvents(events), [events]);

  const handleSelectEvent = (evt: InterviewEvent) => {
    setSelectedEvent(evt);
    setIsDrawerOpen(true);
  };

  const handleUpdateEvent = (updated: InterviewEvent) => {
    const nextEvents = updateInterviewEvent(updated);
    setEvents(nextEvents);
    setSelectedEvent(updated);
  };

  // Render Passcode Authentication Form if not logged in
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070a0f] text-slate-100 font-sans flex items-center justify-center p-6 selection:bg-cyan-500 selection:text-slate-950">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Portfolio
            </button>
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-xl shadow-cyan-500/20 font-black mx-auto">
              <Shield className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Interview Intelligence Admin
            </h1>
            <p className="text-xs text-slate-400">
              Enter admin passcode to unlock the Job Search & Google Calendar Dashboard
            </p>
          </div>

          <Card className="bg-[#111622]/90 border border-slate-800/80 backdrop-blur-xl shadow-2xl p-2 rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm text-slate-200">
                <Lock className="h-4 w-4 text-cyan-400" />
                Passcode Verification Required
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="passcode" className="text-xs text-slate-300">
                  Admin Passcode
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="passcode"
                    type={showPasscode ? "text" : "password"}
                    placeholder="Enter passcode..."
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handlePasscodeVerification()}
                    className="bg-[#0a0e17] border-slate-800 text-slate-100 pr-12 focus:border-cyan-500 text-sm py-2 rounded-xl"
                  />
                  <button
                    type="button"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    onClick={() => setShowPasscode(!showPasscode)}
                  >
                    {showPasscode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  Enter your admin passcode (`Suman@0216`) to view interview metrics and sync calendar data.
                </p>
              </div>

              <Button
                onClick={handlePasscodeVerification}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-cyan-500/20 text-xs"
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Unlock Dashboard Access"
                )}
              </Button>

              {authMessage && (
                <div
                  className={`py-2.5 px-4 rounded-xl text-xs border backdrop-blur-md transition-all text-center ${
                    authMessage.toLowerCase().includes("granted") ||
                    authMessage.toLowerCase().includes("success")
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  }`}
                >
                  {authMessage}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Dashboard View when Authenticated
  return (
    <div className="min-h-screen bg-[#070a0f] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 pb-20">
      {/* Top Banner Header */}
      <header className="border-b border-slate-800/80 bg-[#0c1017]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Return to Portfolio"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/20 font-black">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                Job Search & Interview Intelligence
                <span className="text-[10px] font-bold uppercase bg-cyan-500/10 text-cyan-400 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                  Google Calendar OAuth 2.0
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Automated event normalization, multi-role journey tracking, and funnel analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleConnectGoogleCalendar}
              disabled={isSyncing}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md shadow-cyan-500/20"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Syncing Google Calendar..." : "Connect Google Calendar"}
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700/80 transition-colors"
              title="Lock Dashboard"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {syncStatusText && (
          <div className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs px-4 py-3 rounded-2xl flex items-center gap-2 animate-in fade-in duration-200">
            <Sparkles className="h-4 w-4 text-cyan-400 animate-spin" />
            {syncStatusText}
          </div>
        )}

        {/* 5 Top KPI Cards */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <MetricCard
            title="Active Companies"
            value={metrics.activeCompanies}
            subtext="In active pipeline"
            change="+12.5%"
            trend="up"
            icon={<Building2 className="h-5 w-5" />}
          />
          <MetricCard
            title="Active Roles"
            value={metrics.activeRoles}
            subtext="Across candidate apps"
            change="+8.7%"
            trend="up"
            icon={<Briefcase className="h-5 w-5" />}
          />
          <MetricCard
            title="Interviews This Week"
            value={metrics.interviewsThisWeek}
            subtext="7 days scheduled"
            change="+40%"
            trend="up"
            icon={<Calendar className="h-5 w-5" />}
          />
          <MetricCard
            title="Final / Onsite"
            value={metrics.finalOrOnsiteCount}
            subtext="High intent rounds"
            change="3 Total"
            trend="neutral"
            icon={<Zap className="h-5 w-5 text-amber-400" />}
            accentColor="from-amber-500/20 to-orange-500/10"
          />
          <MetricCard
            title="Offers Received"
            value={metrics.offersCount}
            subtext="Pending decision"
            change="1 Offer"
            trend="up"
            icon={<Trophy className="h-5 w-5 text-emerald-400" />}
            accentColor="from-emerald-500/20 to-teal-500/10"
          />
        </section>

        {/* Filter Toolbar */}
        <DashboardFilters filters={filters} onChange={setFilters} companies={companies} />

        {/* HERO Visualization: Interview Journey Interactive Line Graph */}
        <section>
          <InterviewJourneyChart
            events={filteredEvents}
            onSelectEvent={handleSelectEvent}
            onViewRole={(roleId) => navigate(`/roles/${roleId}`)}
          />
        </section>

        {/* Visualization 2: Interview Activity & Role Analytics */}
        <section>
          <RoleAnalyticsChart events={filteredEvents} />
        </section>

        {/* Supporting Widgets Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <NeedsAttention events={events} onSelectEvent={handleSelectEvent} />
          <UpcomingInterviews events={events} onSelectEvent={handleSelectEvent} />
        </section>
      </main>

      {/* Slide-Over Interview Detail Drawer */}
      <InterviewDetailDrawer
        event={selectedEvent}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdateEvent={handleUpdateEvent}
      />
    </div>
  );
}
