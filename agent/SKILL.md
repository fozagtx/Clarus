# Clarus — Binance Agent OS Skill (Track A)

Clarus is a read-only BNB Chain researcher for the Binance Agent OS Mini Hackathon (Track A).

It never holds private keys, seed phrases, or broadcast authority. The operator signs in Binance Web3 or their own wallet.

## When to use

- A new BEP-20 / Four.Meme / PancakeSwap launch needs a six-gate risk check
- Agent OS should ingest live BSC tape and only surface a swap link after every gate passes
- The user asks whether a BSC contract is mintable, honeypot, unlocked-LP, or bundled

## Tools (HTTP MCP)

Connect Agent OS to this agent's MCP at `/api/mcp` (JSON-RPC 2.0: `initialize`, `tools/list`, `tools/call`).

| Tool | Purpose |
| --- | --- |
| `ingest_recent` | One live rotation of GeckoTerminal BSC new/trending pools + Dexscreener BSC |
| `evaluate_token` | GoPlus `token_security/56` + Clarus firewall on a `0x` address |
| `build_swap_payload` | Unsigned PancakeSwap + Binance Web3 deep links |
| `get_board` | HUD snapshot |
| `get_health` | Pipeline counters + public BNBUSDT ticker |

Optional companion: Binance's own MCP at `https://agent.binance.com/mcp/agentic`.

## Gates (fail closed)

1. Not mintable / no hidden owner
2. LP ≥95% locked or burned
3. Largest non-AMM holder ≤3.5%
4. No bundle / same-creator honeypot cluster
5. Volume ≥ 80% of market cap
6. Size a ~$50 clip to ≤2% slippage

Pass → unsigned BNB→token payload. User signs.

## Do not

- Ask for a private key or seed
- Broadcast a transaction
- Route Solana / Jupiter / Telegram
