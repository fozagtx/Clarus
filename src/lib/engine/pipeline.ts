import { evaluateDiscoveredToken } from "@/lib/engine/evaluate";
import { DEMO_TOKENS } from "@/lib/engine/demo";
import { hasSeen, markSeen, recordEvaluation, recordIngest, snapshot } from "@/lib/engine/store";
import type { TokenSnapshot } from "@/lib/engine/types";
import { fetchDexPairs, bestSolanaPair } from "@/lib/providers/dexscreener";
import { fetchJupiterRecent, fetchJupiterToken, jupiterToSnapshot } from "@/lib/providers/jupiter";
import { getLargestHolderPercent, getMintAuthorities } from "@/lib/providers/solana";
import { dispatchTelegramAlert } from "@/lib/providers/telegram";

async function enrichFromChain(token: TokenSnapshot): Promise<TokenSnapshot> {
  const [mint, holderPct] = await Promise.all([
    getMintAuthorities(token.contractAddress),
    getLargestHolderPercent(token.contractAddress),
  ]);

  if (mint) {
    token.isMintDisabled = mint.mintAuthority == null;
    token.isFreezeDisabled = mint.freezeAuthority == null;
  }
  if (holderPct != null) {
    token.maxHolderPercent = holderPct;
  }

  try {
    const pair = bestSolanaPair(await fetchDexPairs(token.contractAddress));
    if (pair) {
      token.liquidityUsd = pair.liquidity?.usd ?? token.liquidityUsd;
      token.volume1h = pair.volume?.h1 ?? token.volume1h;
      token.volume24h = pair.volume?.h24 ?? token.volume24h;
      token.marketCap = pair.marketCap ?? pair.fdv ?? token.marketCap;
      token.priceUsd = Number(pair.priceUsd ?? token.priceUsd);
      if ((pair.dexId ?? "").toLowerCase().includes("raydium") && token.lpLockedPercent < 95) {
        token.lpLockedPercent = Math.max(token.lpLockedPercent, 0);
      }
    }
  } catch {
    /* Dexscreener is enrichment, not a hard dependency */
  }

  return token;
}

export async function runToken(token: TokenSnapshot, ingest: boolean) {
  if (ingest) {
    recordIngest(
      token.contractAddress,
      token.name,
      `CA locked from ${token.source} in <500ms. Forwarding to firewall.`,
    );
  }
  const result = evaluateDiscoveredToken(token);
  recordEvaluation(result, ingest);
  if (result.status === "PASSED") {
    await dispatchTelegramAlert(result).catch(() => false);
  }
  return result;
}

export async function tickLive(limit = 12) {
  const recent = await fetchJupiterRecent(limit);
  const fresh = recent.filter((t) => t.id && !hasSeen(t.id)).slice(0, 8);
  const processed = [];

  for (const raw of fresh) {
    markSeen(raw.id);
    const snapshotToken = jupiterToSnapshot(raw);
    processed.push(await runToken(snapshotToken, true));
  }

  return { processed, ...snapshot() };
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

export async function runDemoSweep() {
  const processed = [];
  for (const token of DEMO_TOKENS) {
    markSeen(token.contractAddress);
    processed.push(await runToken({ ...token, discoveredAt: new Date().toISOString() }, true));
  }
  return { processed, ...snapshot() };
}

export function getBoard() {
  return snapshot();
}
