# Running steps

How someone replicates Clarus:

| Step | Action |
|---|---|
| 1 | Clone the repo, run `bash tests/validate_structure.sh` |
| 2 | Option A: `npx skills add https://github.com/fozagtx/Clarus` |
| 3 | Option B: paste `https://raw.githubusercontent.com/fozagtx/Clarus/main/skill/SKILL.md` into Agent OS |
| 4 | `Load https://raw.githubusercontent.com/fozagtx/Clarus/main/skill/SKILL.md` |
| 5 | `/skill-demo` or `/evaluate-ca 0x…` |

## Demo script

| Prompt | Show |
|---|---|
| `/ingest-sprint` | Live BSC feed, CAs from GeckoTerminal / Dexscreener |
| `/evaluate-ca 0x…` | Six gates. GoPlus + Dexscreener numbers |
| `/risk-report` | The report block |
| PASS (all six) | Unsigned PancakeSwap + Binance Web3 URLs + **Clarus does not execute this swap.** |
| REJECT (any fail) | The gate that fired. Payload `none` |

See [Agent OS compatibility](agent-os-compatibility.md) for HTTP connectivity setup and verification.