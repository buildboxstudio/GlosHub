# PowerShell script untuk deploy GlosHub ke GitHub private repo
# Jalankan di PowerShell sebagai Administrator (jika perlu), atau cukup Run as Administrator
Write-Host "=== GLOSHUB GITHUB DEPLOY ===" -ForegroundColor Cyan
Write-Host "Pastikan kamu sudah punya Personal Access Token (PAT) dari GitHub dengan scope `repo`" -ForegroundColor Yellow
Write-Host ""

# 1. Konfirmasi repo target
$remoteUrl = "https://github.com/buildboxstudio/GlosHub.git"
Write-Host "Repo target: $remoteUrl" -ForegroundColor Magenta

# 2. Hapus .git lama jika ada di parent folder (aman)
if (Test-Path "..\.git") {
    Remove-Item -Recurse -Force ..\.git -ErrorAction SilentlyContinue
    Write-Host "Removed parent .git folder" -ForegroundColor Green
}

# 3. Inisialisasi Git di folder ini saja
Write-Host "Initializing Git in project folder..." -ForegroundColor Cyan
git init
git config user.email "deploy@glos.studio"
git config user.name "GlosHub Deploy"

# 4. Tambahkan remote (gunakan PAT di URL)
Write-Host ""
Write-Host "*** MASUKKAN PERSONAL ACCESS TOKEN KAMU ***" -ForegroundColor Red
$pat = Read-Host -Prompt "Token (jangan pakai password biasa!)"
if (-not $pat) {
    Write-Host "Token kosong. Aborting." -ForegroundColor Red
    exit 1
}

# Remote dengan PAT: https://USERNAME:TOKEN@github.com/buildboxstudio/GlosHub.git
# Kita minta username GitHub juga untuk membentuk URL lengkap
$ghUser = Read-Host -Prompt "Username GitHub (misal: buildboxstudio)"
$remoteWithAuth = "https://${ghUser}:${pat}@github.com/buildboxstudio/GlosHub.git"

git remote add origin $remoteWithAuth

# 5. Hapus file yang tidak perlu di-track
Write-Host "Cleaning up untracked files..." -ForegroundColor Cyan
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
}
if (Test-Path "node_modules") {
    # node_modules sudah di-.gitignore, tapi hapus untuk aman
    Write-Host "node_modules/ akan diabaikan (ada di .gitignore)" -ForegroundColor Gray
}

# 6. Stage & commit
Write-Host "Staging files..." -ForegroundColor Cyan
git add .
Write-Host "Committing..." -ForegroundColor Cyan
git commit -m "Deploy GlosHub v1.0 – Beauty Staff Adventure"

# 7. Push ke GitHub (force push jika repo sudah ada dan ingin ganti semua)
Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
Write-Host "Ini akan overwrite repo yang ada (force push). Yakin?" -ForegroundColor Yellow
$confirm = Read-Host "[y/N]"
if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host "Push dibatalkan." -ForegroundColor Red
    exit 0
}

git branch -M main
git push -u origin main --force

Write-Host ""
Write-Host "✅ SELESAI!" -ForegroundColor Green
Write-Host "Proyek GlosHub sudah di-push ke $remoteUrl" -ForegroundColor Green
Write-Host ""
Write-Host "Langkah selanjutnya:" -ForegroundColor Cyan
Write-Host "1. Buka https://github.com/buildboxstudio/GlosHub untuk verifikasi" -ForegroundColor White
Write-Host "2. Setup Supabase (jalankan supabase/schema.sql)" -ForegroundColor White
Write-Host "3. Deploy ke Vercel: import dari repo ini, tambah env variables" -ForegroundColor White
Write-Host ""
Write-Host "Token PAT sudah disimpan di remote URL cache. Hati‑hati jangan expose log ini." -ForegroundColor Yellow
