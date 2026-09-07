import { createFileRoute } from "@tanstack/react-router";
import { Shell, Panel } from "@/components/tti/Shell";

export const Route = createFileRoute("/market-news")({ component: MarketNews });

const news = [
  { source: "Reuters", title: "Indian shares snap four-day losing streak; Nifty closes near 23,900", date: "4 Sep 2026", summary: "Nifty 50 closed at 23,897.70, up 0.10%, while Sensex gained 0.48% to 76,515.43. Elevated crude and geopolitical risks remain key market factors." },
  { source: "Moneycontrol", title: "FIIs sell ₹3,111.94 crore; DIIs buy ₹8,930.12 crore", date: "4 Sep 2026", summary: "Foreign institutional investors were net sellers while domestic institutions were net buyers in Indian equities." },
  { source: "Financial Express", title: "Sensex gains 363 points; Nifty near 23,900", date: "4 Sep 2026", summary: "Insurance, metal and financial stocks supported the rebound, while crude oil remained elevated." },
  { source: "ET Markets", title: "Stocks in news: Tata Motors, RVNL, Eicher Motors, Mazagon Dock and Lupin", date: "7 Sep 2026", summary: "Several large and mid-cap names are in focus amid continued volatility and sector rotation." },
  { source: "Reuters", title: "RBI moves to absorb surplus banking-system liquidity", date: "7 Sep 2026", summary: "The RBI accepted large bids through overnight and 30-day operations as banking-system liquidity surged." },
];

function MarketNews() {
  return <Shell><div className="mx-auto max-w-5xl space-y-4"><div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="font-display text-2xl font-bold">Latest Market News</h1><p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">India · Markets · News &amp; Events</p></div><span className="rounded-full border border-up/30 bg-up/10 px-3 py-1 font-mono text-[10px] text-up">LATEST</span></div><Panel title="Market News Feed" tag="LIVE RESEARCH"><div className="divide-y divide-line">{news.map((item, i) => <article key={item.title} className="p-4 transition-colors hover:bg-white/[0.03]"><div className="flex flex-wrap items-center gap-2 font-mono text-[9px] uppercase tracking-wider text-muted-foreground"><span>{item.source}</span><span>·</span><span>{item.date}</span></div><h2 className="mt-2 font-display text-base font-semibold">{item.title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.summary}</p><a href={i === 0 ? "https://www.reuters.com/world/india/indian-shares-may-open-higher-traders-trim-fed-hike-bets-2026-09-04/" : "#"} target="_blank" rel="noreferrer" className="mt-3 inline-block font-mono text-[10px] uppercase tracking-wider text-up">{i === 0 ? "Read source →" : "Market update"}</a></article>)}</div></Panel><div className="rounded-lg border border-line p-3 font-mono text-[9px] text-muted-foreground">News is for information only and is not investment advice. Market data and headlines can change.</div></div></Shell>;
}
