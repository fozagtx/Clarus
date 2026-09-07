import { WBNB_ADDRESS } from "@/lib/engine/types";
import { bestBscPair, fetchDexPairs } from "@/lib/providers/dexscreener";

export function pancakeSwapUrl(token: string) {
  return `https://pancakeswap.finance/swap?chain=bsc&inputCurrency=BNB&outputCurrency=${token}`;
}

export function binanceWeb3SwapUrl(token: string) {
  return `https://web3.binance.com/en/swap?chain=bsc&input=BNB&output=${token}`;
}

export interface UnsignedQuote {
  chain: "bsc";
  input: "BNB";
  inputAddress: string;
  output: string;
  amountUsd: number;
  priceUsd: number | null;
  expectedTokens: number | null;
  liquidityUsd: number;
  pancakeSwapUrl: string;
  binanceWeb3Url: string;
  note: string;
}

export async function quoteBnbToToken(token: string, amountUsd: number): Promise<UnsignedQuote> {
  const pairs = await fetchDexPairs(token);
  const pair = bestBscPair(pairs);
  const priceUsd = pair?.priceUsd ? Number(pair.priceUsd) : null;
  const expectedTokens = priceUsd && priceUsd > 0 ? amountUsd / priceUsd : null;
  return {
    chain: "bsc",
    input: "BNB",
    inputAddress: WBNB_ADDRESS,
    output: token,
    amountUsd,
    priceUsd,
    expectedTokens,
    liquidityUsd: pair?.liquidity?.usd ?? 0,
    pancakeSwapUrl: pancakeSwapUrl(token),
    binanceWeb3Url: binanceWeb3SwapUrl(token),
    note: "Unsigned size estimate from Dexscreener BSC tape. Wallet must quote and sign locally.",
  };
}
