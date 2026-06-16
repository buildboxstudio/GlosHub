"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import PixelButton from "./pixel/PixelButton";

export default function HudBar({ subtitle }: { subtitle?: string }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b-4 border-ink-600 bg-ink-900/90 backdrop-blur px-4 py-3">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 bg-neon-mint animate-blink" />
          <div className="leading-tight">
            <p className="font-pixel text-[9px] sm:text-xs text-neon-pink text-glow-pink">
              GLOS STUDIO
            </p>
            <p className="font-pixel text-[6px] sm:text-[8px] text-neon-cyan">
              {subtitle ?? "STAFF PORTAL"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden sm:inline font-body text-lg text-neon-mint">
              {user.role === "admin" ? "👑 " : "🎮 "}
              {user.nama}
            </span>
          )}
          <PixelButton variant="red" onClick={handleLogout} className="!text-[8px] !px-3 !py-2">
            EXIT
          </PixelButton>
        </div>
      </div>
    </header>
  );
}
