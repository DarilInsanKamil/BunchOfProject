import { db } from "../../db";
import {
    postImages,
    posts,
    user,
    userComments,
    userLikes,
} from "../../db/schema";
import { and, desc, eq, sql, type InferInsertModel } from "drizzle-orm";
import { PerfectDaysModel } from "./perfect-days.model";
import { unlink } from "node:fs/promises";
import { error } from "node:console";

export abstract class PerfectDayService {
    static async getArchiveStats(userId: string) {
        const result = await db
            .select({
                year: sql<number>`extract(year from ${posts.createdAt})`.as(
                    "year",
                ),
                count: sql<number>`count(*)`.as("count"),
            })
            .from(posts)
            .where(eq(posts.userId, userId)) // Filter agar hanya milik user yang login
            .groupBy(sql`year`)
            .orderBy(sql`year desc`); // Urutkan dari tahun terbaru
        if (result.length === 0) {
            throw Error("Gagal memuat data");
        }
        return result;
    }
    static async getArchiveByYear(year: string, userId: string) {
        const result = await db.query.posts.findMany({
            where: (posts, { and, gte, lt, eq }) =>
                and(
                    eq(posts.userId, userId),
                    gte(posts.createdAt, new Date(`${year}-01-01`)),
                    lt(posts.createdAt, new Date(`${Number(year) + 1}-01-01`)),
                ),
        });
        if (result.length === 0) {
            throw Error("Gagal memuat data");
        }
        return result;
    }
    static async getPostByLocation(location: string) {
        const result = await db.query.posts.findMany({
            where: (posts, { eq }) => eq(posts.location, location),
        });
        if (result.length === 0) {
            throw Error("Gagal memuat data");
        }
        return result;
    }
    static async upload(
        payload: PerfectDaysModel.UploadPayload,
        userId: string,
    ) {
        const { image_url } = payload;

        if (!image_url || image_url.length === 0) {
            throw new Error("Minimal satu gambar harus diupload");
        }

        const [newPost] = await db
            .insert(posts)
            .values({
                title: payload.title,
                deskripsi: payload.deskripsi,
                userId,
                location: payload.location,
                latitude: payload.latitude || null,
                longitude: payload.longitude || null,
                archive: payload.archive === "true",
            })
            .returning({ id: posts.id });

        const imagePromises = image_url.map(async (file) => {
            const ext = file.type.split("/")[1];
            const fileName = `${newPost.id}-${Date.now()}-${Math.random().toString(36)}.${ext}`;
            const path = `public/posts/${fileName}`;

            await Bun.write(path, file);
            const coverUrl = `/public/posts/${fileName}`;

            return db.insert(postImages).values({
                postId: newPost.id,
                imageUrl: coverUrl,
            });
        });

        await Promise.all(imagePromises);
        return newPost.id;
    }

