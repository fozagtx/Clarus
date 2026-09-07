# Clarus · MemeCopilot AI

Event-driven researcher and on-chain risk firewall for the Binance Agent / Workflow contest.

MemeCopilot does **not** trade. It watches high-velocity Solana launches, runs a strict six-gate pipeline, and — only if every gate passes — emits a Jupiter / Binance Web3 deep link. The operator signs in their own wallet (FaceID, passcode, hardware). No private keys, seed phrases, or broadcast authority ever enter this process.

## What it does

1. **Ingest** — Jupiter `tokens/v2/recent` for new pairs / Pump.fun launches, Dexscreener for tape, optional Helius/Solana RPC for mint state. Social keywords (viral, listing, animal topics, etc.) are scored against name, ticker, and links. The contract address is locked and forwarded in under 500ms of process time.
2. **Shield** — four hard stops:
   - mint + freeze authorities must be disabled
   - LP must be ≥95% locked or burned
   - largest non-AMM wallet ≤3.5% of supply
   - reject if more than 3 holders share a funding origin inside a 60s window (RPC when available; serial-deployer / thin-holder heuristics otherwise)
3. **Viability** — rolling volume must be ≥ 80% of market cap. A constant-product model sizes a default $50 clip so slippage stays ≤2%, shrinking the suggested size when TVL is thin.
4. **Payload** — Jupiter swap URL + Binance Web3 router URL + optional Telegram inline keyboard. Signing stays on-device.

Any failed check terminates the task and is logged. That rejection stream **is** the product: most launches should die here.

## Dashboard (three shots)

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

Open [http://localhost:3000](http://localhost:3000).

- **Run 6-token demo** — fixtures that pass, fail mint, fail LP, fail holder cap, fail bundles, and fail volume/MC. Use this for contest walkthroughs.
- **Arm live Jupiter feed** — polls public Jupiter recent tokens and evaluates each new CA. Public RPC is rate-limited; Helius is optional.
- **Paste a CA** — one-shot evaluate through the same engine.

Optional env (see `.env.example`):

- `HELIUS_API_KEY` / `SOLANA_RPC_URL` — faster mint + holder queries
- `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` — push the same alert the dashboard shows

## Stack

- Next.js 15 + TypeScript operator HUD
- Pure evaluation engine (`src/lib/engine`) with Vitest coverage of the PRD gates
- Jupiter lite-api + quote-api, Dexscreener REST, Solana JSON-RPC
- Telegram Bot API (optional)
- `agent/workflow.json` — IF/THEN skill card for Binance Agent OS / MCP wiring

The engine is side-effect free. Providers fetch. The dashboard and Telegram only display or link. Nothing in this repo constructs a signed transaction.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/events` | HUD snapshot |
| POST | `/api/demo` | Contest fixture sweep |
| POST | `/api/tick` | One live Jupiter ingest cycle |
| POST | `/api/evaluate` | `{ "mint": "<CA>" }` |
| POST | `/api/reset` | Clear in-memory log |
| GET | `/api/quote?mint=<CA>&amount=<lamports>` | Jupiter route quote (unsigned) |

## Security stance

- 100% reject target for enabled mint authority or unburned LP keys
- Bundle interceptor uses funding-origin clustering when RPC allows, with conservative heuristics as fallback
- Suggested trade size is advisory. The wallet UI is the last risk check.
