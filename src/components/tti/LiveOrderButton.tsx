import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getTradingMode } from "@/lib/trading-mode.server";
import { placePaperOrder } from "@/lib/paper-trading.server";

type Props = {
  symbol: string;
  side: "BUY" | "SELL";
  qty: number;
  price: number;
};

export function LiveOrderButton({ symbol, side, qty }: Props) {
  const getMode = useServerFn(getTradingMode);
  const placeOrder = useServerFn(placePaperOrder);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setBusy(true);
    setMessage(null);
    try {
      const mode = await getMode();

      // Safety gate: the project currently has a paper-trading execution backend,
      // not a broker order API. Never silently turn a paper action into a real order.
      if (mode.liveEnabled) {
        setMessage("LIVE mode is enabled, but broker execution is not connected yet. No real order was sent.");
        return;
      }

      const result = await placeOrder({
        data: { symbol, side, qty, orderType: "MARKET" },
      });
      setMessage(`PAPER order executed · ${result.order.id} · ₹${result.order.price.toLocaleString("en-IN")}`);
      window.dispatchEvent(new CustomEvent("paper-trading-updated"));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Order failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={busy}
        onClick={handleClick}
        className="w-full rounded-lg bg-accent py-2.5 font-display text-sm font-bold text-accent-foreground transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Checking Trading Mode…" : `Place ${side === "BUY" ? "Buy" : "Sell"} Order`}
      </button>
      {message && <div className="font-mono text-[10px] text-muted-foreground">{message}</div>}
    </div>
  );
}
