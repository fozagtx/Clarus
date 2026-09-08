# Example — REJECT (typical)

```
CA: 0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
Chain: BNB Chain (56)
Pair: pancakeswap WXYZ/WBNB
Narrative: WXYZ · listed ~12m · geckoterminal new_pools

Mint / owner: FAIL (is_mintable=1)
LP lock: 12% (FAIL <95)
Top holder: 18.4% (FAIL >3.5)
Cluster: SAME-ORIGIN (honeypot_with_same_creator=1)
Vol/MC: 22% (FAIL <80)
$50 clip impact: skipped (already rejected)

VERDICT: REJECT
gatesPassed: 0/6
Reasons: mintable, lp_unlocked, holder_concentration, same_origin_cluster, vol_mc

Payload: none
Binance Web3: none
Clarus does not execute this swap.
```
