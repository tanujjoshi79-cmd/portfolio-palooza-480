import { createFileRoute } from "@tanstack/react-router";
import { Shell, Panel } from "@/components/tti/Shell";
import { holdings, inr, watchlist } from "@/lib/market-data";

export const Route = createFileRoute("/markets")({
  head: () => ({
    meta: [
      { title: "Portfolio Companies — TTI" },
      {
        name: "description",
        content:
          "Every company listed in your TTI portfolio with quantity, average cost, last traded price and profit or loss.",
      },
      { property: "og:title", content: "Portfolio Companies — TTI" },
      {
        property: "og:description",
        content: "Sector-wise listing of your holdings with live LTP and P&L across NSE and BSE.",
      },
    ],
  }),
  component: Markets,
});

function Markets() {
  return (
    <Shell>
      <div className="mb-3 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold tracking-tight">Portfolio Companies</h1>
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
          {holdings.length} instruments
        </span>
      </div>

      <Panel title="Listed Companies" tag="(a)" meta="LIVE · NSE / BSE">
        <div className="grid grid-cols-12 border-b border-line px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          <span className="col-span-4">Company</span>
          <span className="col-span-1 text-right">Qty</span>
          <span className="col-span-2 text-right">Avg cost</span>
          <span className="col-span-2 text-right">LTP</span>
          <span className="col-span-2 text-right">P&L</span>
          <span className="col-span-1 text-right">Chg</span>
        </div>
        <div className="divide-y divide-line">
          {holdings.map((h) => {
            const pnl = (h.ltp - h.avg) * h.qty;
            return (
              <div
                key={h.symbol}
                className="grid cursor-pointer grid-cols-12 items-center px-4 py-3 transition-colors hover:bg-white/[0.04]"
              >
                <span className="col-span-4">
                  <span className="block text-[13px] font-medium">{h.symbol}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {h.name} · {h.sector}
                  </span>
                </span>
                <span className="col-span-1 text-right font-mono text-[12px]">{h.qty}</span>
                <span className="col-span-2 text-right font-mono text-[12px] text-muted-foreground">
                  {inr(h.avg)}
                </span>
                <span className="col-span-2 text-right font-mono text-[12px]">{inr(h.ltp)}</span>
                <span
                  className={`col-span-2 text-right font-mono text-[12px] ${pnl >= 0 ? "text-up" : "text-down"}`}
                >
                  {pnl >= 0 ? "+" : "-"}
                  {inr(Math.abs(pnl), 0)}
                </span>
                <span className="col-span-1 text-right">
                  <span
                    className={`inline-block rounded px-2 py-0.5 font-mono text-[11px] ${
                      h.changePct >= 0 ? "bg-up/10 text-up" : "bg-down/10 text-down"
                    }`}
                  >
                    {h.changePct >= 0 ? "+" : ""}
                    {h.changePct.toFixed(2)}%
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="mt-5 grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-6">
          <Panel title="Market Movers" tag="(b)" meta="TOP GAINERS">
            <div className="divide-y divide-line">
              {[...holdings, ...watchlist.map((w) => ({ ...w, name: w.symbol }))]
                .sort((a, b) => b.changePct - a.changePct)
                .slice(0, 5)
                .map((m) => (
                  <div
                    key={m.symbol}
                    className="flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-white/[0.04]"
                  >
                    <span className="text-[13px] font-medium">{m.symbol}</span>
                    <span className={`font-mono text-[12px] ${m.changePct >= 0 ? "text-up" : "text-down"}`}>
                      {m.changePct >= 0 ? "+" : ""}
                      {m.changePct.toFixed(2)}%
                    </span>
                  </div>
                ))}
            </div>
          </Panel>
        </div>
        <div className="col-span-12 lg:col-span-6">
          <Panel title="Watchlist" tag="(c)" meta="MY STOCKS">
            <div className="divide-y divide-line">
              {watchlist.map((w) => (
                <div
                  key={w.symbol}
                  className="flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-white/[0.04]"
                >
                  <span className="text-[13px] font-medium">{w.symbol}</span>
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-[12px] text-muted-foreground">{inr(w.ltp)}</span>
                    <span className={`font-mono text-[12px] ${w.changePct >= 0 ? "text-up" : "text-down"}`}>
                      {w.changePct >= 0 ? "+" : ""}
                      {w.changePct.toFixed(2)}%
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </Shell>
  );
}
