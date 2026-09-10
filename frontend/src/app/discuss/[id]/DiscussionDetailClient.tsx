"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ThumbsUp,
  MessageSquare,
  Bookmark,
  Share2,
  Flag,
  Send,
} from "lucide-react";
import { Post, Comment } from "../../../types";
import { useAuth } from "../../../context/AuthContext";

export function DiscussionDetailClient({
  initialPost,
}: {
  initialPost: Post;
}) {
  const { user } = useAuth();
  const [post] = useState<Post>(initialPost);
  const [comments, setComments] = useState<Comment[]>(initialPost.comments || []);
  const [commentText, setCommentText] = useState("");
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialPost.likesCount);
  const [submitting, setSubmitting] = useState(false);

  const handleLike = () => {
    if (!liked) {
      setLiked(true);
      setLikesCount((c) => c + 1);
    } else {
      setLiked(false);
      setLikesCount((c) => Math.max(0, c - 1));
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);

    const newComment: Comment = {
      id: "com-" + Date.now(),
      postId: post.id,
      userId: user?.id || "anon",
      username: user?.username || "FanDebater",
      userAvatar: user?.avatarUrl || "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
      content: commentText.trim(),
      createdAt: new Date().toISOString(),
    };

    setComments([...comments, newComment]);
    setCommentText("");
    setSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Back Link */}
      <Link
        href="/discuss"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Discussions</span>
      </Link>

      {/* Main Debate Article */}
      <article className="editorial-panel rounded-xl p-6 sm:p-10 space-y-6 border border-white/[0.12]">
        
        {/* Author Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <img
              src={post.userAvatar || "https://api.dicebear.com/7.x/bottts/svg?seed=author"}
              alt={post.username}
              className="w-9 h-9 rounded-full border border-white/20"
            />
            <div>
              <span className="font-bold text-white text-sm block leading-none">{post.username}</span>
              <span className="text-[11px] text-zinc-400">Season 10 Fan</span>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded bg-white/[0.04] text-zinc-300 border border-white/10 text-[10px] font-bold uppercase tracking-wider">
            {post.category}
          </span>
        </div>

        {/* Title & Body */}
        <div className="space-y-4">
          <h1 className="font-display text-3xl sm:text-5xl uppercase tracking-tight text-white leading-tight">
            {post.title}
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed whitespace-pre-line font-normal">
            {post.description}
          </p>
        </div>

        {/* Actions Bar */}
        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 transition-colors ${
                liked ? "text-team-red font-bold" : "hover:text-white"
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${liked ? "fill-team-red text-team-red" : ""}`} />
              <span>{likesCount} Likes</span>
            </button>

            <span className="flex items-center gap-1.5 text-zinc-400">
              <MessageSquare className="w-4 h-4 text-bb-gold" />
              <span>{comments.length} Responses</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied!");
                }
              }}
              className="p-1.5 hover:text-white transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </article>

      {/* Comment Section */}
      <div className="editorial-panel rounded-xl p-6 sm:p-8 space-y-6 border border-white/[0.08]">
        <h2 className="font-display text-2xl uppercase tracking-wide text-white border-b border-white/[0.08] pb-3">
          Community Responses ({comments.length})
        </h2>

        {/* New Comment Box */}
        <form onSubmit={handleAddComment} className="space-y-3">
          <textarea
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add your counter-argument or fan reaction..."
            className="w-full p-3 rounded bg-black/40 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-white/30 resize-none font-sans"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !commentText.trim()}
              className="px-5 py-2 rounded bg-team-red hover:bg-team-red-dark disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post Reply</span>
            </button>
          </div>
        </form>

        {/* Comment Thread List */}
        <div className="space-y-4 pt-2">
          {comments.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-4">No comments yet. Start the conversation!</p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 rounded bg-white/[0.02] border border-white/[0.05] space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <img
                      src={comment.userAvatar}
                      alt={comment.username}
                      className="w-6 h-6 rounded-full border border-white/20"
                    />
                    <span className="font-bold text-white text-xs">{comment.username}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">Member</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
