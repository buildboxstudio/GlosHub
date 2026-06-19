"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import HudBar from "@/components/HudBar";
import PixelBackground from "@/components/pixel/PixelBackground";
import PixelAvatar from "@/components/pixel/PixelAvatar";
import PixelCard from "@/components/pixel/PixelCard";
import PixelButton from "@/components/pixel/PixelButton";
import PixelProgress from "@/components/pixel/PixelProgress";
import Leaderboard from "@/components/Leaderboard";
import { useAuth } from "@/lib/auth";
import { AttendanceStatus, Badge, LeaveRequest, LeaveType } from "@/lib/types";
import { nowHM, rupiah, STATUS_COLOR, STATUS_LABEL, todayISO } from "@/lib/format";
import * as ds from "@/lib/dataService";

export default function StaffDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);
  const [status, setStatus] = useState<AttendanceStatus>("hadir");
  const [useGps, setUseGps] = useState(false);
  const [useSelfie, setUseSelfie] = useState(false);
  const [gps, setGps] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [leaveType, setLeaveType] = useState<LeaveType>("izin");
  const [leaveDate, setLeaveDate] = useState(todayISO());
  const [leaveReason, setLeaveReason] = useState("");

  const [salary, setSalary] = useState({ gaji_harian: 150000, bonus: 0 });
  const [customers, setCustomers] = useState(0);
  const [monthly, setMonthly] = useState({ hadir: 0, terlambat: 0, izin: 0, sakit: 0, cuti: 0 });

  useEffect(() => {
    if (!loading && !user) router.replace("/");
    if (!loading && user?.role === "admin") router.replace("/admin");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    ds.getTodayAttendance(user.id).then((a) => {
      if (a) {
        setCheckIn(a.check_in);
        setCheckOut(a.check_out);
        setStatus(a.status as AttendanceStatus);
      }
    });
    ds.getStaffSalary(user.id).then(setSalary);
    ds.getStaffCustomer(user.id).then(setCustomers);
    ds.getMonthlyStats(user.id).then(setMonthly);
    ds.getStaffLeaves(user.id).then(setLeaves);
  }, [user]);

  function doCheckIn() {
    if (!user || saving) return;
    setSaving(true);
    const t = nowHM();
    const [h, m] = t.split(":").map(Number);
    const st: AttendanceStatus = h > 9 || (h === 9 && m > 0) ? "terlambat" : "hadir";
    setStatus(st);
    setCheckIn(t);
    if (useGps && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = `${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}`;
          setGps(loc);
          ds.checkIn(user.id, t, st, loc).finally(() => setSaving(false));
        },
        () => {
          setGps("izin lokasi ditolak");
          ds.checkIn(user.id, t, st).finally(() => setSaving(false));
        }
      );
    } else {
      ds.checkIn(user.id, t, st).finally(() => setSaving(false));
    }
  }

  function doCheckOut() {
    if (!user) return;
    const t = nowHM();
    setCheckOut(t);
    ds.checkOut(user.id, t);
  }

  function submitLeave(e: React.FormEvent) {
    e.preventDefault();
    if (!leaveReason.trim() || !user) return;
    ds.addLeave(user.id, leaveType, leaveDate, leaveReason.trim()).then(() => {
      ds.getStaffLeaves(user.id!).then(setLeaves);
    });
    setLeaveReason("");
  }

  const dailyEarnings = salary.gaji_harian + salary.bonus;

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="font-pixel text-xs text-neon-cyan animate-blink">
          LOADING...
        </p>
      </main>
    );
  }

  return (
    <div className="relative min-h-screen pb-16">
      <PixelBackground />
      <HudBar subtitle="PLAYER DASHBOARD" />

      <div className="mx-auto max-w-6xl px-4 pt-6 space-y-6">
        <PixelCard accent="pink" className="!p-6">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
            <div className="border-4 border-neon-pink bg-ink-900 p-3">
              <PixelAvatar sprite={user.avatar} pixel={8} />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="font-pixel text-[8px] text-neon-cyan">WELCOME,</p>
              <h1 className="font-pixel text-sm sm:text-lg text-neon-pink text-glow-pink mt-1">
                {user.nama.toUpperCase()}
              </h1>
              <p className="font-body text-lg text-neon-mint mt-1">
                {user.jabatan} · LVL {user.level}
              </p>
              <div className="mt-3 max-w-md">
                <PixelProgress
                  value={user.xp}
                  max={user.xp_to_next}
                  label="XP PROGRESS"
                  color="bg-neon-pink"
                />
              </div>
            </div>
            <div className="text-center">
              <div className="font-pixel text-2xl text-neon-yellow text-glow-cyan">
                {user.level}
              </div>
              <p className="font-pixel text-[7px] text-neon-cyan">LEVEL</p>
            </div>
          </div>
        </PixelCard>

        <div className="grid gap-6 lg:grid-cols-2">
          <PixelCard title="ATTENDANCE" badge="MISSION 01" accent="mint">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-body text-base text-neon-cyan/70">{todayISO()}</p>
                <p className={`font-pixel text-xs ${STATUS_COLOR[status]}`}>
                  {STATUS_LABEL[status]}
                </p>
              </div>
              <div className="text-right font-body text-base">
                <p>IN: <span className="text-neon-mint">{checkIn ?? "--:--"}</span></p>
                <p>OUT: <span className="text-neon-pink">{checkOut ?? "--:--"}</span></p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-4">
              <PixelButton
                variant="mint"
                onClick={doCheckIn}
                disabled={!!checkIn || saving}
                className="flex-1"
              >
                {saving ? "MENYIMPAN..." : "CHECK IN"}
              </PixelButton>
              <PixelButton
                variant="pink"
                onClick={doCheckOut}
                disabled={!checkIn || !!checkOut}
                className="flex-1"
              >
                CHECK OUT
              </PixelButton>
            </div>

            <div className="space-y-2 font-body text-base">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={useGps} onChange={(e) => setUseGps(e.target.checked)} />
                <span>📍 Lokasi GPS {gps && <span className="text-neon-cyan">({gps})</span>}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={useSelfie} onChange={(e) => setUseSelfie(e.target.checked)} />
                <span>📸 Foto Selfie</span>
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {(["hadir", "terlambat", "izin", "sakit", "cuti"] as AttendanceStatus[]).map((st) => (
                  <button key={st}
                    onClick={() => setStatus(st)}
                    className={`border-2 px-2 py-1 font-pixel text-[7px] ${
                      status === st ? "border-neon-mint text-neon-mint" : "border-ink-600 text-neon-cyan/60"
                    }`}>
                    {STATUS_LABEL[st]}
                  </button>
                ))}
              </div>
            </div>
          </PixelCard>

          <PixelCard title="DAILY EARNINGS" badge="MISSION 02" accent="yellow">
            <div className="flex flex-col items-center justify-center py-2">
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="flex items-center gap-3"
              >
                <div className="h-8 w-8 rounded-full bg-neon-yellow border-2 border-yellow-700 animate-spincoin flex items-center justify-center text-yellow-800 font-bold">
                  $
                </div>
                <span className="font-pixel text-base sm:text-xl text-neon-yellow text-glow-cyan">
                  {rupiah(dailyEarnings)}
                </span>
              </motion.div>
              <p className="font-pixel text-[8px] text-neon-cyan mt-3">💰 GOLD EARNED TODAY</p>
              <div className="mt-4 grid grid-cols-2 gap-3 w-full font-body text-base">
                <div className="border-2 border-ink-600 p-2 text-center">
                  <p className="text-neon-cyan/70">Gaji Harian</p>
                  <p className="text-neon-mint">{rupiah(salary.gaji_harian)}</p>
                </div>
                <div className="border-2 border-ink-600 p-2 text-center">
                  <p className="text-neon-cyan/70">Bonus</p>
                  <p className="text-neon-pink">{rupiah(salary.bonus)}</p>
                </div>
              </div>
            </div>
          </PixelCard>

          <PixelCard title="CUSTOMER HANDLED" badge="MISSION 03" accent="cyan">
            <div className="flex items-center justify-center gap-4 py-4">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="font-pixel text-4xl text-neon-cyan text-glow-cyan"
              >
                {customers}
              </motion.span>
              <div>
                <p className="font-pixel text-[8px] text-neon-mint">TODAY&apos;S</p>
                <p className="font-pixel text-[8px] text-neon-mint">CUSTOMERS</p>
              </div>
            </div>
            <p className="text-center font-body text-base text-neon-yellow">
              🏆 Customer handled: {customers}
            </p>
          </PixelCard>

          <PixelCard title="ATTENDANCE STATS" badge="MISSION 04" accent="purple">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {[
                { k: "HADIR", v: monthly.hadir, c: "text-neon-mint" },
                { k: "TELAT", v: monthly.terlambat, c: "text-neon-yellow" },
                { k: "IZIN", v: monthly.izin, c: "text-neon-cyan" },
                { k: "SAKIT", v: monthly.sakit, c: "text-neon-red" },
                { k: "CUTI", v: monthly.cuti, c: "text-neon-purple" },
              ].map((s) => (
                <div key={s.k} className="border-2 border-ink-600 p-2 text-center">
                  <p className={`font-pixel text-lg ${s.c}`}>{s.v}</p>
                  <p className="font-pixel text-[7px] text-neon-cyan/70 mt-1">{s.k}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 font-body text-sm text-neon-cyan/60 text-center">
              Statistik bulan ini
            </p>
          </PixelCard>

          <PixelCard title="WEEKLY QUEST" badge="MISSION 05" accent="mint">
            <p className="font-pixel text-[8px] text-neon-cyan mb-3">
              📜 QUEST SUMMARY BOARD
            </p>
            <ul className="space-y-2 font-body text-base">
              <li className="flex justify-between border-2 border-ink-600 px-3 py-2">
                <span>Hari Masuk</span>
                <span className="text-neon-mint">{monthly.hadir + monthly.terlambat} / 6 hari</span>
              </li>
              <li className="flex justify-between border-2 border-ink-600 px-3 py-2">
                <span>Customer</span>
                <span className="text-neon-cyan">{customers} cust</span>
              </li>
              <li className="flex justify-between border-2 border-ink-600 px-3 py-2">
                <span>Pendapatan</span>
                <span className="text-neon-yellow">{rupiah(dailyEarnings)}</span>
              </li>
            </ul>
          </PixelCard>

          <PixelCard title="MONTHLY BOSS" badge="MISSION 06" accent="pink">
            <p className="font-pixel text-[8px] text-neon-red mb-3 animate-blink">
              ⚔ BOSS BATTLE SUMMARY
            </p>
            <div className="grid grid-cols-2 gap-2 font-body text-base">
              <div className="border-2 border-ink-600 p-2 text-center">
                <p className="text-neon-cyan/70">Hari Kerja</p>
                <p className="text-neon-mint text-lg">{monthly.hadir + monthly.terlambat}</p>
              </div>
              <div className="border-2 border-ink-600 p-2 text-center">
                <p className="text-neon-cyan/70">Pendapatan</p>
                <p className="text-neon-yellow">{rupiah(dailyEarnings * (monthly.hadir + monthly.terlambat))}</p>
              </div>
              <div className="border-2 border-ink-600 p-2 text-center">
                <p className="text-neon-cyan/70">Total Bonus</p>
                <p className="text-neon-pink">{rupiah(salary.bonus * (monthly.hadir + monthly.terlambat))}</p>
              </div>
              <div className="border-2 border-ink-600 p-2 text-center">
                <p className="text-neon-cyan/70">Customer</p>
                <p className="text-neon-cyan text-lg">{customers}</p>
              </div>
            </div>
          </PixelCard>
        </div>

        <PixelCard title="LEAVE REQUEST" badge="MISSION 07" accent="cyan">
          <p className="font-pixel text-[8px] text-neon-purple mb-3">🪟 QUEST REQUEST WINDOW</p>
          <div className="grid gap-5 md:grid-cols-2">
            <form onSubmit={submitLeave} className="space-y-3">
              <div>
                <label className="font-pixel text-[8px] text-neon-cyan block mb-1">JENIS</label>
                <select value={leaveType} onChange={(e) => setLeaveType(e.target.value as LeaveType)} className="pixel-input">
                  <option value="sakit">Sakit</option>
                  <option value="izin">Izin Pribadi</option>
                  <option value="mendesak">Keperluan Mendesak</option>
                  <option value="cuti">Cuti</option>
                </select>
              </div>
              <div>
                <label className="font-pixel text-[8px] text-neon-cyan block mb-1">TANGGAL</label>
                <input type="date" value={leaveDate} onChange={(e) => setLeaveDate(e.target.value)} className="pixel-input" />
              </div>
              <div>
                <label className="font-pixel text-[8px] text-neon-cyan block mb-1">KETERANGAN</label>
                <textarea value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)} rows={2} placeholder="Alasan..." className="pixel-input" />
              </div>
              <PixelButton variant="cyan" type="submit" className="w-full">APPLY LEAVE ▶</PixelButton>
            </form>

            <div>
              <p className="font-pixel text-[8px] text-neon-cyan mb-2">STATUS PENGAJUAN</p>
              <ul className="space-y-2">
                {leaves.length === 0 && (
                  <li className="font-body text-base text-neon-cyan/50 border-2 border-dashed border-ink-600 p-3 text-center">
                    Belum ada pengajuan
                  </li>
                )}
                {leaves.map((l) => (
                  <li key={l.id} className="flex items-center justify-between border-2 border-ink-600 px-3 py-2 font-body text-base">
                    <span><span className="uppercase text-neon-mint">{l.jenis}</span> · {l.tanggal}</span>
                    <span className="font-pixel text-[7px] text-neon-yellow border-2 border-neon-yellow px-2 py-1">
                      {l.status.toUpperCase()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </PixelCard>

        <PixelCard title="ACHIEVEMENT BADGES" badge="GAMIFY" accent="yellow">
          <div className="font-body text-base text-neon-cyan/50 border-2 border-dashed border-ink-600 p-3 text-center">
            Badges akan terbuka setelah ada data
          </div>
        </PixelCard>

        <Leaderboard />
      </div>
    </div>
  );
}
