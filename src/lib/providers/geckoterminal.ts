import { QUOTE_TOKENS, type TokenSnapshot } from "@/lib/engine/types";

interface GeckoToken {
  id?: string;
  type?: string;
  attributes?: {
    address?: string;
    name?: string;
    symbol?: string;
    decimals?: number;
    image_url?: string | null;
  };
}

interface GeckoPool {
  id?: string;
  attributes?: {
    name?: string;
    base_token_price_usd?: string;
    reserve_in_usd?: string;
    fdv_usd?: string;
    market_cap_usd?: string | null;
    pool_created_at?: string;
    volume_usd?: { h1?: string; h24?: string };
  };
  relationships?: {
    base_token?: { data?: { id?: string } };
    quote_token?: { data?: { id?: string } };
    dex?: { data?: { id?: string } };
  };
}

function num(value: string | number | null | undefined): number {
  const n = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function addressFromId(id?: string): string {
  if (!id) return "";
  const parts = id.split("_");
  return (parts[1] ?? parts[0] ?? "").toLowerCase();
}

export function poolToCandidate(
  pool: GeckoPool,
  included: GeckoToken[],
): { address: string; snapshot: TokenSnapshot } | null {
  const byId = new Map(included.map((t) => [t.id, t]));
  const baseId = pool.relationships?.base_token?.data?.id;
  const quoteId = pool.relationships?.quote_token?.data?.id;
  const base = byId.get(baseId ?? "");
  const quote = byId.get(quoteId ?? "");
  const baseAddr = (base?.attributes?.address ?? addressFromId(baseId)).toLowerCase();
  const quoteAddr = (quote?.attributes?.address ?? addressFromId(quoteId)).toLowerCase();

  const targetAddr = QUOTE_TOKENS.has(baseAddr) ? quoteAddr : baseAddr;
  const target = QUOTE_TOKENS.has(baseAddr) ? quote : base;
  if (!targetAddr || QUOTE_TOKENS.has(targetAddr)) return null;
  if (!/^0x[a-f0-9]{40}$/.test(targetAddr)) return null;

  const dex = pool.relationships?.dex?.data?.id ?? "";
  const snapshot: TokenSnapshot = {
    contractAddress: targetAddr,
    name: target?.attributes?.name || pool.attributes?.name || "Unknown",
    symbol: target?.attributes?.symbol || targetAddr.slice(0, 6),
    icon: target?.attributes?.image_url || undefined,
    launchpad: dex,
    source: "geckoterminal",
    discoveredAt: new Date().toISOString(),
    marketCap: num(pool.attributes?.market_cap_usd) || num(pool.attributes?.fdv_usd),
    volume1h: num(pool.attributes?.volume_usd?.h1),
    volume24h: num(pool.attributes?.volume_usd?.h24),
    liquidityUsd: num(pool.attributes?.reserve_in_usd),
    priceUsd: num(pool.attributes?.base_token_price_usd),
    isMintDisabled: false,
    isFreezeDisabled: false,
    lpLockedPercent: dex.toLowerCase().includes("four") ? 0 : 0,
    maxHolderPercent: 100,
    isHighlyBundled: false,
    socialHits: [],
    decimals: target?.attributes?.decimals,
  };
  return { address: targetAddr, snapshot };
}

async function fetchPools(path: string): Promise<Array<{ address: string; snapshot: TokenSnapshot }>> {
  const res = await fetch(`https://api.geckoterminal.com/api/v2/networks/bsc/${path}?page=1&include=base_token,quote_token`, {
    cache: "no-store",
    headers: { accept: "application/json" },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { data?: GeckoPool[]; included?: GeckoToken[] };
  const out: Array<{ address: string; snapshot: TokenSnapshot }> = [];
  for (const pool of data.data ?? []) {
    const mapped = poolToCandidate(pool, data.included ?? []);
    if (mapped && !out.some((x) => x.address === mapped.address)) out.push(mapped);
  }
  return out;
}

export async function fetchGeckoNewPools() {
  return fetchPools("new_pools");
}

export async function fetchGeckoTrendingPools() {
  return fetchPools("trending_pools");
}
