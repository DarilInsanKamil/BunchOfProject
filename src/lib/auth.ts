import { openAPI } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import { schema } from "../db/schema";
import { password } from "bun";
import { betterAuth } from "better-auth";

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_BASE_URL ?? "http://localhost:3000",
    basePath: "/api/auth",
    plugins: [openAPI()],
    database: drizzleAdapter(db, {
        provider: "pg",
        schema,
    }),
    experimental: {
        joins: true,
    },
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
        password: {
            hash: (pass) => Bun.password.hash(pass),
            verify: ({ password, hash }) => Bun.password.verify(password, hash),
        },
    },
    advanced: {
        database: {
            generateId: false,
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7,
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5,
        },
    },
});

export default auth;
