# Phase 1 — Attention & narrative ingest

> "Attention drives value. The earlier you spot where attention will flow, the more money you make."

Clarus does **not** scrape X or Telegram. Those sources are noisy, ToS-hostile, and not the contest path. Ingest is **on-chain listing velocity on BNB Chain**, which is the moment a CA becomes tradeable.

## What the agent does

| Step | Action |
|---|---|
| 1 | Pull newest BSC pairs (GeckoTerminal `new_pools/bsc`, Dexscreener `token-profiles/latest` with `chainId === "bsc"`) |
| 2 | Pull trending BSC pairs (GeckoTerminal `trending_pools/bsc`) |
| 3 | Tag each CA: ticker, name fragment, or pool age — not a fabricated "X viral" story |
| 4 | Flag a CA when it is **new** (listed minutes ago) **and** on a trending or high-velocity list |
| 5 | Hand the CA to Phase 2. Do not buy. Do not skip the firewall because the ticker is funny |

## Output of this phase

A feed row, not a trade:

```
keyword / ticker | CA | pair created | source | next = evaluate
```

Cap the feed (default 8). Older than a few hours is not "breaking."

## What this phase must never do

| Forbidden | Instead |
|---|---|
| Invent a tweet, Telegram call, or Google Trends spike | Ticker + listing age from the pool APIs |
| Treat a trending pool as a passed firewall | Hand to Phase 2 |
| Follow a CA onto Solana or any chain other than `56` | BNB Chain only |
