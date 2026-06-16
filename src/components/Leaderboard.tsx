"use client";

import PixelCard from "./pixel/PixelCard";
import {
  MOCK_CUSTOMERS,
  MOCK_SALARY,
  MOCK_STAFF,
  MOCK_MONTHLY,
} from "@/lib/mockData";

function rankRows(
  metric: (staffId: string) => number,
  unit: string
) {
  return MOCK_STAFF.filter((s) => s.role === "staff" && s.active)
    .map((s) => ({ nama: s.nama, value: metric(s.id) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
    .map((r, i) => ({ ...r, medal: ["🥇", "🥈", "🥉"][i], unit }));
}

export default function Leaderboard() {
  const topAttendance = rankRows(
    (id) => MOCK_MONTHLY[id]?.hadir ?? 0,
    "hari"
  );
  const topRevenue = rankRows(
    (id) =>
      MOCK_SALARY.filter((g) => g.staff_id === id).reduce(
        (a, g) => a + g.gaji_harian + g.bonus,
        0
      ),
    "rp"
  );
  const topCustomer = rankRows(
    (id) =>
      MOCK_CUSTOMERS.filter((c) => c.staff_id === id).reduce(
        (a, c) => a + c.jumlah_customer,
        0
      ),
    "cust"
  );

  const columns = [
    { title: "TOP ATTENDANCE", rows: topAttendance, accent: "mint" as const },
    { title: "TOP REVENUE", rows: topRevenue, accent: "yellow" as const },
    { title: "TOP CUSTOMER", rows: topCustomer, accent: "pink" as const },
  ];

  return (
    <PixelCard title="LEADERBOARD" badge="RANK" accent="purple">
      <div className="grid gap-4 sm:grid-cols-3">
        {columns.map((col) => (
          <div key={col.title}>
            <p className="font-pixel text-[8px] text-neon-cyan mb-2">
              {col.title}
            </p>
            <ul className="space-y-1">
              {col.rows.map((r, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between border-2 border-ink-600 px-2 py-1 font-body text-base"
                >
                  <span>
                    {r.medal} {r.nama}
                  </span>
                  <span className="text-neon-mint">
                    {r.unit === "rp"
                      ? (r.value / 1000).toFixed(0) + "k"
                      : r.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </PixelCard>
  );
}
