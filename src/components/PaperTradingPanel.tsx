import { useState } from "react";
import { getPaperAccount, placePaperOrder } from "../lib/paper-trading.server";

export function PaperTradingPanel({ symbol = "TCS" }: { symbol?: string }) {
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setMessage("");
    try {
      const result = await placePaperOrder({
        data: { symbol, side, qty, orderType: "MARKET" },
      });
      setMessage(`${side} executed: ${qty} ${symbol} @ ₹${result.order.price.toFixed(2)}`);
      window.dispatchEvent(new CustomEvent("paper-trading-updated"));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Order failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl border p-4">
      <div className="mb-3 flex gap-2">
        <button type="button" onClick={() => setSide("BUY")} aria-pressed={side === "BUY"}>
          BUY
        </button>
        <button type="button" onClick={() => setSide("SELL")} aria-pressed={side === "SELL"}>
          SELL
        </button>
      </div>
      <label className="block text-sm">Quantity</label>
      <input
        type="number"
        min={1}
        step={1}
        value={qty}
        onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
        className="my-2 w-full rounded border p-2"
      />
      <button type="button" disabled={busy} onClick={submit} className="w-full rounded p-3">
        {busy ? "Processing…" : `Place Paper ${side} Order`}
      </button>
      {message && <p className="mt-3 text-sm">{message}</p>}
    </section>
  );
}

export async function loadPaperAccount() {
  return getPaperAccount();
}
