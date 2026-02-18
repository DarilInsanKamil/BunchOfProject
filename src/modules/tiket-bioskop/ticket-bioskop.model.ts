import { t } from "elysia";

export namespace BioskopModel {
    export const StudioPayload = t.Object({
        nama_studio: t.String({ minLength: 1 }),
        kapasitas_studio: t.Integer(),
    });
    export type StudioPayload = typeof StudioPayload.static;

    export const MoviePayload = t.Object({
        nama_film: t.String({ minLength: 1 }),
        durasi: t.Integer(),
        genre: t.String(),
        sinopsis: t.String({ minLength: 1 }),
    });
    export type MoviePayload = typeof MoviePayload.static;

    export const ShowtimePayload = t.Object({
        studioId: t.String(),
        movieId: t.String(),
        harga: t.String(),
        waktuTayang: t.String(),
    });
    export type ShowtimePayload = typeof ShowtimePayload.static;

    export const BookingPayload = t.Object({
        showtimeId: t.String(),
        namaPemesan: t.String(),
        nomorKursi: t.String(),
    });

    export type BookingPayload = typeof BookingPayload.static;

    export const StudioResponseDetail = t.Object({
        id: t.String(),
        nama_studio: t.String(),
        kapasitas_studio: t.String(),
        created_at: t.Date(),
        updated_at: t.Date(),
    });
    export type StudioResponseDetail = typeof StudioResponseDetail.static;

    export const StudioResponse = t.Array(StudioResponseDetail);
    export type StudioResponse = typeof StudioResponse.static;

    export const BookingResponseDetail = t.Object({
        id: t.String(),
        nama_pemesan: t.String(),
        showtime_id: t.String(),
        created_at: t.Date(),
        updated_at: t.Date(),
    });
    export type BookingResponseDetail = typeof BookingResponseDetail.static;

    export const BookingResponse = t.Array(BookingResponseDetail);
    export type BookingResponse = typeof BookingResponse.static;
}
