"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Newspaper, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import { NewsItem } from "../../types";
import { api } from "../../lib/api";

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await api.getNews(category);
      setNews(data);
      setLoading(false);
    }
    load();
  }, [category]);

  const categories = ["All", "Evictions", "Tasks", "Nominations", "House Dynamics"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      
      {/* Editorial Page Header */}
      <div className="space-y-3 border-b border-white/[0.08] pb-6">
        <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          <Newspaper className="w-3.5 h-3.5 text-bb-gold" />
          <span>Verified House Dispatches &bull; Season 10</span>
        </div>
        <h1 className="font-display text-4xl sm:text-6xl uppercase tracking-tight text-white leading-none">
          Editorial News
        </h1>
        <p className="text-sm text-zinc-300 max-w-2xl leading-relaxed">
          Official dispatches, arena trial verdicts, and verified nomination bulletins from Bigg Boss Telugu Season 10.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-4">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
              category === cat
                ? "bg-white text-black"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 2-Story Editorial Layout */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map((n) => (
            <div key={n} className="h-72 rounded-xl bg-white/[0.03] animate-pulse border border-white/[0.06]" />
          ))}
        </div>
      ) : news.length === 0 ? (
        <div className="editorial-panel rounded-xl p-12 text-center text-zinc-400 text-sm">
          No dispatches found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {news.map((item, idx) => {
            const isEliminated = item.slug.includes("eliminated") || item.slug.includes("re-entry") || item.slug.includes("charan");
            const isPowerKey = item.slug.includes("power-key") || item.slug.includes("srushti");
            const isSudheer = item.slug.includes("sudheer");
            const isTeamTask = item.slug.includes("krishnudu") || item.slug.includes("naresh");
            const isNoElimination = item.slug.includes("no-elimination");

            const fallbackImage = isEliminated
              ? "/images/contestants/chaitra-rai.webp"
              : isPowerKey
              ? "/images/contestants/srushti-vyakaranam.webp"
              : isSudheer
              ? "/images/contestants/sudheer-kumar-reddy.webp"
              : isTeamTask
              ? "/images/contestants/krishnudu.webp"
              : "/images/contestants/debjani-modak.webp";

            return (
              <Link
                key={item.id}
                href={`/news/${item.slug}`}
                className="group editorial-card rounded-xl overflow-hidden flex flex-col justify-between border border-white/[0.08] hover:border-white/20 transition-all"
              >
                <div>
                  {/* Real Portrait Header */}
                  <div className="relative aspect-[4/3] sm:aspect-[3/2] w-full overflow-hidden bg-black">
                    <img
                      src={item.imageUrl || fallbackImage}
                      alt={item.title}
                      className="w-full h-full object-cover object-[center_20%] group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#13141B]/40 to-transparent pointer-events-none" />
                    
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-black/80 text-white border border-white/20 text-[10px] font-black uppercase tracking-wider">
                        {item.category}
                      </span>
                      <span className="px-2.5 py-0.5 rounded bg-bb-gold/20 text-bb-gold border border-bb-gold/40 text-[10px] font-bold uppercase tracking-wider">
                        Dispatch #{idx + 1}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-3">
                    <h2 className="font-display text-2xl sm:text-3xl uppercase tracking-wide text-white group-hover:text-bb-gold transition-colors leading-tight">
                      {item.title}
                    </h2>
                    
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>
                </div>

                {/* Footer Banner */}
                <div className="p-6 pt-0">
                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                    {isNoElimination ? (
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-tight flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        No Eviction on Sunday &bull; All 14 Safe
                      </span>
                    ) : isPowerKey ? (
                      <span className="text-[11px] font-bold text-amber-300 uppercase tracking-tight flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                        Power Key Lost &bull; House Votes
                      </span>
                    ) : isSudheer ? (
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-tight flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        Sudheer Won Challenge
                      </span>
                    ) : isTeamTask ? (
                      <span className="text-[11px] font-bold text-blue-400 uppercase tracking-tight flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                        Krishnudu Team Won Against Naresh Team
                      </span>
                    ) : isEliminated ? (
                      <span className="text-[11px] font-bold text-red-400 uppercase tracking-tight flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                        No Re-entry for Chaitra Rai &amp; Charan
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-bb-gold uppercase tracking-tight flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-bb-gold" />
                        14 Active Housemates
                      </span>
                    )}
                    <span className="font-bold text-zinc-400 group-hover:text-white flex items-center gap-1">
                      Read Full Article &rarr;
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
