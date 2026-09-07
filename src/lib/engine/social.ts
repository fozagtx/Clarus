import { SOCIAL_KEYWORDS } from "./types";

const EVM_RE = /0x[a-fA-F0-9]{40}/g;

export function isEvmAddress(value: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(value.trim());
}

export function extractContractAddresses(text: string): string[] {
  const hits = text.match(EVM_RE) ?? [];
  return [...new Set(hits.map((ca) => ca.toLowerCase()))];
}

export function matchSocialKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  return SOCIAL_KEYWORDS.filter((kw) => lower.includes(kw));
}

export function scoreNarrative(name: string, symbol: string, extra = ""): string[] {
  return matchSocialKeywords(`${name} ${symbol} ${extra}`);
}
