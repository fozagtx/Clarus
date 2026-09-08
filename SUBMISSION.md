# Clarus — Track A submission notes

**Track:** Binance Agent OS Mini Hackathon, Track A (agent + Agent OS).  
**Not Track B:** no autonomous execution, no keys, no broadcast.

## What we built

A **Markdown skill kit** in the same shape as [deep-mantle-researcher](https://github.com/fozagtx/deep-mantle-researcher):

| Folder | Contents |
|---|---|
| `skill/` | SKILL.md + phase modules (progressive disclosure) |
| `agents/` | ingest, firewall, confluence, payload, demo |
| `commands/` | `/ingest-sprint` `/evaluate-ca` `/risk-report` `/skill-demo` |
| `rules/` | no-execution, firewall-integrity |

Logic is the contest blueprint (attention → shield → confluence → payload) with the payload **unsigned**. There is no app, no dashboard, and no MCP server in this repo.

## How others replicate it

| Step | Action |
|---|---|
| 1 | Clone the repo |
| 2 | `bash tests/validate_structure.sh` |
| 3 | `./install.sh -y` |
| 4 | Load `CLAUDE.md` + `skill/SKILL.md` |
| 5 | `/skill-demo` or `/evaluate-ca 0x…` |

Details: [README.md](README.md). No `npm`, no keys, no server. Live HTTP reads only (GoPlus, Dexscreener, GeckoTerminal).

## Demo prompts

| Prompt | Purpose |
|---|---|
| `/skill-demo` | Full Track A loop |
| `/ingest-sprint` | Live BSC CA feed |
| `/evaluate-ca 0x<bsc token>` | Six-gate report |

Show a live REJECT (common) or a live PASS with unsigned PancakeSwap + Binance Web3 URLs and: **Clarus does not execute this swap.**

## Safety

Not financial advice. Not an offer to buy or sell. Contest: Agent OS apps that execute trades may be geo-restricted — this skill does not execute.
