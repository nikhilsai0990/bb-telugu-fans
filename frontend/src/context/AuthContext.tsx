"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

  useEffect(() => {
    // Check saved session
    const savedToken = localStorage.getItem("bb_auth_token");
    const savedUser = localStorage.getItem("bb_auth_user");
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Verify with /auth/me in background
        fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${savedToken}` },
          credentials: "include",
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((freshUser) => {
            if (freshUser) {
              setUser(freshUser);
              localStorage.setItem("bb_auth_user", JSON.stringify(freshUser));
            }
          })
          .catch(() => {});
      } catch (e) {}
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("bb_auth_token", data.token);
      localStorage.setItem("bb_auth_user", JSON.stringify(data.user));
      return true;
    }

    const errorData = await res.json().catch(() => ({}));
    const message = Array.isArray(errorData.message)
      ? errorData.message.join(", ")
      : (errorData.message || "Invalid email or password.");
    throw new Error(message);
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, email, password }),
    });

    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("bb_auth_token", data.token);
      localStorage.setItem("bb_auth_user", JSON.stringify(data.user));
      return true;
    }

    const errorData = await res.json().catch(() => ({}));
    const message = Array.isArray(errorData.message)
      ? errorData.message.join(", ")
      : (errorData.message || "Registration failed. Please try again.");
    throw new Error(message);
  };

  const logout = () => {
    const currentToken = token || localStorage.getItem("bb_auth_token");
    setUser(null);
    setToken(null);
    localStorage.removeItem("bb_auth_token");
    localStorage.removeItem("bb_auth_user");
    try {
      fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: currentToken ? { Authorization: `Bearer ${currentToken}` } : {},
        credentials: "include",
      });
    } catch (e) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAdmin: user?.role === "ADMIN" || user?.role === "MODERATOR",
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
