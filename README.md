# Clarus

A read-only Agent OS **skill** that turns BNB Chain meme attention into a fail-closed risk report and, only on a full pass, an **unsigned** PancakeSwap / Binance Web3 payload.

It never executes a trade. It never holds keys.

Built for the Binance Agent OS Mini Hackathon, Track A.

---

## What It Does

Four phases from the contest blueprint, with execution stripped:

1. **Attention ingest**: live BSC new/trending pools (GeckoTerminal, Dexscreener). Pair ticker ↔ CA. No X/Telegram scrape.
2. **Safety filter**: mint/owner, LP ≥95% locked/burned, top EOA holder ≤3.5%, no same-origin cluster. Fail closed.
3. **Confluence**: 24h volume ≥ 80% of market cap; hypothetical $50 clip ≤ 2% impact.
4. **Unsigned payload**: PancakeSwap URL + Binance Web3 deep link. Operator signs in their wallet or discards.

---

## How to replicate this agent

Other users can reproduce Clarus with git, bash, and any Agent OS–compatible assistant that loads Markdown skills. There is no app to run, no `npm install`, and no API keys.

### 1. Prerequisites

- `git` and `bash`
- An AI agent that can load a local skill (Cursor, Claude Code, OpenClaw, or [Binance Agent OS](https://agent.binance.com))
- Outbound HTTPS so the agent can read GoPlus, Dexscreener, and GeckoTerminal (all public, no keys)

Do **not** put a private key, seed phrase, or Binance trading API secret anywhere. Clarus does not sign.

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

This checks required files, `skill/SKILL.md` frontmatter (`name: clarus` and a `Use when …` description), module links, installer syntax, and the no-execution rule. Installers make **no network calls**.

### 4. Install the skill into the agent

**Default** (Agent OS / generic `~/.agents` layout):

```bash
chmod +x install.sh install-custom.sh
./install.sh -y
```

That copies `skill/` → `~/.agents/skills/clarus/` and `CLAUDE.md` → `~/.agents/AGENTS.md`.

**Pick a target** (Claude Code, project-local, or a custom path):

```bash
./install-custom.sh
```

| Selection | Destination |
|---|---|
| 1 | `~/.agents/skills/clarus` |
| 2 | `~/.claude/skills/clarus` |
| 3 | `./skills/clarus` |
| 4 | path you type |

**Manual copy** (same result, no script):

```bash
mkdir -p ~/.agents/skills/clarus
cp -R skill/. ~/.agents/skills/clarus/
```

Keep `agents/`, `commands/`, `rules/`, and `CLAUDE.md` in the cloned repo. Progressive disclosure points at those files.

**Binance Agent OS:** open this repo (or paste `skill/SKILL.md` as the skill). Point the session at `CLAUDE.md`. Restart or refresh the agent so it discovers `clarus`.

### 5. Load the skill

Tell the agent, in the same project:

```text
Load the Clarus skill. Read CLAUDE.md, then skill/SKILL.md.
Never sign, never broadcast, never ask for keys.
```

Or invoke it by name after install:

```text
Use the clarus skill.
```

Ask `what skills do you have?` if you need to confirm it loaded. Restart the agent once if a fresh install does not appear yet.

### 6. Run it

| You type | What the agent should do |
|---|---|
| `/skill-demo` | Full Track A loop: ingest → one evaluate → risk report |
| `/ingest-sprint` | Live BSC new + trending CAs (cap 8). No swap URLs. |
| `/evaluate-ca 0x…` | Six gates on that BEP-20, fail closed, print the report |
| `/risk-report` | Reprint the last evaluation in the report template |
| `Is 0x… safe to touch on BSC?` | Same as `/evaluate-ca` (skill description is `Use when …`) |

Natural-language equivalents work if the skill is loaded:

```text
Ingest the newest BNB Chain meme pools and show the feed.
```

```text
Evaluate CA 0x<40 hex> on BNB Chain with the Clarus firewall.
Print the risk report. Do not execute a swap.
```

### 7. What a correct run looks like

The agent must call **live HTTP** (see [skill/resources.md](skill/resources.md)):

1. GeckoTerminal `new_pools` / `trending_pools` on `bsc` and/or Dexscreener `bsc` profiles
2. GoPlus `token_security/56?contract_addresses=<ca>`
3. Dexscreener `tokens/v1/bsc/<ca>` for volume, market cap, TVL

Then it prints the [risk-report](skill/risk-report.md) block:

```text
CA: 0x…
Chain: BNB Chain (56)
…
VERDICT: PASS | REJECT
gatesPassed: k/6
Payload: <url or none>
Binance Web3: <url or none>
Clarus does not execute this swap.
```

- **REJECT** (usual): stop. Payload is `none`. That is a successful replication.
- **PASS** (rare, 6/6 only): unsigned PancakeSwap + Binance Web3 URLs. The human may open them in a wallet. The agent must not.

If GoPlus or Dexscreener fails, the agent says so and **rejects**. It must not invent numbers.

### 8. How to know you replicated it

You have Clarus working when all of these are true:

1. `bash tests/validate_structure.sh` passes
2. The agent reads `skill/SKILL.md` before evaluating
3. A live `/ingest-sprint` returns real BSC CAs (not fixtures)
4. `/evaluate-ca 0x…` prints every gate as SAFE or FAIL
5. Every report ends with **Clarus does not execute this swap.**
6. No private key was requested or used

### 9. What this agent must never do

- Sign, broadcast, or submit a swap
- Store or ask for keys / seeds
- Take profit, stop-loss, or any on-chain exit
- Scrape X or Telegram as the product path
- Use Solana, Jupiter, or RugCheck
- Skip a failed gate

Full bans: [rules/no-execution.md](rules/no-execution.md), [rules/firewall-integrity.md](rules/firewall-integrity.md).

---

## Repository Structure

```text
.
├── ARTICLE.md                  # Contest write-up (read-only agent thesis)
├── CLAUDE.md                   # Agent system prompt & progressive disclosure
├── SUBMISSION.md               # Track A demo prompts
├── LICENSE                     # MIT License
├── install.sh                  # Local installer script
├── install-custom.sh           # Custom environment installer
├── skill/
│   ├── SKILL.md                # Skill entrypoint & routing
│   ├── attention-ingest.md     # Phase 1
│   ├── safety-filter.md        # Phase 2
│   ├── confluence.md           # Phase 3
│   ├── unsigned-payload.md     # Phase 4 — no keys, no broadcast
│   ├── risk-report.md          # RugCheck-emulator printout
│   ├── hackathon-submission.md
│   ├── resources.md            # GoPlus / Dexscreener / GeckoTerminal
│   └── examples/
├── agents/
│   ├── ingest-analyst.md
│   ├── firewall-verifier.md
│   ├── confluence-analyst.md
│   ├── payload-coach.md
│   └── skill-demo-coach.md
├── commands/
│   ├── ingest-sprint.md
│   ├── evaluate-ca.md
│   ├── risk-report.md
│   └── skill-demo.md
├── rules/
│   ├── no-execution.md
│   └── firewall-integrity.md
└── tests/
    └── validate_structure.sh
```

---

## License

MIT
