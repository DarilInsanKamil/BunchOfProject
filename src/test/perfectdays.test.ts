import { describe, expect, it, beforeAll } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { App } from "..";

// 1. Setup Base URL
const BASE_URL = "http://localhost:3000";
const api = treaty<App>(BASE_URL);

describe("Perfect Days Integration Test", () => {
    let sessionCookie: string;
    let userId: string;
    let createdPostId: string;

    const mockUser = {
        name: "Tester",
        email: `test-${Date.now()}@example.com`, // Email unik setiap test run
        password: "password123",
    };

    // STEP 1: Auth menggunakan fetch biasa (karena Better Auth endpointnya dinamis)
    it("should sign up and login", async () => {
        const response = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: mockUser.name,
                email: mockUser.email,
                password: mockUser.password,
            }),
        });

        // Better Auth mengembalikan Set-Cookie di header
        const cookie = response.headers.get("set-cookie");
        expect(response.ok).toBeTrue();
        expect(cookie).toBeTruthy();

        if (cookie) {
            sessionCookie = cookie; // Simpan cookie untuk request selanjutnya
        }

        // Opsional: Ambil User ID dari response jika dikembalikan,
        // atau kita bisa cek lewat endpoint user session nanti.
        const data = await response.json();
        expect(data).toHaveProperty("user");
    });

    // STEP 2: Gunakan Eden Treaty dengan Cookie yang sudah didapat
    it("should create a new perfect day post", async () => {
        // Siapkan File Dummy untuk upload
        // const file = Bun.file("./public/posts/hannipham.jpg");
        // const file = new File(["dummy image content"], "test.png", {
        //     type: "image/png",
        // });
        // ⚠️ Pastikan kamu punya file dummy. Atau buat file text pura-pura jadi gambar:
        // const file = new File(["dummy content"], "image.png", { type: "image/png" });
        //
        const jpegHeader = new Uint8Array([
            0xff,
            0xd8,
            0xff,
            0xe0,
            0x00,
            0x10,
            0x4a,
            0x46,
            0x49,
            0x46,
            0x00,
            0x01,
            0x01,
            0x00,
            0x00,
            0x01,
            0x00,
            0x01,
            0x00,
            0x00,
            0xff,
            0xd9, // JPEG end marker
        ]);

        const validImageFile = new File([jpegHeader], "test.jpg", {
            type: "image/jpeg",
        });

        const response = await api.perfectdays.upload.post(
            {
                title: "Testing Day",
                deskripsi: "This is a test description",
                image_url: validImageFile,
                location: "Jakarta",
            },
            {
                // 👇 INI KUNCINYA: Inject Cookie Auth ke Header
                headers: {
                    cookie: sessionCookie,
                },
            },
        );

        expect(response.status).toBe(201);
        expect(response.data).toBeTruthy();

        if (response.data) {
            createdPostId = response.data; // Simpan ID untuk test edit/delete
        }
    });

    // // STEP 3: Get All Posts (Test Public / Auth Access)
    it("should fetch all posts", async () => {
        const response = await api.perfectdays.get();

        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBeTrue();

        // Pastikan post yang kita buat ada di list
        const found = response.data?.find((p) => p.id === createdPostId);
        expect(found).toBeTruthy();
        expect(found?.title).toBe("Testing Day");
    });

    // STEP 4: Update Post (Partial Update)
    it("should update post title", async () => {
        const response = await api
            .perfectdays({ id: createdPostId })
            .edit.patch(
                {
                    title: "Updated Title",
                },
                {
                    headers: { cookie: sessionCookie },
                },
            );

        expect(response.status).toBe(200);
    });

    // STEP 5: Delete Post
    it("should delete the post", async () => {
        const response = await api.perfectdays({ id: createdPostId }).delete(
            undefined, // body kosong
            {
                headers: { cookie: sessionCookie },
            },
        );

        expect(response.status).toBe(204);
    });
});
