import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { placePaperOrder } from "@/lib/paper-trading.server";

type Props = { symbol: string; side: "BUY" | "SELL"; qty: number; price: number };

export function PaperOrderButton({ symbol, side, qty, price }: Props) {
  const placeOrder = useServerFn(placePaperOrder);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setBusy(true);
    setMessage(null);
    try {
      const result = await placeOrder({ data: { symbol, side, qty, orderType: "MARKET" } });
      setMessage(`${side} executed · ${qty} ${symbol} @ ₹${result.order.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`);
      window.dispatchEvent(new CustomEvent("paper-trading-updated"));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Paper order failed");
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
        className={`w-full rounded-lg py-2.5 font-display text-sm font-bold transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 ${side === "BUY" ? "bg-up text-black" : "bg-down text-white"}`}
      >
        {busy ? "Processing…" : `Place Paper ${side === "BUY" ? "Buy" : "Sell"} Order`}
      </button>
      {message && <div className="font-mono text-[10px] text-muted-foreground">{message}</div>}
    </div>
  );
}
