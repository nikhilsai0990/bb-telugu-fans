"use client";

import React, { useState, useEffect } from "react";
import { Smile, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { Meme } from "../../types";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function MemesPage() {
  const { user } = useAuth();
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadMsg, setUploadMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await api.getMemes();
      setMemes(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleCreateMeme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) {
      setUploadMsg({ type: "error", text: "Please provide a title and valid image link." });
      return;
    }

    const newMeme: Meme = {
      id: "meme-" + Date.now(),
      userId: user?.id || "anon",
      username: user?.username || "FanContributor",
      title,
      imageUrl,
      likesCount: 0,
      isApproved: true,
      createdAt: new Date().toISOString(),
    };

    setMemes([newMeme, ...memes]);
    setUploadMsg({ type: "success", text: "Meme submitted to the community feed." });
    setTitle("");
    setImageUrl("");
    setTimeout(() => {
      setUploadMsg(null);
      setUploadOpen(false);
    }, 1500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            <Smile className="w-3.5 h-3.5 text-bb-gold" />
            <span>Community Culture &bull; Season 10</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl uppercase tracking-tight text-white leading-none">
            Meme Vault
          </h1>
          <p className="text-sm text-zinc-300 max-w-xl leading-relaxed">
            Fan reactions, arena roasts, kitchen debate formats, and viral Telugu reality television moments.
          </p>
        </div>

        <button
          onClick={() => setUploadOpen(!uploadOpen)}
          className="px-5 py-2.5 rounded bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Contribute Meme</span>
        </button>
      </div>

      {/* Upload Drawer */}
      {uploadOpen && (
        <form
          onSubmit={handleCreateMeme}
          className="p-6 rounded-xl editorial-panel border border-white/[0.15] space-y-4 max-w-xl"
        >
          <h3 className="font-display text-2xl uppercase tracking-wide text-white">
            Submit Community Reaction
          </h3>
          {uploadMsg && (
            <div
              className={`p-3 rounded text-xs font-semibold flex items-center gap-2 border ${
                uploadMsg.type === "success"
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                  : "bg-red-500/10 text-red-300 border-red-500/30"
              }`}
            >
              {uploadMsg.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{uploadMsg.text}</span>
            </div>
          )}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Meme Punchline / Caption
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. When the nomination buzzer sounds..."
              className="w-full px-3.5 py-2 rounded bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Image URL
            </label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2 rounded bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-white/30"
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setUploadOpen(false)}
              className="px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded bg-team-red hover:bg-team-red-dark text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Submit
            </button>
          </div>
        </form>
      )}

      {/* Clean Minimalist Empty State */}
      {loading ? (
        <div className="editorial-panel rounded-xl p-16 text-center animate-pulse border border-white/[0.08]">
          <div className="h-6 bg-white/10 rounded w-48 mx-auto" />
        </div>
      ) : memes.length === 0 ? (
        <div className="editorial-panel rounded-xl p-16 sm:p-20 text-center border border-white/[0.08] space-y-4 max-w-lg mx-auto my-8">
          <div className="w-12 h-12 rounded bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-bb-gold">
            <Smile className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-display text-3xl sm:text-4xl uppercase tracking-wide text-white">
              NO MEMES YET
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
              The Season 10 community meme vault is open. Fresh fan reactions and arena punchlines will be featured as the season progresses.
            </p>
          </div>
          <button
            onClick={() => setUploadOpen(true)}
            className="px-6 py-2.5 rounded bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/15 text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-2"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Submit First Reaction</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {memes.map((meme) => (
            <div
              key={meme.id}
              className="editorial-card rounded-xl overflow-hidden border border-white/[0.08] flex flex-col justify-between"
            >
              <div className="aspect-square w-full bg-black overflow-hidden">
                <img
                  src={meme.imageUrl}
                  alt={meme.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 space-y-1">
                <h3 className="text-sm font-bold text-white">{meme.title}</h3>
                <span className="text-[10px] text-zinc-500 uppercase">By @{meme.username}</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
