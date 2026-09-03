import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { placeLiveOrder } from "./angel-one.server";

const LiveOrderSchema = z.object({
  symbol: z.string().trim().min(1).max(30),
  side: z.enum(["BUY", "SELL"]),
  qty: z.number().int().positive().max(1_000_000),
  orderType: z.enum(["MARKET", "LIMIT"]).default("MARKET"),
  price: z.number().positive().max(100_000_000).optional(),
  exchange: z.enum(["NSE", "BSE"]).default("NSE"),
  productType: z.enum(["DELIVERY", "INTRADAY", "MARGIN", "BO", "CO"]).default("DELIVERY"),
  confirmation: z.literal("PLACE_LIVE_ORDER"),
});

export const placeAngelOneLiveOrder = createServerFn({ method: "POST" })
  .validator(LiveOrderSchema)
  .handler(async ({ data }) => {
    return placeLiveOrder(data);
  });
