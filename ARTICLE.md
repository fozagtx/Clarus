# Clarus: Onchain Meme Intelligence as a Read-Only Agent Skill

Contest write-up for the Binance Agent OS Mini Hackathon (Track A). Clarus turns a trading-manual firewall into executable agent rules. It never signs and never broadcasts.

## Core concept

Attention → safety filter → confluence → **unsigned** payload.

The original blueprint asked the agent to sign with private keys and take profit on-chain. That path is rejected. Phase 4 stops at a PancakeSwap URL and a Binance Web3 deep link. The operator is the signer.

Chain: **BNB Chain (`chainId` 56)** only.

## Phase 1 — Attention ingest

Live GeckoTerminal new/trending BSC pools and Dexscreener `bsc` profiles. Pair ticker + CA + listing age. No X scrape. No Telegram. A trending pool is not a passed firewall.

## Phase 2 — Safety filter (fail closed)

GoPlus `token_security/56`:

1. Not mintable, no hidden owner, not honeypot/pausable/blacklist
2. LP locked or burned ≥ 95%
3. Largest non-AMM holder ≤ 3.5%
4. No same-origin / same-creator cluster

Missing data rejects.

## Phase 3 — Confluence

5. 24h volume ≥ 80% of market cap
6. Hypothetical $50 clip impact ≤ 2% on the WBNB pair

Do not shrink the clip to force a pass.

## Phase 4 — Unsigned payload

Only after 6/6: PancakeSwap v2 BNB→token URL + `bnc://` wrapper. Sentence required: **Clarus does not execute this swap.**

## What the skill prints

A scannable risk report (mint, LP, holder, cluster, Vol/MC, clip impact) and either REJECT reasons or unsigned URLs. The reject stream is the product.

## Why it fits Track A

Ready-made APIs (GoPlus, Dexscreener, GeckoTerminal). Strict gates from a trading manual. Agent OS skill layout (SKILL.md modules, sub-agents, slash commands, rules). Markdown only — no app, no keys.
