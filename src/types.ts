// FundFacts API — response types, generated 2026-09-09 from the live field reference.
// Regenerate with `npx tsx scripts/build-sdk-types.mts` or download from https://fundfactsapi.com/dashboard when the API changes.

/** Envelope returned by GET /api/v1/funds/{isin}. */
export interface FundResponse {
  /** Canonical upper-case ISIN that was resolved. */
  isin: string;
  /** Fund / share-class name. */
  name: string | null;
  /** true when the payload was served from the 24-hour cache, false when it was refreshed for this request. */
  cached: boolean;
  /** When the payload was produced. */
  generatedAt: string;
  /** When the payload will be considered stale and refreshed on the next request. */
  expiresAt: string;
  /** Plan of the API key used for the request. */
  plan: "free" | "starter" | "pro" | "scale" | "enterprise";
  /** Credit state after this request: monthly credits (limit), credits left, credits used this month, requests billed as overage, the next monthly reset (UTC) and the per-minute burst allowance. null limit means metered / unlimited. */
  quota: {
    limit: number | null;
    remaining: number | null;
    used: number;
    overageUsed: number;
    resetAt: string;
    burst: {
      limit: number | null;
      remaining: number | null;
    };
  };
  data: FundData;
}

/** The structured factsheet (`data`). Fields that do not apply to the asset class are "", null or []. */
export interface FundData {
  /** The fund's stated investment objective / strategy paragraph. */
  investmentObjective: string;
  /** Security-type label of the share class. */
  securityType: string;
  /** Normalized structure token derived from securityType. */
  structure: string;
  /** Share-class letter/label when it can be inferred (e.g. from the fund name). */
  shareClass: string | null;
  keyFacts: {
    /** Broad asset class. */
    assetClass: string;
    /** FundFacts category, identical to profile.category (composed from the disclosed exposures; see the profile group). */
    subAsset: string;
    /** Share-class base currency (ISO 4217). */
    currency: string;
    /** Fund size / net assets, formatted as reported, with unit and currency. */
    aum: string;
    /** Inception date of the share class. */
    inception: string;
    /** Income treatment. */
    distribution: string;
    /** Number of holdings in the portfolio. */
    holdings: string | number;
    /** Portfolio manager(s) or management company. */
    manager: string;
  };
  /** Tenure of the longest-serving manager, when disclosed. */
  managerTenure: string;
  /** Primary prospectus benchmark / index tracked. */
  benchmarkName: string;
  /** SRRI / SRI risk indicator on a 1 (lowest) to 7 (highest) scale. Falls back to an asset-class heuristic when not disclosed. */
  riskRating: number | null;
  profile: {
    /** Broad kind, derived from keyFacts.assetClass. */
    kind: "equity" | "fixedIncome" | "moneyMarket" | "allocation" | "alternative" | "other";
    /** Composed label: region + valuation (or sector for sector funds) for equity; currency + credit grade + duration for bonds; equity share for allocation funds. */
    category: string;
    /** SRRI 1–2 low, 3–4 medium, 5–7 high. */
    riskBand: "low" | "medium" | "high" | null;
    /** Weight of the ten largest holdings: ≥50% concentrated, 30–50% balanced, <30% diversified. */
    concentration: "concentrated" | "balanced" | "diversified" | null;
    /** Largest region (or country) when it is ≥80% of the portfolio; otherwise "Global". */
    regionFocus: string | null;
    /** For Global funds, the largest region when it is 50–80% of the portfolio. */
    regionTilt: string | null;
    /** Equity only. Largest sector when ≥30%, otherwise "Broad". A fund with ≥50% in one sector is categorised as a sector fund. */
    sectorTilt: string | null;
    /** Equity only, from the portfolio P/E: <15 value, 15–22 blend, >22 growth. */
    valuation: "value" | "blend" | "growth" | null;
    /** Bonds and money market, from the credit buckets: AAA–A ≥60% high; investment grade (≥BBB) ≥80% medium; otherwise low. */
    creditQuality: "high" | "medium" | "low" | null;
    /** Bonds, from effective or modified duration: <3.5 years limited, 3.5–6 moderate, >6 extensive. */
    rateSensitivity: "limited" | "moderate" | "extensive" | null;
    /** Allocation funds: equity weight of the asset allocation, in percent. */
    equityShare: number | null;
    /** Version of the rule set that produced the profile. */
    rules: string;
  };
  /** Largest positions with their portfolio weight in percent. */
  topHoldings: Array<{
    name: string;
    weight: number;
  }>;
  /** Country exposure. */
  geography: Array<{
    label: string;
    weight: number;
  }>;
  /** Regional exposure. Mirrors geography when no distinct regional panel exists. */
  region: Array<{
    label: string;
    weight: number;
  }>;
  /** Sector exposure (GICS-style for equity; instrument type for fixed income). */
  sector: Array<{
    label: string;
    weight: number;
  }>;
  /** Credit-rating buckets for fixed income and money-market funds. */
  creditQuality: Array<{
    label: string;
    weight: number;
  }>;
  /** Asset-class split (equity / bond / cash / other) for allocation funds. */
  assetAllocation: Array<{
    label: string;
    weight: number;
  }>;
  /** Instrument-type breakdown, mostly for money-market funds. */
  instrument: Array<{
    label: string;
    weight: number;
  }>;
  /** Maturity buckets for fixed income / money-market funds. */
  maturity: Array<{
    label: string;
    weight: number;
  }>;
  /** Strategy allocation (e.g. for multi-strategy / alternative funds). Usually empty. */
  strategy: unknown[];
  /** Additional exposure panel when available. Usually empty. */
  exposure: unknown[];
  calendarReturns: {
    /** Calendar years covered, oldest first, clamped to the inception year. Partial (current) years are excluded. */
    years: string[];
    /** Fund total return per calendar year, in percent, aligned with years. */
    fund: number[];
    /** Benchmark return per calendar year, in percent, when the factsheet states it (null otherwise). */
    benchmark: Array<number | null>;
  };
  /** Monthly cumulative return series (percent from the first point, rebased at the share-class inception). */
  cumulativePerformance: Array<{
    date: string;
    fund: number | null;
    benchmark: number | null;
  }>;
  indexedPerformance: {
    /** Same series rebased to 100 at the first point, ready to plot. */
    points: Array<{
      date: string;
      fund: number | null;
      index: number | null;
    }>;
    /** Whether the index series is populated. */
    hasIndex: boolean;
  };
  /** Trailing returns: 1 Year, 3/5/10 Years p.a. and Since Inception. Multi-year figures are annualised. */
  annualisedReturns: Array<{
    label: string;
    fund: number | null;
    index: number | null;
  }>;
  headlineMetrics: {
    /** Total expense ratio / ongoing charge, as stated in the KID or factsheet. */
    ter: string;
    /** Fund size (duplicate of keyFacts.aum for factsheet layouts). */
    aum: string;
    /** 3-year annualised standard deviation of monthly returns. */
    volatility3y: string;
    /** 3-year Sharpe ratio (annualised return over annualised volatility, 0% risk-free rate). */
    sharpe3y: string;
    /** Yield to maturity (fixed income). */
    yieldToMaturity: string;
    /** Modified duration in years (fixed income). */
    modifiedDuration: string;
  };
  metrics: {
    /** Portfolio price/earnings ratio (equity). */
    peRatio: string;
    /** Distribution / dividend yield. */
    incomeYield: string;
    /** 3-year volatility (per-asset-class metric slot). */
    volatility3y: string;
    /** 3-year Sharpe ratio (per-asset-class metric slot). */
    sharpe3y: string;
    /** Yield to maturity (fixed income slot). */
    yieldToMaturity: string;
    /** Effective duration in years. */
    effectiveDuration: string;
    /** Effective / average maturity in years. */
    effectiveMaturity: string;
    /** Average credit rating of the portfolio. */
    averageRating: string;
    /** 7-day yield (money market). */
    sevenDayYield: string;
    /** Weighted average maturity in days (money market). */
    wam: string;
    /** Weighted average life in days (money market). */
    wal: string;
    /** Maximum peak-to-trough drawdown over the trailing 3 years. */
    maxDrawdown: string;
    /** Correlation to equities (alternatives / allocation). */
    equityCorrelation: string;
    /** Equity/bond split summary for allocation funds. */
    equityBondSplit: string;
  };
  /** SFDR classification stated in the fund's documents: 6 (no sustainability objective), 8 (promotes E/S characteristics) or 9 (sustainable investment objective). null when not disclosed. */
  sfdrArticle: number | null;
  costs: {
    /** Entry costs (one-off), as printed in the KID. */
    entry: string;
    /** Exit costs (one-off). */
    exit: string;
    /** Management fees and other administrative or operating costs per year (the KID's ongoing-cost line). Falls back to headlineMetrics.ter. */
    ongoing: string;
    /** Portfolio transaction costs per year. */
    transaction: string;
    /** Performance fee, when the fund charges one. */
    performanceFee: string;
    /** Annual cost impact if you exit after one year (reduction in yield). */
    riy1y: string;
    /** Annual cost impact at the recommended holding period. */
    riyRhp: string;
    /** Recommended holding period stated in the KID. */
    recommendedHoldingPeriod: string;
  };
  /** 'As of' date of the underlying figures: the latest NAV observation when a NAV history is used, otherwise the factsheet's reporting date. */
  dataAsOf: string;
  /** Timestamp of the refresh that produced this payload. Payloads are refreshed when older than 24 hours. */
  generatedAt: string;
}

