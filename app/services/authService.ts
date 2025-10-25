"use client";

import { useRouter } from "next/navigation";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/auth`;

/**
 * A simple authentication service for Next.js
 * Equivalent to Angular's AuthService
 */
export const authService = {
  // Called on login
  async login(email: string, password: string) {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "Login failed.");
    }

    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    return data;
  },

  // Called on logout
  logout() {
    localStorage.removeItem("token");
    sessionStorage.clear();
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/login");
      window.addEventListener("popstate", (event) => {
        event.preventDefault();
        window.history.pushState(null, "", "/login");
      });
    }
  },

  // Check authentication state
  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("token");
  },

  // Get stored token
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  },
};
