"use client";

import { motion } from "framer-motion";

interface Props {
  value: number;
  max: number;
  label?: string;
  color?: string; // tailwind bg class
}

export default function PixelProgress({
  value,
  max,
  label,
  color = "bg-neon-mint",
}: Props) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full">
      {label && (
        <div className="mb-1 flex justify-between font-pixel text-[8px] text-neon-cyan">
          <span>{label}</span>
          <span>
            {value}/{max}
          </span>
        </div>
      )}
      <div className="h-5 w-full border-4 border-ink-600 bg-ink-900 p-[2px]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full ${color}`}
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.25) 0 4px, transparent 4px 8px)",
          }}
        />
      </div>
    </div>
  );
}
