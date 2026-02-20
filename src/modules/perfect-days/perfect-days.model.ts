import { t } from "elysia";
export namespace PerfectDaysModel {
    export const UploadPayload = t.Object({
        title: t.String({ minLength: 1 }),
        deskripsi: t.String(),
        user_id: t.Optional(t.String()),
        image_url: t.Files({
            maxSize: "6m",
            type: ["image/jpeg", "image/png", "image/webp"],
        }),
        location: t.Optional(t.String()),
        latitude: t.Optional(t.String()),
        longitude: t.Optional(t.String()),
        archive: t.Optional(t.String()),
    });
    export type UploadPayload = typeof UploadPayload.static;

    export const UpdatePayload = t.Partial(UploadPayload);
    export type UpdatePayload = typeof UpdatePayload.static;

    export const ResponseDetailSuccess = t.Object({
        id: t.String(),
        title: t.String(),
        deskripsi: t.String(),
        nama_user: t.Optional(t.String()),
        latitude: t.Optional(t.String()),
        longitude: t.Optional(t.String()),
        like: t.String(),
        comment: t.String(),
        image_url: t.File({
            maxSize: "6m",
        }),
        location: t.Optional(t.String()),
        archive: t.Boolean(),
        created_at: t.Date(),
        updated_at: t.Date(),
    });
    export type ResponseDetailSuccess = typeof ResponseDetailSuccess.static;

    export const ResponseSuccess = t.Array(ResponseDetailSuccess);
    export type ResponseSuccess = typeof ResponseSuccess.static;

    export const ParamsId = t.Object({ id: t.String() });
    export type ParamsId = typeof ParamsId.static;

    export const UpdateArchivePost = t.Object({ archive: t.Boolean() });
    export type UpdateArchivePost = typeof UpdateArchivePost.static;

    export const UserLikePost = t.Object({
        postId: t.String(),
    });
    export type UserLikePost = typeof UserLikePost.static;

    export const UserCommentPost = t.Object({
        postId: t.String(),
        parentId: t.Optional(t.String()),
        comment: t.String({ minLength: 1 }),
    });
    export type UserCommentPost = typeof UserCommentPost.static;

    export const ErrorResponse = t.Object({
        message: t.String(),
        status: t.Numeric(),
    });

    export type ErrorResponse = typeof ErrorResponse.static;
}
