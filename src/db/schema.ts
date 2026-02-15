import { sql } from "drizzle-orm";
import {
    boolean,
    integer,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";
import * as p from "drizzle-orm/pg-core";

export const user = pgTable("user", {
    id: uuid("id")
        .primaryKey()
        .default(sql`uuidv7()`),

    name: varchar("name", { length: 255 }),

    email: varchar("email", { length: 255 }).notNull().unique(),

    emailVerified: boolean("email_verified").default(false).notNull(),

    image: text("image"),

    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

export const session = pgTable("session", {
    id: uuid("id")
        .primaryKey()
        .default(sql`uuidv7()`),

    token: text("token").notNull().unique(),

    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),

    ipAddress: text("ip_address"),

    userAgent: text("user_agent"),

    userId: uuid("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),

    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
        () => new Date(),
    ),
});

export const account = pgTable("account", {
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

    password: text("password"),

    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
        .$onUpdate(() => new Date())
        .notNull(),
});

export const verification = pgTable("verification", {
    id: uuid("id")
        .primaryKey()
        .default(sql`uuidv7()`),

    identifier: text("identifier").notNull(),

    value: text("value").notNull(),

    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
        .$onUpdate(() => new Date())
        .notNull(),
});

export const posts = pgTable("posts", {
    id: uuid("id")
        .primaryKey()
        .default(sql`uuidv7()`),
    title: varchar({ length: 255 }).notNull(),
    deskripsi: text().notNull(),
    userId: uuid("user_id").references(() => user.id),
    image_url: text().notNull(),
    location: varchar({ length: 255 }),
    archive: boolean().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull()
        .$onUpdate(() => /* @__PURE__ */ new Date()),
});

export const schema = {
    user,
    account,
    session,
    verification,
    posts,
};
