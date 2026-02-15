import { db } from "../../db";
import { posts, user } from "../../db/schema";
import { eq, type InferInsertModel } from "drizzle-orm";
import { PerfectDaysModel } from "./model";

export abstract class PerfectDayService {
  static async upload(payload: PerfectDaysModel.UploadPayload) {
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
      archive: payload.archive === "false",
      userId: payload.user_id,
      image_url: coverUrl,
      location: payload.location,
    };
    const resultPosts = await db
      .insert(posts)
      .values(data)
      .returning({ id: posts.id });
    if (!resultPosts) {
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
      })
      .from(posts)
      .innerJoin(user, eq(posts.userId, user.id));

    return resultPosts;
  }
}
