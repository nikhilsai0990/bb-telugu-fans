"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, AlertCircle, ArrowUpRight, Trophy } from "lucide-react";
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
  if (filter === "ACTIVE" || filter === "NOMINATED") {
    displayedContestants = contestants.filter(
      (c) =>
        !c.isEliminated &&
        c.status !== "ELIMINATED" &&
        c.slug !== "charan" &&
        c.slug !== "chaitra-rai" &&
        c.isActive
    );
  } else if (filter === "ELIMINATED") {
    displayedContestants = contestants.filter(
      (c) =>
        c.isEliminated ||
        c.status === "ELIMINATED" ||
        c.slug === "charan" ||
        c.slug === "chaitra-rai" ||
        c.id === "c-13" ||
        c.id === "c-10"
    );
  }

  const filterTabs = [
    { id: "ALL", label: "All Housemates (16)" },
    { id: "ACTIVE", label: "Active Housemates (14)" },
    { id: "ELIMINATED", label: "Eliminated (2)" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      
      {/* Editorial Page Header */}
      <div className="space-y-3 border-b border-white/[0.08] pb-6">
        <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-bb-gold" />
          <span>Official Season 10 Roster &bull; 16 Housemates (14 Active, 2 Eliminated)</span>
        </div>
        <h1 className="font-display text-4xl sm:text-6xl uppercase tracking-tight text-white">
          Housemates Directory
        </h1>
        <p className="text-sm text-zinc-300 max-w-2xl leading-relaxed">
          The 16 Bigg Boss Telugu Season 10 housemates. Auto Ram Prasad, Rohit Naidu, and Temper Vamsi are TASK WINNERS. Charan and Chaitra Rai are ELIMINATED based on housemates&apos; votes (NO RE-ENTRY). 14 active housemates remain in the competition.
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
                data-active-card="true"
                className={`group editorial-card rounded-lg overflow-hidden flex flex-col justify-between transition-all ${
                  isEliminated
                    ? "opacity-75 border-red-950/40 bg-zinc-950/60"
                    : "border-white/[0.08] hover:border-white/30"
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

                    {/* Single Responsive Top Badges Container (prevents mobile overlap) */}
                    <div className="absolute top-2 left-2 right-2 flex flex-wrap gap-1 items-start z-10 pointer-events-none">
                      {isEliminated ? (
                        <span className="px-2 py-0.5 rounded bg-red-950/90 text-red-300 border border-red-800 text-[9px] font-black uppercase tracking-wider shadow">
                          ELIMINATED &bull; NO RE-ENTRY
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black uppercase tracking-wider backdrop-blur-sm">
                          HOUSEMATE
                        </span>
                      )}

                      {isTaskWinner && (
                        <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow">
                          <Trophy className="w-2.5 h-2.5" /> TASK WINNER
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
                    <span className="text-zinc-400 font-medium">Designation</span>
                    <span className={`font-display text-xs uppercase tracking-wider font-bold ${
                      isEliminated ? "text-red-400" : "text-amber-400"
                    }`}>
                      {isEliminated ? "Eliminated (No Re-entry)" : "Housemate"}
                    </span>
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
