"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import {
  Flame,
  Users,
  Vote,
  Newspaper,
  Smile,
  MessageSquare,
  Search,
  Shield,
  Menu,
  X,
  LogOut,
  ChevronRight,
} from "lucide-react";

export const Navbar = () => {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navLinks = [
    { href: "/", label: "Home", icon: Flame },
    { href: "/contestants", label: "Contestants", icon: Users },
    { href: "/polls", label: "Polls", icon: Vote },
    { href: "/news", label: "News", icon: Newspaper },
    { href: "/memes", label: "Memes", icon: Smile },
    { href: "/discuss", label: "Discuss", icon: MessageSquare },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#08090C]/95 backdrop-blur-md border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-3 group focus:outline-none">
              <div className="w-10 h-8 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <img
                  src="/images/eye-symbol.webp"
                  alt="Bigg Boss Telugu 10"
                  className="w-auto h-7 object-contain drop-shadow"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-display text-xl sm:text-2xl tracking-wider text-white">
                    BB TELUGU
                  </span>
                  <span className="font-display text-xl sm:text-2xl tracking-wider text-bb-gold">
                    S10
                  </span>
                </div>
                <span className="text-[10px] font-semibold tracking-widest uppercase text-zinc-400 mt-0.5">
                  Independent Fan Hub
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2" aria-label="Main Navigation">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-3.5 py-2 text-xs uppercase tracking-wider font-semibold transition-colors duration-150 ${
                      isActive ? "text-white" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-bb-gold" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Search Trigger */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-zinc-400 hover:text-white transition-colors rounded-md hover:bg-white/[0.04]"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>

              {user ? (
                <div className="flex items-center gap-3 pl-2 border-l border-white/[0.08]">
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-zinc-800 text-zinc-200 border border-white/10 hover:border-white/20 transition-colors"
                    >
                      <Shield className="w-3 h-3 text-bb-gold" />
                      Admin
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 py-1 px-2 rounded hover:bg-white/[0.04] transition-colors"
                  >
                    <img
                      src={user.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=user"}
                      alt={user.username}
                      className="w-6 h-6 rounded-full border border-white/20"
                    />
                    <span className="text-xs font-semibold text-zinc-200 max-w-[100px] truncate">
                      {user.username}
                    </span>
                  </Link>
                  <button
                    onClick={logout}
                    className="p-1.5 text-zinc-400 hover:text-team-red transition-colors"
                    title="Sign Out"
                    aria-label="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 pl-2 border-l border-white/[0.08]">
                  <Link
                    href="/login"
                    className="text-xs font-semibold uppercase tracking-wider px-3 py-1.5 text-zinc-300 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded bg-team-red hover:bg-team-red-dark text-white transition-colors"
                  >
                    Join
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex sm:hidden items-center gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-zinc-400 hover:text-white"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 text-zinc-300 hover:text-white focus:outline-none"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="sm:hidden bg-[#0A0B0F] border-b border-white/[0.08] px-4 pt-2 pb-5 space-y-2">
            <div className="space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded text-sm font-semibold tracking-wide ${
                      isActive
                        ? "bg-white/[0.08] text-white border-l-2 border-bb-gold"
                        : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? "text-bb-gold" : "text-zinc-500"}`} />
                      <span>{link.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600" />
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-white/[0.08]">
              {user ? (
                <div className="flex items-center justify-between pt-1 px-1">
                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5"
                  >
                    <img
                      src={user.avatarUrl || "https://api.dicebear.com/7.x/bottts/svg?seed=user"}
                      alt={user.username}
                      className="w-7 h-7 rounded-full border border-white/20"
                    />
                    <span className="text-sm font-semibold text-white">{user.username}</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="text-xs font-semibold text-zinc-400 hover:text-team-red"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="text-center py-2 text-xs font-semibold uppercase tracking-wider text-zinc-200 bg-white/[0.04] rounded hover:bg-white/[0.08]"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="text-center py-2 text-xs font-bold uppercase tracking-wider text-white bg-team-red rounded hover:bg-team-red-dark"
                  >
                    Join Hub
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Global Quick Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
          <div className="w-full max-w-xl bg-[#121319] border border-white/15 rounded-lg shadow-2xl p-4 space-y-4">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <Search className="w-5 h-5 text-zinc-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search contestants, news, polls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    window.location.href = `/contestants?q=${encodeURIComponent(searchQuery)}`;
                  }
                }}
                className="w-full bg-transparent text-white text-base focus:outline-none placeholder:text-zinc-500 font-sans"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-zinc-500 flex items-center justify-between">
              <span>Press ENTER to search</span>
              <span>ESC to cancel</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
