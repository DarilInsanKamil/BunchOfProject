import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

import path from "path";

const serverParams = new StdioClientTransport({
    command: "bun",
    args: [path.join(import.meta.dir, "mcp-server.ts")],
});

export const mcpClient = new Client({
    name: "bioskop-client",
    version: "1.0.0",
});

await mcpClient.connect(serverParams);
