import {
  Attendance,
  Badge,
  CustomerHandled,
  LeaveRequest,
  Salary,
  Staff,
} from "./types";

// Demo accounts (used in DEMO MODE):
//   admin@glos.studio / admin123  -> Admin
//   nadia@glos.studio / staff123  -> Staff
export const MOCK_STAFF: Staff[] = [
  {
    id: "s-admin",
    nama: "Mira Admin",
    email: "admin@glos.studio",
    role: "admin",
    jabatan: "Studio Manager",
    level: 20,
    xp: 420,
    xp_to_next: 1000,
    avatar: "boss",
    active: true,
  },
  {
    id: "s-001",
    nama: "Nadia",
    email: "nadia@glos.studio",
    role: "staff",
    jabatan: "Nail Artist",
    level: 7,
    xp: 640,
    xp_to_next: 1000,
    avatar: "therapist",
    active: true,
  },
  {
    id: "s-002",
    nama: "Sasa",
    email: "sasa@glos.studio",
    role: "staff",
    jabatan: "Lash Specialist",
    level: 9,
    xp: 880,
    xp_to_next: 1000,
    avatar: "lash",
    active: true,
  },
  {
    id: "s-003",
    nama: "Bella",
    email: "bella@glos.studio",
    role: "staff",
    jabatan: "Beauty Therapist",
    level: 5,
    xp: 300,
    xp_to_next: 1000,
    avatar: "therapist",
    active: true,
  },
  {
    id: "s-004",
    nama: "Tari",
    email: "tari@glos.studio",
    role: "staff",
    jabatan: "Lash Lift Pro",
    level: 6,
    xp: 510,
    xp_to_next: 1000,
    avatar: "lash",
    active: false,
  },
];

const today = new Date().toISOString().slice(0, 10);

export const MOCK_ATTENDANCE: Attendance[] = [
  { id: "a1", staff_id: "s-001", tanggal: today, check_in: "09:02", check_out: null, status: "terlambat", lokasi: "Studio Pusat" },
  { id: "a2", staff_id: "s-002", tanggal: today, check_in: "08:45", check_out: null, status: "hadir", lokasi: "Studio Pusat" },
  { id: "a3", staff_id: "s-003", tanggal: today, check_in: "08:55", check_out: null, status: "hadir", lokasi: "Studio Pusat" },
];

export const MOCK_CUSTOMERS: CustomerHandled[] = [
  { id: "c1", staff_id: "s-001", tanggal: today, jumlah_customer: 8 },
  { id: "c2", staff_id: "s-002", tanggal: today, jumlah_customer: 11 },
  { id: "c3", staff_id: "s-003", tanggal: today, jumlah_customer: 6 },
];

export const MOCK_SALARY: Salary[] = [
  { id: "g1", staff_id: "s-001", tanggal: today, gaji_harian: 150000, bonus: 50000 },
  { id: "g2", staff_id: "s-002", tanggal: today, gaji_harian: 150000, bonus: 90000 },
  { id: "g3", staff_id: "s-003", tanggal: today, gaji_harian: 150000, bonus: 30000 },
];

export const MOCK_LEAVE: LeaveRequest[] = [
  { id: "l1", staff_id: "s-001", jenis: "izin", tanggal: today, alasan: "Keperluan keluarga", status: "pending" },
  { id: "l2", staff_id: "s-003", jenis: "sakit", tanggal: today, alasan: "Demam", status: "approved" },
  { id: "l3", staff_id: "s-002", jenis: "cuti", tanggal: today, alasan: "Liburan", status: "rejected" },
];

// Monthly aggregate stats per staff (demo)
export const MOCK_MONTHLY: Record<
  string,
  { hadir: number; terlambat: number; izin: number; sakit: number; cuti: number }
> = {
  "s-001": { hadir: 18, terlambat: 3, izin: 1, sakit: 1, cuti: 0 },
  "s-002": { hadir: 21, terlambat: 1, izin: 0, sakit: 0, cuti: 1 },
  "s-003": { hadir: 16, terlambat: 4, izin: 2, sakit: 1, cuti: 0 },
};

export function badgesFor(staff: Staff): Badge[] {
  const m = MOCK_MONTHLY[staff.id];
  return [
    { key: "attendance_hero", label: "Attendance Hero", icon: "🛡️", earned: !!m && m.hadir >= 18 },
    { key: "customer_master", label: "Customer Master", icon: "⭐", earned: staff.level >= 7 },
    { key: "perfect_month", label: "Perfect Month", icon: "👑", earned: !!m && m.terlambat === 0 },
    { key: "top_performer", label: "Top Performer", icon: "🏆", earned: staff.xp >= 800 },
  ];
}
