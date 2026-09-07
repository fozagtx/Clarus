import { NextResponse } from "next/server";
import { handleMcpRequest, mcpManifest } from "@/lib/mcp/server";

export const dynamic = "force-dynamic";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Accept, MCP-Protocol-Version, MCP-Session-Id",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export function GET(request: Request) {
  const origin = new URL(request.url).origin;
  return NextResponse.json(mcpManifest(origin), { headers: CORS });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    jsonrpc?: string;
    id?: string | number | null;
    method?: string;
    params?: unknown;
  };
  const response = await handleMcpRequest(body);
  if (response == null) {
    return new NextResponse(null, { status: 202, headers: CORS });
  }
  return NextResponse.json(response, { headers: CORS });
}
