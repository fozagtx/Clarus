# Resources (live HTTP)

All reads. No keys required for the default path. Send `User-Agent: clarus/1.0` on every request so providers recognize the skill.

| Source | URL | Use |
|---|---|---|
| GoPlus token security | `https://api.gopluslabs.io/api/v1/token_security/56?contract_addresses=` | Gates 1–4 |
| Dexscreener token | `https://api.dexscreener.com/tokens/v1/bsc/<ca>` | Price, MC, volume, pair, TVL |
| GeckoTerminal new | `https://api.geckoterminal.com/api/v2/networks/bsc/new_pools?page=1` | Ingest |
| GeckoTerminal trending | `https://api.geckoterminal.com/api/v2/networks/bsc/trending_pools?page=1` | Ingest |
| PancakeSwap quote | `https://quote.pancakeswap.finance/order-book-api-v2/quote` | Optional impact check |
| Binance ticker | `https://data-api.binance.vision/api/v3/ticker/price?symbol=BNBUSDT` | BNB USD (api.binance.com may 451) |

WBNB: `0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c`

## GoPlus mapping (BSC)

```
mintable        ← is_mintable === "1"
hiddenOwner     ← hidden_owner === "1"
honeypot        ← is_honeypot === "1"
pausable        ← transfer_pausable === "1"
blacklist       ← is_blacklisted === "1"
lpLockedPct     ← sum lp_holders percent where is_locked or burn
topHolderPct    ← max holders percent where is_contract !== "1"
sameCreator     ← honeypot_with_same_creator === "1"
```

Fetch these with ordinary HTTP. This kit has no server.

## Banned sources (product path)

Telegram bots, Solana RPC, Jupiter, RugCheck SDK, any mempool sniper.
