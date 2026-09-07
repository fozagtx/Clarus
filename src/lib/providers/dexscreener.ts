import { scoreNarrative } from "@/lib/engine/social";
import { QUOTE_TOKENS } from "@/lib/engine/types";

const BSC = "bsc";

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
  info?: { socials?: Array<{ type?: string; url?: string }> };
}

export interface DexProfile {
  chainId?: string;
  tokenAddress?: string;
  description?: string;
  icon?: string;
  links?: Array<{ type?: string; label?: string; url?: string }>;
}

function isBsc(chainId?: string) {
  return (chainId ?? "").toLowerCase() === BSC;
}

export async function fetchDexPairs(address: string): Promise<DexPair[]> {
  const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`, {
    cache: "no-store",
    headers: { accept: "application/json" },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { pairs?: DexPair[] };
  return (data.pairs ?? []).filter((p) => isBsc(p.chainId));
}

export function bestBscPair(pairs: DexPair[]): DexPair | undefined {
  return [...pairs].sort((a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0))[0];
}

export function targetAddressFromPair(pair: DexPair): string | undefined {
  const base = (pair.baseToken?.address ?? "").toLowerCase();
  const quote = (pair.quoteToken?.address ?? "").toLowerCase();
  if (base && !QUOTE_TOKENS.has(base)) return base;
  if (quote && !QUOTE_TOKENS.has(quote)) return quote;
  return undefined;
}

export async function fetchDexBoosts() {
  const res = await fetch("https://api.dexscreener.com/token-boosts/latest/v1", {
    cache: "no-store",
    headers: { accept: "application/json" },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as Array<{
    chainId?: string;
    tokenAddress?: string;
    description?: string;
    links?: Array<{ type?: string; url?: string }>;
  }>;
  return Array.isArray(data) ? data.filter((d) => isBsc(d.chainId)) : [];
}

export async function fetchDexProfiles(): Promise<DexProfile[]> {
  const res = await fetch("https://api.dexscreener.com/token-profiles/latest/v1", {
    cache: "no-store",
    headers: { accept: "application/json" },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as DexProfile[];
  return Array.isArray(data) ? data.filter((d) => isBsc(d.chainId)) : [];
}

export async function fetchDexBscSearch(query = "WBNB"): Promise<DexPair[]> {
  const res = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`, {
    cache: "no-store",
    headers: { accept: "application/json" },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { pairs?: DexPair[] };
  return (data.pairs ?? [])
    .filter((p) => isBsc(p.chainId))
    .sort((a, b) => (b.pairCreatedAt ?? 0) - (a.pairCreatedAt ?? 0));
}

export function socialFromDex(profile?: DexProfile, pair?: DexPair) {
  const twitter =
    profile?.links?.find((l) => (l.type ?? "").toLowerCase() === "twitter")?.url ??
    pair?.info?.socials?.find((s) => (s.type ?? "").toLowerCase() === "twitter")?.url;
  const blob = `${profile?.description ?? ""} ${twitter ?? ""}`;
  return {
    twitter,
    socialHits: scoreNarrative(profile?.description ?? "", "", blob),
  };
}
