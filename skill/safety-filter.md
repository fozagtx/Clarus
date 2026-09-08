# Phase 2 — Automated safety filtering (the shield)

> "99% of traders on-chain lose to bundles."

Every CA from Phase 1 is run through **six gates**. First failure **REJECT**. Do not continue "for context."

Live source: **GoPlus** `https://api.gopluslabs.io/api/v1/token_security/56?contract_addresses=<ca>` plus Dexscreener pair stats. Mapping: [resources.md](resources.md).

## Gate 1 — Mint / freeze / owner surface

BSC equivalent of "mint and freeze authority disabled":

| Check | Fail when |
|---|---|
| Mintable | `is_mintable === "1"` |
| Hidden owner | `hidden_owner === "1"` |
| Honeypot | `is_honeypot === "1"` |
| Pausable | `transfer_pausable === "1"` |
| Blacklist | `is_blacklisted === "1"` |

Pass only if none of those fire. If GoPlus is empty or errors, **REJECT** (fail closed).

## Gate 2 — LP lock / burn

Sum GoPlus `lp_holders` where `is_locked === "1"` **or** the holder address is the canonical burn (`0x000…dead` / `0x000…000`). **Pass if ≥ 95%.** Unlocked or unknown LP is a reject.

## Gate 3 — Top holder ≤ 3.5%

Largest **non-AMM** holder (`is_contract !== "1"`) must be **≤ 3.5%** of supply. AMM / pair contracts are excluded from the "top individual" test. If holder list is missing, reject.

## Gate 4 — Fresh wallet / same-origin cluster

Reject when:

| Signal | Fail |
|---|---|
| Same-creator honeypot | `honeypot_with_same_creator === "1"` |
| Shared funding | Two or more top EOA holders share the same `funding_source` / creator cluster |

If the field is absent, do not invent a pass — note `unknown` and still fail closed on this gate unless the rest of the holder set is clearly diversified **and** Gate 3 passed. Default: reject on unknown cluster when holders look synchronized (same tiny %).

## Operator line

Print each gate as `SAFE` or `FAIL` with the number. Example in [risk-report.md](risk-report.md).
