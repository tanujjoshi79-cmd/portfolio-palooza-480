import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Shell, Panel } from "@/components/tti/Shell";
import { holdings, inr, watchlist } from "@/lib/market-data";

export const Route = createFileRoute("/markets")({
  head: () => ({
    meta: [
      { title: "Market Charts — TTI" },
      { name: "description", content: "Interactive market chart with candlesticks and basic candlestick-pattern detection for the TTI paper-trading terminal." },
      { property: "og:title", content: "Market Charts — The Trading Institute" },
      { property: "og:description", content: "View price action, candlesticks, timeframes and detected candle patterns." },
    ],
  }),
  component: Markets,
});

type Candle = { open: number; high: number; low: number; close: number };

const timeframes = ["1D", "1W", "1M", "3M", "1Y"] as const;

function makeCandles(base: number, changePct: number, seed: number, points = 32): Candle[] {
  let price = base * (1 - changePct / 100 * 0.45);
  return Array.from({ length: points }, (_, i) => {
    const wave = Math.sin((i + seed) * 0.72) * 0.006 + Math.cos((i + seed) * 0.31) * 0.004;
    const drift = changePct / 100 / points;
    const open = price;
    const close = open * (1 + drift + wave);
    const range = open * (0.004 + Math.abs(Math.sin(i + seed)) * 0.004);
    const high = Math.max(open, close) + range;
    const low = Math.min(open, close) - range * 0.82;
    price = close;
    return { open, high, low, close };
  });
}

function detectPatterns(candles: Candle[]) {
  const last = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  const body = Math.abs(last.close - last.open);
  const range = last.high - last.low || 1;
  const upper = last.high - Math.max(last.open, last.close);
  const lower = Math.min(last.open, last.close) - last.low;
  const patterns: { name: string; signal: "BULLISH" | "BEARISH" | "NEUTRAL"; note: string }[] = [];

  if (body / range < 0.12) patterns.push({ name: "Doji", signal: "NEUTRAL", note: "Open and close are very close — indecision." });
  if (lower > body * 2.2 && upper < body * 1.25) patterns.push({ name: "Hammer", signal: "BULLISH", note: "Long lower wick can signal rejection of lower prices." });
  if (upper > body * 2.2 && lower < body * 1.25) patterns.push({ name: "Shooting Star", signal: "BEARISH", note: "Long upper wick can signal rejection of higher prices." });

  const prevBear = prev.close < prev.open;
  const prevBull = prev.close > prev.open;
  const lastBull = last.close > last.open;
  const lastBear = last.close < last.open;
  if (prevBear && lastBull && last.open <= prev.close && last.close >= prev.open) {
    patterns.push({ name: "Bullish Engulfing", signal: "BULLISH", note: "Current bullish body engulfs the prior bearish body." });
  }
  if (prevBull && lastBear && last.open >= prev.close && last.close <= prev.open) {
    patterns.push({ name: "Bearish Engulfing", signal: "BEARISH", note: "Current bearish body engulfs the prior bullish body." });
  }

  return patterns.length ? patterns : [{ name: "No strong pattern", signal: "NEUTRAL" as const, note: "No common single/two-candle pattern detected." }];
}

function CandleChart({ candles }: { candles: Candle[] }) {
  const width = 900;
  const height = 330;
  const pad = { top: 18, right: 16, bottom: 30, left: 58 };
  const values = candles.flatMap((c) => [c.high, c.low]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const y = (v: number) => pad.top + ((max - v) / (max - min || 1)) * (height - pad.top - pad.bottom);
  const x = (i: number) => pad.left + (i + 0.5) * ((width - pad.left - pad.right) / candles.length);
  const step = (width - pad.left - pad.right) / candles.length;
  const bodyW = Math.max(4, step * 0.52);
  const ticks = Array.from({ length: 5 }, (_, i) => max - ((max - min) * i) / 4);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-black/20">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[330px] w-full" role="img" aria-label="Candlestick price chart">
        {ticks.map((tick, i) => (
          <g key={tick}>
            <line x1={pad.left} x2={width - pad.right} y1={y(tick)} y2={y(tick)} stroke="currentColor" className="text-white/[0.07]" />
            <text x={pad.left - 8} y={y(tick) + 4} textAnchor="end" className="fill-muted-foreground font-mono text-[11px]">{inr(tick, 0)}</text>
          </g>
        ))}
        {candles.map((c, i) => {
          const bullish = c.close >= c.open;
          const color = bullish ? "#22c55e" : "#ef4444";
          const top = y(Math.max(c.open, c.close));
          const bottom = y(Math.min(c.open, c.close));
          return (
            <g key={`${i}-${c.open}`}>
              <line x1={x(i)} x2={x(i)} y1={y(c.high)} y2={y(c.low)} stroke={color} strokeWidth="1.4" />
              <rect x={x(i) - bodyW / 2} y={top} width={bodyW} height={Math.max(2, bottom - top)} rx="1" fill={color} opacity="0.9" />
            </g>
          );
        })}
        <line x1={pad.left} x2={width - pad.right} y1={height - pad.bottom} y2={height - pad.bottom} stroke="currentColor" className="text-white/10" />
      </svg>
    </div>
  );
}

