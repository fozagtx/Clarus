import { MCP_TOOLS } from "@/lib/mcp/server";

export default function HomePage() {
  return (
    <main style={{ maxWidth: 720, margin: "48px auto", padding: "0 20px" }}>
      <p style={{ letterSpacing: "0.08em", textTransform: "uppercase", color: "#6b6b5c" }}>
        Binance Agent OS · Track A skill
      </p>
      <h1 style={{ fontWeight: 500, fontSize: 28, margin: "8px 0 12px" }}>Clarus</h1>
      <p>
        Six-gate BNB Chain firewall. Load <code>SKILL.md</code> in Agent OS and connect MCP at{" "}
        <code>/api/mcp</code>. Unsigned PancakeSwap / Binance Web3 links only after PASS. No keys.
      </p>
      <p>
        <a href="/api/mcp">GET /api/mcp</a>
        {" · "}
        <a href="/api/health">GET /api/health</a>
      </p>
      <h2 style={{ fontWeight: 500, fontSize: 16, marginTop: 32 }}>Tools</h2>
      <ul>
        {MCP_TOOLS.map((tool) => (
          <li key={tool.name}>
            <code>{tool.name}</code> — {tool.description}
          </li>
        ))}
      </ul>
    </main>
  );
}
