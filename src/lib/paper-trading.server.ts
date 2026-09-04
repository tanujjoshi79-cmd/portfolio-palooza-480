import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { holdings as seedHoldings, watchlist } from "./market-data";

const INITIAL_BALANCE = 1_000_000;

type Position = { symbol: string; qty: number; avg: number };
type PaperOrder = {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  qty: number;
  price: number;
  type: "MARKET" | "LIMIT";
  status: "EXECUTED" | "REJECTED";
  time: string;
  realizedPnl?: number;
};

let cash = INITIAL_BALANCE;
let positions: Position[] = [];
let paperOrders: PaperOrder[] = [];
let realizedPnl = 0;

const priceFor = (symbol: string) => {
  const key = symbol.trim().toUpperCase();
  const holding = seedHoldings.find((h) => h.symbol === key);
  const watched = watchlist.find((w) => w.symbol === key);
  return holding?.ltp ?? watched?.ltp ?? null;
};

const OrderSchema = z.object({
  symbol: z.string().trim().min(1).max(30),
  side: z.enum(["BUY", "SELL"]),
  qty: z.number().int().positive().max(1_000_000),
  orderType: z.enum(["MARKET", "LIMIT"]).default("MARKET"),
  price: z.number().positive().max(100_000_000).optional(),
});

export const getPaperAccount = createServerFn({ method: "GET" }).handler(() => {
  const enriched = positions.map((p) => {
    const ltp = priceFor(p.symbol) ?? p.avg;
    return { ...p, ltp, value: p.qty * ltp, pnl: p.qty * (ltp - p.avg) };
  });
  const holdingsValue = enriched.reduce((sum, p) => sum + p.value, 0);
  const unrealizedPnl = enriched.reduce((sum, p) => sum + p.pnl, 0);
  return {
    initialBalance: INITIAL_BALANCE,
    cash,
    holdings: enriched,
    equity: cash + holdingsValue,
    pnl: realizedPnl + unrealizedPnl,
    realizedPnl,
    unrealizedPnl,
    orders: paperOrders,
  };
});

export const placePaperOrder = createServerFn({ method: "POST" })
  .validator(OrderSchema)
  .handler(async ({ data }) => {
    const symbol = data.symbol.trim().toUpperCase();
    const marketPrice = priceFor(symbol);
    const price = data.orderType === "LIMIT" ? data.price : marketPrice;

    if (!price) throw new Error(`No market price available for ${symbol}`);
    if (data.orderType === "LIMIT" && !data.price) throw new Error("Limit price is required");

    const value = price * data.qty;
    const existing = positions.find((p) => p.symbol === symbol);
    let orderRealizedPnl: number | undefined;

    if (data.side === "BUY") {
      if (value > cash) throw new Error("Insufficient virtual cash");
      cash -= value;
      if (existing) {
        const totalCost = existing.avg * existing.qty + value;
        existing.qty += data.qty;
        existing.avg = totalCost / existing.qty;
      } else {
        positions.push({ symbol, qty: data.qty, avg: price });
      }
    } else {
      if (!existing || existing.qty < data.qty) throw new Error("Insufficient holdings");
      orderRealizedPnl = (price - existing.avg) * data.qty;
      realizedPnl += orderRealizedPnl;
      cash += value;
      existing.qty -= data.qty;
      if (existing.qty === 0) positions = positions.filter((p) => p.symbol !== symbol);
    }

    const order: PaperOrder = {
      id: `PAPER-${Date.now()}`,
      symbol,
      side: data.side,
      qty: data.qty,
      price,
      type: data.orderType,
      status: "EXECUTED",
      time: new Date().toISOString(),
      ...(orderRealizedPnl !== undefined ? { realizedPnl: orderRealizedPnl } : {}),
    };
    paperOrders = [order, ...paperOrders].slice(0, 100);
    return { order, cash, realizedPnl };
  });

export const resetPaperAccount = createServerFn({ method: "POST" }).handler(() => {
  cash = INITIAL_BALANCE;
  positions = [];
  paperOrders = [];
  realizedPnl = 0;
  return getPaperAccount();
});
