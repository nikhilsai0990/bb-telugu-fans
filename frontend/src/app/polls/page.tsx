"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Vote, CheckCircle, AlertCircle, ShieldCheck, Lock, LogIn, UserPlus } from "lucide-react";
import { Poll } from "../../types";
import { api, fallbackPolls } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function PollsPage() {
  const { user, token } = useAuth();
  const [poll, setPoll] = useState<Poll | null>(fallbackPolls[0] || null);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedContestantName, setVotedContestantName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    // 1. Immediate sync check from localStorage
    const saved = typeof window !== "undefined" ? localStorage.getItem("bb_voted_poll-eviction-01") : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHasVoted(true);
        if (parsed.optionId) setSelectedOption(parsed.optionId);
        if (parsed.contestantName) setVotedContestantName(parsed.contestantName);
      } catch (_) {
        setHasVoted(true);
      }
    }

    // 2. Fetch fresh poll data and verify voter status against backend
    async function load() {
      try {
        const data = await api.getPolls();
        const currentPoll = data && data.length > 0 ? data[0] : fallbackPolls[0];
        if (currentPoll) {
          setPoll(currentPoll);
          const status = await api.getVoteStatus(currentPoll.id, token || undefined);
          if (status.hasVoted) {
            setHasVoted(true);
            if (status.optionId) setSelectedOption(status.optionId);
            if (status.contestantName) {
              setVotedContestantName(status.contestantName);
            } else if (status.optionId) {
              const opt = currentPoll.options.find((o) => o.id === status.optionId);
              if (opt) {
                setVotedContestantName(
                  opt.text.replace(/Save\s*/i, "").replace(/\s*\([^)]*\)/i, "").trim()
                );
              }
            }
          } else if (user) {
            setHasVoted(false);
            setSelectedOption(null);
            setVotedContestantName(null);
            if (typeof window !== "undefined") {
              localStorage.removeItem("bb_voted_poll-eviction-01");
              localStorage.removeItem(`bb_voted_${currentPoll.id}`);
            }
          }
        }
      } catch (e) {
        console.error("Error loading poll:", e);
      }
    }
    load();
  }, [token, user]);

  const selectedItem = poll?.options.find((o) => o.id === selectedOption);

  const handleVote = async () => {
    if (!poll || !selectedOption || hasVoted) return;
    if (!user) {
      setErrorMsg("Authentication required to cast a vote. Please sign in or register.");
      return;
    }
    setVoting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.vote(poll.id, selectedOption, token || undefined);
      setHasVoted(true);
      const chosenName =
        res.contestantName ||
        (selectedItem
          ? selectedItem.text.replace(/Save\s*/i, "").replace(/\s*\([^)]*\)/i, "").trim()
          : "your selected housemate");
      setVotedContestantName(chosenName);
      setSuccessMsg(res.message || "Your verified vote has been recorded securely.");
      if (res.poll) {
        setPoll(res.poll);
      } else if (res.options) {
        setPoll((prev) => (prev ? { ...prev, totalVotes: res.totalVotes, options: res.options } : null));
      }
    } catch (err: any) {
      if (err.message?.includes("ALREADY_VOTED") || err.error === "ALREADY_VOTED") {
        setHasVoted(true);
        const status = await api.getVoteStatus(poll.id, token || undefined);
        if (status.contestantName) {
          setVotedContestantName(status.contestantName);
        }
      } else {
        setErrorMsg(err.message || "Failed to submit vote. Please try again.");
      }
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      
      {/* Editorial Header */}
      <div className="space-y-3 border-b border-white/[0.08] pb-6">
        <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-bb-gold animate-pulse" />
          <span>OFFICIAL FAN BALLOT &bull; WEEK 1</span>
        </div>
        <h1 className="font-display text-4xl sm:text-6xl uppercase tracking-tight text-white leading-none">
          WHO SHOULD BE SAVED?
        </h1>
        <p className="text-sm text-zinc-300 max-w-2xl leading-relaxed">
          14 active Bigg Boss Telugu Season 10 housemates (Charan and Chaitra Rai eliminated). Select your choice below and submit your verified fan vote (1 vote per authenticated account).
        </p>
      </div>

      {/* Authentication Prompt for Non-Logged-In Users */}
      {!user && (
        <div data-testid="auth-prompt" className="p-4 sm:p-5 rounded-lg bg-zinc-900/90 border border-bb-gold/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-bb-gold font-bold text-sm uppercase tracking-wider">
              <Lock className="w-4 h-4 text-bb-gold flex-shrink-0" />
              <span>SIGN IN OR SIGN UP TO VOTE</span>
            </div>
            <p className="text-xs text-zinc-300">
              Voting requires a verified account. Sign in or create a free account to cast your 1 vote per day.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href="/login?redirect=/polls"
              className="px-4 py-2 rounded font-bold text-xs uppercase tracking-wider bg-bb-gold text-black hover:bg-bb-gold-light transition-all flex items-center gap-1.5 shadow"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
            <Link
              href="/register?redirect=/polls"
              className="px-4 py-2 rounded font-bold text-xs uppercase tracking-wider bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/20 transition-all flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Sign Up</span>
            </Link>
          </div>
        </div>
      )}

      {/* Ballot Container */}
      {loading ? (
        <div className="editorial-panel rounded-xl p-10 space-y-4 animate-pulse">
          <div className="h-8 bg-white/10 rounded w-1/3" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(14)].map((_, i) => (
              <div key={i} className="h-28 bg-white/[0.04] rounded" />
            ))}
          </div>
        </div>
      ) : !poll ? (
        <div className="editorial-panel rounded-xl p-12 text-center space-y-2">
          <p className="font-display text-2xl text-white uppercase">Ballot Loading...</p>
          <p className="text-xs text-zinc-400">Please refresh the page</p>
        </div>
      ) : (
        <div className="editorial-panel rounded-xl p-6 sm:p-8 border border-white/[0.12] space-y-8">
          
          {/* Ballot Meta Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                14 Active Housemates
              </span>
              <span className="text-zinc-600">&bull;</span>
              <span className="text-xs font-bold uppercase tracking-wider text-bb-gold">
                Charan &amp; Chaitra Rai Eliminated
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              {poll.totalVotes === 0 ? (
                <span className="text-bb-gold bg-bb-gold/10 px-3 py-1 rounded border border-bb-gold/25">
                  NO VOTES YET &bull; CAST YOUR VOTE
                </span>
              ) : (
                <span className="text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/25">
                  {poll.totalVotes.toLocaleString()} Verified Votes
                </span>
              )}
            </div>
          </div>

          {/* Messages & Duplicate Vote Banner */}
          {hasVoted && (
            <div className="p-4 sm:p-5 rounded-lg bg-emerald-950/40 border-2 border-emerald-500/50 flex items-start gap-3.5 text-emerald-300 shadow-md">
              <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-display text-lg sm:text-xl uppercase tracking-wider text-emerald-300 font-bold">
                  ✓ YOUR VOTE IS ALREADY CAST
                </div>
                <p className="text-sm text-zinc-200 font-medium">
                  You voted for <span className="text-white font-bold">{votedContestantName || (selectedItem ? selectedItem.text.replace(/Save\s*/i, "").replace(/\s*\([^)]*\)/i, "").trim() : "your selected housemate")}</span>.
                </p>
              </div>
            </div>
          )}

          {!hasVoted && successMsg && (
            <div className="p-4 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-sm font-semibold">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-300 text-sm font-semibold">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 14-Candidate Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {poll.options.map((option) => {
              const isSelected = selectedOption === option.id;
              const isHighRisk =
                option.zone === "HIGH_RISK" ||
                option.isHighRiskZone ||
                option.contestantId === "c-12" ||
                option.contestantId === "c-09" ||
                option.contestantId === "c-06" ||
                option.text.toLowerCase().includes("aman") ||
                option.text.toLowerCase().includes("sudheer") ||
                option.text.toLowerCase().includes("varshini");

              const cleanName = option.text
                .replace(/Save\s*/i, "")
                .replace(/\s*\(RED TEAM\)/i, "")
                .replace(/\s*\(BLUE TEAM\)/i, "")
                .replace(/\s*\([^)]*\)/i, "")
                .trim();

              return (
                <div
                  key={option.id}
                  onClick={() => !hasVoted && poll.status !== "CLOSED" && setSelectedOption(option.id)}
                  className={`group relative p-3.5 rounded-lg border transition-all flex flex-col justify-between min-h-[115px] ${
                    hasVoted || poll.status === "CLOSED"
                      ? "cursor-default bg-white/[0.02] border-white/[0.06]"
                      : isSelected
                      ? "bg-bb-gold/10 border-bb-gold ring-1 ring-bb-gold cursor-pointer"
                      : "bg-[#13141B] border-white/[0.07] hover:border-white/20 hover:bg-[#181923] cursor-pointer"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Real Avatar */}
                    <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0 border border-white/10 bg-black">
                      {option.imageUrl ? (
                        <img
                          src={option.imageUrl}
                          alt={cleanName}
                          className="w-full h-full object-cover object-top"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-xs text-zinc-500">
                          BB
                        </div>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-xl uppercase tracking-wide text-white group-hover:text-bb-gold transition-colors leading-tight truncate">
                        {cleanName}
                      </h3>
                      {isHighRisk && (
                        <span className="text-[9px] font-bold text-amber-300 uppercase block mt-0.5">
                          HIGH RISK ZONE (3)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Radio Selector */}
                  <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between mt-2">
                    <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                      {hasVoted || poll.status === "CLOSED" ? `${option.votesCount || 0} Votes` : "Select Housemate"}
                    </span>
                    {!hasVoted && poll.status !== "CLOSED" && (
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected
                            ? "border-bb-gold bg-bb-gold text-black"
                            : "border-white/20 group-hover:border-white/40"
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Voting Action Section */}
          <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-bb-gold flex-shrink-0" />
              <span>{poll.status === "CLOSED" ? "Voting is currently closed." : "Verified fan authentication active. 1 vote per user per day enforced."}</span>
            </div>

            {poll.status === "CLOSED" ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5 px-3 py-2 rounded bg-amber-500/10 border border-amber-500/20">
                  <Lock className="w-3.5 h-3.5" /> Voting is currently closed
                </span>
                <button
                  disabled
                  className="px-8 py-3.5 rounded font-bold text-xs uppercase tracking-wider bg-white/[0.06] text-zinc-500 cursor-not-allowed border border-white/[0.08] flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4 text-zinc-500" />
                  <span>Voting is Currently Closed</span>
                </button>
              </div>
            ) : !hasVoted ? (
              user ? (
                <button
                  onClick={handleVote}
                  disabled={!selectedOption || voting}
                  className={`px-8 py-3.5 rounded font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    !selectedOption || voting
                      ? "bg-white/[0.06] text-zinc-500 cursor-not-allowed border border-white/[0.08]"
                      : "bg-bb-gold hover:bg-bb-gold-light text-black shadow-lg active:scale-[0.99]"
                  }`}
                >
                  <Vote className="w-4 h-4" />
                  <span>
                    {voting
                      ? "Submitting Vote..."
                      : selectedItem
                      ? `Vote to Save ${selectedItem.text.replace(/Save\s*/i, "").replace(/\s*\([^)]*\)/i, "").trim()}`
                      : "Select a Housemate to Vote"}
                  </span>
                </button>
              ) : (
                <Link
                  href="/login?redirect=/polls"
                  className="px-8 py-3.5 rounded font-bold text-xs uppercase tracking-wider bg-bb-gold hover:bg-bb-gold-light text-black shadow-lg flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Cast Vote</span>
                </Link>
              )
            ) : (
              <button
                disabled
                className="px-8 py-3.5 rounded font-bold text-xs uppercase tracking-wider bg-white/[0.06] text-zinc-500 cursor-not-allowed border border-white/[0.08] flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4 text-zinc-500" />
                <span>VOTE ALREADY SUBMITTED</span>
              </button>
            )}
          </div>

          {/* Live Vote Results Section Below Contestant Selection Area */}
          <div className="pt-8 border-t border-white/[0.12] space-y-6" data-testid="live-vote-results">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
              <div>
                <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>REAL-TIME AUDIT</span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl uppercase tracking-tight text-white mt-1">
                  LIVE VOTE RESULTS
                </h2>
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Total Verified Votes: <span className="text-white font-mono text-sm">{poll.totalVotes.toLocaleString()}</span>
              </div>
            </div>

            {/* All 14 Active Contestants with Name and Votes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {poll.options.map((option) => {
                const contestantName = option.text
                  .replace(/Save\s*/i, "")
                  .replace(/\s*\(RED TEAM\)/i, "")
                  .replace(/\s*\(BLUE TEAM\)/i, "")
                  .replace(/\s*\([^)]*\)/i, "")
                  .trim();
                const votes = option.votesCount || 0;
                const percentage = poll.totalVotes > 0 ? ((votes / poll.totalVotes) * 100).toFixed(1) : "0.0";
                const isVotedChoice = Boolean(
                  hasVoted &&
                    ((votedContestantName && contestantName.toLowerCase() === votedContestantName.toLowerCase()) ||
                      selectedOption === option.id)
                );

                return (
                  <div
                    key={option.id}
                    className={`p-3.5 rounded-lg border transition-all flex flex-col justify-between min-h-[110px] ${
                      isVotedChoice
                        ? "bg-white/[0.05] border-emerald-500/50 ring-1 ring-emerald-500/30"
                        : "bg-[#13141B] border-white/[0.07]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                          Contestant
                        </span>
                        {isVotedChoice && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                            YOUR VOTE
                          </span>
                        )}
                      </div>

                      <h3 className="font-display text-xl uppercase tracking-wide text-white leading-tight mt-2 truncate">
                        {contestantName}
                      </h3>
                    </div>

                    <div className="pt-2 border-t border-white/[0.05] mt-2 space-y-1.5">
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="font-display text-sm font-bold uppercase tracking-wider text-bb-gold">
                          {votes} {votes === 1 ? "VOTE" : "VOTES"}
                        </span>
                        <span className="font-mono text-[11px] text-zinc-400 font-semibold">
                          {percentage}%
                        </span>
                      </div>
                      <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isVotedChoice ? "bg-emerald-400" : "bg-bb-gold"
                          }`}
                          style={{ width: `${votes > 0 && poll.totalVotes > 0 ? Math.max(parseFloat(percentage), 4) : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
