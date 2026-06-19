import axios, { AxiosInstance } from "axios";

/** Normalized result returned to MCP tools, regardless of upstream envelope shape. */
export interface NormalizedResult {
  /** The endpoint payload (the `data` field, or the top-level body for endpoints that don't wrap). */
  data: unknown;
  /** Credits consumed by this call, if reported by the API. */
  creditsUsed?: number;
  /** The canonical API endpoint that served the request, if reported. */
  endpoint?: string;
  /** Optional advisory note returned by some endpoints. */
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

/**
 * Thin, typed client over the SociaVault REST API.
 * Handles auth, query serialization, envelope normalization, and friendly errors.
 */
export class SociaVaultClient {
  private http: AxiosInstance;

  constructor(apiKey: string, baseUrl: string, version: string) {
    this.http = axios.create({
      baseURL: baseUrl.replace(/\/+$/, ""),
      headers: {
        "X-API-Key": apiKey,
        "User-Agent": `sociavault-mcp/${version}`,
        Accept: "application/json",
      },
      timeout: 120_000,
    });
  }

  /** GET a scrape endpoint and return a normalized result. */
  async get(path: string, params: Record<string, unknown>): Promise<NormalizedResult> {
    const query: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        query[key] = value;
      }
    }

    try {
      const res = await this.http.get(path, { params: query });
      return normalizeEnvelope(res.data);
    } catch (err) {
      throw normalizeError(err);
    }
  }
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
        : typeof body.credits_remaining === "number"
          ? undefined
          : undefined;

  const endpoint: string | undefined =
    typeof body.endpoint === "string" ? body.endpoint : undefined;
  const note: string | undefined = typeof body.note === "string" ? body.note : undefined;

  // Standard envelope: payload lives under `data`.
  if ("data" in body && body.data !== undefined) {
    return { data: body.data, creditsUsed, endpoint, note };
  }

  // Top-level payload: strip known envelope keys and return the rest.
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

/** Convert axios/unknown errors into actionable SociaVaultError messages. */
function normalizeError(err: unknown): SociaVaultError {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const apiMsg =
      (err.response?.data as any)?.error ||
      (err.response?.data as any)?.message ||
      undefined;

    if (status === 401 || status === 403) {
      return new SociaVaultError(
        `Authentication failed (${status}). Check that SOCIAVAULT_API_KEY is set and valid. Get a key at https://sociavault.com/dashboard.${apiMsg ? ` API said: ${apiMsg}` : ""}`,
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
    if (status === 422 || status === 400) {
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
    if (typeof status === "number") {
      return new SociaVaultError(`API error ${status}: ${apiMsg || err.message}`, status);
    }
    if (err.code === "ECONNABORTED") {
      return new SociaVaultError("Request timed out after 120s. The target may be slow or unavailable.");
    }
    return new SociaVaultError(`Network error: ${err.message}`);
  }
  return new SociaVaultError(err instanceof Error ? err.message : String(err));
}