/** Error body for any non-2xx status. */
export interface FundFactsErrorBody {
  error: {
    code:
      | "invalid_isin"
      | "invalid_body"
      | "invalid_query"
      | "batch_too_large"
      | "not_cached"
      | "missing_api_key"
      | "invalid_api_key"
      | "revoked_api_key"
      | "fund_not_found"
      | "rate_limited"
      | "upstream_error";
    message: string;
    /** 429 only */
    retryAfter?: number;
    resetAt?: string | null;
    reason?: "credits_exhausted" | "overage_cap" | "burst";
    plan?: string;
    limit?: number | null;
    /** batch_too_large only */
    batchMax?: number;
  };
  /** 404 keeps the ISIN and an empty data skeleton. */
  isin?: string;
  cached?: boolean;
  generatedAt?: string | null;
  data?: FundData;
}

/** GET /api/v1/me */
export interface MeResponse {
  email: string | null;
  plan: { id: PlanId; name: string; credits: number | null; burstPerMinute: number | null; batchMax: number; overageUsd: number | null; quota: string };
  quota: Quota;
  usage: { thisMonth: number; monthStart: string };
}

export type PlanId = "free" | "starter" | "pro" | "scale" | "enterprise";

/** Credit state returned in every successful response. */
export interface Quota {
  limit: number | null;
  remaining: number | null;
  used: number;
  overageUsed: number;
  resetAt: string;
  burst: { limit: number | null; remaining: number | null };
}

