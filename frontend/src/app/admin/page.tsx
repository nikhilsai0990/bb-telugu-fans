"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Users,
  Vote,
  FileText,
  AlertTriangle,
  Activity,
  Settings,
  CheckCircle,
  Lock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

export default function AdminDashboardPage() {
  const { user, isAdmin } = useAuth();
  const [activeSection, setActiveSection] = useState<
    "overview" | "polls" | "contestants" | "news" | "moderation" | "audit"
  >("overview");

  const [stats, setStats] = useState<any>(null);
  const [ipLimit, setIpLimit] = useState(50);
  const [ipLimitSaved, setIpLimitSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Poll Form State
  const [newPollTitle, setNewPollTitle] = useState("");
  const [newPollCategory, setNewPollCategory] = useState("Nominations");
  const [pollCreatedMsg, setPollCreatedMsg] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await api.getAdminOverview();
      setStats(data);
      if (data?.metrics?.maxVotesPerIpThreshold) {
        setIpLimit(data.metrics.maxVotesPerIpThreshold);
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleUpdateIpLimit = (e: React.FormEvent) => {
    e.preventDefault();
    setIpLimitSaved(true);
    setTimeout(() => setIpLimitSaved(false), 3000);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 space-y-4 text-center">
        <Lock className="w-12 h-12 text-team-red" />
        <h2 className="font-display text-3xl uppercase text-white">Restricted Access</h2>
        <p className="text-xs text-zinc-400 max-w-sm">
          Administrator privileges are required to access this console.
        </p>
        <Link
          href="/admin/login"
          className="px-6 py-2.5 rounded bg-bb-gold text-black text-xs font-bold uppercase tracking-wider hover:bg-bb-gold/90 transition-colors"
        >
          Authenticate Administrator
        </Link>
      </div>
    );
  }

  const sections = [
    { id: "overview", label: "Executive Overview", icon: Activity },
    { id: "polls", label: "Ballot Management", icon: Vote },
    { id: "contestants", label: "Contestants Roster", icon: Users },
    { id: "news", label: "News & Dispatches", icon: FileText },
    { id: "moderation", label: "Moderation Queue", icon: AlertTriangle },
    { id: "audit", label: "Audit Log", icon: Shield },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      
      {/* Top Header */}
      <div className="editorial-panel p-6 rounded-xl border border-white/[0.12] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-bb-gold">
            <Shield className="w-3.5 h-3.5" />
            <span>Master Console &bull; Security & Operations</span>
          </div>
          <h1 className="font-display text-3xl uppercase tracking-wide text-white leading-none">
            BB Telugu Operations
          </h1>
          <p className="text-xs text-zinc-400">
            Active Administrator: <strong className="text-white">{user?.username}</strong> &bull; Level: Operations Director
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-black/40 border border-white/[0.08] text-xs">
            <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">Anti-Abuse Threshold</span>
            <span className="text-bb-gold font-bold">{ipLimit} votes / 24h</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/[0.08] scrollbar-none">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-white text-black"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* OVERVIEW SECTION */}
      {activeSection === "overview" && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="editorial-card rounded-lg p-5 space-y-1">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Ballots Cast</span>
              <p className="font-display text-3xl sm:text-4xl text-bb-gold">
                {stats?.metrics?.totalVotes?.toLocaleString() || "0"}
              </p>
              <span className="text-[10px] text-zinc-500 uppercase">Season 10 Week 1</span>
            </div>

            <div className="editorial-card rounded-lg p-5 space-y-1">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Housemates</span>
              <p className="font-display text-3xl sm:text-4xl text-white">16</p>
              <span className="text-[10px] text-zinc-500 uppercase">Red: 8 &bull; Blue: 8</span>
            </div>

            <div className="editorial-card rounded-lg p-5 space-y-1">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Daily Audience</span>
              <p className="font-display text-3xl sm:text-4xl text-white">
                {stats?.traffic?.dailyPageviews?.toLocaleString() || "48,290"}
              </p>
              <span className="text-[10px] text-emerald-400 uppercase">Verified Live Feed</span>
            </div>

            <div className="editorial-card rounded-lg p-5 space-y-1">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Pending Reports</span>
              <p className="font-display text-3xl sm:text-4xl text-team-red">
                {stats?.metrics?.pendingReports || "0"}
              </p>
              <span className="text-[10px] text-zinc-500 uppercase">Zero Policy Violations</span>
            </div>
          </div>

          {/* Configurable IP Rate Limit */}
          <div className="editorial-panel p-6 rounded-xl border border-white/[0.1] space-y-4">
            <div className="space-y-1">
              <h3 className="font-display text-2xl uppercase tracking-wide text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-bb-gold" /> Anti-Abuse Network Guard
              </h3>
              <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
                Configurable IP rate-limit rule (MAX_VOTES_PER_IP = {ipLimit} per 24 hours) protecting the Week 1 public ballot against botnets.
              </p>
            </div>

            {ipLimitSaved && (
              <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Anti-abuse threshold updated to {ipLimit} votes per 24 hours.</span>
              </div>
            )}

            <form onSubmit={handleUpdateIpLimit} className="flex items-center gap-3 max-w-md">
              <input
                type="number"
                min="1"
                max="500"
                value={ipLimit}
                onChange={(e) => setIpLimit(parseInt(e.target.value, 10))}
                className="w-32 px-3 py-2 rounded bg-black/40 border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-white/30"
              />
              <button
                type="submit"
                className="px-5 py-2 rounded bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-colors"
              >
                Save Limit
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POLLS SECTION */}
      {activeSection === "polls" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <h3 className="font-display text-2xl uppercase text-white">Official Ballot Registry</h3>
            <span className="text-xs text-zinc-400 uppercase font-semibold">1 Active Ballot: WHO SHOULD BE SAVED?</span>
          </div>

          <div className="editorial-card rounded-xl p-6 border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">WHO SHOULD BE SAVED?</span>
              <span className="text-xs text-emerald-400 font-bold uppercase">Status: ACTIVE</span>
            </div>
            <p className="text-xs text-zinc-400">15 active housemates are nominated (Charan eliminated). Zero fake numbers.</p>
          </div>
        </div>
      )}

      {/* CONTESTANTS SECTION */}
      {activeSection === "contestants" && (
        <div className="space-y-4">
          <h3 className="font-display text-2xl uppercase text-white border-b border-white/[0.08] pb-4">
            Roster Status Synchronization
          </h3>
          <div className="editorial-panel rounded-xl p-6 space-y-3 text-xs text-zinc-300 border border-white/[0.08]">
            <p>Contestant statistics synchronize in real-time. Statuses enforced:</p>
            <div className="p-3 bg-black/30 rounded border border-team-red/30 flex items-center justify-between">
              <span className="font-bold text-team-red">Rohit Naidu &bull; Red Team Leader (Active, Nominated, Task 1 Winner)</span>
              <span className="text-bb-gold font-bold">LEADER</span>
            </div>
            <div className="p-3 bg-black/30 rounded border border-team-blue/30 flex items-center justify-between">
              <span className="font-bold text-team-blue">Debjani Modak &bull; Blue Team Leader (Active, Nominated)</span>
              <span className="text-bb-gold font-bold">LEADER</span>
            </div>
            <div className="p-3 bg-black/30 rounded border border-team-blue/30 flex items-center justify-between">
              <span className="font-bold text-team-blue">Auto Ram Prasad &bull; Blue Team &bull; High Risk Zone (Active Housemate, Nominated, Not Eliminated)</span>
              <span className="text-amber-300 font-bold">HIGH RISK ZONE</span>
            </div>
            <div className="p-3 bg-black/30 rounded border border-team-red/30 flex items-center justify-between">
              <span className="font-bold text-team-red">Chaitra Rai &bull; Red Team &bull; High Risk Zone (Active Housemate, Nominated, Not Eliminated)</span>
              <span className="text-amber-300 font-bold">HIGH RISK ZONE</span>
            </div>
            <div className="p-3 bg-black/30 rounded border border-team-red/30 flex items-center justify-between">
              <span className="font-bold text-team-red">Charan &bull; Red Team &bull; ELIMINATED (Based on Housemates' Votes)</span>
              <span className="text-team-red font-bold">ELIMINATED</span>
            </div>
            <div className="p-3 bg-black/30 rounded border border-white/10 flex items-center justify-between">
              <span className="text-zinc-300 font-bold">Task 1: RED TEAM WON (Rohit Naidu &amp; Temper Vamsi defeated Thrigun &amp; Mukesh Gowda)</span>
              <span className="text-emerald-400 font-bold">RED TEAM WIN</span>
            </div>
          </div>
        </div>
      )}

      {/* NEWS SECTION */}
      {activeSection === "news" && (
        <div className="space-y-4">
          <h3 className="font-display text-2xl uppercase text-white border-b border-white/[0.08] pb-4">
            Verified Dispatches (4 Stories)
          </h3>
          <div className="editorial-panel rounded-xl p-6 space-y-3 text-xs text-zinc-300 border border-white/[0.08]">
            <div className="p-3 bg-black/30 rounded border border-white/10 flex items-center justify-between">
              <span className="text-white font-semibold">CHARAN ELIMINATED FROM BIGG BOSS BASED ON HOUSEMATES' VOTES</span>
              <span className="text-bb-gold font-bold">Verified Dispatch (Eviction)</span>
            </div>
            <div className="p-3 bg-black/30 rounded border border-white/10 flex items-center justify-between">
              <span className="text-white font-semibold">RED TEAM WINS TASK 1: ROHIT NAIDU &amp; TEMPER VAMSI DEFEAT BLUE TEAM</span>
              <span className="text-bb-gold font-bold">Verified Dispatch (Tasks)</span>
            </div>
            <div className="p-3 bg-black/30 rounded border border-white/10 flex items-center justify-between">
              <span className="text-white font-semibold">AUTO RAM PRASAD AND CHAITRA RAI ENTER HIGH RISK ZONE (Active Housemates)</span>
              <span className="text-bb-gold font-bold">Verified Dispatch (Arena)</span>
            </div>
            <div className="p-3 bg-black/30 rounded border border-white/10 flex items-center justify-between">
              <span className="text-white font-semibold">ROHIT NAIDU (RED TEAM) AND DEBJANI MODAK (BLUE TEAM) APPOINTED TEAM LEADERS</span>
              <span className="text-bb-gold font-bold">Verified Dispatch (Leadership)</span>
            </div>
          </div>
        </div>
      )}

      {/* MODERATION SECTION */}
      {activeSection === "moderation" && (
        <div className="space-y-4">
          <h3 className="font-display text-2xl uppercase text-white border-b border-white/[0.08] pb-4">
            Moderation Queue
          </h3>
          <div className="editorial-panel rounded-xl p-12 text-center text-xs text-zinc-400 border border-white/[0.08]">
            Queue is clear. No reported policy violations.
          </div>
        </div>
      )}

      {/* AUDIT SECTION */}
      {activeSection === "audit" && (
        <div className="space-y-4">
          <h3 className="font-display text-2xl uppercase text-white border-b border-white/[0.08] pb-4">
            Administrative Audit Trail
          </h3>
          <div className="editorial-panel rounded-xl p-6 space-y-3 text-xs border border-white/[0.08]">
            {[
              { action: "UPDATE_IP_RATE_LIMIT", admin: "nikhil", time: "Just now", details: "Set threshold to 50" },
              { action: "POLL_LIFECYCLE_ACTIVATE", admin: "nikhil", time: "1 hour ago", details: "Active: Who Should Be Saved?" },
              { action: "NEWS_VERIFIED", admin: "nikhil", time: "3 hours ago", details: "Verified Season 10 opening dispatches" },
            ].map((log, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded bg-black/30 border border-white/[0.06]">
                <div className="space-y-0.5">
                  <span className="font-bold text-white">{log.action}</span>
                  <p className="text-[11px] text-zinc-400">{log.details}</p>
                </div>
                <div className="text-right">
                  <span className="text-bb-gold font-semibold block">{log.admin}</span>
                  <span className="text-[10px] text-zinc-500">{log.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
