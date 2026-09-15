"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import { api } from "../../lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Password reset token is missing. Please request a new link.");
      return;
    }
    if (!newPassword || !confirmPassword) {
      setError("Please fill in all password fields.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters in length.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please ensure both fields match.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. The link may be expired or already used.");
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
              RESET PASSWORD
            </h1>

            <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
              Create a new secure password for your Bigg Boss Telugu Fans account.
            </p>
          </div>
        </div>

        {!token && (
          <div className="p-4 rounded-lg bg-team-red/10 border border-team-red/30 text-team-red text-xs space-y-3">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Missing Reset Token</span>
            </div>
            <p className="leading-relaxed">
              No password reset token was provided in the URL. Please use the reset link sent to your email or request a new one below.
            </p>
            <Link
              href="/forgot-password"
              className="inline-block px-4 py-2 rounded bg-team-red text-white font-bold uppercase tracking-wider text-[11px]"
            >
              Request New Link
            </Link>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded bg-team-red/10 border border-team-red/25 text-team-red text-xs font-semibold text-center flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-5">
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-300">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Password Reset Successful</span>
              </div>
              <p className="leading-relaxed">
                Password has been successfully reset. You can now sign in with your new password.
              </p>
            </div>

            <Link
              href="/login"
              className="w-full py-3.5 rounded bg-bb-gold hover:bg-bb-gold-light text-black font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <span>PROCEED TO SIGN IN</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          token && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  NEW PASSWORD
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-3.5 py-3 rounded bg-black/50 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  CONFIRM NEW PASSWORD
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-3.5 py-3 rounded bg-black/50 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded bg-team-red hover:bg-team-red-dark text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <span>{loading ? "UPDATING PASSWORD..." : "RESET PASSWORD"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )
        )}

        {/* Footer Link back to Login */}
        <div className="text-center pt-2 border-t border-white/[0.08]">
          <p className="text-xs text-zinc-400">
            Remember your credentials?{" "}
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[75vh] flex items-center justify-center text-white text-xs">
          Loading...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
