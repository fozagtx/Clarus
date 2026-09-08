# Hackathon submission (Track A)

Contest: **Binance Agent OS Mini Hackathon**. Track A = AI agent + Agent OS. This skill is Track A. It is **not** Track B autonomous trading.

## How another user runs this skill

| Step | Action |
|---|---|
| 1 | Clone the repo. Run `bash tests/validate_structure.sh`. |
| 2 | `./install.sh -y` (or load `skill/SKILL.md` in Binance Agent OS). |
| 3 | Tell the agent: load `skill/SKILL.md`. Never sign. |
| 4 | `/skill-demo` or `/evaluate-ca 0x…`. |
| 5 | Full step-by-step: repo [README.md](../README.md). |

## What to show in a demo

| Prompt | Show |
|---|---|
| `/ingest-sprint` | Live BSC feed, CAs from GeckoTerminal / Dexscreener |
| `/evaluate-ca 0x…` | Six gates. GoPlus + Dexscreener numbers |
| `/risk-report` | The block in [risk-report.md](risk-report.md) |
| PASS (all six) | Unsigned PancakeSwap + Binance Web3 URLs + **Clarus does not execute this swap.** |
| REJECT (any fail) | The gate that fired. Payload `none` |

## What not to claim

| Do not claim | Fact |
|---|---|
| Clarus bought, sold, or managed a position | Unsigned URLs only |
| Clarus is a financial product or advice | Read-only skill |
| Telegram/X scraping is in the loop | Listing-velocity APIs only |
| Solana / Jupiter / RugCheck is the stack | BNB Chain 56 + GoPlus |

## Safety line for the write-up

Not an offer to buy or sell. Agent OS apps that execute trades may be geo-restricted (see contest post). This skill does not execute.
