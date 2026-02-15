# Perfect Days — Task Breakdown (Likes & Comments)

Dokumen ini berisi daftar tugas implementasi fitur interaksi (likes & comments) pada modul Perfect Days. Fokus utama: struktur database, validasi data, logika bisnis, dan endpoint API.

---

## Phase 1 — Database Schema

Tujuan fase ini adalah menyiapkan penyimpanan data interaksi pengguna secara aman, konsisten, dan mudah di-query.

### ✅ Update `src/db/schema.ts`

#### Task 1 — Buat tabel likes

**Tujuan**

Mencatat relasi user yang menyukai sebuah post.

**Kebutuhan**

- Setiap user hanya boleh menyukai post yang sama satu kali.
- Gunakan composite primary key agar tidak terjadi duplikasi data.
- Relasi harus terhubung ke tabel user dan posts.
- Gunakan cascade delete agar data interaksi ikut terhapus jika user atau post dihapus.
- Simpan timestamp untuk kebutuhan audit/log.

**Checklist**

- Struktur tabel likes dibuat
- Composite primary key diterapkan
- Foreign key ke user dan posts terhubung
- Cascade delete aktif
- Timestamp tersedia

---

#### Task 2 — Buat tabel comments

**Tujuan**

Menyimpan komentar user terhadap sebuah post.

**Kebutuhan**

- Setiap komentar memiliki ID unik.
- Wajib menyimpan text komentar.
- Relasi ke user dan posts harus aktif.
- Mendukung timestamp created & updated.

**Checklist**

- Struktur tabel comments dibuat
- Primary key tersedia
- Field text tidak boleh kosong
- Relasi ke user dan posts aktif
- Timestamp created & updated tersedia

---

#### Task 3 — Update relations database

**Tujuan**

Memungkinkan relational query antar tabel.

**Kebutuhan**

- Relasi likes ↔ posts
- Relasi comments ↔ posts
- Relasi likes ↔ user
- Relasi comments ↔ user

**Checklist**

- Semua relasi ditambahkan
- Relational query dapat membaca likes dan comments dari post
- Tidak ada konflik referensi antar tabel

---

## Phase 2 — Data Validation (Model)

Fase ini memastikan data request dan response memiliki kontrak yang jelas.

### ✅ Update `src/modules/perfect-days/perfect-days.model.ts`

#### Task 1 — Schema CommentPayload

**Tujuan**

Validasi input komentar dari user.

**Kebutuhan**

- Komentar tidak boleh kosong
- Validasi tipe data text

**Checklist**

- Schema validasi dibuat
- Input kosong ditolak

---

#### Task 2 — Update ResponseDetailSuccess

**Tujuan**

Menambahkan data interaksi pada response post detail.

**Kebutuhan**

- Menyediakan jumlah total like
- Menyediakan status apakah user login sudah like post
- Menyediakan daftar komentar

**Checklist**

- Field jumlah like tersedia
- Field status like user tersedia
- Field daftar komentar tersedia

---

## Phase 3 — Business Logic (Service)

Fase inti — mengatur aturan interaksi, keamanan, dan konsistensi data.

### ✅ Update `src/modules/perfect-days/perfect-days.service.ts`

---

### Feature — Likes

#### Task: toggleLike

**Tujuan**

Mengelola aksi like/unlike post.

**Flow**

- Periksa apakah user sudah menyukai post
- Jika sudah → hapus like
- Jika belum → buat like baru
- Hitung ulang total like

**Checklist**

- Cek status like berjalan benar
- Insert/delete data konsisten
- Total like selalu akurat
- Tidak terjadi duplikasi like

---

### Feature — Comments

#### Task: addComment

**Tujuan**

Menambahkan komentar baru.

**Checklist**

- Komentar tersimpan di database
- Relasi user dan post valid
- Data komentar dapat dikembalikan ke UI

---

#### Task: deleteComment

**Tujuan**

Menghapus komentar dengan keamanan ownership.

**Kebutuhan keamanan**

- User hanya boleh menghapus komentarnya sendiri
- Opsional: pemilik post boleh menghapus komentar pada post-nya

**Checklist**

- Validasi kepemilikan berjalan
- Komentar terhapus dengan benar
- Tidak bisa menghapus komentar orang lain tanpa izin

---

### ⚠ Update Existing Service Methods

#### getAllPosts

**Tujuan**

Menambahkan informasi interaksi pada daftar post.

**Checklist**

- Jumlah like tersedia
- Data komentar dapat diambil jika diperlukan
- Performa query tetap optimal

---

#### getPostById

**Tujuan**

Menampilkan detail lengkap post beserta interaksi.

**Checklist**

- Jumlah like tersedia
- Status like user tersedia
- Daftar komentar lengkap tersedia
- Query efisien

---

## Phase 4 — API Endpoint (Controller)

Menghubungkan logic service dengan route API.

### ✅ Update `src/modules/perfect-days/index.ts`

---

#### Endpoint — Like Toggle

**Tujuan**

Mengaktifkan fitur like/unlike.

**Kebutuhan**

- Wajib login
- Memanggil service toggleLike

**Checklist**

- Auth middleware aktif
- Handler terhubung ke service

---

#### Endpoint — Add Comment

**Tujuan**

Menambahkan komentar baru.

**Kebutuhan**

- Wajib login
- Validasi CommentPayload

**Checklist**

- Validasi berjalan
- Komentar berhasil dibuat

---

#### Endpoint — Delete Comment

**Tujuan**

Menghapus komentar.

**Kebutuhan**

- Wajib login
- Validasi kepemilikan

**Checklist**

- Auth berjalan
- Komentar terhapus sesuai aturan

---

## Final Validation Checklist

- Database schema stabil
- Relasi antar tabel berjalan
- Validasi input aman
- Ownership enforcement aktif
- Endpoint terhubung ke service
- Performa query tetap baik

---

Implementasi selesai jika semua checklist terpenuhi tanpa error relasi, keamanan, atau duplikasi data.
