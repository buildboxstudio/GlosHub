"use client";

import { motion } from "framer-motion";
import { ButtonHTMLAttributes } from "react";

type Variant = "pink" | "cyan" | "mint" | "purple" | "yellow" | "red";

const VARIANT_BG: Record<Variant, string> = {
  pink: "bg-neon-pink",
  cyan: "bg-neon-cyan",
  mint: "bg-neon-mint",
  purple: "bg-neon-purple",
  yellow: "bg-neon-yellow",
  red: "bg-neon-red",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export default function PixelButton({
  variant = "pink",
  className = "",
  children,
  ...rest
}: Props) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ y: 4 }}
      transition={{ duration: 0.05 }}
      className={`pixel-btn ${VARIANT_BG[variant]} ${className}`}
      {...(rest as any)}
    >
      {children}
    </motion.button>
  );
}
