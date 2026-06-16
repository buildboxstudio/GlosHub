import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Retro pixel game palette
        neon: {
          pink: "#ff4fd8",
          cyan: "#22e0ff",
          purple: "#9b5cff",
          mint: "#46f5b6",
          yellow: "#ffe44d",
          red: "#ff5470",
        },
        ink: {
          900: "#0a0520",
          800: "#140a33",
          700: "#1f1147",
          600: "#2a1860",
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', "monospace"],
        body: ['"VT323"', "monospace"],
      },
      boxShadow: {
        pixel: "4px 4px 0 0 rgba(0,0,0,0.6)",
        "pixel-lg": "6px 6px 0 0 rgba(0,0,0,0.6)",
        "neon-pink": "0 0 12px rgba(255,79,216,0.7)",
        "neon-cyan": "0 0 12px rgba(34,224,255,0.7)",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        drift: {
          "0%": { transform: "translateX(-10vw)" },
          "100%": { transform: "translateX(110vw)" },
        },
        twinkle: {
          "0%,100%": { opacity: "0.2" },
          "50%": { opacity: "1" },
        },
        spincoin: {
          "0%,100%": { transform: "scaleX(1)" },
          "50%": { transform: "scaleX(0.2)" },
        },
        blink: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.2" },
        },
        pressdown: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(4px)" },
        },
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        "float-slow": "float 5s ease-in-out infinite",
        drift: "drift 24s linear infinite",
        "drift-slow": "drift 40s linear infinite",
        twinkle: "twinkle 2s ease-in-out infinite",
        spincoin: "spincoin 1.2s ease-in-out infinite",
        blink: "blink 1s step-end infinite",
      },
    },
  },
  plugins: [],
};

export default config;
