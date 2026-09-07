import { describe, expect, it } from "vitest";
import { handleMcpRequest, MCP_TOOLS } from "./server";

describe("Agent OS MCP", () => {
  it("initializes with tools capability and no key permission", async () => {
    const res = await handleMcpRequest({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: { protocolVersion: "2024-11-05" },
    });
    expect(res).toMatchObject({
      jsonrpc: "2.0",
      id: 1,
      result: {
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "clarus" },
      },
    });
    const text = JSON.stringify(res);
    expect(text.toLowerCase()).not.toMatch(/private key|seed/);
  });

  it("lists Track A tools", async () => {
    const res = await handleMcpRequest({ jsonrpc: "2.0", id: 2, method: "tools/list" });
    const names = (res as { result: { tools: Array<{ name: string }> } }).result.tools.map((t) => t.name);
    expect(names).toEqual(MCP_TOOLS.map((t) => t.name));
    expect(names).toEqual(
      expect.arrayContaining(["ingest_recent", "evaluate_token", "build_swap_payload"]),
    );
  });
});
