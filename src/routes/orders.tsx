import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Shell, Panel } from "@/components/tti/Shell";
import { inr, orders as seedOrders } from "@/lib/market-data";
import { getPaperAccount } from "@/lib/paper-trading.server";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Order Book — TTI" },
      { name: "description", content: "Paper trading order history." },
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
  const getAccount = useServerFn(getPaperAccount);
  const [paperOrders, setPaperOrders] = useState<Awaited<ReturnType<typeof getPaperAccount>>["orders"]>([]);

  const refresh = async () => {
    const account = await getAccount();
    setPaperOrders(account.orders);
  };

  useEffect(() => {
    void refresh();
    const handler = () => void refresh();
    window.addEventListener("paper-trading-updated", handler);
    return () => window.removeEventListener("paper-trading-updated", handler);
  }, []);

  const rows = paperOrders.length ? paperOrders : seedOrders;

  return (
    <Shell>
      <div className="mb-3 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold tracking-tight">Order Book</h1>
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
          {rows.length} orders · PAPER TRADING
        </span>
      </div>

      <Panel title="Order History" tag="(a)" meta="PAPER SESSION">
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
          {rows.map((o) => (
            <div key={o.id} className="grid grid-cols-12 items-center px-4 py-3 transition-colors hover:bg-white/[0.04]">
              <span className="col-span-3 font-mono text-[11px] text-muted-foreground">
                {o.id}<span className="ml-2">{o.time}</span>
              </span>
              <span className="col-span-2 text-[13px] font-medium">{o.symbol}</span>
              <span className={`col-span-1 font-mono text-[11px] ${o.side === "BUY" ? "text-up" : "text-down"}`}>{o.side}</span>
              <span className="col-span-1 text-right font-mono text-[12px]">{o.qty}</span>
              <span className="col-span-2 text-right font-mono text-[12px]">{inr(o.price)}</span>
              <span className="col-span-1 text-right font-mono text-[11px] text-muted-foreground">{o.type}</span>
              <span className="col-span-2 text-right">
                <span className={`inline-block rounded px-2 py-0.5 font-mono text-[10px] ${statusClass[o.status]}`}>{o.status}</span>
              </span>
            </div>
          ))}
        </div>
      </Panel>
    </Shell>
  );
}
