export type Role = "admin" | "staff";

export type AttendanceStatus =
  | "hadir"
  | "terlambat"
  | "cuti"
  | "sakit"
  | "izin";

export type LeaveType = "sakit" | "izin" | "mendesak" | "cuti";

export type RequestStatus = "pending" | "approved" | "rejected";

export interface Staff {
  id: string;
  nama: string;
  email: string;
  role: Role;
  jabatan: string;
  level: number;
  xp: number;
  xp_to_next: number;
  avatar: string; // emoji / pixel sprite key
  active: boolean;
}

export interface Attendance {
  id: string;
  staff_id: string;
  tanggal: string; // ISO date
  check_in: string | null; // HH:mm
  check_out: string | null; // HH:mm
  status: AttendanceStatus;
  lokasi?: string | null;
  selfie?: string | null;
}

export interface CustomerHandled {
  id: string;
  staff_id: string;
  tanggal: string;
  jumlah_customer: number;
}

export interface Salary {
  id: string;
  staff_id: string;
  tanggal: string;
  gaji_harian: number;
  bonus: number;
}

export interface LeaveRequest {
  id: string;
  staff_id: string;
  jenis: LeaveType;
  tanggal: string;
  alasan: string;
  status: RequestStatus;
  lampiran?: string | null;
}

export interface Badge {
  key: string;
  label: string;
  icon: string;
  earned: boolean;
}
