"use client";

import { useEffect, useState } from "react";
import PixelCard from "./pixel/PixelCard";
import * as ds from "@/lib/dataService";
import { Staff } from "@/lib/types";

interface Row {
  medal: string;
  nama: string;
  value: string;
}

export default function Leaderboard() {
  const [attRows, setAttRows] = useState<Row[]>([]);
  const [revRows, setRevRows] = useState<Row[]>([]);
  const [custRows, setCustRows] = useState<Row[]>([]);

  useEffect(() => {
    (async () => {
      const staff = await ds.loadStaff();
      const activeStaff = staff.filter((s: Staff) => s.role === "staff" && s.active);

      const attendance = await ds.loadAttendance();
      const salaries = await ds.loadSalaries();
      const customers = await ds.loadCustomers();

      const today = new Date().toISOString().slice(0, 7);

      // Top Attendance: count check-ins this month
      const attCount: Record<string, number> = {};
      for (const a of attendance) {
        if (a.tanggal.startsWith(today)) {
          attCount[a.staff_id] = (attCount[a.staff_id] || 0) + 1;
        }
      }
      const topAtt = activeStaff
        .map((s: Staff) => ({ nama: s.nama, value: attCount[s.id] || 0 }))
        .sort((a: any, b: any) => b.value - a.value)
        .slice(0, 3);

      // Top Revenue: sum gaji_harian + bonus
      const revSum: Record<string, number> = {};
      for (const s of salaries) {
        revSum[s.staff_id] = (revSum[s.staff_id] || 0) + Number(s.gaji_harian) + Number(s.bonus);
      }
      const topRev = activeStaff
        .map((s: Staff) => ({ nama: s.nama, value: revSum[s.id] || 0 }))
        .sort((a: any, b: any) => b.value - a.value)
        .slice(0, 3);

      // Top Customer: sum jumlah_customer
      const custSum: Record<string, number> = {};
      for (const c of customers) {
        custSum[c.staff_id] = (custSum[c.staff_id] || 0) + c.jumlah_customer;
      }
      const topCust = activeStaff
        .map((s: Staff) => ({ nama: s.nama, value: custSum[s.id] || 0 }))
        .sort((a: any, b: any) => b.value - a.value)
        .slice(0, 3);

      const medals = ["🥇", "🥈", "🥉"];
      setAttRows(topAtt.map((r: any, i: number) => ({ medal: medals[i], nama: r.nama, value: String(r.value) + " hari" })));
      setRevRows(topRev.map((r: any, i: number) => ({ medal: medals[i], nama: r.nama, value: (r.value / 1000).toFixed(0) + "k" })));
      setCustRows(topCust.map((r: any, i: number) => ({ medal: medals[i], nama: r.nama, value: String(r.value) + " cust" })));
    })();
  }, []);

  const columns = [
    { title: "TOP ATTENDANCE", rows: attRows, accent: "mint" as const },
    { title: "TOP REVENUE", rows: revRows, accent: "yellow" as const },
    { title: "TOP CUSTOMER", rows: custRows, accent: "pink" as const },
  ];

  return (
    <PixelCard title="LEADERBOARD" badge="RANK" accent="purple">
      <div className="grid gap-4 sm:grid-cols-3">
        {columns.map((col) => (
          <div key={col.title}>
            <p className="font-pixel text-[8px] text-neon-cyan mb-2">{col.title}</p>
            {col.rows.length === 0 ? (
              <div className="font-body text-base text-neon-cyan/50 border-2 border-dashed border-ink-600 p-3 text-center">
                Belum ada data
              </div>
            ) : (
              <ul className="space-y-1">
                {col.rows.map((r, i) => (
                  <li key={i} className="flex items-center justify-between border-2 border-ink-600 px-2 py-1 font-body text-base">
                    <span>{r.medal} {r.nama}</span>
                    <span className="text-neon-mint">{r.value}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </PixelCard>
  );
}
