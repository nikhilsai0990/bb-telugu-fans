"use client";

import React from "react";
import Link from "next/link";
import { Newspaper, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import { NewsItem } from "../types";

export const TodayHighlights: React.FC<{ news: NewsItem[] }> = ({ news }) => {
  if (!news || news.length === 0) return null;

  return (
    <section className="py-14 border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex items-end justify-between border-b border-white/[0.08] pb-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
              <Newspaper className="w-3.5 h-3.5 text-bb-gold" />
              <span>Editorial Bulletins &bull; Season 10</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl uppercase tracking-tight text-white">
              Official Dispatches
            </h2>
          </div>
          <Link
            href="/news"
            className="text-xs font-bold uppercase tracking-wider text-bb-gold hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span>All News</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4-Story Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {news.slice(0, 4).map((item, idx) => {
            const isHighZone = item.slug.includes("high-zone") || item.slug.includes("high-risk");
            const isEliminated = item.slug.includes("eliminated") || item.slug.includes("charan");
            const isTaskWin = item.slug.includes("task") || item.slug.includes("win") || item.slug.includes("victory");
            const isDebjani = item.slug.includes("debjani");

            const fallbackImage = isEliminated
              ? "/images/contestants/charan.webp"
              : isHighZone
              ? "/images/contestants/chaitra-rai.webp"
              : isTaskWin
              ? "/images/contestants/rohit-naidu.webp"
              : isDebjani
              ? "/images/contestants/debjani-modak.webp"
              : "/images/contestants/rohit-naidu.webp";

            return (
              <Link
                key={item.id}
                href={`/news/${item.slug}`}
                className="group editorial-card rounded-xl overflow-hidden flex flex-col sm:flex-row hover:border-white/20 transition-all"
              >
                {/* Contestant Portrait Side */}
                <div className="sm:w-2/5 relative h-52 sm:h-auto min-h-[200px] bg-black flex-shrink-0 overflow-hidden">
                  <img
                    src={item.imageUrl || fallbackImage}
                    alt={item.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 filter brightness-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-transparent to-[#13141B]/90 sm:to-[#13141B]" />
                  <span className="absolute top-3 left-3 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-black/80 text-white border border-white/20">
                    {item.category || "Bulletin"}
                  </span>
                </div>

                {/* Editorial Content Side */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      <span>Dispatch #{idx + 1}</span>
                      <span>&bull;</span>
                      <span className="text-bb-gold">Week 1 Verified</span>
                    </div>

                    <h3 className="font-display text-2xl uppercase tracking-wide text-white group-hover:text-bb-gold transition-colors leading-tight">
                      {item.title}
                    </h3>

                    <p className="text-xs text-zinc-300 line-clamp-3 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  {/* Clarification or Read Link */}
                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
                    {isHighZone ? (
                      <span className="text-[10px] font-bold text-amber-300 uppercase tracking-tight flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                        HIGH RISK ZONE • ACTIVE
                      </span>
                    ) : isEliminated ? (
                      <span className="text-[10px] font-bold text-team-red uppercase tracking-tight flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-team-red" />
                        Charan Eliminated
                      </span>
                    ) : isTaskWin ? (
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tight flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        Red Team Won Task 1
                      </span>
                    ) : isDebjani ? (
                      <span className="text-[10px] font-bold text-bb-gold uppercase tracking-tight flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-bb-gold" />
                        Debjani Modak Leads Blue Team
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-bb-gold uppercase tracking-tight flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-bb-gold" />
                        15 Active Housemates on Ballot
                      </span>
                    )}
                    <span className="font-bold text-zinc-400 group-hover:text-white flex items-center gap-1">
                      Read &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
};
