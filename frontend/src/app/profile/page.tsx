"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Vote,
  MessageSquare,
  Bookmark,
  Award,
  Calendar,
  Shield,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<"posts" | "saved" | "badges">("posts");

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
        <User className="w-10 h-10 text-zinc-500" />
        <h2 className="font-display text-2xl text-white uppercase tracking-wide">Please Sign In</h2>
        <Link
          href="/login"
          className="px-6 py-2.5 rounded bg-team-red text-white text-xs font-bold uppercase tracking-wider hover:bg-team-red-dark transition-colors"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  const badges = [
    { name: "Season 10 Pioneer", desc: "Joined during Season 10 launch campaign" },
    { name: "Verified Voter", desc: "Cast verified ballot in Week 1 Save poll" },
    { name: "Salon Contributor", desc: "Participated in community discussions" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      
      {/* Profile Header */}
      <div className="editorial-panel rounded-xl p-6 sm:p-8 border border-white/[0.12] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={user.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=user"}
            alt={user.username}
            className="w-20 h-20 rounded-lg border border-white/20 bg-black"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-3xl uppercase tracking-wide text-white leading-none">
                {user.username}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/[0.08] text-zinc-300 border border-white/10">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-zinc-400">{user.email}</p>
            <div className="flex items-center gap-2 text-xs text-zinc-500 pt-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Season 10 Fan Member</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {isAdmin && (
            <Link
              href="/admin"
              className="flex-1 sm:flex-none px-4 py-2 rounded bg-white/[0.06] hover:bg-white/[0.1] text-bb-gold border border-bb-gold/30 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </Link>
          )}
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="px-4 py-2 rounded bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-team-red border border-white/10 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
        {[
          { id: "posts", label: "My Discussions" },
          { id: "badges", label: "Badges & Credentials" },
          { id: "saved", label: "Saved Topics" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
              activeTab === tab.id
                ? "bg-white text-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === "badges" ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {badges.map((b) => (
            <div key={b.name} className="editorial-card rounded-lg p-5 space-y-2">
              <Award className="w-6 h-6 text-bb-gold" />
              <h3 className="font-display text-xl uppercase tracking-wide text-white">{b.name}</h3>
              <p className="text-xs text-zinc-400">{b.desc}</p>
            </div>
          ))}
        </div>
      ) : activeTab === "saved" ? (
        <div className="editorial-panel rounded-lg p-12 text-center text-zinc-400 text-xs border border-white/[0.08]">
          No saved topics yet. Browse discussions to save favorites.
        </div>
      ) : (
        <div className="editorial-panel rounded-lg p-12 text-center text-zinc-400 text-xs border border-white/[0.08]">
          You have not created any forum discussions yet.
        </div>
      )}

    </div>
  );
}
