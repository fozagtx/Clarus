"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AgentHealth, EvaluationResult, PipelineEvent } from "@/lib/engine/types";

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

function fmtUsd(n: number) {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}

function shortCa(ca: string) {
  return `${ca.slice(0, 4)}…${ca.slice(-4)}`;
}

function statusColor(status: string) {
  if (status === "pass" || status === "PASSED") return "text-[#7dffb3]";
  if (status === "fail" || status === "REJECTED") return "text-[#ff5d73]";
  return "text-[#ffb45a]";
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
    <main className="hud-grid min-h-screen px-4 py-5 md:px-8">
      <header className="mx-auto flex max-w-7xl flex-col gap-4 border-b border-[var(--line)] pb-4 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-4">
          <img
            src="/clarus-mark.png"
            alt="Clarus"
            width={72}
            height={72}
            className="h-[72px] w-[72px] rounded-2xl border border-[var(--line)] bg-black object-cover"
          />
          <div>
            <h1 className="font-[var(--font-display)] text-4xl font-extrabold tracking-[0.18em] md:text-5xl">
              CLARUS
            </h1>
            <p className="mt-2 max-w-xl text-sm text-[#8a93a3]">
              Four-layer on-chain firewall. One-click wallet payload.
              Private keys never enter this process.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px]">
          <Stat label="INGEST" value={String(board.health.ingestions)} />
          <Stat label="PASS" value={String(board.health.passed)} accent="#7dffb3" />
          <Stat label="REJECT" value={String(board.health.rejected)} accent="#ff5d73" />
          <Stat label="AVG PIPE" value={`${board.health.avgPipelineMs}ms`} />
          <Stat label="FILTER" value={`${rejectRate}%`} />
        </div>
      </header>

      <div className="mx-auto mt-4 flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <nav className="flex gap-1 rounded-full border border-[var(--line)] p-1">
          {(["radar", "shield", "payload"] as View[]).map((id) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`rounded-full px-4 py-2 text-xs tracking-[0.2em] uppercase ${
                view === id ? "bg-[#7dffb3] text-[#07140c]" : "text-[#8a93a3]"
              }`}
            >
              {id}
            </button>
          ))}
        </nav>
        <div className="flex flex-wrap gap-2">
          <button
            className={`border px-3 py-2 text-xs ${live ? "border-[#7dffb3] text-[#7dffb3]" : "border-[var(--line)] text-[#8a93a3]"}`}
            onClick={() => setLive((v) => !v)}
          >
            {live ? "ROTATION ON" : "RESUME ROTATION"}
          </button>
          <button
            className="border border-[var(--line)] px-3 py-2 text-xs text-[#8a93a3]"
            onClick={() => void run("/api/tick")}
            disabled={!!busy}
          >
            ROTATE ONCE
          </button>
          <button
            className="border border-[var(--line)] px-3 py-2 text-xs text-[#ffb45a]"
            onClick={() => void run("/api/reset")}
          >
            CLEAR LOG
          </button>
        </div>
      </div>

      <form
        className="mx-auto mt-4 flex max-w-7xl gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void run("/api/evaluate", {
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ mint }),
          });
        }}
      >
        <input
          value={mint}
          onChange={(e) => setMint(e.target.value)}
          placeholder="Paste a Solana CA — firewall evaluates in-process, never asks for a key"
          className="flex-1 border border-[var(--line)] bg-transparent px-3 py-3 text-sm outline-none"
        />
        <button className="bg-[#7dffb3] px-4 py-3 text-xs font-semibold tracking-[0.2em] text-[#07140c]">
          SCAN
        </button>
      </form>
      {error ? <p className="mx-auto mt-2 max-w-7xl text-sm text-[#ff5d73]">{error}</p> : null}

      <section className="mx-auto mt-5 grid max-w-7xl gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="panel min-h-[640px] p-5">
          {view === "radar" ? <RadarView events={board.events} results={board.results} /> : null}
          {view === "shield" ? (
            <ShieldView result={latestInspect} onSelect={setSelected} results={board.results} />
          ) : null}
          {view === "payload" ? <PayloadView result={latestPass} /> : null}
        </div>
        <aside className="flex flex-col gap-4">
          <PipelineStrip result={view === "payload" ? latestPass : latestInspect} />
          <EventLog events={board.events} onPick={(e) => e.result && setSelected(e.result)} />
        </aside>
      </section>
    </main>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="border border-[var(--line)] px-3 py-2">
      <div className="text-[10px] tracking-[0.25em] text-[#8a93a3]">{label}</div>
      <div className="text-lg" style={{ color: accent ?? "#e8edf5" }}>
        {value}
      </div>
    </div>
  );
}

