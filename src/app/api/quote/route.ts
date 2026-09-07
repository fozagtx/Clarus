import { NextResponse } from "next/server";
import { isEvmAddress } from "@/lib/engine/social";
import { quoteBnbToToken } from "@/lib/providers/pancakeswap";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = (searchParams.get("token") ?? searchParams.get("mint") ?? "").trim();
  const amountUsd = Number(searchParams.get("amount") ?? searchParams.get("amountUsd") ?? "50");
  if (!isEvmAddress(token)) {
    return NextResponse.json({ error: "token required (BEP-20 0x address)" }, { status: 400 });
  }
  try {
    const quote = await quoteBnbToToken(token, Number.isFinite(amountUsd) ? amountUsd : 50);
    return NextResponse.json(quote);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Quote failed" },
      { status: 502 },
    );
  }
}
