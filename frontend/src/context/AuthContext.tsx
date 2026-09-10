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

  useEffect(() => {
    // Check saved session
    const savedToken = localStorage.getItem("bb_auth_token");
    const savedUser = localStorage.getItem("bb_auth_user");
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {}
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const res = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    throw new Error(errorData.message || "Invalid email or password.");
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    const res = await fetch("/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    throw new Error(errorData.message || "Registration failed. Please try again.");
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("bb_auth_token");
    localStorage.removeItem("bb_auth_user");
    try {
      fetch("/api/v1/auth/logout", { method: "POST" });
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
