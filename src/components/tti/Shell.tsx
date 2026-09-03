import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { indices } from "@/lib/market-data";

const nav = [
  { to: "/", label: "Dashboard" },
  { to: "/markets", label: "Markets" },
  { to: "/orders", label: "Orders" },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-32 h-96 w-96 rounded-full bg-accent/20 blur-[130px]" />
        <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-cyan/20 blur-[130px]" />
        <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-up/15 blur-[120px]" />
      </div>

      <div className="relative">
        <header className="sticky top-0 z-30 border-b border-line bg-background/70 backdrop-blur-xl">
          <div className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-accent shadow-[0_0_10px_2px] shadow-accent/50" />
                <span className="font-display text-[15px] font-bold tracking-tight">TTI</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                  The Trading Institute
                </span>
              </Link>
              <nav className="hidden items-center gap-5 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground md:flex">
                {nav.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    activeOptions={{ exact: n.to === "/" }}
                    activeProps={{ className: "text-foreground" }}
                    className="transition-colors hover:text-foreground/80"
                  >
                    {n.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden font-mono text-[10px] text-muted-foreground sm:block">15:29:42 IST</span>
              <span className="rounded-md border border-up/40 bg-up/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-up">
                Market Open
              </span>
              <span className="grid size-8 place-items-center rounded-full border border-line bg-panel font-mono text-[10px]">
                TJ
              </span>
            </div>
          </div>

          <div className="flex overflow-x-auto border-t border-line bg-panel/40">
            {indices.map((i, idx) => (
              <div key={i.name} className="flex items-center">
                {idx > 0 && <div className="h-4 w-px bg-line" />}
                <div className="flex items-center gap-2 whitespace-nowrap px-4 py-2">
                  <span className="font-mono text-[11px] font-medium">{i.name}</span>
                  <span className="font-mono text-[11px]">{i.value}</span>
                  <span className={`font-mono text-[11px] ${i.changePct >= 0 ? "text-up" : "text-down"}`}>
                    {i.changePct >= 0 ? "+" : ""}
                    {i.changePct.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </header>

        <main className="px-5 py-6">{children}</main>
      </div>
    </div>
  );
}

export function Panel({
  title,
  tag,
  meta,
  children,
}: {
  title: string;
  tag?: string;
  meta?: string;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white/[0.03] backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-display text-sm font-bold">{title}</span>
          {tag && <span className="font-mono text-[10px] text-muted-foreground">{tag}</span>}
        </div>
        {meta && <span className="font-mono text-[10px] text-muted-foreground">{meta}</span>}
      </div>
      {children}
    </div>
  );
}
