import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, Panel } from "@/components/tti/Shell";

export const Route = createFileRoute("/investments")({
  head: () => ({ meta: [{ title: "Investments — TTI" }] }),
  component: Investments,
});

const products = [
  { path: "/fo", label: "F&O", title: "Futures & Options", desc: "Explore futures, options, contracts, expiry, strikes, margin and payoff views.", icon: "ƒ" },
  { path: "/mutual-funds", label: "Mutual Funds", title: "Mutual Funds", desc: "Browse fund categories, NAV, returns, risk and portfolio allocation.", icon: "MF" },
  { path: "/commodities", label: "Commodities", title: "Commodities", desc: "Track gold, silver, crude oil and other commodity market instruments.", icon: "◈" },
  { path: "/fd", label: "FD", title: "Fixed Deposits", desc: "Compare tenure, interest rates, maturity value and payout options.", icon: "FD" },
] as const;

function Investments() {
  return <Shell><div className="mb-4"><h1 className="font-display text-xl font-bold">Investment Products</h1><p className="mt-1 text-xs text-muted-foreground">Everything accessible from one place. Select a product to open its dedicated view.</p></div><div className="grid grid-cols-1 gap-4 md:grid-cols-2">{products.map((p) => <Link key={p.path} to={p.path} className="group"><Panel title={p.title} tag={p.label}><div className="flex gap-4 p-5"><div className="grid size-12 shrink-0 place-items-center rounded-xl border border-line bg-white/[0.04] font-mono text-sm">{p.icon}</div><div><p className="text-sm leading-6 text-muted-foreground">{p.desc}</p><span className="mt-3 inline-block font-mono text-[10px] uppercase tracking-[0.15em] text-accent group-hover:underline">Open {p.label} →</span></div></div></Panel></Link>)}</div></Shell>;
}
