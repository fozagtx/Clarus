import { DEAD_ADDRESSES } from "@/lib/engine/types";
import { largestNonAmmPercent } from "@/lib/engine/firewall";

function rpcUrl() {
  if (process.env.HELIUS_API_KEY) {
    return `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`;
  }
  return process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
}

async function rpc<T>(method: string, params: unknown[]): Promise<T> {
  const res = await fetch(rpcUrl(), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`RPC ${method} HTTP ${res.status}`);
  const json = (await res.json()) as { result?: T; error?: { message: string } };
  if (json.error) throw new Error(json.error.message);
  return json.result as T;
}

export interface MintAuthorities {
  mintAuthority: string | null;
  freezeAuthority: string | null;
  supply: string;
  decimals: number;
}

export async function getMintAuthorities(mint: string): Promise<MintAuthorities | null> {
  try {
    const result = await rpc<{
      value?: {
        data?: {
          parsed?: {
            info?: {
              mintAuthority?: string | null;
              freezeAuthority?: string | null;
              supply?: string;
              decimals?: number;
            };
          };
        };
      };
    }>("getAccountInfo", [mint, { encoding: "jsonParsed" }]);
    const info = result?.value?.data?.parsed?.info;
    if (!info) return null;
    return {
      mintAuthority: info.mintAuthority ?? null,
      freezeAuthority: info.freezeAuthority ?? null,
      supply: info.supply ?? "0",
      decimals: info.decimals ?? 0,
    };
  } catch {
    return null;
  }
}

export async function getLargestHolderPercent(mint: string): Promise<number | null> {
  try {
    const result = await rpc<{
      value?: Array<{ address: string; amount: string; uiAmount?: number | null }>;
    }>("getTokenLargestAccounts", [mint]);
    const accounts = result?.value ?? [];
    if (!accounts.length) return null;

    const supplyInfo = await rpc<{ value?: { amount?: string } }>("getTokenSupply", [mint]);
    const supply = Number(supplyInfo?.value?.amount ?? 0);
    if (!supply) return null;

    const holders = accounts.map((a) => ({
      address: a.address,
      percent: (Number(a.amount) / supply) * 100,
    }));
    return largestNonAmmPercent(holders);
  } catch {
    return null;
  }
}

export function isDeadAddress(address: string | null | undefined): boolean {
  if (!address) return true;
  return DEAD_ADDRESSES.has(address);
}

export async function countSameOriginFunding(
  holderAddresses: string[],
  windowSeconds = 60,
): Promise<{ clustered: boolean; size: number; reason?: string }> {
  const origins = new Map<string, number[]>();
  const sample = holderAddresses.slice(0, 8);

  await Promise.all(
    sample.map(async (address) => {
      try {
        const sigs = await rpc<Array<{ signature: string; blockTime?: number | null }>>(
          "getSignaturesForAddress",
          [address, { limit: 8 }],
        );
        const first = [...sigs].reverse()[0];
        if (!first?.signature) return;
        const tx = await rpc<{
          blockTime?: number | null;
          transaction?: {
            message?: { accountKeys?: Array<string | { pubkey?: string }> };
          };
        }>("getTransaction", [
          first.signature,
          { encoding: "json", maxSupportedTransactionVersion: 0 },
        ]);
        const keys = tx?.transaction?.message?.accountKeys ?? [];
        const source =
          typeof keys[0] === "string" ? keys[0] : (keys[0] as { pubkey?: string })?.pubkey;
        if (!source || !tx?.blockTime) return;
        const times = origins.get(source) ?? [];
        times.push(tx.blockTime);
        origins.set(source, times);
      } catch {
        /* best-effort */
      }
    }),
  );

  for (const [source, times] of origins) {
    if (times.length <= 3) continue;
    const sorted = [...times].sort((a, b) => a - b);
    for (let i = 0; i < sorted.length; i += 1) {
      const window = sorted.filter((t) => t >= sorted[i] && t <= sorted[i] + windowSeconds);
      if (window.length > 3) {
        return {
          clustered: true,
          size: window.length,
          reason: `${window.length} wallets funded from ${source.slice(0, 6)}… within ${windowSeconds}s.`,
        };
      }
    }
  }

  return { clustered: false, size: 0 };
}
