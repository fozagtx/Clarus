export const SOL_MINT = "So11111111111111111111111111111111111111112";
export const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const USDT_MINT = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB";

export const DEAD_ADDRESSES = new Set([
  "11111111111111111111111111111111",
  "1nc1nerator11111111111111111111111111111111",
]);

export const AMM_OWNER_HINTS = [
  "pump",
  "raydium",
  "orca",
  "meteora",
  "whirlpool",
  "amm",
  "vault",
  "pool",
];

export const DEFAULT_THRESHOLDS = {
  maxHolderPercent: 3.5,
  minLpLockedPercent: 95,
  volumeToMarketCap: 0.8,
  maxSlippagePercent: 2,
  preferredTradeUsd: 50,
  bundleSameOriginWallets: 3,
  bundleWindowSeconds: 60,
  ingestWindowMs: 500,
  pipelineBudgetMs: 2500,
} as const;

export const SOCIAL_KEYWORDS = [
  "breaking",
  "viral",
  "cat",
  "dog",
  "frog",
  "animal",
  "elon",
  "binance",
  "listing",
  "graduation",
  "pump",
  "moon",
  "ai",
  "agent",
];

export type CheckId =
  | "mint_freeze"
  | "lp_lock"
  | "holder_cap"
  | "bundle_cluster"
  | "volume_mc"
  | "slippage";

export type CheckStatus = "pass" | "fail" | "skip";

export type PipelineStatus = "PASSED" | "REJECTED";

export interface FirewallCheck {
  id: CheckId;
  label: string;
  status: CheckStatus;
  detail: string;
  value?: string;
  elapsedMs: number;
}

export interface TokenSnapshot {
  contractAddress: string;
  name: string;
  symbol: string;
  icon?: string;
  launchpad?: string;
  source: "jupiter" | "dexscreener" | "rugcheck" | "rpc" | "manual";
  twitter?: string;
  website?: string;
  discoveredAt: string;
  marketCap: number;
  volume1h: number;
  volume24h: number;
  liquidityUsd: number;
  priceUsd: number;
  holderCount?: number;
  isMintDisabled: boolean;
  isFreezeDisabled: boolean;
  lpLockedPercent: number;
  maxHolderPercent: number;
  isHighlyBundled: boolean;
  bundleReason?: string;
  socialHits: string[];
  organicScore?: number;
  decimals?: number;
}

export interface ExecutionPayload {
  tradeUsd: number;
  expectedSlippagePct: number;
  jupiterUrl: string;
  binanceWeb3Url: string;
  solanaActionUrl: string;
  dexscreenerUrl: string;
  quoteSummary?: string;
}

export interface EvaluationResult {
  status: PipelineStatus;
  reason?: string;
  message?: string;
  token: TokenSnapshot;
  checks: FirewallCheck[];
  execution?: ExecutionPayload;
  elapsedMs: number;
}

export interface PipelineEvent {
  id: string;
  at: string;
  kind: "ingest" | "reject" | "pass" | "alert" | "error";
  ca: string;
  name: string;
  detail: string;
  result?: EvaluationResult;
}

export interface AgentHealth {
  ingestions: number;
  passed: number;
  rejected: number;
  lastTickMs: number | null;
  avgPipelineMs: number;
  uptimeStartedAt: string;
}
