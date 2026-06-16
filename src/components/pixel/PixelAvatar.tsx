"use client";

import { motion } from "framer-motion";

// Color palette keys for the pixel maps
const PALETTE: Record<string, string> = {
  ".": "transparent",
  H: "#5b2a86", // hair (purple)
  h: "#7a3fb0", // hair highlight
  S: "#ffd9b3", // skin
  s: "#f2b98e", // skin shadow
  E: "#0a0520", // eyes
  P: "#ff4fd8", // pink (blush / lips / accessory)
  C: "#22e0ff", // cyan accessory
  W: "#ffffff", // sparkle
};

// 14 x 16 beauty-therapist sprite maps
const SPRITES: Record<string, string[]> = {
  therapist: [
    "....HHHHHH....",
    "...HHHHHHHH...",
    "..HHHHHHHHHH..",
    "..HHSSSSSSHH..",
    "..HSSSSSSSSH..",
    "..HSSSSSSSSH..",
    "..SSEsSSsESS..",
    "..SSSSSSSSSS..",
    "..SSsPPPPsSS..",
    "...SSSPPSSS...",
    "....SSSSSS....",
    "...CPPPPPPC...",
    "..CPPPPPPPPC..",
    "..CPP.CC.PPC..",
    "...PP....PP...",
    "...PP....PP...",
  ],
  lash: [
    "....HHHHHH....",
    "...HhHHHHhH...",
    "..HHHHHHHHHH..",
    "..HHSSSSSSHH..",
    "..HSSSSSSSSH..",
    "..HSEEsSEEsH..",
    "..HSSEsSSeSH..",
    "..SSSSSSSSSS..",
    "..SSsPPPPsSS..",
    "...SSSPPSSS...",
    "....SSSSSS....",
    "...PPPPPPPP...",
    "..PPPPPPPPPP..",
    "..PP.PCCP.PP..",
    "...PP....PP...",
    "...PP....PP...",
  ],
  boss: [
    "....WCWCW.....",
    "...HHHHHHH....",
    "..HHHHHHHHH...",
    "..HHSSSSSSHH..",
    "..HSSSSSSSSH..",
    "..HSEsSSsESH..",
    "..SSSSSSSSSS..",
    "..SSsPPPPsSS..",
    "...SSSPPSSS...",
    "....SSSSSS....",
    "...CCCCCCCC...",
    "..CCPPPPPPCC..",
    "..CP.CWWC.PC..",
    "..CPPPPPPPPC..",
    "...PP....PP...",
    "...PP....PP...",
  ],
};

interface Props {
  sprite?: string;
  pixel?: number; // size of each pixel cell in px
  className?: string;
  bob?: boolean;
}

export default function PixelAvatar({
  sprite = "therapist",
  pixel = 6,
  className = "",
  bob = true,
}: Props) {
  const map = SPRITES[sprite] ?? SPRITES.therapist;
  const cols = map[0].length;
  const rows = map.length;

  return (
    <motion.div
      animate={bob ? { y: [0, -4, 0] } : undefined}
      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, ${pixel}px)`,
        gridTemplateRows: `repeat(${rows}, ${pixel}px)`,
        filter: "drop-shadow(3px 3px 0 rgba(0,0,0,0.6))",
      }}
    >
      {map.flatMap((row, y) =>
        row.split("").map((ch, x) => (
          <span
            key={`${x}-${y}`}
            style={{
              width: pixel,
              height: pixel,
              background: PALETTE[ch] ?? "transparent",
            }}
          />
        ))
      )}
    </motion.div>
  );
}
