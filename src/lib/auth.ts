import { openAPI } from "better-auth/plugins";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import { schema } from "../db/schema";
import { betterAuth } from "better-auth";

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_BASE_URL ?? "http://localhost:3000",
    basePath: "/api/auth",
    trustedOrigins: [
        "http://localhost:3001",
        process.env.FRONTEND_URL ?? "http://localhost:3001",
    ],
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
    socialProviders: {
        google: {
            prompt: "select_account",
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
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
