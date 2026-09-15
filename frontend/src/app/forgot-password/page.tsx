"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { Mail, ArrowRight, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { api } from "../../lib/api";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await api.forgotPassword(email);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Unable to send password reset link. Please try again.");
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
              FORGOT PASSWORD
            </h1>

            <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
              Enter your email address to receive password recovery instructions.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded bg-team-red/10 border border-team-red/25 text-team-red text-xs font-semibold text-center flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="space-y-5">
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-300">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Recovery Request Received</span>
              </div>
              <p className="leading-relaxed">
                If an account exists for this email, you will receive a password reset link.
              </p>
              <p className="text-[11px] text-zinc-400 pt-1 border-t border-emerald-500/20">
                For security reasons, reset links expire after 30 minutes. Be sure to check your spam folder.
              </p>
            </div>

            <Link
              href="/login"
              className="w-full py-3.5 rounded bg-bb-gold hover:bg-bb-gold-light text-black font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>RETURN TO SIGN IN</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
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
              <span>{loading ? "SENDING REQUEST..." : "SEND RESET LINK"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Footer Link back to Login */}
        <div className="text-center pt-2 border-t border-white/[0.08]">
          <p className="text-xs text-zinc-400">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-white hover:text-bb-gold font-bold uppercase tracking-wider transition-colors"
            >
              SIGN IN
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[75vh] flex items-center justify-center text-white text-xs">
          Loading...
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
