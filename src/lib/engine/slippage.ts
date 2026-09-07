import { DEFAULT_THRESHOLDS } from "./types";

export function estimateConstantProductSlippagePct(
  tradeUsd: number,
  tvlUsd: number,
): number {
  if (tradeUsd <= 0) return 0;
  if (tvlUsd <= 0) return 100;
  const quoteReserve = tvlUsd / 2;
  return (tradeUsd / (quoteReserve + tradeUsd)) * 100;
}

export function fitTradeSizeToSlippage(
  tvlUsd: number,
  preferredUsd: number = DEFAULT_THRESHOLDS.preferredTradeUsd,
  maxSlippagePct: number = DEFAULT_THRESHOLDS.maxSlippagePercent,
): { tradeUsd: number; expectedSlippagePct: number; reduced: boolean } {
  const ratio = maxSlippagePct / 100;
  const quoteReserve = Math.max(tvlUsd, 0) / 2;
  const maxTrade = ratio >= 1 ? preferredUsd : (ratio * quoteReserve) / (1 - ratio);
  const tradeUsd = Math.min(preferredUsd, Math.max(0, Number(maxTrade.toFixed(2))));
  return {
    tradeUsd,
    expectedSlippagePct: Number(
      estimateConstantProductSlippagePct(tradeUsd, tvlUsd).toFixed(4),
    ),
    reduced: tradeUsd < preferredUsd - 0.01,
  };
}

export function volumeToMarketCapRatio(volume: number, marketCap: number): number {
  if (marketCap <= 0) return 0;
  return volume / marketCap;
}
