import React from "react";
import Link from "next/link";
import { ShieldCheck, Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#08090C] mt-20 pb-24 md:pb-12 pt-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Identity */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/images/eye-symbol.webp"
                alt="BB10 Eye"
                className="h-6 w-auto object-contain"
              />
              <span className="font-display text-2xl tracking-wider text-white">
                BB TELUGU <span className="text-bb-gold">S10</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md leading-relaxed">
              The definitive independent digital destination for Bigg Boss Telugu Season 10. 
              Real-time verified polls, faction analysis, editorial dispatches, and passionate fan debates.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/[0.04] border border-white/[0.08] text-[11px] font-semibold text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-bb-gold" />
              <span>Season 10 &bull; Red vs Blue Campaign</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Navigation</h4>
            <ul className="space-y-2 text-xs font-semibold text-zinc-400">
              <li>
                <Link href="/contestants" className="hover:text-white transition-colors">
                  Contestant Roster (16)
                </Link>
              </li>
              <li>
                <Link href="/polls" className="hover:text-white transition-colors">
                  Save Poll (Week 1)
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-white transition-colors">
                  Dispatches & News
                </Link>
              </li>
              <li>
                <Link href="/memes" className="hover:text-white transition-colors">
                  Meme Vault
                </Link>
              </li>
              <li>
                <Link href="/discuss" className="hover:text-white transition-colors">
                  Fan Salon & Debates
                </Link>
              </li>
            </ul>
          </div>

          {/* Integrity & Rules */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400">Integrity</h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-bb-gold" />
                Anti-Abuse Rate Limits
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-bb-gold" />
                Device-Verified Ballot
              </li>
              <li>Community Standards</li>
              <li>Zero Fake Vote Counts</li>
            </ul>
          </div>

        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 border-t border-white/[0.08] space-y-4 text-center">
          <p className="text-xs text-zinc-400 max-w-3xl mx-auto bg-white/[0.02] p-3.5 rounded border border-white/[0.06] leading-relaxed">
            <strong className="text-white">Disclaimer:</strong> BB Telugu Fans is an independent fan community and is not affiliated with or endorsed by Bigg Boss, Star Maa, Endemol Shine India, or the show&apos;s producers. All trademarks, character names, and logos belong to their respective copyright holders.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-zinc-400">
            <span>&copy; {new Date().getFullYear()} BB Telugu Fans. Independent fan media.</span>
            <span className="hidden sm:inline">&bull;</span>
            <span>Crafted for Bigg Boss Telugu Superfans worldwide</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
