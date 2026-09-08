<p align="center">
  <img src="public/clarus-mark.png" alt="Clarus" width="120" />
</p>

# Clarus

**Binance Agent OS Mini Hackathon — Track A skill.** BNB Chain firewall. Not a dashboard.

Clarus is an Agent OS skill plus HTTP MCP tools. It evaluates live BEP-20 launches and, only if every gate passes, returns an unsigned PancakeSwap / Binance Web3 link. The human signs. No keys, no broadcast, no Telegram, no Solana.

## Skill

- [`SKILL.md`](./SKILL.md) — load this in Agent OS
- [`agent/workflow.json`](./agent/workflow.json) — IF/THEN gates
- [`agent/mcp.json`](./agent/mcp.json) — MCP wiring
- [`agent.json`](./agent.json) — contest manifest

## Run

```bash
npm install
npm test
npm run build
npm start
```

Wire Agent OS to `http://localhost:3000/api/mcp`.

```bash
curl -s http://localhost:3000/api/mcp
curl -s -X POST http://localhost:3000/api/mcp \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## Tools

| Tool | Side effects |
| --- | --- |
| `ingest_recent` | read-only live BSC ingest |
| `evaluate_token` | read-only GoPlus + firewall |
| `build_swap_payload` | none — unsigned URLs only |
| `get_board` | read session log |
| `get_health` | read counters + BNBUSDT |

## Gates

1. Not mintable / no hidden owner / not honeypot-pausable
2. LP ≥ 95% locked or burned
3. Largest non-AMM holder ≤ 3.5%
4. No bundle cluster
5. Volume ≥ 80% of market cap
6. ~$50 clip ≤ 2% slippage

Pass → wallet deep link. Fail → stop and log.
