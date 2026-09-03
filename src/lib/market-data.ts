export type Holding = {
  symbol: string;
  name: string;
  sector: string;
  qty: number;
  avg: number;
  ltp: number;
  changePct: number;
};

export type Index = { name: string; value: string; changePct: number };

export const indices: Index[] = [
  { name: "NIFTY 50", value: "24,804.15", changePct: 0.42 },
  { name: "SENSEX", value: "81,240.30", changePct: -0.18 },
  { name: "BANK NIFTY", value: "52,410.90", changePct: 0.27 },
  { name: "INDIA VIX", value: "13.42", changePct: -2.1 },
  { name: "NIFTY IT", value: "41,022.60", changePct: 1.05 },
  { name: "FINNIFTY", value: "23,110.40", changePct: 0.31 },
];

export const holdings: Holding[] = [
  { symbol: "RELIANCE", name: "Reliance Industries", sector: "Energy", qty: 120, avg: 1180.4, ltp: 1248.6, changePct: 1.24 },
  { symbol: "TCS", name: "Tata Consultancy Services", sector: "IT", qty: 45, avg: 3210.0, ltp: 3402.15, changePct: 0.86 },
  { symbol: "INFY", name: "Infosys", sector: "IT", qty: 90, avg: 1602.5, ltp: 1588.4, changePct: -0.52 },
  { symbol: "HDFCBANK", name: "HDFC Bank", sector: "Banking", qty: 200, avg: 1580.2, ltp: 1642.8, changePct: -0.34 },
  { symbol: "SBIN", name: "State Bank of India", sector: "Banking", qty: 300, avg: 742.1, ltp: 824.1, changePct: 2.1 },
  { symbol: "TATAMOTORS", name: "Tata Motors", sector: "Auto", qty: 150, avg: 760.0, ltp: 798.25, changePct: 0.94 },
  { symbol: "ITC", name: "ITC Limited", sector: "FMCG", qty: 400, avg: 421.3, ltp: 438.7, changePct: -0.18 },
  { symbol: "LT", name: "Larsen & Toubro", sector: "Infra", qty: 60, avg: 3320.0, ltp: 3611.5, changePct: 1.42 },
];

export const watchlist = [
  { symbol: "WIPRO", ltp: 542.3, changePct: 0.71 },
  { symbol: "ICICIBANK", ltp: 1184.9, changePct: -0.44 },
  { symbol: "ADANIPOWER", ltp: 284.2, changePct: 3.42 },
  { symbol: "DRREDDY", ltp: 1245.1, changePct: -1.04 },
];

export type Order = {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  qty: number;
  price: number;
  type: "MARKET" | "LIMIT";
  status: "EXECUTED" | "PENDING" | "REJECTED";
  time: string;
};

export const orders: Order[] = [
  { id: "TTI-90412", symbol: "SBIN", side: "BUY", qty: 100, price: 818.4, type: "MARKET", status: "EXECUTED", time: "09:21:04" },
  { id: "TTI-90418", symbol: "TCS", side: "BUY", qty: 25, price: 3390.0, type: "LIMIT", status: "EXECUTED", time: "10:02:47" },
  { id: "TTI-90423", symbol: "INFY", side: "SELL", qty: 30, price: 1600.0, type: "LIMIT", status: "PENDING", time: "11:47:12" },
  { id: "TTI-90431", symbol: "ITC", side: "SELL", qty: 200, price: 445.0, type: "LIMIT", status: "PENDING", time: "13:15:38" },
  { id: "TTI-90436", symbol: "TATAMOTORS", side: "BUY", qty: 50, price: 795.6, type: "MARKET", status: "REJECTED", time: "14:08:55" },
];

export const inr = (n: number, digits = 2) =>
  "₹" +
  n.toLocaleString("en-IN", { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const portfolioStats = () => {
  const invested = holdings.reduce((s, h) => s + h.avg * h.qty, 0);
  const current = holdings.reduce((s, h) => s + h.ltp * h.qty, 0);
  const dayPnl = holdings.reduce((s, h) => s + (h.ltp * h.qty * h.changePct) / 100, 0);
  return {
    invested,
    current,
    dayPnl,
    dayPct: (dayPnl / current) * 100,
    pnl: current - invested,
    pnlPct: ((current - invested) / invested) * 100,
  };
};
