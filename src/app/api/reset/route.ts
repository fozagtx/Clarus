import { NextResponse } from "next/server";
import { resetStore } from "@/lib/engine/store";
import { getBoard } from "@/lib/engine/pipeline";

export const dynamic = "force-dynamic";

export function POST() {
  resetStore();
  return NextResponse.json(getBoard());
}
