#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z, ZodTypeAny } from "zod";
import { SociaVaultClient, SociaVaultError } from "./client.js";
import { endpoints, ParamDef } from "./endpoints.js";

const VERSION = "2.0.0";

const apiKey = process.env.SOCIAVAULT_API_KEY;
if (!apiKey) {
  console.error(
    "[sociavault-mcp] Missing SOCIAVAULT_API_KEY.\n" +
      "Set it in your MCP client config. Get a key at https://sociavault.com/dashboard",
  );
  process.exit(1);
}

const baseUrl = process.env.SOCIAVAULT_BASE_URL || "https://api.sociavault.com";
const client = new SociaVaultClient(apiKey, baseUrl, VERSION);

/** Convert a ParamDef into a Zod schema with description, default, and optionality. */
function toZod(def: ParamDef): ZodTypeAny {
  let schema: ZodTypeAny =
    def.type === "number" ? z.number() : def.type === "boolean" ? z.boolean() : z.string();

  schema = schema.describe(def.description);

  if (def.default !== undefined) {
    schema = schema.default(def.default as never);
  } else if (!def.required) {
    schema = schema.optional();
  }
  return schema;
}

const server = new McpServer({ name: "sociavault", version: VERSION });

for (const ep of endpoints) {
  const inputSchema: Record<string, ZodTypeAny> = {};
  for (const [key, def] of Object.entries(ep.params)) {
    inputSchema[key] = toZod(def);
  }

  server.registerTool(
    ep.name,
    {
      title: ep.title,
      description: ep.description,
      inputSchema,
      annotations: {
        title: ep.title,
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (args: Record<string, unknown>) => {
      try {
        const result = await client.get(ep.path, args ?? {});
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
          structuredContent: result as unknown as Record<string, unknown>,
        };
      } catch (err) {
        const message =
          err instanceof SociaVaultError
            ? err.message
            : err instanceof Error
              ? err.message
              : String(err);
        return {
          content: [{ type: "text" as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stderr is safe to log to; stdout is reserved for the JSON-RPC protocol.
  console.error(
    `[sociavault-mcp] v${VERSION} ready on stdio with ${endpoints.length} tools.`,
  );
}

main().catch((err) => {
  console.error("[sociavault-mcp] Fatal error:", err);
  process.exit(1);
});
