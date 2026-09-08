# Clarus

An Agent OS **skill** that turns BNB Chain meme attention into a fail-closed risk report and, only on a full pass, an **unsigned** PancakeSwap / Binance Web3 payload.

It does **not** execute trades. It does **not** hold keys. It is **not** a frontend.

Built for the Binance Agent OS Mini Hackathon, Track A.

---

## What It Does

Four phases from the contest blueprint, with execution stripped:

1. **Attention ingest** — live BSC new/trending pools (GeckoTerminal, Dexscreener). Pair ticker ↔ CA. No X/Telegram scrape.
2. **Safety filter** — mint/owner, LP ≥95% locked/burned, top EOA holder ≤3.5%, no same-origin cluster. Fail closed.
3. **Confluence** — 24h volume ≥ 80% of market cap; hypothetical $50 clip ≤ 2% impact.
4. **Unsigned payload** — PancakeSwap URL + Binance Web3 deep link. Operator signs in their wallet or discards.

---

## Repository Structure

```text
.
├── ARTICLE.md                  # Contest write-up (read-only agent thesis)
├── CLAUDE.md                   # Agent system prompt & progressive disclosure
├── SUBMISSION.md               # Track A demo prompts
├── LICENSE                     # MIT License
├── install.sh                  # Local installer (copies skill/ only)
├── install-custom.sh           # Alternate install targets
├── skill/
│   ├── SKILL.md                # Skill entrypoint & routing
│   ├── attention-ingest.md     # Phase 1
│   ├── safety-filter.md        # Phase 2
│   ├── confluence.md           # Phase 3
│   ├── unsigned-payload.md     # Phase 4 — no keys, no broadcast
│   ├── risk-report.md          # RugCheck-emulator printout
│   ├── hackathon-submission.md
│   ├── resources.md            # GoPlus / Dexscreener / MCP
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

Optional TypeScript MCP runtime (`src/`, `POST /api/mcp`) implements the same gates in code. Load the Markdown skill first. Do not treat the Next.js page as the product.

---

## Installation

Install the skill locally into your agent environment:

```bash
chmod +x install.sh install-custom.sh
./install.sh -y
```

Or pick a custom target:

```bash
./install-custom.sh
```

Installers copy `skill/` into `~/.agents/skills/clarus/` (Markdown only, no network). They never deploy a bot and never touch a wallet.

---

## Validation

```bash
bash tests/validate_structure.sh
```

---

## Demo

```
/skill-demo
/ingest-sprint
/evaluate-ca 0x<bsc token>
/risk-report
```

Every report ends with: **Clarus does not execute this swap.**

---

## License

MIT
