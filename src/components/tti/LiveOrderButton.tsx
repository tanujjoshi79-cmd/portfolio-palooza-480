import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { placeAngelOneLiveOrder } from "@/lib/trading.functions";

type Props = {
  symbol: string;
  side: "BUY" | "SELL";
  qty: number;
  price: number;
};

export function LiveOrderButton({ symbol, side, qty, price }: Props) {
  const placeOrder = useServerFn(placeAngelOneLiveOrder);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleClick() {
    const confirmed = window.confirm(
      `LIVE ORDER\n\n${side} ${qty} × ${symbol} on NSE\nOrder type: MARKET\nEstimated price: ₹${price.toLocaleString("en-IN")}\n\nThis can place a real order with Angel One. Continue?`,
    );
    if (!confirmed) return;

    setBusy(true);
    setMessage(null);
    try {
      const result = await placeOrder({
        data: {
          symbol,
          side,
          qty,
          orderType: "MARKET",
          exchange: "NSE",
          productType: "DELIVERY",
          confirmation: "PLACE_LIVE_ORDER",
        },
      });
      setMessage(result.orderId ? `Order placed · ${result.orderId}` : "Order request accepted");
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
        {busy ? "Sending Order…" : `Place Live ${side === "BUY" ? "Buy" : "Sell"} Order`}
      </button>
      {message && <div className="font-mono text-[10px] text-muted-foreground">{message}</div>}
    </div>
  );
}
