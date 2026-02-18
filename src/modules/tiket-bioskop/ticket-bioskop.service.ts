import { db } from "@/db";
import { BioskopModel } from "./ticket-bioskop.model";
import { booking, movie, showtime, studio } from "@/db/schema";
import { eq } from "drizzle-orm";

export abstract class BioskopService {
    static async insertStudio(payload: BioskopModel.StudioPayload) {
        const customPayload = {
            namaStudio: payload.nama_studio,
            kapasitas: Number(payload.kapasitas_studio) as number,
        };
        const result = await db
            .insert(studio)
            .values(customPayload)
            .returning({ id: studio.id });
        if (result.length === 0) {
            throw Error("Gagal menambah data");
        }
        return result[0].id;
    }

    static async insertMovie(payload: BioskopModel.MoviePayload) {
        const customPayload = {
            namaFilm: payload.nama_film,
            durasi: Number(payload.durasi) as number,
            sinopsis: payload.sinopsis,
            genre: payload.genre,
        };

        const result = await db
            .insert(movie)
            .values(customPayload)
            .returning({ id: movie.id });

        if (result.length === 0) {
            throw Error("Gagal menambah data");
        }
        return result[0].id;
    }

    static async insertShowtime(payload: BioskopModel.ShowtimePayload) {
        const customPayload = {
            studioId: payload.studioId,
            movieId: payload.movieId,
            harga: Number(payload.harga),
            waktuTayang: payload.waktuTayang,
        };

        const result = await db
            .insert(showtime)
            .values(customPayload)
            .returning({ id: showtime.id });
        if (result.length === 0) {
            throw Error("Gagal menambah data");
        }
        return result[0].id;
    }

    static async insertBooking(payload: BioskopModel.BookingPayload) {
        const customPayload = {
            showttimeId: payload.showtimeId,
            namaPemesan: payload.namaPemesan,
            nomorKursi: payload.nomorKursi,
        };

        const result = await db
            .insert(booking)
            .values(customPayload)
            .returning({ id: booking.id });
        if (result.length === 0) {
            throw Error("Gagal menambah data");
        }
        return result[0].id;
    }
    static async getMovie(namaFilm: string) {
        const result = await db
            .select()
            .from(movie)
            .where(eq(movie.namaFilm, namaFilm));
        return result;
    }
    static async getStudioById(id: string) {
        const result = await db.select().from(studio).where(eq(studio.id, id));
        return result[0];
    }

    static async getShowtimesByMovie(movieId: string) {
        const result = await db
            .select()
            .from(showtime)
            .where(eq(showtime.movieId, movieId));
        return result;
    }
}
