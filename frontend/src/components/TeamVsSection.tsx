"use client";

import React from "react";
import Link from "next/link";
import { Trophy, AlertCircle, ArrowUpRight, Shield } from "lucide-react";
import { Contestant } from "../types";

export const TeamVsSection: React.FC<{ contestants: Contestant[] }> = ({ contestants }) => {
  const redTeam = contestants.filter((c) => c.team === "RED");
  const blueTeam = contestants.filter((c) => c.team === "BLUE");

  const renderCard = (contestant: Contestant) => {
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
      contestant.slug === "auto-ram-prasad" ||
      contestant.slug === "rohit-naidu" ||
      contestant.slug === "temper-vamsi" ||
      contestant.id === "c-02" ||
      contestant.id === "c-11" ||
      contestant.id === "c-07";

    return (
      <Link
        key={contestant.id}
        href={`/contestants/${contestant.slug || contestant.id}`}
        className={`group relative p-3 rounded-lg bg-[#14151D] border ${
          isEliminated
            ? "border-red-950/40 opacity-75"
            : isHighRisk
            ? "border-amber-500/40 hover:border-amber-400"
            : "border-white/[0.08] hover:border-white/30"
        } transition-colors flex items-center gap-3`}
      >
        <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0 border border-white/10 bg-black">
          <img
            src={contestant.avatarUrl}
            alt={contestant.name}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1 mb-0.5">
            {isEliminated ? (
              <span className="px-1.5 py-0.2 rounded bg-red-950/90 text-red-300 border border-red-800 text-[9px] font-black uppercase tracking-tight">
                ELIMINATED &bull; NO RE-ENTRY
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded bg-white/[0.06] text-zinc-300 text-[9px] font-bold uppercase tracking-tight border border-white/10">
                Housemate
              </span>
            )}
            {isHighRisk && (
              <span className="px-1.5 py-0.2 rounded bg-amber-400 text-black text-[9px] font-black uppercase tracking-tight">
                HIGH RISK ZONE (3)
              </span>
            )}
            {isTaskWinner && (
              <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-white text-[9px] font-black uppercase tracking-tight flex items-center gap-1">
                <Trophy className="w-2.5 h-2.5" /> TASK WINNER
              </span>
            )}
          </div>
          <h4 className="text-xs font-bold text-white group-hover:text-bb-gold transition-colors truncate">
            {contestant.name}
          </h4>
          <p className="text-[10px] text-zinc-400 truncate">
            {isEliminated ? "Eliminated based on housemates' votes (No re-entry)" : contestant.occupation}
          </p>
        </div>
        <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
      </Link>
    );
  };

  return (
    <section className="py-14 border-b border-white/[0.08] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-bb-gold" />
              <span>Team Hierarchy &bull; Season 10</span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-white">
              RED TEAM <span className="text-zinc-500 font-sans font-bold text-2xl sm:text-3xl align-middle">VS</span> BLUE TEAM
            </h2>
            <p className="text-sm text-zinc-400 max-w-xl">
              Bigg Boss Telugu Season 10 features 16 housemates across Red and Blue teams. Auto Ram Prasad, Rohit Naidu, and Temper Vamsi are TASK WINNERS. Charan and Chaitra Rai are ELIMINATED with NO RE-ENTRY. Aman, Sudheer Kumar Reddy, and Varshini Sounderajan occupy the HIGH RISK ZONE (3). Latest Team Task: Krishnudu&apos;s team won against Naresh&apos;s team!
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <span className="px-2.5 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-white">
              14 Active Housemates
            </span>
            <span className="px-2.5 py-1 rounded bg-red-950/40 border border-red-800/40 text-red-300">
              2 Eliminated (No Re-entry)
            </span>
          </div>
        </div>

        {/* Editorial Split-Screen Layout: Red Team vs Blue Team */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Red Team */}
          <div className="editorial-panel rounded-xl p-6 space-y-6 border border-red-500/20">
            <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
              <div>
                <h3 className="font-display text-3xl uppercase tracking-wide text-red-400 leading-none">
                  RED TEAM
                </h3>
                <p className="text-xs font-semibold text-zinc-400 mt-1">
                  8 Housemates
                </p>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 border border-red-500/25 px-2.5 py-1 rounded flex items-center gap-1.5">
                RED TEAM
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {redTeam.map(renderCard)}
            </div>

            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-400">
              <span>Task Winners: Rohit Naidu, Temper Vamsi</span>
              <span className="text-red-400 font-semibold">Charan &amp; Chaitra Rai Eliminated</span>
            </div>
          </div>

          {/* Blue Team */}
          <div className="editorial-panel rounded-xl p-6 space-y-6 border border-blue-500/20">
            <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
              <div>
                <h3 className="font-display text-3xl uppercase tracking-wide text-blue-400 leading-none">
                  BLUE TEAM
                </h3>
                <p className="text-xs font-semibold text-zinc-400 mt-1">
                  8 Housemates
                </p>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/25 px-2.5 py-1 rounded flex items-center gap-1.5">
                BLUE TEAM
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {blueTeam.map(renderCard)}
            </div>

            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-400">
              <span>Task Winner: Auto Ram Prasad</span>
              <span className="text-blue-400 font-semibold">Latest Task Winner: Krishnudu&apos;s Team</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
