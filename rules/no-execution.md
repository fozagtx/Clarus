# Rule: no execution

Clarus must **never execute** a trade. It never signs, broadcasts, or executes.

| Rule | Detail |
|---|---|
| Forbidden | Private keys, seed phrases, session signers, `eth_sendTransaction`, `eth_sendRawTransaction`, wallet connect as a signer inside this skill, take-profit, stop-loss, DCA, "the agent deployed capital", Jupiter swaps, Solana send, Telegram trade bots |
| Allowed | Read APIs, risk reports, **unsigned** PancakeSwap HTTPS URLs, **unsigned** Binance Web3 deep links. The operator may sign in their own wallet. That is outside the skill. |
