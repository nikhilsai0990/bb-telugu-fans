import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Trophy,
  ArrowLeft,
  Vote,
  MessageSquare,
  AlertCircle,
  Shield,
  Activity,
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

  const isEliminated =
    contestant.isEliminated ||
    contestant.status === "ELIMINATED" ||
    contestant.slug === "charan" ||
    contestant.slug === "chaitra-rai" ||
    contestant.id === "c-13" ||
    contestant.id === "c-10";

  const isHighRisk =
    !isEliminated &&
    (contestant.slug === "aman" ||
      contestant.slug === "sudheer-kumar-reddy" ||
      contestant.slug === "varshini-sounderajan" ||
      contestant.id === "c-12" ||
      contestant.id === "c-09" ||
      contestant.id === "c-06" ||
      contestant.zone === "HIGH_RISK" ||
      contestant.isHighRiskZone) &&
    contestant.slug !== "auto-ram-prasad" &&
    contestant.slug !== "mukesh-gowda";

  const isTaskWinner =
    contestant.isTaskWinner ||
    contestant.stats?.tasksWon > 0 ||
    contestant.slug === "auto-ram-prasad" ||
    contestant.id === "c-02";

  const isHousemate =
    contestant.isHousemate ||
    contestant.slug === "rohit-naidu" ||
    contestant.slug === "auto-ram-prasad" ||
    contestant.slug === "temper-vamsi" ||
    contestant.id === "c-11" ||
    contestant.id === "c-02" ||
    contestant.id === "c-07";

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

      {/* Profile Header Card */}
      <div className={`relative rounded-xl overflow-hidden editorial-panel border ${
        isEliminated
          ? "border-red-900/40 bg-zinc-950/80"
          : isHighRisk
          ? "border-amber-500/40"
          : "border-white/[0.12]"
      }`}>
        <div className="p-6 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          
          {/* Avatar & Identifiers */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-lg overflow-hidden flex-shrink-0 border-2 border-white/20 bg-black shadow-xl">
              <img
                src={contestant.avatarUrl}
                alt={contestant.name}
                className="w-full h-full object-cover object-top"
              />
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {isEliminated ? (
                  <span className="px-2.5 py-0.5 rounded bg-red-950 text-red-300 text-[10px] font-black uppercase tracking-wider border border-red-800">
                    ELIMINATED
                  </span>
                ) : isHousemate ? (
                  <>
                    <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-500/40">
                      Current Housemate
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-bb-gold/20 text-bb-gold text-[10px] font-black uppercase tracking-wider border border-bb-gold/40">
                      Nominated
                    </span>
                  </>
                ) : (
                  <>
                    <span className="px-2.5 py-0.5 rounded bg-white/[0.06] text-zinc-300 text-[10px] font-bold uppercase tracking-wider border border-white/10">
                      Contestant
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-bb-gold/20 text-bb-gold text-[10px] font-black uppercase tracking-wider border border-bb-gold/40">
                      Nominated
                    </span>
                  </>
                )}
                {isHighRisk && (
                  <span className="px-2.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-400" /> HIGH RISK ZONE &bull; ACTIVE
                  </span>
                )}
                {isTaskWinner && (
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-emerald-400" /> TASK WINNER
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
                className="px-6 py-3 rounded bg-bb-gold hover:bg-bb-gold-light text-black font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-md"
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

        {/* Status Bar for High Risk Zone Notice */}
        {isHighRisk && (
          <div className="bg-amber-500/10 border-t border-amber-500/20 px-6 sm:px-10 py-3 flex items-center gap-2.5 text-xs text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Crucial HIGH RISK ZONE Notice:</strong> {contestant.name} has entered the HIGH RISK ZONE. <em>&quot;HIGH RISK ZONE&quot; does NOT mean elimination.</em> {contestant.name} is an ACTIVE housemate, has NOT been evicted, and is fully nominated for public voting on the Week 1 eviction ballot.
            </span>
          </div>
        )}

        {/* Status Bar for Elimination Notice */}
        {isEliminated && (
          <div className="bg-red-950/40 border-t border-red-800/40 px-6 sm:px-10 py-3 flex items-center gap-2.5 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>
              <strong>Elimination Notice:</strong> {contestant.name} has been officially ELIMINATED from Bigg Boss Telugu Season 10 based on housemates&apos; votes. {contestant.name} is not eligible for active voting.
            </span>
          </div>
        )}

      </div>

      {/* Performance Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="editorial-card rounded-lg p-5 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>Status</span>
            <Activity className="w-4 h-4 text-bb-gold" />
          </div>
          <p className={`font-display text-2xl sm:text-3xl ${isEliminated ? "text-red-400" : isHighRisk ? "text-amber-400" : "text-emerald-400"} leading-none`}>
            {isEliminated ? "ELIMINATED" : isHighRisk ? "HIGH RISK" : "ACTIVE"}
          </p>
          <span className="text-[10px] text-zinc-500 uppercase">
            {isEliminated ? "Evicted Week 1" : "Individual Competitor"}
          </span>
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
            {isTaskWinner ? "Task Winner" : "0 Tasks Won"}
          </span>
        </div>

        <div className="editorial-card rounded-lg p-5 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>Standing</span>
            <Shield className="w-4 h-4 text-bb-gold" />
          </div>
          <p className="font-display text-xl sm:text-2xl text-white leading-none truncate">
            {isEliminated ? "ELIMINATED" : isHighRisk ? "HIGH RISK ZONE" : "NOMINATED"}
          </p>
          <span className="text-[10px] text-zinc-500 uppercase">
            {isEliminated ? "Eliminated Contestant" : isHighRisk ? "Active in Danger Zone" : "Week 1 Housemate"}
          </span>
        </div>

        <div className="editorial-card rounded-lg p-5 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-semibold uppercase tracking-wider">
            <span>Nominations</span>
            <Shield className={`w-4 h-4 ${isEliminated ? "text-zinc-500" : "text-amber-400"}`} />
          </div>
          <p className="font-display text-2xl sm:text-3xl text-white leading-none truncate">
            {isEliminated ? "EVICTED" : "NOMINATED"}
          </p>
          <span className="text-[10px] text-zinc-500 uppercase">
            {isEliminated ? "Eliminated by Housemates" : "Active Week 1 Ballot"}
          </span>
        </div>
      </div>

      {/* Narrative & Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Biography & Assessment */}
        <div className="lg:col-span-8 space-y-6">
          <div className="editorial-card rounded-xl p-6 sm:p-8 space-y-4">
            <h2 className="font-display text-2xl uppercase tracking-wide text-white border-b border-white/[0.08] pb-3">
              House Dossier & Assessment
            </h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {contestant.bio}
            </p>
            <p className="text-sm text-zinc-400 leading-relaxed">
              In Bigg Boss Telugu Season 10, all team structures have dissolved into an all-out individual competition. 14 active housemates face public voting on the official save ballot, while Charan and Chaitra Rai have been eliminated based on housemates&apos; votes.
            </p>
          </div>
        </div>

        {/* Quick Information */}
        <div className="lg:col-span-4 space-y-6">
          <div className="editorial-card rounded-xl p-6 sm:p-8 space-y-4">
            <h2 className="font-display text-2xl uppercase tracking-wide text-white border-b border-white/[0.08] pb-3">
              Contestant Details
            </h2>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                <span className="text-zinc-400 font-medium">Occupation</span>
                <span className="text-white font-semibold">{contestant.occupation}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                <span className="text-zinc-400 font-medium">Season</span>
                <span className="text-white font-semibold">Bigg Boss Telugu 10</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-white/[0.06]">
                <span className="text-zinc-400 font-medium">Competition Format</span>
                <span className="text-white font-semibold">Individual Battle</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-zinc-400 font-medium">Voting Eligibility</span>
                <span className={`font-semibold ${isEliminated ? "text-red-400" : "text-emerald-400"}`}>
                  {isEliminated ? "Ineligible (Eliminated)" : "Eligible (1 Vote/Day)"}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
