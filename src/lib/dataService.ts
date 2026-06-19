import { isSupabaseEnabled, createClient } from "@/lib/supabase/client";
import {
  Attendance,
  CustomerHandled,
  LeaveRequest,
  Salary,
  Staff,
} from "@/lib/types";

const PREFIX = "glos.admin.";

function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw) return JSON.parse(raw) as T;
  } catch { /* ignore */ }
  return fallback;
}

function saveLocal(key: string, value: unknown) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch { /* ignore */ }
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

// =============================================================
// STAFF-SIDE (used by dashboard)
// =============================================================

export async function getTodayAttendance(staffId: string): Promise<Attendance | null> {
  if (isSupabaseEnabled) {
    const supabase = createClient();
    const { data } = await supabase
      .from("attendance")
      .select("*")
      .eq("staff_id", staffId)
      .eq("tanggal", today())
      .maybeSingle();
    return data as Attendance | null;
  }
  const list: Attendance[] = loadLocal("attendance", []);
  return list.find((a) => a.staff_id === staffId && a.tanggal === today()) ?? null;
}

export async function checkIn(staffId: string, jam: string, status: string, lokasi?: string) {
  if (isSupabaseEnabled) {
    const supabase = createClient();
    await supabase.from("attendance").upsert({
      staff_id: staffId,
      tanggal: today(),
      check_in: jam,
      status,
      lokasi: lokasi ?? null,
    }, { onConflict: "staff_id,tanggal" });
    return;
  }
  const list: Attendance[] = loadLocal("attendance", []);
  const idx = list.findIndex((a) => a.staff_id === staffId && a.tanggal === today());
  const rec = { id: "a-" + Date.now(), staff_id: staffId, tanggal: today(), check_in: jam, check_out: null, status: status as any, lokasi: lokasi ?? null };
  if (idx >= 0) list[idx] = { ...list[idx], check_in: jam, status: status as any };
  else list.push(rec);
  saveLocal("attendance", list);
}

export async function checkOut(staffId: string, jam: string) {
  if (isSupabaseEnabled) {
    const supabase = createClient();
    await supabase.from("attendance").update({ check_out: jam }).eq("staff_id", staffId).eq("tanggal", today());
    return;
  }
  const list: Attendance[] = loadLocal("attendance", []);
  const idx = list.findIndex((a) => a.staff_id === staffId && a.tanggal === today());
  if (idx >= 0) list[idx] = { ...list[idx], check_out: jam };
  saveLocal("attendance", list);
}

export async function getStaffSalary(staffId: string): Promise<{ gaji_harian: number; bonus: number }> {
  if (isSupabaseEnabled) {
    const supabase = createClient();
    const { data } = await supabase.from("salary").select("*").eq("staff_id", staffId).maybeSingle();
    if (data) return { gaji_harian: Number((data as Salary).gaji_harian), bonus: Number((data as Salary).bonus) };
    return { gaji_harian: 150000, bonus: 0 };
  }
  const list: Salary[] = loadLocal("salaries", []);
  const s = list.find((x) => x.staff_id === staffId);
  return { gaji_harian: s?.gaji_harian ?? 150000, bonus: s?.bonus ?? 0 };
}

export async function getStaffCustomer(staffId: string): Promise<number> {
  if (isSupabaseEnabled) {
    const supabase = createClient();
    const { data } = await supabase.from("customer_handled").select("jumlah_customer").eq("staff_id", staffId).maybeSingle();
    return (data as any)?.jumlah_customer ?? 0;
  }
  const list: CustomerHandled[] = loadLocal("customers", []);
  return list.find((x) => x.staff_id === staffId)?.jumlah_customer ?? 0;
}

export async function addLeave(staffId: string, jenis: string, tanggal: string, alasan: string) {
  if (isSupabaseEnabled) {
    const supabase = createClient();
    await supabase.from("leave_request").insert({ staff_id: staffId, jenis, tanggal, alasan });
    return;
  }
  const list: LeaveRequest[] = loadLocal("leaves", []);
  list.unshift({ id: "l-" + Date.now(), staff_id: staffId, jenis: jenis as any, tanggal, alasan, status: "pending" });
  saveLocal("leaves", list);
}

export async function getStaffLeaves(staffId: string): Promise<LeaveRequest[]> {
  if (isSupabaseEnabled) {
    const supabase = createClient();
    const { data } = await supabase.from("leave_request").select("*").eq("staff_id", staffId).order("created_at", { ascending: false });
    return (data as LeaveRequest[]) ?? [];
  }
  const list: LeaveRequest[] = loadLocal("leaves", []);
  return list.filter((l) => l.staff_id === staffId);
}

