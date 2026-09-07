import { describe, expect, it } from "vitest";
import { evaluateDiscoveredToken } from "./evaluate";
import { extractContractAddresses, isEvmAddress, matchSocialKeywords } from "./social";
import { estimateConstantProductSlippagePct, fitTradeSizeToSlippage } from "./slippage";
import { largestNonAmmPercent } from "./firewall";
import { applyGoPlus, asPercent, inferBundle, lockedLpPercent } from "@/lib/providers/goplus";
import type { TokenSnapshot } from "./types";

const CAKE = "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82";

function token(overrides: Partial<TokenSnapshot> = {}): TokenSnapshot {
  return {
    contractAddress: CAKE,
    name: "Fixture",
    symbol: "FIX",
    source: "manual",
    discoveredAt: new Date().toISOString(),
    marketCap: 100_000,
    volume1h: 90_000,
    volume24h: 90_000,
    liquidityUsd: 80_000,
    priceUsd: 0.001,
    isMintDisabled: true,
    isFreezeDisabled: true,
    lpLockedPercent: 100,
    maxHolderPercent: 2,
    isHighlyBundled: false,
    socialHits: [],
    ...overrides,
  };
}

describe("evaluateDiscoveredToken", () => {
  it("rejects active mint authority", () => {
    const result = evaluateDiscoveredToken(token({ isMintDisabled: false }));
    expect(result.status).toBe("REJECTED");
    expect(result.reason).toMatch(/mintable|freeze|honeypot/i);
  });

  it("rejects unlocked LP below 95%", () => {
    const result = evaluateDiscoveredToken(token({ lpLockedPercent: 80 }));
    expect(result.status).toBe("REJECTED");
    expect(result.checks.find((c) => c.id === "lp_lock")?.status).toBe("fail");
  });

  it("rejects holder concentration above 3.5%", () => {
    const result = evaluateDiscoveredToken(token({ maxHolderPercent: 4.2 }));
    expect(result.status).toBe("REJECTED");
    expect(result.reason).toMatch(/3\.5/);
  });

  it("rejects bundled clusters", () => {
    const result = evaluateDiscoveredToken(
      token({ isHighlyBundled: true, bundleReason: "4 wallets same origin" }),
    );
    expect(result.status).toBe("REJECTED");
    expect(result.reason).toMatch(/4 wallets/);
  });

  it("rejects volume below 80% of market cap", () => {
    const result = evaluateDiscoveredToken(token({ volume1h: 10_000, volume24h: 10_000 }));
    expect(result.status).toBe("REJECTED");
    expect(result.checks.find((c) => c.id === "volume_mc")?.status).toBe("fail");
  });

  it("passes a fully clear token and builds PancakeSwap + Binance Web3 deep links", () => {
    const clear = token();
    const result = evaluateDiscoveredToken(clear);
    expect(result.status).toBe("PASSED");
    expect(result.execution?.pancakeSwapUrl).toContain(clear.contractAddress);
    expect(result.execution?.pancakeSwapUrl).toContain("pancakeswap");
    expect(result.execution?.binanceWeb3Url).toContain("binance.com");
    expect(result.execution?.binanceWeb3Url).toContain("chain=bsc");
    expect(result.execution?.dexscreenerUrl).toContain("/bsc/");
    expect(result.checks.every((c) => c.status === "pass")).toBe(true);
  });

  it("never asks for a private key in the payload", () => {
    const result = evaluateDiscoveredToken(token());
    const blob = JSON.stringify(result.execution);
    expect(blob.toLowerCase()).not.toMatch(/private key|seed|mnemonic/);
  });
});

describe("slippage modeler", () => {
  it("keeps a $50 clip under 2% on deep pools", () => {
    const sized = fitTradeSizeToSlippage(200_000, 50, 2);
    expect(sized.tradeUsd).toBe(50);
    expect(sized.expectedSlippagePct).toBeLessThanOrEqual(2);
    expect(sized.reduced).toBe(false);
  });

  it("shrinks size on thin TVL to stay within 2%", () => {
    const sized = fitTradeSizeToSlippage(800, 50, 2);
    expect(sized.reduced).toBe(true);
    expect(sized.tradeUsd).toBeLessThan(50);
    expect(sized.expectedSlippagePct).toBeLessThanOrEqual(2.0001);
  });

  it("returns 100% slippage when TVL is zero", () => {
    expect(estimateConstantProductSlippagePct(50, 0)).toBe(100);
  });
});

describe("social + CA extraction", () => {
  it("locks a raw BEP-20 CA from mixed text", () => {
    const cas = extractContractAddresses(
      `breaking bnb cat coin ${CAKE} going parabolic`,
    );
    expect(cas[0]).toBe(CAKE);
    expect(isEvmAddress(CAKE)).toBe(true);
  });

  it("detects high-velocity keywords", () => {
    expect(matchSocialKeywords("Viral animal cat listing on Binance")).toEqual(
      expect.arrayContaining(["viral", "animal", "cat", "binance", "listing"]),
    );
  });
});

describe("holder filter", () => {
  it("ignores AMM-like accounts when computing max individual share", () => {
    const pct = largestNonAmmPercent([
      { address: "0xPancakePair111", percent: 40, owner: "pancake v2 pair" },
      { address: "0xTrader11111111111111111111111111111111", percent: 2.2 },
      { address: "0xTrader22222222222222222222222222222222", percent: 1.1 },
    ]);
    expect(pct).toBe(2.2);
  });
});

describe("GoPlus BSC mapping", () => {
  it("treats 0-1 holder fractions as percents", () => {
    expect(asPercent("0.035")).toBeCloseTo(3.5);
    expect(asPercent(12)).toBe(12);
  });

  it("sums locked/burned LP holders", () => {
    const pct = lockedLpPercent([
      { address: "0x000000000000000000000000000000000000dead", percent: "0.97", is_locked: 1 },
      { address: "0x1111111111111111111111111111111111111111", percent: "0.03", is_locked: 0 },
    ]);
    expect(pct).toBeGreaterThanOrEqual(95);
  });

  it("flags same-creator honeypot as bundled", () => {
    expect(inferBundle({ honeypot_with_same_creator: "1" }).bundled).toBe(true);
  });

  it("maps mintable + honeypot flags onto the snapshot", () => {
    const snap = applyGoPlus(
      {
        is_mintable: "1",
        is_honeypot: "1",
        holders: [{ address: "0xabcabcabcabcabcabcabcabcabcabcabcabcabca", percent: "0.02" }],
        lp_holders: [],
      },
      token(),
    );
    expect(snap.isMintDisabled).toBe(false);
    expect(snap.isFreezeDisabled).toBe(false);
  });
});
