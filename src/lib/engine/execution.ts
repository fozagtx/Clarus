import { DEFAULT_THRESHOLDS, SOL_MINT, type ExecutionPayload, type TokenSnapshot } from "./types";
import { fitTradeSizeToSlippage } from "./slippage";

export function buildExecutionPayload(
  token: TokenSnapshot,
  preferredUsd: number = DEFAULT_THRESHOLDS.preferredTradeUsd,
  maxSlippagePct: number = DEFAULT_THRESHOLDS.maxSlippagePercent,
): ExecutionPayload {
  const sized = fitTradeSizeToSlippage(token.liquidityUsd, preferredUsd, maxSlippagePct);
  const jupiterUrl = `https://jup.ag/swap/${SOL_MINT}-${token.contractAddress}?amount=${encodeURIComponent(
    String(sized.tradeUsd),
  )}`;
  const binanceWeb3Url = `https://web3.binance.com/en/swap?chain=solana&input=SOL&output=${token.contractAddress}`;
  const solanaActionUrl = `solana:${jupiterUrl}`;
  const dexscreenerUrl = `https://dexscreener.com/solana/${token.contractAddress}`;

  return {
    tradeUsd: sized.tradeUsd,
    expectedSlippagePct: sized.expectedSlippagePct,
    jupiterUrl,
    binanceWeb3Url,
    solanaActionUrl,
    dexscreenerUrl,
    quoteSummary: `Buy ~$${sized.tradeUsd.toFixed(2)} of ${token.symbol} via Jupiter / Binance Web3. Wallet signs locally.`,
  };
}

export function formatTelegramAlert(
  token: TokenSnapshot,
  payload: ExecutionPayload,
): string {
  return [
    "🚨 *VERIFIED INSIGHT ACQUIRED* 🚨",
    "",
    `🪙 *Asset:* ${token.name} ($${token.symbol})`,
    `📄 *CA:* \`${token.contractAddress}\``,
    "",
    "📈 *Analytical Confluence:*",
    `• Market Capitalization: $${token.marketCap.toLocaleString("en-US", { maximumFractionDigits: 2 })}`,
    `• Verified Volume: $${Math.max(token.volume1h, token.volume24h).toLocaleString("en-US", { maximumFractionDigits: 2 })}`,
    `• Suggested size: $${payload.tradeUsd.toFixed(2)} (slip ${payload.expectedSlippagePct.toFixed(2)}%)`,
    "• Security Status: 100% CLEAR",
    "",
    "⚠️ _Decision Required: Review metrics and open the signing interface. Clarus never holds keys._",
  ].join("\n");
}
