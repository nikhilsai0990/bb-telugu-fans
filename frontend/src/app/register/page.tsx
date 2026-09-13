"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError("All fields are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const ok = await register(username, email, password);
      if (ok) {
        if (redirectUrl && redirectUrl.startsWith("/")) {
          window.location.href = redirectUrl;
          return;
        }
        router.push("/profile");
      }
    } catch (e: any) {
      setError(e.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-xl editorial-panel border border-white/[0.12] p-8">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-9 mx-auto flex items-center justify-center">
            <img
              src="/images/eye-symbol.webp"
              alt="BB10 Eye"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="font-display text-3xl uppercase tracking-wide text-white">
            Join The Community
          </h1>
          <p className="text-xs text-zinc-400">Create your independent fan profile</p>
        </div>

        {error && (
          <div className="p-3 rounded bg-team-red/10 border border-team-red/20 text-team-red text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Fan Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="TeluguSuperfan"
                className="w-full pl-9 pr-3 py-2.5 rounded bg-black/40 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded bg-black/40 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
              Password (Min. 6 chars)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded bg-black/40 border border-white/10 text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded bg-team-red hover:bg-team-red-dark text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
          >
            <span>{loading ? "Creating Account..." : "Create Account"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer */}
        <p className="text-xs text-zinc-400 text-center pt-2 border-t border-white/[0.08]">
          Already have an account?{" "}
          <Link href="/login" className="text-white hover:underline font-bold">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[75vh] flex items-center justify-center text-white text-xs">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
