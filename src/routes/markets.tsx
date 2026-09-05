import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Shell, Panel } from "@/components/tti/Shell";
import { TechnicalAnalysis } from "@/components/tti/TechnicalAnalysis";
import { holdings, inr, watchlist } from "@/lib/market-data";

export const Route = createFileRoute("/markets")({
  head: () => ({ meta: [
    { title: "Markets — TTI" },
    { name: "description", content: "Market overview, technical analysis, candlesticks, indicators and paper trading." },
  ] }),
  component: Markets,
});

type Candle = { open: number; high: number; low: number; close: number; volume: number; deliveryPct: number };
type IndexQuote = { name: string; value: number; change: number; changePct: number };
const timeframes = ["1D", "1W", "1M", "3M", "1Y"] as const;

const marketIndices: IndexQuote[] = [
  { name: "NIFTY 50", value: 24804.15, change: 104.35, changePct: 0.42 },
  { name: "SENSEX", value: 81240.3, change: -146.8, changePct: -0.18 },
  { name: "BANK NIFTY", value: 52410.9, change: 140.55, changePct: 0.27 },
  { name: "NIFTY IT", value: 41022.6, change: 425.35, changePct: 1.05 },
  { name: "FINNIFTY", value: 23110.4, change: 71.4, changePct: 0.31 },
  { name: "INDIA VIX", value: 13.42, change: -0.29, changePct: -2.1 },
];
const sectors = [["IT", 1.42], ["Banking", 0.78], ["Pharma", 0.56], ["Auto", 0.31], ["FMCG", -0.12], ["Metal", -0.48]] as const;
const marketStats = { advances: 1324, declines: 874, unchanged: 96, week52High: 87, week52Low: 41 };

function makeCandles(base: number, changePct: number, seed: number, points = 40): Candle[] {
  let price = base * (1 - changePct / 100 * 0.45);
  return Array.from({ length: points }, (_, i) => {
    const wave = Math.sin((i + seed) * 0.72) * 0.006 + Math.cos((i + seed) * 0.31) * 0.004;
    const drift = changePct / 100 / points;
    const open = price;
    const close = open * (1 + drift + wave);
    const range = open * (0.004 + Math.abs(Math.sin(i + seed)) * 0.004);
    const high = Math.max(open, close) + range;
    const low = Math.min(open, close) - range * 0.82;
    const volume = Math.round(650000 + (Math.abs(Math.sin(i * 1.7 + seed)) * 850000));
    const deliveryPct = 38 + Math.abs(Math.cos(i * 0.43 + seed)) * 26;
    price = close;
    return { open, high, low, close, volume, deliveryPct };
  });
}

function detectPatterns(candles: Candle[]) {
  const last = candles[candles.length - 1], prev = candles[candles.length - 2];
  const body = Math.abs(last.close - last.open), range = last.high - last.low || 1;
  const upper = last.high - Math.max(last.open, last.close), lower = Math.min(last.open, last.close) - last.low;
  const patterns: { name: string; signal: "BULLISH" | "BEARISH" | "NEUTRAL"; note: string }[] = [];
  if (body / range < 0.12) patterns.push({ name: "Doji", signal: "NEUTRAL", note: "Open and close are very close — indecision." });
  if (lower > body * 2.2 && upper < body * 1.25) patterns.push({ name: "Hammer", signal: "BULLISH", note: "Long lower wick can signal rejection of lower prices." });
  if (upper > body * 2.2 && lower < body * 1.25) patterns.push({ name: "Shooting Star", signal: "BEARISH", note: "Long upper wick can signal rejection of higher prices." });
  if (prev.close < prev.open && last.close > last.open && last.open <= prev.close && last.close >= prev.open) patterns.push({ name: "Bullish Engulfing", signal: "BULLISH", note: "Current bullish body engulfs the prior bearish body." });
  if (prev.close > prev.open && last.close < last.open && last.open >= prev.close && last.close <= prev.open) patterns.push({ name: "Bearish Engulfing", signal: "BEARISH", note: "Current bearish body engulfs the prior bullish body." });
  return patterns.length ? patterns : [{ name: "No strong pattern", signal: "NEUTRAL" as const, note: "No common single/two-candle pattern detected." }];
}

