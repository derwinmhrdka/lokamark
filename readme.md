# LOKAMARK

**Platform Verifikasi Keaslian Naskah Lontar Bali**

LOKAMARK adalah aplikasi web untuk mendaftarkan, mengelola, dan memverifikasi keaslian naskah lontar (naskah daun lontar) melalui identitas digital berbasis QR Code. Platform ini mendukung pelestarian warisan budaya Bali dengan menyediakan arsip resmi yang dapat diverifikasi secara publik.

| | |
|---|---|
| **Nama produk** | LOKAMARK |
| **Tagline** | Pelestarian Naskah Kuno Bali |
| **Jenis** | Web Application (SaaS / internal platform) |
| **Repo** | [github.com/derwinmhrdka/lokamark](https://github.com/derwinmhrdka/lokamark) |
| **Deploy** | Vercel |

---

## Daftar Isi

1. [Latar Belakang & Tujuan (Proposal)](#1-latar-belakang--tujuan-proposal)
2. [Manfaat & Sasaran Pengguna](#2-manfaat--sasaran-pengguna)
3. [Fitur Utama](#3-fitur-utama)
4. [Stack Teknologi](#4-stack-teknologi)
5. [Arsitektur Sistem](#5-arsitektur-sistem)
6. [Model Peran & Autentikasi](#6-model-peran--autentikasi)
7. [Aturan Bisnis](#7-aturan-bisnis)
8. [Skema Data (Airtable)](#8-skema-data-airtable)
9. [Struktur Aplikasi](#9-struktur-aplikasi)
10. [API Contract](#10-api-contract)
11. [Setup & Menjalankan Lokal](#11-setup--menjalankan-lokal)
12. [Deployment (Vercel)](#12-deployment-vercel)
13. [Keamanan](#13-keamanan)
14. [Batasan Saat Ini & Pengembangan Lanjutan](#14-batasan-saat-ini--pengembangan-lanjutan)

---

## 1. Latar Belakang & Tujuan (Proposal)

### Latar belakang

Naskah lontar merupakan warisan budaya Bali yang berharga. Ancaman pemalsuan, duplikasi tidak sah, serta kesulitan memverifikasi keaslian naskah secara cepat menjadi tantangan bagi museum, lembaga adat, kolektor, dan masyarakat umum.

### Tujuan

Membangun sistem digital yang:

1. **Mencatat** identitas naskah lontar secara terstruktur (ID unik, metadata, foto).
2. **Menerbitkan** QR Code resmi yang menempel pada naskah / label fisik.
3. **Memverifikasi** keaslian secara publik hanya dengan memindai QR atau memasukkan ID.
4. **Mengelola alur persetujuan** antara pengaju (visitor) dan pengelola arsip (admin).

### Ruang lingkup proposal

| Aspek | Isi |
|-------|-----|
| Deliverable | Aplikasi web LOKAMARK (frontend + API) |
| Backend data | Airtable (tanpa server database sendiri) |
| Hosting | Vercel |
| Peran pengguna | Publik, Visitor, Admin |
| Output fisik | QR Code PNG yang dapat diunduh / dicetak |

### Indikator keberhasilan (contoh untuk proposal)

- Publik dapat memverifikasi naskah dalam &lt; 5 detik (scan / input ID).
- Setiap naskah terverifikasi memiliki ID unik berformat standar dan QR Code.
- Admin dapat menyetujui / menolak pengajuan visitor.
- Seluruh data tercatat dengan jejak audit (`createdBy`, `createdDate`, `updatedBy`, `updatedDate`).

---

## 2. Manfaat & Sasaran Pengguna

| Pengguna | Manfaat |
|----------|---------|
| **Masyarakat / peneliti** | Verifikasi keaslian naskah tanpa login |
| **Visitor** (pengaju) | Mendaftarkan lontar, memantau status, mengunduh QR setelah disetujui |
| **Admin** (kurator / pengelola) | Mengelola katalog, approval, dan akun pengguna |
| **Institusi** (museum, desa adat) | Arsip digital resmi dengan jejak kepemilikan / asal |

---

## 3. Fitur Utama

### 3.1 Publik (tanpa login) â `/`

- Pindai QR Code via kamera (prefer kamera belakang pada ponsel)
- Unggah gambar QR sebagai alternatif
- Input manual ID naskah
- Deep link: `/?id=LKM-2026-001#hasil` â otomatis verifikasi
- Kartu hasil: **terverifikasi** atau **tidak ditemukan / tidak valid**
- Katalog lontar terverifikasi (kartu â modal detail â perbesar gambar)

### 3.2 Visitor â `/visitor`

- Registrasi akun mandiri (role `visitor`)
- Ajukan registrasi lontar baru (status menunggu approval)
- Lihat daftar pengajuan sendiri (âYour Requestâ)
- Unduh / tampilkan QR setelah status menjadi `verified`

### 3.3 Admin â `/admin`

- **Approval** â setujui (â verified + QR) atau tolak (â inactive)
- **Lontar Management** â daftar, tambah (langsung verified), edit, soft-delete
- **User Management** â CRUD akun admin / visitor

---

## 4. Stack Teknologi

| Lapisan | Teknologi | Keterangan |
|---------|-----------|------------|
| Framework | **Next.js 16.2.6** (App Router) | SSR / RSC, Route Handlers |
| UI | **React 19**, TypeScript 5.7 | |
| Styling | **Tailwind CSS 4**, shadcn/ui, Lucide | |
| Font | Inter, Playfair Display | Google Fonts |
| QR Scan | **html5-qrcode** | Kamera + unggah gambar |
| QR Generate | **qrcode** | PNG 512Ã512 |
| Data store | **Airtable** REST API | Tabel `lontar_detail`, `user_login` |
| Auth | Cookie session HMAC-SHA256 | `lokamark_session` |
| Analytics | Vercel Analytics | Production only |
| Hosting | **Vercel** | |

### Skrip npm

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Jalankan build
npm run lint     # ESLint
```

---

## 5. Arsitektur Sistem

```
âââââââââââââââ     HTTPS      ââââââââââââââââââââââââ
â  Browser    âââââââââââââââââºâ  Next.js (Vercel)    â
â  Publik /   â                â  - Pages (RSC/CSR)   â
â  Admin /    â                â  - API Route Handlersâ
â  Visitor    â                â  - Session cookie    â
âââââââââââââââ                ââââââââââââ¬ââââââââââââ
                                          â
                                          â REST API
                                          â¼
                               ââââââââââââââââââââââââ
                               â      Airtable        â
                               â  â¢ lontar_detail     â
                               â  â¢ user_login        â
                               ââââââââââââââââââââââââ
```

**Alur verifikasi publik**

```
Scan QR / Input ID â GET /api/verify?id=...
  â Cari di Airtable (status harus "verified")
  â Response: verified + metadata  |  invalid
```

**Alur pengajuan visitor**

```
Visitor submit form â POST /api/visitor/lontar
  â status = "waiting for approval"
  â Admin Approve â status = "verified" + generate QR
  â Admin Reject  â status = "inactive"
```

---

## 6. Model Peran & Autentikasi

### Peran

| Role | Akses |
|------|-------|
| *(tanpa login)* | Beranda verifikasi, katalog |
| `visitor` | `/visitor/*`, `POST/GET /api/visitor/lontar` |
| `admin` | `/admin/*`, seluruh API `/api/admin/*` |

### Session

| Properti | Nilai |
|----------|-------|
| Cookie name | `lokamark_session` |
| Format | `{payload_base64url}.{hmac_sha256}` |
| Payload | `{ sub, role, email, exp }` |
| Masa berlaku | 7 hari |
| Flags | `httpOnly`, `sameSite=lax`, `secure` (production) |

Login: `POST /api/auth/login` â set cookie â redirect ke `/admin` atau `/visitor` sesuai role.  
Logout: `DELETE /api/auth/login` (atau tombol Logout di menu).

---

## 7. Aturan Bisnis

### Format ID naskah

```
LKM-{TAHUN}-{URUTAN 3 DIGIT}
Contoh: LKM-2026-001
```

- Digenerate otomatis di server saat create.
- Disimpan dalam huruf besar.
- Unik per tahun (sequence bertambah).

### Status lontar

| Status | Arti | Tampil di verifikasi publik? |
|--------|------|------------------------------|
| `verified` | Disetujui / ditambahkan admin | Ya |
| `waiting for approval` | Menunggu review admin | Tidak |
| `inactive` | Soft-delete / ditolak | Tidak |

### Soft delete vs hard delete

- **Lontar:** Delete admin = ubah status ke `inactive` (data tetap ada).
- **User:** Delete admin = hapus record Airtable (hard delete). Admin tidak bisa menghapus akun sendiri.

### Gambar & QR

- **Gambar naskah:** field attachment `image` (JPEG/PNG/WebP/GIF, maks. 4.5 MB), diunggah sebagai file (bukan URL teks).
- **QR:** field attachment `qr`, digenerate otomatis saat status menjadi `verified`. Isi QR = string ID naskah (bukan URL).

### Validasi

| Field | Aturan |
|-------|--------|
| Username | 3â32 karakter; `[a-zA-Z0-9._-]` |
| Email | Format email valid; tidak wajib unik |
| Password | Minimal 6 karakter |
| Nama lontar | Wajib diisi |

---

## 8. Skema Data (Airtable)

### Tabel `lontar_detail`

| Field | Tipe (disarankan) | Keterangan |
|-------|-------------------|------------|
| `id` | Single line text | `LKM-YYYY-NNN` |
| `name` | Single line text | Nama lontar |
| `category` | Single line text | Kategori |
| `institution` | Single line text | Institusi / asal |
| `year` | Single line text | Perkiraan usia |
| `description` | Long text | Deskripsi |
| `image` | **Attachment** | Foto naskah |
| `status` | Single select | `verified` \| `waiting for approval` \| `inactive` |
| `createdBy` | Single line text | Username pembuat |
| `createdDate` | Date (include time) | ISO datetime |
| `updatedBy` | Single line text | Username pengubah |
| `updatedDate` | Date (include time) | ISO datetime |
| `qr` | **Attachment** | PNG QR Code |

### Tabel `user_login`

| Field | Tipe (disarankan) | Keterangan |
|-------|-------------------|------------|
| `username` | Single line text | Login ID |
| `password` | Single line text | Kredensial (lihat catatan keamanan) |
| `email` | Email / text | Kontak |
| `role` | Single select / text | `admin` \| `visitor` |
| `createdBy` | Single line text | |
| `createdDate` | Date (include time) | |
| `updatedBy` | Single line text | |
| `updatedDate` | Date (include time) | |

---

## 9. Struktur Aplikasi

```
app/
âââ page.tsx                         # Beranda publik (verifikasi + katalog)
âââ login/page.tsx
âââ register/page.tsx
âââ admin/(protected)/               # Guard role=admin
â   âââ page.tsx                     # Menu admin
â   âââ approval/
â   âââ lontar/  (+ add, [id]/edit)
â   âââ users/   (+ add, [id]/edit)
âââ visitor/                         # Guard role=visitor
â   âââ page.tsx
â   âââ register-lontar/
â   âââ requests/
âââ api/
    âââ auth/login|register
    âââ verify
    âââ samples
    âââ admin/lontar|approval|users
    âââ visitor/lontar

lib/
âââ auth.ts                 # Session HMAC
âââ airtable.ts             # CRUD lontar + upload attachment
âââ airtable-users.ts       # Auth & CRUD user
âââ manuscripts.ts          # Tipe, status, format ID
âââ lontar-qr.ts            # Generate QR PNG
âââ lontar-form-data.ts     # Parse multipart form
âââ validation.ts
âââ datetime.ts
```

---

## 10. API Contract

Base URL: origin aplikasi (contoh `https://lokamark.vercel.app`).  
Kecuali disebutkan lain, body JSON memakai `Content-Type: application/json`.  
Error umum: `{ "error": "pesan" }` dengan status HTTP sesuai konteks (`400` / `401` / `403` / `404` / `502`).

### Tipe data bersama

#### `Manuscript` / `ManuscriptRecord`

```json
{
  "recordId": "recXXXXXXXX",
  "id": "LKM-2026-001",
  "name": "Lontar Usada Taru Pramana",
  "category": "Pengobatan Tradisional",
  "institution": "Museum Bali",
  "year": "Abad ke-18",
  "description": "â¦",
  "image": "https://â¦",
  "status": "verified",
  "createdBy": "visitor1",
  "createdDate": "2026-07-17T08:47:00.000Z",
  "updatedBy": "admin1",
  "updatedDate": "2026-07-17T09:00:00.000Z",
  "qrUrl": "https://â¦"
}
```

`status`: `"verified"` | `"waiting for approval"` | `"inactive"`

#### `UserLogin` (tanpa password)

```json
{
  "recordId": "recXXXXXXXX",
  "username": "admin1",
  "email": "admin@example.com",
  "role": "admin",
  "createdBy": "admin1",
  "createdDate": "2026-07-01T00:00:00.000Z",
  "updatedBy": "admin1",
  "updatedDate": "2026-07-01T00:00:00.000Z"
}
```

---

### 10.1 Auth

#### `POST /api/auth/login`

**Auth:** tidak diperlukan  

**Request**

```json
{ "username": "admin1", "password": "secret12" }
```

**Response `200`**

```json
{
  "ok": true,
  "user": { "username": "admin1", "email": "admin@example.com", "role": "admin" }
}
```

Set cookie `lokamark_session`.

| Status | Kondisi |
|--------|---------|
| `400` | Username/password kosong |
| `401` | Kredensial salah |
| `403` | Profil Airtable tidak lengkap |
| `500` | Kesalahan server |

#### `DELETE /api/auth/login`

Logout â hapus cookie. **Response:** `{ "ok": true }`

#### `POST /api/auth/register`

**Auth:** tidak diperlukan  

**Request**

```json
{
  "username": "visitor1",
  "email": "visitor@example.com",
  "password": "secret12"
}
```

**Response `201`** â role selalu `visitor`, plus session cookie.

| Status | Kondisi |
|--------|---------|
| `400` | Validasi gagal / username sudah dipakai |
| `500` | Kesalahan server |

---

### 10.2 Publik

#### `GET /api/verify?id={lontarId}`

**Auth:** tidak diperlukan  

Hanya mengembalikan `verified` jika status naskah = `verified`.

**Response `200` â valid**

```json
{
  "status": "verified",
  "manuscript": { /* Manuscript */ },
  "source": "airtable"
}
```

**Response `200` â tidak valid / belum verified**

```json
{
  "status": "invalid",
  "id": "LKM-2026-999",
  "source": "airtable"
}
```

| Status | Kondisi |
|--------|---------|
| `400` | Parameter `id` kosong |
| `502` | Gagal Airtable |

Cache: `s-maxageâ30â60`.

#### `GET /api/samples`

**Auth:** tidak diperlukan  

**Response `200`**

```json
{ "ids": ["LKM-2026-001", "LKM-2026-002"], "source": "airtable" }
```

Maksimal 10 ID (verified / legacy blank status).

---

### 10.3 Admin â Lontar

Semua endpoint di bawah ini membutuhkan **session admin**.

#### `GET /api/admin/lontar`

**Response `200`:** `{ "records": ManuscriptRecord[] }`

#### `POST /api/admin/lontar`

**Content-Type:** `multipart/form-data`

| Field | Wajib | Keterangan |
|-------|-------|------------|
| `name` | Ya | Nama lontar |
| `category` | Tidak | |
| `institution` | Tidak | |
| `year` | Tidak | |
| `description` | Tidak | |
| `image` | Tidak | File gambar |
| `id` | â | Diabaikan (auto-generate) |

**Perilaku:** status langsung `verified`, generate ID + QR.

**Response `201`:** `{ "record": ManuscriptRecord }`

#### `DELETE /api/admin/lontar?recordId={airtableRecordId}`

Soft delete â `inactive`.

**Response `200`:** `{ "ok": true, "record": ManuscriptRecord }`

#### `GET /api/admin/lontar/[recordId]`

**Response `200`:** `{ "record": ManuscriptRecord }` â atau `404`

#### `PATCH /api/admin/lontar/[recordId]`

**Content-Type:** `multipart/form-data`  
Field sama dengan create; `id` dan `name` wajib. Unggah `image` baru mengganti attachment lama.

**Response `200`:** `{ "record": ManuscriptRecord }`

---

### 10.4 Admin â Approval

#### `GET /api/admin/approval`

Daftar status `waiting for approval`.

**Response `200`:** `{ "records": ManuscriptRecord[] }`

#### `POST /api/admin/approval`

**Request**

```json
{
  "recordId": "recXXXXXXXX",
  "action": "approve"
}
```

`action`: `"approve"` (default) | `"reject"`

| action | Hasil |
|--------|-------|
| `approve` | `status = verified` + generate QR |
| `reject` | `status = inactive` |

**Response `200`:** `{ "record": ManuscriptRecord }`

---

### 10.5 Admin â Users

#### `GET /api/admin/users`

**Response `200`**

```json
{
  "users": [ /* UserLogin[] */ ],
  "currentUsername": "admin1"
}
```

#### `POST /api/admin/users`

**Request**

```json
{
  "username": "newuser",
  "email": "new@example.com",
  "password": "secret12",
  "role": "visitor"
}
```

**Response `201`:** `{ "user": UserLogin }`

#### `GET /api/admin/users/[recordId]`

**Response `200`:** `{ "user": UserLogin }` â atau `404`

#### `PATCH /api/admin/users/[recordId]`

**Request**

```json
{
  "email": "updated@example.com",
  "role": "admin",
  "password": "optional-new-password"
}
```

Username tidak dapat diubah. Password opsional.

**Response `200`:** `{ "user": UserLogin }`

#### `DELETE /api/admin/users/[recordId]`

Hard delete. Tidak boleh menghapus diri sendiri.

**Response `200`:** `{ "ok": true }`

---

### 10.6 Visitor â Lontar

Membutuhkan **session visitor**.

#### `GET /api/visitor/lontar`

Daftar milik user login (`createdBy` = username session).

**Response `200`:** `{ "records": ManuscriptRecord[] }`

#### `POST /api/visitor/lontar`

**Content-Type:** `multipart/form-data` (sama seperti admin create).

**Perilaku:** status = `waiting for approval` (belum ada QR sampai disetujui).

**Response `201`:** `{ "record": ManuscriptRecord }`

---

### Ringkasan endpoint

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/auth/login` | â |
| DELETE | `/api/auth/login` | â |
| POST | `/api/auth/register` | â |
| GET | `/api/verify?id=` | â |
| GET | `/api/samples` | â |
| GET/POST/DELETE | `/api/admin/lontar` | Admin |
| GET/PATCH | `/api/admin/lontar/[recordId]` | Admin |
| GET/POST | `/api/admin/approval` | Admin |
| GET/POST | `/api/admin/users` | Admin |
| GET/PATCH/DELETE | `/api/admin/users/[recordId]` | Admin |
| GET/POST | `/api/visitor/lontar` | Visitor |

---

## 11. Setup & Menjalankan Lokal

### Prasyarat

- Node.js 20+ (disarankan)
- npm
- Akun Airtable + base dengan tabel sesuai [skema](#8-skema-data-airtable)

### Langkah

```bash
git clone https://github.com/derwinmhrdka/lokamark.git
cd lokamark
npm install
cp .env.example .env.local
```

Isi `.env.local`:

```env
AIRTABLE_API_KEY=patXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXX
SESSION_SECRET=ganti-dengan-string-acak-panjang
```

Buat minimal 1 user admin di tabel `user_login`, lalu:

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### Permissions kamera

Aplikasi meminta akses kamera untuk scan QR. Berjalan di **HTTPS** atau **localhost**. Header `Permissions-Policy: camera=(self)` sudah dikonfigurasi di `next.config.mjs`.

---

## 12. Deployment (Vercel)

1. Hubungkan repo GitHub ke Vercel.
2. Set Environment Variables (Production / Preview) sama seperti `.env.local`.
3. Deploy. Framework preset: Next.js.
4. Pastikan Deployment Protection / Vercel Authentication tidak memblokir akses publik ke production jika situs harus terbuka tanpa login Vercel.

---

## 13. Keamanan

| Aspek | Implementasi saat ini |
|-------|------------------------|
| Session | Cookie httpOnly + HMAC; bukan JWT di localStorage |
| Role guard | Layout server + `requireAdminSession` / `requireVisitorSession` di API |
| Password compare | Timing-safe equal |
| Upload | Validasi tipe & ukuran file gambar |
| Camera policy | Hanya origin sendiri |

### Catatan penting untuk proposal / produksi

- Password disimpan dan dibandingkan sebagai **teks di Airtable** (belum di-hash). Untuk produksi disarankan hashing (bcrypt/argon2) atau penyedia auth terkelola.
- `SESSION_SECRET` harus kuat dan berbeda per environment.
- Airtable API key memiliki akses penuh ke base â batasi siapa yang punya akses Vercel/env.

---

## 14. Batasan Saat Ini & Pengembangan Lanjutan

### Batasan

- Bergantung pada kuota & latency Airtable.
- Password belum di-hash.
- Tidak ada notifikasi email otomatis saat approve/reject.
- Verifikasi publik hanya untuk status `verified`.

### Pengembangan lanjutan (usulan proposal)

| Prioritas | Item |
|-----------|------|
| Tinggi | Hash password / migrasi auth (Auth.js, Clerk, dll.) |
| Tinggi | Notifikasi email approve/reject + lampiran QR |
| Sedang | Audit log terpisah, export laporan katalog |
| Sedang | Pencarian & filter lontar (kategori, institusi) |
| Rendah | Aplikasi mobile / PWA offline scan |
| Rendah | Multi-bahasa (ID / EN / Bali) |

---

## Lampiran Proposal â Ringkasan Satu Halaman

**Judul proyek:** LOKAMARK â Platform Verifikasi Keaslian Naskah Lontar Bali  

**Masalah:** Sulit memverifikasi keaslian naskah lontar secara cepat dan terpercaya.  

**Solusi:** Sistem web dengan ID unik (`LKM-YYYY-NNN`), QR Code resmi, verifikasi publik, serta alur approval adminâvisitor.  

**Teknologi:** Next.js 16, React 19, TypeScript, Tailwind, Airtable, Vercel.  

**Pengguna:** Publik (verifikasi), Visitor (ajukan), Admin (kelola & setujui).  

**Output:** Katalog digital, QR yang dapat dicetak, jejak audit perubahan data.  

**Status:** Aplikasi fungsional (MVP) siap di-deploy; penguatan keamanan & notifikasi sebagai tahap berikutnya.

---

## Lisensi & Kontak

Proyek privat / sesuai kebijakan pemilik repositori.  
Untuk pertanyaan teknis terkait implementasi, gunakan isu pada repositori GitHub terkait.
