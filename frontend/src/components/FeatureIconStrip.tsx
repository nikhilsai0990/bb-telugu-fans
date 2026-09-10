"use client";

import React from "react";
import { Zap, Users, Gift, Flame } from "lucide-react";

export const FeatureIconStrip = () => {
  const items = [
    {
      icon: Zap,
      title: "CONFLICTS",
      description: "Heated arena confrontations & strategic rivalries",
    },
    {
      icon: Users,
      title: "ALLIANCES",
      description: "Red vs Blue faction diplomacy & house bonds",
    },
    {
      icon: Gift,
      title: "SURPRISES",
      description: "Unannounced twists & secret nomination powers",
    },
    {
      icon: Flame,
      title: "HIGH STAKES",
      description: "Non-stop physical arena trials & public voting",
    },
  ];

  return (
    <section className="w-full py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="editorial-panel rounded-lg p-4 sm:p-5 border border-white/[0.08]">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.08]">
            {items.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className={`flex items-center gap-3.5 ${idx > 0 ? "lg:pl-6 pt-3 sm:pt-0" : ""}`}
                >
                  <div className="w-9 h-9 rounded bg-white/[0.04] border border-white/[0.1] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-bb-gold" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-display text-lg tracking-wider text-white uppercase block leading-none">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-medium block truncate mt-1">
                      {item.description}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
