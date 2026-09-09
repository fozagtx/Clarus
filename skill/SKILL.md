---
name: clarus
description: "Use when ingesting BSC meme attention, scoring a BNB Chain contract, running Clarus firewall gates, writing a risk report, or assembling an unsigned PancakeSwap / Binance Web3 payload. Read-only skill: no signing, broadcasting, or key handling."
metadata:
  author: fozagtx
  version: "1.0"
---

# Clarus

A CA on BNB Chain (`chainId` 56). Six live gates, verdict is REJECT or PASS. This skill is read-only, it never executes a trade.

Payloads are PancakeSwap v2 and Binance Web3 deep links. The operator signs in their own wallet. Clarus stops at the URL.

## Commands

| You say | It does |
|---|---|
| `/ingest-sprint` | Pull live BSC new + trending pools. Print table: ticker, CA, age, source. Cap 8. |
| `/evaluate-ca 0x…` | Run all six gates on that address. Print the risk report. |
| `/risk-report` | Print the last evaluation again. |
| `/skill-demo` | Run ingest, then evaluate one CA, then print the report. |

## Hard bans

| Do not | Why |
|---|---|
| Execute, sign, broadcast, or submit any swap | This skill is read-only |
| Store, request, or handle private keys, seeds, or session signers | Operator wallet only |
| Take-profit, stop-loss, or any on-chain exit | Position management is outside scope |
| Telegram, Solana, Jupiter, or RugCheck as the product path | BNB Chain + GoPlus only |
| Skip a failed gate | First fail stops, the link is withheld |
| Invent token metrics | Live call fails → say so and stop |

## APIs

All public read-only. Send `User-Agent: clarus/1.0` on every request.

| Source | URL | Use |
|---|---|---|
| GoPlus token security | `https://api.gopluslabs.io/api/v1/token_security/56?contract_addresses=<ca>` | Gates 1–4 |
| Dexscreener token | `https://api.dexscreener.com/tokens/v1/bsc/<ca>` | Price, MC, volume, TVL |
| GeckoTerminal new pools | `https://api.geckoterminal.com/api/v2/networks/bsc/new_pools?page=1` | Ingest |
| GeckoTerminal trending | `https://api.geckoterminal.com/api/v2/networks/bsc/trending_pools?page=1` | Ingest |
| PancakeSwap quote | `https://quote.pancakeswap.finance/order-book-api-v2/quote` | Optional impact check |
| Binance ticker | `https://data-api.binance.vision/api/v3/ticker/price?symbol=BNBUSDT` | BNB USD price |

WBNB: `0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c`

## Six gates

### Gate 1: Mint / owner surface

| Check | Fail when |
|---|---|
| Mintable | `is_mintable === "1"` |
| Hidden owner | `hidden_owner === "1"` |
| Honeypot | `is_honeypot === "1"` |
| Pausable | `transfer_pausable === "1"` |
| Blacklist | `is_blacklisted === "1"` |

Pass if none fire. GoPlus empty or error → REJECT (fail closed).

### Gate 2: LP lock / burn

Sum GoPlus `lp_holders` where `is_locked === "1"` OR address is burn (`0x000...dead` / `0x000...000`). Pass if ≥ 95% of total LP. Unlocked or unknown → REJECT.

### Gate 3: Top holder ≤ 3.5%

Largest non-AMM holder (`is_contract !== "1"`) must be ≤ 3.5% of supply. Missing holder list → REJECT.

### Gate 4: Same-origin cluster

| Signal | Fail |
|---|---|
| Same-creator honeypot | `honeypot_with_same_creator === "1"` |
| Shared funding | Two or more top EOA holders share same `funding_source` / creator cluster |

Unknown cluster → fail closed unless holders are clearly diversified and Gate 3 passed.

### Gate 5: Volume vs market cap

```
volMcPct = (volume24hUsd / marketCapUsd) * 100
pass if volMcPct >= 80
```

Missing MC or volume → REJECT.

### Gate 6: $50 clip slippage

Hypothetical $50 clip against the WBNB pair. Formula: `clip / (tvlUsd + clip)`. Pass if estimated impact ≤ 2%. Thin TVL → REJECT. Do not shrink the clip to force a pass.

## Ingest

Pull newest BSC pairs (GeckoTerminal `new_pools/bsc`, Dexscreener `token-profiles/latest` with `chainId === "bsc"`). Pull trending BSC pairs (GeckoTerminal `trending_pools/bsc`). Tag each CA: ticker, name fragment, or pool age. Flag when new (minutes old) AND on a trending/high-velocity list. Cap 8. Hand to gate 1. Do not buy.

## Report format

```
CA: 0x…
Chain: BNB Chain (56)
Pair: <dex> <symbol>/WBNB
Narrative: <ticker / listing age>

Mint / owner: DISABLED / FAIL (mintable|hidden_owner|honeypot|pausable|blacklist)
LP lock: NN% LOCKED|BURNED (SAFE ≥95 | FAIL)
Top holder: N.N% (SAFE ≤3.5 | FAIL)
Cluster: CLEAN | SAME-ORIGIN | UNKNOWN→REJECT
Vol/MC: NN% (SAFE ≥80 | FAIL)
$50 clip impact: N.NN% (SAFE ≤2 | FAIL)

VERDICT: PASS | REJECT
gatesPassed: k/6
Reasons: <gate names that fired>

Payload: <pancakeswap URL or none>
Binance Web3: <bnc:// URL or none>
Clarus does not execute this swap.
```

On REJECT, Payload and Binance Web3 are `none`.

## Unsigned payload (6/6 only)

```
https://pancakeswap.finance/swap?chain=bsc&inputCurrency=BNB&outputCurrency=<CA>&exactAmount=<bnb>&exactField=exactIn&utm_source=clarus

bnc://app.binance.com/mp/app?appId=bnb1w4cqqe&startPagePath=/swap&startPageQuery=<urlencoded pancakeswap path+query>
```

Default size: 0.02 BNB. Print both URLs. Then: **Clarus does not execute this swap. Sign in your own wallet or discard.**

## Reference files in this repo

Loaded alongside the skill when installed via `install.sh` or `npx skills add`:

| Path | What it is |
|---|---|
| `skill/safety-filter.md` | Gates 1–4, expanded |
| `skill/confluence.md` | Gates 5–6, expanded |
| `skill/attention-ingest.md` | Ingest, expanded |
| `skill/unsigned-payload.md` | Payload rules, expanded |
| `skill/risk-report.md` | Report shape |
| `skill/resources.md` | Endpoints with GoPlus field mapping |
| `agents/` | Dedicated agent roles per phase |
| `commands/` | Slash command definitions |
| `rules/` | No-execution and firewall integrity |