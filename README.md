# GlosHub – Beauty Staff Adventure

**Retro pixel‑game staff attendance & monitoring** for GLOS Studio (Nail Art · Eyelash Extension · Lash Lift · Beauty Treatment).

Built with **Next.js 15 · TypeScript · TailwindCSS · Framer Motion · Supabase**.

## 🚀 Live Deployment

1. **Push to GitHub (private repo)**
   ```powershell
   # Jalankan script deploy (Windows PowerShell as Administrator)
   .\deploy-to-github.ps1
   ```
   You'll need a GitHub Personal Access Token with `repo` scope.

2. **Setup Supabase (required for real data)**
   - Create free project at [supabase.com](https://supabase.com)
   - Run `supabase/schema.sql` in the SQL Editor
   - Add users in Authentication → Users
   - In Project Settings → API, copy **URL** and **anon key**

3. **Deploy to Vercel**
   - Import this GitHub repo at [vercel.com](https://vercel.com)
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL` (your project URL)
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (your anon key)
   - Deploy → get public URL like `glos‑hub.vercel.app`

## 🎮 Demo Mode (no setup)

If Supabase credentials are absent, the app runs in **demo mode** with local login and mock data.

**Demo accounts:**
- Admin: `admin@glos.studio` / `admin123`
- Staff: `nadia@glos.studio` / `staff123`

## 🛠 Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000 (or http://127.0.0.1:3000 if VPN blocks localhost)

## 📁 Project Structure

```
src/app/
  page.tsx                 # Login / START GAME
  dashboard/page.tsx       # Staff player dashboard (7 missions)
  admin/page.tsx           # Admin game‑master console
src/components/pixel/      # Pixel‑art UI components
src/lib/                  # Auth, types, mock data, Supabase client
supabase/schema.sql       # Database schema + RLS policies
```

## 🎯 Features

**Staff Dashboard:**
- Attendance (check‑in/out, status, GPS/selfie optional)
- Daily earnings (pixel coin counter)
- Customer handled counter
- Attendance stats (monthly cards)
- Weekly quest summary
- Monthly boss‑battle report
- Leave request window
- Achievement badges & leaderboard

**Admin Console:**
- Staff management
- Attendance management (daily/weekly/monthly)
- Salary management (gaji, bonus, insentif)
- Customer handling input
- Leave request approval
- Reports (PDF/Excel export)

## 🔒 Security

- **Private GitHub repo** – code not exposed publicly
- **Supabase RLS** – row‑level security for data isolation
- **Environment variables** – never commit `.env.local`
- **Demo mode** – works without credentials for quick testing

---

**GlosHub** – GLOS STUDIO STAFF PORTAL · Beauty Staff Adventure
