# 📱 Panduan Workflow — BonTracker (RenoTrack)

Aplikasi pencatat pengeluaran renovasi rumah dengan fitur OCR struk berbasis AI.

---

## 🚀 Setup Awal

### 1. Install Dependencies
```bash
npm install
```

### 2. Konfigurasi Environment
Buat file `.env` di root project (copy dari `.env.example`):
```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
SUMOPOD_API_KEY=""
SUMOPOD_BASE_URL="https://ai.sumopod.com"
AI_MODEL="gemini/gemini-2.0-flash"
```

### 3. Setup Database
```bash
npm run db:migrate   # Buat tabel di Neon DB
npm run db:seed      # Isi data contoh (opsional)
```

### 4. Jalankan Aplikasi
Buka 2 terminal:
```bash
# Terminal 1 — Backend API
npm run dev:server

# Terminal 2 — Frontend
npm run dev
```
Buka http://localhost:3000

---

## 📋 Workflow Penggunaan

### Langkah 1: Konfigurasi AI (Pertama Kali)

1. Klik ikon ⚙️ (Settings) di kanan atas
2. Pilih **Provider** → Sumopod
3. Pilih **Model** → `gemini/gemini-2.0-flash` (rekomendasi: murah & cepat)
4. Masukkan **API Key** dari dashboard Sumopod (menu API Keys)
5. Klik **"Test Koneksi & Simpan"**
6. Pastikan muncul pesan hijau "Koneksi berhasil!"

---

### Langkah 2: Input Pengeluaran

Ada 2 cara input pengeluaran:

#### Cara A — Input Manual
1. Di **Dashboard**, klik tombol **"Tambah"** (kotak oranye dengan ikon +)
2. Atau di halaman **Riwayat**, klik tombol **+** (FAB di kanan bawah)
3. Isi form:
   - **Judul** — nama barang/jasa (wajib)
   - **Jumlah (Rp)** — nominal pengeluaran (wajib)
   - **Kategori** — Material / Tukang / Alat / Lainnya
   - **Toko/Sumber** — nama toko (opsional)
   - **Tanggal** — tanggal transaksi
   - **Catatan** — detail tambahan (opsional)
4. Klik **"Simpan Pengeluaran"**

#### Cara B — Scan Struk (OCR AI)
1. Buka menu **"Struk OCR"** (ikon kamera di navigasi bawah)
2. Klik area **"Foto Bon / Upload Gambar"**
3. Pilih foto struk dari galeri atau ambil foto langsung (mobile)
4. Tunggu AI menganalisa struk (2-5 detik)
5. Hasil OCR otomatis mengisi form:
   - Nama toko
   - Tanggal
   - Kategori (ditentukan AI)
   - Total belanja
   - Daftar item terdeteksi
6. Periksa & koreksi jika perlu
7. Klik **"Simpan Transaksi"**

---

### Langkah 3: Pantau Dashboard

Dashboard menampilkan:
- **Total Pengeluaran** — akumulasi semua transaksi
- **Progres Anggaran** — persentase budget terpakai
- **Sisa Anggaran** — budget yang masih tersedia
- **Kategori** — breakdown per kategori (Material, Tukang, Alat)
- **Transaksi Terbaru** — 5 transaksi terakhir
- **Tahap Proyek** — fase renovasi saat ini

---

### Langkah 4: Lihat Riwayat

1. Buka menu **"Riwayat"** (ikon receipt di navigasi bawah)
2. Gunakan **search** untuk cari transaksi/toko
3. Gunakan **filter kategori** (Semua / Material / Tukang / Alat / Lainnya)
4. Transaksi dikelompokkan per tanggal
5. Lihat ringkasan: Total Bulan Ini & Transaksi Terbesar

---

### Langkah 5: Reset Data (Jika Diperlukan)

1. Buka **Settings** (⚙️)
2. Scroll ke bawah ke section **"Hapus Data"**
3. Pilih:
   - **Hapus Semua Pengeluaran** — hanya hapus transaksi
   - **Reset Semua Data** — hapus transaksi + kategori + anggaran
4. Konfirmasi dengan klik **"Ya, Hapus"**

---

## 🗂️ Struktur Menu

| Menu | Ikon | Fungsi |
|------|------|--------|
| Dasbor | 📊 | Ringkasan keuangan & progres |
| Riwayat | 📋 | Daftar semua transaksi |
| Struk OCR | 📷 | Scan struk dengan AI |
| Analisis | 📈 | Grafik & analitik (coming soon) |
| Settings | ⚙️ | Konfigurasi AI & reset data |

---

## 💡 Tips

- **Model AI terbaik untuk OCR**: `gemini/gemini-2.0-flash` — murah ($0.10/1M token), cepat, akurat untuk struk Indonesia
- **Foto struk**: Pastikan pencahayaan cukup dan teks terbaca jelas
- **Format gambar**: JPG atau PNG, maksimal 5MB
- **Budget**: Bisa diatur via database (default Rp 75.000.000)
- **API Key disimpan di browser** (localStorage) — aman, tidak dikirim ke server lain selain Sumopod

---

## 🛠️ Scripts Tersedia

```bash
npm run dev          # Jalankan frontend (port 3000)
npm run dev:server   # Jalankan backend API (port 3001)
npm run build        # Build production
npm run db:migrate   # Jalankan migrasi database
npm run db:seed      # Isi data contoh
npm run lint         # Type checking
```

---

## 🏗️ Tech Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4 + Vite
- **Backend**: Express.js + TypeScript
- **Database**: Neon DB (PostgreSQL serverless) + Drizzle ORM
- **AI/OCR**: Sumopod API (OpenAI-compatible) + Gemini Vision
- **Icons**: Lucide React