function CandleChart({ candles }: { candles: Candle[] }) {
  const width = 900, height = 330, pad = { top: 18, right: 16, bottom: 30, left: 58 };
  const values = candles.flatMap((c) => [c.high, c.low]), min = Math.min(...values), max = Math.max(...values);
  const y = (v: number) => pad.top + ((max - v) / (max - min || 1)) * (height - pad.top - pad.bottom);
  const x = (i: number) => pad.left + (i + 0.5) * ((width - pad.left - pad.right) / candles.length);
  const step = (width - pad.left - pad.right) / candles.length, bodyW = Math.max(4, step * 0.52);
  const ticks = Array.from({ length: 5 }, (_, i) => max - ((max - min) * i) / 4);
  return <div className="overflow-hidden rounded-xl border border-line bg-black/20"><svg viewBox={`0 0 ${width} ${height}`} className="h-[330px] w-full" role="img" aria-label="Candlestick price chart">
    {ticks.map((tick) => <g key={tick}><line x1={pad.left} x2={width - pad.right} y1={y(tick)} y2={y(tick)} stroke="currentColor" className="text-white/[0.07]" /><text x={pad.left - 8} y={y(tick) + 4} textAnchor="end" className="fill-muted-foreground font-mono text-[11px]">{inr(tick, 0)}</text></g>)}
    {candles.map((c, i) => { const bullish = c.close >= c.open, color = bullish ? "#22c55e" : "#ef4444", top = y(Math.max(c.open, c.close)), bottom = y(Math.min(c.open, c.close)); return <g key={`${i}-${c.open}`}><line x1={x(i)} x2={x(i)} y1={y(c.high)} y2={y(c.low)} stroke={color} strokeWidth="1.4" /><rect x={x(i) - bodyW / 2} y={top} width={bodyW} height={Math.max(2, bottom - top)} rx="1" fill={color} opacity="0.9" /></g>; })}
    <line x1={pad.left} x2={width - pad.right} y1={height - pad.bottom} y2={height - pad.bottom} stroke="currentColor" className="text-white/10" />
  </svg></div>;
}

