import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell, Panel } from "@/components/tti/Shell";
import { PaperOrderButton } from "@/components/tti/PaperOrderButton";
import { getPaperAccount } from "@/lib/paper-trading.server";
import { holdings, inr, portfolioStats, watchlist } from "@/lib/market-data";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "TTI Dashboard — The Trading Institute" }] }),
  component: Dashboard,
});

const chartPath = "M0,70 L25,64 L50,68 L75,52 L100,58 L125,44 L150,50 L175,34 L200,40 L225,26 L250,32 L275,18 L300,22";

function Dashboard() {
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [qty, setQty] = useState(50);
  const [account, setAccount] = useState<Awaited<ReturnType<typeof getPaperAccount>> | null>(null);
  const stock = holdings[1]!;
  const s = portfolioStats();

  async function refreshAccount() { setAccount(await getPaperAccount()); }
  useEffect(() => {
    refreshAccount();
    const handler = () => refreshAccount();
    window.addEventListener("paper-trading-updated", handler);
    return () => window.removeEventListener("paper-trading-updated", handler);
  }, []);

  const cash = account?.cash ?? 1_000_000;
  const holdingsValue = account ? account.holdings.reduce((sum, h) => sum + h.value, 0) : 0;
  const equity = account?.equity ?? cash;
  const invested = account?.holdings.reduce((sum, h) => sum + h.avg * h.qty, 0) ?? 0;

  return (
    <Shell>
      <div className="grid grid-cols-12 gap-5">
        <section className="col-span-12 lg:col-span-8">
          <div className="mb-3 flex items-center justify-between"><h1 className="font-display text-xl font-bold tracking-tight">Paper Portfolio</h1><span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">VIRTUAL ACCOUNT</span></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Total Value" value={inr(equity, 0)} sub="cash + holdings" />
            <Stat label="Available Cash" value={inr(cash, 0)} sub="virtual balance" />
            <Stat label="Total Invested" value={inr(invested, 0)} sub="paper positions" />
            <Stat label="Overall P&L" value={`${account && account.pnl >= 0 ? "+" : ""}${inr(account?.pnl ?? 0, 0)}`} sub="vs ₹10,00,000 start" tone={(account?.pnl ?? 0) >= 0 ? "up" : "down"} />
          </div>
          <div className="mt-5"><Panel title="Paper Holdings" tag="(a)" meta="VIRTUAL · NSE">
            <div className="grid grid-cols-12 border-b border-line px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"><span className="col-span-4">Instrument</span><span className="col-span-2 text-right">Qty</span><span className="col-span-3 text-right">LTP</span><span className="col-span-3 text-right">Value</span></div>
            <div className="divide-y divide-line">{account?.holdings.length ? account.holdings.map((h) => <div key={h.symbol} className="grid grid-cols-12 items-center px-4 py-2.5"><span className="col-span-4 font-medium">{h.symbol}</span><span className="col-span-2 text-right font-mono text-[12px]">{h.qty}</span><span className="col-span-3 text-right font-mono text-[12px]">{inr(h.ltp)}</span><span className="col-span-3 text-right font-mono text-[12px]">{inr(h.value, 0)}</span></div>) : <div className="px-4 py-5 font-mono text-[11px] text-muted-foreground">No paper positions yet. Place your first virtual order.</div>}</div>
            <div className="border-t border-line px-4 py-2.5"><Link to="/markets" className="font-mono text-[10px] uppercase tracking-[0.15em] text-accent hover:underline">View markets →</Link></div>
          </Panel></div>
        </section>
        <aside className="col-span-12 space-y-5 lg:col-span-4">
          <Panel title="Stock Detail" tag="(b)" meta={`${stock.symbol} · NSE`}><div className="px-4 pt-4"><div className="flex items-end justify-between"><div><div className="font-display text-lg font-bold">{stock.symbol}</div><div className="font-mono text-[10px] text-muted-foreground">{stock.name}</div></div><div className="text-right"><div className="font-mono text-xl">{inr(stock.ltp)}</div><div className="font-mono text-[11px] text-up">+{stock.changePct.toFixed(2)}%</div></div></div><svg viewBox="0 0 300 90" preserveAspectRatio="none" className="mt-3 h-[90px] w-full"><path className="chart-line text-up" d={chartPath} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" /></svg></div></Panel>
          <div className="overflow-hidden rounded-xl border border-line bg-white/[0.03] backdrop-blur-md">
            <div className="flex items-center gap-1 p-1.5">{(["BUY", "SELL"] as const).map((s2) => <button key={s2} onClick={() => setSide(s2)} className={`flex-1 rounded-lg py-2 font-mono text-[11px] uppercase ${side === s2 ? s2 === "BUY" ? "bg-up/15 text-up" : "bg-down/15 text-down" : "text-muted-foreground"}`}>{s2}</button>)}</div>
            <div className="space-y-3 p-4"><Row label="Mode" value="PAPER TRADING" /><Row label="Order type" value="Market" /><div className="flex items-center justify-between"><span className="font-mono text-[10px] uppercase text-muted-foreground">Quantity</span><div className="flex items-center gap-2"><button onClick={() => setQty((q) => Math.max(1, q - 5))} className="grid size-6 place-items-center rounded-md border border-line">-</button><span className="w-8 text-center font-mono text-[13px]">{qty}</span><button onClick={() => setQty((q) => q + 5)} className="grid size-6 place-items-center rounded-md border border-line">+</button></div></div><Row label="Est. price" value={inr(stock.ltp)} /><div className="flex items-center justify-between border-t border-line pt-3"><span className="font-mono text-[10px] uppercase text-muted-foreground">Est. total</span><span className="font-mono text-[15px]">{inr(stock.ltp * qty, 0)}</span></div><PaperOrderButton symbol={stock.symbol} side={side} qty={qty} price={stock.ltp} /></div>
          </div>
          <Panel title="Watchlist" tag="(c)" meta="MY STOCKS"><div className="divide-y divide-line">{watchlist.map((w) => <div key={w.symbol} className="flex items-center justify-between px-4 py-2.5"><span className="text-[13px] font-medium">{w.symbol}</span><span className="font-mono text-[12px] text-muted-foreground">{inr(w.ltp)} <span className={w.changePct >= 0 ? "text-up" : "text-down"}>{w.changePct >= 0 ? "+" : ""}{w.changePct.toFixed(2)}%</span></span></div>)}</div></Panel>
        </aside>
      </div>
    </Shell>
  );
}
function Stat({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: "up" | "down" }) { return <div className="rounded-xl border border-line bg-white/[0.03] p-4"><div className="mb-2 font-mono text-[10px] uppercase text-muted-foreground">{label}</div><div className={`font-mono text-[22px] font-medium ${tone === "up" ? "text-up" : tone === "down" ? "text-down" : ""}`}>{value}</div><div className="mt-1 font-mono text-[11px] text-muted-foreground">{sub}</div></div>; }
function Row({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between"><span className="font-mono text-[10px] uppercase text-muted-foreground">{label}</span><span className="font-mono text-[12px]">{value}</span></div>; }
