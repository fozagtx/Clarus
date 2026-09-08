# Clarus

A read-only Agent OS **skill** that turns BNB Chain meme attention into a fail-closed risk report and, only on a full pass, an **unsigned** PancakeSwap / Binance Web3 payload.

It never executes a trade. It never holds keys.

Built for the Binance Agent OS Mini Hackathon, Track A.

---

## What It Does

| Phase | Job | Pass bar |
|---|---|---|
| 1 Attention ingest | Live BSC new/trending pools (GeckoTerminal, Dexscreener). Pair ticker ↔ CA. No X/Telegram scrape. | Feed row only — not a trade |
| 2 Safety filter | Mint/owner, LP, top holder, same-origin cluster. Fail closed. | LP ≥95% locked/burned; top EOA ≤3.5% |
| 3 Confluence | Tape + clip size | 24h volume ≥ 80% of MC; $50 clip ≤ 2% impact |
| 4 Unsigned payload | PancakeSwap URL + Binance Web3 deep link | 6/6 gates only. Operator signs or discards |

---

## How to replicate this agent

Other users can reproduce Clarus with git, bash, and any Agent OS–compatible assistant that loads Markdown skills. There is no app to run, no `npm install`, and no API keys.

| Step | Action | Expect |
|---|---|---|
| 1 | Meet prerequisites | git, bash, a skill-capable agent, outbound HTTPS |
| 2 | Clone this repo | Working copy of the kit |
| 3 | `bash tests/validate_structure.sh` | `Structure validation passed.` |
| 4 | Install the skill | `skill/` in the agent skills dir |
| 5 | Load `CLAUDE.md` + `skill/SKILL.md` | Agent knows Clarus; will not ask for keys |
| 6 | `/skill-demo` or `/evaluate-ca 0x…` | Live risk report |
| 7 | Check the report contract | Every line below, including the no-execute sentence |

### 1. Prerequisites

