"use client";

import React from "react";
import Link from "next/link";
import { Vote, Users, ArrowRight, Shield, Award, AlertCircle } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative w-full overflow-hidden pt-8 pb-12 lg:pt-14 lg:pb-16 border-b border-white/[0.08]">
      {/* Background Subtle Atmosphere */}
      <div className="absolute top-0 left-1/4 w-[450px] h-[350px] bg-team-red/[0.06] blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-0 right-1/4 w-[450px] h-[350px] bg-team-blue/[0.06] blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: High-Impact Editorial Typography */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Kicker Badge */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-white/[0.04] border border-white/[0.1] rounded text-[11px] font-bold tracking-widest uppercase text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-team-red" />
              <span>BIGG BOSS TELUGU 10</span>
              <span className="text-zinc-600">•</span>
              <span className="text-bb-gold">OFFICIAL CAMPAIGN</span>
            </div>

            {/* Monumental Headline */}
            <div className="space-y-1">
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl tracking-tight uppercase text-white leading-[0.92]">
                <span className="text-team-red">RED</span>{" "}
                <span className="text-zinc-500 text-3xl sm:text-4xl align-middle font-sans font-extrabold tracking-normal">VS</span>{" "}
                <span className="text-team-blue">BLUE.</span>
                <br />
                <span className="text-white">SEASON 10</span>
                <br />
                <span className="text-zinc-300">DRAMA UNLEASHED.</span>
              </h1>
            </div>

            {/* Editorial Context */}
            <p className="text-sm sm:text-base text-zinc-300 font-normal leading-relaxed max-w-xl">
              The premier fan community for Bigg Boss Telugu Season 10. Red Team won Task 1 led by Rohit Naidu and Temper Vamsi. Charan has been ELIMINATED based on housemates&apos; votes. Exactly two contestants &mdash; Auto Ram Prasad (Blue) and Chaitra Rai (Red) &mdash; are in the HIGH RISK ZONE as active nominated housemates. 15 active housemates face the public save vote!
            </p>

            {/* Official Match State Board (ESPN / Broadcast Hierarchy) */}
            <div className="editorial-panel rounded-lg p-4 space-y-3 max-w-xl">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider pb-2 border-b border-white/[0.08]">
                <span className="text-zinc-400">Current Week 1 Status</span>
                <span className="text-team-red flex items-center gap-1.5 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-team-red animate-pulse" />
                  15 Active Nominated &bull; 1 Eliminated
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                {/* Red Team State */}
                <div className="p-2.5 rounded bg-team-red-surface border border-team-red-border">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-team-red block">
                      Red Team &bull; Task 1 Winner
                    </span>
                    <span className="text-[9px] font-black uppercase text-bb-gold bg-bb-gold/15 px-1 rounded">
                      Leader
                    </span>
                  </div>
                  <p className="text-sm font-extrabold text-white mt-0.5">Rohit Naidu</p>
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase">Red Team Leader &bull; 7 Active, 1 Eliminated</span>
                </div>

                {/* Blue Team State */}
                <div className="p-2.5 rounded bg-team-blue-surface border border-team-blue-border">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-team-blue block">
                      Blue Team &bull; 8 Active Players
                    </span>
                    <span className="text-[9px] font-black uppercase text-bb-gold bg-bb-gold/15 px-1 rounded">
                      Leader
                    </span>
                  </div>
                  <p className="text-sm font-extrabold text-white mt-0.5">Debjani Modak</p>
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase">Blue Team Leader</span>
                </div>
              </div>

              {/* High Risk Zone Notice Banner */}
              <div className="flex items-start gap-2 px-3 py-2.5 rounded bg-amber-500/10 border border-amber-500/20 text-[11px] text-zinc-300">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-amber-300 uppercase font-bold">HIGH RISK ZONE Notice:</strong> Auto Ram Prasad (Blue) &amp; Chaitra Rai (Red) are the only 2 contestants in the HIGH RISK ZONE. Both remain ACTIVE nominated housemates! Charan, Aman, and Mukesh Gowda are NOT in the High Risk Zone.
                </span>
              </div>

              {/* Task 1 Result Banner */}
              <div className="flex items-start gap-2 px-3 py-2 rounded bg-white/[0.03] border border-white/[0.08] text-[11px] text-zinc-300">
                <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white uppercase font-bold">Task 1: RED TEAM WON</strong> &mdash; Rohit Naidu &amp; Temper Vamsi represented Red Team (WIN). Thrigun &amp; Mukesh Gowda represented Blue Team (LOSS).
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/polls"
                className="px-6 py-3 rounded bg-team-red hover:bg-team-red-dark text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm"
              >
                <Vote className="w-4 h-4" />
                <span>Vote In Save Poll</span>
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

          {/* Right Column: Balanced Team Leadership Presentation */}
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
                      Season 10 Arena &bull; Team Leadership
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-bb-gold bg-bb-gold/10 px-2 py-0.5 rounded border border-bb-gold/20">
                    Week 1 Ballot Live
                  </span>
                </div>

                {/* Balanced Leadership Showcase: Red Leader & Blue Leader */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {/* Rohit Naidu - Red Team Leader */}
                  <Link
                    href="/contestants/rohit-naidu"
                    className="group relative rounded-lg overflow-hidden border border-team-red-border bg-gradient-to-t from-black via-[#140C0E] to-transparent p-3 flex flex-col justify-end min-h-[220px] sm:min-h-[260px] transition-transform duration-300 hover:scale-[1.02]"
                  >
                    <img
                      src="/images/contestants/rohit-naidu.webp"
                      alt="Rohit Naidu"
                      className="absolute inset-0 w-full h-full object-cover object-top filter brightness-95 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0506] via-[#0A0506]/50 to-transparent" />
                    
                    <div className="relative z-10 space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="inline-block px-1.5 py-0.5 rounded bg-bb-gold text-black text-[9px] font-black uppercase tracking-wider">
                          TEAM LEADER
                        </span>
                        <span className="text-[9px] font-black uppercase text-team-red bg-team-red/20 px-1 py-0.5 rounded">
                          RED TEAM
                        </span>
                      </div>
                      <h3 className="font-display text-xl sm:text-2xl text-white tracking-wide leading-none">
                        Rohit Naidu
                      </h3>
                      <p className="text-[10px] text-zinc-300">Model &amp; TV Star &bull; Active</p>
                    </div>
                  </Link>

                  {/* Debjani Modak - Blue Team Leader */}
                  <Link
                    href="/contestants/debjani-modak"
                    className="group relative rounded-lg overflow-hidden border border-team-blue-border bg-gradient-to-t from-black via-[#0B1017] to-transparent p-3 flex flex-col justify-end min-h-[220px] sm:min-h-[260px] transition-transform duration-300 hover:scale-[1.02]"
                  >
                    <img
                      src="/images/contestants/debjani-modak.webp"
                      alt="Debjani Modak"
                      className="absolute inset-0 w-full h-full object-cover object-top filter brightness-95 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#05080E] via-[#05080E]/50 to-transparent" />
                    
                    <div className="relative z-10 space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="inline-block px-1.5 py-0.5 rounded bg-bb-gold text-black text-[9px] font-black uppercase tracking-wider">
                          TEAM LEADER
                        </span>
                        <span className="text-[9px] font-black uppercase text-team-blue bg-team-blue/20 px-1 py-0.5 rounded">
                          BLUE TEAM
                        </span>
                      </div>
                      <h3 className="font-display text-xl sm:text-2xl text-white tracking-wide leading-none">
                        Debjani Modak
                      </h3>
                      <p className="text-[10px] text-zinc-300">Television Actress &bull; Active</p>
                    </div>
                  </Link>
                </div>

                {/* Sub-Strip: Key Housemates in Focus */}
                <div className="pt-2 border-t border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="font-semibold uppercase tracking-wider">HIGH RISK ZONE &bull; Active Housemates</span>
                    <Link href="/contestants" className="text-bb-gold hover:underline font-bold">
                      View All 16 &rarr;
                    </Link>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { name: "Auto Ram Prasad", role: "Blue • High Risk Zone", img: "/images/contestants/auto-ram-prasad.webp", slug: "auto-ram-prasad", badge: "Blue", tag: "HIGH RISK ZONE" },
                      { name: "Chaitra Rai", role: "Red • High Risk Zone", img: "/images/contestants/chaitra-rai.webp", slug: "chaitra-rai", badge: "Red", tag: "HIGH RISK ZONE" },
                      { name: "Temper Vamsi", role: "Red • Task 1 Winner", img: "/images/contestants/temper-vamsi.webp", slug: "temper-vamsi", badge: "Red", tag: "Task 1 Winner" },
                      { name: "Charan", role: "Red • Eliminated", img: "/images/contestants/charan.webp", slug: "charan", badge: "Red", tag: "ELIMINATED" },
                    ].map((item) => (
                      <Link
                        key={item.slug}
                        href={`/contestants/${item.slug}`}
                        className="group flex flex-col items-center text-center p-1.5 rounded bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.05] transition-colors"
                      >
                        <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden mb-1 border border-white/10 group-hover:border-white/30">
                          <img
                            src={item.img}
                            alt={item.name}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                        <span className="text-[11px] font-bold text-white group-hover:text-bb-gold truncate w-full">
                          {item.name}
                        </span>
                        <span className={`text-[9px] font-semibold uppercase ${item.tag === "ELIMINATED" ? "text-zinc-500" : item.badge === "Red" ? "text-team-red" : "text-team-blue"}`}>
                          {item.tag || item.badge}
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
