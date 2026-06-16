"use client";

import PixelCard from "./pixel/PixelCard";

export default function Leaderboard() {
  const columns = [
    { title: "TOP ATTENDANCE", rows: [] as { medal: string; nama: string; value: string }[], accent: "mint" as const },
    { title: "TOP REVENUE", rows: [] as { medal: string; nama: string; value: string }[], accent: "yellow" as const },
    { title: "TOP CUSTOMER", rows: [] as { medal: string; nama: string; value: string }[], accent: "pink" as const },
  ];

  return (
    <PixelCard title="LEADERBOARD" badge="RANK" accent="purple">
      <div className="grid gap-4 sm:grid-cols-3">
        {columns.map((col) => (
          <div key={col.title}>
            <p className="font-pixel text-[8px] text-neon-cyan mb-2">
              {col.title}
            </p>
            <div className="font-body text-base text-neon-cyan/50 border-2 border-dashed border-ink-600 p-3 text-center">
              Data akan muncul setelah admin mengisi data
            </div>
          </div>
        ))}
      </div>
    </PixelCard>
  );
}
