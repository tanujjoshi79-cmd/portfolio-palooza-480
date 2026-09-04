import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { placePaperOrder } from "@/lib/paper-trading.server";

type Props = {
  symbol: string;
  side: "BUY" | "SELL";
  qty: number;
  price: number;
};

export function LiveOrderButton({ symbol, side, qty, price }: Props) {
  const placeOrder = useServerFn(placePaperOrder);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    setBusy(true);
    setMessage(null);
    try {
      const result = await placeOrder({
        data: { symbol, side, qty, orderType: "MARKET" },
      });
      setMessage(`Paper order executed · ${result.order.id} · ₹${result.order.price.toLocaleString("en-IN")}`);
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
        className="w-full rounded-lg bg-accent py-2.5 font-display text-sm font-bold text-accent-foreground transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Processing Paper Order…" : `Place Paper ${side === "BUY" ? "Buy" : "Sell"} Order`}
      </button>
      {message && <div className="font-mono text-[10px] text-muted-foreground">{message}</div>}
    </div>
  );
}
