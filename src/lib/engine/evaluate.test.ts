import { describe, expect, it } from "vitest";
import { evaluateDiscoveredToken } from "./evaluate";
import { DEMO_TOKENS } from "./demo";
import { extractContractAddresses, matchSocialKeywords } from "./social";
import { estimateConstantProductSlippagePct, fitTradeSizeToSlippage } from "./slippage";
import { largestNonAmmPercent } from "./firewall";
import type { TokenSnapshot } from "./types";

function token(overrides: Partial<TokenSnapshot> = {}): TokenSnapshot {
  return {
    contractAddress: "Ca11111111111111111111111111111111111111111",
    name: "Fixture",
    symbol: "FIX",
    source: "demo",
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
    expect(result.reason).toMatch(/mint or freeze/i);
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

  it("passes a fully clear token and builds a Jupiter deep link", () => {
    const result = evaluateDiscoveredToken(DEMO_TOKENS[0]);
    expect(result.status).toBe("PASSED");
    expect(result.execution?.jupiterUrl).toContain(DEMO_TOKENS[0].contractAddress);
    expect(result.execution?.binanceWeb3Url).toContain("binance.com");
    expect(result.checks.every((c) => c.status === "pass")).toBe(true);
  });

  it("never asks for a private key in the payload", () => {
    const result = evaluateDiscoveredToken(DEMO_TOKENS[0]);
    const blob = JSON.stringify(result.execution);
    expect(blob.toLowerCase()).not.toMatch(/private key|seed|mnemonic/);
  });
});

describe("demo fixtures", () => {
  it("covers each rejection class", () => {
    const statuses = DEMO_TOKENS.map((t) => evaluateDiscoveredToken(t));
    expect(statuses.filter((s) => s.status === "PASSED")).toHaveLength(1);
    expect(statuses.filter((s) => s.status === "REJECTED").length).toBeGreaterThanOrEqual(4);
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
  it("locks a raw Solana CA from mixed text", () => {
    const cas = extractContractAddresses(
      "breaking cat coin 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU going parabolic",
    );
    expect(cas[0]).toBe("7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU");
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
      { address: "RaydiumVault111", percent: 40, owner: "raydium amm" },
      { address: "Trader111111111", percent: 2.2 },
      { address: "Trader222222222", percent: 1.1 },
    ]);
    expect(pct).toBe(2.2);
  });
});
