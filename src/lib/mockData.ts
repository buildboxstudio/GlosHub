import { Staff } from "./types";

// Demo accounts (used only for DEMO MODE login):
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
];
