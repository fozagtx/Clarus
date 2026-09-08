---
name: clarus
description: "Use when ingesting BSC meme attention, scoring a BNB Chain contract, running Clarus firewall gates, writing a risk report, or assembling an unsigned PancakeSwap / Binance Web3 payload. Never signs, never broadcasts, never holds keys."
---

# Clarus

Onchain meme intelligence as a **read-only Agent OS skill**. Four phases from the Binance Agent / Workflow Creation Contest blueprint — attention ingest, safety filter, confluence, unsigned payload — with one hard law: **this skill never executes a trade**.

Chain is **BNB Chain (`chainId` 56)** only. Quotes and payloads are **PancakeSwap v2 + Binance Web3 Wallet** deep links. The operator signs in their own wallet if they choose to. Clarus stops at the payload.

```
Attention ingest  →  Safety filter  →  Confluence  →  Unsigned payload
     feed               reject               size            deep link
```

## Load this first

1. [attention-ingest.md](attention-ingest.md) — Phase 1: trending keywords ↔ newly posted CAs
2. [safety-filter.md](safety-filter.md) — Phase 2: mint / LP / holder / cluster (fail closed)
3. [confluence.md](confluence.md) — Phase 3: Vol/MC ≥ 80%, $50 clip ≤ 2% slippage
4. [unsigned-payload.md](unsigned-payload.md) — Phase 4: unsigned URL only. No keys. No broadcast.
5. [risk-report.md](risk-report.md) — scannable RugCheck-emulator block
6. [hackathon-submission.md](hackathon-submission.md) — Track A demo, what not to claim
7. [resources.md](resources.md) — GoPlus, Dexscreener, GeckoTerminal, Agent OS MCP

## Hard bans (read before any run)

- Do **not** execute, sign, broadcast, or submit any swap.
- Do **not** store, request, or handle private keys, seed phrases, or session signers.
- Do **not** implement take-profit, stop-loss, or any on-chain exit.
- Do **not** use Telegram, Solana, Jupiter, or RugCheck as the product path.
- Do **not** skip a failed gate. Reject is the product.
- Do **not** invent token metrics. If a live call fails, say so and stop.

Full rule files: [../rules/no-execution.md](../rules/no-execution.md), [../rules/firewall-integrity.md](../rules/firewall-integrity.md).

## Agent routing

| Job | Agent |
|---|---|
| Pair trending topics with new BSC CAs | [ingest-analyst](../agents/ingest-analyst.md) |
| Run the six gates, fail closed | [firewall-verifier](../agents/firewall-verifier.md) |
| Vol/MC + $50 / 2% clip | [confluence-analyst](../agents/confluence-analyst.md) |
| Unsigned Pancake / Binance Web3 URL | [payload-coach](../agents/payload-coach.md) |
| Track A demo transcript | [skill-demo-coach](../agents/skill-demo-coach.md) |

## Commands

| Command | File |
|---|---|
| `/ingest-sprint` | [../commands/ingest-sprint.md](../commands/ingest-sprint.md) |
| `/evaluate-ca` | [../commands/evaluate-ca.md](../commands/evaluate-ca.md) |
| `/risk-report` | [../commands/risk-report.md](../commands/risk-report.md) |
| `/skill-demo` | [../commands/skill-demo.md](../commands/skill-demo.md) |

## Optional runtime

This kit is Markdown. If the Clarus repo is running locally, agents **may** call `POST /api/mcp` (`initialize` → `tools/list` → `tools/call`). Tools: `ingest_recent`, `evaluate_token`, `build_swap_payload`, `get_board`, `get_health`. MCP does not sign. Skip the server if it is down — still complete the report from live HTTP APIs in [resources.md](resources.md).

## Output contract

Every evaluated CA gets one [risk-report.md](risk-report.md) block. Verdict is `PASS` or `REJECT`. On `PASS`, attach an unsigned payload and the sentence: **Clarus does not execute this swap.**
