import type { TokenSnapshot } from "@/lib/engine/types";
import { scoreNarrative } from "@/lib/engine/social";

export interface JupiterStats {
  buyVolume?: number;
  sellVolume?: number;
  numBuys?: number;
  numSells?: number;
  numTraders?: number;
}

export interface JupiterToken {
  id: string;
  name?: string;
  symbol?: string;
  icon?: string;
  twitter?: string;
  website?: string;
  launchpad?: string;
  holderCount?: number;
  mcap?: number;
  fdv?: number;
  usdPrice?: number;
  liquidity?: number;
  circSupply?: number;
  decimals?: number;
  organicScore?: number;
  createdAt?: string;
  firstPool?: { id?: string; createdAt?: string };
  stats1h?: JupiterStats;
  stats24h?: JupiterStats;
  audit?: {
    mintAuthorityDisabled?: boolean;
    freezeAuthorityDisabled?: boolean;
    topHoldersPercentage?: number;
    devBalancePercentage?: number;
    devMints?: number;
  };
  tags?: string[];
}

function volumeOf(stats?: JupiterStats): number {
  return (stats?.buyVolume ?? 0) + (stats?.sellVolume ?? 0);
}

function inferLpLockedPercent(token: JupiterToken): number {
  const launchpad = (token.launchpad ?? "").toLowerCase();
  if (launchpad.includes("pump")) {
    return 0;
  }
  if (token.liquidity && token.liquidity > 0 && token.audit?.mintAuthorityDisabled) {
    return 96;
  }
  return 0;
}

function inferBundled(token: JupiterToken): { bundled: boolean; reason?: string } {
  const holders = token.holderCount ?? 0;
  const traders = token.stats1h?.numTraders ?? token.stats24h?.numTraders ?? 0;
  const devMints = token.audit?.devMints ?? 0;
  const top = token.audit?.topHoldersPercentage ?? 0;

  if (holders > 0 && holders <= 8 && traders >= 20) {
    return {
      bundled: true,
      reason: `${holders} holders vs ${traders} traders in 1h — likely multi-wallet accumulation.`,
    };
  }
  if (devMints >= 80 && holders > 0 && holders < 15) {
    return {
      bundled: true,
      reason: `Serial deployer (${devMints} prior mints) with only ${holders} holders.`,
    };
  }
  if (top >= 40 && holders > 3 && holders < 25) {
    return {
      bundled: true,
      reason: `Top-holder cluster controls ${top.toFixed(1)}% with a thin holder set.`,
    };
  }
  return { bundled: false };
}

export function jupiterToSnapshot(token: JupiterToken): TokenSnapshot {
  const bundle = inferBundled(token);
  const maxHolder = Math.max(
    token.audit?.devBalancePercentage ?? 0,
    token.audit?.topHoldersPercentage ? token.audit.topHoldersPercentage / 4 : 0,
  );
  const name = token.name || "Unknown";
  const symbol = token.symbol || "???";

  return {
    contractAddress: token.id,
    name,
    symbol,
    icon: token.icon,
    launchpad: token.launchpad,
    source: "jupiter",
    twitter: token.twitter,
    website: token.website,
    discoveredAt: token.createdAt || token.firstPool?.createdAt || new Date().toISOString(),
    marketCap: token.mcap ?? token.fdv ?? 0,
    volume1h: volumeOf(token.stats1h),
    volume24h: volumeOf(token.stats24h),
    liquidityUsd: token.liquidity ?? 0,
    priceUsd: token.usdPrice ?? 0,
    holderCount: token.holderCount,
    isMintDisabled: token.audit?.mintAuthorityDisabled === true,
    isFreezeDisabled: token.audit?.freezeAuthorityDisabled === true,
    lpLockedPercent: inferLpLockedPercent(token),
    maxHolderPercent: Number(maxHolder.toFixed(4)),
    isHighlyBundled: bundle.bundled,
    bundleReason: bundle.reason,
    socialHits: scoreNarrative(name, symbol, `${token.twitter ?? ""} ${token.website ?? ""}`),
    organicScore: token.organicScore,
    decimals: token.decimals,
  };
}

export async function fetchJupiterRecent(limit = 24): Promise<JupiterToken[]> {
  const res = await fetch("https://lite-api.jup.ag/tokens/v2/recent", {
    cache: "no-store",
    headers: { accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Jupiter recent failed: ${res.status}`);
  }
  const data = (await res.json()) as JupiterToken[];
  return Array.isArray(data) ? data.slice(0, limit) : [];
}

export async function fetchJupiterToken(mint: string): Promise<JupiterToken | null> {
  const res = await fetch(
    `https://lite-api.jup.ag/tokens/v2/search?query=${encodeURIComponent(mint)}`,
    { cache: "no-store", headers: { accept: "application/json" } },
  );
  if (!res.ok) return null;
  const data = (await res.json()) as JupiterToken[];
  if (!Array.isArray(data)) return null;
  return data.find((t) => t.id === mint) ?? data[0] ?? null;
}

export async function fetchJupiterQuote(params: {
  inputMint: string;
  outputMint: string;
  amount: string;
  slippageBps?: number;
}) {
  const url = new URL("https://quote-api.jup.ag/v6/quote");
  url.searchParams.set("inputMint", params.inputMint);
  url.searchParams.set("outputMint", params.outputMint);
  url.searchParams.set("amount", params.amount);
  url.searchParams.set("slippageBps", String(params.slippageBps ?? 50));
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Jupiter quote failed: ${res.status}`);
  }
  return res.json();
}
