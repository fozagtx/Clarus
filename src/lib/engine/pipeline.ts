import { evaluateDiscoveredToken } from "@/lib/engine/evaluate";
import { hasSeen, markSeen, recordEvaluation, recordIngest, snapshot } from "@/lib/engine/store";
import type { TokenSnapshot } from "@/lib/engine/types";
import {
  bestSolanaPair,
  fetchDexBoosts,
  fetchDexPairs,
  fetchDexProfiles,
  socialFromDex,
} from "@/lib/providers/dexscreener";
import { fetchJupiterRecent, fetchJupiterToken, jupiterToSnapshot } from "@/lib/providers/jupiter";
import {
  fetchRugCheckNewTokens,
  fetchRugCheckSummary,
  singleHolderPercent,
} from "@/lib/providers/rugcheck";
import { getLargestHolderPercent, getMintAuthorities } from "@/lib/providers/solana";
import { dispatchTelegramAlert } from "@/lib/providers/telegram";

const BATCH = 3;
let rotateCursor = 0;

async function enrichFromChain(token: TokenSnapshot): Promise<TokenSnapshot> {
  const [mint, holderPct, rug, pairs] = await Promise.all([
    getMintAuthorities(token.contractAddress),
    getLargestHolderPercent(token.contractAddress),
    fetchRugCheckSummary(token.contractAddress),
    fetchDexPairs(token.contractAddress),
  ]);

  if (mint) {
    token.isMintDisabled = mint.mintAuthority == null;
    token.isFreezeDisabled = mint.freezeAuthority == null;
  }
  const launchpad = (token.launchpad ?? "").toLowerCase();
  const pumpish = launchpad.includes("pump") || token.contractAddress.toLowerCase().endsWith("pump");
  if (pumpish) {
    token.lpLockedPercent = 0;
  } else if (typeof rug?.lpLockedPct === "number") {
    token.lpLockedPercent = rug.lpLockedPct;
  }

  const rugHolder = singleHolderPercent(rug);
  if (holderPct != null) token.maxHolderPercent = holderPct;
  else if (rugHolder != null) token.maxHolderPercent = rugHolder;

  const pair = bestSolanaPair(pairs);
  if (pair) {
    token.liquidityUsd = pair.liquidity?.usd ?? token.liquidityUsd;
    token.volume1h = pair.volume?.h1 ?? token.volume1h;
    token.volume24h = pair.volume?.h24 ?? token.volume24h;
    token.marketCap = pair.marketCap ?? pair.fdv ?? token.marketCap;
    token.priceUsd = Number(pair.priceUsd ?? token.priceUsd);
    if (!token.name || token.name === "Unknown" || token.name === "Manual scan") {
      token.name = pair.baseToken?.name || token.name;
      token.symbol = pair.baseToken?.symbol || token.symbol;
    }
  }

  return token;
}

export async function runToken(token: TokenSnapshot, ingest: boolean) {
  if (ingest) {
    recordIngest(
      token.contractAddress,
      token.name,
      `CA locked from ${token.source}. Forwarding to firewall.`,
    );
  }
  const result = evaluateDiscoveredToken(token);
  recordEvaluation(result, ingest);
  if (result.status === "PASSED") {
    await dispatchTelegramAlert(result).catch(() => false);
  }
  return result;
}

async function collectLiveMints() {
  const [jup, boosts, profiles, rugNew] = await Promise.all([
    fetchJupiterRecent(24).catch(() => []),
    fetchDexBoosts().catch(() => []),
    fetchDexProfiles().catch(() => []),
    fetchRugCheckNewTokens().catch(() => []),
  ]);

  const jupById = new Map(jup.map((t) => [t.id, t]));
  const ordered: Array<{ mint: string; source: TokenSnapshot["source"] }> = [];
  const push = (mint: string | undefined, source: TokenSnapshot["source"]) => {
    if (!mint || ordered.some((x) => x.mint === mint)) return;
    ordered.push({ mint, source });
  };

  const buckets: Array<Array<{ mint: string; source: TokenSnapshot["source"] }>> = [
    jup.map((t) => ({ mint: t.id, source: "jupiter" as const })),
    [
      ...boosts.map((b) => ({ mint: b.tokenAddress ?? "", source: "dexscreener" as const })),
      ...profiles.map((p) => ({ mint: p.tokenAddress ?? "", source: "dexscreener" as const })),
    ],
    rugNew.map((t) => ({ mint: t.mint ?? "", source: "rugcheck" as const })),
  ];

  const start = rotateCursor % buckets.length;
  rotateCursor += 1;
  for (let i = 0; i < buckets.length; i += 1) {
    for (const item of buckets[(start + i) % buckets.length]) {
      push(item.mint, item.source);
    }
  }
  return { ordered, jupById, profiles };
}

export async function tickLive() {
  const { ordered, jupById, profiles } = await collectLiveMints();
  const fresh = ordered.filter((t) => t.mint && !hasSeen(t.mint)).slice(0, BATCH);
  const processed = [];

  for (const item of fresh) {
    markSeen(item.mint);
    const jup = jupById.get(item.mint) ?? (await fetchJupiterToken(item.mint));
    let token: TokenSnapshot = jup
      ? { ...jupiterToSnapshot(jup), source: item.source }
      : {
          contractAddress: item.mint,
          name: "Unknown",
          symbol: item.mint.slice(0, 4),
          source: item.source,
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

    const profile = profiles.find((p) => p.tokenAddress === item.mint);
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
  const jup = await fetchJupiterToken(mint);
  const base: TokenSnapshot = jup
    ? jupiterToSnapshot(jup)
    : {
        contractAddress: mint,
        name: "Manual scan",
        symbol: mint.slice(0, 4),
        source: "manual",
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

  const enriched = await enrichFromChain(base);
  markSeen(mint);
  return runToken(enriched, true);
}

export function getBoard() {
  return snapshot();
}
