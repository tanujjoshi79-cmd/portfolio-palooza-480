import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shell, Panel } from "@/components/tti/Shell";
import { LiveOrderButton } from "@/components/tti/LiveOrderButton";
import { holdings, inr, portfolioStats, watchlist } from "@/lib/market-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TTI Dashboard — The Trading Institute" },
      { name: "description", content: "Track your portfolio, holdings, live NSE/BSE indices and place buy or sell orders on the TTI trading dashboard." },
      { property: "og:title", content: "TTI Dashboard — The Trading Institute" },
      { property: "og:description", content: "Portfolio value, day P&L, holdings and a live order ticket in one terminal." },
    ],
  }),
  component: Dashboard,
});

const chartPath = "M0,70 L25,64 L50,68 L75,52 L100,58 L125,44 L150,50 L175,34 L200,40 L225,26 L250,32 L275,18 L300,22";

function Dashboard() {
  const s = portfolioStats();
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [qty, setQty] = useState(50);
  const stock = holdings[1]!;

  return (
    <Shell>
      <div className="grid grid-cols-12 gap-5">
        <section className="col-span-12 lg:col-span-8">
          <div className="mb-3 flex items-center justify-between">
            <h1 className="font-display text-xl font-bold tracking-tight">Portfolio Overview</h1>
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">as of 15:28 IST</span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Total Value" value={inr(s.current, 0)} sub={`across ${holdings.length} holdings`} />
            <Stat label="Day P&L" value={`+${inr(s.dayPnl, 0)}`} sub={`+${s.dayPct.toFixed(2)}% today`} tone="up" />
            <Stat label="Total Invested" value={inr(s.invested, 0)} sub="avg cost basis" />
            <Stat label="Overall P&L" value={`+${inr(s.pnl, 0)}`} sub={`+${s.pnlPct.toFixed(2)}% all-time`} tone="up" />
          </div>

          <div className="mt-5">
            <Panel title="Holdings" tag="(a)" meta="LIVE · NSE">
              <div className="grid grid-cols-12 border-b border-line px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                <span className="col-span-4">Instrument</span><span className="col-span-2 text-right">Qty</span><span className="col-span-3 text-right">LTP</span><span className="col-span-3 text-right">Change</span>
              </div>
              <div className="divide-y divide-line">
                {holdings.map((h, i) => (
                  <div key={h.symbol} className={`grid cursor-pointer grid-cols-12 items-center px-4 py-2.5 transition-colors hover:bg-white/[0.04] ${i === 1 ? "flash-up" : i === 3 ? "flash-down" : ""}`}>
                    <span className="col-span-4"><span className="font-medium">{h.symbol}</span><span className="ml-1 font-mono text-[10px] text-muted-foreground">{h.sector}</span></span>
                    <span className="col-span-2 text-right font-mono text-[12px]">{h.qty}</span>
                    <span className="col-span-3 text-right font-mono text-[12px]">{inr(h.ltp)}</span>
                    <span className="col-span-3 text-right"><span className={`inline-block rounded px-2 py-0.5 font-mono text-[11px] ${h.changePct >= 0 ? "bg-up/10 text-up" : "bg-down/10 text-down"}`}>{h.changePct >= 0 ? "+" : ""}{h.changePct.toFixed(2)}%</span></span>
                  </div>
                ))}
              </div>
              <div className="border-t border-line px-4 py-2.5"><Link to="/markets" className="font-mono text-[10px] uppercase tracking-[0.15em] text-accent hover:underline">View all portfolio companies →</Link></div>
            </Panel>
          </div>
        </section>

        <aside className="col-span-12 space-y-5 lg:col-span-4">
          <Panel title="Stock Detail" tag="(b)" meta={`${stock.symbol} · NSE`}>
            <div className="px-4 pt-4">
              <div className="flex items-end justify-between">
                <div><div className="font-display text-lg font-bold tracking-tight">{stock.symbol}</div><div className="font-mono text-[10px] text-muted-foreground">{stock.name}</div></div>
                <div className="text-right"><div className="font-mono text-xl font-medium tracking-tight">{inr(stock.ltp)}</div><div className="font-mono text-[11px] text-up">+₹28.90 · +{stock.changePct.toFixed(2)}%</div></div>
              </div>
              <svg viewBox="0 0 300 90" preserveAspectRatio="none" className="mt-3 h-[90px] w-full">
                <defs><linearGradient id="ttiArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="currentColor" stopOpacity="0.28" className="text-up" /><stop offset="100%" stopColor="currentColor" stopOpacity="0" className="text-up" /></linearGradient></defs>
                <path className="chart-area" d={`${chartPath} L300,90 L0,90 Z`} fill="url(#ttiArea)" />
                <path className="chart-line text-up" pathLength={100} d={chartPath} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
              <div className="mt-1 flex justify-between pb-4 font-mono text-[9px] text-muted-foreground"><span>09:15</span><span>11:00</span><span>12:45</span><span>14:30</span><span>15:30</span></div>
            </div>
          </Panel>

          <div className="overflow-hidden rounded-xl border border-line bg-white/[0.03] backdrop-blur-md">
            <div className="flex items-center gap-1 p-1.5">
              {(["BUY", "SELL"] as const).map((s2) => <button key={s2} onClick={() => setSide(s2)} className={`flex-1 rounded-lg py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors ${side === s2 ? s2 === "BUY" ? "bg-up/15 text-up" : "bg-down/15 text-down" : "text-muted-foreground hover:text-foreground/80"}`}>{s2}</button>)}
            </div>
            <div className="space-y-3 p-4">
              <Row label="Order type" value="Market" />
              <div className="flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Quantity</span><div className="flex items-center gap-2"><button onClick={() => setQty((q) => Math.max(1, q - 5))} className="grid size-6 place-items-center rounded-md border border-line font-mono text-sm">-</button><span className="w-8 text-center font-mono text-[13px]">{qty}</span><button onClick={() => setQty((q) => q + 5)} className="grid size-6 place-items-center rounded-md border border-line font-mono text-sm">+</button></div></div>
              <Row label="Est. price" value={inr(stock.ltp)} />
              <div className="flex items-center justify-between border-t border-line pt-3"><span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Est. total</span><span className="font-mono text-[15px] font-medium">{inr(stock.ltp * qty, 0)}</span></div>
              <LiveOrderButton symbol={stock.symbol} side={side} qty={qty} price={stock.ltp} />
            </div>
          </div>

          <Panel title="Watchlist" tag="(c)" meta="MY STOCKS">
            <div className="divide-y divide-line">{watchlist.map((w) => <div key={w.symbol} className="flex cursor-pointer items-center justify-between px-4 py-2.5 transition-colors hover:bg-white/[0.04]"><span className="text-[13px] font-medium">{w.symbol}</span><span className="flex items-center gap-3"><span className="font-mono text-[12px] text-muted-foreground">{inr(w.ltp)}</span><span className={`font-mono text-[12px] ${w.changePct >= 0 ? "text-up" : "text-down"}`}>{w.changePct >= 0 ? "+" : ""}{w.changePct.toFixed(2)}%</span></span></div>)}</div>
          </Panel>
        </aside>
      </div>
    </Shell>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: "up" | "down" }) {
  const toneClass = tone === "up" ? "text-up" : tone === "down" ? "text-down" : "";
  return <div className="rounded-xl border border-line bg-white/[0.03] p-4 backdrop-blur-md"><div className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{label}</div><div className={`font-mono text-[22px] font-medium tracking-tight ${toneClass}`}>{value}</div><div className={`mt-1 font-mono text-[11px] ${toneClass || "text-muted-foreground"}`}>{sub}</div></div>;
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between"><span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{label}</span><span className="font-mono text-[12px]">{value}</span></div>;
}
