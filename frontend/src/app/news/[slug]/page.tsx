import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageSquare, AlertCircle, CheckCircle, Vote, Crown } from "lucide-react";
import { api } from "../../../lib/api";

export default async function NewsDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await api.getNewsArticle(params.slug);
  if (!article) notFound();

  const isHighZone = article.slug.includes("high-zone") || article.slug.includes("high-risk");
  const isCaptaincy =
    article.slug.includes("captaincy-contenders") ||
    article.title.toLowerCase().includes("captaincy contenders");

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
      {!isCaptaincy && (
        <div className="rounded-xl overflow-hidden border border-white/[0.1] aspect-[16/10] sm:aspect-[3/2] w-full bg-black">
          <img
            src={article.imageUrl || (isHighZone ? "/images/contestants/aman.webp" : "/images/contestants/debjani-modak.webp")}
            alt={article.title}
            className="w-full h-full object-cover object-[center_20%]"
          />
        </div>
      )}

      {/* Captaincy 8-Contenders Showcase */}
      {isCaptaincy && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-bb-gold border-b border-white/10 pb-2">
            <Crown className="w-5 h-5 text-bb-gold" />
            <h2 className="font-display text-xl sm:text-2xl uppercase tracking-wide text-white">
              8 Audience-Selected Captaincy Contenders
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
            {[
              { name: "Thrigun", image: "/images/contestants/thrigun.webp", slug: "thrigun" },
              { name: "Singer Jhansi", image: "/images/contestants/singer-jhansi.webp", slug: "singer-jhansi" },
              { name: "Aman", image: "/images/contestants/aman.webp", slug: "aman" },
              { name: "Shalini", image: "/images/contestants/shalini.webp", slug: "shalini" },
              { name: "Mukesh Gowda", image: "/images/contestants/mukesh-gowda.webp", slug: "mukesh-gowda" },
              { name: "Debjani Modak", image: "/images/contestants/debjani-modak.webp", slug: "debjani-modak" },
              { name: "Auto Ram Prasad", image: "/images/contestants/auto-ram-prasad.webp", slug: "auto-ram-prasad" },
              { name: "Rohit Naidu", image: "/images/contestants/rohit-naidu.webp", slug: "rohit-naidu" },
            ].map((c) => (
              <Link
                key={c.slug}
                href={`/contestants/${c.slug}`}
                className="group relative rounded-lg overflow-hidden border border-white/10 hover:border-bb-gold/60 transition-all bg-black flex flex-col"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-black">
                  <img
                    src={c.image}
                    alt={c.name}
                    className="w-full h-full object-cover object-top filter brightness-95 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-bb-gold text-black text-[9px] font-black uppercase tracking-wider shadow">
                    CONTENDER
                  </span>
                </div>
                <div className="p-2.5 bg-[#14151D] text-center border-t border-white/10">
                  <h4 className="font-display text-sm uppercase tracking-wide text-white group-hover:text-bb-gold transition-colors truncate">
                    {c.name}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

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
