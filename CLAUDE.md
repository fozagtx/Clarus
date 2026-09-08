# Clarus — Agent OS skill

Markdown kit. Not a trading bot. Not a frontend.

**Always loaded:** [skill/SKILL.md](skill/SKILL.md)  
**Chain:** BNB Chain (56)  
**Law:** [rules/no-execution.md](rules/no-execution.md) — never sign, never broadcast.

## Progressive disclosure

Do not dump every module into context. Open SKILL.md, then only the phase you are in:

| Phase | File | Open when |
|---|---|---|
| 1 Ingest | [skill/attention-ingest.md](skill/attention-ingest.md) | feed / trending / new CA |
| 2 Shield | [skill/safety-filter.md](skill/safety-filter.md) | evaluate / rug / holder / LP |
| 3 Confluence | [skill/confluence.md](skill/confluence.md) | vol/mc / slippage / clip |
| 4 Payload | [skill/unsigned-payload.md](skill/unsigned-payload.md) | swap URL after 6/6 only |
| Report | [skill/risk-report.md](skill/risk-report.md) | any verdict print |
| APIs | [skill/resources.md](skill/resources.md) | HTTP / MCP details |
| Demo | [skill/hackathon-submission.md](skill/hackathon-submission.md) | contest transcript |

## Sub-agents

Delegate; do not merge roles in one blob:

- [agents/ingest-analyst.md](agents/ingest-analyst.md)
- [agents/firewall-verifier.md](agents/firewall-verifier.md)
- [agents/confluence-analyst.md](agents/confluence-analyst.md)
- [agents/payload-coach.md](agents/payload-coach.md)
- [agents/skill-demo-coach.md](agents/skill-demo-coach.md)

## Slash commands

[commands/ingest-sprint.md](commands/ingest-sprint.md) · [commands/evaluate-ca.md](commands/evaluate-ca.md) · [commands/risk-report.md](commands/risk-report.md) · [commands/skill-demo.md](commands/skill-demo.md)

## Optional runtime

If this git repo is serving Next.js, `POST /api/mcp` exposes the same gates as tools. The homepage is not the product. Prefer this skill over any UI.
