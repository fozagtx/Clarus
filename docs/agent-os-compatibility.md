# Agent OS compatibility

How to get Clarus running inside Binance Agent OS, and what depends on the runtime.

## Skill format

Binance's own skills (`binance-skills-hub`) follow these conventions. Clarus matches them:

| Convention | Requirement | Clarus status |
|---|---|---|
| Frontmatter | `name:` + `description:` + `metadata:` (author, version) | Done in `skill/SKILL.md` |
| HTTP calls | Skill gives the agent exact method, URL, headers, body. Agent executes them | Done, endpoints with `User-Agent: clarus/1.0` |
| Chain supported | Declared chainId | `chainId 56` (BSC) declared in SKILL.md |
| Install | `npx skills add <repo>` or paste raw SKILL.md URL | Both work |

Binance's own skills send a named User-Agent header, e.g. `User-Agent: binance-web3/1.4 (Skill)`. Clarus sends `clarus/1.0` on every API call so providers recognize the skill and don't treat it as anonymous traffic.

## HTTP connectivity

Clarus fetches live data from GoPlus, Dexscreener, and GeckoTerminal. These are third-party APIs, not Binance endpoints. The agent running Clarus must be able to make HTTP GET requests to those domains.

**Verify the agent can fetch:**

1. After loading the skill, run `/evaluate-ca 0x55d398326f99059ff775485246999027b3197955` (USDT on BSC)
2. If the report shows live numbers (mintable, LP lock %, holder %) → the agent can fetch. Clarus works.
3. If the report shows "data not found" or "fetch failed" → the agent runtime does not allow HTTP to external domains. Clarus will reject every token.

## What we know about Agent OS

From Binance's own Skills Hub, their skills use the same pattern: the skill gives the agent an exact curl command (method, URL, headers, body) and the agent executes it. Binance's skills call `web3.binance.com` (their own domain). Clarus calls non-Binance domains. Whether Agent OS allows cross-domain HTTP is untested; we could not find documentation that confirms or denies it.

## If cross-domain fetch is blocked

Options depend on the runtime:

- Configure the agent runtime to allow HTTP fetch (if Agent OS has a permissions setting)
- Proxy through a Binance-owned endpoint
- Bundle a CLI script (like the `meme-rush` skill does with `scripts/cli.mjs`) that runs locally and makes the fetches outside the agent sandbox

## Fail-closed behavior

If the agent cannot fetch, Clarus does not invent numbers. Every gate returns "data not found" and the verdict is REJECT. The skill never produces a payload it cannot back with live data.