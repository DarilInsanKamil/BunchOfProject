import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_BASE = "http://localhost:3000/bioskop";
const USER_AGENT = "bioskop-app/1.0";

const server = new McpServer({
    name: "bioskop",
    version: "1.0.0",
});

async function makeNWSRequest<T>(url: string): Promise<T | null> {
    const headers = {
        "User-Agent": USER_AGENT,
        Accept: "application/geo+json",
    };

    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return (await response.json()) as T;
    } catch (error) {
        console.error("Error making NWS request:", error);
        return null;
    }
}

server.registerTool(
    "search_movies",
    {
        description:
            "Search movies by name. if no movies matches return film lainnya",
        inputSchema: {
            namaFilm: z.string().min(1).describe("Movie name or keyword"),
        },
    },
    async ({ namaFilm }) => {
        const res = await fetch(
            `${API_BASE}/movie?namaFilm=${encodeURIComponent(namaFilm)}`,
        );

        if (!res.ok) {
            return {
                content: [{ type: "text", text: "Failed to fetch movies" }],
            };
        }

        const movies = await res.json();

        if (!movies?.length) {
            return {
                content: [{ type: "text", text: "No movies found" }],
            };
        }

        const text = movies
            .map(
                (m: any) =>
                    `${m.title}\nID: ${m.id}\nDuration: ${m.duration} mins\n`,
            )
            .join("\n");

        return {
            content: [{ type: "text", text }],
        };
    },
);

server.registerTool(
    "get_showtimes_by_movie_name",
    {
        description: `Get showtimes for a movie. If no showtime matches the requested time range,
        show the closest available showtimes instead of failing.`,
        inputSchema: {
            namaFilm: z.string().describe("Movie ID"),
        },
    },
    async ({ namaFilm }) => {
        const resMovie = await fetch(
            `${API_BASE}/movie?namaFilm=${encodeURIComponent(namaFilm)}`,
        );

        if (!resMovie.ok) {
            return {
                content: [{ type: "text", text: "Failed to fetch movies" }],
            };
        }

        const movies = await resMovie.json();

        const res = await fetch(`${API_BASE}/movie/${movies.id}`);

        if (!res.ok) {
            return {
                content: [{ type: "text", text: "Failed to fetch showtimes" }],
            };
        }

        const showtimes = await res.json();

        if (!showtimes?.length) {
            return {
                content: [{ type: "text", text: "No showtimes available" }],
            };
        }

        const text = showtimes
            .map(
                (s: any) =>
                    `${s.time}\nStudio: ${s.studioId}\nPrice: ${s.price}\n`,
            )
            .join("\n");

        return {
            content: [{ type: "text", text }],
        };
    },
);

server.registerTool(
    "get_studio",
    {
        description: "Get studio information by ID",
        inputSchema: {
            studioId: z.string().describe("Studio ID"),
        },
    },
    async ({ studioId }) => {
        const res = await fetch(`${API_BASE}/studio/${studioId}`);

        if (!res.ok) {
            return {
                content: [
                    { type: "text", text: "Failed to fetch studio info" },
                ],
            };
        }

        const studio = await res.json();

        return {
            content: [
                {
                    type: "text",
                    text: `Studio ${studio.name}\nSeats: ${studio.capacity}`,
                },
            ],
        };
    },
);

server.registerTool(
    "book_movie_ticket",
    {
        description: "Book movie tickets",
        inputSchema: {
            showtimeId: z.string().describe("Showtime ID"),
            customerName: z.string().describe("Customer name"),
            seatCount: z.number().min(1).describe("Number of seats"),
        },
    },
    async (payload) => {
        const res = await fetch(`${API_BASE}/booking`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            return {
                content: [{ type: "text", text: "Booking failed" }],
            };
        }

        const booking = await res.json();

        return {
            content: [
                {
                    type: "text",
                    text: `Booking confirmed!\nBooking ID: ${booking.id}`,
                },
            ],
        };
    },
);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Bioskop MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
