import { evaluateDiscoveredToken } from "@/lib/engine/evaluate";
import { hasSeen, markSeen, recordEvaluation, recordIngest, snapshot } from "@/lib/engine/store";
import type { TokenSnapshot } from "@/lib/engine/types";
import { QUOTE_TOKENS } from "@/lib/engine/types";
import { isEvmAddress } from "@/lib/engine/social";
import {
  bestBscPair,
  fetchDexBoosts,
  fetchDexBscSearch,
  fetchDexPairs,
  fetchDexProfiles,
  socialFromDex,
  targetAddressFromPair,
} from "@/lib/providers/dexscreener";
import { fetchGeckoNewPools, fetchGeckoTrendingPools } from "@/lib/providers/geckoterminal";
import { applyGoPlus, fetchGoPlusSecurity } from "@/lib/providers/goplus";

const BATCH = 3;
let rotateCursor = 0;

function emptyToken(address: string, source: TokenSnapshot["source"], name = "Unknown"): TokenSnapshot {
  return {
    contractAddress: address.toLowerCase(),
    name,
    symbol: address.slice(0, 6),
    source,
    discoveredAt: new Date().toISOString(),
    marketCap: 0,
    volume1h: 0,
    volume24h: 0,
    liquidityUsd: 0,
    priceUsd: 0,
    isMintDisabled: false,
    isFreezeDisabled: false,
    lpLockedPercent: 0,
    maxHolderPercent: 100,
    isHighlyBundled: false,
    socialHits: [],
  };
}

async function enrichFromChain(token: TokenSnapshot): Promise<TokenSnapshot> {
  const [security, pairs] = await Promise.all([
    fetchGoPlusSecurity(token.contractAddress),
    fetchDexPairs(token.contractAddress),
  ]);

  if (security) applyGoPlus(security, token);

  const launchpad = (token.launchpad ?? "").toLowerCase();
  if (launchpad.includes("four")) {
    token.lpLockedPercent = 0;
  }

  const pair = bestBscPair(pairs);
  if (pair) {
    token.liquidityUsd = pair.liquidity?.usd ?? token.liquidityUsd;
    token.volume1h = pair.volume?.h1 ?? token.volume1h;
    token.volume24h = pair.volume?.h24 ?? token.volume24h;
    token.marketCap = pair.marketCap ?? pair.fdv ?? token.marketCap;
    token.priceUsd = Number(pair.priceUsd ?? token.priceUsd);
    token.launchpad = token.launchpad || pair.dexId;
    if (!token.name || token.name === "Unknown" || token.name === "Manual scan") {
      token.name = pair.baseToken?.name || token.name;
      token.symbol = pair.baseToken?.symbol || token.symbol;
    }
    const social = socialFromDex(undefined, pair);
    if (social.socialHits.length) {
      token.socialHits = [...new Set([...token.socialHits, ...social.socialHits])];
    }
  }

  return token;
}

export async function runToken(token: TokenSnapshot, ingest: boolean) {
  if (ingest) {
    recordIngest(
      token.contractAddress,
      token.name,
      `CA locked from ${token.source} on BNB Chain. Forwarding to firewall.`,
    );
  }
  const result = evaluateDiscoveredToken(token);
  recordEvaluation(result, ingest);
  return result;
}

async function collectLiveMints() {
  const [geckoNew, geckoTrend, boosts, profiles, search] = await Promise.all([
    fetchGeckoNewPools().catch(() => []),
    fetchGeckoTrendingPools().catch(() => []),
    fetchDexBoosts().catch(() => []),
    fetchDexProfiles().catch(() => []),
    fetchDexBscSearch("WBNB").catch(() => []),
  ]);

  const seeds = new Map<string, TokenSnapshot>();
  const ordered: Array<{ mint: string; source: TokenSnapshot["source"] }> = [];
  const push = (mint: string | undefined, source: TokenSnapshot["source"], seed?: TokenSnapshot) => {
    if (!mint || !isEvmAddress(mint) || QUOTE_TOKENS.has(mint.toLowerCase())) return;
    const key = mint.toLowerCase();
    if (ordered.some((x) => x.mint === key)) return;
    ordered.push({ mint: key, source });
    if (seed) seeds.set(key, { ...seed, contractAddress: key, source });
  };

  const buckets: Array<Array<{ mint: string; source: TokenSnapshot["source"]; seed?: TokenSnapshot }>> = [
    geckoNew.map((t) => ({ mint: t.address, source: "geckoterminal" as const, seed: t.snapshot })),
    geckoTrend.map((t) => ({ mint: t.address, source: "geckoterminal" as const, seed: t.snapshot })),
    [
      ...boosts.map((b) => ({ mint: b.tokenAddress ?? "", source: "dexscreener" as const })),
      ...profiles.map((p) => ({ mint: p.tokenAddress ?? "", source: "dexscreener" as const })),
      ...search.map((p) => ({ mint: targetAddressFromPair(p) ?? "", source: "dexscreener" as const })),
    ],
  ];

  const start = rotateCursor % buckets.length;
  rotateCursor += 1;
  for (let i = 0; i < buckets.length; i += 1) {
    for (const item of buckets[(start + i) % buckets.length]) {
      push(item.mint, item.source, item.seed);
    }
  }
  return { ordered, seeds, profiles };
}

export async function tickLive() {
  const { ordered, seeds, profiles } = await collectLiveMints();
  const fresh = ordered.filter((t) => t.mint && !hasSeen(t.mint)).slice(0, BATCH);
  const processed = [];

  for (const item of fresh) {
    markSeen(item.mint);
    let token: TokenSnapshot = seeds.get(item.mint) ?? emptyToken(item.mint, item.source);

    const profile = profiles.find((p) => (p.tokenAddress ?? "").toLowerCase() === item.mint);
    const social = socialFromDex(profile);
    if (social.twitter) token.twitter = social.twitter;
    if (social.socialHits.length) {
      token.socialHits = [...new Set([...token.socialHits, ...social.socialHits])];
    }

    token = await enrichFromChain(token);
    processed.push(await runToken(token, true));
  }

  return { processed, rotateCursor, ...snapshot() };
}

export async function evaluateMint(mint: string) {
  const address = mint.trim();
  if (!isEvmAddress(address)) {
    throw new Error("Provide a BNB Chain (BEP-20) contract address.");
  }
  const base = emptyToken(address, "manual", "Manual scan");
  const enriched = await enrichFromChain(base);
  markSeen(address.toLowerCase());
  return runToken(enriched, true);
}

export function getBoard() {
  return snapshot();
}
