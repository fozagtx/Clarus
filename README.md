<p align="center">
  <img src="public/clarus-mark.png" alt="Clarus" width="180" />
</p>

# Clarus

Track A agent for the **Binance Agent OS Mini Hackathon**. Event-driven researcher and on-chain risk firewall for **BNB Chain**.

Clarus does **not** trade. It watches high-velocity BEP-20 launches, runs a strict six-gate pipeline, and — only if every gate passes — emits a PancakeSwap / Binance Web3 deep link. The operator signs in their own wallet (FaceID, passcode, hardware). No private keys, seed phrases, or broadcast authority ever enter this process.

There is no Telegram bot. There is no Solana / Jupiter path. The chain is BSC (`chainId` 56).

## What it does

1. **Ingest** — Rotates live CAs from GeckoTerminal BSC new + trending pools and Dexscreener BNB Chain profiles/boosts/search. Each address is enriched from Dexscreener tape and [GoPlus](https://api.gopluslabs.io/api/v1/token_security/56) mint / honeypot / LP-lock / holder data. No demo or mock tokens.
2. **Shield** — four hard stops:
   - token must not be mintable (and owner cannot reclaim mint rights)
   - LP must be ≥95% locked or burned
   - largest non-AMM wallet ≤3.5% of supply
   - reject same-creator honeypot flags and similar-size holder clusters
3. **Viability** — rolling volume must be ≥ 80% of market cap. A constant-product model sizes a default $50 clip so slippage stays ≤2%, shrinking the suggested size when TVL is thin.
4. **Payload** — PancakeSwap swap URL + Binance Web3 router URL (`chain=bsc`). Signing stays on-device.

Any failed check terminates the task and is logged. That rejection stream **is** the product: most launches should die here.

## Dashboard

The HUD has three operator views:

| View | Phase | What you see |
| --- | --- | --- |
| **Radar** | Ingestion | Live BSC CA lock, social hits, GeckoTerminal ticker |
| **Shield** | Firewall + confluence | The six checks, halt reason, IF/THEN strip |
| **Payload** | Execution generator | Alert card, calibrated size, wallet deep links |

## Agent OS / MCP (Track A)

Clarus exposes an HTTP MCP server so Binance Agent OS can call the same tools the HUD uses.

```bash
# Discover
curl http://localhost:3000/api/mcp

# JSON-RPC
curl -X POST http://localhost:3000/api/mcp \
  -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Skill card: `agent/SKILL.md` · workflow: `agent/workflow.json` · MCP wiring: `agent/mcp.json`.

Optional companion MCP: `https://agent.binance.com/mcp/agentic`.

## Quick start

```bash
npm install
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Rotation starts immediately.

- **Rotation on** — cycles GeckoTerminal + Dexscreener BSC every 5s
- **Rotate once** — one live batch of unseen CAs
- **Paste a CA** — one-shot evaluate through GoPlus + Dexscreener

Optional env (see `.env.example`):

- `BSC_RPC_URL` — reserved for future on-chain traces (GoPlus is the default security source)
- `DEFAULT_TRADE_USD` / `MAX_SLIPPAGE_PCT` — payload sizing

## Brand

| Asset | Path |
| --- | --- |
| Logo (mark only) | `public/clarus-mark.png` |
| App icon | `src/app/icon.png` |

## Stack

- Next.js 15 + TypeScript operator HUD
- Pure evaluation engine (`src/lib/engine`) with Vitest coverage of the PRD gates
- GeckoTerminal BSC pools, Dexscreener REST (`chainId=bsc`), GoPlus `token_security/56`
- Binance public market data via `data-api.binance.vision` (BNBUSDT)
- HTTP MCP at `/api/mcp` for Agent OS
- `agent/workflow.json` — IF/THEN skill card for Binance Agent OS

The engine is side-effect free. Providers fetch. The dashboard only displays or links. Nothing in this repo constructs a signed transaction.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/events` | HUD snapshot |
| POST | `/api/tick` | One live rotation batch |
| POST | `/api/evaluate` | `{ "address": "0x…" }` |
| POST | `/api/reset` | Clear in-memory log |
| GET | `/api/quote?token=0x…&amount=50` | Unsigned BNB→token size estimate |
| GET/POST | `/api/mcp` | Agent OS MCP (manifest + JSON-RPC) |
| GET | `/api/health` | Health + BNBUSDT ticker |

## Security stance

- 100% reject target for mintable BEP-20s, honeypots, or unlocked LP
- Bundle interceptor uses GoPlus same-creator honeypot flags plus holder-cluster heuristics
- Suggested trade size is advisory. The wallet UI is the last risk check.

Disclaimer: This is not an offer or solicitation to trade any financial product.
