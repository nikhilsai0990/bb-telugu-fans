"use client";

import React from "react";
import Link from "next/link";
import { Zap, Vote, TrendingUp, Newspaper, Smile, MessageSquare, ArrowRight } from "lucide-react";

export const FeatureCards = () => {
  const features = [
    {
      title: "LIVE FAN POLLS",
      tagline: "One Verified Vote Per Device",
      description: "Cryptographically protected polling capturing audience sentiment across all active housemates.",
      icon: Vote,
      href: "/polls",
    },
    {
      title: "HOUSEMATES ROSTER",
      tagline: "Faction Alignment & Strategy",
      description: "Complete profiles of all 16 housemates across Red and Blue factions and arena standings.",
      icon: TrendingUp,
      href: "/contestants",
    },
    {
      title: "EDITORIAL NEWS",
      tagline: "Verified Broadcast Dispatches",
      description: "Immediate reporting on house developments, task resolutions, and crucial house status announcements.",
      icon: Newspaper,
      href: "/news",
    },
    {
      title: "FAN DISCUSSIONS",
      tagline: "Passionate Community Salon",
      description: "High-level debates analyzing team tactics, game strategy, and week-by-week voting trajectories.",
      icon: MessageSquare,
      href: "/discuss",
    },
    {
      title: "MEMES ARCHIVE",
      tagline: "Community Humor Vault",
      description: "Clean empty state staging area ready for the season's most viral reactions and kitchen dramas.",
      icon: Smile,
      href: "/memes",
    },
    {
      title: "ARENA POWER METERS",
      tagline: "Dynamic House Sentiment",
      description: "Analytical benchmarking of public sentiment, arena trials, and survival rates across Season 10.",
      icon: Zap,
      href: "/contestants",
    },
  ];

  return (
    <section className="py-14 border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-bb-gold" />
              <span>Platform Infrastructure &bull; Season 10</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl uppercase tracking-tight text-white">
              Platform Features
            </h2>
          </div>
          <p className="text-xs text-zinc-400 max-w-sm">
            Everything Bigg Boss Telugu Season 10 fans need in one place.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group editorial-card rounded-xl p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover:border-white/20 transition-colors">
                    <Icon className="w-5 h-5 text-bb-gold" />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl uppercase tracking-wide text-white group-hover:text-bb-gold transition-colors leading-none">
                      {item.title}
                    </h3>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mt-1">
                      {item.tagline}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400 group-hover:text-white transition-colors">
                  <span>Enter Feature</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
};
