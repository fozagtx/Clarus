export interface BnbTicker {
  symbol: string;
  lastPrice: number;
  priceChangePercent: number;
  quoteVolume: number;
}

export async function fetchBnbUsdtTicker(): Promise<BnbTicker | null> {
  try {
    const res = await fetch("https://data-api.binance.vision/api/v3/ticker/24hr?symbol=BNBUSDT", {
      cache: "no-store",
      headers: { accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      symbol?: string;
      lastPrice?: string;
      priceChangePercent?: string;
      quoteVolume?: string;
    };
    return {
      symbol: data.symbol ?? "BNBUSDT",
      lastPrice: Number(data.lastPrice ?? 0),
      priceChangePercent: Number(data.priceChangePercent ?? 0),
      quoteVolume: Number(data.quoteVolume ?? 0),
    };
  } catch {
    return null;
  }
}
