"use client";

import React from "react";
import Link from "next/link";
import { UserX, Ban, ArrowUpRight, ShieldAlert } from "lucide-react";

export const EliminatedSection: React.FC = () => {
  const eliminatedHousemates = [
    {
      id: "c-13",
      name: "Charan",
      slug: "charan",
      avatarUrl: "/images/contestants/charan.webp",
      occupation: "Radio Jockey",
      reason: "Eliminated based on housemates' votes. No re-entry.",
    },
    {
      id: "c-10",
      name: "Chaitra Rai",
      slug: "chaitra-rai",
      avatarUrl: "/images/contestants/chaitra-rai.webp",
      occupation: "Television Actress",
      reason: "Eliminated based on housemates' votes. No re-entry.",
    },
  ];

  return (
    <section className="py-10 border-b border-white/[0.08] relative" data-testid="eliminated-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>OFFICIAL SEASON 10 EVICTIONS</span>
            </div>
            <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-white">
              ELIMINATED <span className="text-red-500 font-sans font-bold text-2xl sm:text-3xl align-middle">CONTESTANTS</span>
            </h2>
            <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
              Charan and Chaitra Rai have both been officially ELIMINATED from Bigg Boss Telugu Season 10 based on housemates&apos; votes with <strong>NO RE-ENTRY</strong>. They are excluded from public voting ballots.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400 bg-red-950/40 border border-red-800/40 px-3.5 py-2 rounded-lg">
            <Ban className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>2 Eliminated &bull; No Re-entry</span>
          </div>
        </div>

        {/* Eliminated Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl">
          {eliminatedHousemates.map((housemate) => (
            <div
              key={housemate.id}
              className="editorial-panel rounded-xl overflow-hidden border border-red-950/60 bg-gradient-to-b from-[#180C0E] to-[#0D0708] p-5 space-y-4 relative group"
            >
              {/* Top Banner Tag */}
              <div className="flex items-center justify-between border-b border-red-900/30 pb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-950 text-red-300 text-[10px] font-black uppercase tracking-wider border border-red-800">
                  <UserX className="w-3.5 h-3.5 text-red-400" />
                  ELIMINATED
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-400">
                  <Ban className="w-3 h-3" /> NO RE-ENTRY
                </span>
              </div>

              {/* Contestant Visual + Identity */}
              <div className="flex items-center gap-4">
                {/* Real Contestant Avatar */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 border-2 border-red-800/60 bg-black shadow-lg">
                  <img
                    src={housemate.avatarUrl}
                    alt={housemate.name}
                    className="w-full h-full object-cover object-top filter grayscale contrast-125 brightness-90 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-red-950/30 mix-blend-multiply pointer-events-none" />
                </div>

                {/* Info Block */}
                <div className="min-w-0 flex-1 space-y-1">
                  <h3 className="font-display text-2xl sm:text-3xl uppercase tracking-wide text-white leading-none">
                    {housemate.name}
                  </h3>
                  <p className="text-xs text-zinc-400 font-semibold">
                    {housemate.occupation}
                  </p>
                  <div className="pt-1">
                    <span className="inline-block text-[11px] font-black uppercase tracking-wider text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                      Status: ELIMINATED
                    </span>
                  </div>
                </div>
              </div>

              {/* Elimination Detail / Non-Votable Notice */}
              <div className="p-3 rounded bg-black/40 border border-red-950/80 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 text-red-300 font-bold uppercase tracking-wider text-[10px]">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  <span>Official Verdict</span>
                </div>
                <p className="text-zinc-300 text-[11px] leading-relaxed">
                  {housemate.reason}
                </p>
              </div>

              {/* Non-Votable Footnote + Profile Link */}
              <div className="pt-2 border-t border-red-900/20 flex items-center justify-between text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Not Votable &bull; Excluded from Polls
                </span>
                <Link
                  href={`/contestants/${housemate.slug}`}
                  className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1 text-[11px] font-semibold"
                >
                  <span>View Details</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
