/**
 * SociaVault MCP server — Cloudflare Worker (remote, hosted).
 *
 * Implements the MCP Streamable HTTP transport in a stateless way (no Durable
 * Objects), so it runs on the Cloudflare Workers free tier. Every tool maps to
 * a documented SociaVault REST endpoint from ../../src/endpoints.
 *
 * Auth: each caller supplies their OWN SociaVault API key, so usage bills to
 * them, not to us. The key is read (in order) from:
 *   1. `x-api-key` header
 *   2. `Authorization: Bearer <key>` header
 *   3. `?apiKey=` or `?key=` query parameter (handy for clients like ChatGPT
 *      that can't set custom headers without OAuth)
 *
 * Endpoint: POST /mcp   (GET /mcp returns 405 — we don't push server events)
 */

import { endpoints, type ParamDef } from "../../src/endpoints";
import { callSociaVault, SociaVaultError } from "./client";

const VERSION = "2.0.0";
const DEFAULT_BASE_URL = "https://api.sociavault.com";
const DEFAULT_PROTOCOL_VERSION = "2025-06-18";
const SUPPORTED_PROTOCOL_VERSIONS = new Set([
  "2024-11-05",
  "2025-03-26",
  "2025-06-18",
  "2026-07-28",
]);

// ---------------------------------------------------------------------------
// JSON-RPC types
// ---------------------------------------------------------------------------
interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: any;
}

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-api-key, Mcp-Session-Id, MCP-Protocol-Version",
  "Access-Control-Max-Age": "86400",
};

// ---------------------------------------------------------------------------
// Tool schema helpers
// ---------------------------------------------------------------------------
function toJsonSchema(def: ParamDef): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    type: def.type,
    description: def.description,
  };
  if (def.default !== undefined) schema.default = def.default;
  return schema;
}

function buildToolList() {
  return endpoints.map((ep) => {
    const properties: Record<string, unknown> = {};
    const required: string[] = [];
    for (const [key, def] of Object.entries(ep.params)) {
      properties[key] = toJsonSchema(def);
      if (def.required) required.push(key);
    }
    return {
      name: ep.name,
      title: ep.title,
      description: ep.description,
      inputSchema: {
        type: "object",
        properties,
        ...(required.length ? { required } : {}),
      },
      annotations: {
        title: ep.title,
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    };
  });
}

const TOOLS = buildToolList();
const TOOLS_BY_NAME = new Map(endpoints.map((ep) => [ep.name, ep]));

// ---------------------------------------------------------------------------
// API key extraction
// ---------------------------------------------------------------------------
function extractApiKey(req: Request, url: URL): string | undefined {
  const header = req.headers.get("x-api-key");
  if (header) return header.trim();

  const auth = req.headers.get("authorization");
  if (auth && /^bearer\s+/i.test(auth)) {
    return auth.replace(/^bearer\s+/i, "").trim();
  }

  const q = url.searchParams.get("apiKey") || url.searchParams.get("key");
  if (q) return q.trim();

  return undefined;
}

// ---------------------------------------------------------------------------
// JSON-RPC responses
// ---------------------------------------------------------------------------
function rpcResult(id: JsonRpcRequest["id"], result: unknown): Response {
  return json({ jsonrpc: "2.0", id: id ?? null, result });
}

function rpcError(
  id: JsonRpcRequest["id"],
  code: number,
  message: string,
): Response {
  return json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } });
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

