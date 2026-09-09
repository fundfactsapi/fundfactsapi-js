# @fundfactsapi/sdk

Official JavaScript / TypeScript client for [FundFacts API](https://fundfactsapi.com): any fund or ETF **ISIN → one structured JSON factsheet** (key facts, TER, SRRI risk indicator, derived profile, top holdings, sector / country / asset breakdowns, calendar and annualised returns, monthly series, volatility, Sharpe, max drawdown), read from the documents each fund house publishes and refreshed every 24 hours. Zero dependencies; Node 18+, Bun, Deno, edge runtimes.

```bash
npm install @fundfactsapi/sdk
```

```ts
import { FundFacts } from "@fundfactsapi/sdk";

const ff = new FundFacts({ apiKey: process.env.FUNDFACTS_API_KEY }); // free key at https://fundfactsapi.com/signup

const fund = await ff.getFund("IE00B4L5Y983");
console.log(fund.name, fund.data.headlineMetrics.ter, fund.data.riskRating, fund.data.profile.category);

// several at once (1 credit per ISIN answered)
const batch = await ff.getFunds(["IE00B4L5Y983", "IE00B3RBWM25", "LU1681043599"]);

// names → ISINs (free)
const hits = await ff.search("msci world");

// what a portfolio actually holds
const look = await ff.portfolio([{ isin: "IE00B4L5Y983", weight: 60 }, { isin: "IE00B3RBWM25", weight: 40 }]);
console.log(look.fees.weightedTer, look.sector.items.slice(0, 5));

// how much two ETFs overlap
const ov = await ff.overlap(["IE00B4L5Y983", "IE00B3RBWM25"]);
console.log(ov.pairs[0].overlap, "% in common");
```

Every method returns the parsed JSON body and throws `FundFactsError` (`status`, `code`, `message`, `retryAfter`) on a non-2xx status. Payloads are cached in memory until their `expiresAt`. A fund nobody has loaded before can take 15–90 seconds the first time; the default timeout is 300 s.

Full reference: https://fundfactsapi.com/docs · OpenAPI: https://fundfactsapi.com/openapi.json · MCP server: `https://fundfactsapi.com/api/mcp`

MIT
