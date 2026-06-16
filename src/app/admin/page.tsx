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
  Attendance,
  AttendanceStatus,
  CustomerHandled,
  LeaveRequest,
  LeaveType,
  RequestStatus,
  Salary,
  Staff,
} from "@/lib/types";
import { rupiah, todayISO, STATUS_COLOR, STATUS_LABEL } from "@/lib/format";
import { isSupabaseEnabled } from "@/lib/supabase/client";
import * as ds from "@/lib/dataService";

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

function uid() {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 10);
}

function ModalOverlay({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-md border-4 border-ink-600 bg-ink-900 p-6 pixel-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-pixel text-[9px] text-neon-pink">{title}</h2>
          <button onClick={onClose} className="font-pixel text-[8px] text-neon-red">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("staff");
  const [dataLoaded, setDataLoaded] = useState(false);

  const [staff, setStaff] = useState<Staff[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [customers, setCustomers] = useState<CustomerHandled[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [attFilter, setAttFilter] = useState<"harian" | "mingguan" | "bulanan">("harian");

  // Staff modal state
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [editStaffId, setEditStaffId] = useState<string | null>(null);
  const [staffForm, setStaffForm] = useState({ nama: "", email: "", jabatan: "", avatar: "therapist" });

  // Attendance modal
  const [showAttModal, setShowAttModal] = useState(false);
  const [attForm, setAttForm] = useState({ staff_id: "", tanggal: todayISO(), check_in: "", check_out: "", status: "hadir" as AttendanceStatus, lokasi: "" });

  // Customer modal
  const [showCustModal, setShowCustModal] = useState(false);
  const [custForm, setCustForm] = useState({ staff_id: "", tanggal: todayISO(), jumlah_customer: 0 });

  // Salary modal
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [salaryForm, setSalaryForm] = useState({ staff_id: "", gaji_harian: 150000, bonus: 0 });

  useEffect(() => {
    if (!loading && !user) router.replace("/");
    if (!loading && user?.role !== "admin") router.replace("/dashboard");
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role !== "admin") return;
    Promise.all([
      ds.loadStaff(),
      ds.loadAttendance(),
      ds.loadSalaries(),
      ds.loadCustomers(),
      ds.loadLeaves(),
    ]).then(([s, a, sal, c, l]) => {
      setStaff(s);
      setAttendance(a);
      setSalaries(sal);
      setCustomers(c);
      setLeaves(l);
      setDataLoaded(true);
    });
  }, [user]);

  useEffect(() => { if (dataLoaded) ds.saveStaff(staff); }, [staff, dataLoaded]);
  useEffect(() => { if (dataLoaded) ds.saveAttendance(attendance); }, [attendance, dataLoaded]);
  useEffect(() => { if (dataLoaded) ds.saveSalaries(salaries); }, [salaries, dataLoaded]);
  useEffect(() => { if (dataLoaded) ds.saveCustomers(customers); }, [customers, dataLoaded]);
  useEffect(() => { if (dataLoaded) ds.saveLeaves(leaves); }, [leaves, dataLoaded]);

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

  // ---- Staff ----
  function toggleActive(id: string) {
    setStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  }

  function openAddStaff() {
    setEditStaffId(null);
    setStaffForm({ nama: "", email: "", jabatan: "", avatar: "therapist" });
    setShowStaffModal(true);
  }

  function openEditStaff(s: Staff) {
    setEditStaffId(s.id);
    setStaffForm({ nama: s.nama, email: s.email, jabatan: s.jabatan, avatar: s.avatar });
    setShowStaffModal(true);
  }

  function saveStaff() {
    if (!staffForm.nama || !staffForm.email) return;
    if (isSupabaseEnabled && !editStaffId) {
      alert("Di mode Supabase, staff harus daftar sendiri via halaman login.\n\nAdmin bisa menambah staff via menu Authentication di dashboard Supabase.");
      setShowStaffModal(false);
      return;
    }
    if (editStaffId) {
      setStaff((prev) =>
        prev.map((s) =>
          s.id === editStaffId ? { ...s, ...staffForm } : s
        )
      );
    } else {
      setStaff((prev) => [
        ...prev,
        {
          id: uid(),
          nama: staffForm.nama,
          email: staffForm.email,
          role: "staff",
          jabatan: staffForm.jabatan,
          level: 1,
          xp: 0,
          xp_to_next: 1000,
          avatar: staffForm.avatar,
          active: true,
        },
      ]);
    }
    setShowStaffModal(false);
  }

  function deleteStaff(id: string) {
    setStaff((prev) => prev.filter((s) => s.id !== id));
    ds.deleteStaffRow(id);
  }

  // ---- Attendance ----
  function addAttendance() {
    if (!attForm.staff_id) return;
    setAttendance((prev) => [
      ...prev,
      {
        id: "a-" + uid(),
        staff_id: attForm.staff_id,
        tanggal: attForm.tanggal,
        check_in: attForm.check_in || null,
        check_out: attForm.check_out || null,
        status: attForm.status,
        lokasi: attForm.lokasi || null,
      },
    ]);
    setShowAttModal(false);
    setAttForm({ staff_id: "", tanggal: todayISO(), check_in: "", check_out: "", status: "hadir", lokasi: "" });
  }

  function deleteAttendance(id: string) {
    setAttendance((prev) => prev.filter((a) => a.id !== id));
    ds.deleteAttendanceRow(id);
  }

  // ---- Salary ----
  function addSalary() {
    if (!salaryForm.staff_id) return;
    setSalaries((prev) => [
      ...prev,
      {
        id: "g-" + uid(),
        staff_id: salaryForm.staff_id,
        tanggal: todayISO(),
        gaji_harian: salaryForm.gaji_harian,
        bonus: salaryForm.bonus,
      },
    ]);
    setShowSalaryModal(false);
    setSalaryForm({ staff_id: "", gaji_harian: 150000, bonus: 0 });
  }

  function updateSalary(id: string, field: "gaji_harian" | "bonus", value: number) {
    setSalaries((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  }

  function deleteSalary(id: string) {
    setSalaries((prev) => prev.filter((s) => s.id !== id));
    ds.deleteSalaryRow(id);
  }

  // ---- Customer ----
  function addCustomer() {
    if (!custForm.staff_id) return;
    setCustomers((prev) => [
      ...prev,
      {
        id: "c-" + uid(),
        staff_id: custForm.staff_id,
        tanggal: custForm.tanggal,
        jumlah_customer: custForm.jumlah_customer,
      },
    ]);
    setShowCustModal(false);
    setCustForm({ staff_id: "", tanggal: todayISO(), jumlah_customer: 0 });
  }

  function updateCustomer(id: string, jumlah_customer: number) {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, jumlah_customer } : c))
    );
  }

  function deleteCustomer(id: string) {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    ds.deleteCustomerRow(id);
  }

  // ---- Leave ----
  function setLeaveStatus(id: string, status: RequestStatus) {
    setLeaves((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l))
    );
    ds.updateLeaveStatus(id, status);
  }

  function deleteLeave(id: string) {
    setLeaves((prev) => prev.filter((l) => l.id !== id));
    ds.deleteLeaveRow(id);
  }

  return (
    <div className="relative min-h-screen pb-16">
      <PixelBackground />
      <HudBar subtitle="ADMIN CONTROL ROOM" />

      {showStaffModal && (
        <ModalOverlay title={editStaffId ? "EDIT STAFF" : "TAMBAH STAFF"} onClose={() => setShowStaffModal(false)}>
          <div className="space-y-3 font-body text-base">
            <input className="pixel-input" placeholder="Nama" value={staffForm.nama}
              onChange={(e) => setStaffForm({ ...staffForm, nama: e.target.value })} />
            <input className="pixel-input" placeholder="Email" value={staffForm.email}
              onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} />
            <input className="pixel-input" placeholder="Jabatan (Nail Artist, Lash Specialist, dll)" value={staffForm.jabatan}
              onChange={(e) => setStaffForm({ ...staffForm, jabatan: e.target.value })} />
            <div>
              <p className="text-neon-cyan/70 text-sm mb-1">Avatar</p>
              <div className="flex gap-2">
                {["therapist", "lash", "boss"].map((a) => (
                  <button key={a} onClick={() => setStaffForm({ ...staffForm, avatar: a })}
                    className={`border-2 px-3 py-1 font-pixel text-[8px] ${staffForm.avatar === a ? "border-neon-cyan text-neon-cyan" : "border-ink-600 text-neon-cyan/50"}`}>
                    {a.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <PixelButton variant="mint" onClick={saveStaff} className="!text-[8px] w-full">
              {editStaffId ? "SIMPAN" : "TAMBAH"}
            </PixelButton>
          </div>
        </ModalOverlay>
      )}

      {showAttModal && (
        <ModalOverlay title="TAMBAH ABSENSI" onClose={() => setShowAttModal(false)}>
          <div className="space-y-3 font-body text-base">
            <select className="pixel-input" value={attForm.staff_id}
              onChange={(e) => setAttForm({ ...attForm, staff_id: e.target.value })}>
              <option value="">-- Pilih Staff --</option>
              {staff.filter((s) => s.role === "staff" && s.active).map((s) => (
                <option key={s.id} value={s.id}>{s.nama}</option>
              ))}
            </select>
            <input className="pixel-input" type="date" value={attForm.tanggal}
              onChange={(e) => setAttForm({ ...attForm, tanggal: e.target.value })} />
            <input className="pixel-input" type="time" placeholder="Check In" value={attForm.check_in}
              onChange={(e) => setAttForm({ ...attForm, check_in: e.target.value })} />
            <input className="pixel-input" type="time" placeholder="Check Out" value={attForm.check_out}
              onChange={(e) => setAttForm({ ...attForm, check_out: e.target.value })} />
            <select className="pixel-input" value={attForm.status}
              onChange={(e) => setAttForm({ ...attForm, status: e.target.value as AttendanceStatus })}>
              <option value="hadir">HADIR</option>
              <option value="terlambat">TERLAMBAT</option>
              <option value="izin">IZIN</option>
              <option value="sakit">SAKIT</option>
              <option value="cuti">CUTI</option>
            </select>
            <input className="pixel-input" placeholder="Lokasi" value={attForm.lokasi}
              onChange={(e) => setAttForm({ ...attForm, lokasi: e.target.value })} />
            <PixelButton variant="cyan" onClick={addAttendance} className="!text-[8px] w-full">
              TAMBAH
            </PixelButton>
          </div>
        </ModalOverlay>
      )}

      {showCustModal && (
        <ModalOverlay title="TAMBAH CUSTOMER" onClose={() => setShowCustModal(false)}>
          <div className="space-y-3 font-body text-base">
            <select className="pixel-input" value={custForm.staff_id}
              onChange={(e) => setCustForm({ ...custForm, staff_id: e.target.value })}>
              <option value="">-- Pilih Staff --</option>
              {staff.filter((s) => s.role === "staff" && s.active).map((s) => (
                <option key={s.id} value={s.id}>{s.nama}</option>
              ))}
            </select>
            <input className="pixel-input" type="date" value={custForm.tanggal}
              onChange={(e) => setCustForm({ ...custForm, tanggal: e.target.value })} />
            <input className="pixel-input" type="number" placeholder="Jumlah Customer" value={custForm.jumlah_customer}
              onChange={(e) => setCustForm({ ...custForm, jumlah_customer: Number(e.target.value) })} />
            <PixelButton variant="pink" onClick={addCustomer} className="!text-[8px] w-full">
              TAMBAH
            </PixelButton>
          </div>
        </ModalOverlay>
      )}

      {showSalaryModal && (
        <ModalOverlay title="TAMBAH GAJI" onClose={() => setShowSalaryModal(false)}>
          <div className="space-y-3 font-body text-base">
            <select className="pixel-input" value={salaryForm.staff_id}
              onChange={(e) => setSalaryForm({ ...salaryForm, staff_id: e.target.value })}>
              <option value="">-- Pilih Staff --</option>
              {staff.filter((s) => s.role === "staff" && s.active).map((s) => (
                <option key={s.id} value={s.id}>{s.nama}</option>
              ))}
            </select>
            <input className="pixel-input" type="number" placeholder="Gaji Harian" value={salaryForm.gaji_harian}
              onChange={(e) => setSalaryForm({ ...salaryForm, gaji_harian: Number(e.target.value) })} />
            <input className="pixel-input" type="number" placeholder="Bonus" value={salaryForm.bonus}
              onChange={(e) => setSalaryForm({ ...salaryForm, bonus: Number(e.target.value) })} />
            <PixelButton variant="yellow" onClick={addSalary} className="!text-[8px] w-full">
              TAMBAH
            </PixelButton>
          </div>
        </ModalOverlay>
      )}

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
              <PixelButton variant="mint" className="!text-[8px]" onClick={openAddStaff}>
                + TAMBAH STAFF
              </PixelButton>
            </div>
            {staff.filter((s) => s.role === "staff").length === 0 ? (
              <p className="font-body text-base text-neon-cyan/50 text-center py-6">
                Belum ada staff. Klik "TAMBAH STAFF" untuk mulai.
              </p>
            ) : (
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
                            <span className={s.active ? "text-neon-mint" : "text-neon-red"}>
                              {s.active ? "AKTIF" : "NONAKTIF"}
                            </span>
                          </td>
                          <td className="p-2 flex gap-1 flex-wrap">
                            <button onClick={() => openEditStaff(s)}
                              className="font-pixel text-[7px] border-2 border-neon-cyan text-neon-cyan px-2 py-1">
                              EDIT
                            </button>
                            <button onClick={() => toggleActive(s.id)}
                              className="font-pixel text-[7px] border-2 border-neon-yellow text-neon-yellow px-2 py-1">
                              {s.active ? "OFF" : "ON"}
                            </button>
                            <button onClick={() => deleteStaff(s.id)}
                              className="font-pixel text-[7px] border-2 border-neon-red text-neon-red px-2 py-1">
                              HAPUS
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </PixelCard>
        )}

        {/* ===== Attendance Management ===== */}
        {tab === "attendance" && (
          <PixelCard title="ATTENDANCE MANAGEMENT" badge="MENU" accent="cyan">
            <div className="mb-4 flex gap-2 flex-wrap items-center">
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
              <div className="ml-auto">
                <PixelButton variant="cyan" className="!text-[8px]" onClick={() => setShowAttModal(true)}>
                  + TAMBAH ABSENSI
                </PixelButton>
              </div>
            </div>
            {attendance.length === 0 ? (
              <p className="font-body text-base text-neon-cyan/50 text-center py-6">
                Belum ada data absensi. Klik "TAMBAH ABSENSI" untuk mulai.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full font-body text-base">
                  <thead>
                    <tr className="font-pixel text-[7px] text-neon-cyan text-left">
                      <th className="p-2">STAFF</th>
                      <th className="p-2">TANGGAL</th>
                      <th className="p-2">IN</th>
                      <th className="p-2">OUT</th>
                      <th className="p-2">STATUS</th>
                      <th className="p-2">AKSI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((a) => (
                      <tr key={a.id} className="border-t-2 border-ink-600">
                        <td className="p-2 text-neon-mint">{nameOf(a.staff_id)}</td>
                        <td className="p-2">{a.tanggal}</td>
                        <td className="p-2 text-neon-mint">{a.check_in ?? "-"}</td>
                        <td className="p-2 text-neon-pink">{a.check_out ?? "-"}</td>
                        <td className={`p-2 font-pixel text-[8px] ${STATUS_COLOR[a.status]}`}>
                          {STATUS_LABEL[a.status]}
                        </td>
                        <td className="p-2">
                          <button onClick={() => deleteAttendance(a.id)}
                            className="font-pixel text-[7px] border-2 border-neon-red text-neon-red px-2 py-1">
                            HAPUS
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </PixelCard>
        )}

        {/* ===== Salary Management ===== */}
        {tab === "salary" && (
          <PixelCard title="SALARY MANAGEMENT" badge="MENU" accent="yellow">
            <div className="mb-4 flex justify-end">
              <PixelButton variant="yellow" className="!text-[8px]" onClick={() => setShowSalaryModal(true)}>
                + TAMBAH GAJI
              </PixelButton>
            </div>
            {salaries.length === 0 ? (
              <p className="font-body text-base text-neon-cyan/50 text-center py-6">
                Belum ada data gaji. Klik "TAMBAH GAJI" untuk mulai.
              </p>
            ) : (
              <div className="space-y-3">
                {salaries.map((sal) => {
                  const s = staff.find((x) => x.id === sal.staff_id);
                  return (
                    <div key={sal.id}
                      className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-2 border-ink-600 p-3 items-center"
                    >
                      <span className="text-neon-mint font-body text-base">
                        {s?.nama ?? sal.staff_id}
                      </span>
                      <label className="font-body text-sm">
                        <span className="text-neon-cyan/70 block text-xs">Gaji Harian</span>
                        <input type="number" value={sal.gaji_harian}
                          onChange={(e) => updateSalary(sal.id, "gaji_harian", Number(e.target.value))}
                          className="pixel-input !py-1 !text-base" />
                      </label>
                      <label className="font-body text-sm">
                        <span className="text-neon-cyan/70 block text-xs">Bonus</span>
                        <input type="number" value={sal.bonus}
                          onChange={(e) => updateSalary(sal.id, "bonus", Number(e.target.value))}
                          className="pixel-input !py-1 !text-base" />
                      </label>
                      <button onClick={() => deleteSalary(sal.id)}
                        className="font-pixel text-[7px] border-2 border-neon-red text-neon-red px-2 py-1 h-fit">
                        HAPUS
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </PixelCard>
        )}

        {/* ===== Customer Handling ===== */}
        {tab === "customer" && (
          <PixelCard title="CUSTOMER HANDLING" badge="MENU" accent="pink">
            <div className="mb-4 flex justify-end">
              <PixelButton variant="pink" className="!text-[8px]" onClick={() => setShowCustModal(true)}>
                + TAMBAH CUSTOMER
              </PixelButton>
            </div>
            {customers.length === 0 ? (
              <p className="font-body text-base text-neon-cyan/50 text-center py-6">
                Belum ada data customer. Klik "TAMBAH CUSTOMER" untuk mulai.
              </p>
            ) : (
              <div className="space-y-3">
                {customers.map((c) => {
                  const s = staff.find((x) => x.id === c.staff_id);
                  return (
                    <div key={c.id}
                      className="flex items-center justify-between border-2 border-ink-600 p-3"
                    >
                      <span className="text-neon-mint font-body text-base">
                        {s?.nama ?? c.staff_id}
                      </span>
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 font-body text-base">
                          <span className="text-neon-cyan/70 text-sm">Customer</span>
                          <input type="number" value={c.jumlah_customer}
                            onChange={(e) => updateCustomer(c.id, Number(e.target.value))}
                            className="pixel-input !w-24 !py-1 !text-base" />
                        </label>
                        <button onClick={() => deleteCustomer(c.id)}
                          className="font-pixel text-[7px] border-2 border-neon-red text-neon-red px-2 py-1">
                          HAPUS
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </PixelCard>
        )}

        {/* ===== Approval Center ===== */}
        {tab === "approval" && (
          <PixelCard title="APPROVAL CENTER" badge="MENU" accent="mint">
            {leaves.length === 0 ? (
              <p className="font-body text-base text-neon-cyan/50 text-center py-6">
                Belum ada pengajuan ijin.
              </p>
            ) : (
              <ul className="space-y-2">
                {leaves.map((l) => (
                  <li key={l.id}
                    className="flex flex-wrap items-center justify-between gap-3 border-2 border-ink-600 p-3 font-body text-base"
                  >
                    <div>
                      <span className="text-neon-mint">{nameOf(l.staff_id)}</span>{" "}
                      · <span className="uppercase text-neon-cyan">{l.jenis}</span>{" "}
                      · {l.tanggal}
                      <p className="text-neon-cyan/60 text-sm">{l.alasan}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-pixel text-[7px] px-2 py-1 border-2 ${
                        l.status === "approved"
                          ? "border-neon-mint text-neon-mint"
                          : l.status === "rejected"
                          ? "border-neon-red text-neon-red"
                          : "border-neon-yellow text-neon-yellow"
                      }`}>
                        {l.status.toUpperCase()}
                      </span>
                      {l.status === "pending" && (
                        <>
                          <button onClick={() => setLeaveStatus(l.id, "approved")}
                            className="font-pixel text-[7px] border-2 border-neon-mint text-neon-mint px-2 py-1">
                            OK
                          </button>
                          <button onClick={() => setLeaveStatus(l.id, "rejected")}
                            className="font-pixel text-[7px] border-2 border-neon-red text-neon-red px-2 py-1">
                            NO
                          </button>
                        </>
                      )}
                      <button onClick={() => deleteLeave(l.id)}
                        className="font-pixel text-[7px] border-2 border-neon-red text-neon-red px-2 py-1">
                        HAPUS
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
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

        <Leaderboard />
      </div>
    </div>
  );
}
