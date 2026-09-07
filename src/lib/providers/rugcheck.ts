export interface RugCheckRisk {
  name?: string;
  value?: string;
  description?: string;
  level?: string;
}

export interface RugCheckSummary {
  lpLockedPct?: number;
  score?: number;
  risks?: RugCheckRisk[];
  mintAuthority?: string | null;
  freezeAuthority?: string | null;
}

export interface RugCheckNewToken {
  mint?: string;
  symbol?: string;
  createAt?: string;
}

function pctFromRisks(risks: RugCheckRisk[] | undefined, name: string): number | null {
  const hit = risks?.find((r) => (r.name ?? "").toLowerCase().includes(name));
  if (!hit?.value) return null;
  const n = Number(String(hit.value).replace("%", "").trim());
  return Number.isFinite(n) ? n : null;
}

export function singleHolderPercent(summary: RugCheckSummary | null): number | null {
  if (!summary) return null;
  return pctFromRisks(summary.risks, "single holder");
}

export async function fetchRugCheckSummary(mint: string): Promise<RugCheckSummary | null> {
  try {
    const res = await fetch(`https://api.rugcheck.xyz/v1/tokens/${mint}/report/summary`, {
      cache: "no-store",
      headers: { accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as RugCheckSummary;
  } catch {
    return null;
  }
}

export async function fetchRugCheckNewTokens(): Promise<RugCheckNewToken[]> {
  try {
    const res = await fetch("https://api.rugcheck.xyz/v1/stats/new_tokens", {
      cache: "no-store",
      headers: { accept: "application/json" },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as RugCheckNewToken[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
