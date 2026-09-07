export interface DexPair {
  chainId?: string;
  dexId?: string;
  pairAddress?: string;
  url?: string;
  baseToken?: { address?: string; name?: string; symbol?: string };
  quoteToken?: { address?: string; name?: string; symbol?: string };
  priceUsd?: string;
  liquidity?: { usd?: number };
  volume?: { h1?: number; h24?: number };
  marketCap?: number;
  fdv?: number;
  pairCreatedAt?: number;
}

export async function fetchDexPairs(mint: string): Promise<DexPair[]> {
  const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mint}`, {
    cache: "no-store",
    headers: { accept: "application/json" },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { pairs?: DexPair[] };
  return (data.pairs ?? []).filter((p) => (p.chainId ?? "").toLowerCase() === "solana");
}

export function bestSolanaPair(pairs: DexPair[]): DexPair | undefined {
  return [...pairs].sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];
}

export async function fetchDexBoosts() {
  const res = await fetch("https://api.dexscreener.com/token-boosts/latest/v1", {
    cache: "no-store",
    headers: { accept: "application/json" },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as Array<{ chainId?: string; tokenAddress?: string; description?: string }>;
  return Array.isArray(data) ? data.filter((d) => d.chainId === "solana") : [];
}
