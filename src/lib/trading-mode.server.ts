import { createServerFn } from "@tanstack/react-start";

export const getTradingMode = createServerFn({ method: "GET" }).handler(() => {
  const enabled = process.env.LIVE_TRADING_ENABLED === "true";

  return {
    liveEnabled: enabled,
    mode: enabled ? "LIVE" : "PAPER",
  } as const;
});
