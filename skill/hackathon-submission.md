# Hackathon submission (Track A)

Contest: **Binance Agent OS Mini Hackathon**. Track A = AI agent + Agent OS. This skill is Track A. It is **not** Track B autonomous trading.

## What to show in a demo

1. `/ingest-sprint` — live BSC feed, CAs from GeckoTerminal / Dexscreener.
2. `/evaluate-ca 0x…` — six gates, fail closed, GoPlus + Dexscreener numbers.
3. `/risk-report` — the block in [risk-report.md](risk-report.md).
4. On a rare PASS: unsigned PancakeSwap + Binance Web3 URLs, plus **Clarus does not execute this swap.**
5. On the common REJECT: show the gate that fired. Reject stream is the product.

Optional: `POST /api/mcp` `tools/call` `evaluate_token` if the repo server is up.

## What not to claim

- That Clarus bought, sold, or managed a position
- That Clarus is a financial product or advice
- That Telegram/X scraping is in the loop
- That Solana / Jupiter / RugCheck is the stack

## Safety line for the write-up

Not an offer to buy or sell. Agent OS apps that execute trades may be geo-restricted (see contest post). This skill does not execute.
