# Clarus — Track A submission notes

**Track:** Binance Agent OS Mini Hackathon, Track A (agent + Agent OS).  
**Not Track B:** no autonomous execution, no keys, no broadcast.

## What we built

A **skill kit** in the same shape as [deep-mantle-researcher](https://github.com/fozagtx/deep-mantle-researcher):

```
skill/     SKILL.md + phase modules (progressive disclosure)
agents/    ingest, firewall, confluence, payload, demo
commands/  /ingest-sprint /evaluate-ca /risk-report /skill-demo
rules/     no-execution, firewall-integrity
```

Logic is the contest blueprint (attention → shield → confluence → payload) with the payload **unsigned**.

## Demo prompts

```
/skill-demo
/ingest-sprint
/evaluate-ca 0x<bsc token>
```

Show a live REJECT (common) or a live PASS with unsigned PancakeSwap + Binance Web3 URLs and: **Clarus does not execute this swap.**

Optional MCP: `initialize` → `tools/list` → `tools/call` `evaluate_token`.

## Safety

Not financial advice. Not an offer to buy or sell. Contest: Agent OS apps that execute trades may be geo-restricted — this skill does not execute.