// ---------------------------------------------------------------------------
// Method dispatch
// ---------------------------------------------------------------------------
async function handleRpc(
  msg: JsonRpcRequest,
  apiKey: string | undefined,
  baseUrl: string,
): Promise<Response | null> {
  // Notifications carry no id and expect no response body.
  const isNotification = msg.id === undefined || msg.id === null;

  switch (msg.method) {
    case "initialize": {
      const requested = msg.params?.protocolVersion;
      const protocolVersion =
        typeof requested === "string" && SUPPORTED_PROTOCOL_VERSIONS.has(requested)
          ? requested
          : DEFAULT_PROTOCOL_VERSION;
      return rpcResult(msg.id, {
        protocolVersion,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "sociavault", version: VERSION },
        instructions:
          "SociaVault exposes public social-media data across 11 platforms plus ad libraries. Each tool maps to one documented REST endpoint. Supply your SociaVault API key via the connector URL (?apiKey=) or the x-api-key header.",
      });
    }

    case "notifications/initialized":
    case "notifications/cancelled":
      // Acknowledged with no body.
      return null;

    case "ping":
      return rpcResult(msg.id, {});

    case "tools/list":
      return rpcResult(msg.id, { tools: TOOLS });

    case "tools/call": {
      const name = msg.params?.name;
      const args = (msg.params?.arguments ?? {}) as Record<string, unknown>;
      const ep = typeof name === "string" ? TOOLS_BY_NAME.get(name) : undefined;

      if (!ep) {
        return rpcError(msg.id, -32602, `Unknown tool: ${String(name)}`);
      }

      if (!apiKey) {
        return rpcResult(msg.id, {
          content: [
            {
              type: "text",
              text: "Error: No SociaVault API key provided. Add it to the connector URL as ?apiKey=sk_live_... or send an x-api-key header. Get a key at https://sociavault.com/dashboard.",
            },
          ],
          isError: true,
        });
      }

      try {
        const result = await callSociaVault(apiKey, baseUrl, ep.path, args, VERSION);
        return rpcResult(msg.id, {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          structuredContent: result as unknown as Record<string, unknown>,
        });
      } catch (err) {
        const message =
          err instanceof SociaVaultError
            ? err.message
            : err instanceof Error
              ? err.message
              : String(err);
        return rpcResult(msg.id, {
          content: [{ type: "text", text: `Error: ${message}` }],
          isError: true,
        });
      }
    }

    default:
      if (isNotification) return null;
      return rpcError(msg.id, -32601, `Method not found: ${msg.method}`);
  }
}

// ---------------------------------------------------------------------------
// Worker entry
// ---------------------------------------------------------------------------
export default {
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);

    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // Friendly landing page at the root.
    if (url.pathname === "/" || url.pathname === "") {
      return json({
        name: "sociavault-mcp",
        version: VERSION,
        transport: "streamable-http",
        endpoint: "/mcp",
        tools: TOOLS.length,
        docs: "https://docs.sociavault.com",
        usage: "POST JSON-RPC to /mcp. Supply your SociaVault API key via ?apiKey= or the x-api-key header.",
      });
    }

    if (url.pathname !== "/mcp") {
      return json({ error: "Not found. Use POST /mcp." }, 404);
    }

    // We don't stream server-initiated events, so reject GET on /mcp.
    if (req.method === "GET") {
      return new Response("Method Not Allowed. POST JSON-RPC to this endpoint.", {
        status: 405,
        headers: { Allow: "POST, OPTIONS", ...CORS_HEADERS },
      });
    }

    if (req.method !== "POST") {
      return rpcError(null, -32600, "Only POST is supported on /mcp.");
    }

    let payload: unknown;
    try {
      payload = await req.json();
    } catch {
      return rpcError(null, -32700, "Parse error: body is not valid JSON.");
    }

    const apiKey = extractApiKey(req, url);
    const baseUrl = url.searchParams.get("baseUrl") || DEFAULT_BASE_URL;

    // A single request object (batching was removed from the MCP spec).
    if (payload && typeof payload === "object" && !Array.isArray(payload)) {
      const msg = payload as JsonRpcRequest;
      const res = await handleRpc(msg, apiKey, baseUrl);
      // Notification: nothing to return.
      return res ?? new Response(null, { status: 202, headers: CORS_HEADERS });
    }

    // Defensive: handle an array of messages if a client still sends one.
    if (Array.isArray(payload)) {
      const responses: unknown[] = [];
      for (const item of payload) {
        const res = await handleRpc(item as JsonRpcRequest, apiKey, baseUrl);
        if (res) responses.push(await res.json());
      }
      if (responses.length === 0) {
        return new Response(null, { status: 202, headers: CORS_HEADERS });
      }
      return json(responses);
    }

    return rpcError(null, -32600, "Invalid Request.");
  },
};
