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

// ---- Staff ----
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

// ---- Attendance ----
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
      await supabase.from("attendance").upsert(a);
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

// ---- Salary ----
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
      await supabase.from("salary").upsert(s);
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

// ---- Customer ----
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
      await supabase.from("customer_handled").upsert(c);
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

// ---- Leave ----
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
