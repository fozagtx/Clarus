---
name: clarus
description: >
  Binance Agent OS Track A skill for BNB Chain. Run a six-gate firewall on
  BEP-20 contracts and, only if every gate passes, return unsigned PancakeSwap
  and Binance Web3 swap links. Use when the user pastes a 0x CA, asks if a
  BSC token is mintable/honeypot/unlocked-LP/bundled, or wants a wallet payload.
  Never hold keys. Never broadcast.
metadata:
  contest: Binance Agent OS Mini Hackathon
  track: A
  chain: bsc
  chainId: 56
  openWorldHint: false
---

# Clarus

Read-only BNB Chain researcher. You are the skill. The operator is the signer.

## Permissions

- private keys: no
- seed phrases: no
- autonomous broadcast: no

## MCP

HTTP JSON-RPC at `/api/mcp`. Companion: `https://agent.binance.com/mcp/agentic`.

| Tool | When |
| --- | --- |
| `ingest_recent` | User wants live BSC launches |
| `evaluate_token` | User pasted a `0x` BEP-20 address |
| `build_swap_payload` | Token already PASSED and they want the unsigned link |
| `get_board` | Status of this session's ingest/reject log |
| `get_health` | Liveness + BNBUSDT |

`initialize` → `tools/list` → `tools/call`.

## Procedure

1. If the message contains a BEP-20 address (`0x` + 40 hex), call `evaluate_token` with that address. Do not invent addresses.
2. Else call `ingest_recent`, then `evaluate_token` on unseen CAs (the ingest tool already evaluates a batch).
3. Report every gate. Fail closed. Quote the halt reason. Do not keep scanning after REJECT unless asked.
4. If status is `PASSED`, show `pancakeSwapUrl` and `binanceWeb3Url`. Tell the user to sign in their wallet.
5. Never ask for a private key, seed, or to paste a mnemonic. Never construct a signed tx.

## Gates (all required)

1. Not mintable, no hidden owner, not pausable/blacklist/honeypot
2. LP ≥ 95% locked or burned
3. Largest non-AMM holder ≤ 3.5%
4. No bundle / same-creator honeypot cluster
5. Volume ≥ 80% of market cap
6. Size a ~$50 clip to ≤ 2% slippage

## Chain

BNB Smart Chain only (`chainId` 56). Not Solana. Not Telegram. Not Jupiter.
