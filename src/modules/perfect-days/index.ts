import Elysia, { status } from "elysia";
import { PerfectDaysModel } from "./perfect-days.model";
import { PerfectDayService } from "./perfect-days.service";
import { authMacro } from "@/lib/middleware";

export const perfectdays = new Elysia({ prefix: "/perfectdays" })
    .get(
        "/",
        async () => {
            const response = await PerfectDayService.getAllPosts();
            return status(200, response);
        },
        {
            detail: {
                tags: ["Perfect Days"],
                summary: "GET",
            },
        },
    )
    .get(
        "/:id",
        async ({ params }) => {
            const postId = params.id;
            const response = await PerfectDayService.getPostById(postId);
            return status(200, response);
        },
        {
            params: PerfectDaysModel.ParamsId,
            detail: {
                tags: ["Perfect Days"],
                summary: "GET BY ID",
            },
        },
    )
    .get(
        "/:id/comment",
        async ({ params }) => {
            const postId = params.id;
            const response = await PerfectDayService.getCommentByPostId(postId);
            return response;
        },
        {
            params: PerfectDaysModel.ParamsId,
            detail: {
                tags: ["Perfect Days"],
                summary: "GET COMMENT",
            },
        },
    )
    .get(
        "/location",
        async ({ query }) => {
            const response = await PerfectDayService.getPostByLocation(
                query.location,
            );
            return response;
        },
        {
            detail: {
                tags: ["Perfect Days"],
                summary: "GET Location",
            },
        },
    )
    .use(authMacro)
    .get(
        "/archive/stats",
        async ({ user }) => {
            const userId = user.id;
            const response = await PerfectDayService.getArchiveStats(userId);
            return response;
        },
        {
            isAuth: true,
            detail: {
                tags: ["Perfect Days"],
                summary: "GET Year Stats",
            },
        },
    )
    .get(
        "/archive/:year",
        async ({ params, user }) => {
            const year = params.year;
            const userId = user.id;
            const response = await PerfectDayService.getArchiveByYear(
                year,
                userId,
            );
            return response;
        },
        {
            isAuth: true,
            detail: {
                tags: ["Perfect Days"],
                summary: "GET Group Year",
            },
        },
    )
    .post(
        "/like",
        async ({ body, user }) => {
            const userId = user.id;
            const response = await PerfectDayService.likePost(
                userId,
                body.postId,
            );
            return status(201, response);
        },
        {
            body: PerfectDaysModel.UserLikePost,
            isAuth: true,
            detail: {
                tags: ["Perfect Days"],
                summary: "POST LIKE",
            },
        },
    )
    .post(
        "/comment",
        async ({ body, user }) => {
            const userId = user.id;
            const { postId, comment, parentId } = body;
            const response = await PerfectDayService.commentPost(
                userId,
                postId,
                comment,
                parentId || null,
            );
            return status(201, response);
        },
        {
            body: PerfectDaysModel.UserCommentPost,
            isAuth: true,
            detail: {
                tags: ["Perfect Days"],
                summary: "POST COMMENT",
            },
        },
    )
    .post(
        "/upload",
        async ({ body, user }) => {
            const userId = user.id;
            const response = await PerfectDayService.upload(body, userId);
            return status(201, response);
        },
        {
            body: PerfectDaysModel.UploadPayload,
            isAuth: true,
            detail: {
                tags: ["Perfect Days"],
                summary: "POST",
            },
        },
    )
    .patch(
        "/:id/edit",
        async ({ params, body, user }) => {
            const postId = params.id;
            const userId = user.id;
            const response = await PerfectDayService.updatePost(
                body,
                userId,
                postId,
            );
            return status(200, response);
        },
        {
            body: PerfectDaysModel.UpdatePayload,
            isAuth: true,
            params: PerfectDaysModel.ParamsId,
            detail: {
                tags: ["Perfect Days"],
                summary: "PATCH",
            },
        },
    )
    .patch(
        "/:id/archive",
        async ({ params, user, body }) => {
            const postId = params.id;
            const userId = user.id;
            const response = await PerfectDayService.updateArchivePost(
                userId,
                postId,
                body,
            );
            return status(200, response);
        },
        {
            body: PerfectDaysModel.UpdateArchivePost,
            params: PerfectDaysModel.ParamsId,
            isAuth: true,
            detail: {
                tags: ["Perfect Days"],
                summary: "PATCH (Archive)",
            },
        },
    )
    .delete(
        "/:id",
        async ({ params, user }) => {
            const postId = params.id;
            const userId = user.id;
            const response = await PerfectDayService.deletePost(postId, userId);
            return status(204);
        },
        {
            params: PerfectDaysModel.ParamsId,
            isAuth: true,
            detail: {
                tags: ["Perfect Days"],
                summary: "DELETE",
            },
        },
    );
