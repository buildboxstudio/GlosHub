export function rupiah(n: number): string {
  return "Rp " + n.toLocaleString("id-ID");
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function nowHM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}

export const STATUS_LABEL: Record<string, string> = {
  hadir: "HADIR",
  terlambat: "TERLAMBAT",
  cuti: "CUTI",
  sakit: "SAKIT",
  izin: "IZIN",
};

export const STATUS_COLOR: Record<string, string> = {
  hadir: "text-neon-mint",
  terlambat: "text-neon-yellow",
  cuti: "text-neon-purple",
  sakit: "text-neon-red",
  izin: "text-neon-cyan",
};