| Need | Why |
|---|---|
| `git` + `bash` | Clone, validate, install |
| Agent that loads a local skill | Cursor, Claude Code, OpenClaw, or [Binance Agent OS](https://agent.binance.com) |
| Outbound HTTPS | Live GoPlus, Dexscreener, GeckoTerminal (public, no keys) |
| **No** private key / seed / Binance trading secret | Clarus does not sign |

### 2. Clone the kit

```bash
git clone https://github.com/fozagtx/Clarus.git
cd Clarus
```

### 3. Confirm the kit is intact

```bash
bash tests/validate_structure.sh
```

Expected line: `Structure validation passed.`

Installers make **no network calls**. The validator checks required files, `skill/SKILL.md` frontmatter (`name: clarus` and a `Use when …` description), module links, installer syntax, and the no-execution rule.

### 4. Install the skill into the agent

```bash
chmod +x install.sh install-custom.sh
```

| Method | Command | Result |
|---|---|---|
| Default Agent OS layout | `./install.sh -y` | `skill/` → `~/.agents/skills/clarus/`; `CLAUDE.md` → `~/.agents/AGENTS.md` |
| Pick a target | `./install-custom.sh` | See destination table below |
| Manual copy | `mkdir -p ~/.agents/skills/clarus && cp -R skill/. ~/.agents/skills/clarus/` | Same files, no script |
| Binance Agent OS | Open this repo or paste `skill/SKILL.md`; point session at `CLAUDE.md` | Restart/refresh so `clarus` appears |

`install-custom.sh` destinations:

| Selection | Destination |
|---|---|
| 1 | `~/.agents/skills/clarus` |
| 2 | `~/.claude/skills/clarus` |
| 3 | `./skills/clarus` |
| 4 | path you type |

Keep `agents/`, `commands/`, `rules/`, and `CLAUDE.md` in the cloned repo. Progressive disclosure points at those files.

### 5. Load the skill

| You say | When |
|---|---|
| `Load the Clarus skill. Read CLAUDE.md, then skill/SKILL.md. Never sign, never broadcast, never ask for keys.` | First session in this repo |
| `Use the clarus skill.` | After `./install.sh -y` |
| `what skills do you have?` | Confirm it loaded (restart once if it does not) |

### 6. Run it

| You type | What the agent should do |
|---|---|
| `/skill-demo` | Full Track A loop: ingest → one evaluate → risk report |
| `/ingest-sprint` | Live BSC new + trending CAs (cap 8). No swap URLs. |
| `/evaluate-ca 0x…` | Six gates on that BEP-20, fail closed, print the report |
| `/risk-report` | Reprint the last evaluation in the report template |
| `Is 0x… safe to touch on BSC?` | Same as `/evaluate-ca` |
| `Ingest the newest BNB Chain meme pools and show the feed.` | Same as `/ingest-sprint` |

```text
Evaluate CA 0x<40 hex> on BNB Chain with the Clarus firewall.
Print the risk report. Do not execute a swap.
```

### 7. What a correct run looks like

Live HTTP (see [skill/resources.md](skill/resources.md)):

| Phase | Call | For |
|---|---|---|
| Ingest | GeckoTerminal `new_pools` / `trending_pools` on `bsc`; Dexscreener `bsc` profiles | CA feed |
| Shield | GoPlus `token_security/56?contract_addresses=<ca>` | Gates 1–4 |
| Confluence | Dexscreener `tokens/v1/bsc/<ca>` | Volume, MC, TVL |

Then it prints the [risk-report](skill/risk-report.md) block.

| Verdict | When | Payload |
|---|---|---|
| REJECT | Any gate fails (usual) | `none` — this is a successful replication |
| PASS | 6/6 only (rare) | Unsigned PancakeSwap + Binance Web3 URLs. Human may open them. Agent must not. |

If GoPlus or Dexscreener fails, the agent says so and **rejects**. It must not invent numbers.

### 8. How to know you replicated it

| Check | Pass when |
|---|---|
| Validator | `bash tests/validate_structure.sh` prints `Structure validation passed.` |
| Skill load | Agent reads `skill/SKILL.md` before evaluating |
| Ingest | `/ingest-sprint` returns real BSC CAs (not fixtures) |
| Evaluate | `/evaluate-ca 0x…` prints every gate as SAFE or FAIL |
| Report footer | **Clarus does not execute this swap.** |
| Keys | None requested or used |

### 9. What this agent must never do

| Forbidden | Instead |
|---|---|
| Sign, broadcast, or submit a swap | Unsigned URL on 6/6 only |
| Store or ask for keys / seeds | Operator wallet, outside the skill |
| Take-profit, stop-loss, on-chain exit | Stop at the report |
| Scrape X or Telegram as the product path | GeckoTerminal + Dexscreener listing velocity |
| Solana, Jupiter, RugCheck | BNB Chain 56 + GoPlus |
| Skip a failed gate | First fail = REJECT |

Full bans: [rules/no-execution.md](rules/no-execution.md), [rules/firewall-integrity.md](rules/firewall-integrity.md).

---

## Repository Structure

| Path | Role |
|---|---|
| [ARTICLE.md](ARTICLE.md) | Contest write-up |
| [CLAUDE.md](CLAUDE.md) | Agent prompt + progressive disclosure |
| [SUBMISSION.md](SUBMISSION.md) | Track A demo prompts |
| [install.sh](install.sh) | Copies `skill/` → `~/.agents/skills/clarus/` |
| [install-custom.sh](install-custom.sh) | Alternate install targets |
| [skill/SKILL.md](skill/SKILL.md) | Skill entrypoint |
| [skill/attention-ingest.md](skill/attention-ingest.md) | Phase 1 |
| [skill/safety-filter.md](skill/safety-filter.md) | Phase 2 |
| [skill/confluence.md](skill/confluence.md) | Phase 3 |
| [skill/unsigned-payload.md](skill/unsigned-payload.md) | Phase 4 — no keys, no broadcast |
| [skill/risk-report.md](skill/risk-report.md) | Report template |
| [skill/resources.md](skill/resources.md) | Live HTTP sources |
| [agents/](agents/) | Sub-agent roles |
| [commands/](commands/) | `/ingest-sprint` `/evaluate-ca` `/risk-report` `/skill-demo` |
| [rules/no-execution.md](rules/no-execution.md) | Never sign |
| [rules/firewall-integrity.md](rules/firewall-integrity.md) | Fail closed |
| [tests/validate_structure.sh](tests/validate_structure.sh) | Structure + hygiene |

---

## License

MIT