function RadarView({ events, results }: { events: PipelineEvent[]; results: EvaluationResult[] }) {
  const ingest = events.filter((e) => e.kind === "ingest").slice(0, 10);
  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] tracking-[0.3em] text-[#8ad4ff]">PHASE 1 · INGESTION ENGINE</p>
          <h2 className="mt-1 font-[var(--font-display)] text-3xl">Attention radar</h2>
        </div>
        <div className="relative h-36 w-36 overflow-hidden rounded-full border border-[var(--line)]">
          <div className="radar-sweep absolute inset-0 rounded-full" />
          <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7dffb3]" />
          <span className="pulse-dot absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7dffb3]" />
        </div>
      </div>
      <p className="mt-3 text-sm text-[#8a93a3]">
        Live rotation across Jupiter recent launches, Dexscreener profiles/boosts, and RugCheck new mints.
        Each CA is enriched from Dexscreener tape, RugCheck LP lock, and Solana RPC authorities/holders.
      </p>
      <div className="mt-5 overflow-hidden border border-[var(--line)]">
        <div className="ticker flex min-w-max gap-8 py-2 text-[11px] tracking-[0.2em] text-[#7dffb3]">
          {[...results, ...results].slice(0, 24).map((r, i) => (
            <span key={`${r.token.contractAddress}-${i}`}>
              {r.token.symbol} {r.status} {shortCa(r.token.contractAddress)}
            </span>
          ))}
          {results.length === 0 ? <span>AWAITING LIVE ROTATION · JUPITER / DEXSCREENER / RUGCHECK</span> : null}
        </div>
      </div>
      <ul className="mt-5 space-y-2">
        {ingest.length === 0 ? (
          <li className="border border-dashed border-[var(--line)] p-4 text-sm text-[#8a93a3]">
            No ingestions yet. Rotation pulls real launches automatically. You can also paste a CA.
          </li>
        ) : (
          ingest.map((e) => (
            <li key={e.id} className="flex items-center justify-between border border-[var(--line)] px-3 py-3">
              <div>
                <div className="text-sm">{e.name}</div>
                <div className="text-[11px] text-[#8a93a3]">{e.detail}</div>
              </div>
              <code className="text-[11px] text-[#8ad4ff]">{shortCa(e.ca)}</code>
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
      <p className="text-[11px] tracking-[0.3em] text-[#ffb45a]">PHASE 2–3 · DEFENSIVE FIREWALL</p>
      <h2 className="mt-1 font-[var(--font-display)] text-3xl">Four-layer shield</h2>
      <p className="mt-2 text-sm text-[#8a93a3]">
        Mint/freeze, LP burn, holder cap ≤3.5%, bundle cluster, then volume/MC ≥ 80% and 2% slippage sizing.
        Any fail terminates the task.
      </p>
      {result ? (
        <div className="mt-5">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-lg">{result.token.name}</div>
              <code className="text-[11px] text-[#8ad4ff]">{result.token.contractAddress}</code>
            </div>
            <div className={`text-sm tracking-[0.2em] ${statusColor(result.status)}`}>{result.status}</div>
          </div>
          <ol className="mt-4 grid gap-2 md:grid-cols-2">
            {result.checks.map((check, idx) => (
              <li key={check.id} className="border border-[var(--line)] p-3">
                <div className="flex items-center justify-between text-[11px] tracking-[0.2em] uppercase">
                  <span>
                    {idx + 1}. {check.label}
                  </span>
                  <span className={statusColor(check.status)}>{check.status}</span>
                </div>
                <p className="mt-2 text-sm text-[#c9d0dc]">{check.detail}</p>
                {check.value ? <p className="mt-1 text-[11px] text-[#8a93a3]">{check.value}</p> : null}
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <p className="mt-8 text-sm text-[#8a93a3]">Inspect a token from the live radar.</p>
      )}
      <div className="mt-6 grid gap-2">
        {results.slice(0, 8).map((r) => (
          <button
            key={r.token.contractAddress + r.elapsedMs}
            onClick={() => onSelect(r)}
            className="flex items-center justify-between border border-[var(--line)] px-3 py-2 text-left text-sm"
          >
            <span>
              {r.token.symbol} · {r.token.name}
            </span>
            <span className={statusColor(r.status)}>{r.status}</span>
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
        <p className="text-[11px] tracking-[0.3em] text-[#7dffb3]">PHASE 4 · USER EXECUTION</p>
        <h2 className="mt-1 font-[var(--font-display)] text-3xl">No clear payload yet</h2>
        <p className="mt-3 max-w-lg text-sm text-[#8a93a3]">
          The agent does not trade. When a token clears every gate, a Jupiter / Binance Web3 deep link appears here
          for FaceID or passcode signing in your wallet app.
        </p>
      </div>
    );
  }

  const { execution: payload, token } = result;
  return (
    <div>
      <p className="text-[11px] tracking-[0.3em] text-[#7dffb3]">PHASE 4 · USER EXECUTION GENERATOR</p>
      <h2 className="mt-1 font-[var(--font-display)] text-3xl">Verified insight</h2>
      <div className="mt-5 border border-[#7dffb3]/40 bg-[#7dffb3]/5 p-5">
        <p className="text-xs tracking-[0.3em] text-[#7dffb3]">ALERT · MANUAL SIGNATURE REQUIRED</p>
        <h3 className="mt-2 font-[var(--font-display)] text-2xl">
          {token.name} <span className="text-[#8a93a3]">${token.symbol}</span>
        </h3>
        <p className="mt-2 break-all text-xs text-[#8ad4ff]">{token.contractAddress}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-[11px] text-[#8a93a3]">Market cap</dt>
            <dd>{fmtUsd(token.marketCap)}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-[#8a93a3]">Volume</dt>
            <dd>{fmtUsd(Math.max(token.volume1h, token.volume24h))}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-[#8a93a3]">Suggested size</dt>
            <dd>${payload.tradeUsd.toFixed(2)}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-[#8a93a3]">Modeled slip</dt>
            <dd>{payload.expectedSlippagePct.toFixed(2)}%</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-[#c9d0dc]">{payload.quoteSummary}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <a
            className="bg-[#7dffb3] px-4 py-3 text-xs font-semibold tracking-[0.16em] text-[#07140c]"
            href={payload.jupiterUrl}
            target="_blank"
            rel="noreferrer"
          >
            OPEN JUPITER WALLET FLOW
          </a>
          <a
            className="border border-[var(--line)] px-4 py-3 text-xs tracking-[0.16em] text-[#8ad4ff]"
            href={payload.binanceWeb3Url}
            target="_blank"
            rel="noreferrer"
          >
            BINANCE WEB3 ROUTER
          </a>
          <a
            className="border border-[var(--line)] px-4 py-3 text-xs tracking-[0.16em] text-[#8a93a3]"
            href={payload.dexscreenerUrl}
            target="_blank"
            rel="noreferrer"
          >
            DEXSCREENER
          </a>
        </div>
        <p className="mt-4 text-[11px] text-[#8a93a3]">
          Deep link only. Signing stays in Phantom, Solflare, or Binance Web3. Clarus cannot see or store keys.
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
    <div className="panel p-4">
      <p className="text-[11px] tracking-[0.3em] text-[#8a93a3]">IF / THEN LOOP</p>
      <ol className="mt-3 space-y-2 text-xs">
        {stages.map((stage, i) => {
          let tone = "text-[#8a93a3]";
          if (result) {
            if (result.status === "PASSED") tone = "text-[#7dffb3]";
            else if (failedAt >= 0 && i > failedAt + 1) tone = "text-[#3d4450]";
            else if (failedAt >= 0 && i === failedAt + 1) tone = "text-[#ff5d73]";
            else tone = "text-[#7dffb3]";
          }
          return (
            <li key={stage} className={`flex justify-between ${tone}`}>
              <span>
                {i + 1}. {stage}
              </span>
              <span>{result ? (tone.includes("ff5d73") ? "HALT" : tone.includes("3d4450") ? "—" : "OK") : "IDLE"}</span>
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
    <div className="panel flex-1 p-4">
      <p className="text-[11px] tracking-[0.3em] text-[#8a93a3]">TERMINAL</p>
      <ul className="mt-3 max-h-[420px] space-y-2 overflow-auto text-[12px]">
        {events.length === 0 ? (
          <li className="text-[#8a93a3]">waiting for workflow events…</li>
        ) : (
          events.map((event) => (
            <li key={event.id}>
              <button onClick={() => onPick(event)} className="w-full text-left">
                <span className="text-[#8ad4ff]">{event.kind.toUpperCase()}</span>{" "}
                <span className="text-[#e8edf5]">{event.name}</span>
                <div className="text-[#8a93a3]">{event.detail}</div>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
