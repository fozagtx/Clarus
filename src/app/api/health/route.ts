import { NextResponse } from "next/server";
import { getBoard } from "@/lib/engine/pipeline";
import { fetchBnbUsdtTicker } from "@/lib/providers/binance";

export const dynamic = "force-dynamic";

export async function GET() {
  const { health } = getBoard();
  const bnbUsdt = await fetchBnbUsdtTicker();
  return NextResponse.json({
    ok: true,
    track: "A",
    chain: "bsc",
    health,
    bnbUsdt,
  });
}
