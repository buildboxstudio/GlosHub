"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HudBar from "@/components/HudBar";
import PixelBackground from "@/components/pixel/PixelBackground";
import PixelCard from "@/components/pixel/PixelCard";
import PixelButton from "@/components/pixel/PixelButton";
import Leaderboard from "@/components/Leaderboard";
import { useAuth } from "@/lib/auth";
import {
  MOCK_ATTENDANCE,
  MOCK_CUSTOMERS,
  MOCK_LEAVE,
  MOCK_SALARY,
  MOCK_STAFF,
} from "@/lib/mockData";
import { LeaveRequest, RequestStatus, Staff } from "@/lib/types";
import { rupiah, STATUS_COLOR, STATUS_LABEL } from "@/lib/format";

type Tab =
  | "staff"
  | "attendance"
  | "salary"
  | "customer"
  | "approval"
  | "reports";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "staff", label: "STAFF", icon: "🧑" },
  { key: "attendance", label: "ABSENSI", icon: "📅" },
  { key: "salary", label: "GAJI", icon: "💰" },
  { key: "customer", label: "CUSTOMER", icon: "💅" },
  { key: "approval", label: "APPROVAL", icon: "✅" },
  { key: "reports", label: "REPORTS", icon: "📊" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("staff");

  const [staff, setStaff] = useState<Staff[]>(MOCK_STAFF);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(MOCK_LEAVE);
  const [attFilter, setAttFilter] = useState<"harian" | "mingguan" | "bulanan">(
    "harian"
  );

  useEffect(() => {
    if (!loading && !user) router.replace("/");
    if (!loading && user?.role !== "admin") router.replace("/dashboard");
  }, [user, loading, router]);

  if (loading || !user || user.role !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="font-pixel text-xs text-neon-cyan animate-blink">
          LOADING...
        </p>
      </main>
    );
  }

  function nameOf(id: string) {
    return staff.find((s) => s.id === id)?.nama ?? id;
  }

  function toggleActive(id: string) {
    setStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  }

  function setLeaveStatus(id: string, status: RequestStatus) {
    setLeaves((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l))
    );
  }

  return (
    <div className="relative min-h-screen pb-16">
      <PixelBackground />
      <HudBar subtitle="ADMIN CONTROL ROOM" />

      <div className="mx-auto max-w-6xl px-4 pt-6 space-y-6">
        <PixelCard accent="purple" className="!p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-pixel text-xs sm:text-sm text-neon-pink text-glow-pink">
              👑 GAME MASTER CONSOLE
            </h1>
            <p className="font-body text-base text-neon-cyan">
              {staff.filter((s) => s.active && s.role === "staff").length} staff aktif
            </p>
          </div>
        </PixelCard>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <PixelButton
              key={t.key}
              variant={tab === t.key ? "pink" : "purple"}
              onClick={() => setTab(t.key)}
              className="!text-[8px]"
            >
              {t.icon} {t.label}
            </PixelButton>
          ))}
        </div>

        {/* ===== Staff Management ===== */}
        {tab === "staff" && (
          <PixelCard title="STAFF MANAGEMENT" badge="MENU" accent="mint">
            <div className="mb-4 flex justify-end">
              <PixelButton variant="mint" className="!text-[8px]">
                + TAMBAH STAFF
              </PixelButton>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full font-body text-base">
                <thead>
                  <tr className="font-pixel text-[7px] text-neon-cyan text-left">
                    <th className="p-2">NAMA</th>
                    <th className="p-2">JABATAN</th>
                    <th className="p-2">LVL</th>
                    <th className="p-2">STATUS</th>
                    <th className="p-2">AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {staff
                    .filter((s) => s.role === "staff")
                    .map((s) => (
                      <tr key={s.id} className="border-t-2 border-ink-600">
                        <td className="p-2 text-neon-mint">{s.nama}</td>
                        <td className="p-2">{s.jabatan}</td>
                        <td className="p-2 text-neon-yellow">{s.level}</td>
                        <td className="p-2">
                          <span
                            className={
                              s.active ? "text-neon-mint" : "text-neon-red"
                            }
                          >
                            {s.active ? "AKTIF" : "NONAKTIF"}
                          </span>
                        </td>
                        <td className="p-2 flex gap-1">
                          <button className="font-pixel text-[7px] border-2 border-neon-cyan text-neon-cyan px-2 py-1">
                            EDIT
                          </button>
                          <button
                            onClick={() => toggleActive(s.id)}
                            className="font-pixel text-[7px] border-2 border-neon-red text-neon-red px-2 py-1"
                          >
                            {s.active ? "OFF" : "ON"}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </PixelCard>
        )}

        {/* ===== Attendance Management ===== */}
        {tab === "attendance" && (
          <PixelCard title="ATTENDANCE MANAGEMENT" badge="MENU" accent="cyan">
            <div className="mb-4 flex gap-2">
              {(["harian", "mingguan", "bulanan"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setAttFilter(f)}
                  className={`font-pixel text-[7px] border-2 px-3 py-2 uppercase ${
                    attFilter === f
                      ? "border-neon-cyan text-neon-cyan"
                      : "border-ink-600 text-neon-cyan/50"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full font-body text-base">
                <thead>
                  <tr className="font-pixel text-[7px] text-neon-cyan text-left">
                    <th className="p-2">STAFF</th>
                    <th className="p-2">TANGGAL</th>
                    <th className="p-2">IN</th>
                    <th className="p-2">OUT</th>
                    <th className="p-2">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_ATTENDANCE.map((a) => (
                    <tr key={a.id} className="border-t-2 border-ink-600">
                      <td className="p-2 text-neon-mint">{nameOf(a.staff_id)}</td>
                      <td className="p-2">{a.tanggal}</td>
                      <td className="p-2 text-neon-mint">{a.check_in ?? "-"}</td>
                      <td className="p-2 text-neon-pink">{a.check_out ?? "-"}</td>
                      <td className={`p-2 font-pixel text-[8px] ${STATUS_COLOR[a.status]}`}>
                        {STATUS_LABEL[a.status]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PixelCard>
        )}

        {/* ===== Salary Management ===== */}
        {tab === "salary" && (
          <PixelCard title="SALARY MANAGEMENT" badge="MENU" accent="yellow">
            <div className="space-y-3">
              {staff
                .filter((s) => s.role === "staff")
                .map((s) => {
                  const sal = MOCK_SALARY.find((g) => g.staff_id === s.id);
                  return (
                    <div
                      key={s.id}
                      className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-2 border-ink-600 p-3 items-center"
                    >
                      <span className="text-neon-mint font-body text-base">
                        {s.nama}
                      </span>
                      <label className="font-body text-sm">
                        <span className="text-neon-cyan/70 block text-xs">Gaji Harian</span>
                        <input
                          type="number"
                          defaultValue={sal?.gaji_harian ?? 150000}
                          className="pixel-input !py-1 !text-base"
                        />
                      </label>
                      <label className="font-body text-sm">
                        <span className="text-neon-cyan/70 block text-xs">Bonus</span>
                        <input
                          type="number"
                          defaultValue={sal?.bonus ?? 0}
                          className="pixel-input !py-1 !text-base"
                        />
                      </label>
                      <label className="font-body text-sm">
                        <span className="text-neon-cyan/70 block text-xs">Insentif</span>
                        <input
                          type="number"
                          defaultValue={0}
                          className="pixel-input !py-1 !text-base"
                        />
                      </label>
                    </div>
                  );
                })}
            </div>
            <div className="mt-4 flex justify-end">
              <PixelButton variant="yellow" className="!text-[8px]">
                SIMPAN GAJI
              </PixelButton>
            </div>
          </PixelCard>
        )}

        {/* ===== Customer Handling Management ===== */}
        {tab === "customer" && (
          <PixelCard title="CUSTOMER HANDLING" badge="MENU" accent="pink">
            <div className="space-y-3">
              {staff
                .filter((s) => s.role === "staff")
                .map((s) => {
                  const c = MOCK_CUSTOMERS.find((x) => x.staff_id === s.id);
                  return (
                    <div
                      key={s.id}
                      className="flex items-center justify-between border-2 border-ink-600 p-3"
                    >
                      <span className="text-neon-mint font-body text-base">
                        {s.nama}
                      </span>
                      <label className="flex items-center gap-2 font-body text-base">
                        <span className="text-neon-cyan/70 text-sm">Customer hari ini</span>
                        <input
                          type="number"
                          defaultValue={c?.jumlah_customer ?? 0}
                          className="pixel-input !w-24 !py-1 !text-base"
                        />
                      </label>
                    </div>
                  );
                })}
            </div>
            <div className="mt-4 flex justify-end">
              <PixelButton variant="pink" className="!text-[8px]">
                UPDATE CUSTOMER
              </PixelButton>
            </div>
          </PixelCard>
        )}

        {/* ===== Approval Center ===== */}
        {tab === "approval" && (
          <PixelCard title="APPROVAL CENTER" badge="MENU" accent="mint">
            <ul className="space-y-2">
              {leaves.map((l) => (
                <li
                  key={l.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-2 border-ink-600 p-3 font-body text-base"
                >
                  <div>
                    <span className="text-neon-mint">{nameOf(l.staff_id)}</span>{" "}
                    · <span className="uppercase text-neon-cyan">{l.jenis}</span>{" "}
                    · {l.tanggal}
                    <p className="text-neon-cyan/60 text-sm">{l.alasan}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-pixel text-[7px] px-2 py-1 border-2 ${
                        l.status === "approved"
                          ? "border-neon-mint text-neon-mint"
                          : l.status === "rejected"
                          ? "border-neon-red text-neon-red"
                          : "border-neon-yellow text-neon-yellow"
                      }`}
                    >
                      {l.status.toUpperCase()}
                    </span>
                    {l.status === "pending" && (
                      <>
                        <button
                          onClick={() => setLeaveStatus(l.id, "approved")}
                          className="font-pixel text-[7px] border-2 border-neon-mint text-neon-mint px-2 py-1"
                        >
                          OK
                        </button>
                        <button
                          onClick={() => setLeaveStatus(l.id, "rejected")}
                          className="font-pixel text-[7px] border-2 border-neon-red text-neon-red px-2 py-1"
                        >
                          NO
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </PixelCard>
        )}

        {/* ===== Reports ===== */}
        {tab === "reports" && (
          <PixelCard title="REPORTS" badge="MENU" accent="purple">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { t: "ABSENSI", c: "mint" as const },
                { t: "PENDAPATAN", c: "yellow" as const },
                { t: "PERFORMA STAFF", c: "pink" as const },
              ].map((r) => (
                <div key={r.t} className="border-2 border-ink-600 p-4 text-center">
                  <p className="font-pixel text-[8px] text-neon-cyan mb-3">
                    LAPORAN {r.t}
                  </p>
                  <div className="flex flex-col gap-2">
                    <PixelButton variant="red" className="!text-[7px]">
                      📄 EXPORT PDF
                    </PixelButton>
                    <PixelButton variant="mint" className="!text-[7px]">
                      📊 EXPORT EXCEL
                    </PixelButton>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 font-body text-sm text-neon-cyan/60 text-center">
              Generate laporan harian / mingguan / bulanan untuk seluruh staff.
            </p>
          </PixelCard>
        )}

        {/* Leaderboard always visible */}
        <Leaderboard />
      </div>
    </div>
  );
}
