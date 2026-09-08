# /evaluate-ca

Usage: `/evaluate-ca 0x…`

| Step | Action |
|---|---|
| 1 | Confirm chain is BSC (56). Reject any non-EVM / Solana mint shape. |
| 2 | Firewall ([safety-filter.md](../skill/safety-filter.md)). Fail closed. |
| 3 | If 4/4 shield gates pass, confluence ([confluence.md](../skill/confluence.md)). |
| 4 | Print the [risk-report.md](../skill/risk-report.md) block. |
| 5 | Payload only on 6/6, unsigned, with the no-execute sentence. |

Live HTTP only. No fixtures.
