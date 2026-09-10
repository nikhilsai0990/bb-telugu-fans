"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Lock, User, ArrowRight } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, logout } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError("Please enter your administrator username/email and password.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const ok = await login(identifier, password);
      if (ok) {
        const savedUserStr = localStorage.getItem("bb_auth_user");
        if (savedUserStr) {
          const u = JSON.parse(savedUserStr);
          if (u.role === "ADMIN" || u.role === "MODERATOR") {
            router.push("/admin");
            return;
          }
        }
        logout();
        setError("Access Denied: This console requires administrator privileges.");
      }
    } catch (e: any) {
      setError(e.message || "Authentication failed. Invalid administrator credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-xl editorial-panel border border-bb-gold/30 p-8 sm:p-10 shadow-2xl bg-[#0B0C10]">
        
        {/* Admin Header */}
        <div className="text-center space-y-2.5">
          <div className="w-12 h-12 mx-auto rounded-full bg-bb-gold/10 border border-bb-gold/30 flex items-center justify-center text-bb-gold">
            <Shield className="w-6 h-6" />
          </div>
          
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-bb-gold">
              Security Clearance Required
            </span>
            <h1 className="font-display text-3xl uppercase tracking-tight text-white">
              ADMIN CONSOLE
            </h1>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
              Authorized administrator sign in for Bigg Boss Telugu platform operations.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded bg-team-red/10 border border-team-red/25 text-team-red text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {/* Secure Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              ADMINISTRATOR IDENTIFIER
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Username or email"
                required
                className="w-full pl-10 pr-3.5 py-3 rounded bg-black/60 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-bb-gold/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
              SECURITY PASSPHRASE
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-3.5 py-3 rounded bg-black/60 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-bb-gold/50 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded bg-bb-gold hover:bg-bb-gold/90 text-black font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <span>{loading ? "AUTHENTICATING CONSOLE..." : "AUTHENTICATE CONSOLE"}</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        </form>

        {/* Return Link */}
        <div className="text-center pt-2 border-t border-white/[0.08]">
          <Link href="/login" className="text-xs text-zinc-400 hover:text-white transition-colors">
            Return to Fan Sign In &rarr;
          </Link>
        </div>

      </div>
    </div>
  );
}