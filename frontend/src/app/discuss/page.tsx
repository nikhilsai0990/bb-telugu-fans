"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Flame,
  ThumbsUp,
  Bookmark,
  Share2,
  Flag,
  PlusCircle,
  Search,
  Pin,
  Users,
  Award,
  BookOpen,
} from "lucide-react";
import { Post } from "../../types";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function DiscussPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [category, setCategory] = useState("All Discussions");
  const [sort, setSort] = useState<"latest" | "trending" | "top">("latest");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // New Post State
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCat, setNewCat] = useState("General Talk");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const categories = [
    "All Discussions",
    "General Talk",
    "Housemates",
    "Tasks",
    "Nominations",
    "Strategy",
    "Fan Theories",
    "Predictions",
    "Off Topic",
  ];

  const leftNavItems = [
    { id: "all", label: "All Debates", icon: MessageSquare },
    { id: "trending", label: "Trending", icon: Flame },
    { id: "top", label: "Most Voted", icon: ThumbsUp },
  ];

  useEffect(() => {
    async function load() {
      setLoading(true);
      const currentSort = activeTab === "trending" ? "trending" : activeTab === "top" ? "top" : sort;
      const data = await api.getPosts(category, currentSort, search);
      setPosts(data);
      setLoading(false);
    }
    load();
  }, [category, activeTab, sort, search]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) {
      setErrorMsg("Title and description are required.");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const created = await api.createPost({
        title: newTitle,
        description: newDesc,
        category: newCat,
      });
      setPosts([created, ...posts]);
      setNewTitle("");
      setNewDesc("");
      setCreateOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create post.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likesCount: p.likesCount + 1 } : p))
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      
      {/* Editorial Page Header */}
      <div className="space-y-3 border-b border-white/[0.08] pb-6">
        <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          <MessageSquare className="w-3.5 h-3.5 text-bb-gold" />
          <span>The Fan Salon &bull; Season 10</span>
        </div>
        <h1 className="font-display text-4xl sm:text-6xl uppercase tracking-tight text-white leading-none">
          Fan Discussions
        </h1>
        <p className="text-sm text-zinc-300 max-w-2xl leading-relaxed">
          The central salon for Telugu Bigg Boss fans. Analyze housemate strategies, task results, High Risk Zone developments, and Season 10 dynamics.
        </p>
      </div>

      {/* 3-Column Editorial Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: NAVIGATION & CATEGORIES */}
        <aside className="hidden lg:block lg:col-span-3 space-y-5 sticky top-24">
          <button
            onClick={() => setCreateOpen(!createOpen)}
            className="w-full py-3 px-4 rounded bg-team-red hover:bg-team-red-dark text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Start New Debate</span>
          </button>

          {/* Quick Filters */}
          <div className="editorial-panel rounded-lg p-3 space-y-1 border border-white/[0.08]">
            {leftNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                    isActive
                      ? "bg-white/[0.08] text-white border-l-2 border-bb-gold"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-bb-gold" : "text-zinc-500"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Categories */}
          <div className="editorial-panel rounded-lg p-4 space-y-3 border border-white/[0.08]">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Debate Categories
            </h4>
            <div className="space-y-0.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-semibold transition-colors flex items-center justify-between ${
                    category === cat
                      ? "text-white bg-white/[0.06] font-bold"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <span>{cat}</span>
                  {category === cat && <span className="w-1.5 h-1.5 rounded-full bg-bb-gold" />}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* CENTER COLUMN: DEBATE FEED */}
        <main className="lg:col-span-6 space-y-6">
          
          {/* Mobile Start Debate Button */}
          <div className="lg:hidden flex items-center gap-3">
            <button
              onClick={() => setCreateOpen(!createOpen)}
              className="w-full py-3 px-4 rounded bg-team-red text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Start Debate</span>
            </button>
          </div>

          {/* Search & Sort Controls */}
          <div className="editorial-panel p-3 rounded-lg border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search debates..."
                className="w-full pl-8 pr-3 py-1.5 rounded bg-black/40 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider hidden sm:inline">Sort:</span>
              {(["latest", "trending", "top"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSort(s)}
                  className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                    sort === s ? "bg-white/[0.08] text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Create Post Drawer */}
          {createOpen && (
            <form
              onSubmit={handleCreatePost}
              className="p-5 rounded-lg editorial-panel border border-white/[0.15] space-y-4"
            >
              <h3 className="font-display text-2xl uppercase tracking-wide text-white">
                Start a New Discussion Thread
              </h3>
              {errorMsg && (
                <p className="text-xs text-team-red bg-team-red/10 p-2.5 rounded border border-team-red/20 font-semibold">
                  {errorMsg}
                </p>
              )}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Category
                </label>
                <select
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
                >
                  {categories.filter((c) => c !== "All Discussions").map((c) => (
                    <option key={c} value={c} className="bg-[#101116] text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Topic Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="State your observation or debate question..."
                  className="w-full px-3 py-2 rounded bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Analysis / Discussion
                </label>
                <textarea
                  rows={4}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Share your talking points in detail..."
                  className="w-full px-3 py-2 rounded bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30 resize-none font-sans"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="px-4 py-1.5 rounded text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-1.5 rounded bg-team-red hover:bg-team-red-dark text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  {submitting ? "Publishing..." : "Publish Thread"}
                </button>
              </div>
            </form>
          )}

          {/* Posts Feed */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-36 rounded-lg bg-white/[0.03] animate-pulse border border-white/[0.05]" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="editorial-panel rounded-xl p-12 text-center space-y-2 border border-white/[0.08]">
              <p className="font-display text-2xl text-white uppercase">No Discussions Found</p>
              <p className="text-xs text-zinc-400">Be the first to open a debate in this category.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="editorial-card rounded-xl p-5 sm:p-6 space-y-3.5 border border-white/[0.08]"
                >
                  {/* Author & Tag */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={post.userAvatar || "https://api.dicebear.com/7.x/bottts/svg?seed=user"}
                        alt={post.username}
                        className="w-7 h-7 rounded-full border border-white/15"
                      />
                      <div>
                        <span className="font-bold text-white text-xs block leading-none">{post.username}</span>
                        <span className="text-[10px] text-zinc-400">Season 10 Fan</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {post.isPinned && (
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-bb-gold bg-bb-gold/10 px-2 py-0.5 rounded border border-bb-gold/20">
                          <Pin className="w-2.5 h-2.5" /> Pinned
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded bg-white/[0.04] text-zinc-300 border border-white/10 text-[9px] font-bold uppercase tracking-wider">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Title & Body */}
                  <Link href={`/discuss/${post.id}`} className="block space-y-1 group">
                    <h2 className="font-display text-2xl uppercase tracking-wide text-white group-hover:text-bb-gold transition-colors leading-tight">
                      {post.title}
                    </h2>
                    <p className="text-xs text-zinc-300 line-clamp-3 leading-relaxed">
                      {post.description}
                    </p>
                  </Link>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-400">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-1.5 hover:text-white transition-colors"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{post.likesCount}</span>
                      </button>

                      <Link
                        href={`/discuss/${post.id}`}
                        className="flex items-center gap-1.5 hover:text-bb-gold transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{post.commentsCount} comments</span>
                      </Link>
                    </div>

                    <Link
                      href={`/discuss/${post.id}`}
                      className="text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
                    >
                      Join Discussion &rarr;
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>

        {/* RIGHT COLUMN: TRENDING TOPICS & COMMUNITY RULES */}
        <aside className="hidden lg:block lg:col-span-3 space-y-5 sticky top-24">
          {/* Trending Topics */}
          <div className="editorial-panel rounded-lg p-5 space-y-4 border border-white/[0.08]">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-bb-gold" />
              <span>Trending House Debates</span>
            </h4>
            <div className="space-y-3 text-xs">
              {[
                { tag: "#14ActiveHousemates", count: "14 Active Housemates" },
                { tag: "#HighRiskZone3", count: "Aman, Sudheer & Varshini" },
                { tag: "#KrishnuduTeamWin", count: "Latest Team Task" },
                { tag: "#TaskWinners", count: "Auto, Rohit & Vamsi" },
                { tag: "#NoEliminationSunday", count: "Voting Closed" },
                { tag: "#NoReEntry", count: "Charan & Chaitra" },
              ].map((t) => (
                <div key={t.tag} className="flex items-center justify-between hover:text-white cursor-pointer">
                  <span className="font-bold text-zinc-300">{t.tag}</span>
                  <span className="text-[10px] text-zinc-500 uppercase">{t.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Guidelines */}
          <div className="editorial-panel rounded-lg p-5 space-y-3 border border-white/[0.08]">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-team-blue" />
              <span>Salon Standards</span>
            </h4>
            <ul className="text-xs text-zinc-400 space-y-2 list-disc pl-4 leading-relaxed">
              <li>Debate tactics with respect for all 16 housemates (15 active, 1 eliminated).</li>
              <li>No hate speech, abusive language, or harassment.</li>
              <li>Keep speculation grounded in actual episode events.</li>
            </ul>
          </div>
        </aside>

      </div>

    </div>
  );
}
