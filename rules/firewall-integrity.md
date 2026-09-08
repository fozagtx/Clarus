# Rule: firewall integrity

Gates are binary. First fail = REJECT. Do not skip, average, or "override for alpha."

Required bars:

| Gate | Pass bar |
|---|---|
| 1 Mint / owner | Not mintable, no hidden owner, not honeypot, not pausable, not blacklist |
| 2 LP | Locked/burned ≥ 95% |
| 3 Top holder | Largest non-AMM holder ≤ 3.5% |
| 4 Cluster | No same-origin / same-creator honeypot cluster |
| 5 Vol/MC | 24h volume ≥ 80% of market cap |
| 6 Clip | Hypothetical $50 clip impact ≤ 2% on WBNB pair |

Missing data = fail closed. Invented data = forbidden.