    static async getAllPosts() {
        const resultPosts = await db.query.posts.findMany({
            where: (posts, { eq }) => eq(posts.archive, false),
            with: {
                user: {
                    columns: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                images: {
                    columns: {
                        id: true,
                        imageUrl: true,
                    },
                },
            },
            extras: {
                likesCount:
                    sql<number>`(SELECT count(*) FROM user_likes WHERE user_likes.post_id = ${posts.id})`
                        .mapWith(Number)
                        .as("likesCount"),
                commentsCount:
                    sql<number>`(SELECT count(*) FROM user_comment WHERE user_comment.post_id = ${posts.id})`
                        .mapWith(Number)
                        .as("commentCount"),
            },
            orderBy: [desc(posts.createdAt)],
        });

        return resultPosts;
    }

    static async getPostById(postId: string) {
        const resultPosts = await db.query.posts.findFirst({
            with: {
                user: {
                    columns: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                images: {
                    columns: {
                        id: true,
                        imageUrl: true,
                    },
                },
            },
            extras: {
                likesCount:
                    sql<number>`(SELECT count(*) FROM user_likes WHERE user_likes.post_id = ${posts.id})`
                        .mapWith(Number)
                        .as("likesCount"),
                commentsCount:
                    sql<number>`(SELECT count(*) FROM user_comment WHERE user_comment.post_id = ${posts.id})`
                        .mapWith(Number)
                        .as("commentCount"),
            },
            where: eq(posts.id, postId),
        });
        if (!resultPosts) {
            throw Error("Gagal memuat data");
        }
        return resultPosts;
    }

    static async getImagePostByPostId(postId: string) {
        const post = await this.getPostById(postId);
        const result = await db
            .select()
            .from(postImages)
            .where(eq(postImages.id, postId));
        if (result.length === 0) {
            throw Error("Gagal mengambil data");
        }
        return result;
    }

    static async updatePost(
        payload: PerfectDaysModel.UpdatePayload,
        userId: string,
        postId: string,
    ) {
        const oldData = await this.getPostById(postId);
        if (oldData.userId !== userId) {
            throw new Error("Unauthorized: Anda bukan pemilik postingan ini");
        }

        const { image_url } = payload;

        if (image_url && image_url.length > 0) {
            const oldImages = await db
                .select()
                .from(postImages)
                .where(eq(postImages.postId, postId));

            for (const img of oldImages) {
                const filePath = img.imageUrl.startsWith("/")
                    ? img.imageUrl.slice(1)
                    : img.imageUrl;
                try {
                    const file = Bun.file(filePath);
                    if (await file.exists()) {
                        await unlink(filePath);
                        console.log(`[File Deleted] ${filePath}`);
                    }
                } catch (err) {
                    console.error(`Gagal hapus file: ${filePath}`, err);
                }
            }

            await db.delete(postImages).where(eq(postImages.postId, postId));

            const imagePromises = image_url.map(async (file) => {
                const ext = file.type.split("/")[1];
                const fileName = `${postId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
                const path = `public/posts/${fileName}`;

                await Bun.write(path, file);
                return db.insert(postImages).values({
                    postId: postId,
                    imageUrl: `/public/posts/${fileName}`,
                });
            });
            await Promise.all(imagePromises);
        }

        const [resultPost] = await db
            .update(posts)
            .set({
                title: payload.title ?? oldData.title,
                deskripsi: payload.deskripsi ?? oldData.deskripsi,
                archive:
                    payload.archive !== undefined
                        ? payload.archive === "true"
                        : oldData.archive,
                location: payload.location ?? oldData.location,
                updatedAt: new Date(),
            })
            .where(and(eq(posts.id, postId), eq(posts.userId, userId)))
            .returning({ id: posts.id });

        if (!resultPost) {
            throw new Error("Gagal memperbarui postingan");
        }

        return resultPost.id;
    }
    static async updateArchivePost(
        userId: string,
        postId: string,
        payload: PerfectDaysModel.UpdateArchivePost,
    ) {
        const post = await this.getPostById(postId);

        if (post.userId !== userId) {
            throw new Error("Unauthorized: Anda bukan pemilik postingan ini");
        }

        const resultPost = await db
            .update(posts)
            .set({ archive: payload.archive, updatedAt: new Date() })
            .where(eq(posts.id, postId))
            .returning({ id: posts.id });

        if (resultPost.length === 0) {
            throw Error("Gagal merubah status archive");
        }
        return resultPost[0].id;
    }

    static async deletePost(postId: string, userId: string) {
        const post = await this.getPostById(postId);

        if (post.userId !== userId) {
            throw new Error("Unauthorized: Anda bukan pemilik postingan ini");
        }

        const images = await db
            .select()
            .from(postImages)
            .where(eq(postImages.postId, postId));

        if (images.length > 0) {
            for (const img of images) {
                const filePath = img.imageUrl.startsWith("/")
                    ? img.imageUrl.slice(1)
                    : img.imageUrl;

                try {
                    const file = Bun.file(filePath);
                    if (await file.exists()) {
                        await unlink(filePath);
                        console.log(`[File Deleted] ${filePath}`);
                    }
                } catch (err) {
                    // Log error tapi biarkan proses berlanjut agar record DB tetap terhapus
                    console.error(
                        `Gagal menghapus file fisik: ${filePath}`,
                        err,
                    );
                }
            }
        }

        await db.delete(posts).where(eq(posts.id, postId));
        return true;
    }

    static async likePost(userId: string, postId: string) {
        const post = await this.getPostById(postId);
        if (!post) throw new Error("Post tidak ditemukan");

        const existing = await db.query.userLikes.findFirst({
            where: (t, { eq, and }) =>
                and(eq(t.userId, userId), eq(t.postId, postId)),
        });

        if (existing) {
            await db
                .delete(userLikes)
                .where(
                    and(
                        eq(userLikes.userId, userId),
                        eq(userLikes.postId, postId),
                    ),
                );

            return { liked: false };
        }

        const payload = {
            userId,
            postId,
        };

        await db.insert(userLikes).values({ userId, postId });
        return { liked: true };
    }

    static async commentPost(
        userId: string,
        postId: string,
        comment: string,
        parentId: string | null,
    ) {
        const post = await this.getPostById(postId);
        if (!post) throw new Error("Post tidak ditemukan");

        const payload = {
            userId,
            postId,
            comment,
            parentId,
        };
        const result = await db
            .insert(userComments)
            .values(payload)
            .returning({ id: userComments.id });
        if (result.length === 0) {
            throw error("Gagal like postingan");
        }
        return result[0].id;
    }

    static async getCommentByPostId(postId: string) {
        const post = await this.getPostById(postId);
        if (!post) throw new Error("Postingan tidak ditemukan");

        const result = await db.query.userComments.findMany({
            where: eq(userComments.postId, postId),
            with: {
                user: {
                    columns: {
                        name: true,
                    },
                },
                replies: {
                    with: {
                        user: {
                            columns: { name: true },
                        },
                    },
                },
            },
        });
        return result;
    }
}
