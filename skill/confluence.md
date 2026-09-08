# Phase 3 — Market metrics (the confluence)

Only run after Phase 2 is a full pass. A safe-looking rug with no volume is still a skip.

## Gate 5 — Volume vs market cap

Guide rule: volume should be **higher than market cap**. Clarus contest bar: **24h volume ≥ 80% of market cap**.

```
volMcPct = (volume24hUsd / marketCapUsd) * 100
pass if volMcPct >= 80
```

If volume is below 80% of MC, flag as **artificial / bundled** and **REJECT**. If MC or volume is missing, reject.

## Gate 6 — Slippage / clip size

Do **not** size a wallet. Size a **hypothetical $50 clip** against the **WBNB** pair TVL.

- Pair: token / `0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c` (WBNB) on PancakeSwap.
- Constant-product estimate: impact ≈ `clip / (tvlUsd + clip)`.
- **Pass if estimated impact ≤ 2%.**
- If TVL is too thin, reject. Do not "try a smaller clip" to force a pass unless the operator explicitly asks for a what-if — and that what-if is still not a trade.

Live quote (optional): `https://quote.pancakeswap.finance/order-book-api-v2/quote` with `chainId=56`, `inToken=WBNB`, `outToken=<CA>`, `inAmount=0.02e18` (or USD-equivalent). If the quote fails, fall back to the TVL formula and say which one you used.

## What this phase never does

- Scale a real buy.
- Use quote output to broadcast.
- Pass a token because Vol/MC is "close" (79% is a fail).
