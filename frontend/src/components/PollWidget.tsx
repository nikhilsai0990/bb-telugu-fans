"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Vote, CheckCircle, AlertCircle, Lock, LogIn, UserPlus } from "lucide-react";
import { Poll } from "../types";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export const PollWidget: React.FC<{ initialPoll: Poll | null }> = ({ initialPoll }) => {
  const { user, token } = useAuth();
  const [poll, setPoll] = useState<Poll | null>(initialPoll);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [votedContestantName, setVotedContestantName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!poll) return;

    // 1. Immediate sync check from localStorage
    const saved = typeof window !== "undefined" ? localStorage.getItem(`bb_voted_${poll.id}`) : null;
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

    // 2. Query backend voter status
    async function checkStatus() {
      try {
        if (!poll) return;
        const status = await api.getVoteStatus(poll.id, token || undefined);
        if (status.hasVoted) {
          setHasVoted(true);
          if (status.optionId) setSelectedOption(status.optionId);
          if (status.contestantName) {
            setVotedContestantName(status.contestantName);
          } else if (status.optionId) {
            const opt = poll.options.find((o) => o.id === status.optionId);
            if (opt) {
              setVotedContestantName(
                opt.text.replace(/Save\s*/i, "").replace(/\s*\([^)]*\)/i, "").trim()
              );
            }
          }
        } else if (user) {
          setHasVoted(false);
        }
      } catch (e) {
        console.error("Error checking vote status in widget:", e);
      }
    }
    checkStatus();
  }, [poll?.id, token, user]);

  if (!poll) return null;

  const selectedItem = poll.options.find((o) => o.id === selectedOption);

  const handleVote = async () => {
    if (!selectedOption || !poll || hasVoted) return;
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

  const returnUrl = typeof window !== "undefined" ? window.location.pathname : "/";

  return (
    <div className="editorial-panel rounded-xl p-6 sm:p-7 border border-white/[0.12] space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-bb-gold animate-pulse" />
            <span>OFFICIAL FAN BALLOT &bull; WEEK 1</span>
          </div>
          <h3 className="font-display text-3xl sm:text-4xl uppercase tracking-wide text-white leading-none">
            {poll.title}
          </h3>
          <p className="text-xs text-zinc-300 max-w-lg leading-relaxed pt-1">
            {poll.status === "CLOSED"
              ? "14 active housemates. Voting is currently closed."
              : "14 active housemates in the Season 10 house (Charan and Chaitra Rai eliminated). Cast your verified vote to save your favorite housemate (1 vote per user per day)."}
          </p>
        </div>

        <div className="flex-shrink-0 text-left sm:text-right">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block">
            Ballot Status
          </span>
          {poll.status === "CLOSED" ? (
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 inline-block mt-0.5">
              Voting Closed
            </span>
          ) : poll.totalVotes === 0 ? (
            <span className="text-xs font-bold uppercase tracking-wider text-bb-gold bg-bb-gold/10 px-2 py-0.5 rounded border border-bb-gold/20 inline-block mt-0.5">
              No Votes Yet &bull; Cast First Vote
            </span>
          ) : (
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 inline-block mt-0.5">
              {poll.totalVotes.toLocaleString()} Votes Recorded
            </span>
          )}
        </div>
      </div>

      {/* Authentication Prompt for Non-Logged-In Users */}
      {!user && (
        <div data-testid="auth-prompt" className="p-4 rounded-lg bg-zinc-900/90 border border-bb-gold/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-bb-gold font-bold text-xs uppercase tracking-wider">
              <Lock className="w-4 h-4 text-bb-gold flex-shrink-0" />
              <span>SIGN IN OR SIGN UP TO VOTE</span>
            </div>
            <p className="text-xs text-zinc-300">
              Voting requires a free account to ensure 1 vote per fan integrity.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href={`/login?redirect=${encodeURIComponent(returnUrl)}`}
              className="px-3.5 py-2 rounded font-bold text-xs uppercase tracking-wider bg-bb-gold text-black hover:bg-bb-gold-light transition-all flex items-center gap-1.5 shadow"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
            <Link
              href={`/register?redirect=${encodeURIComponent(returnUrl)}`}
              className="px-3.5 py-2 rounded font-bold text-xs uppercase tracking-wider bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/20 transition-all flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </Link>
          </div>
        </div>
      )}

      {/* Status Messages & Duplicate Vote Banner */}
      {hasVoted && (
        <div className="p-3.5 rounded-lg bg-emerald-950/40 border-2 border-emerald-500/50 flex items-start gap-3 text-emerald-300 shadow-md">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-display text-base uppercase tracking-wider text-emerald-300 font-bold">
              ✓ YOUR VOTE IS ALREADY CAST
            </div>
            <p className="text-xs text-zinc-200 font-medium">
              You voted for <span className="text-white font-bold">{votedContestantName || (selectedItem ? selectedItem.text.replace(/Save\s*/i, "").replace(/\s*\([^)]*\)/i, "").trim() : "your selected housemate")}</span>.
            </p>
          </div>
        </div>
      )}

      {!hasVoted && successMsg && (
        <div className="p-3.5 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-emerald-300 text-xs font-semibold">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-red-300 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Options List — 14 Active Nominated Housemates */}
      <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
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
              className={`group flex items-center justify-between p-3 rounded-lg border transition-all ${
                hasVoted || poll.status === "CLOSED"
                  ? "cursor-default bg-white/[0.02] border-white/[0.06]"
                  : isSelected
                  ? "bg-bb-gold/10 border-bb-gold ring-1 ring-bb-gold/40 cursor-pointer"
                  : "bg-[#13141B] border-white/[0.07] hover:border-white/[0.18] hover:bg-[#171822] cursor-pointer"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Contestant Thumbnail */}
                <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 border border-white/10 bg-black">
                  {option.imageUrl ? (
                    <img
                      src={option.imageUrl}
                      alt={cleanName}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-500">
                      BB
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-white group-hover:text-bb-gold transition-colors truncate">
                      {cleanName}
                    </span>
                    {isHighRisk && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40">
                        HIGH RISK ZONE (3)
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">
                    Nominated for Season 10 Eviction
                  </span>
                </div>
              </div>

              {/* Radio / Selection State */}
              <div className="flex-shrink-0 pl-3">
                {!hasVoted && poll.status !== "CLOSED" && (
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected
                        ? "border-bb-gold bg-bb-gold text-black"
                        : "border-white/20 group-hover:border-white/40"
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-black" />}
                  </div>
                )}
                {(hasVoted || poll.status === "CLOSED") && (
                  <span className="text-[11px] font-semibold text-zinc-400">
                    {poll.totalVotes === 0 ? "No Votes" : `${option.votesCount} votes`}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Voting Action CTA */}
      <div className="pt-2 border-t border-white/[0.08] space-y-3">
        {poll.status === "CLOSED" ? (
          <div className="space-y-2">
            <div className="p-3 rounded bg-amber-500/10 border border-amber-500/20 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Voting is currently closed
              </span>
            </div>
            <button
              disabled
              className="w-full py-3.5 rounded font-bold text-xs uppercase tracking-wider bg-white/[0.06] text-zinc-500 cursor-not-allowed border border-white/[0.08] flex items-center justify-center gap-2"
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
              className={`w-full py-3.5 rounded font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                !selectedOption || voting
                  ? "bg-white/[0.06] text-zinc-500 cursor-not-allowed border border-white/[0.08]"
                  : "bg-bb-gold hover:bg-bb-gold-light text-black shadow-md active:scale-[0.99]"
              }`}
            >
              <Vote className="w-4 h-4" />
              <span>
                {voting
                  ? "Recording Vote..."
                  : selectedItem
                  ? `Cast Vote to Save ${selectedItem.text.replace(/Save\s*/i, "").replace(/\s*\([^)]*\)/i, "").trim()}`
                  : "Select a Housemate to Cast Vote"}
              </span>
            </button>
          ) : (
            <Link
              href={`/login?redirect=${encodeURIComponent(returnUrl)}`}
              className="w-full py-3.5 rounded font-bold text-xs uppercase tracking-wider bg-bb-gold hover:bg-bb-gold-light text-black flex items-center justify-center gap-2 shadow-md"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Cast Your Vote</span>
            </Link>
          )
        ) : (
          <button
            disabled
            className="w-full py-3.5 rounded font-bold text-xs uppercase tracking-wider bg-white/[0.06] text-zinc-500 cursor-not-allowed border border-white/[0.08] flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4 text-zinc-500" />
            <span>VOTE ALREADY SUBMITTED</span>
          </button>
        )}

        {/* Live Results Section Below Contestant Selection */}
        {(hasVoted || poll.status === "CLOSED") && (
          <div className="pt-4 border-t border-white/[0.08] space-y-3" data-testid="live-vote-results">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                LIVE VOTE RESULTS
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">
                {poll.totalVotes.toLocaleString()} Votes
              </span>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {poll.options.map((option) => {
                const contestantName = option.text
                  .replace(/Save\s*/i, "")
                  .replace(/\s*\(RED TEAM\)/i, "")
                  .replace(/\s*\(BLUE TEAM\)/i, "")
                  .replace(/\s*\([^)]*\)/i, "")
                  .trim();
                const votes = option.votesCount || 0;
                const percentage = poll.totalVotes > 0 ? ((votes / poll.totalVotes) * 100).toFixed(1) : "0.0";
                const isVotedChoice =
                  (votedContestantName && contestantName.toLowerCase() === votedContestantName.toLowerCase()) ||
                  selectedOption === option.id;

                return (
                  <div
                    key={option.id}
                    className={`p-2.5 rounded border text-xs ${
                      isVotedChoice
                        ? "bg-white/[0.05] border-emerald-500/50 ring-1 ring-emerald-500/30"
                        : "bg-white/[0.02] border-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-white uppercase truncate">
                          {contestantName}
                        </span>
                        {isVotedChoice && (
                          <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                            YOUR VOTE
                          </span>
                        )}
                      </div>
                      <div className="text-right flex items-center gap-2 flex-shrink-0">
                        <span className="font-display font-bold uppercase text-bb-gold">
                          {votes} {votes === 1 ? "VOTE" : "VOTES"}
                        </span>
                        <span className="font-mono text-[10px] text-zinc-400">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isVotedChoice ? "bg-emerald-400" : "bg-bb-gold"
                        }`}
                        style={{ width: `${Math.max(parseFloat(percentage), votes > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] text-zinc-400">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-zinc-400" />
            Verified Fan Ballot &bull; 1 Vote per User Limit
          </span>
          <Link href="/polls" className="text-bb-gold hover:underline font-bold uppercase tracking-wider">
            Full Ballot View &rarr;
          </Link>
        </div>
      </div>

    </div>
  );
};
