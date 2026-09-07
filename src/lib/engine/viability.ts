import { DEFAULT_THRESHOLDS, type FirewallCheck, type TokenSnapshot } from "./types";
import {
  estimateConstantProductSlippagePct,
  fitTradeSizeToSlippage,
  volumeToMarketCapRatio,
} from "./slippage";

export function checkVolumeToMarketCap(
  token: TokenSnapshot,
  ratio: number = DEFAULT_THRESHOLDS.volumeToMarketCap,
  started = Date.now(),
): FirewallCheck {
  const volume = Math.max(token.volume1h, token.volume24h);
  const current = volumeToMarketCapRatio(volume, token.marketCap);
  const ok = token.marketCap > 0 && volume >= ratio * token.marketCap;
  return {
    id: "volume_mc",
    label: "Volume / market cap",
    status: ok ? "pass" : "fail",
    detail: ok
      ? `Volume $${volume.toFixed(0)} is ≥ ${ratio * 100}% of market cap $${token.marketCap.toFixed(0)}.`
      : `Volume ($${volume.toFixed(0)}) below ${ratio * 100}% of market cap ($${token.marketCap.toFixed(0)}). Artificial volume-to-MC distortion.`,
    value: `${(current * 100).toFixed(1)}%`,
    elapsedMs: Math.max(0, Date.now() - started),
  };
}

export function checkSlippageCalibration(
  token: TokenSnapshot,
  preferredUsd: number = DEFAULT_THRESHOLDS.preferredTradeUsd,
  maxSlippagePct: number = DEFAULT_THRESHOLDS.maxSlippagePercent,
  started = Date.now(),
): FirewallCheck {
  const sized = fitTradeSizeToSlippage(token.liquidityUsd, preferredUsd, maxSlippagePct);
  const raw = estimateConstantProductSlippagePct(preferredUsd, token.liquidityUsd);
  const ok = sized.tradeUsd > 0 && sized.expectedSlippagePct <= maxSlippagePct + 1e-6;
  const detail = sized.reduced
    ? `$${preferredUsd} would slip ${raw.toFixed(2)}%. Suggested size cut to $${sized.tradeUsd.toFixed(2)} to stay within ${maxSlippagePct}%.`
    : `$${sized.tradeUsd.toFixed(2)} against TVL $${token.liquidityUsd.toFixed(0)} slips ${sized.expectedSlippagePct.toFixed(2)}% (≤${maxSlippagePct}%).`;
  return {
    id: "slippage",
    label: "Pool depth / slippage",
    status: ok ? "pass" : "fail",
    detail,
    value: `$${sized.tradeUsd.toFixed(2)} @ ${sized.expectedSlippagePct.toFixed(2)}%`,
    elapsedMs: Math.max(0, Date.now() - started),
  };
}
