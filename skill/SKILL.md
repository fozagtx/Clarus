---
name: clarus
description: "Use when ingesting BSC meme attention, scoring a BNB Chain contract, running Clarus firewall gates, writing a risk report, or assembling an unsigned PancakeSwap / Binance Web3 payload. Never signs, never broadcasts, never holds keys."
---

# Clarus

A CA on BNB Chain (`chainId` 56). Six live gates. REJECT or PASS. This skill never executes a trade.

Payloads are PancakeSwap v2 and Binance Web3 deep links. The operator signs in their own wallet. Clarus stops at the URL.

```
Attention ingest  →  Safety filter  →  Confluence  →  Unsigned payload
     feed               reject               size            deep link
```

## Load this first

| Module | Open when |
|---|---|
| [attention-ingest.md](attention-ingest.md) | Phase 1: trending keywords ↔ newly posted CAs |
| [safety-filter.md](safety-filter.md) | Phase 2: mint / LP / holder / cluster (fail closed) |
| [confluence.md](confluence.md) | Phase 3: Vol/MC ≥ 80%, $50 clip ≤ 2% slippage |
| [unsigned-payload.md](unsigned-payload.md) | Phase 4: unsigned URL only. No keys. No broadcast. |
| [risk-report.md](risk-report.md) | Scannable RugCheck-emulator block |
| [hackathon-submission.md](hackathon-submission.md) | Track A demo, what not to claim |
| [resources.md](resources.md) | GoPlus, Dexscreener, GeckoTerminal |

## Hard bans (read before any run)

| Do not | Why |
|---|---|
| Execute, sign, broadcast, or submit any swap | This skill is read-only |
| Store, request, or handle private keys, seeds, or session signers | Operator wallet only |
| Take-profit, stop-loss, or any on-chain exit | No position management |
| Telegram, Solana, Jupiter, or RugCheck as the product path | BNB Chain + GoPlus only |
| Skip a failed gate | Reject is the product |
| Invent token metrics | Live call fails → say so and stop |

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

## Output contract

Every evaluated CA gets one [risk-report.md](risk-report.md) block. Verdict is `PASS` or `REJECT`. On `PASS`, attach an unsigned payload and the sentence: **Clarus does not execute this swap.**
