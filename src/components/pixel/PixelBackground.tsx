"use client";

// Animated retro background: drifting pixel clouds, twinkling stars, floating coins.
const STARS = Array.from({ length: 36 }).map((_, i) => ({
  id: i,
  top: Math.random() * 100,
  left: Math.random() * 100,
  delay: Math.random() * 2,
  size: Math.random() > 0.7 ? 4 : 2,
}));

const CLOUDS = [
  { top: "12%", delay: "0s", dur: "32s", scale: 1 },
  { top: "30%", delay: "-12s", dur: "44s", scale: 0.7 },
  { top: "62%", delay: "-6s", dur: "38s", scale: 1.2 },
  { top: "80%", delay: "-20s", dur: "50s", scale: 0.6 },
];

function PixelCloud({ scale }: { scale: number }) {
  return (
    <div style={{ transform: `scale(${scale})` }} className="relative">
      <div className="h-4 w-16 bg-neon-purple/30" />
      <div className="absolute -top-3 left-3 h-3 w-8 bg-neon-purple/30" />
      <div className="absolute -top-2 left-8 h-3 w-6 bg-neon-cyan/25" />
    </div>
  );
}

export default function PixelBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      {/* stars */}
      {STARS.map((s) => (
        <span
          key={s.id}
          className="absolute bg-neon-yellow animate-twinkle"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      {/* clouds */}
      {CLOUDS.map((c, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: c.top,
            left: 0,
            animation: `drift ${c.dur} linear infinite`,
            animationDelay: c.delay,
          }}
        >
          <PixelCloud scale={c.scale} />
        </div>
      ))}

      {/* floating coins */}
      {[20, 50, 78].map((left, i) => (
        <div
          key={i}
          className="absolute animate-float"
          style={{
            left: `${left}%`,
            bottom: `${10 + i * 8}%`,
            animationDelay: `${i * 0.6}s`,
          }}
        >
          <div className="h-5 w-5 rounded-full bg-neon-yellow border-2 border-yellow-700 animate-spincoin flex items-center justify-center">
            <span className="text-yellow-800 text-[10px] font-bold leading-none">
              $
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
