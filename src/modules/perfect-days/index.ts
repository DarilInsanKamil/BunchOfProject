import Elysia, { status } from "elysia";
import { PerfectDaysModel } from "./model";
import { PerfectDayService } from "./service";

export const perfectdays = new Elysia({ prefix: "/perfectdays" })
    .post(
        "/upload",
        async ({ body }) => {
            const response = await PerfectDayService.upload(body);
            return status(201, response);
        },
        {
            body: PerfectDaysModel.UploadPayload,
            detail: {
                tags: ["Perfect Days"],
                summary: "POST",
            },
        },
    )
    .get(
        "/",
        async ({ params }) => {
            const response = await PerfectDayService.getAllPosts();
            return status(200, response);
        },
        {
            detail: {
                tags: ["Perfect Days"],
                summary: "GET",
            },
        },
    );
