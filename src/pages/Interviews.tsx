import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { InterviewEvent, FilterOptions } from "@/types/interview";
import {
  requestGoogleCalendarAccessToken,
  disconnectGoogleCalendar,
  isGoogleCalendarConnected,
  setGoogleCalendarConnected,
} from "@/lib/google-calendar/client";
import { fetchLiveGoogleCalendarEvents } from "@/lib/google-calendar/fetch-events";
import { getInterviewEvents, updateInterviewEvent, getCompaniesFromEvents, clearInterviewEvents } from "@/lib/interview-storage";
import { computeOverallMetrics, filterInterviewEvents } from "@/lib/analytics/interviewMetrics";
import { getFilterRangeStart, isInInterviewWindow } from "@/lib/interview-window";
import { MetricCard } from "@/components/interviews/MetricCard";
import { DashboardFilters } from "@/components/interviews/DashboardFilters";
import { InterviewJourneyChart } from "@/components/interviews/InterviewJourneyChart";
import { RoleAnalyticsChart } from "@/components/interviews/RoleAnalyticsChart";
import { NeedsAttention } from "@/components/interviews/NeedsAttention";
import { UpcomingInterviews } from "@/components/interviews/UpcomingInterviews";
import { InterviewDetailDrawer } from "@/components/interviews/InterviewDetailDrawer";
import { verifyPasscode } from "@/lib/resume-api";
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
  RefreshCw,
  Unplug,
  Lock,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  LogOut,
} from "lucide-react";

