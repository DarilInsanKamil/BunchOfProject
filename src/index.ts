import { Elysia } from "elysia";
import { perfectdays } from "./modules/perfect-days";
import openapi from "@elysiajs/openapi";
import { authMacro } from "./lib/middleware";

const app = new Elysia()
    .use(openapi())
    .use(authMacro)
    .get("/", () => "Hello Elysia")
    .use(perfectdays)
    .listen({
        hostname: "0.0.0.0",
        port: 3000,
    });

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
