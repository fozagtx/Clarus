# Phase 1 — Attention & narrative ingest

> "Attention drives value. The earlier you spot where attention will flow, the more money you make."

Clarus does **not** scrape X or Telegram. Those sources are noisy, ToS-hostile, and not the contest path. Ingest is **on-chain listing velocity on BNB Chain**, which is the moment a CA becomes tradeable.

## What the agent does

1. Pull the newest BSC pairs (GeckoTerminal `new_pools/bsc`, Dexscreener `token-profiles/latest` filtered to `chainId === "bsc"`).
2. Pull trending BSC pairs (GeckoTerminal `trending_pools/bsc`).
3. Pair each CA with a **narrative tag**: ticker, name fragment, or pool age — not a fabricated "X viral" story.
4. Flag a CA when it is **new** (listed minutes ago) **and** appears in a trending or high-velocity list.
5. Hand the CA to Phase 2. Do not buy. Do not skip the firewall because the ticker is funny.

## Output of this phase

A feed row, not a trade:

```
keyword / ticker | CA | pair created | source | next = evaluate
```

Cap the feed (default 8). Older than a few hours is not "breaking."

## What this phase must never do

- Invent a tweet, Telegram call, or Google Trends spike.
- Treat a trending pool as a passed firewall.
- Follow a CA onto Solana or any chain other than `56`.
