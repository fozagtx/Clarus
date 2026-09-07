<p align="center">
  <img src="public/clarus-mark.png" alt="Clarus" width="180" />
</p>

# Clarus

Event-driven researcher and on-chain risk firewall for the Binance Agent / Workflow contest.

Clarus does **not** trade. It watches high-velocity Solana launches, runs a strict six-gate pipeline, and — only if every gate passes — emits a Jupiter / Binance Web3 deep link. The operator signs in their own wallet (FaceID, passcode, hardware). No private keys, seed phrases, or broadcast authority ever enter this process.

## What it does

1. **Ingest** — Rotates live CAs from Jupiter recent launches, Dexscreener profiles/boosts (including X/Twitter links), and RugCheck new mints. Each address is enriched from Dexscreener tape, RugCheck LP lock %, and Solana RPC mint/holder state. No demo or mock tokens.
2. **Shield** — four hard stops:
   - mint + freeze authorities must be disabled
   - LP must be ≥95% locked or burned
   - largest non-AMM wallet ≤3.5% of supply
   - reject if more than 3 holders share a funding origin inside a 60s window (RPC when available; serial-deployer / thin-holder heuristics otherwise)
3. **Viability** — rolling volume must be ≥ 80% of market cap. A constant-product model sizes a default $50 clip so slippage stays ≤2%, shrinking the suggested size when TVL is thin.
4. **Payload** — Jupiter swap URL + Binance Web3 router URL + optional Telegram inline keyboard. Signing stays on-device.

Any failed check terminates the task and is logged. That rejection stream **is** the product: most launches should die here.

## Dashboard

The HUD has three operator views:

| View | Phase | What you see |
| --- | --- | --- |
| **Radar** | Ingestion | Live CA lock, social hits, Jupiter ticker |
| **Shield** | Firewall + confluence | The six checks, halt reason, IF/THEN strip |
| **Payload** | Execution generator | Alert card, calibrated size, wallet deep links |

## Quick start

```bash
npm install
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Rotation starts immediately.

- **Rotation on** — cycles Jupiter, Dexscreener, and RugCheck every 5s
- **Rotate once** — one live batch of unseen CAs
- **Paste a CA** — one-shot evaluate through the same live enrichers

Optional env (see `.env.example`):

- `HELIUS_API_KEY` / `SOLANA_RPC_URL` — faster mint + holder queries
- `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` — push the same alert the dashboard shows

## Brand

| Asset | Path |
| --- | --- |
| Logo (mark only) | `public/clarus-mark.png` |
| App icon | `src/app/icon.png` |

## Stack

- Next.js 15 + TypeScript operator HUD
- Pure evaluation engine (`src/lib/engine`) with Vitest coverage of the PRD gates
- Jupiter lite-api + quote-api, Dexscreener REST, RugCheck summaries, Solana JSON-RPC
- Telegram Bot API (optional)
- `agent/workflow.json` — IF/THEN skill card for Binance Agent OS / MCP wiring

The engine is side-effect free. Providers fetch. The dashboard and Telegram only display or link. Nothing in this repo constructs a signed transaction.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/events` | HUD snapshot |
| POST | `/api/tick` | One live rotation batch |
| POST | `/api/evaluate` | `{ "mint": "<CA>" }` |
| POST | `/api/reset` | Clear in-memory log |
| GET | `/api/quote?mint=<CA>&amount=<lamports>` | Jupiter route quote (unsigned) |

## Security stance

- 100% reject target for enabled mint authority or unburned LP keys
- Bundle interceptor uses funding-origin clustering when RPC allows, with conservative heuristics as fallback
- Suggested trade size is advisory. The wallet UI is the last risk check.
