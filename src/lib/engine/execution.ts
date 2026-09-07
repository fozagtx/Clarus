import { DEFAULT_THRESHOLDS, WBNB_ADDRESS, type ExecutionPayload, type TokenSnapshot } from "./types";
import { fitTradeSizeToSlippage } from "./slippage";
import { binanceWeb3SwapUrl, pancakeSwapUrl } from "@/lib/providers/pancakeswap";

export function buildExecutionPayload(
  token: TokenSnapshot,
  preferredUsd: number = DEFAULT_THRESHOLDS.preferredTradeUsd,
  maxSlippagePct: number = DEFAULT_THRESHOLDS.maxSlippagePercent,
): ExecutionPayload {
  const sized = fitTradeSizeToSlippage(token.liquidityUsd, preferredUsd, maxSlippagePct);
  const pancake = pancakeSwapUrl(token.contractAddress);
  const binanceWeb3Url = binanceWeb3SwapUrl(token.contractAddress);
  const dexscreenerUrl = `https://dexscreener.com/bsc/${token.contractAddress}`;

  return {
    tradeUsd: sized.tradeUsd,
    expectedSlippagePct: sized.expectedSlippagePct,
    pancakeSwapUrl: pancake,
    binanceWeb3Url,
    dexscreenerUrl,
    quoteSummary: `Buy ~$${sized.tradeUsd.toFixed(2)} of ${token.symbol} via PancakeSwap / Binance Web3 on BNB Chain. Wallet signs locally. Input ${WBNB_ADDRESS.slice(0, 6)}… (WBNB).`,
  };
}
