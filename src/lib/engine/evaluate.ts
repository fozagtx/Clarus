import { DEFAULT_THRESHOLDS, type EvaluationResult, type TokenSnapshot } from "./types";
import {
  checkBundleCluster,
  checkHolderCap,
  checkLpLock,
  checkMintAndFreeze,
} from "./firewall";
import { checkSlippageCalibration, checkVolumeToMarketCap } from "./viability";
import { buildExecutionPayload } from "./execution";

export interface EvaluateOptions {
  maxHolderPercent?: number;
  minLpLockedPercent?: number;
  volumeToMarketCap?: number;
  preferredTradeUsd?: number;
  maxSlippagePercent?: number;
}

export function evaluateDiscoveredToken(
  token: TokenSnapshot,
  options: EvaluateOptions = {},
): EvaluationResult {
  const started = Date.now();
  const maxHolderPercent = options.maxHolderPercent ?? DEFAULT_THRESHOLDS.maxHolderPercent;
  const minLpLockedPercent = options.minLpLockedPercent ?? DEFAULT_THRESHOLDS.minLpLockedPercent;
  const volumeToMarketCap = options.volumeToMarketCap ?? DEFAULT_THRESHOLDS.volumeToMarketCap;
  const preferredTradeUsd = options.preferredTradeUsd ?? DEFAULT_THRESHOLDS.preferredTradeUsd;
  const maxSlippagePercent = options.maxSlippagePercent ?? DEFAULT_THRESHOLDS.maxSlippagePercent;

  const mint = checkMintAndFreeze(token);
  const lp = checkLpLock(token, minLpLockedPercent);
  const holders = checkHolderCap(token, maxHolderPercent);
  const bundles = checkBundleCluster(token);

  const shield = [mint, lp, holders, bundles];
  const failedShield = shield.find((c) => c.status === "fail");
  if (failedShield) {
    return {
      status: "REJECTED",
      reason: failedShield.detail,
      token,
      checks: shield,
      elapsedMs: Date.now() - started,
    };
  }

  const volume = checkVolumeToMarketCap(token, volumeToMarketCap);
  if (volume.status === "fail") {
    return {
      status: "REJECTED",
      reason: volume.detail,
      token,
      checks: [...shield, volume],
      elapsedMs: Date.now() - started,
    };
  }

  const slip = checkSlippageCalibration(token, preferredTradeUsd, maxSlippagePercent);
  const checks = [...shield, volume, slip];
  if (slip.status === "fail") {
    return {
      status: "REJECTED",
      reason: slip.detail,
      token,
      checks,
      elapsedMs: Date.now() - started,
    };
  }

  const execution = buildExecutionPayload(token, preferredTradeUsd, maxSlippagePercent);
  return {
    status: "PASSED",
    message: "Notification ready. User remains the execution layer.",
    token,
    checks,
    execution,
    elapsedMs: Date.now() - started,
  };
}
