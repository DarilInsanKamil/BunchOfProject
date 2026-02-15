# Perfect Days Module — Implementation Phases

Dokumen ini menjelaskan tahapan implementasi fitur CRUD dengan fokus pada stabilitas database, validasi data, keamanan ownership, dan integrasi endpoint API.

---

## Phase 1 — Konfigurasi Core (Fixing Issues)

Sebelum masuk ke fitur CRUD, pastikan pondasi database sudah benar agar relasi User bisa terbaca.

### ✅ Perbaiki `src/db/index.ts`

**Masalah**

Instance Drizzle saat ini tidak memuat schema, menyebabkan error pada better-auth atau saat melakukan relational query.

**Tugas**

- Import schema dari file `schema.ts`
- Masukkan schema ke dalam konfigurasi drizzle:

```ts
drizzle({ client, schema });
```

---

## Phase 2 — Validasi Data (Model)

Menyiapkan “kontrak” data untuk Request dan Response.

### ✅ Update `src/modules/perfect-days/model.ts`

#### 1. Schema `UpdatePayload`

- Tiru `UploadPayload`
- Semua field dibuat **optional**:
    - title
    - description
    - location
    - image_url

Tujuan: user bisa mengedit sebagian data saja.

---

#### 2. Schema `PostIdParams`

Validasi parameter URL:

```ts
{
    id: t.String();
}
```

Digunakan untuk endpoint seperti:

```
/perfectdays/:id
```

---

## Phase 3 — Logika Bisnis (Service)

Bagian terpenting — keamanan ownership diterapkan di sini.

### ✅ Update `src/modules/perfect-days/service.ts`

---

### Method: `getPostById(id)`

**Flow**

- Query database berdasarkan id
- Sertakan info user (innerJoin / relation)
- Jika tidak ditemukan → throw error **404**

---

### Method: `updatePost(id, userId, payload)`

**Flow**

1. **Cek keberadaan post**
    - Jika tidak ada → 404

2. **Cek kepemilikan**
    - Jika `post.userId !== userId` → throw **403**

3. **Handle gambar (opsional)**
    - Simpan gambar baru
    - Update path gambar
    - Hapus gambar lama jika perlu

4. **Update database**
    - Update hanya field yang dikirim user

---

### Method: `deletePost(id, userId)`

**Flow**

1. Cek keberadaan + kepemilikan
    - Jika bukan pemilik → 403

2. Hapus data post dari database

3. (Opsional) Hapus file gambar dari storage

---

## Phase 4 — API Endpoint (Controller)

Menghubungkan route dengan logic service.

### ✅ Update `src/modules/perfect-days/index.ts`

---

### Endpoint: `GET /:id`

- Validasi params dengan `PostIdParams`
- Panggil `getPostById`

---

### Endpoint: `PUT /:id`

- Wajib login (authMacro)
- Ambil `user.id` dari session
- Panggil:

```ts
updatePost(params.id, user.id, body);
```

---

### Endpoint: `DELETE /:id`

- Wajib login (authMacro)
- Ambil `user.id`
- Panggil:

```ts
deletePost(params.id, user.id);
```

---

## Summary Flow

```
Request → Validation → Ownership Check → DB Action → Response
```

Tujuan utama:

- Data aman
- User hanya bisa mengedit miliknya
- Storage tetap bersih
- API konsisten

---

✅ Siap untuk implementasi CRUD yang aman dan scalable.
