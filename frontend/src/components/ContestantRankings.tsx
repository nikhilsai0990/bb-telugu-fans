"use client";

import React from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, Minus, ArrowRight, Trophy, AlertCircle } from "lucide-react";
import { Contestant } from "../types";

export const ContestantRankings: React.FC<{ contestants: Contestant[] }> = ({ contestants }) => {
  const topList = contestants
    .filter(
      (c) =>
        !c.isEliminated &&
        c.status !== "ELIMINATED" &&
        c.status !== "EVICTED" &&
        c.slug !== "charan" &&
        c.slug !== "chaitra-rai" &&
        c.id !== "c-13" &&
        c.id !== "c-10"
    )
    .slice(0, 5);

  return (
    <div className="editorial-panel rounded-xl p-6 sm:p-7 border border-white/[0.12] space-y-6">
      
      {/* Header */}
      <div className="flex items-start justify-between border-b border-white/[0.08] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-bb-gold" />
            <span>Power Benchmark &bull; Week 1</span>
          </div>
          <h3 className="font-display text-3xl sm:text-4xl uppercase tracking-wide text-white leading-none mt-1">
            Active Standings
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Individual Competition &bull; 14 Active Housemates
          </p>
        </div>
        <Link
          href="/contestants"
          className="text-xs font-bold uppercase tracking-wider text-bb-gold hover:text-white transition-colors flex items-center gap-1 mt-1"
        >
          <span>All 16 Housemates</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Top 5 List */}
      <div className="space-y-2.5">
        {topList.map((contestant, index) => {
          const rank = index + 1;
          const isLeaderRank = rank === 1;
          const isHighRisk =
            contestant.slug === "aman" ||
            contestant.slug === "sudheer-kumar-reddy" ||
            contestant.slug === "varshini-sounderajan" ||
            contestant.id === "c-12" ||
            contestant.id === "c-09" ||
            contestant.id === "c-06" ||
            contestant.zone === "HIGH_RISK" ||
            contestant.isHighRiskZone;

          const isTaskWinner =
            contestant.isTaskWinner ||
            contestant.stats?.tasksWon > 0 ||
            contestant.slug === "auto-ram-prasad" ||
            contestant.id === "c-02";

          return (
            <Link
              key={contestant.id}
              href={`/contestants/${contestant.slug || contestant.id}`}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all group ${
                isLeaderRank
                  ? "bg-[#161822] border-white/20"
                  : "bg-[#111218] border-white/[0.06] hover:border-white/[0.15] hover:bg-[#151720]"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Rank */}
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center font-display text-sm ${
                    isLeaderRank
                      ? "bg-bb-gold text-black font-black"
                      : "bg-white/[0.06] text-zinc-400 font-bold"
                  }`}
                >
                  {rank}
                </div>

                {/* Avatar */}
                <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0 border border-white/10 bg-black">
                  <img
                    src={contestant.avatarUrl}
                    alt={contestant.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                  />
                </div>

                {/* Info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs font-bold text-white group-hover:text-bb-gold transition-colors truncate">
                      {contestant.name}
                    </h4>
                    {isHighRisk && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-400 text-black">
                        HIGH RISK ZONE
                      </span>
                    )}
                    {isTaskWinner && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <Trophy className="w-2.5 h-2.5 text-emerald-400" /> TASK WINNER
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                    {contestant.occupation}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2.5 flex-shrink-0 pl-2">
                <div className="text-right">
                  <span className="font-display text-xs text-zinc-300 uppercase block leading-none">
                    {isHighRisk ? "High Risk" : "Active"}
                  </span>
                  <span className="text-[9px] font-semibold text-zinc-500 uppercase">
                    Nominated
                  </span>
                </div>
                <div>
                  <Minus className="w-4 h-4 text-zinc-500" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footnote */}
      <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-zinc-400">
        <span>Individual Battle &bull; Task Winner: Auto Ram Prasad</span>
        <span className="text-bb-gold font-semibold">14 Active &bull; 2 Eliminated</span>
      </div>

    </div>
  );
};