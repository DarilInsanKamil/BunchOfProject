import { t } from "elysia";
export namespace PerfectDaysModel {
    export const UploadPayload = t.Object({
        title: t.String({ minLength: 1 }),
        deskripsi: t.String(),
        user_id: t.Optional(t.String()),
        image_url: t.File({
            maxSize: "6m",
            type: "image/*",
        }),
        location: t.Optional(t.String()),
        archive: t.Optional(t.String()),
    });
    export type UploadPayload = typeof UploadPayload.static;

    export const ResponseDetailSuccess = t.Object({
        id: t.String(),
        title: t.String(),
        deskripsi: t.String(),
        nama_user: t.Optional(t.String()),
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

    export const ErrorResponse = t.Object({
        message: t.String(),
        status: t.Numeric(),
    });

    export type ErrorResponse = typeof ErrorResponse.static;
}
