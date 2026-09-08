#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

required_files=(
  ".gitignore"
  "ARTICLE.md"
  "README.md"
  "LICENSE"
  "CLAUDE.md"
  "SUBMISSION.md"
  "install.sh"
  "install-custom.sh"
  "skill/SKILL.md"
  "skill/attention-ingest.md"
  "skill/safety-filter.md"
  "skill/confluence.md"
  "skill/unsigned-payload.md"
  "skill/risk-report.md"
  "skill/hackathon-submission.md"
  "skill/resources.md"
  "agents/ingest-analyst.md"
  "agents/firewall-verifier.md"
  "agents/confluence-analyst.md"
  "agents/payload-coach.md"
  "agents/skill-demo-coach.md"
  "commands/ingest-sprint.md"
  "commands/evaluate-ca.md"
  "commands/risk-report.md"
  "commands/skill-demo.md"
  "rules/no-execution.md"
  "rules/firewall-integrity.md"
  "tests/validate_structure.sh"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "$ROOT_DIR/$file" ]]; then
    echo "Missing required file: $file" >&2
    exit 1
  fi
done

if ! grep -q '^name: clarus$' "$ROOT_DIR/skill/SKILL.md"; then
  echo "Missing skill name frontmatter." >&2
  exit 1
fi

if ! grep -q '^description: .*Use when ' "$ROOT_DIR/skill/SKILL.md"; then
  echo "Missing actionable description frontmatter." >&2
  exit 1
fi

for linked in attention-ingest.md safety-filter.md confluence.md unsigned-payload.md risk-report.md hackathon-submission.md resources.md; do
  if ! grep -q "$linked" "$ROOT_DIR/skill/SKILL.md"; then
    echo "SKILL.md does not link $linked" >&2
    exit 1
  fi
done

if ! grep -qi 'never execute' "$ROOT_DIR/rules/no-execution.md"; then
  echo "no-execution.md must forbid trade execution." >&2
  exit 1
fi

if grep -R -n --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=.next \
  -E 'eth_sendRawTransaction|privateKey|take-profit|jupiter|solana rpc' \
  "$ROOT_DIR/skill" "$ROOT_DIR/agents" "$ROOT_DIR/commands" "$ROOT_DIR/rules" \
  >/tmp/clarus_exec_hygiene.txt; then
  # Mentions in "forbidden" lists are required. Fail only if a file instructs sending a tx.
  if grep -E 'you (will|must|should) (sign|broadcast|send) (the |a )?(swap|transaction)' \
    /tmp/clarus_exec_hygiene.txt; then
    cat /tmp/clarus_exec_hygiene.txt >&2
    echo "Execution-instruction hygiene check failed." >&2
    exit 1
  fi
fi

bash -n "$ROOT_DIR/install.sh"
bash -n "$ROOT_DIR/install-custom.sh"
bash -n "$ROOT_DIR/tests/validate_structure.sh"

blocked_terms=(
  "$(printf "%s%s" "Co" "dex")"
  "$(printf "%s%s" "Anth" "ropic")"
  "$(printf "%s%s%s" "Co-Authored-" "By:" " ")"
  "$(printf "%s%s" "noreply@" "anthropic.com")"
)

for term in "${blocked_terms[@]}"; do
  if grep -R -n --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=.next -- "$term" "$ROOT_DIR" >/tmp/clarus_hygiene.txt; then
    cat /tmp/clarus_hygiene.txt >&2
    echo "Attribution hygiene check failed." >&2
    exit 1
  fi
done

echo "Structure validation passed."
