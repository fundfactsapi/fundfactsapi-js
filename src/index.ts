import type { BatchResponse, FundFactsErrorBody, FundResponse, MeResponse, OverlapResponse, PortfolioResponse, SearchResponse } from "./types";

export type * from "./types";

export interface FundFactsOptions {
  /** API key (ffk_…). Defaults to process.env.FUNDFACTS_API_KEY. */
  apiKey?: string;
  /** Defaults to https://fundfactsapi.com/api/v1 */
  baseUrl?: string;
  /** Request timeout in ms. Cold funds can take up to 300 s; default 300 000. */
  timeoutMs?: number;
  /** Custom fetch (Node < 18, tests). */
  fetch?: typeof fetch;
  /** Cache payloads in memory until `expiresAt` (default true). */
  cache?: boolean;
}

export class FundFactsError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public retryAfter?: number,
    public body?: FundFactsErrorBody,
  ) {
    super(message);
    this.name = "FundFactsError";
  }
}

export interface ChangesResponse {
  since: string;
  count: number;
  hasMore: boolean;
  nextSince: string;
  changes: Array<{ id: number; isin: string; name: string | null; event: "fund.changed" | "fund.refreshed"; field: string; old: unknown; new: unknown; dataAsOf: string | null; changedAt: string }>;
}

/**
 * FundFacts API client — zero dependencies, works in Node 18+, Bun, Deno and
 * edge runtimes. Every method resolves to the parsed JSON body and throws
 * FundFactsError on a non-2xx status.
 *
 *   const ff = new FundFacts({ apiKey: process.env.FUNDFACTS_API_KEY });
 *   const fund = await ff.getFund("IE00B4L5Y983");
 */
export class FundFacts {
  private readonly key: string;
  private readonly base: string;
  private readonly timeoutMs: number;
  private readonly f: typeof fetch;
  private readonly cache: Map<string, { expiresAt: number; body: FundResponse }> | null;

  constructor(opts: FundFactsOptions = {}) {
    // No @types/node dependency: read the env through globalThis so the package also types in browsers / edge runtimes.
    const envKey = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.FUNDFACTS_API_KEY;
    this.key = opts.apiKey ?? envKey ?? "";
    if (!this.key) throw new Error("FundFacts: pass { apiKey } or set FUNDFACTS_API_KEY");
    this.base = (opts.baseUrl ?? "https://fundfactsapi.com/api/v1").replace(/\/$/, "");
    this.timeoutMs = opts.timeoutMs ?? 300_000;
    this.f = opts.fetch ?? fetch;
    this.cache = opts.cache === false ? null : new Map();
  }

  /** Structured factsheet for one ISIN (1 credit). */
  async getFund(isin: string): Promise<FundResponse> {
    const id = isin.trim().toUpperCase();
    const hit = this.cache?.get(id);
    if (hit && hit.expiresAt > Date.now()) return hit.body;
    const body = await this.request<FundResponse>("GET", `/funds/${id}`);
    if (this.cache && body.expiresAt) this.cache.set(id, { expiresAt: Date.parse(body.expiresAt), body });
    return body;
  }

  /** Batch lookup, up to the plan's batch size (1 credit per ISIN answered). */
  getFunds(isins: string[], opts: { wait?: boolean } = {}): Promise<BatchResponse> {
    return this.request<BatchResponse>("POST", "/funds", { isins, wait: opts.wait ?? true });
  }

  /** Name / issuer / ISIN-prefix search over loaded funds (free). */
  search(query: string, limit = 10): Promise<SearchResponse> {
    return this.request<SearchResponse>("GET", `/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  }

  /** Weighted look-through (1 credit per position). Weights are normalised to 100. */
  portfolio(positions: Array<{ isin: string; weight: number }>, opts: { wait?: boolean } = {}): Promise<PortfolioResponse> {
    return this.request<PortfolioResponse>("POST", "/portfolio", { positions, wait: opts.wait ?? true });
  }

  /** Pairwise holdings overlap (1 credit per ISIN). */
  overlap(isins: string[]): Promise<OverlapResponse> {
    return this.request<OverlapResponse>("GET", `/overlap?isins=${encodeURIComponent(isins.join(","))}`);
  }

  /** Change feed since a timestamp (Scale and Enterprise; free). */
  changes(opts: { since?: string | Date; isins?: string[]; event?: "fund.changed" | "fund.refreshed"; limit?: number } = {}): Promise<ChangesResponse> {
    const q = new URLSearchParams();
    if (opts.since) q.set("since", typeof opts.since === "string" ? opts.since : opts.since.toISOString());
    if (opts.isins?.length) q.set("isins", opts.isins.join(","));
    if (opts.event) q.set("event", opts.event);
    if (opts.limit) q.set("limit", String(opts.limit));
    return this.request<ChangesResponse>("GET", `/changes?${q}`);
  }

  /** Plan and credit state for the key (free). */
  me(): Promise<MeResponse> {
    return this.request<MeResponse>("GET", "/me");
  }

  /** Iterate every fund matching the filter as NDJSON (Scale and Enterprise). */
  async *export(filter: { issuer?: string; assetClass?: string; currency?: string; since?: string } = {}): AsyncGenerator<FundResponse> {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(filter)) if (v) q.set(k, v);
    q.set("gzip", "0");
    const res = await this.f(`${this.base}/export?${q}`, { headers: this.headers(), signal: AbortSignal.timeout(this.timeoutMs) });
    if (!res.ok || !res.body) throw await this.toError(res);
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let nl: number;
      while ((nl = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, nl).trim();
        buf = buf.slice(nl + 1);
        if (line) yield JSON.parse(line) as FundResponse;
      }
    }
    if (buf.trim()) yield JSON.parse(buf) as FundResponse;
  }

  private headers(json = false): Record<string, string> {
    return { Authorization: `Bearer ${this.key}`, Accept: "application/json", ...(json ? { "Content-Type": "application/json" } : {}), "User-Agent": "fundfacts-js/0.1.0" };
  }

  private async request<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
    const res = await this.f(`${this.base}${path}`, {
      method,
      headers: this.headers(body !== undefined),
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    if (!res.ok) throw await this.toError(res);
    return (await res.json()) as T;
  }

  private async toError(res: Response): Promise<FundFactsError> {
    let parsed: FundFactsErrorBody | undefined;
    try {
      parsed = (await res.json()) as FundFactsErrorBody;
    } catch {
      /* not JSON */
    }
    const retryAfter = Number(res.headers.get("Retry-After")) || parsed?.error?.retryAfter;
    return new FundFactsError(res.status, parsed?.error?.code ?? "http_error", parsed?.error?.message ?? res.statusText, retryAfter, parsed);
  }
}

export default FundFacts;
