"use client";

import React from "react";
import Link from "next/link";
import { Vote, Users, ArrowRight, Shield, Award, AlertCircle, Trophy } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative w-full overflow-hidden pt-8 pb-12 lg:pt-14 lg:pb-16 border-b border-white/[0.08]">
      {/* Background Subtle Atmosphere */}
      <div className="absolute top-0 left-1/4 w-[450px] h-[350px] bg-bb-gold/[0.05] blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-0 right-1/4 w-[450px] h-[350px] bg-white/[0.03] blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Editorial Typography */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Kicker Badge */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-white/[0.04] border border-white/[0.1] rounded text-[11px] font-bold tracking-widest uppercase text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-bb-gold" />
              <span>BIGG BOSS TELUGU 10</span>
              <span className="text-zinc-600">•</span>
              <span className="text-bb-gold">OFFICIAL FAN ARENA</span>
            </div>

            {/* Monumental Headline */}
            <div className="space-y-1">
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl tracking-tight uppercase text-white leading-[0.92]">
                <span>HOUSEMATE</span>{" "}
                <span className="text-bb-gold">BATTLE.</span>
                <br />
                <span className="text-white">SEASON 10</span>
                <br />
                <span className="text-zinc-300">DRAMA UNLEASHED.</span>
              </h1>
            </div>

            {/* Editorial Context */}
            <p className="text-sm sm:text-base text-zinc-300 font-normal leading-relaxed max-w-xl">
              The premier fan community for Bigg Boss Telugu Season 10. Auto Ram Prasad, Rohit Naidu, and Temper Vamsi are TASK WINNERS. Charan and Chaitra Rai have both been officially ELIMINATED based on housemates&apos; votes with NO RE-ENTRY. 14 active housemates remain in the competition. In the latest team task, Krishnudu&apos;s team defeated Naresh&apos;s team!
            </p>

            {/* Official Match State Board */}
            <div className="editorial-panel rounded-lg p-4 space-y-3 max-w-xl">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider pb-2 border-b border-white/[0.08]">
                <span className="text-zinc-400">Current Season 10 Status</span>
                <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  14 Active Housemates &bull; 2 Eliminated (No Re-entry)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Task Winners Box */}
                <div className="p-2.5 rounded bg-white/[0.03] border border-emerald-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 block">
                      Task Winners
                    </span>
                    <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="text-sm font-extrabold text-white mt-0.5 truncate">Auto Ram Prasad, Rohit &amp; Vamsi</p>
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase">TASK WINNER (1 Win Each)</span>
                </div>

                {/* Eliminated Box */}
                <div className="p-2.5 rounded bg-white/[0.03] border border-red-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 block">
                      Eliminated
                    </span>
                    <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                  </div>
                  <p className="text-sm font-extrabold text-white mt-0.5 truncate">Charan &amp; Chaitra Rai</p>
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase">NO RE-ENTRY</span>
                </div>
              </div>

              {/* Elimination Notice Banner */}
              <div className="flex items-start gap-2 px-3 py-2.5 rounded bg-red-950/30 border border-red-800/40 text-[11px] text-zinc-300">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-red-300 uppercase font-bold">ELIMINATED:</strong> Charan and Chaitra Rai have both been officially eliminated from Bigg Boss Telugu Season 10 based on housemates&apos; votes with <strong>NO RE-ENTRY</strong>. 14 active housemates remain in the competition.
                </span>
              </div>

              {/* Team Task Result Banner */}
              <div className="flex items-start gap-2 px-3 py-2 rounded bg-white/[0.03] border border-white/[0.08] text-[11px] text-zinc-300">
                <Trophy className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white uppercase font-bold">Latest Team Task:</strong> Team A (Naresh) vs Team B (Krishnudu) &mdash; <span className="text-emerald-400 font-bold">Winner: Krishnudu&apos;s Team!</span>
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/polls"
                className="px-6 py-3 rounded bg-bb-gold hover:bg-bb-gold-light text-black font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm"
              >
                <Vote className="w-4 h-4" />
                <span>View Poll &amp; Results</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contestants"
                className="px-6 py-3 rounded bg-white/[0.05] hover:bg-white/[0.09] text-white border border-white/15 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
              >
                <Users className="w-4 h-4 text-zinc-400" />
                <span>Explore 16 Housemates</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Contenders Showcase */}
          <div className="lg:col-span-6 relative">
            <div className="relative w-full max-w-lg mx-auto">
              
              {/* Main Composition Box */}
              <div className="relative rounded-xl overflow-hidden editorial-panel border border-white/[0.12] p-4 sm:p-6 space-y-4">
                
                {/* Header Kicker inside Card */}
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2">
                    <img
                      src="/images/eye-symbol.webp"
                      alt="Bigg Boss Eye"
                      className="w-5 h-3.5 object-contain"
                    />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                      Season 10 Arena &bull; Housemates
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-bb-gold bg-bb-gold/10 px-2 py-0.5 rounded border border-bb-gold/20">
                    Sunday Closed &bull; 14 Active Housemates
                  </span>
                </div>

                {/* Contenders Showcase: Auto Ram Prasad & Debjani Modak */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {/* Auto Ram Prasad - Task Winner */}
                  <Link
                    href="/contestants/auto-ram-prasad"
                    className="group relative rounded-lg overflow-hidden border border-emerald-500/30 bg-gradient-to-t from-black via-zinc-900 to-transparent p-3 flex flex-col justify-end min-h-[220px] sm:min-h-[260px] transition-transform duration-300 hover:scale-[1.02]"
                  >
                    <img
                      src="/images/contestants/auto-ram-prasad.webp"
                      alt="Auto Ram Prasad"
                      className="absolute inset-0 w-full h-full object-cover object-top filter brightness-95 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/50 to-transparent" />
                    
                    <div className="relative z-10 space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500 text-black text-[9px] font-black uppercase tracking-wider">
                          <Trophy className="w-2.5 h-2.5" /> TASK WINNER
                        </span>
                      </div>
                      <h3 className="font-display text-xl sm:text-2xl text-white tracking-wide leading-none">
                        Auto Ram Prasad
                      </h3>
                      <p className="text-[10px] text-zinc-300">Task Winner &bull; Housemate</p>
                    </div>
                  </Link>

                  {/* Debjani Modak - Housemate */}
                  <Link
                    href="/contestants/debjani-modak"
                    className="group relative rounded-lg overflow-hidden border border-white/[0.12] bg-gradient-to-t from-black via-zinc-900 to-transparent p-3 flex flex-col justify-end min-h-[220px] sm:min-h-[260px] transition-transform duration-300 hover:scale-[1.02]"
                  >
                    <img
                      src="/images/contestants/debjani-modak.webp"
                      alt="Debjani Modak"
                      className="absolute inset-0 w-full h-full object-cover object-top filter brightness-95 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#05080E] via-[#05080E]/50 to-transparent" />
                    
                    <div className="relative z-10 space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="inline-block px-1.5 py-0.5 rounded bg-white/[0.08] text-white border border-white/20 text-[9px] font-black uppercase tracking-wider">
                          HOUSEMATE
                        </span>
                      </div>
                      <h3 className="font-display text-xl sm:text-2xl text-white tracking-wide leading-none">
                        Debjani Modak
                      </h3>
                      <p className="text-[10px] text-zinc-300">Housemate</p>
                    </div>
                  </Link>
                </div>

                {/* Sub-Strip: Key Housemates in Focus */}
                <div className="pt-2 border-t border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="font-semibold uppercase tracking-wider">HOUSEMATES IN FOCUS</span>
                    <Link href="/contestants" className="text-bb-gold hover:underline font-bold">
                      View All 16 &rarr;
                    </Link>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                    {[
                      { name: "Rohit", role: "Housemate", img: "/images/contestants/rohit-naidu.webp", slug: "rohit-naidu", tag: "TASK WINNER" },
                      { name: "Vamsi", role: "Housemate", img: "/images/contestants/temper-vamsi.webp", slug: "temper-vamsi", tag: "TASK WINNER" },
                      { name: "Naresh", role: "Housemate", img: "/images/contestants/jabardasth-naresh.webp", slug: "jabardasth-naresh", tag: "HOUSEMATE" },
                      { name: "Chaitra Rai", role: "Eliminated", img: "/images/contestants/chaitra-rai.webp", slug: "chaitra-rai", tag: "ELIMINATED" },
                      { name: "Charan", role: "Eliminated", img: "/images/contestants/charan.webp", slug: "charan", tag: "ELIMINATED" },
                    ].map((item) => (
                      <Link
                        key={item.slug}
                        href={`/contestants/${item.slug}`}
                        className="group flex flex-col items-center text-center p-1 sm:p-1.5 rounded bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] transition-colors"
                      >
                        <div className="relative w-8 h-8 sm:w-11 sm:h-11 rounded-full overflow-hidden mb-1 border border-white/10 group-hover:border-white/30">
                          <img
                            src={item.img}
                            alt={item.name}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-bold text-white group-hover:text-bb-gold truncate w-full">
                          {item.name}
                        </span>
                        <span className={`text-[8px] sm:text-[9px] font-semibold uppercase ${
                          item.tag === "ELIMINATED" ? "text-red-400" : item.tag === "TASK WINNER" ? "text-emerald-400" : "text-amber-400"
                        }`}>
                          {item.tag}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
