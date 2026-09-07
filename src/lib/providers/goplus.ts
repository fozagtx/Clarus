import {
  DEAD_ADDRESSES,
  QUOTE_TOKENS,
  type TokenSnapshot,
} from "@/lib/engine/types";
import { isLikelyAmmAccount, largestNonAmmPercent } from "@/lib/engine/firewall";

export interface GoPlusHolder {
  address?: string;
  tag?: string;
  is_contract?: number | string;
  percent?: string;
  is_locked?: number | string;
}

export interface GoPlusSecurity {
  token_name?: string;
  token_symbol?: string;
  is_mintable?: string;
  can_take_back_ownership?: string;
  hidden_owner?: string;
  owner_change_balance?: string;
  is_honeypot?: string;
  is_blacklisted?: string;
  transfer_pausable?: string;
  trading_cooldown?: string;
  is_proxy?: string;
  holder_count?: string;
  creator_percent?: string;
  owner_percent?: string;
  honeypot_with_same_creator?: string;
  lp_holder_count?: string;
  holders?: GoPlusHolder[];
  lp_holders?: GoPlusHolder[];
}

function flagOn(value: string | undefined): boolean {
  return value === "1" || value === "true";
}

/** GoPlus holder percents are usually 0–1 fractions. */
export function asPercent(raw: string | number | undefined): number {
  const n = typeof raw === "number" ? raw : Number(raw ?? 0);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n <= 1 ? n * 100 : n;
}

export function lockedLpPercent(lpHolders: GoPlusHolder[] | undefined): number {
  if (!lpHolders?.length) return 0;
  let locked = 0;
  for (const holder of lpHolders) {
    const address = (holder.address ?? "").toLowerCase();
    const tagged = `${holder.tag ?? ""}`.toLowerCase();
    const dead = DEAD_ADDRESSES.has(address);
    const lockedFlag = holder.is_locked === 1 || holder.is_locked === "1";
    const lockHint = tagged.includes("lock") || tagged.includes("burn");
    if (dead || lockedFlag || lockHint) {
      locked += asPercent(holder.percent);
    }
  }
  return Math.min(100, Number(locked.toFixed(2)));
}

export function maxNonAmmHolderPercent(holders: GoPlusHolder[] | undefined): number {
  if (!holders?.length) return 100;
  const mapped = holders
    .filter((h) => !DEAD_ADDRESSES.has((h.address ?? "").toLowerCase()))
    .filter((h) => !QUOTE_TOKENS.has((h.address ?? "").toLowerCase()))
    .map((h) => ({
      address: h.address ?? "",
      percent: asPercent(h.percent),
      owner: `${h.tag ?? ""} ${h.is_contract === 1 || h.is_contract === "1" ? "contract" : ""}`,
    }));
  return largestNonAmmPercent(mapped);
}

export function inferBundle(security: GoPlusSecurity): { bundled: boolean; reason?: string } {
  if (flagOn(security.honeypot_with_same_creator)) {
    return {
      bundled: true,
      reason: "GoPlus flagged other honeypots from the same creator.",
    };
  }

  const holders = security.holders ?? [];
  const cluster = holders.filter((h) => {
    const address = (h.address ?? "").toLowerCase();
    if (DEAD_ADDRESSES.has(address) || QUOTE_TOKENS.has(address)) return false;
    if (isLikelyAmmAccount(address, h.tag)) return false;
    const pct = asPercent(h.percent);
    return pct >= 1 && pct <= 12;
  });
  if (cluster.length > 3) {
    return {
      bundled: true,
      reason: `${cluster.length} similar-size non-AMM wallets in the top holder set (sybil / bundle heuristic).`,
    };
  }

  return { bundled: false };
}

export function applyGoPlus(security: GoPlusSecurity, token: TokenSnapshot): TokenSnapshot {
  const mintable = flagOn(security.is_mintable) || flagOn(security.can_take_back_ownership);
  const hidden = flagOn(security.hidden_owner);
  const freezeLike =
    flagOn(security.transfer_pausable) ||
    flagOn(security.is_blacklisted) ||
    flagOn(security.is_honeypot);

  token.isMintDisabled = !mintable && !hidden;
  token.isFreezeDisabled = !freezeLike;
  token.lpLockedPercent = lockedLpPercent(security.lp_holders);
  token.maxHolderPercent = maxNonAmmHolderPercent(security.holders);
  token.holderCount = Number(security.holder_count || 0) || token.holderCount;

  const bundle = inferBundle(security);
  token.isHighlyBundled = bundle.bundled;
  token.bundleReason = bundle.reason;

  if ((!token.name || token.name === "Unknown" || token.name === "Manual scan") && security.token_name) {
    token.name = security.token_name;
  }
  if (security.token_symbol) token.symbol = security.token_symbol;

  return token;
}

export async function fetchGoPlusSecurity(address: string): Promise<GoPlusSecurity | null> {
  const ca = address.toLowerCase();
  const url = `https://api.gopluslabs.io/api/v1/token_security/56?contract_addresses=${ca}`;
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: Record<string, GoPlusSecurity> };
    const result = data.result ?? {};
    return result[ca] ?? result[address] ?? Object.values(result)[0] ?? null;
  } catch {
    return null;
  }
}
