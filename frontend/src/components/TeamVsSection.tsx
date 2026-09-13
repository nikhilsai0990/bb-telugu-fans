"use client";

import React from "react";
import Link from "next/link";
import { Trophy, AlertCircle, ArrowUpRight, Shield } from "lucide-react";
import { Contestant } from "../types";

export const TeamVsSection: React.FC<{ contestants: Contestant[] }> = ({ contestants }) => {
  const activeHousemates = contestants.filter(
    (c) =>
      !c.isEliminated &&
      c.status !== "ELIMINATED" &&
      c.slug !== "charan" &&
      c.slug !== "chaitra-rai" &&
      c.id !== "c-13" &&
      c.id !== "c-10"
  );

  const renderCard = (contestant: Contestant) => {
    const isEliminated =
      contestant.isEliminated ||
      contestant.status === "ELIMINATED" ||
      contestant.slug === "charan" ||
      contestant.slug === "chaitra-rai" ||
      contestant.id === "c-13" ||
      contestant.id === "c-10";

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
    <section className="py-12 border-b border-white/[0.08] relative" data-testid="housemates-arena-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-bb-gold" />
              <span>Season 10 Arena &bull; Individual Format</span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-white">
              SEASON 10 <span className="text-bb-gold">HOUSEMATES</span>
            </h2>
            <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
              Bigg Boss Telugu Season 10 is an individual competition featuring 14 active housemates. Auto Ram Prasad, Rohit Naidu, and Temper Vamsi are TASK WINNERS. Charan and Chaitra Rai are ELIMINATED based on housemates&apos; votes (NO RE-ENTRY).
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <span className="px-3 py-1.5 rounded bg-white/[0.04] border border-white/[0.08] text-white">
              14 Active Housemates
            </span>
            <span className="px-3 py-1.5 rounded bg-red-950/40 border border-red-800/40 text-red-300">
              2 Eliminated (No Re-entry)
            </span>
          </div>
        </div>

        {/* 14 Active Housemates Grid */}
        <div className="editorial-panel rounded-xl p-6 space-y-4 border border-white/[0.08]">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold uppercase tracking-wider text-white">ACTIVE HOUSEMATES (14)</span>
            </div>
            <Link href="/contestants" className="text-bb-gold hover:underline font-bold text-xs uppercase tracking-wider">
              View Full Directory &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {activeHousemates.map(renderCard)}
          </div>

          <div className="pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
              <span>Individual Task Winners: Auto Ram Prasad, Rohit Naidu, Temper Vamsi</span>
            </span>
            <span className="text-zinc-500">Pure individual format &bull; Zero teams</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export const HousematesArenaSection = TeamVsSection;
