const SMART_API_BASE = "https://apiconnect.angelone.in";

type AngelResponse<T> = {
  status?: boolean;
  message?: string;
  errorcode?: string;
  data?: T;
};

type SessionData = {
  jwtToken?: string;
  refreshToken?: string;
  feedToken?: string;
};

type ScripData = {
  exchange: string;
  tradingsymbol: string;
  symboltoken: string;
};

export type LiveOrderInput = {
  symbol: string;
  side: "BUY" | "SELL";
  qty: number;
  orderType?: "MARKET" | "LIMIT";
  price?: number;
  exchange?: "NSE" | "BSE";
  productType?: "DELIVERY" | "INTRADAY" | "MARGIN" | "BO" | "CO";
};

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured on the server`);
  return value;
}

function base32Decode(input: string): Uint8Array {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = input.replace(/=+$/, "").replace(/\s+/g, "").toUpperCase();
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const char of clean) {
    const index = alphabet.indexOf(char);
    if (index < 0) throw new Error("ANGEL_TOTP_SECRET is not valid base32");
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      out.push((value >>> bits) & 0xff);
    }
  }
  return new Uint8Array(out);
}

async function generateTotp(secret: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", base32Decode(secret), { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const counter = Math.floor(Date.now() / 1000 / 30);
  const data = new ArrayBuffer(8);
  const view = new DataView(data);
  view.setUint32(0, Math.floor(counter / 2 ** 32));
  view.setUint32(4, counter >>> 0);
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, data));
  const offset = signature[signature.length - 1]! & 0x0f;
  const code = (((signature[offset]! & 0x7f) << 24) | ((signature[offset + 1]! & 0xff) << 16) | ((signature[offset + 2]! & 0xff) << 8) | (signature[offset + 3]! & 0xff)) % 1_000_000;
  return code.toString().padStart(6, "0");
}

async function smartApi<T>(path: string, body: unknown, jwtToken?: string): Promise<T> {
  const apiKey = requiredEnv("ANGEL_API_KEY");
  const response = await fetch(`${SMART_API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-PrivateKey": apiKey,
      "X-UserType": "USER",
      "X-SourceID": "WEB",
      ...(jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const json = (await response.json()) as AngelResponse<T>;
  if (!response.ok || json.status === false) throw new Error(json.message || json.errorcode || `Angel One API error (${response.status})`);
  return json.data as T;
}

async function login(): Promise<SessionData> {
  return smartApi<SessionData>("/rest/auth/angelbroking/user/v1/loginByPassword", {
    clientcode: requiredEnv("ANGEL_CLIENT_CODE"),
    password: requiredEnv("ANGEL_PASSWORD_OR_PIN"),
    totp: await generateTotp(requiredEnv("ANGEL_TOTP_SECRET")),
  });
}

async function resolveScrip(jwtToken: string, symbol: string, exchange: string): Promise<ScripData> {
  const matches = await smartApi<ScripData[]>("/rest/secure/angelbroking/order/v1/searchScrip", { exchange, searchscrip: symbol }, jwtToken);
  const exact = matches.find((item) => item.exchange === exchange && item.tradingsymbol.toUpperCase() === symbol.toUpperCase());
  if (!exact) throw new Error(`Could not resolve ${symbol} on ${exchange}`);
  return exact;
}

export async function placeLiveOrder(input: LiveOrderInput) {
  if (process.env.LIVE_TRADING_ENABLED !== "true") throw new Error("Live trading is disabled. Set LIVE_TRADING_ENABLED=true on the server after testing.");
  if (!Number.isInteger(input.qty) || input.qty <= 0) throw new Error("Quantity must be a positive integer");
  const exchange = input.exchange ?? "NSE";
  const orderType = input.orderType ?? "MARKET";
  if (orderType === "LIMIT" && (!input.price || input.price <= 0)) throw new Error("A positive limit price is required for LIMIT orders");

  const session = await login();
  if (!session.jwtToken) throw new Error("Angel One login did not return an auth token");
  const scrip = await resolveScrip(session.jwtToken, input.symbol, exchange);
  const order = await smartApi<{ orderid?: string }>("/rest/secure/angelbroking/order/v1/placeOrder", {
    variety: "NORMAL",
    tradingsymbol: scrip.tradingsymbol,
    symboltoken: scrip.symboltoken,
    transactiontype: input.side,
    exchange,
    ordertype: orderType,
    producttype: input.productType ?? "DELIVERY",
    duration: "DAY",
    price: orderType === "MARKET" ? "0" : String(input.price),
    squareoff: "0",
    stoploss: "0",
    quantity: String(input.qty),
  }, session.jwtToken);

  return { broker: "ANGEL_ONE", orderId: order?.orderid ?? null, symbol: scrip.tradingsymbol, side: input.side, qty: input.qty, orderType, price: input.price ?? null, exchange, productType: input.productType ?? "DELIVERY" };
}
