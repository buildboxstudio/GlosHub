"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  title?: string;
  badge?: string;
  accent?: "pink" | "cyan" | "mint" | "purple" | "yellow";
  children: ReactNode;
  className?: string;
}

const ACCENT_TEXT: Record<string, string> = {
  pink: "text-neon-pink",
  cyan: "text-neon-cyan",
  mint: "text-neon-mint",
  purple: "text-neon-purple",
  yellow: "text-neon-yellow",
};

const ACCENT_BORDER: Record<string, string> = {
  pink: "border-neon-pink",
  cyan: "border-neon-cyan",
  mint: "border-neon-mint",
  purple: "border-neon-purple",
  yellow: "border-neon-yellow",
};

export default function PixelCard({
  title,
  badge,
  accent = "purple",
  children,
  className = "",
}: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className={`pixel-card ${ACCENT_BORDER[accent]} ${className}`}
    >
      {(title || badge) && (
        <header className="mb-4 flex items-center justify-between gap-2">
          {badge && (
            <span
              className={`font-pixel text-[8px] px-2 py-1 border-2 ${ACCENT_BORDER[accent]} ${ACCENT_TEXT[accent]}`}
            >
              {badge}
            </span>
          )}
          {title && (
            <h3
              className={`font-pixel text-[10px] sm:text-xs ${ACCENT_TEXT[accent]} text-glow-cyan ml-auto`}
            >
              {title}
            </h3>
          )}
        </header>
      )}
      {children}
    </motion.section>
  );
}
