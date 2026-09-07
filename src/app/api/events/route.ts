import { NextResponse } from "next/server";
import { getBoard } from "@/lib/engine/pipeline";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(getBoard());
}
