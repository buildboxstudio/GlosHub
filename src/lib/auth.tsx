"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { MOCK_STAFF } from "./mockData";
import { isSupabaseEnabled } from "./supabase/client";
import { Staff } from "./types";

interface AuthState {
  user: Staff | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const STORAGE_KEY = "glos.session";

// DEMO MODE password map (used only when Supabase is not configured)
const DEMO_PASSWORDS: Record<string, string> = {
  "admin@glos.studio": "admin123",
  "nadia@glos.studio": "staff123",
  "sasa@glos.studio": "staff123",
  "bella@glos.studio": "staff123",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const normalized = email.trim().toLowerCase();

      if (isSupabaseEnabled) {
        // Real Supabase auth path
        const { createClient } = await import("./supabase/client");
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalized,
          password,
        });
        if (error || !data.user) {
          return { ok: false, error: error?.message ?? "Login gagal" };
        }
        const { data: profile } = await supabase
          .from("staff")
          .select("*")
          .eq("email", normalized)
          .single();
        const staff = (profile as Staff) ?? null;
        if (!staff) return { ok: false, error: "Profil staff tidak ditemukan" };
        setUser(staff);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(staff));
        return { ok: true };
      }

      // DEMO MODE
      await new Promise((r) => setTimeout(r, 350));
      const match = MOCK_STAFF.find((s) => s.email === normalized);
      if (!match) return { ok: false, error: "Email tidak terdaftar" };
      if (DEMO_PASSWORDS[normalized] !== password) {
        return { ok: false, error: "Password salah" };
      }
      if (!match.active) return { ok: false, error: "Akun dinonaktifkan" };
      setUser(match);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(match));
      return { ok: true };
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    if (isSupabaseEnabled) {
      import("./supabase/client").then(({ createClient }) =>
        createClient().auth.signOut()
      );
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
