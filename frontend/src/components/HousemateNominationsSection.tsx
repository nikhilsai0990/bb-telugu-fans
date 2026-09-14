"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, Swords, Flame, ArrowRight, CheckCircle2, Lock } from "lucide-react";

export const HousemateNominationsSection: React.FC = () => {
  return (
    <section className="py-8 sm:py-12 border-b border-white/[0.08]" data-testid="housemate-nominations-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="editorial-panel rounded-2xl p-6 sm:p-10 border border-white/[0.12] space-y-8 relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/[0.04] blur-[100px] pointer-events-none -z-10" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-bb-gold/[0.04] blur-[100px] pointer-events-none -z-10" />

          {/* Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/[0.08] pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/[0.05] border border-white/10 text-[10px] font-bold uppercase tracking-widest text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>WEEK 2 &bull; NOMINATION MECHANIC</span>
              </div>
              <h2 className="font-display text-3xl sm:text-5xl uppercase tracking-tight text-white leading-tight">
                HOUSEMATE NOMINATIONS
              </h2>
              <p className="text-sm sm:text-base text-zinc-300 max-w-2xl font-normal leading-relaxed">
                <span className="text-white font-semibold">Housemates choose the nominations.</span>{" "}
                <span className="text-bb-gold font-semibold">But survival is decided through the game.</span>
              </p>
            </div>

            <div className="flex-shrink-0">
              <Link
                href="/polls"
                className="px-5 py-2.5 rounded bg-bb-gold hover:bg-bb-gold-light text-black font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2 shadow"
              >
                <span>Elimination Poll</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 3 Game Mechanic Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Pillar 1: Inside the House */}
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-white/20 transition-all space-y-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-lg uppercase tracking-wide text-white">
                  Decided Inside The House
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Nominations are conducted strictly within the house by fellow housemates through strategic votes and confession room face-offs.
                </p>
              </div>
              <div className="pt-2 flex items-center gap-1.5 text-[11px] text-zinc-300 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                <span>Housemate Peer Evaluation</span>
              </div>
            </div>

            {/* Pillar 2: Arena Survival */}
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-white/20 transition-all space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
                <Swords className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-lg uppercase tracking-wide text-white">
                  Survival Through The Game
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Nominated contestants must fight through high-stakes arena tasks, endurance challenges, and physical showdowns to secure immunity and save themselves.
                </p>
              </div>
              <div className="pt-2 flex items-center gap-1.5 text-[11px] text-zinc-300 font-medium">
                <Flame className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>Task Performance &amp; Grinta</span>
              </div>
            </div>

            {/* Pillar 3: Authentic Data Only */}
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-white/20 transition-all space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-lg uppercase tracking-wide text-white">
                  Zero Fake Percentages
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  We report only confirmed in-game reality. No fabricated nomination numbers or speculative tally percentages. Authenticity is 100% verified.
                </p>
              </div>
              <div className="pt-2 flex items-center gap-1.5 text-[11px] text-zinc-300 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Verified Game Integrity</span>
              </div>
            </div>
          </div>

          {/* Bottom Context Banner */}
          <div className="p-4 rounded-xl bg-[#13141B] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-bb-gold flex-shrink-0" />
              <span>
                <strong>14 Active Housemates:</strong> All active participants compete individually without teams or artificial team leaders.
              </span>
            </div>
            <span className="text-zinc-500 font-mono text-[11px]">Season 10 Format</span>
          </div>

        </div>

      </div>
    </section>
  );
};
