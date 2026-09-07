import { NextResponse } from "next/server";
import { evaluateMint } from "@/lib/engine/pipeline";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { mint?: string };
  const mint = (body.mint ?? "").trim();
  if (mint.length < 32) {
    return NextResponse.json({ error: "Provide a Solana contract address." }, { status: 400 });
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
