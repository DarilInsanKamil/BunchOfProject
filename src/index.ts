import { Elysia } from "elysia";
import { perfectdays } from "./modules/perfect-days";
import openapi from "@elysiajs/openapi";
import { authMacro } from "./lib/middleware";
import { bioskop } from "./modules/tiket-bioskop";

const app = new Elysia()
    .use(openapi())
    .use(bioskop)
    .use(authMacro)
    .use(perfectdays)
    .get("/", () => "Hello Elysia")
    .listen({
        hostname: "0.0.0.0",
        port: 3000,
    });

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

export type App = typeof app;
