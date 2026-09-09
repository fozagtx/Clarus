# Running steps

A step-by-step guide to replicating Clarus: installing it, loading it into an agent, and verifying it works with live data.

## Overview of what you're replicating

Clarus is a markdown skill, not an app. It is a set of instructions that turn an AI agent into a token safety checker. The skill tells the agent which public APIs to call (GoPlus, Dexscreener, GeckoTerminal) and how to score a BNB Chain token against six safety gates.

There is nothing to compile. There is no server. No signing, no keys, no trading.

## Step 1: Get the files

```bash
git clone https://github.com/fozagtx/Clarus.git
cd Clarus
```

Run the structure validator to confirm the kit is complete:

```bash
bash tests/validate_structure.sh
```

Expected output: `Structure validation passed.`

## Step 2: Install the skill (pick one method)

**Method A: via the installer (copies to `~/.agents/skills/clarus/`)**

```bash
./install.sh -y
```

**Method B: via `npx skills` (Binance Skills Hub style)**

```bash
npx skills add https://github.com/fozagtx/Clarus
```

**Method C: manual copy**

```bash
cp -R skill/. ~/.agents/skills/clarus/
```

## Step 3: Load it into the agent

**Method A: paste the raw URL into Binance Agent OS**

```text
Load https://raw.githubusercontent.com/fozagtx/Clarus/main/skill/SKILL.md
```

The file is self-contained: all six gates, the API endpoints, the report format, and the commands are inline. No other file needs to be fetched.

**Method B: point the agent at the installed skill folder**

If you used the installer, the skill lives at `~/.agents/skills/clarus/SKILL.md`. Load that file.

## Step 4: Verify it can fetch live data

Run the check command on a known token:

```text
/evaluate-ca 0x55d398326f99059ff775485246999027b3197955
```

That is USDT on BSC. Two possible results:

- Report shows live numbers (mintable, LP lock %, holder %) → the agent can fetch HTTP. Clarus works end to end.
- Report says "data not found" or "fetch failed" → the agent runtime blocks external HTTP. Every token will reject.

See [Agent OS compatibility](agent-os-compatibility.md) for what depends on the runtime.

## Step 5: Use it

| Prompt | What happens |
|---|---|
| `/evaluate-ca 0x…` | Six gates on that address, prints the report |
| `/ingest-sprint` | Pulls up to 8 live BSC pools people are talking about |
| `/risk-report` | Shows the last report again |
| `/skill-demo` | Full walkthrough: ingest, one evaluate, report |

## Demo script (for the hackathon)

| Prompt | Show |
|---|---|
| `/ingest-sprint` | Live BSC feed, CAs from GeckoTerminal / Dexscreener |
| `/evaluate-ca 0x…` | Six gates. GoPlus + Dexscreener numbers |
| `/risk-report` | The report block |
| PASS (all six) | Unsigned PancakeSwap + Binance Web3 URLs + **Clarus does not execute this swap.** |
| REJECT (any fail) | The gate that fired. Payload `none` |

## What not to claim

| Do not claim | Fact |
|---|---|
| Clarus bought, sold, or managed a position | Unsigned URLs only |
| Clarus is a financial product or advice | Read-only skill |
| Telegram/X scraping is in the loop | Listing-velocity APIs only |
| The agent signs anything | The operator signs in their own wallet |
| Live data is guaranteed | Depends on the agent runtime allowing HTTP fetch to third-party APIs |