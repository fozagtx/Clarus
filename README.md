# Clarus

A contract address hits BNB Chain. Clarus does not buy it.

It reads GoPlus and Dexscreener, runs six gates, and prints REJECT or PASS. The first failed gate stops the run. It never signs a swap. It never asks for a key.

People lose money on mintable tokens, unlocked LP, a wallet sitting on too much supply, and a ticker story nobody checked. Clarus is that check. You read the report before you touch the trade.

If all six gates pass, you get a PancakeSwap URL and a Binance Web3 link. You still sign in your own wallet. A failed gate means no URL.

Track A skill for the Binance Agent OS Mini Hackathon. Markdown only. No app. No `npm`.

## Gates

| # | Check | Pass |
|---|---|---|
| 1 | Mint, hidden owner, honeypot, pause, blacklist | All off |
| 2 | LP locked or burned | ≥ 95% |
| 3 | Largest non-AMM holder | ≤ 3.5% of supply |
| 4 | Same-origin / same-creator cluster | Absent |
| 5 | 24h volume vs market cap | Volume ≥ 80% of MC |
| 6 | Hypothetical $50 clip vs WBNB pool | ≤ 2% impact |

Data: GeckoTerminal and Dexscreener for new BSC pools, GoPlus `token_security/56` for the contract, Dexscreener again for volume, cap, and TVL. Missing data is a reject. Invented numbers are forbidden.

## Install

```bash
git clone https://github.com/fozagtx/Clarus.git
cd Clarus
bash tests/validate_structure.sh
chmod +x install.sh install-custom.sh
./install.sh -y
```

`./install.sh -y` copies `skill/` to `~/.agents/skills/clarus/`.

| Method | Command | Lands in |
|---|---|---|
| Default | `./install.sh -y` | `~/.agents/skills/clarus/` |
| Pick a path | `./install-custom.sh` | `~/.agents`, `~/.claude/skills`, `./skills`, or a path you type |
| Manual | `cp -R skill/. ~/.agents/skills/clarus/` | Same files |
| Binance Agent OS | Paste the block below | Refresh the agent |

For Binance Agent OS, copy this and paste it into the agent. You do not need to hunt through the tree.

```text
Load https://raw.githubusercontent.com/fozagtx/Clarus/main/skill/SKILL.md
Never sign. Never ask for keys.
```

That URL is [skill/SKILL.md](https://github.com/fozagtx/Clarus/blob/main/skill/SKILL.md). Refresh the agent after it loads.

No installer hits the network. `bash tests/validate_structure.sh` should print `Structure validation passed.`

Keep `agents/`, `commands/`, and `rules/` next to `skill/`. `skill/SKILL.md` points at them.

## Run

Tell the agent the same paste block as in Install, or: `Load skill/SKILL.md. Never sign. Never ask for keys.`

| You type | What happens |
|---|---|
| `/ingest-sprint` | Up to 8 live BSC CAs. No swap URL. |
| `/evaluate-ca 0x…` | Six gates on that address. Prints the report. |
| `/risk-report` | Last report again |
| `/skill-demo` | Ingest, one evaluate, report |

```text
Evaluate CA 0x<40 hex> on BNB Chain with the Clarus gates.
Print the risk report. Do not execute a swap.
```

Every report ends with: **Clarus does not execute this swap.**

REJECT means payload is `none`. That is a finished run. PASS (all six) prints the two unsigned URLs. If GoPlus or Dexscreener errors, the agent says so and rejects.

## Files

| Path | What it is |
|---|---|
| [skill/SKILL.md](skill/SKILL.md) | Load this |
| [skill/attention-ingest.md](skill/attention-ingest.md) | New/trending BSC pools |
| [skill/safety-filter.md](skill/safety-filter.md) | Gates 1–4 |
| [skill/confluence.md](skill/confluence.md) | Gates 5–6 |
| [skill/unsigned-payload.md](skill/unsigned-payload.md) | PancakeSwap and Binance Web3 URLs, unsigned |
| [skill/risk-report.md](skill/risk-report.md) | Report shape |
| [skill/resources.md](skill/resources.md) | HTTP endpoints |
| [commands/](commands/) | The slash commands above |
| [rules/no-execution.md](rules/no-execution.md) | No keys, no broadcast |
| [rules/firewall-integrity.md](rules/firewall-integrity.md) | First fail = REJECT |
| [tests/validate_structure.sh](tests/validate_structure.sh) | Kit check |

MIT license.
