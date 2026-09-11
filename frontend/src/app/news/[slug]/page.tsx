import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageSquare, AlertCircle, CheckCircle, Vote } from "lucide-react";
import { api } from "../../../lib/api";

export default async function NewsDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await api.getNewsArticle(params.slug);
  if (!article) notFound();

  const isHighZone = article.slug.includes("high-zone") || article.slug.includes("high-risk");

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Navigation */}
      <Link
        href="/news"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dispatches</span>
      </Link>

      {/* Article Header */}
      <div className="space-y-4 border-b border-white/[0.08] pb-6">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          <span className="px-2 py-0.5 rounded bg-white/[0.06] text-white border border-white/10">
            {article.category}
          </span>
          <span>&bull;</span>
          <span className="text-bb-gold">Official Season 10 Dispatch</span>
        </div>

        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-white leading-tight">
          {article.title}
        </h1>

        {isHighZone && (
          <div className="p-3.5 rounded bg-amber-500/10 border border-amber-500/25 flex items-center gap-2 text-xs text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Crucial High Risk Zone Notice:</strong> Aman, Sudheer Kumar Reddy, and Varshini Sounderajan are the 3 contestants in the HIGH RISK ZONE. <em>&quot;High Risk Zone&quot; does NOT mean elimination.</em> All three are ACTIVE housemates, none is eliminated, and all are nominated! Auto Ram Prasad, Mukesh Gowda, Charan, and Chaitra Rai are NOT in the High Risk Zone.
            </span>
          </div>
        )}
      </div>

      {/* Featured Media */}
      <div className="rounded-xl overflow-hidden border border-white/[0.1] aspect-[16/10] sm:aspect-[3/2] w-full bg-black">
        <img
          src={article.imageUrl || (isHighZone ? "/images/contestants/aman.webp" : "/images/contestants/debjani-modak.webp")}
          alt={article.title}
          className="w-full h-full object-cover object-[center_20%]"
        />
      </div>

      {/* Content Body */}
      <div className="editorial-panel rounded-xl p-6 sm:p-10 border border-white/[0.08] space-y-6 text-zinc-300 text-base sm:text-lg leading-relaxed whitespace-pre-line">
        <p className="font-medium text-white text-lg sm:text-xl border-l-2 border-bb-gold pl-4 leading-relaxed">
          {article.summary}
        </p>
        <div className="space-y-4 pt-2 text-zinc-300 font-normal leading-relaxed">
          {article.content}
        </div>
      </div>

      {/* Next Actions CTA */}
      <div className="editorial-panel p-6 rounded-xl border border-white/[0.1] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="font-display text-2xl uppercase tracking-wide text-white">
            Have your say in the official ballot
          </h2>
          <p className="text-xs text-zinc-400">14 active housemates are nominated (Charan and Chaitra Rai eliminated). Cast your verified vote now (1 vote per authenticated user per day).</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/polls"
            className="px-6 py-3 rounded bg-bb-gold hover:bg-bb-gold-light text-black font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
          >
            <Vote className="w-4 h-4" />
            <span>Cast Ballot</span>
          </Link>
          <Link
            href="/discuss"
            className="px-6 py-3 rounded bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4 text-zinc-400" />
            <span>Debate</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
