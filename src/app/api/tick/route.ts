import { NextResponse } from "next/server";
import { tickLive } from "@/lib/engine/pipeline";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const board = await tickLive(16);
    return NextResponse.json(board);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Live ingest failed" },
      { status: 502 },
    );
  }
}
