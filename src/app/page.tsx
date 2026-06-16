"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PixelBackground from "@/components/pixel/PixelBackground";
import PixelAvatar from "@/components/pixel/PixelAvatar";
import PixelButton from "@/components/pixel/PixelButton";
import { useAuth } from "@/lib/auth";
import { isSupabaseEnabled } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const { user, login, loading } = useAuth();
  const [started, setStarted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace(user.role === "admin" ? "/admin" : "/dashboard");
    }
  }, [user, loading, router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await login(email, password);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "Login gagal");
      return;
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <PixelBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="pixel-card border-neon-pink w-full max-w-md text-center"
      >
        {/* Title banner */}
        <p className="font-pixel text-[8px] text-neon-cyan mb-2 animate-blink">
          ★ BEAUTY STAFF ADVENTURE ★
        </p>
        <h1 className="font-pixel text-base sm:text-lg text-neon-pink text-glow-pink leading-relaxed">
          GLOS STUDIO
        </h1>
        <h2 className="font-pixel text-[10px] sm:text-xs text-neon-mint mt-2 mb-5">
          STAFF PORTAL
        </h2>

        <div className="flex justify-center mb-4">
          <PixelAvatar sprite="therapist" pixel={9} />
        </div>

        <AnimatePresence mode="wait">
          {!started ? (
            <motion.div
              key="start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="font-body text-neon-cyan/80 text-lg mb-5">
                Press start to begin your shift quest!
              </p>
              <PixelButton
                variant="pink"
                className="w-full text-sm py-4"
                onClick={() => setStarted(true)}
              >
                ▶ START GAME
              </PixelButton>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleLogin}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4 text-left"
            >
              <div>
                <label className="font-pixel text-[8px] text-neon-cyan block mb-1">
                  EMAIL
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@glos.studio"
                  className="pixel-input"
                />
              </div>
              <div>
                <label className="font-pixel text-[8px] text-neon-cyan block mb-1">
                  PASSWORD
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pixel-input"
                />
              </div>

              {error && (
                <p className="font-pixel text-[8px] text-neon-red animate-blink">
                  ✖ {error}
                </p>
              )}

              <PixelButton
                variant="mint"
                type="submit"
                disabled={busy}
                className="w-full"
              >
                {busy ? "LOADING..." : "LOGIN ▶"}
              </PixelButton>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Demo hint */}
        {!isSupabaseEnabled && (
          <div className="mt-6 border-t-4 border-ink-600 pt-3 text-left">
            <p className="font-pixel text-[7px] text-neon-yellow mb-1">
              DEMO MODE - TRY:
            </p>
            <p className="font-body text-base text-neon-cyan/80 leading-snug">
              Admin: admin@glos.studio / admin123
              <br />
              Staff: nadia@glos.studio / staff123
            </p>
          </div>
        )}
      </motion.div>
    </main>
  );
}
