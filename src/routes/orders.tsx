import { createFileRoute } from "@tanstack/react-router";
import { Shell, Panel } from "@/components/tti/Shell";
import { inr, orders } from "@/lib/market-data";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Order Book — TTI" },
      {
        name: "description",
        content: "Executed, pending and rejected buy and sell orders from your TTI trading session.",
      },
      { property: "og:title", content: "Order Book — TTI" },
      {
        property: "og:description",
        content: "Full order history with side, quantity, price, order type and status.",
      },
    ],
  }),
  component: Orders,
});

const statusClass = {
  EXECUTED: "bg-up/10 text-up",
  PENDING: "bg-cyan/10 text-cyan",
  REJECTED: "bg-down/10 text-down",
} as const;

function Orders() {
  return (
    <Shell>
      <div className="mb-3 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold tracking-tight">Order Book</h1>
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
          {orders.length} orders today
        </span>
      </div>

      <Panel title="Today's Orders" tag="(a)" meta="SESSION 03 SEP">
        <div className="grid grid-cols-12 border-b border-line px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          <span className="col-span-3">Order ID</span>
          <span className="col-span-2">Instrument</span>
          <span className="col-span-1">Side</span>
          <span className="col-span-1 text-right">Qty</span>
          <span className="col-span-2 text-right">Price</span>
          <span className="col-span-1 text-right">Type</span>
          <span className="col-span-2 text-right">Status</span>
        </div>
        <div className="divide-y divide-line">
          {orders.map((o) => (
            <div
              key={o.id}
              className="grid grid-cols-12 items-center px-4 py-3 transition-colors hover:bg-white/[0.04]"
            >
              <span className="col-span-3 font-mono text-[11px] text-muted-foreground">
                {o.id}
                <span className="ml-2">{o.time}</span>
              </span>
              <span className="col-span-2 text-[13px] font-medium">{o.symbol}</span>
              <span
                className={`col-span-1 font-mono text-[11px] ${o.side === "BUY" ? "text-up" : "text-down"}`}
              >
                {o.side}
              </span>
              <span className="col-span-1 text-right font-mono text-[12px]">{o.qty}</span>
              <span className="col-span-2 text-right font-mono text-[12px]">{inr(o.price)}</span>
              <span className="col-span-1 text-right font-mono text-[11px] text-muted-foreground">{o.type}</span>
              <span className="col-span-2 text-right">
                <span className={`inline-block rounded px-2 py-0.5 font-mono text-[10px] ${statusClass[o.status]}`}>
                  {o.status}
                </span>
              </span>
            </div>
          ))}
        </div>
      </Panel>
    </Shell>
  );
}
