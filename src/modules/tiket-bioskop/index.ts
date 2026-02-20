import Elysia, { t } from "elysia";
import { BioskopModel } from "./ticket-bioskop.model";
import { BioskopService } from "./ticket-bioskop.service";

export const bioskop = new Elysia({ prefix: "/bioskop" })
    .post(
        "/studio",
        async ({ body }) => {
            const response = await BioskopService.insertStudio(body);
            return response;
        },
        {
            body: BioskopModel.StudioPayload,
            detail: {
                tags: ["Bioskop"],
                summary: "POST Studio",
            },
        },
    )
    .get(
        "/movie",
        async ({ query }) => {
            const namaFilm = query.namaFilm;
            const response = await BioskopService.getMovie(namaFilm);
            return response;
        },
        {
            detail: {
                tags: ["Bioskop"],
                summary: "GET Movie",
            },
        },
    )
    .post(
        "/movie",
        async ({ body }) => {
            const response = await BioskopService.insertMovie(body);
            return response;
        },
        {
            body: BioskopModel.MoviePayload,
            detail: {
                tags: ["Bioskop"],
                summary: "POST Movie",
            },
        },
    )
    .post(
        "/showtime",
        async ({ body }) => {
            const response = await BioskopService.insertShowtime(body);
            return response;
        },
        {
            body: BioskopModel.ShowtimePayload,
            detail: {
                tags: ["Bioskop"],
                summary: "POST Showtime",
            },
        },
    )
    .post(
        "/booking",
        async ({ body }) => {
            const response = await BioskopService.insertBooking(body);
            return response;
        },
        {
            body: BioskopModel.BookingPayload,
            detail: {
                tags: ["Bioskop"],
                summary: "POST Booking",
            },
        },
    )
    .get(
        "/studio/:id",
        async ({ params }) => {
            const studioId = params.id;
            const response = await BioskopService.getStudioById(studioId);
            return response;
        },
        {
            detail: {
                tags: ["Bioskop"],
                summary: "GET Studio By Id",
            },
        },
    )
    .get(
        "/movie/:id",
        async ({ params }) => {
            const movieId = params.id;
            const response = await BioskopService.getShowtimesByMovie(movieId);
            return response;
        },
        {
            detail: {
                tags: ["Bioskop"],
                summary: "GET Showtime By Movie Id",
            },
        },
    );

// 019c7112-285e-7100-925e-a32e9420b030
// 019c7112-bfa4-729c-87c8-04d1898b41f8