function Markets() {
  const initial = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("symbol") : null;
  const allSymbols = [...holdings.map((h) => h.symbol), ...watchlist.map((w) => w.symbol)];
  const [selectedSymbol, setSelectedSymbol] = useState(initial && allSymbols.includes(initial) ? initial : "TCS");
  const [timeframe, setTimeframe] = useState<(typeof timeframes)[number]>("1D");

  const selectedHolding = holdings.find((h) => h.symbol === selectedSymbol);
  const selectedWatch = watchlist.find((w) => w.symbol === selectedSymbol);
  const stock = selectedHolding ?? {
    symbol: selectedWatch?.symbol ?? "TCS",
    name: selectedWatch?.symbol ?? "Tata Consultancy Services",
    ltp: selectedWatch?.ltp ?? 3402.15,
    changePct: selectedWatch?.changePct ?? 0.86,
  };

  const candles = useMemo(() => makeCandles(stock.ltp, stock.changePct, selectedSymbol.length + timeframe.length * 3), [stock.ltp, stock.changePct, selectedSymbol, timeframe]);
  const patterns = useMemo(() => detectPatterns(candles), [candles]);
  const last = candles[candles.length - 1];
  const previous = candles[candles.length - 2];
  const candleChange = ((last.close - previous.close) / previous.close) * 100;

  const selectStock = (symbol: string) => {
    setSelectedSymbol(symbol);
    window.history.replaceState({}, "", `/markets?symbol=${encodeURIComponent(symbol)}`);
  };

  return (
    <Shell>
      <div className="mb-3 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold tracking-tight">Market Terminal</h1>
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{holdings.length + watchlist.length} instruments</span>
      </div>

      <Panel title="Price Chart" tag="(a)" meta={`${stock.symbol} · NSE`}>
        <div className="px-4 pt-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <select value={selectedSymbol} onChange={(e) => selectStock(e.target.value)} className="rounded-md border border-line bg-black/30 px-2 py-1.5 font-mono text-[12px] outline-none">
                  {allSymbols.map((symbol) => <option key={symbol} value={symbol}>{symbol}</option>)}
                </select>
                <span className="font-mono text-[10px] text-muted-foreground">{stock.name}</span>
              </div>
              <div className="mt-2 flex items-baseline gap-3"><span className="font-mono text-2xl">{inr(stock.ltp)}</span><span className={`font-mono text-[12px] ${stock.changePct >= 0 ? "text-up" : "text-down"}`}>{stock.changePct >= 0 ? "+" : ""}{stock.changePct.toFixed(2)}%</span></div>
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-line p-1">
              {timeframes.map((tf) => <button key={tf} type="button" onClick={() => setTimeframe(tf)} className={`rounded-md px-3 py-1.5 font-mono text-[10px] ${timeframe === tf ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{tf}</button>)}
            </div>
          </div>
          <div className="mt-4"><CandleChart candles={candles} /></div>
          <div className="grid grid-cols-3 gap-2 border-t border-line py-3 text-[10px] font-mono text-muted-foreground">
            <span>OPEN <b className="text-foreground">{inr(last.open)}</b></span>
            <span>HIGH <b className="text-foreground">{inr(last.high)}</b></span>
            <span>LOW <b className="text-foreground">{inr(last.low)}</b></span>
          </div>
        </div>
      </Panel>

      <div className="mt-5 grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-7">
          <Panel title="Candlestick Patterns" tag="(b)" meta="AUTO DETECTION">
            <div className="divide-y divide-line">
              {patterns.map((p) => (
                <div key={p.name} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div><div className="text-[13px] font-medium">{p.name}</div><div className="mt-0.5 font-mono text-[10px] text-muted-foreground">{p.note}</div></div>
                  <span className={`shrink-0 rounded px-2 py-1 font-mono text-[10px] ${p.signal === "BULLISH" ? "bg-up/10 text-up" : p.signal === "BEARISH" ? "bg-down/10 text-down" : "bg-white/10 text-muted-foreground"}`}>{p.signal}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-line px-4 py-3 font-mono text-[10px] text-muted-foreground">Detected from the latest candles. Patterns are educational signals, not trading advice.</div>
          </Panel>
        </div>
        <div className="col-span-12 lg:col-span-5">
          <Panel title="Selected Candle" tag="(c)" meta={timeframe}>
            <div className="space-y-3 px-4 py-4">
              <Row label="Open" value={inr(last.open)} />
              <Row label="High" value={inr(last.high)} />
              <Row label="Low" value={inr(last.low)} />
              <Row label="Close" value={inr(last.close)} />
              <Row label="Candle change" value={`${candleChange >= 0 ? "+" : ""}${candleChange.toFixed(2)}%`} tone={candleChange >= 0 ? "up" : "down"} />
              <div className="border-t border-line pt-3"><div className="font-mono text-[10px] uppercase text-muted-foreground">How to read</div><p className="mt-2 text-[11px] leading-5 text-muted-foreground">Green candles closed above their open; red candles closed below it. The wick shows the high and low reached during the candle.</p></div>
            </div>
          </Panel>
        </div>
      </div>

      <div className="mt-5">
        <Panel title="Listed Companies" tag="(d)" meta="LIVE · NSE / BSE">
          <div className="grid grid-cols-12 border-b border-line px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            <span className="col-span-4">Company</span><span className="col-span-1 text-right">Qty</span><span className="col-span-2 text-right">Avg cost</span><span className="col-span-2 text-right">LTP</span><span className="col-span-2 text-right">P&L</span><span className="col-span-1 text-right">Chg</span>
          </div>
          <div className="divide-y divide-line">
            {holdings.map((h) => {
              const pnl = (h.ltp - h.avg) * h.qty;
              return (
                <button key={h.symbol} type="button" onClick={() => selectStock(h.symbol)} className="grid w-full cursor-pointer grid-cols-12 items-center px-4 py-3 text-left transition-colors hover:bg-white/[0.04] focus:bg-white/[0.06] focus:outline-none" aria-label={`Show chart for ${h.symbol}`}>
                  <span className="col-span-4"><span className="block text-[13px] font-medium">{h.symbol}</span><span className="font-mono text-[10px] text-muted-foreground">{h.name} · {h.sector}</span></span>
                  <span className="col-span-1 text-right font-mono text-[12px]">{h.qty}</span>
                  <span className="col-span-2 text-right font-mono text-[12px] text-muted-foreground">{inr(h.avg)}</span>
                  <span className="col-span-2 text-right font-mono text-[12px]">{inr(h.ltp)}</span>
                  <span className={`col-span-2 text-right font-mono text-[12px] ${pnl >= 0 ? "text-up" : "text-down"}`}>{pnl >= 0 ? "+" : "-"}{inr(Math.abs(pnl), 0)}</span>
                  <span className="col-span-1 text-right"><span className={`inline-block rounded px-2 py-0.5 font-mono text-[11px] ${h.changePct >= 0 ? "bg-up/10 text-up" : "bg-down/10 text-down"}`}>{h.changePct >= 0 ? "+" : ""}{h.changePct.toFixed(2)}%</span></span>
                </button>
              );
            })}
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-6"><Panel title="Market Movers" tag="(e)" meta="TOP GAINERS"><div className="divide-y divide-line">
          {[...holdings, ...watchlist.map((w) => ({ ...w, name: w.symbol }))].sort((a, b) => b.changePct - a.changePct).slice(0, 5).map((m) => (
            <button key={m.symbol} type="button" onClick={() => selectStock(m.symbol)} className="flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-white/[0.04]"><span className="text-[13px] font-medium">{m.symbol}</span><span className={`font-mono text-[12px] ${m.changePct >= 0 ? "text-up" : "text-down"}`}>{m.changePct >= 0 ? "+" : ""}{m.changePct.toFixed(2)}%</span></button>
          ))}
        </div></Panel></div>
        <div className="col-span-12 lg:col-span-6"><Panel title="Watchlist" tag="(f)" meta="MY STOCKS"><div className="divide-y divide-line">
          {watchlist.map((w) => <button key={w.symbol} type="button" onClick={() => selectStock(w.symbol)} className="flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-white/[0.04]"><span className="text-[13px] font-medium">{w.symbol}</span><span className="flex items-center gap-3"><span className="font-mono text-[12px] text-muted-foreground">{inr(w.ltp)}</span><span className={`font-mono text-[12px] ${w.changePct >= 0 ? "text-up" : "text-down"}`}>{w.changePct >= 0 ? "+" : ""}{w.changePct.toFixed(2)}%</span></span></button>)}
        </div></Panel></div>
      </div>
    </Shell>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" }) {
  return <div className="flex items-center justify-between"><span className="font-mono text-[10px] uppercase text-muted-foreground">{label}</span><span className={`font-mono text-[12px] ${tone === "up" ? "text-up" : tone === "down" ? "text-down" : ""}`}>{value}</span></div>;
}
