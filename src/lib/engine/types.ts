export const BSC_CHAIN_ID = 56;
export const WBNB_ADDRESS = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
export const USDT_BSC = "0x55d398326f99059fF775485246999027B3197955";
export const USDC_BSC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const BUSD_BSC = "0xe9e7CEA3DedcA5984780Bafc599bD69ADdA41e31";

export const QUOTE_TOKENS = new Set(
  [WBNB_ADDRESS, USDT_BSC, USDC_BSC, BUSD_BSC].map((a) => a.toLowerCase()),
);

export const DEAD_ADDRESSES = new Set([
  "0x0000000000000000000000000000000000000000",
  "0x000000000000000000000000000000000000dead",
  "0x000000000000000000000000000000000000dEaD".toLowerCase(),
]);

export const AMM_OWNER_HINTS = [
  "pancake",
  "pcs",
  "four.meme",
  "fourmeme",
  "bakery",
  "biswap",
  "thena",
  "apeswap",
  "pinklock",
  "pinksale",
  "unicrypt",
  "dxsale",
  "team.finance",
  "locker",
  "lock",
  "pair",
  "vault",
  "pool",
  "amm",
  "lp",
  "router",
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
  "bnb",
  "listing",
  "graduation",
  "pump",
  "moon",
  "ai",
  "agent",
  "cz",
  "four.meme",
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

export type TokenSource = "geckoterminal" | "dexscreener" | "binance" | "manual";

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
  source: TokenSource;
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
  pancakeSwapUrl: string;
  binanceWeb3Url: string;
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
