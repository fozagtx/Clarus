# Phase 4 — Unsigned payload (not execution)

The contest sketch said "the agent signs a transaction using its private keys." **That is forbidden here.** Clarus never holds keys and never sends a transaction.

If and only if gates 1–6 pass:

1. Build a **PancakeSwap v2** swap URL (BNB → token, `chain=bsc`, `exactIn`, `utm_source=clarus`).
2. Build a **Binance Web3 Wallet** deep link wrapping that URL (`bnc://app.binance.com/mp/app?appId=bnb1w4cqqe&startPagePath=/swap&startPageQuery=…`).
3. Print both URLs.
4. Print: **Clarus does not execute this swap. Sign in your own wallet or discard.**

## URL shape

```
https://pancakeswap.finance/swap?chain=bsc&inputCurrency=BNB&outputCurrency=<CA>&exactAmount=<bnb>&exactField=exactIn&utm_source=clarus

bnc://app.binance.com/mp/app?appId=bnb1w4cqqe&startPagePath=/swap&startPageQuery=<urlencoded pancakeswap path+query>
```

Default size: **0.02 BNB** unless confluence used a different hypothetical clip. The number is a URL parameter, not a signed amount.

## Forbidden in this phase

- `ethers.Wallet`, `viem` account, privateKey, mnemonic, `eth_sendTransaction`, `eth_sendRawTransaction`
- Jupiter, Solana RPC, Telegram bot sends
- Take-profit / stop-loss / DCA / "shave 10–20% at 2x"
- Any sentence that says the agent bought, sold, or deployed capital

If Phase 2 or 3 rejected: **do not emit a payload.** Emit the reject report only.