function MarketOverview() {
  const total = marketStats.advances + marketStats.declines + marketStats.unchanged;
  const items = [...holdings, ...watchlist.map((w) => ({ ...w, name: w.symbol }))];
  const gainers = [...items].sort((a, b) => b.changePct - a.changePct).slice(0, 3);
  const losers = [...items].sort((a, b) => a.changePct - b.changePct).slice(0, 3);
  return <div className="mb-5"><div className="mb-3 flex items-center justify-between"><div><h2 className="font-display text-lg font-bold">Market Overview</h2><p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">India · Equities · NSE / BSE</p></div><span className="rounded-full border border-up/30 bg-up/5 px-2.5 py-1 font-mono text-[10px] text-up">MARKET OPEN</span></div>
    <div className="grid grid-cols-12 gap-3"><div className="col-span-12 xl:col-span-8"><div className="grid grid-cols-2 gap-3 md:grid-cols-3">{marketIndices.map((idx) => <div key={idx.name} className="rounded-xl border border-line bg-black/20 p-3"><div className="flex justify-between font-mono text-[10px] text-muted-foreground"><span>{idx.name}</span><span className={idx.changePct >= 0 ? "text-up" : "text-down"}>●</span></div><div className="mt-2 font-mono text-lg">{idx.value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div><div className={`font-mono text-[11px] ${idx.changePct >= 0 ? "text-up" : "text-down"}`}>{idx.changePct >= 0 ? "+" : ""}{idx.change.toFixed(2)} ({idx.changePct >= 0 ? "+" : ""}{idx.changePct.toFixed(2)}%)</div></div>)}</div></div>
      <div className="col-span-12 xl:col-span-4"><Panel title="Market Breadth" tag="(a)" meta="ALL STOCKS"><div className="px-4 py-3"><div className="font-mono text-2xl">{total}</div><div className="mt-3 flex h-2 overflow-hidden rounded-full bg-white/5"><div className="bg-up" style={{ width: `${marketStats.advances / total * 100}%` }} /><div className="bg-down" style={{ width: `${marketStats.declines / total * 100}%` }} /><div className="bg-white/20" style={{ width: `${marketStats.unchanged / total * 100}%` }} /></div><div className="mt-3 grid grid-cols-3 font-mono text-[10px]"><span className="text-up">ADV {marketStats.advances}</span><span className="text-down">DEC {marketStats.declines}</span><span className="text-muted-foreground">UNCH {marketStats.unchanged}</span></div><div className="mt-3 border-t border-line pt-3 font-mono text-[10px] text-muted-foreground">52W HIGH <b className="text-foreground">{marketStats.week52High}</b> · 52W LOW <b className="text-foreground">{marketStats.week52Low}</b></div></div></Panel></div>
      {[{ title: "Top Gainers", data: gainers, up: true }, { title: "Top Losers", data: losers, up: false }].map((box) => <div key={box.title} className="col-span-12 lg:col-span-4"><Panel title={box.title} tag={box.up ? "(b)" : "(c)"} meta="TODAY"><div className="divide-y divide-line">{box.data.map((s) => <div key={s.symbol} className="flex justify-between px-4 py-2.5"><span className="font-medium text-[12px]">{s.symbol}</span><span className={`font-mono text-[11px] ${box.up ? "text-up" : "text-down"}`}>{s.changePct >= 0 ? "+" : ""}{s.changePct.toFixed(2)}%</span></div>)}</div></Panel></div>)}
      <div className="col-span-12 lg:col-span-4"><Panel title="Sector Performance" tag="(d)" meta="TODAY"><div className="divide-y divide-line">{sectors.map(([sector, change]) => <div key={sector} className="flex justify-between px-4 py-2.5"><span className="text-[12px]">{sector}</span><span className={`font-mono text-[11px] ${change >= 0 ? "text-up" : "text-down"}`}>{change >= 0 ? "+" : ""}{change.toFixed(2)}%</span></div>)}</div></Panel></div>
    </div></div>;
}

function Markets() {
  const initial = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("symbol") : null;
  const allSymbols = [...holdings.map((h) => h.symbol), ...watchlist.map((w) => w.symbol)];
  const [selectedSymbol, setSelectedSymbol] = useState(initial && allSymbols.includes(initial) ? initial : "TCS");
  const [timeframe, setTimeframe] = useState<(typeof timeframes)[number]>("1D");
  const selectedHolding = holdings.find((h) => h.symbol === selectedSymbol), selectedWatch = watchlist.find((w) => w.symbol === selectedSymbol);
  const stock = selectedHolding ?? { symbol: selectedWatch?.symbol ?? "TCS", name: selectedWatch?.symbol ?? "Tata Consultancy Services", ltp: selectedWatch?.ltp ?? 3402.15, changePct: selectedWatch?.changePct ?? 0.86 };
  const candles = useMemo(() => makeCandles(stock.ltp, stock.changePct, selectedSymbol.length + timeframe.length * 3), [stock.ltp, stock.changePct, selectedSymbol, timeframe]);
  const patterns = useMemo(() => detectPatterns(candles), [candles]);
  const last = candles[candles.length - 1], prev = candles[candles.length - 2];
  const candleChange = ((last.close - prev.close) / prev.close) * 100;
  const selectStock = (symbol: string) => { setSelectedSymbol(symbol); window.history.replaceState({}, "", `/markets?symbol=${encodeURIComponent(symbol)}`); };

  return <Shell><div className="mb-3 flex items-center justify-between"><h1 className="font-display text-xl font-bold">Market Terminal</h1><span className="font-mono text-[10px] text-muted-foreground">{allSymbols.length} INSTRUMENTS</span></div>
    <MarketOverview />
    <Panel title="Price Chart" tag="(e)" meta={`${stock.symbol} · NSE`}><div className="px-4 pt-4"><div className="flex flex-wrap items-end justify-between gap-3"><div><select value={selectedSymbol} onChange={(e) => selectStock(e.target.value)} className="rounded-md border border-line bg-black/30 px-2 py-1.5 font-mono text-[12px] outline-none">{allSymbols.map((s) => <option key={s}>{s}</option>)}</select><div className="mt-2 flex items-baseline gap-3"><span className="font-mono text-2xl">{inr(stock.ltp)}</span><span className={`font-mono text-[12px] ${stock.changePct >= 0 ? "text-up" : "text-down"}`}>{stock.changePct >= 0 ? "+" : ""}{stock.changePct.toFixed(2)}%</span></div></div><div className="flex rounded-lg border border-line p-1">{timeframes.map((tf) => <button key={tf} onClick={() => setTimeframe(tf)} className={`rounded px-3 py-1.5 font-mono text-[10px] ${timeframe === tf ? "bg-white/10" : "text-muted-foreground"}`}>{tf}</button>)}</div></div><div className="mt-4"><CandleChart candles={candles} /></div><div className="grid grid-cols-4 gap-2 border-t border-line py-3 font-mono text-[10px] text-muted-foreground"><span>OPEN <b className="text-foreground">{inr(last.open)}</b></span><span>HIGH <b className="text-foreground">{inr(last.high)}</b></span><span>LOW <b className="text-foreground">{inr(last.low)}</b></span><span>CLOSE <b className="text-foreground">{inr(last.close)}</b></span></div></div></Panel>

    <TechnicalAnalysis candles={candles} />

    <div className="mt-5 grid grid-cols-12 gap-5"><div className="col-span-12 lg:col-span-7"><Panel title="Candlestick Patterns" tag="(j)" meta="AUTO DETECTION"><div className="divide-y divide-line">{patterns.map((p) => <div key={p.name} className="flex items-center justify-between px-4 py-3"><div><div className="text-[13px] font-medium">{p.name}</div><div className="font-mono text-[10px] text-muted-foreground">{p.note}</div></div><span className={`rounded px-2 py-1 font-mono text-[10px] ${p.signal === "BULLISH" ? "bg-up/10 text-up" : p.signal === "BEARISH" ? "bg-down/10 text-down" : "bg-white/10 text-muted-foreground"}`}>{p.signal}</span></div>)}</div><div className="border-t border-line px-4 py-3 font-mono text-[10px] text-muted-foreground">Educational signals only — not trading advice.</div></Panel></div><div className="col-span-12 lg:col-span-5"><Panel title="Selected Candle" tag="(k)" meta={timeframe}><div className="space-y-3 px-4 py-4"><Row label="Open" value={inr(last.open)} /><Row label="High" value={inr(last.high)} /><Row label="Low" value={inr(last.low)} /><Row label="Close" value={inr(last.close)} /><Row label="Candle change" value={`${candleChange >= 0 ? "+" : ""}${candleChange.toFixed(2)}%`} tone={candleChange >= 0 ? "up" : "down"} /></div></Panel></div></div>

    <div className="mt-5"><Panel title="Listed Companies" tag="(l)" meta="NSE / BSE"><div className="divide-y divide-line">{holdings.map((h) => <button key={h.symbol} type="button" onClick={() => selectStock(h.symbol)} className="grid w-full grid-cols-12 items-center px-4 py-3 text-left hover:bg-white/[0.04]"><span className="col-span-5"><b className="text-[13px]">{h.symbol}</b><span className="ml-2 font-mono text-[10px] text-muted-foreground">{h.name} · {h.sector}</span></span><span className="col-span-2 text-right font-mono text-[11px]">{inr(h.ltp)}</span><span className={`col-span-2 text-right font-mono text-[11px] ${h.changePct >= 0 ? "text-up" : "text-down"}`}>{h.changePct >= 0 ? "+" : ""}{h.changePct.toFixed(2)}%</span><span className="col-span-1 text-right font-mono text-[11px]">{h.qty}</span><span className="col-span-2 text-right font-mono text-[11px]">{inr((h.ltp - h.avg) * h.qty, 0)}</span></button>)}</div></Panel></div>

    <div className="mt-5 grid grid-cols-12 gap-5"><div className="col-span-12 lg:col-span-6"><Panel title="Market Movers" tag="(m)" meta="TOP MOVERS"><div className="divide-y divide-line">{[...holdings, ...watchlist.map((w) => ({ ...w, name: w.symbol }))].sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct)).slice(0, 5).map((m) => <button key={m.symbol} onClick={() => selectStock(m.symbol)} className="flex w-full justify-between px-4 py-2.5 text-left"><span>{m.symbol}</span><span className={`font-mono text-[11px] ${m.changePct >= 0 ? "text-up" : "text-down"}`}>{m.changePct >= 0 ? "+" : ""}{m.changePct.toFixed(2)}%</span></button>)}</div></Panel></div><div className="col-span-12 lg:col-span-6"><Panel title="Watchlist" tag="(n)" meta="MY STOCKS"><div className="divide-y divide-line">{watchlist.map((w) => <button key={w.symbol} onClick={() => selectStock(w.symbol)} className="flex w-full justify-between px-4 py-2.5 text-left"><span>{w.symbol}</span><span className="font-mono text-[11px]">{inr(w.ltp)} <span className={w.changePct >= 0 ? "text-up" : "text-down"}>({w.changePct >= 0 ? "+" : ""}{w.changePct.toFixed(2)}%)</span></span></button>)}</div></Panel></div></div>
  </Shell>;
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" }) { return <div className="flex justify-between"><span className="font-mono text-[10px] uppercase text-muted-foreground">{label}</span><span className={`font-mono text-[12px] ${tone === "up" ? "text-up" : tone === "down" ? "text-down" : ""}`}>{value}</span></div>; }
