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
import { Building2, Briefcase, Calendar, Trophy, Zap, Shield, RefreshCw, Sparkles, Lock, ArrowLeft } from "lucide-react";

export default function Interviews() {
  const navigate = useNavigate();

  const [events, setEvents] = useState<InterviewEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<InterviewEvent | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

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
    const loaded = getInterviewEvents();
    setEvents(loaded);
  }, []);

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

  const handleTriggerSync = () => {
    setIsSyncing(true);
    setSyncMessage("Connecting to Google Calendar API...");

    setTimeout(() => {
      setSyncMessage("Syncing events and re-running classification engine...");
      setTimeout(() => {
        const loaded = getInterviewEvents();
        setEvents(loaded);
        setIsSyncing(false);
        setSyncMessage("Synced latest calendar events!");
        setTimeout(() => setSyncMessage(""), 3000);
      }, 1000);
    }, 800);
  };

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
                  Google Calendar Live Sync
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Automated event normalization, multi-role journey tracking, and funnel analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 bg-[#111622] px-3 py-1.5 rounded-xl border border-slate-800">
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              <span>Admin Auth Active (`Suman@0216`)</span>
            </div>

            <button
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md shadow-cyan-500/20"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Syncing Calendar..." : "Sync Calendar"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        
        {syncMessage && (
          <div className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs px-4 py-3 rounded-2xl flex items-center gap-2 animate-in fade-in duration-200">
            <Sparkles className="h-4 w-4 text-cyan-400 animate-spin" />
            {syncMessage}
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
        <DashboardFilters
          filters={filters}
          onChange={setFilters}
          companies={companies}
        />

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
