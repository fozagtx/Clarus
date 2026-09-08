# Risk report (RugCheck emulator)

One block per CA. Copy this shape. Do not add slogans.

```
CA: 0x…
Chain: BNB Chain (56)
Pair: <dex> <symbol>/WBNB
Narrative: <ticker / listing age — not a fake tweet>

Mint / owner: DISABLED / FAIL (mintable|hidden_owner|honeypot|pausable|blacklist)
LP lock: NN% LOCKED|BURNED (SAFE ≥95 | FAIL)
Top holder: N.N% (SAFE ≤3.5 | FAIL)
Cluster: CLEAN | SAME-ORIGIN | UNKNOWN→REJECT
Vol/MC: NN% (SAFE ≥80 | FAIL)
$50 clip impact: N.NN% (SAFE ≤2 | FAIL)

VERDICT: PASS | REJECT
Reasons: <gate names that fired>

Payload: <pancakeswap URL or none>
Binance Web3: <bnc:// URL or none>
Clarus does not execute this swap.
```

On REJECT, Payload and Binance Web3 are `none`.

Conviction is **not** a 0–100 vibe score. It is the count of passed gates (0–6). Print `gatesPassed: k/6`.
