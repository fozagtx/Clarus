"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AgentHealth, EvaluationResult, PipelineEvent } from "@/lib/engine/types";
import { cn } from "@/lib/cn";
import { Eyebrow, MockupShell, Pill, StatTile } from "@/components/ui/chrome";

type View = "radar" | "shield" | "payload";

interface Board {
  health: AgentHealth;
  events: PipelineEvent[];
  results: EvaluationResult[];
  passed: EvaluationResult[];
}

const EMPTY: Board = {
  health: {
    ingestions: 0,
    passed: 0,
    rejected: 0,
    lastTickMs: null,
    avgPipelineMs: 0,
    uptimeStartedAt: new Date().toISOString(),
  },
  events: [],
  results: [],
  passed: [],
};

const SOURCES = [
  "GeckoTerminal",
  "Dexscreener",
  "GoPlus",
  "PancakeSwap",
  "Binance Web3",
  "Agent OS",
  "BNB Chain",
];

function fmtUsd(n: number) {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

function shortCa(ca: string) {
  return `${ca.slice(0, 6)}…${ca.slice(-4)}`;
}

function statusTone(status: string) {
  if (status === "pass" || status === "PASSED") return "text-pass";
  if (status === "fail" || status === "REJECTED") return "text-destructive";
  return "text-warn";
}

export function Dashboard() {
  const [view, setView] = useState<View>("radar");
  const [board, setBoard] = useState<Board>(EMPTY);
  const [busy, setBusy] = useState<string | null>(null);
  const [mint, setMint] = useState("");
  const [live, setLive] = useState(true);
  const [selected, setSelected] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ticking = useRef(false);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/events", { cache: "no-store" });
    if (!res.ok) return;
    setBoard((await res.json()) as Board);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!live) return;
    let cancelled = false;
    const tick = async () => {
      if (ticking.current) return;
      ticking.current = true;
      try {
        await fetch("/api/tick", { method: "POST" });
        if (!cancelled) await refresh();
      } catch {
        /* keep the HUD alive even if a tick fails */
      } finally {
        ticking.current = false;
      }
    };
    void tick();
    const id = window.setInterval(() => {
      void tick();
    }, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [live, refresh]);

  const run = useCallback(
    async (path: string, init?: RequestInit) => {
      setBusy(path);
      setError(null);
      try {
        const res = await fetch(path, { method: "POST", ...init });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Request failed");
        if (data.token) setSelected(data as EvaluationResult);
        if (Array.isArray(data.processed)) {
          const passed = (data.processed as EvaluationResult[]).find((r) => r.status === "PASSED");
          if (passed) setSelected(passed);
        }
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Request failed");
      } finally {
        setBusy(null);
      }
    },
    [refresh],
  );

  const latestPass = selected?.status === "PASSED" ? selected : board.passed[0] ?? null;
  const latestInspect = selected ?? board.results[0] ?? null;
  const rejectRate = useMemo(() => {
    const total = board.health.passed + board.health.rejected;
    if (!total) return 0;
    return Math.round((board.health.rejected / total) * 100);
  }, [board.health.passed, board.health.rejected]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-50 h-14 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="px-4 sm:px-8 lg:px-[30px]">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/clarus-mark.png"
                alt=""
                width={28}
                height={28}
                className="size-7 rounded-md object-cover"
                priority
              />
              <span className="text-base font-medium tracking-[-0.5px]">Clarus</span>
            </Link>
            <div className="hidden items-center gap-4 lg:flex">
              <nav className="flex items-center gap-1">
                {(["radar", "shield", "payload"] as View[]).map((id) => (
                  <button
                    key={id}
                    onClick={() => setView(id)}
                    className={cn(
                      "h-8 rounded-2xl border px-3 text-sm capitalize transition-colors",
                      view === id
                        ? "border-foreground bg-foreground text-background"
                        : "border-transparent bg-transparent text-muted-foreground hover:border-border hover:bg-muted/60",
                    )}
                  >
                    {id}
                  </button>
                ))}
              </nav>
              <Pill
                className={cn(
                  live
                    ? "bg-foreground text-background"
                    : "border border-border bg-background text-muted-foreground",
                )}
                onClick={() => setLive((v) => !v)}
              >
                {live ? "Rotation on" : "Resume"}
              </Pill>
            </div>
            <div className="flex items-center gap-2 lg:hidden">
              <Pill
                className="bg-foreground text-background"
                onClick={() => setLive((v) => !v)}
              >
                {live ? "Live" : "Paused"}
              </Pill>
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-col bg-background pt-14">
        <section className="relative overflow-hidden px-4 pb-8 pt-16 sm:px-8 sm:pt-20 lg:px-[30px]">
          <div className="relative mx-auto w-full max-w-[1600px]">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-balance text-4xl font-normal leading-[0.98] tracking-[-0.5px] sm:text-5xl md:text-6xl lg:text-[4.75rem]">
                Stop babysitting rugs. Start signing real work.
              </h1>
              <p className="mx-auto mt-6 max-w-4xl text-pretty text-base leading-8 text-muted-foreground sm:mt-7 sm:text-xl">
                Binance Agent OS on BNB Chain. Clarus watches launches, runs a six-gate firewall, and only then
                emits an unsigned PancakeSwap / Binance Web3 payload. Private keys never enter this process.
              </p>
            </div>

            <form
              className="mx-auto mt-8 flex max-w-3xl flex-col gap-2 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                void run("/api/evaluate", {
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({ address: mint, mint }),
                });
              }}
            >
              <input
                value={mint}
                onChange={(e) => setMint(e.target.value)}
                placeholder="Paste a BNB Chain CA (0x…) — firewall evaluates in-process, never asks for a key"
                className="h-12 flex-1 rounded-3xl border border-border bg-card/70 px-4 font-mono text-sm tracking-[0.3px] text-foreground outline-none ring-ring placeholder:text-muted-foreground focus:ring-1"
              />
              <button className="h-12 rounded-2xl bg-foreground px-6 text-sm font-semibold tracking-[-0.5px] text-background hover:opacity-90">
                Scan
              </button>
            </form>
            {error ? <p className="mx-auto mt-3 max-w-3xl text-center text-sm text-destructive">{error}</p> : null}

            <div className="mx-auto mt-8 grid max-w-7xl grid-cols-2 gap-px bg-border sm:grid-cols-5">
              <StatTile label="Ingest" value={String(board.health.ingestions)} />
              <StatTile label="Pass" value={String(board.health.passed)} tone="pass" />
              <StatTile label="Reject" value={String(board.health.rejected)} tone="fail" />
              <StatTile label="Avg pipe" value={`${board.health.avgPipelineMs}ms`} />
              <StatTile label="Filter" value={`${rejectRate}%`} tone="brand" />
            </div>
          </div>
        </section>

        <section className="overflow-hidden bg-background py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="mb-12 text-3xl font-semibold tracking-[-0.5px]">Use the rails you already trust.</h2>
          </div>
          <div className="agent-marquee group relative mx-auto max-w-2xl">
            <div className="agent-marquee__track flex w-max">
              {[0, 1].map((copy) => (
                <ul key={copy} className="flex shrink-0 items-center gap-8 pr-8">
                  {SOURCES.map((name) => (
                    <li
                      key={`${copy}-${name}`}
                      className="font-mono text-sm tracking-[0.5px] text-muted-foreground"
                    >
                      {name}
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </section>

        <section className="relative px-4 py-16 sm:px-8 sm:py-20 lg:px-[30px] lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3 lg:hidden">
              <nav className="flex gap-1 rounded-3xl border border-border p-1">
                {(["radar", "shield", "payload"] as View[]).map((id) => (
                  <button
                    key={id}
                    onClick={() => setView(id)}
                    className={cn(
                      "rounded-2xl px-4 py-2 text-sm capitalize",
                      view === id ? "bg-foreground text-background" : "text-muted-foreground",
                    )}
                  >
                    {id}
                  </button>
                ))}
              </nav>
            </div>
            <div className="mb-6 flex flex-wrap gap-2">
              <Pill
                className="border border-border bg-background text-muted-foreground"
                onClick={() => void run("/api/tick")}
                disabled={!!busy}
              >
                Rotate once
              </Pill>
              <Pill
                className="border border-border bg-transparent text-brand-light"
                onClick={() => void run("/api/reset")}
              >
                Clear log
              </Pill>
            </div>
            <div className="grid items-start gap-8 xl:grid-cols-[1.35fr_0.85fr] xl:gap-16">
              <div className="relative w-full overflow-hidden rounded-[var(--mockup-shell-radius)] sm:min-h-[420px] lg:aspect-[4/3]">
                <div className="scenic absolute inset-0" />
                <div className="absolute inset-0 bg-background/25" />
                <div className="relative z-10 p-4 sm:p-8 lg:flex lg:h-full lg:items-center">
                  <MockupShell title="clarus · bnb chain desk" className="w-full max-w-[620px] mx-auto">
                    {view === "radar" ? <RadarView events={board.events} results={board.results} /> : null}
                    {view === "shield" ? (
                      <ShieldView result={latestInspect} onSelect={setSelected} results={board.results} />
                    ) : null}
                    {view === "payload" ? <PayloadView result={latestPass} /> : null}
                  </MockupShell>
                </div>
              </div>
              <aside className="space-y-6">
                <PipelineStrip result={view === "payload" ? latestPass : latestInspect} />
                <EventLog events={board.events} onPick={(e) => e.result && setSelected(e.result)} />
              </aside>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function RadarView({ events, results }: { events: PipelineEvent[]; results: EvaluationResult[] }) {
  const ingest = events.filter((e) => e.kind === "ingest").slice(0, 8);
  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <Eyebrow>Delegation</Eyebrow>
          <h2 className="text-balance text-2xl font-medium tracking-[-0.5px] sm:text-3xl lg:text-4xl">
            Attention radar
          </h2>
          <p className="max-w-[500px] text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Live rotation across GeckoTerminal BSC pools and Dexscreener profiles. GoPlus scores mint, honeypot, LP lock,
            and holders before anything reaches a wallet.
          </p>
        </div>
        <div className="relative hidden h-24 w-24 overflow-hidden rounded-full border border-border sm:block">
          <div className="radar-sweep absolute inset-0 rounded-full" />
          <div className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand" />
          <span className="pulse-dot absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand" />
        </div>
      </div>
      <div className="agent-marquee mt-5 overflow-hidden border-y border-border">
        <div className="agent-marquee__track flex w-max gap-8 py-2 font-mono text-[11px] tracking-[0.5px] text-brand-light">
          {(results.length ? [...results, ...results] : [{ token: { symbol: "WAIT", contractAddress: "0x" }, status: "IDLE" }]).slice(0, 24).map((r, i) => (
            <span key={`${r.token.contractAddress}-${i}`}>
              {r.token.symbol} {r.status} {shortCa(r.token.contractAddress)}
            </span>
          ))}
        </div>
      </div>
      <ul className="mt-4 space-y-2">
        {ingest.length === 0 ? (
          <li className="border border-dashed border-border p-4 text-sm text-muted-foreground">
            No ingestions yet. Rotation pulls real launches automatically. You can also paste a CA.
          </li>
        ) : (
          ingest.map((e) => (
            <li key={e.id} className="glass-quiet flex items-center justify-between px-3 py-3">
              <div>
                <div className="text-sm">{e.name}</div>
                <div className="font-mono text-[11px] text-muted-foreground">{e.detail}</div>
              </div>
              <code className="font-mono text-[11px] text-brand-light">{shortCa(e.ca)}</code>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function ShieldView({
  result,
  results,
  onSelect,
}: {
  result: EvaluationResult | null;
  results: EvaluationResult[];
  onSelect: (r: EvaluationResult) => void;
}) {
  return (
    <div>
      <Eyebrow>Visibility</Eyebrow>
      <h2 className="mt-3 text-balance text-2xl font-medium tracking-[-0.5px] sm:text-3xl lg:text-4xl">
        Four-layer shield
      </h2>
      <p className="mt-3 max-w-[500px] text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
        Mint/freeze, LP burn, holder cap ≤3.5%, bundle cluster, then volume/MC ≥ 80% and 2% slippage sizing. Any fail
        terminates the task.
      </p>
      {result ? (
        <div className="mt-5">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <div className="text-lg font-medium">{result.token.name}</div>
              <code className="break-all font-mono text-[11px] text-muted-foreground">{result.token.contractAddress}</code>
            </div>
            <div className={cn("font-mono text-sm tracking-[0.4px]", statusTone(result.status))}>{result.status}</div>
          </div>
          <ol className="mt-4 grid gap-px bg-border md:grid-cols-2">
            {result.checks.map((check, idx) => (
              <li key={check.id} className="bg-card p-3">
                <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.4px]">
                  <span>
                    {idx + 1}. {check.label}
                  </span>
                  <span className={statusTone(check.status)}>{check.status}</span>
                </div>
                <p className="mt-2 text-sm text-foreground/90">{check.detail}</p>
                {check.value ? <p className="mt-1 font-mono text-[11px] text-muted-foreground">{check.value}</p> : null}
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <p className="mt-8 text-sm text-muted-foreground">Inspect a token from the live radar.</p>
      )}
      <div className="mt-6 grid gap-2">
        {results.slice(0, 6).map((r) => (
          <button
            key={r.token.contractAddress + r.elapsedMs}
            onClick={() => onSelect(r)}
            className="flex items-center justify-between border border-border bg-background/40 px-3 py-2 text-left text-sm transition-colors hover:bg-muted/60"
          >
            <span>
              {r.token.symbol} · {r.token.name}
            </span>
            <span className={cn("font-mono text-xs", statusTone(r.status))}>{r.status}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function PayloadView({ result }: { result: EvaluationResult | null }) {
  if (!result || result.status !== "PASSED" || !result.execution) {
    return (
      <div>
        <Eyebrow>Coverage</Eyebrow>
        <h2 className="mt-3 text-balance text-2xl font-medium tracking-[-0.5px] sm:text-3xl lg:text-4xl">
          No clear payload yet
        </h2>
        <p className="mt-3 max-w-[500px] text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          The agent does not trade. When a token clears every gate, a PancakeSwap / Binance Web3 deep link appears here
          for FaceID or passcode signing in your wallet app.
        </p>
      </div>
    );
  }

  const { execution: payload, token } = result;
  return (
    <div>
      <Eyebrow>Coverage</Eyebrow>
      <h2 className="mt-3 text-balance text-2xl font-medium tracking-[-0.5px] sm:text-3xl">Verified insight</h2>
      <div className="mt-5 border border-brand/40 bg-brand/10 p-5">
        <p className="font-mono text-xs tracking-[0.4px] text-brand-light">Alert · manual signature required</p>
        <h3 className="mt-2 text-2xl font-medium tracking-[-0.5px]">
          {token.name} <span className="text-muted-foreground">${token.symbol}</span>
        </h3>
        <p className="mt-2 break-all font-mono text-xs text-muted-foreground">{token.contractAddress}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="font-mono text-[11px] text-muted-foreground">Market cap</dt>
            <dd>{fmtUsd(token.marketCap)}</dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] text-muted-foreground">Volume</dt>
            <dd>{fmtUsd(Math.max(token.volume1h, token.volume24h))}</dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] text-muted-foreground">Suggested size</dt>
            <dd>${payload.tradeUsd.toFixed(2)}</dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] text-muted-foreground">Modeled slip</dt>
            <dd>{payload.expectedSlippagePct.toFixed(2)}%</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-foreground/90">{payload.quoteSummary}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <a
            className="rounded-2xl bg-foreground px-4 py-3 text-xs font-semibold tracking-[-0.5px] text-background hover:opacity-90"
            href={payload.pancakeSwapUrl}
            target="_blank"
            rel="noreferrer"
          >
            Open PancakeSwap
          </a>
          <a
            className="rounded-3xl border border-border bg-background px-4 py-3 text-xs tracking-[-0.5px] text-foreground hover:bg-muted/60"
            href={payload.binanceWeb3Url}
            target="_blank"
            rel="noreferrer"
          >
            Binance Web3
          </a>
          <a
            className="rounded-3xl border border-border px-4 py-3 text-xs tracking-[-0.5px] text-muted-foreground hover:bg-muted/60"
            href={payload.dexscreenerUrl}
            target="_blank"
            rel="noreferrer"
          >
            Dexscreener
          </a>
        </div>
        <p className="mt-4 font-mono text-[11px] text-muted-foreground">
          Deep link only. Signing stays in Binance Web3 or your BNB Chain wallet.
        </p>
      </div>
    </div>
  );
}

function PipelineStrip({ result }: { result: EvaluationResult | null }) {
  const stages = [
    "Ingest",
    "Mint/Freeze",
    "LP lock",
    "Holders",
    "Bundles",
    "Vol/MC",
    "Slippage",
    "Payload",
  ];
  const failedAt = result?.checks.findIndex((c) => c.status === "fail") ?? -1;
  return (
    <div className="glass p-5">
      <Eyebrow>Feedback loop</Eyebrow>
      <ol className="mt-4 space-y-3">
        {stages.map((stage, i) => {
          let tone = "text-muted-foreground";
          let mark = "Idle";
          if (result) {
            if (result.status === "PASSED") {
              tone = "text-pass";
              mark = "Ok";
            } else if (failedAt >= 0 && i > failedAt + 1) {
              tone = "text-muted-foreground/40";
              mark = "—";
            } else if (failedAt >= 0 && i === failedAt + 1) {
              tone = "text-destructive";
              mark = "Halt";
            } else {
              tone = "text-pass";
              mark = "Ok";
            }
          }
          return (
            <li key={stage} className={cn("flex items-center justify-between text-sm", tone)}>
              <span className="flex items-center gap-3">
                <span
                  className={cn(
                    "grid size-6 place-items-center rounded-full border text-[10px] font-mono",
                    mark === "Halt"
                      ? "border-destructive"
                      : mark === "Ok"
                        ? "border-pass"
                        : "border-border",
                  )}
                >
                  {i + 1}
                </span>
                {stage}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.4px]">{mark}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function EventLog({
  events,
  onPick,
}: {
  events: PipelineEvent[];
  onPick: (event: PipelineEvent) => void;
}) {
  return (
    <div className="glass flex-1 p-5">
      <Eyebrow>In the wild</Eyebrow>
      <ul className="mt-4 max-h-[420px] space-y-px overflow-auto bg-border">
        {events.length === 0 ? (
          <li className="bg-card p-4 text-sm text-muted-foreground">waiting for workflow events…</li>
        ) : (
          events.slice(0, 40).map((event) => (
            <li key={event.id} className="bg-card">
              <button
                onClick={() => onPick(event)}
                className="w-full p-3 text-left transition-colors hover:bg-muted/60"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.4px] text-brand-light">
                  {event.kind}
                </span>{" "}
                <span className="text-sm">{event.name}</span>
                <div className="text-sm text-muted-foreground">{event.detail}</div>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
