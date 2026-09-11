import React from "react";
import { Hero } from "../components/Hero";
import { FeatureIconStrip } from "../components/FeatureIconStrip";
import { TeamVsSection } from "../components/TeamVsSection";
import { FeatureCards } from "../components/FeatureCards";
import { TodayHighlights } from "../components/TodayHighlights";
import { PollWidget } from "../components/PollWidget";
import { ContestantRankings } from "../components/ContestantRankings";
import { api } from "../lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [contestants, polls, news] = await Promise.all([
    api.getContestants(),
    api.getPolls("ACTIVE"),
    api.getNews(),
  ]);

  const activePoll = polls.length > 0 ? polls[0] : null;

  return (
    <div className="space-y-10 sm:space-y-14">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Canonical 4-Concept Feature Icon Strip */}
      <FeatureIconStrip />

      {/* 3. Season 10 Individual Arena Roster */}
      <TeamVsSection contestants={contestants} />

      {/* 4. Today's Highlights Editorial Section */}
      <TodayHighlights news={news} />

      {/* 5. Dual Section: Live Fan Poll Widget & Contestant Popularity Leaderboard */}
      <section className="py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <PollWidget initialPoll={activePoll} />
            </div>
            <div className="lg:col-span-5">
              <ContestantRankings contestants={contestants} />
            </div>
          </div>
        </div>
      </section>

      {/* 6. Feature Exploration Cards */}
      <FeatureCards />
    </div>
  );
}
