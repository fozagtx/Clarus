import { SOCIAL_KEYWORDS } from "./types";

const CA_RE = /[1-9A-HJ-NP-Za-km-z]{32,44}/g;

export function extractContractAddresses(text: string): string[] {
  const hits = text.match(CA_RE) ?? [];
  return [...new Set(hits.filter((ca) => ca.length >= 32 && ca.length <= 44))];
}

export function matchSocialKeywords(text: string): string[] {
  const lower = text.toLowerCase();
  return SOCIAL_KEYWORDS.filter((kw) => lower.includes(kw));
}

export function scoreNarrative(name: string, symbol: string, extra = ""): string[] {
  return matchSocialKeywords(`${name} ${symbol} ${extra}`);
}
