import { NextResponse } from "next/server";
import { SOL_MINT } from "@/lib/engine/types";
import { fetchJupiterQuote } from "@/lib/providers/jupiter";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mint = searchParams.get("mint");
  const lamports = searchParams.get("amount") ?? "50000000";
  if (!mint) {
    return NextResponse.json({ error: "mint required" }, { status: 400 });
  }
  try {
    const quote = await fetchJupiterQuote({
      inputMint: SOL_MINT,
      outputMint: mint,
      amount: lamports,
    });
    return NextResponse.json(quote);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Quote failed" },
      { status: 502 },
    );
  }
}
