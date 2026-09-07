import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, Panel } from "@/components/tti/Shell";
import { holdings, inr, portfolioStats } from "@/lib/market-data";

export const Route = createFileRoute("/portfolio-news")({ component: PortfolioNews });

const news = [
  { source: "Reuters", title: "Indian shares snap four-day losing streak; Nifty closes near 23,900", date: "4 Sep 2026", summary: "Nifty 50 closed at 23,897.70, up 0.10%, while Sensex gained 0.48% to 76,515.43." },
  { source: "Moneycontrol", title: "FIIs sell ₹3,111.94 crore; DIIs buy ₹8,930.12 crore", date: "4 Sep 2026", summary: "Foreign institutional investors were net sellers while domestic institutions were net buyers in Indian equities." },
  { source: "Financial Express", title: "Sensex gains 363 points; Nifty near 23,900", date: "4 Sep 2026", summary: "Insurance, metal and financial stocks supported the rebound, while crude oil remained elevated." },
  { source: "ET Markets", title: "Stocks in news: Tata Motors, RVNL, Eicher Motors, Mazagon Dock and Lupin", date: "7 Sep 2026", summary: "Several large and mid-cap names are in focus amid continued volatility and sector rotation." },
  { source: "Reuters", title: "RBI moves to absorb surplus banking-system liquidity", date: "7 Sep 2026", summary: "The RBI accepted large bids through overnight and 30-day operations as banking-system liquidity surged." },
];

function PortfolioNews() {
  const stats = portfolioStats();

  return <Shell><div className="mx-auto max-w-6xl space-y-4">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><h1 className="font-display text-2xl font-bold">Portfolio News</h1><p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Portfolio snapshot · Market news · Customer view</p></div>
      <div className="flex gap-2"><Link to="/portfolio" className="rounded-lg border border-line px-4 py-2 font-mono text-[10px] uppercase tracking-wider hover:bg-white/[0.05]">Full Portfolio →</Link><Link to="/market-news" className="rounded-lg border border-line px-4 py-2 font-mono text-[10px] uppercase tracking-wider hover:bg-white/[0.05]">All News →</Link></div>
    </div>

    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {[["Invested",stats.invested],["Current Value",stats.current],["Total P&L",stats.pnl],["Day P&L",stats.dayPnl]].map(([label,value]) => <div key={String(label)} className="rounded-xl border border-line bg-white/[0.03] p-4"><div className="font-mono text-[10px] uppercase text-muted-foreground">{String(label)}</div><div className={`mt-2 font-mono text-lg ${String(label).includes("P&L") ? (Number(value) >= 0 ? "text-up" : "text-down") : ""}`}>{inr(Number(value))}</div></div>)}
    </div>

    <div className="grid gap-4 lg:grid-cols-[1.1fr_1.9fr]">
      <Panel title="Portfolio Holdings" tag="PAPER PORTFOLIO" meta={`${holdings.length} POSITIONS`}>
        <div className="divide-y divide-line">{holdings.slice(0,6).map(h => { const pnl = (h.ltp-h.avg)*h.qty; return <div key={h.symbol} className="flex items-center justify-between gap-3 p-3 hover:bg-white/[0.03]"><div><div className="font-mono text-[11px] font-semibold">{h.symbol}</div><div className="text-[10px] text-muted-foreground">{h.qty} qty · {h.name}</div></div><div className="text-right"><div className="font-mono text-[11px]">{inr(h.ltp*h.qty)}</div><div className={`font-mono text-[10px] ${pnl >= 0 ? "text-up" : "text-down"}`}>{pnl >= 0 ? "+" : ""}{inr(pnl)}</div></div></div> })}</div>
      </Panel>

      <Panel title="Market & Portfolio News" tag="RESEARCH FEED" meta="RECENT UPDATES">
        <div className="divide-y divide-line">{news.map(item => <article key={item.title} className="p-4 hover:bg-white/[0.03]"><div className="flex flex-wrap items-center gap-2 font-mono text-[9px] uppercase tracking-wider text-muted-foreground"><span>{item.source}</span><span>·</span><span>{item.date}</span></div><h2 className="mt-1.5 font-display text-sm font-semibold">{item.title}</h2><p className="mt-1.5 text-sm leading-5 text-muted-foreground">{item.summary}</p></article>)}</div>
      </Panel>
    </div>

    <div className="rounded-lg border border-line p-3 font-mono text-[9px] text-muted-foreground">This section combines the demo paper portfolio with a static market-news snapshot. News and market values should be treated as informational and may change.</div>
  </div></Shell>;
}
