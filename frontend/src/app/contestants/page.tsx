"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Crown, AlertCircle, ArrowUpRight, Trophy } from "lucide-react";
import { Contestant } from "../../types";
import { api, fallbackContestants } from "../../lib/api";

export default function ContestantsPage() {
  const [contestants, setContestants] = useState<Contestant[]>(fallbackContestants);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await api.getContestants(undefined, search);
      if (data && data.length > 0) {
        setContestants(data);
      }
    }
    load();
  }, [search]);

  let displayedContestants = contestants;
  if (filter === "RED") {
    displayedContestants = contestants.filter((c) => c.team === "RED");
  } else if (filter === "BLUE") {
    displayedContestants = contestants.filter((c) => c.team === "BLUE");
  } else if (filter === "NOMINATED") {
    displayedContestants = contestants.filter((c) => c.isNominated || c.status === "NOMINATED");
  } else if (filter === "HIGH_RISK" || filter === "HIGH_ZONE") {
    displayedContestants = contestants.filter(
      (c) =>
        (c.slug === "chaitra-rai" || c.slug === "auto-ram-prasad" || c.id === "c-10" || c.id === "c-02" || c.zone === "HIGH_RISK") &&
        c.slug !== "charan" &&
        c.slug !== "aman" &&
        c.slug !== "mukesh-gowda" &&
        c.id !== "c-13" &&
        c.id !== "c-12" &&
        c.id !== "c-05"
    );
  } else if (filter === "ELIMINATED") {
    displayedContestants = contestants.filter(
      (c) => c.isEliminated || c.status === "ELIMINATED" || c.slug === "charan" || c.id === "c-13"
    );
  }

  const filterTabs = [
    { id: "ALL", label: "All Housemates (16)" },
    { id: "RED", label: "Red Team (8)" },
    { id: "BLUE", label: "Blue Team (8)" },
    { id: "NOMINATED", label: "Active Nominated (15)" },
    { id: "HIGH_RISK", label: "HIGH RISK ZONE (2)" },
    { id: "ELIMINATED", label: "Eliminated (1)" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      
      {/* Editorial Page Header */}
      <div className="space-y-3 border-b border-white/[0.08] pb-6">
        <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-bb-gold" />
          <span>Official Season 10 Roster &bull; 16 Housemates (15 Active, 1 Eliminated)</span>
        </div>
        <h1 className="font-display text-4xl sm:text-6xl uppercase tracking-tight text-white">
          Contestant Directory
        </h1>
        <p className="text-sm text-zinc-300 max-w-2xl leading-relaxed">
          The 16 canonical Bigg Boss Telugu Season 10 contenders divided into Red and Blue factions (15 active, 1 eliminated). Red Team won Task 1 led by Rohit Naidu and Temper Vamsi. Charan has been ELIMINATED based on housemates&apos; votes. Auto Ram Prasad and Chaitra Rai are in the HIGH RISK ZONE as active housemates, and 15 active housemates face Week 1 public voting.
        </p>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 editorial-panel p-3.5 rounded-lg border border-white/[0.08]">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                filter === tab.id
                  ? "bg-white text-black"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative sm:w-64 flex-shrink-0">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find housemate..."
            className="w-full pl-9 pr-3 py-1.5 rounded bg-black/40 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-white/30 font-sans"
          />
        </div>
      </div>

      {/* Roster Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-72 rounded-lg bg-white/[0.03] animate-pulse border border-white/[0.05]" />
          ))}
        </div>
      ) : displayedContestants.length === 0 ? (
        <div className="editorial-panel rounded-xl p-12 text-center space-y-2 border border-white/[0.08]">
          <AlertCircle className="w-8 h-8 text-zinc-500 mx-auto" />
          <p className="text-base font-bold text-white uppercase tracking-wider font-display">No Housemates Found</p>
          <p className="text-xs text-zinc-400">Try adjusting your filter or search query</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayedContestants.map((contestant) => {
            const isRed = contestant.team === "RED";
            const isEliminated = contestant.isEliminated || contestant.status === "ELIMINATED" || contestant.slug === "charan" || contestant.id === "c-13";
            const isLeader =
              (contestant.role === "LEADER" || contestant.slug === "debjani-modak" || contestant.slug === "rohit-naidu") &&
              contestant.slug !== "auto-ram-prasad" &&
              contestant.id !== "c-05";
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

            return (
              <Link
                key={contestant.id}
                href={`/contestants/${contestant.slug || contestant.id}`}
                data-active-card="true"
                className={`group editorial-card rounded-lg overflow-hidden flex flex-col justify-between transition-all ${
                  isEliminated ? "opacity-80 border-zinc-800" : isRed ? "hover:border-team-red/40" : "hover:border-team-blue/40"
                }`}
              >
                <div>
                  {/* Portrait Container (4:5 Aspect Ratio) */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-black">
                    <img
                      src={contestant.avatarUrl}
                      alt={contestant.name}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 filter brightness-95"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#13141B] via-transparent to-transparent opacity-80" />

                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          isRed
                            ? "bg-team-red text-white"
                            : "bg-team-blue text-white"
                        }`}
                      >
                        {contestant.team} TEAM
                      </span>
                      {isLeader && (
                        <span className="px-2 py-0.5 rounded bg-bb-gold text-black text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                          <Crown className="w-2.5 h-2.5" /> Team Leader
                        </span>
                      )}
                    </div>

                    <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-end">
                      {isEliminated ? (
                        <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 text-[9px] font-black uppercase tracking-tight">
                          ELIMINATED
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-red-600/90 text-white text-[9px] font-black uppercase tracking-tight">
                          Nominated
                        </span>
                      )}
                      {isHighRisk && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/90 text-black text-[9px] font-black uppercase tracking-tight">
                          HIGH RISK ZONE &bull; ACTIVE
                        </span>
                      )}
                      {isTaskWinner && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-600/90 text-white text-[9px] font-black uppercase tracking-tight flex items-center gap-1">
                          <Trophy className="w-2.5 h-2.5" /> Task 1 Win
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Editorial Info */}
                  <div className="p-3.5 sm:p-4 space-y-1.5">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-display text-xl sm:text-2xl uppercase tracking-wide text-white group-hover:text-bb-gold transition-colors leading-none truncate">
                        {contestant.name}
                      </h3>
                      <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors flex-shrink-0" />
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate font-semibold">
                      {contestant.occupation}
                    </p>
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed pt-1">
                      {contestant.bio}
                    </p>
                  </div>
                </div>

                {/* Card Footer Bar */}
                <div className="p-3.5 sm:p-4 pt-0">
                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400">Audience Rating</span>
                    <span className="font-display text-base text-white">{contestant.popularityScore ?? 0}%</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

    </div>
  );
}
