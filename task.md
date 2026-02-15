Phase 1: Konfigurasi Core (Fixing Issues)
Sebelum masuk ke fitur CRUD, pastikan pondasi database sudah benar agar relasi User bisa terbaca.

[✔️] Perbaiki src/db/index.ts

Masalah: Drizzle instance saat ini tidak memuat schema, menyebabkan error pada better-auth atau saat melakukan relational query.

Tugas: Import schema dari file schema.ts dan masukkan ke dalam fungsi drizzle({ client, schema }).

Phase 2: Validasi Data (Model)
Menyiapkan "kontrak" data untuk Request dan Response.

[✔️] Update src/modules/perfect-days/model.ts

Buat Schema UpdatePayload:

Tiru UploadPayload, namun buat semua field (title, deskripsi, location, image_url) menjadi Optional. Ini agar user bisa mengedit salah satu bagian saja (misal: hanya ganti caption).

Buat Schema PostIdParams:

Buat object validasi sederhana { id: t.String() } untuk memvalidasi parameter URL (misal: /perfectdays/:id).

Phase 3: Logika Bisnis (Service)
Ini adalah bagian terpenting. Logika keamanan (ownership) diterapkan di sini.

[ ] Update src/modules/perfect-days/service.ts

Buat Method getPostById(id):

Query ke database untuk mencari post berdasarkan id.

Return detail post beserta info user (gunakan innerJoin atau with relation).

Error Handling: Jika tidak ketemu, throw error 404.

Buat Method updatePost(id, userId, payload):

Cek Keberadaan: Cari post berdasarkan id. Jika tidak ada -> 404.

Cek Kepemilikan (PENTING): Pastikan post.userId === userId. Jika tidak sama -> Throw error 403 (Forbidden).

Handle Gambar (Jika ada upload baru):

Simpan file gambar baru.

Update path gambar di variabel data update.

(Opsional) Hapus file gambar lama dari storage untuk hemat ruang.

Update DB: Jalankan query update hanya pada kolom yang dikirim user.

Buat Method deletePost(id, userId):

Cek Keberadaan & Kepemilikan: Sama seperti logic update (Cek ID lalu Cek userId). Jika bukan pemilik -> 403.

Hapus Data: Jalankan query delete post.

(Opsional) Hapus File: Hapus file gambar fisik dari folder public/posts agar server tidak penuh sampah (garbage files).

Phase 4: API Endpoint (Controller)
Menghubungkan URL dengan logic di Service.

[ ] Update src/modules/perfect-days/index.ts

Endpoint GET /:id:

Gunakan validasi params: PerfectDaysModel.PostIdParams.

Panggil service getPostById.

Endpoint PUT /:id (Edit):

Pastikan route ini diproteksi oleh authMacro (harus login).

Ambil user.id dari session user yang login.

Panggil service updatePost(params.id, user.id, body).

Endpoint DELETE /:id (Hapus):

Pastikan route ini diproteksi oleh authMacro.

Ambil user.id dari session user yang login.

Panggil service deletePost(params.id, user.id).
