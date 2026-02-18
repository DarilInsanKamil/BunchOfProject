import { db } from "../../db";
import { posts, user, userComments, userLikes } from "../../db/schema";
import { and, eq, sql, type InferInsertModel } from "drizzle-orm";
import { PerfectDaysModel } from "./perfect-days.model";
import { unlink } from "node:fs/promises";
import { error } from "node:console";

export abstract class PerfectDayService {
    static async upload(
        payload: PerfectDaysModel.UploadPayload,
        userId: string,
    ) {
        const { image_url, user_id } = payload;

        if (!image_url) {
            throw Error("Gambar harus diupload");
        }
        const fileName = `${Date.now()}.${image_url.type.split("/")[1]}`;
        const path = `public/posts/${fileName}`;

        await Bun.write(path, image_url);

        const coverUrl = `/public/posts/${fileName}`;

        type NewPosts = InferInsertModel<typeof posts>;

        const data: NewPosts = {
            title: payload.title,
            deskripsi: payload.deskripsi,
            archive: payload.archive === "true",
            userId,
            image_url: coverUrl,
            location: payload.location,
        };
        const resultPosts = await db
            .insert(posts)
            .values(data)
            .returning({ id: posts.id });
        if (resultPosts.length === 0) {
            throw Error("Gagal upload");
        }
        return resultPosts[0].id;
    }

    static async getAllPosts() {
        const resultPosts = await db
            .select({
                id: posts.id,
                title: posts.title,
                deskripsi: posts.deskripsi,
                imageUrl: posts.image_url,
                location: posts.location,
                archive: posts.archive,
                createdAt: posts.createdAt,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                },
                likesCount:
                    sql<number>`(SELECT count(*) FROM user_likes WHERE user_likes.post_id = ${posts.id})`.mapWith(
                        Number,
                    ),
                commentsCount:
                    sql<number>`(SELECT count(*) FROM user_comment WHERE user_comment.post_id = ${posts.id})`.mapWith(
                        Number,
                    ),
            })
            .from(posts)
            .innerJoin(user, eq(posts.userId, user.id));

        return resultPosts;
    }

    static async getPostById(postId: string) {
        const resultPosts = await db.query.posts.findFirst({
            where: eq(posts.id, postId),
        });
        if (!resultPosts) {
            throw Error("Gagal memuat data");
        }
        return resultPosts;
    }

    static async updatePost(
        payload: PerfectDaysModel.UpdatePayload,
        userId: string,
        postId: string,
    ) {
        const oldData = await this.getPostById(postId);
        const { image_url } = payload;

        if (oldData.userId !== userId) {
            throw new Error("Unauthorized: Anda bukan pemilik postingan ini");
        }

        let coverUrl = oldData.image_url;

        if (image_url) {
            if (oldData.image_url) {
                const oldPath = oldData.image_url.startsWith("/")
                    ? oldData.image_url.slice(1)
                    : oldData.image_url;

                try {
                    const file = Bun.file(oldPath);
                    if (await file.exists()) {
                        console.log(`[File Deleted] ${oldPath}`);
                    }
                } catch (err) {
                    console.error(`Gagal hapus file lama`, err);
                }
            }
            const ext = image_url.type.split("/")[1];
            const fileName = `${Date.now()}.${ext}`;
            const path = `public/posts/${fileName}`;

            await Bun.write(path, image_url);
            coverUrl = `/public/posts/${fileName}`;
        }

        const resultPost = await db
            .update(posts)
            .set({
                title: payload.title ?? oldData.title,
                deskripsi: payload.deskripsi ?? oldData.deskripsi,
                image_url: coverUrl,
                archive: payload.archive
                    ? payload.archive === "true"
                    : oldData.archive,
                location: payload.location ?? oldData.location,
                updatedAt: new Date(),
            })
            .where(and(eq(posts.id, postId), eq(posts.userId, userId)))
            .returning({ id: posts.id });

        if (resultPost.length === 0) {
            throw Error("Gagal merubah status archive");
        }
        return resultPost[0].id;
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
        if (post.image_url && post.image_url.startsWith("/public")) {
            const filePath = post.image_url.slice(1);
            try {
                const file = Bun.file(filePath);
                if (await file.exists()) {
                    await unlink(filePath);
                    console.log(`[File Deleted] ${filePath}`);
                }
            } catch (err) {
                console.error(`Gagal menghapus file gambar:`, err);
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

    static async commentPost(userId: string, postId: string, comment: string) {
        const post = await this.getPostById(postId);
        if (!post) throw new Error("Post tidak ditemukan");

        const payload = {
            userId,
            postId,
            comment,
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
            },
        });
        return result;
    }
}
