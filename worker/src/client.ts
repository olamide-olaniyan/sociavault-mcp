/**
 * Worker-native SociaVault API client.
 *
 * This mirrors the stdio package's client (src/client.ts) but uses the
 * platform `fetch` instead of axios, so it runs on Cloudflare Workers with
 * zero runtime dependencies.
 */

/** Normalized result returned to MCP tools, regardless of upstream envelope shape. */
export interface NormalizedResult {
  data: unknown;
  creditsUsed?: number;
  endpoint?: string;
  note?: string;
}

/** Error type carrying the upstream HTTP status when available. */
export class SociaVaultError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "SociaVaultError";
    this.status = status;
  }
}

/** GET a scrape endpoint and return a normalized result. */
export async function callSociaVault(
  apiKey: string,
  baseUrl: string,
  path: string,
  params: Record<string, unknown>,
  version: string,
): Promise<NormalizedResult> {
  const url = new URL(baseUrl.replace(/\/+$/, "") + path);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  // Cloudflare Workers don't support a fetch timeout option; use AbortController.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-API-Key": apiKey,
        "User-Agent": `sociavault-mcp/${version}`,
        Accept: "application/json",
      },
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof Error && err.name === "AbortError") {
      throw new SociaVaultError(
        "Request timed out after 120s. The target may be slow or unavailable.",
      );
    }
    throw new SociaVaultError(
      `Network error: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
  clearTimeout(timeout);

  let body: unknown = undefined;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    throw mapError(res.status, body);
  }

  return normalizeEnvelope(body);
}

/** Map an upstream error status + body to an actionable SociaVaultError. */
function mapError(status: number, body: unknown): SociaVaultError {
  const apiMsg =
    body && typeof body === "object"
      ? ((body as any).error ?? (body as any).message ?? undefined)
      : typeof body === "string"
        ? body
        : undefined;

  if (status === 401 || status === 403) {
    return new SociaVaultError(
      `Authentication failed (${status}). Check that your SociaVault API key is set and valid. Get a key at https://sociavault.com/dashboard.${apiMsg ? ` API said: ${apiMsg}` : ""}`,
      status,
    );
  }
  if (status === 402) {
    return new SociaVaultError(
      `Out of credits (402). Top up at https://sociavault.com/pricing.${apiMsg ? ` ${apiMsg}` : ""}`,
      status,
    );
  }
  if (status === 404) {
    return new SociaVaultError(
      `Not found (404): ${apiMsg || "the account/resource does not exist, is private, or the URL/handle is wrong"}.`,
      status,
    );
  }
  if (status === 400 || status === 422) {
    return new SociaVaultError(
      `Invalid request (${status}): ${apiMsg || "check the parameters you passed"}.`,
      status,
    );
  }
  if (status === 429) {
    return new SociaVaultError(
      `Rate limited (429). ${apiMsg || "Slow down and retry shortly."}`,
      status,
    );
  }
  return new SociaVaultError(`API error ${status}: ${apiMsg || "unexpected response"}`, status);
}

/**
 * Collapse the various API response envelopes into a single shape.
 * Most endpoints return { success, data, credits_used, endpoint }, but some
 * (reddit details, threads/search, pinterest/*) return the payload at the top level.
 */
function normalizeEnvelope(body: any): NormalizedResult {
  if (body == null || typeof body !== "object") {
    return { data: body };
  }

  const creditsUsed: number | undefined =
    typeof body.credits_used === "number"
      ? body.credits_used
      : typeof body.creditsUsed === "number"
        ? body.creditsUsed
        : undefined;

  const endpoint: string | undefined =
    typeof body.endpoint === "string" ? body.endpoint : undefined;
  const note: string | undefined = typeof body.note === "string" ? body.note : undefined;

  if ("data" in body && body.data !== undefined) {
    return { data: body.data, creditsUsed, endpoint, note };
  }

  const {
    success: _success,
    credits_used: _cu1,
    creditsUsed: _cu2,
    endpoint: _ep,
    note: _note,
    ...rest
  } = body;

  const payload = Object.keys(rest).length > 0 ? rest : body;
  return { data: payload, creditsUsed, endpoint, note };
}
