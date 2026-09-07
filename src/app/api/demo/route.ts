import { NextResponse } from "next/server";
import { runDemoSweep } from "@/lib/engine/pipeline";

export const dynamic = "force-dynamic";

export async function POST() {
  const board = await runDemoSweep();
  return NextResponse.json(board);
}
