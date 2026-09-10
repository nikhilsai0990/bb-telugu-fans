"use client";

import React from "react";
import Link from "next/link";
import { Shield, Trophy, AlertCircle, ArrowUpRight } from "lucide-react";
import { Contestant } from "../types";

export const TeamVsSection: React.FC<{ contestants: Contestant[] }> = ({ contestants }) => {
  const redActive = contestants.filter((c) => c.team === "RED");
  const blueActive = contestants.filter((c) => c.team === "BLUE");

  return (
    <section className="py-14 border-b border-white/[0.08] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-bb-gold" />
              <span>Faction Hierarchy &bull; Season 10</span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-white">
              RED TEAM <span className="text-zinc-500 font-sans font-bold text-2xl sm:text-3xl align-middle">VS</span> BLUE TEAM
            </h2>
            <p className="text-sm text-zinc-400 max-w-xl">
              16 original housemates divided into two competing factions (15 active, 1 eliminated). Red Team won Task 1 led by Rohit Naidu and Temper Vamsi. Charan has been ELIMINATED based on housemates&apos; votes. Auto Ram Prasad and Chaitra Rai are in the HIGH RISK ZONE as active housemates, and 15 active housemates face Week 1 public voting.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <span className="px-2.5 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-white">
              7 Active, 1 Eliminated (Red)
            </span>
            <span className="px-2.5 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-white">
              8 Active (Blue)
            </span>
          </div>
        </div>

        {/* Editorial Split-Screen Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 1. RED TEAM COLUMN */}
          <div className="editorial-team-red rounded-xl p-6 space-y-6">
            
            {/* Team Meta Header */}
            <div className="flex items-start justify-between border-b border-team-red/20 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-team-red" />
                  <h3 className="font-display text-3xl uppercase tracking-wide text-white leading-none">
                    RED TEAM
                  </h3>
                </div>
                <p className="text-xs font-semibold text-zinc-400 mt-1">
                  Leader: <strong className="text-white">Rohit Naidu</strong> &bull; 7 Active, 1 Eliminated
                </p>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                Task 1: WIN
              </span>
            </div>

            {/* Red Team Roster: 8 Players */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {redActive.map((contestant) => {
                const isLeader = contestant.role === "LEADER" || contestant.slug === "rohit-naidu" || contestant.id === "c-11";
                const isEliminated = contestant.isEliminated || contestant.status === "ELIMINATED" || contestant.slug === "charan" || contestant.id === "c-13";
                const isHighRisk = !isEliminated && (contestant.slug === "chaitra-rai" || contestant.id === "c-10" || contestant.zone === "HIGH_RISK") && contestant.slug !== "aman" && contestant.id !== "c-12" && contestant.slug !== "charan";
                const isTaskWinner = contestant.stats?.tasksWon > 0 || contestant.slug === "rohit-naidu" || contestant.slug === "temper-vamsi";

                return (
                  <Link
                    key={contestant.id}
                    href={`/contestants/${contestant.slug || contestant.id}`}
                    className={`group relative p-3 rounded-lg bg-[#181215] border ${isEliminated ? "border-zinc-800 opacity-80" : "border-team-red/20 hover:border-team-red/50"} transition-colors flex items-center gap-3`}
                  >
                    <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0 border border-team-red/30 bg-black">
                      <img
                        src={contestant.avatarUrl}
                        alt={contestant.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1 mb-0.5">
                        {isEliminated ? (
                          <span className="px-1.5 py-0.2 rounded bg-red-950/80 text-red-300 border border-red-800 text-[9px] font-black uppercase tracking-tight">
                            ELIMINATED
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded bg-team-red/20 text-team-red text-[9px] font-extrabold uppercase tracking-tight">
                            Nominated
                          </span>
                        )}
                        {isLeader && (
                          <span className="px-1.5 py-0.2 rounded bg-bb-gold text-black text-[9px] font-black uppercase tracking-tight">
                            Team Leader
                          </span>
                        )}
                        {isHighRisk && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-400/15 text-amber-300 border border-amber-400/30 text-[9px] font-bold uppercase tracking-tight">
                            HIGH RISK ZONE &bull; ACTIVE
                          </span>
                        )}
                        {isTaskWinner && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold uppercase tracking-tight">
                            Task 1 Win
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white group-hover:text-bb-gold transition-colors truncate">
                        {contestant.name}
                      </h4>
                      <p className="text-[10px] text-zinc-400 truncate">
                        {isEliminated ? "Eliminated by Housemates" : contestant.occupation}
                      </p>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
                  </Link>
                );
              })}
            </div>

            {/* Red Strategy Footnote */}
            <div className="pt-2 border-t border-team-red/15 flex items-center justify-between text-[11px] text-zinc-400">
              <span>7 Active Nominated &bull; Charan Eliminated</span>
              <span className="text-team-red font-semibold">Chaitra Rai in HIGH RISK ZONE</span>
            </div>
          </div>

          {/* 2. BLUE TEAM COLUMN */}
          <div className="editorial-team-blue rounded-xl p-6 space-y-6">
            
            {/* Team Meta Header */}
            <div className="flex items-start justify-between border-b border-team-blue/20 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-team-blue" />
                  <h3 className="font-display text-3xl uppercase tracking-wide text-white leading-none">
                    BLUE TEAM
                  </h3>
                </div>
                <p className="text-xs font-semibold text-zinc-400 mt-1">
                  Leader: <strong className="text-white">Debjani Modak</strong> &bull; 8 Active Housemates
                </p>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded">
                Task 1: LOSS
              </span>
            </div>

            {/* Blue Team Roster: 8 Players */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {blueActive.map((contestant) => {
                const isLeader = (contestant.role === "LEADER" || contestant.slug === "debjani-modak" || contestant.id === "c-01") && contestant.slug !== "auto-ram-prasad" && contestant.id !== "c-02";
                const isHighRisk = (contestant.slug === "auto-ram-prasad" || contestant.id === "c-02" || contestant.zone === "HIGH_RISK") && contestant.slug !== "mukesh-gowda" && contestant.id !== "c-05" && contestant.slug !== "charan";

                return (
                  <Link
                    key={contestant.id}
                    href={`/contestants/${contestant.slug || contestant.id}`}
                    className="group relative p-3 rounded-lg bg-[#10141D] border border-team-blue/20 hover:border-team-blue/50 transition-colors flex items-center gap-3"
                  >
                    <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0 border border-team-blue/30 bg-black">
                      <img
                        src={contestant.avatarUrl}
                        alt={contestant.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1 mb-0.5">
                        <span className="px-1.5 py-0.2 rounded bg-team-blue/20 text-team-blue text-[9px] font-extrabold uppercase tracking-tight">
                          Nominated
                        </span>
                        {isLeader && (
                          <span className="px-1.5 py-0.2 rounded bg-bb-gold text-black text-[9px] font-black uppercase tracking-tight">
                            Team Leader
                          </span>
                        )}
                        {isHighRisk && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-400/15 text-amber-300 border border-amber-400/30 text-[9px] font-bold uppercase tracking-tight">
                            HIGH RISK ZONE &bull; ACTIVE
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white group-hover:text-bb-gold transition-colors truncate">
                        {contestant.name}
                      </h4>
                      <p className="text-[10px] text-zinc-400 truncate">
                        {contestant.occupation}
                      </p>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
                  </Link>
                );
              })}
            </div>

            {/* Blue Strategy Footnote */}
            <div className="pt-2 border-t border-team-blue/15 flex items-center justify-between text-[11px] text-zinc-400">
              <span>All 8 members active &bull; Nominated in Week 1</span>
              <span className="text-team-blue font-semibold">Auto Ram Prasad in HIGH RISK ZONE</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