export async function getMonthlyStats(staffId: string): Promise<{ hadir: number; terlambat: number; izin: number; sakit: number; cuti: number }> {
  if (isSupabaseEnabled) {
    const supabase = createClient();
    const { data } = await supabase
      .from("attendance")
      .select("status")
      .eq("staff_id", staffId)
      .gte("tanggal", today().slice(0, 7) + "-01");
    const rows = (data ?? []) as { status: string }[];
    const stats = { hadir: 0, terlambat: 0, izin: 0, sakit: 0, cuti: 0 };
    for (const r of rows) {
      const k = r.status as keyof typeof stats;
      if (k in stats) stats[k]++;
    }
    return stats;
  }
  return { hadir: 0, terlambat: 0, izin: 0, sakit: 0, cuti: 0 };
}

// =============================================================
// ADMIN-SIDE
// =============================================================

export async function loadStaff(): Promise<Staff[]> {
  if (isSupabaseEnabled) {
    const supabase = createClient();
    const { data } = await supabase.from("staff").select("*");
    return (data as Staff[]) ?? [];
  }
  return loadLocal("staff", []);
}

export async function saveStaff(list: Staff[]) {
  if (isSupabaseEnabled) {
    const supabase = createClient();
    for (const s of list) {
      const { id, ...rest } = s;
      await supabase.from("staff").upsert({ id, ...rest });
    }
    return;
  }
  saveLocal("staff", list);
}

export async function deleteStaffRow(id: string) {
  if (isSupabaseEnabled) {
    const supabase = createClient();
    await supabase.from("staff").delete().eq("id", id);
  }
}

export async function loadAttendance(): Promise<Attendance[]> {
  if (isSupabaseEnabled) {
    const supabase = createClient();
    const { data } = await supabase.from("attendance").select("*").order("tanggal", { ascending: false });
    return (data as Attendance[]) ?? [];
  }
  return loadLocal("attendance", []);
}

export async function saveAttendance(list: Attendance[]) {
  if (isSupabaseEnabled) {
    const supabase = createClient();
    for (const a of list) {
      await supabase.from("attendance").upsert(a, { onConflict: "staff_id,tanggal" });
    }
    return;
  }
  saveLocal("attendance", list);
}

export async function deleteAttendanceRow(id: string) {
  if (isSupabaseEnabled) {
    const supabase = createClient();
    await supabase.from("attendance").delete().eq("id", id);
  }
}

export async function loadSalaries(): Promise<Salary[]> {
  if (isSupabaseEnabled) {
    const supabase = createClient();
    const { data } = await supabase.from("salary").select("*");
    return (data as Salary[]) ?? [];
  }
  return loadLocal("salaries", []);
}

export async function saveSalaries(list: Salary[]) {
  if (isSupabaseEnabled) {
    const supabase = createClient();
    for (const s of list) {
      await supabase.from("salary").upsert(s, { onConflict: "staff_id,tanggal" });
    }
    return;
  }
  saveLocal("salaries", list);
}

export async function deleteSalaryRow(id: string) {
  if (isSupabaseEnabled) {
    const supabase = createClient();
    await supabase.from("salary").delete().eq("id", id);
  }
}

export async function loadCustomers(): Promise<CustomerHandled[]> {
  if (isSupabaseEnabled) {
    const supabase = createClient();
    const { data } = await supabase.from("customer_handled").select("*");
    return (data as CustomerHandled[]) ?? [];
  }
  return loadLocal("customers", []);
}

export async function saveCustomers(list: CustomerHandled[]) {
  if (isSupabaseEnabled) {
    const supabase = createClient();
    for (const c of list) {
      await supabase.from("customer_handled").upsert(c, { onConflict: "staff_id,tanggal" });
    }
    return;
  }
  saveLocal("customers", list);
}

export async function deleteCustomerRow(id: string) {
  if (isSupabaseEnabled) {
    const supabase = createClient();
    await supabase.from("customer_handled").delete().eq("id", id);
  }
}

export async function loadLeaves(): Promise<LeaveRequest[]> {
  if (isSupabaseEnabled) {
    const supabase = createClient();
    const { data } = await supabase.from("leave_request").select("*").order("created_at", { ascending: false });
    return (data as LeaveRequest[]) ?? [];
  }
  return loadLocal("leaves", []);
}

export async function saveLeaves(list: LeaveRequest[]) {
  if (isSupabaseEnabled) {
    const supabase = createClient();
    for (const l of list) {
      await supabase.from("leave_request").upsert(l);
    }
    return;
  }
  saveLocal("leaves", list);
}

export async function updateLeaveStatus(id: string, status: string) {
  if (isSupabaseEnabled) {
    const supabase = createClient();
    await supabase.from("leave_request").update({ status }).eq("id", id);
  }
}

export async function deleteLeaveRow(id: string) {
  if (isSupabaseEnabled) {
    const supabase = createClient();
    await supabase.from("leave_request").delete().eq("id", id);
  }
}
