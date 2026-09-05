import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { indices, holdings, watchlist } from "@/lib/market-data";

const nav = [
  { to: "/", label: "Dashboard" },
  { to: "/markets", label: "Markets" },
  { to: "/fo", label: "F&O" },
  { to: "/mutual-funds", label: "Mutual Funds" },
  { to: "/commodities", label: "Commodities" },
  { to: "/fd", label: "FD" },
  { to: "/orders", label: "Orders" },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const navigate = useNavigate();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const stocks = [...holdings, ...watchlist.map((w) => ({ ...w, name: w.symbol, sector: "Watchlist", avg: w.ltp, qty: 0 }))];
    return stocks.filter((s) => `${s.symbol} ${s.name} ${s.sector}`.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  const goToStock = (symbol: string) => {
    setQuery(""); setOpen(false); setMobileSearch(false);
    navigate({ to: "/markets", search: { symbol } });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault(); setMobileSearch(true); setOpen(true);
        requestAnimationFrame(() => document.getElementById("tti-mobile-search")?.focus());
      }
      if (e.key === "Escape") { setOpen(false); setMobileSearch(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-32 h-96 w-96 rounded-full bg-accent/20 blur-[130px]" />
        <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-cyan/20 blur-[130px]" />
        <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-up/15 blur-[120px]" />
      </div>
      <div className="relative">
        <header className="sticky top-0 z-30 border-b border-line bg-background/70 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
            <Link to="/" className="flex shrink-0 items-center gap-2">
              <img src="/favicon.svg" alt="The Trading Institute logo" className="size-5 rounded-md object-cover" />
              <span className="font-display text-[15px] font-bold tracking-tight">TTI</span>
              <span className="hidden font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground lg:inline">The Trading Institute</span>
            </Link>

            <nav className="hidden min-w-0 flex-1 items-center justify-center gap-4 overflow-x-auto font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground md:flex lg:gap-5 lg:text-[11px]">
              {nav.map((n) => <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }} activeProps={{ className: "text-foreground" }} className="shrink-0 transition-colors hover:text-foreground/80">{n.label}</Link>)}
            </nav>

            <div className="hidden min-w-0 flex-1 max-w-md md:block">
              <SearchBox query={query} setQuery={setQuery} open={open} setOpen={setOpen} results={results} goToStock={goToStock} />
            </div>
            <button type="button" aria-label="Open search" onClick={() => { setMobileSearch(true); setOpen(true); setTimeout(() => document.getElementById("tti-mobile-search")?.focus(), 0); }} className="grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-panel/60 font-mono text-base md:hidden">⌕</button>
            <div className="hidden shrink-0 items-center gap-4 sm:flex">
              <span className="hidden font-mono text-[10px] text-muted-foreground lg:block">15:29:42 IST</span>
              <span className="rounded-md border border-up/40 bg-up/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-up">Market Open</span>
              <span className="grid size-8 place-items-center rounded-full border border-line bg-panel font-mono text-[10px]">TJ</span>
            </div>
          </div>

          {mobileSearch && (
            <div className="border-t border-line bg-panel/60 p-3 md:hidden">
              <SearchBox id="tti-mobile-search" query={query} setQuery={setQuery} open={open} setOpen={setOpen} results={results} goToStock={goToStock} mobile />
            </div>
          )}

          <div className="flex overflow-x-auto border-t border-line bg-panel/40">
            {indices.map((i, idx) => <div key={i.name} className="flex items-center">{idx > 0 && <div className="h-4 w-px bg-line" />}<div className="flex items-center gap-2 whitespace-nowrap px-3 py-2 sm:px-4"><span className="font-mono text-[10px] font-medium sm:text-[11px]">{i.name}</span><span className="font-mono text-[10px] sm:text-[11px]">{i.value}</span><span className={`font-mono text-[10px] sm:text-[11px] ${i.changePct >= 0 ? "text-up" : "text-down"}`}>{i.changePct >= 0 ? "+" : ""}{i.changePct.toFixed(2)}%</span></div></div>)}
          </div>
        </header>
        <main className="px-4 py-5 sm:px-5 sm:py-6">{children}</main>
      </div>
    </div>
  );
}

function SearchBox({ id, query, setQuery, open, setOpen, results, goToStock, mobile = false }: { id?: string; query: string; setQuery: (v: string) => void; open: boolean; setOpen: (v: boolean) => void; results: any[]; goToStock: (symbol: string) => void; mobile?: boolean }) {
  return <div className="relative w-full">
    <div className="flex items-center gap-2 rounded-lg border border-line bg-panel/60 px-3 py-2.5 focus-within:border-white/20">
      <span className="font-mono text-[12px] text-muted-foreground">⌕</span>
      <input id={id} value={query} onChange={(e) => { setQuery(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onKeyDown={(e) => { if (e.key === "Escape") setOpen(false); if (e.key === "Enter" && results[0]) goToStock(results[0].symbol); }} placeholder="Search stocks, companies, sectors..." aria-label="Search stocks, companies and sectors" className="min-w-0 flex-1 bg-transparent font-mono text-[11px] outline-none placeholder:text-muted-foreground" />
      <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">/</kbd>
    </div>
    {open && query.trim() && <div className={`absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-xl border border-line bg-[#111218] shadow-2xl ${mobile ? "z-50" : ""}`}>
      {results.length ? results.map((s) => <button key={s.symbol} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => goToStock(s.symbol)} className="flex w-full items-center justify-between border-b border-line px-3 py-3 text-left last:border-0 hover:bg-white/[0.05]"><span><span className="block font-mono text-[12px] font-semibold">{s.symbol}</span><span className="text-[10px] text-muted-foreground">{s.name} · {s.sector}</span></span><span className={`font-mono text-[11px] ${s.changePct >= 0 ? "text-up" : "text-down"}`}>{s.changePct >= 0 ? "+" : ""}{s.changePct.toFixed(2)}%</span></button>) : <div className="px-3 py-4 font-mono text-[10px] text-muted-foreground">No matching instrument found.</div>}
      <div className="border-t border-line px-3 py-2 font-mono text-[9px] text-muted-foreground">Press Enter to open the first result · Esc to close</div>
    </div>}
  </div>;
}

export function Panel({ title, tag, meta, children }: { title: string; tag?: string; meta?: string; children: ReactNode }) {
  return <div className="overflow-hidden rounded-xl border border-line bg-white/[0.03] backdrop-blur-md"><div className="flex items-center justify-between border-b border-line px-4 py-3"><div className="flex items-center gap-2"><span className="font-display text-sm font-bold">{title}</span>{tag && <span className="font-mono text-[10px] text-muted-foreground">{tag}</span>}</div>{meta && <span className="font-mono text-[10px] text-muted-foreground">{meta}</span>}</div>{children}</div>;
}
