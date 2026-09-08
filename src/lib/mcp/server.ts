import { evaluateMint, getBoard, tickLive } from "@/lib/engine/pipeline";
import { quoteBnbToToken } from "@/lib/providers/pancakeswap";
import { fetchBnbUsdtTicker } from "@/lib/providers/binance";
import { isEvmAddress } from "@/lib/engine/social";

export const MCP_PROTOCOL_VERSION = "2024-11-05";
export const MCP_SERVER_INFO = { name: "clarus", version: "0.1.0" };

export const MCP_TOOLS = [
  {
    name: "ingest_recent",
    description:
      "Rotate one live BNB Chain ingest batch (GeckoTerminal new/trending pools + Dexscreener BSC). Read-only. No keys. No broadcast.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "evaluate_token",
    description:
      "Run the Clarus six-gate firewall on a BEP-20 contract on BNB Chain (chainId 56). Returns REJECTED or PASSED with an unsigned PancakeSwap / Binance Web3 payload.",
    inputSchema: {
      type: "object",
      properties: {
        address: { type: "string", description: "BEP-20 contract address (0x…)" },
      },
      required: ["address"],
      additionalProperties: false,
    },
  },
  {
    name: "build_swap_payload",
    description:
      "Build an unsigned BNB→token size estimate and wallet deep links (PancakeSwap + Binance Web3). Never signs or broadcasts.",
    inputSchema: {
      type: "object",
      properties: {
        address: { type: "string", description: "BEP-20 contract address (0x…)" },
        amountUsd: { type: "number", description: "Clip size in USD (default 50)" },
      },
      required: ["address"],
      additionalProperties: false,
    },
  },
  {
    name: "get_board",
    description: "Return this session's ingest/reject log and latest evaluations.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "get_health",
    description: "Return Clarus agent health plus the public Binance BNBUSDT ticker when reachable.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
] as const;

type RpcId = string | number | null;
type RpcReq = { jsonrpc?: string; id?: RpcId; method?: string; params?: unknown };

function ok(id: RpcId, result: unknown) {
  return { jsonrpc: "2.0", id: id ?? null, result };
}

function fail(id: RpcId, code: number, message: string) {
  return { jsonrpc: "2.0", id: id ?? null, error: { code, message } };
}

function textResult(payload: unknown) {
  return {
    content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload,
  };
}

async function callTool(name: string, args: Record<string, unknown>) {
  switch (name) {
    case "ingest_recent":
      return textResult(await tickLive());
    case "evaluate_token": {
      const address = String(args.address ?? "");
      if (!isEvmAddress(address)) throw new Error("address must be a BEP-20 0x contract");
      return textResult(await evaluateMint(address));
    }
    case "build_swap_payload": {
      const address = String(args.address ?? "");
      if (!isEvmAddress(address)) throw new Error("address must be a BEP-20 0x contract");
      const amountUsd = Number(args.amountUsd ?? 50);
      return textResult(await quoteBnbToToken(address, Number.isFinite(amountUsd) ? amountUsd : 50));
    }
    case "get_board":
      return textResult(getBoard());
    case "get_health": {
      const ticker = await fetchBnbUsdtTicker();
      return textResult({ ok: true, ...getBoard().health, bnbUsdt: ticker });
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export async function handleMcpRequest(body: RpcReq) {
  const id = body.id ?? null;
  const method = body.method ?? "";

  if (method === "initialize") {
    const params = (body.params ?? {}) as { protocolVersion?: string };
    return ok(id, {
      protocolVersion: params.protocolVersion || MCP_PROTOCOL_VERSION,
      capabilities: { tools: { listChanged: false } },
      serverInfo: MCP_SERVER_INFO,
      instructions:
        "Clarus is a Track A Binance Agent OS researcher. It never holds keys. Use ingest_recent, evaluate_token, then build_swap_payload only after PASSED.",
    });
  }

  if (method === "notifications/initialized" || method === "notifications/cancelled") {
    return null;
  }

  if (method === "ping") return ok(id, {});

  if (method === "tools/list") {
    return ok(id, { tools: MCP_TOOLS });
  }

  if (method === "tools/call") {
    const params = (body.params ?? {}) as { name?: string; arguments?: Record<string, unknown> };
    try {
      const result = await callTool(params.name ?? "", params.arguments ?? {});
      return ok(id, result);
    } catch (error) {
      return ok(id, {
        isError: true,
        content: [{ type: "text", text: error instanceof Error ? error.message : "Tool failed" }],
      });
    }
  }

  if (method === "resources/list") return ok(id, { resources: [] });
  if (method === "prompts/list") return ok(id, { prompts: [] });

  return fail(id, -32601, `Method not found: ${method}`);
}

export function mcpManifest(origin: string) {
  return {
    name: "clarus",
    version: MCP_SERVER_INFO.version,
    contest: "Binance Agent OS Mini Hackathon",
    track: "A",
    chain: "BNB Smart Chain (bsc, chainId 56)",
    permissions: { privateKeys: false, seedPhrases: false, autonomousBroadcast: false },
    transport: { type: "http", url: `${origin}/api/mcp` },
    tools: MCP_TOOLS.map((t) => t.name),
    binanceAgentMcp: "https://agent.binance.com/mcp/agentic",
  };
}