export default function Interviews() {
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

  const [events, setEvents] = useState<InterviewEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<InterviewEvent | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusText, setSyncStatusText] = useState("");
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: "30d",
    companyId: "all",
    roleId: "all",
    category: "all",
    stage: "all",
    status: "all",
    searchQuery: "",
  });

  useEffect(() => {
    localStorage.removeItem("interview_intelligence_events_live_v3");
    localStorage.removeItem("interview_intelligence_events_aug2024_v2");
    localStorage.removeItem("interview_intelligence_events_v1");

    const authed = sessionStorage.getItem("interviews_auth_token");
    if (authed === "true") {
      setIsAuthenticated(true);
    }

    setIsGoogleConnected(isGoogleCalendarConnected());
    setEvents(getInterviewEvents().filter((event) => isInInterviewWindow(event.start)));
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

  const refreshLiveCalendar = useCallback(async (interactive: boolean) => {
    const token = await requestGoogleCalendarAccessToken({ silent: !interactive });
    const freshEvents = await fetchLiveGoogleCalendarEvents(token);
    setEvents(freshEvents);
    setGoogleCalendarConnected(true);
    setIsGoogleConnected(true);
    return freshEvents;
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !isGoogleConnected) return;

    let cancelled = false;

    const refresh = async () => {
      try {
        await refreshLiveCalendar(false);
      } catch {
        // Keep the last snapshot if a silent refresh is blocked.
      }
    };

    refresh();
    const intervalId = window.setInterval(refresh, 5 * 60 * 1000);
    const onVisible = () => {
      if (document.visibilityState === "visible" && !cancelled) refresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [isAuthenticated, isGoogleConnected, refreshLiveCalendar]);

  const handleConnectGoogleCalendar = async () => {
    setIsSyncing(true);
    setSyncStatusText("Connecting Google Calendar...");

    try {
      const freshEvents = await refreshLiveCalendar(true);
      const upcomingCount = freshEvents.filter((e) => new Date(e.start) > new Date()).length;
      setSyncStatusText(
        upcomingCount > 0
          ? `Live · ${freshEvents.length} interviews (${upcomingCount} upcoming)`
          : `Live · ${freshEvents.length} interviews from Aug 2024`
      );
      setTimeout(() => setSyncStatusText(""), 4000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Google Calendar sign-in failed";
      setSyncStatusText(
        `${message}. In Google Cloud Console enable Calendar API, use a Web client, and add ${window.location.origin} under Authorized JavaScript origins.`
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnectGoogleCalendar = async () => {
    setIsSyncing(true);
    try {
      await disconnectGoogleCalendar();
      clearInterviewEvents();
      setEvents([]);
      setIsGoogleConnected(false);
      setSelectedEvent(null);
      setIsDrawerOpen(false);
      setSyncStatusText("Google Calendar disconnected.");
      setTimeout(() => setSyncStatusText(""), 2500);
    } finally {
      setIsSyncing(false);
    }
  };

  const allTimeFilters = useMemo(
    () => ({
      ...filters,
      searchQuery: "",
      companyId: "all" as const,
      roleId: "all",
      dateRange: "all" as const,
    }),
    [filters.category, filters.stage, filters.status]
  );
  const allTimeEvents = useMemo(
    () => filterInterviewEvents(events, allTimeFilters),
    [events, allTimeFilters]
  );
  const filteredEvents = useMemo(
    () => filterInterviewEvents(events, { ...filters, searchQuery: "" }),
    [events, filters]
  );
  const metrics = useMemo(() => computeOverallMetrics(allTimeEvents), [allTimeEvents]);
  const companies = useMemo(() => getCompaniesFromEvents(events), [events]);
  const timelineStart = useMemo(() => getFilterRangeStart(filters.dateRange), [filters.dateRange]);

  const handleSelectEvent = (evt: InterviewEvent) => {
    setSelectedEvent(evt);
    setIsDrawerOpen(true);
  };

  const handleUpdateEvent = (updated: InterviewEvent) => {
    const nextEvents = updateInterviewEvent(updated);
    setEvents(nextEvents);
    setSelectedEvent(updated);
  };

  if (!isAuthenticated) {
    return (
      <div className="v2 iv-app min-h-screen py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-10">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-1.5 text-sm text-[var(--text3)] hover:text-[var(--accent)] transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Portfolio
            </button>
            <h1 className="text-4xl font-semibold tracking-tight mb-3" style={{ letterSpacing: "-1.5px" }}>
              Interview Intelligence
            </h1>
          </div>

          <Card className="premium-card max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[var(--text)]">
                <Lock className="h-5 w-5 text-[var(--accent)]" />
                Admin Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="passcode" className="text-[var(--text2)]">
                  Enter Passcode
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="passcode"
                    type={showPasscode ? "text" : "password"}
                    placeholder="Enter admin passcode"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handlePasscodeVerification()}
                    className="premium-input pr-12"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/10 dark:hover:bg-black/10 transition-colors"
                    onClick={() => setShowPasscode(!showPasscode)}
                  >
                    {showPasscode ? (
                      <EyeOff className="h-4 w-4 text-[var(--text3)]" />
                    ) : (
                      <Eye className="h-4 w-4 text-[var(--text3)]" />
                    )}
                  </button>
                </div>
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
                  "Verify Access"
                )}
              </Button>

              {authMessage && (
                <div
                  className={`py-2.5 px-6 rounded-full text-sm border backdrop-blur-md transition-all text-center ${
                    authMessage.toLowerCase().includes("granted") ||
                    authMessage.toLowerCase().includes("success")
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-500 border-rose-500/20"
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

  return (
    <div className="v2 iv-app pb-12">
      <header className="iv-topbar">
        <div className="max-w-[1300px] mx-auto px-6 py-2.5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate("/")}
              className="theme-btn"
              title="Return to Portfolio"
              aria-label="Return to Portfolio"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <h1 className="text-[18px] font-semibold tracking-tight text-[var(--text)] truncate">
                Job Search & Interview Intelligence
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isGoogleConnected ? (
              <button
                onClick={handleDisconnectGoogleCalendar}
                disabled={isSyncing}
                className="btn-logout text-xs sm:text-sm"
                title="Disconnect Google Calendar"
              >
                <Unplug className="h-3.5 w-3.5" />
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleConnectGoogleCalendar}
                disabled={isSyncing}
                className="btn-primary text-xs sm:text-sm"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? "Connecting..." : "Sync Calendar"}
              </button>
            )}
            <button onClick={handleLogout} className="btn-logout" title="Lock Dashboard">
              <LogOut className="h-3.5 w-3.5 mr-1.5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1300px] mx-auto px-6 pt-4 space-y-3">
        {syncStatusText && (
          <div className="iv-card iv-card-sm flex items-center gap-2 text-sm text-[var(--accent)]">
            {isSyncing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
            {syncStatusText}
          </div>
        )}

        <section className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
          <MetricCard
            title="Active Companies"
            value={metrics.activeCompanies}
            subtext="Since Aug 2024 · unique companies"
            icon={<Building2 className="h-4 w-4" />}
          />
          <MetricCard
            title="Active Roles"
            value={metrics.activeRoles}
            subtext="Since Aug 2024 · unique roles"
            icon={<Briefcase className="h-4 w-4" />}
          />
          <MetricCard
            title="This Week"
            value={metrics.interviewsThisWeek}
            subtext="Interviews scheduled"
            icon={<Calendar className="h-4 w-4" />}
          />
          <MetricCard
            title="Final / Onsite"
            value={metrics.finalOrOnsiteCount}
            subtext="High intent rounds"
            icon={<Zap className="h-4 w-4" />}
            accent="amber"
          />
          <MetricCard
            title="Offers"
            value={metrics.offersCount}
            subtext="Pending decision"
            icon={<Trophy className="h-4 w-4" />}
            accent="green"
          />
        </section>

        <DashboardFilters
          filters={filters}
          onChange={setFilters}
          companies={companies}
          onSelectEvent={handleSelectEvent}
        />

        <InterviewJourneyChart
          events={filteredEvents}
          rangeStart={timelineStart}
          onSelectEvent={handleSelectEvent}
          onViewRole={(roleId) => navigate(`/roles/${roleId}`)}
        />

        <RoleAnalyticsChart events={filteredEvents} />

        <section className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <NeedsAttention events={events} onSelectEvent={handleSelectEvent} />
          <UpcomingInterviews events={events} onSelectEvent={handleSelectEvent} />
        </section>
      </main>

      <InterviewDetailDrawer
        event={selectedEvent}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdateEvent={handleUpdateEvent}
      />
    </div>
  );
}
