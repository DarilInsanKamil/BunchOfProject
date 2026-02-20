import { relations, sql } from "drizzle-orm";
import {
    boolean,
    integer,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
    index,
    primaryKey,
    AnyPgColumn,
} from "drizzle-orm/pg-core";
// import * as p from "drizzle-orm/pg-core";

export const user = pgTable("user", {
    id: uuid("id")
        .primaryKey()
        .default(sql`uuidv7()`),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
});

export const session = pgTable(
    "session",
    {
        id: uuid("id")
            .primaryKey()
            .default(sql`uuidv7()`),
        expiresAt: timestamp("expires_at").notNull(),
        token: text("token").notNull().unique(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
        ipAddress: text("ip_address"),
        userAgent: text("user_agent"),
        userId: uuid("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
    },
    (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
    "account",
    {
        id: uuid("id")
            .primaryKey()
            .default(sql`uuidv7()`),
        accountId: text("account_id").notNull(),
        providerId: text("provider_id").notNull(),
        userId: uuid("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        accessToken: text("access_token"),
        refreshToken: text("refresh_token"),
        idToken: text("id_token"),
        accessTokenExpiresAt: timestamp("access_token_expires_at"),
        refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
        scope: text("scope"),
        password: text("password"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
    "verification",
    {
        id: uuid("id")
            .primaryKey()
            .default(sql`uuidv7()`),
        identifier: text("identifier").notNull(),
        value: text("value").notNull(),
        expiresAt: timestamp("expires_at").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const posts = pgTable("posts", {
    id: uuid("id")
        .primaryKey()
        .default(sql`uuidv7()`),
    title: varchar({ length: 255 }).notNull(),
    deskripsi: text().notNull(),
    userId: uuid("user_id").references(() => user.id, { onDelete: "cascade" }),
    location: varchar({ length: 255 }),
    archive: boolean().default(false),
    latitude: text(),
    longitude: text(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull()
        .$onUpdate(() => /* @__PURE__ */ new Date()),
});

export const postImages = pgTable("post_images", {
    id: uuid("id")
        .primaryKey()
        .default(sql`uuidv7()`),
    postId: uuid("post_id")
        .notNull()
        .references(() => posts.id, { onDelete: "cascade" }),
    imageUrl: text("image_url").notNull(),
});

export const userLikes = pgTable(
    "user_likes",
    {
        userId: uuid("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        postId: uuid("post_id")
            .notNull()
            .references(() => posts.id, { onDelete: "cascade" }),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [primaryKey({ columns: [table.userId, table.postId] })],
);

export const userComments = pgTable("user_comment", {
    id: uuid("id")
        .primaryKey()
        .default(sql`uuidv7()`),
    userId: uuid("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    postId: uuid("post_id")
        .notNull()
        .references(() => posts.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id").references((): AnyPgColumn => userComments.id, {
        onDelete: "cascade",
    }),
    comment: text("comment").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date()),
});

export const userRelations = relations(user, ({ many }) => ({
    posts: many(posts),
    comments: many(userComments),
    likes: many(userLikes),
    sessions: many(session),
    accounts: many(account),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
    user: one(user, {
        fields: [posts.userId],
        references: [user.id],
    }),
    images: many(postImages),
    likes: many(userLikes),
    comments: many(userComments),
}));

export const postImagesRelations = relations(postImages, ({ one }) => ({
    post: one(posts, {
        fields: [postImages.postId],
        references: [posts.id],
    }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
    user: one(user, {
        fields: [session.userId],
        references: [user.id],
    }),
}));

export const accountRelations = relations(account, ({ one }) => ({
    user: one(user, {
        fields: [account.userId],
        references: [user.id],
    }),
}));

export const userLikesRelations = relations(userLikes, ({ one }) => ({
    post: one(posts, { fields: [userLikes.postId], references: [posts.id] }),
    user: one(user, { fields: [userLikes.userId], references: [user.id] }),
}));

export const userCommentsRelations = relations(
    userComments,
    ({ one, many }) => ({
        post: one(posts, {
            fields: [userComments.postId],
            references: [posts.id],
        }),
        parent: one(userComments, {
            fields: [userComments.parentId],
            references: [userComments.id],
            relationName: "comment_replies",
        }),
        replies: many(userComments, {
            relationName: "comment_replies",
        }),
        user: one(user, {
            fields: [userComments.userId],
            references: [user.id],
        }),
    }),
);

//BIOSKOP

export const studio = pgTable("studio", {
    id: uuid("id")
        .primaryKey()
        .default(sql`uuidv7()`),
    namaStudio: text("nama_studio").notNull(),
    kapasitas: integer("kapasitas").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date()),
});
export const movie = pgTable("movie", {
    id: uuid("id")
        .primaryKey()
        .default(sql`uuidv7()`),
    namaFilm: text("nama_film").notNull(),
    durasi: integer("durasi").notNull(),
    genre: varchar({ length: 150 }).notNull(),
    sinopsis: text("sinopsis").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date()),
});

export const showtime = pgTable("showtime", {
    id: uuid("id")
        .primaryKey()
        .default(sql`uuidv7()`),
    studioId: uuid("studio_id")
        .notNull()
        .references(() => studio.id, { onDelete: "cascade" }),
    movieId: uuid("movie_id")
        .notNull()
        .references(() => movie.id, { onDelete: "cascade" }),
    waktuTayang: text("waktu_tayang").notNull(),
    harga: integer("harga").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date()),
});

export const booking = pgTable("booking", {
    id: uuid("id")
        .primaryKey()
        .default(sql`uuidv7()`),
    showttimeId: uuid("showtime_id")
        .notNull()
        .references(() => showtime.id, { onDelete: "cascade" }),
    namaPemesan: text("nama_pemesan").notNull(),
    nomorKursi: varchar({ length: 10 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date()),
});

export const schema = {
    user,
    account,
    userLikes,
    userComments,
    session,
    verification,
    posts,
    postImages,
    studio,
    booking,
    movie,
    showtime,
};
