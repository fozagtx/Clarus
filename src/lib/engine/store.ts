import type { AgentHealth, EvaluationResult, PipelineEvent } from "./types";

const MAX_EVENTS = 200;
const MAX_RESULTS = 120;

const startedAt = new Date().toISOString();
const seen = new Set<string>();
const events: PipelineEvent[] = [];
const results: EvaluationResult[] = [];
const latencies: number[] = [];

let ingestions = 0;
let passed = 0;
let rejected = 0;
let lastTickMs: number | null = null;

function pushEvent(event: PipelineEvent) {
  events.unshift(event);
  if (events.length > MAX_EVENTS) events.pop();
}

export function hasSeen(ca: string): boolean {
  return seen.has(ca);
}

export function markSeen(ca: string) {
  seen.add(ca);
}

export function recordEvaluation(result: EvaluationResult, ingest: boolean) {
  ingestions += ingest ? 1 : 0;
  lastTickMs = Date.now();
  latencies.push(result.elapsedMs);
  if (latencies.length > 80) latencies.shift();

  results.unshift(result);
  if (results.length > MAX_RESULTS) results.pop();

  if (result.status === "PASSED") {
    passed += 1;
    pushEvent({
      id: `${result.token.contractAddress}-${Date.now()}-pass`,
      at: new Date().toISOString(),
      kind: "pass",
      ca: result.token.contractAddress,
      name: result.token.name,
      detail: result.message ?? "Passed firewall and viability.",
      result,
    });
    pushEvent({
      id: `${result.token.contractAddress}-${Date.now()}-alert`,
      at: new Date().toISOString(),
      kind: "alert",
      ca: result.token.contractAddress,
      name: result.token.name,
      detail: "Execution payload dispatched to dashboard (and Telegram if configured).",
      result,
    });
  } else {
    rejected += 1;
    pushEvent({
      id: `${result.token.contractAddress}-${Date.now()}-rej`,
      at: new Date().toISOString(),
      kind: "reject",
      ca: result.token.contractAddress,
      name: result.token.name,
      detail: result.reason ?? "Rejected",
      result,
    });
  }
}

export function recordIngest(ca: string, name: string, detail: string) {
  pushEvent({
    id: `${ca}-${Date.now()}-ing`,
    at: new Date().toISOString(),
    kind: "ingest",
    ca,
    name,
    detail,
  });
}

export function snapshot() {
  const avg =
    latencies.length === 0
      ? 0
      : Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);

  const health: AgentHealth = {
    ingestions,
    passed,
    rejected,
    lastTickMs,
    avgPipelineMs: avg,
    uptimeStartedAt: startedAt,
  };

  return {
    health,
    events: events.slice(0, 80),
    results: results.slice(0, 60),
    passed: results.filter((r) => r.status === "PASSED").slice(0, 20),
  };
}

export function resetStore() {
  seen.clear();
  events.length = 0;
  results.length = 0;
  latencies.length = 0;
  ingestions = 0;
  passed = 0;
  rejected = 0;
  lastTickMs = null;
}
