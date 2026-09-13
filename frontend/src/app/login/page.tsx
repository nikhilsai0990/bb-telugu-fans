"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email address and password.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const ok = await login(email, password);
      if (ok) {
        const savedUserStr = localStorage.getItem("bb_auth_user");
        if (savedUserStr) {
          try {
            const u = JSON.parse(savedUserStr);
            if (u.role === "ADMIN" || u.role === "MODERATOR") {
              router.push("/admin");
              return;
            }
          } catch (_) {}
        }
        if (redirectUrl && redirectUrl.startsWith("/")) {
          window.location.href = redirectUrl;
          return;
        }
        router.push("/profile");
      }
    } catch (e: any) {
      setError(e.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-xl editorial-panel border border-white/[0.12] p-8 sm:p-10 shadow-2xl">
        
        {/* Brand Header with Bigg Boss Logo */}
        <div className="text-center space-y-2.5">
          <div className="w-14 h-10 mx-auto flex items-center justify-center">
            <img
              src="/images/eye-symbol.webp"
              alt="Bigg Boss Telugu 10"
              className="w-auto h-8 object-contain drop-shadow"
            />
          </div>
          
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 leading-none">
              <span className="font-display text-2xl tracking-wider text-white">
                BB TELUGU
              </span>
              <span className="font-display text-2xl tracking-wider text-bb-gold">
                FANS
              </span>
            </div>
            
            <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-tight text-white pt-1">
              SIGN IN
            </h1>
            
            <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
              Access your fan profile, votes and discussions.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded bg-team-red/10 border border-team-red/25 text-team-red text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {/* Clean Fan Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              EMAIL ADDRESS
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full pl-10 pr-3.5 py-3 rounded bg-black/50 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              PASSWORD
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-3.5 py-3 rounded bg-black/50 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded bg-team-red hover:bg-team-red-dark text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <span>{loading ? "AUTHENTICATING..." : "SIGN IN"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer: Create Account Link */}
        <div className="text-center pt-2 border-t border-white/[0.08]">
          <p className="text-xs text-zinc-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-white hover:text-bb-gold font-bold uppercase tracking-wider transition-colors">
              CREATE ACCOUNT
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[75vh] flex items-center justify-center text-white text-xs">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
