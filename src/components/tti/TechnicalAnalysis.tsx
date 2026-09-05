import { useMemo } from "react";
import { Panel } from "@/components/tti/Shell";

export type TechnicalCandle = { open: number; high: number; low: number; close: number; volume: number; deliveryPct: number };

function sma(data: number[], period: number) {
  if (data.length < period) return data.reduce((a, b) => a + b, 0) / Math.max(1, data.length);
  return data.slice(-period).reduce((a, b) => a + b, 0) / period;
}

function ema(data: number[], period: number) {
  if (!data.length) return 0;
  const k = 2 / (period + 1);
  let value = data[0];
  for (let i = 1; i < data.length; i++) value = data[i] * k + value * (1 - k);
  return value;
}

function rsi(data: number[], period = 14) {
  if (data.length < 2) return 50;
  const changes = data.slice(1).map((v, i) => v - data[i]);
  const recent = changes.slice(-period);
  const gains = recent.filter((v) => v > 0).reduce((a, b) => a + b, 0) / Math.max(1, recent.length);
  const losses = Math.abs(recent.filter((v) => v < 0).reduce((a, b) => a + b, 0)) / Math.max(1, recent.length);
  if (!losses) return 70;
  return 100 - 100 / (1 + gains / losses);
}

function macd(data: number[]) {
  return ema(data, 12) - ema(data, 26);
}

function fmt(v: number) { return `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`; }

export function TechnicalAnalysis({ candles }: { candles: TechnicalCandle[] }) {
  const analysis = useMemo(() => {
    const closes = candles.map((c) => c.close);
    const volumes = candles.map((c) => c.volume);
    const last = candles[candles.length - 1];
    const previous = candles[candles.length - 2] ?? last;
    const sma20 = sma(closes, 20);
    const sma50 = sma(closes, 50);
    const ema20 = ema(closes, 20);
    const ema50 = ema(closes, 50);
    const rsi14 = rsi(closes, 14);
    const macdValue = macd(closes);
    const avgVolume = sma(volumes, 20);
    const volumeRatio = avgVolume ? last.volume / avgVolume : 1;
    const pivot = (last.high + last.low + last.close) / 3;
    const r1 = 2 * pivot - last.low;
    const s1 = 2 * pivot - last.high;
    const r2 = pivot + (last.high - last.low);
    const s2 = pivot - (last.high - last.low);
    const trendScore = [last.close > sma20, last.close > sma50, last.close > ema20, last.close > ema50, rsi14 >= 50, macdValue >= 0].filter(Boolean).length;
    const summary = trendScore >= 5 ? "Strong Bullish" : trendScore >= 4 ? "Bullish" : trendScore <= 1 ? "Bearish" : trendScore <= 2 ? "Weak Bearish" : "Neutral";
    const delivery = last.deliveryPct;
    return { last, previous, sma20, sma50, ema20, ema50, rsi14, macdValue, volumeRatio, pivot, r1, s1, r2, s2, summary, delivery };
  }, [candles]);

  const tone = analysis.summary.includes("Bullish") ? "text-up" : analysis.summary.includes("Bearish") ? "text-down" : "text-muted-foreground";
  const metric = (label: string, value: string, extra?: string) => <div className="rounded-lg border border-line bg-black/10 p-3"><div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div><div className="mt-1 font-mono text-[13px]">{value}</div>{extra && <div className="mt-1 font-mono text-[9px] text-muted-foreground">{extra}</div>}</div>;

  return <div className="mt-5">
    <Panel title="Technical Analysis" tag="(i)" meta="CALCULATED">
      <div className="px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div><div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Technical summary</div><div className={`mt-1 font-display text-xl font-bold ${tone}`}>{analysis.summary}</div></div>
          <div className="rounded-lg border border-line px-3 py-2"><div className="font-mono text-[9px] text-muted-foreground">RSI (14)</div><div className={`font-mono text-lg ${analysis.rsi14 >= 70 ? "text-down" : analysis.rsi14 <= 30 ? "text-up" : ""}`}>{analysis.rsi14.toFixed(1)}</div></div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          {metric("SMA 20", fmt(analysis.sma20), analysis.last.close > analysis.sma20 ? "Price above" : "Price below")}
          {metric("SMA 50", fmt(analysis.sma50), analysis.last.close > analysis.sma50 ? "Price above" : "Price below")}
          {metric("EMA 20", fmt(analysis.ema20), analysis.last.close > analysis.ema20 ? "Price above" : "Price below")}
          {metric("EMA 50", fmt(analysis.ema50), analysis.last.close > analysis.ema50 ? "Price above" : "Price below")}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
          {metric("RSI (14)", analysis.rsi14.toFixed(1), analysis.rsi14 > 70 ? "Overbought" : analysis.rsi14 < 30 ? "Oversold" : "Neutral zone")}
          {metric("MACD", analysis.macdValue.toFixed(2), analysis.macdValue >= 0 ? "Positive" : "Negative")}
          {metric("Volume", `${(analysis.volumeRatio * 100).toFixed(0)}%`, analysis.volumeRatio >= 1 ? "Above 20-period avg" : "Below 20-period avg")}
          {metric("Delivery", `${analysis.delivery.toFixed(1)}%`, "Delivery / traded quantity")}
        </div>

        <div className="mt-4 rounded-lg border border-line bg-black/10 p-3">
          <div className="mb-3 flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Pivot points</span><span className="font-mono text-[9px] text-muted-foreground">Classic</span></div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-5">{metric("S2", fmt(analysis.s2))}{metric("S1", fmt(analysis.s1))}{metric("Pivot", fmt(analysis.pivot))}{metric("R1", fmt(analysis.r1))}{metric("R2", fmt(analysis.r2))}</div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-line p-3"><div className="font-mono text-[9px] uppercase text-muted-foreground">Oscillators</div><div className="mt-2 space-y-2 font-mono text-[10px]"><div className="flex justify-between"><span>RSI 14</span><span className={analysis.rsi14 >= 50 ? "text-up" : "text-down"}>{analysis.rsi14.toFixed(1)}</span></div><div className="flex justify-between"><span>MACD</span><span className={analysis.macdValue >= 0 ? "text-up" : "text-down"}>{analysis.macdValue.toFixed(2)}</span></div></div></div>
          <div className="rounded-lg border border-line p-3"><div className="font-mono text-[9px] uppercase text-muted-foreground">Volume & delivery</div><div className="mt-2 space-y-2 font-mono text-[10px]"><div className="flex justify-between"><span>Current volume</span><span>{analysis.last.volume.toLocaleString("en-IN")}</span></div><div className="flex justify-between"><span>Delivery</span><span>{analysis.delivery.toFixed(1)}%</span></div></div></div>
        </div>
        <div className="mt-3 font-mono text-[9px] leading-4 text-muted-foreground">Technical indicators are calculated from the candles currently available in the terminal. Delivery is indicative/demo until connected to an exchange data feed.</div>
      </div>
    </Panel>
  </div>;
}
