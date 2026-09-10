import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Trophy,
  Crown,
  TrendingUp,
  ArrowLeft,
  Vote,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Shield,
} from "lucide-react";
import { api } from "../../../lib/api";

export const dynamic = "force-dynamic";

export default async function ContestantDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const contestant = await api.getContestant(params.id);
  if (!contestant) notFound();

  const isRed = contestant.team === "RED";
  const isEliminated = contestant.isEliminated || contestant.status === "ELIMINATED" || contestant.slug === "charan" || contestant.id === "c-13";
  const isLeader =
    (contestant.role === "LEADER" || contestant.slug === "debjani-modak" || contestant.slug === "rohit-naidu") &&
    contestant.slug !== "auto-ram-prasad" &&
    contestant.id !== "c-05";
  const leaderLabel = isRed ? "Red Team Leader" : "Blue Team Leader";
  const isHighRisk =
    !isEliminated &&
    (contestant.slug === "chaitra-rai" || contestant.slug === "auto-ram-prasad" || contestant.id === "c-10" || contestant.id === "c-02" || contestant.zone === "HIGH_RISK") &&
    contestant.slug !== "charan" &&
    contestant.slug !== "aman" &&
    contestant.slug !== "mukesh-gowda" &&
    contestant.id !== "c-13" &&
    contestant.id !== "c-12" &&
    contestant.id !== "c-05";
  const isTaskWinner = contestant.stats?.tasksWon > 0 || contestant.slug === "rohit-naidu" || contestant.slug === "temper-vamsi";
  const isTaskParticipant = contestant.slug === "thrigun" || contestant.slug === "mukesh-gowda";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      
      {/* Back Link */}
      <Link
        href="/contestants"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Roster</span>
      </Link>

      {/* Editorial Profile Header Card (Zero House Imagery) */}
      <div className={`relative rounded-xl overflow-hidden editorial-panel border ${
        isEliminated ? "border-zinc-800" : isRed ? "border-team-red/30" : "border-team-blue/30"
      }`}>
        {/* Subtle Team Ambient Wash */}
        <div className={`absolute top-0 right-0 w-96 h-96 blur-[140px] pointer-events-none -z-10 ${
          isRed ? "bg-team-red/[0.08]" : "bg-team-blue/[0.08]"
        }`} />

        <div className="p-6 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          
          {/* Avatar & Identifiers */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-lg overflow-hidden flex-shrink-0 border-2 border-white/20 bg-black shadow-xl">
              <img
                src={contestant.avatarUrl}
                alt={contestant.name}
                className="w-full h-full object-cover object-top"
              />
              {isLeader && (
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-bb-gold text-black text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow">
                  <Crown className="w-2.5 h-2.5" /> Team Leader
                </span>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-white ${
                  isRed ? "bg-team-red" : "bg-team-blue"
                }`}>
                  {`${contestant.team} TEAM`}
                </span>
                {isEliminated ? (
                  <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 text-[10px] font-black uppercase tracking-wider border border-red-800">
                    ELIMINATED
                  </span>
                ) : (
                  <>
                    <span className="px-2 py-0.5 rounded bg-white/[0.06] text-zinc-300 text-[10px] font-bold uppercase tracking-wider border border-white/10">
                      Active
                    </span>
                    <span className="px-2 py-0.5 rounded bg-red-600/90 text-white text-[10px] font-black uppercase tracking-wider">
                      Nominated
                    </span>
                  </>
                )}
                {isHighRisk && (
                  <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> HIGH RISK ZONE &bull; ACTIVE
                  </span>
                )}
                {isTaskWinner && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-emerald-400" /> Task 1 Winner
                  </span>
                )}
                {isLeader && (
                  <span className="px-2 py-0.5 rounded bg-bb-gold/15 text-bb-gold border border-bb-gold/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Crown className="w-3 h-3 text-bb-gold" /> {leaderLabel}
                  </span>
                )}
              </div>

              <h1 className="font-display text-4xl sm:text-6xl uppercase tracking-tight text-white leading-none">
                {contestant.name}
              </h1>
              
              <p className="text-xs sm:text-sm font-semibold text-zinc-400">
                {contestant.occupation} &bull; Bigg Boss Telugu Season 10
              </p>
            </div>
          </div>

          {/* Direct CTA Buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full sm:w-auto flex-shrink-0">
            {isEliminated ? (
              <div className="px-6 py-3 rounded bg-zinc-800 text-zinc-400 font-bold text-xs uppercase tracking-wider text-center cursor-not-allowed">
                VOTING DISABLED — ELIMINATED
              </div>
            ) : (
              <Link
                href="/polls"
                className="px-6 py-3 rounded bg-team-red hover:bg-team-red-dark text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <Vote className="w-4 h-4" />
                <span>Vote to Save</span>
              </Link>
            )}
            <Link
              href="/discuss"
              className="px-6 py-3 rounded bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-zinc-400" />
              <span>Debate in Salon</span>
            </Link>
          </div>

        </div>

        {/* In-House Status Bar for High Risk Zone Notice */}
        {isHighRisk && (
          <div className="bg-amber-500/10 border-t border-amber-500/20 px-6 sm:px-10 py-3 flex items-center gap-2.5 text-xs text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Crucial HIGH RISK ZONE Notice:</strong> {contestant.name} has entered the HIGH RISK ZONE. <em>&quot;HIGH RISK ZONE&quot; does NOT mean elimination.</em> {contestant.name} is an ACTIVE housemate on the {contestant.team} Team, has NOT been evicted, and is fully nominated for public voting on the Week 1 eviction ballot.
            </span>
          </div>
        )}

        {/* In-House Status Bar for Elimination Notice */}
        {isEliminated && (
          <div className="bg-red-950/40 border-t border-red-800/40 px-6 sm:px-10 py-3 flex items-center gap-2.5 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>
              <strong>Elimination Notice:</strong> {contestant.name} has been ELIMINATED from Bigg Boss Telugu Season 10 based on housemates&apos; votes (Evicted from Bigg Boss House (Week 1)). {contestant.name} is not eligible for active voting.
            </span>
          </div>
        )}

      </div>

      {/* Performance Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="editorial-card rounded-lg p-5 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>Audience Rating</span>
            <TrendingUp className="w-4 h-4 text-bb-gold" />
          </div>
          <p className="font-display text-3xl sm:text-4xl text-white leading-none">
            {contestant.popularityScore ?? 0}%
          </p>
          <span className="text-[10px] text-zinc-500 uppercase">Week 1 Benchmark</span>
        </div>

        <div className="editorial-card rounded-lg p-5 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>Tasks Won</span>
            <Trophy className="w-4 h-4 text-bb-gold" />
          </div>
          <p className="font-display text-3xl sm:text-4xl text-white leading-none">
            {isTaskWinner ? 1 : 0}
          </p>
          <span className="text-[10px] text-zinc-500 uppercase">
            {isTaskWinner ? "Task 1 Winner (Red Team)" : isTaskParticipant ? "Task 1 Participant (Loss)" : "0 Tasks Won"}
          </span>
        </div>

        <div className="editorial-card rounded-lg p-5 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>Role / Standing</span>
            <Crown className="w-4 h-4 text-bb-gold" />
          </div>
          <p className="font-display text-xl sm:text-2xl text-white leading-none truncate">
            {isLeader ? (isRed ? "RED LEADER" : "BLUE LEADER") : isHighRisk ? "HIGH RISK ZONE" : isEliminated ? "ELIMINATED" : "PLAYER"}
          </p>
          <span className="text-[10px] text-zinc-500 uppercase">
            {isLeader ? leaderLabel : isHighRisk ? "HIGH RISK ZONE • ACTIVE" : isEliminated ? "Eliminated Contestant" : `${contestant.team} Squad Player`}
          </span>
        </div>

        <div className="editorial-card rounded-lg p-5 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>Current Standing</span>
            <Shield className={`w-4 h-4 ${isEliminated ? "text-zinc-500" : "text-team-red"}`} />
          </div>
          <p className={`font-display text-2xl sm:text-3xl ${isEliminated ? "text-zinc-400" : "text-team-red"} leading-none truncate`}>
            {isEliminated ? "ELIMINATED" : "NOMINATED"}
          </p>
          <span className="text-[10px] text-zinc-500 uppercase">
            {isEliminated ? "Eliminated by Housemates" : isHighRisk ? "HIGH RISK ZONE • ACTIVE • NOMINATED" : "Week 1 Ballot"}
          </span>
        </div>
      </div>

      {/* Narrative & Strategy Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Biography & Assessment */}
        <div className="lg:col-span-7 space-y-6">
          <div className="editorial-card rounded-xl p-6 sm:p-8 space-y-4">
            <h2 className="font-display text-2xl uppercase tracking-wide text-white border-b border-white/[0.08] pb-3">
              House Dossier & Strategic Outlook
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {contestant.bio}
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              As part of the 16-member launch roster for Season 10, {contestant.name} is stationed on the {contestant.team} Team. With all 16 housemates put directly into the nomination danger zone in Week 1, community voting will determine survival into Week 2.
            </p>
          </div>
        </div>

        {/* Fan Sentiment Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          <div className="editorial-card rounded-xl p-6 sm:p-8 space-y-4">
            <h2 className="font-display text-2xl uppercase tracking-wide text-white border-b border-white/[0.08] pb-3">
              Fan Sentiment Meter
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-emerald-400">Positive Reception</span>
                  <span className="text-white">{contestant.stats?.fanSentimentPositive ?? 0}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${contestant.stats?.fanSentimentPositive ?? 0}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-zinc-400">Neutral / Observing</span>
                  <span className="text-white">{contestant.stats?.fanSentimentNeutral ?? 0}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-zinc-500 rounded-full"
                    style={{ width: `${contestant.stats?.fanSentimentNeutral ?? 0}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-team-red">Critical / Opposed</span>
                  <span className="text-white">{contestant.stats?.fanSentimentNegative ?? 0}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-team-red rounded-full"
                    style={{ width: `${contestant.stats?.fanSentimentNegative ?? 0}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-zinc-400">
              <span>Audience Sentiment</span>
              <span className="text-zinc-500 font-semibold">No data yet</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
