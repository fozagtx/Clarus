import {
  AMM_OWNER_HINTS,
  DEAD_ADDRESSES,
  DEFAULT_THRESHOLDS,
  type FirewallCheck,
  type TokenSnapshot,
} from "./types";

function timed(
  id: FirewallCheck["id"],
  label: string,
  started: number,
  status: FirewallCheck["status"],
  detail: string,
  value?: string,
): FirewallCheck {
  return {
    id,
    label,
    status,
    detail,
    value,
    elapsedMs: Math.max(0, Date.now() - started),
  };
}

export function checkMintAndFreeze(token: TokenSnapshot, started = Date.now()): FirewallCheck {
  const ok = token.isMintDisabled && token.isFreezeDisabled;
  return timed(
    "mint_freeze",
    "Mint & freeze authorities",
    started,
    ok ? "pass" : "fail",
    ok
      ? "mint_authority and freeze_authority are null. Supply cannot be inflated and wallets cannot be frozen."
      : "Active mint or freeze authority. Developer can print supply or freeze trader accounts.",
    `mint=${token.isMintDisabled ? "disabled" : "ACTIVE"} freeze=${token.isFreezeDisabled ? "disabled" : "ACTIVE"}`,
  );
}

export function checkLpLock(
  token: TokenSnapshot,
  minPct: number = DEFAULT_THRESHOLDS.minLpLockedPercent,
  started = Date.now(),
): FirewallCheck {
  const ok = token.lpLockedPercent >= minPct;
  return timed(
    "lp_lock",
    "Liquidity lock / burn",
    started,
    ok ? "pass" : "fail",
    ok
      ? `At least ${minPct}% of LP is locked or burned to a dead address.`
      : `LP locked/burned is ${token.lpLockedPercent.toFixed(1)}% (need ≥${minPct}%). Unlocked LP keys are a rug vector.`,
    `${token.lpLockedPercent.toFixed(1)}%`,
  );
}

export function checkHolderCap(
  token: TokenSnapshot,
  maxPct: number = DEFAULT_THRESHOLDS.maxHolderPercent,
  started = Date.now(),
): FirewallCheck {
  const ok = token.maxHolderPercent <= maxPct;
  return timed(
    "holder_cap",
    "Supply concentration",
    started,
    ok ? "pass" : "fail",
    ok
      ? `Largest non-AMM wallet holds ${token.maxHolderPercent.toFixed(2)}% (≤${maxPct}%).`
      : `Largest non-AMM wallet holds ${token.maxHolderPercent.toFixed(2)}% (cap ${maxPct}%). Single-wallet dump risk.`,
    `${token.maxHolderPercent.toFixed(2)}%`,
  );
}

export function checkBundleCluster(token: TokenSnapshot, started = Date.now()): FirewallCheck {
  const ok = !token.isHighlyBundled;
  return timed(
    "bundle_cluster",
    "Bundle / funding cluster",
    started,
    ok ? "pass" : "fail",
    ok
      ? "No coordinated same-origin funding cluster above threshold."
      : token.bundleReason ??
          "More than 3 holder wallets share a funding origin inside a 1-minute window.",
    token.isHighlyBundled ? "BUNDLED" : "clear",
  );
}

export function isLikelyAmmAccount(address: string, ownerHint?: string): boolean {
  const blob = `${address} ${ownerHint ?? ""}`.toLowerCase();
  if (DEAD_ADDRESSES.has(address)) return true;
  return AMM_OWNER_HINTS.some((hint) => blob.includes(hint));
}

export function largestNonAmmPercent(
  holders: Array<{ address: string; percent: number; owner?: string }>,
): number {
  const filtered = holders.filter((h) => !isLikelyAmmAccount(h.address, h.owner));
  if (!filtered.length) return holders[0]?.percent ?? 0;
  return Math.max(...filtered.map((h) => h.percent));
}
