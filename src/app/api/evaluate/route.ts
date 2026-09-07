import { NextResponse } from "next/server";
import { isEvmAddress } from "@/lib/engine/social";
import { evaluateMint } from "@/lib/engine/pipeline";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { mint?: string; address?: string };
  const mint = (body.address ?? body.mint ?? "").trim();
  if (!isEvmAddress(mint)) {
    return NextResponse.json({ error: "Provide a BNB Chain (BEP-20) contract address." }, { status: 400 });
  }
  try {
    const result = await evaluateMint(mint);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Scan failed" },
      { status: 502 },
    );
  }
}