export type BatchItemStatus = "ok" | "not_found" | "pending" | "invalid" | "error";

/** POST /api/v1/funds */
export interface BatchResponse {
  count: number;
  results: Array<{ input: string; isin: string | null; status: BatchItemStatus; name: string | null; cached: boolean; generatedAt: string | null; expiresAt: string | null; data: FundData | null }>;
  pending: string[];
  plan: PlanId;
  quota: Quota;
}

/** GET /api/v1/search */
export interface SearchResponse {
  query: string;
  count: number;
  results: Array<{ isin: string; name: string | null; issuer: string | null; currency: string | null; assetClass: string | null; shareClass: string | null; income: string | null; category: string | null; dataAsOf: string | null; url: string }>;
  plan: PlanId;
  quota: Quota;
}

export interface Breakdown { items: Array<{ label: string; weight: number }>; coverage: number }

/** POST /api/v1/portfolio */
export interface PortfolioResponse {
  positions: Array<{ isin: string; name: string | null; weight: number; covered: boolean; ter: number | null; riskRating: number | null; category: string | null; kind: string | null }>;
  coverage: number;
  fees: { weightedTer: number | null; coverage: number; annualCostPer10k: number | null };
  risk: { weightedSrri: number | null; band: "low" | "medium" | "high" | null; coverage: number };
  kinds: Array<{ label: string; weight: number }>;
  assetAllocation: Breakdown;
  sector: Breakdown;
  geography: Breakdown;
  region: Breakdown;
  creditQuality: Breakdown;
  currency: Array<{ label: string; weight: number }>;
  topHoldings: Breakdown & { note: string };
  pending: string[];
  invalid: string[];
  rules: string;
  generatedAt: string;
  plan: PlanId;
  quota: Quota;
}

/** GET /api/v1/overlap */
export interface OverlapResponse {
  funds: Array<{ isin: string; name: string | null; holdings: number }>;
  pairs: Array<{ a: string; b: string; overlap: number; sharedCount: number; shared: Array<{ label: string; a: number; b: number }>; disclosed: { a: number; b: number } }>;
  pending: string[];
  notFound: string[];
  note: string;
  rules: string;
  generatedAt: string;
  plan: PlanId;
  quota: Quota;
}
