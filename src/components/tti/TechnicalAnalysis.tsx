import { useMemo, useState } from "react";
import { Panel } from "@/components/tti/Shell";

export type TechnicalCandle = { open: number; high: number; low: number; close: number; volume: number; deliveryPct: number };
function sma(data: number[], period: number) { if (data.length < period) return data.reduce((a,b)=>a+b,0)/Math.max(1,data.length); return data.slice(-period).reduce((a,b)=>a+b,0)/period; }
function ema(data: number[], period: number) { if (!data.length) return 0; const k=2/(period+1); let value=data[0]; for(let i=1;i<data.length;i++) value=data[i]*k+value*(1-k); return value; }
function rsi(data: number[], period=14) { if(data.length<2)return 50; const changes=data.slice(1).map((v,i)=>v-data[i]); const recent=changes.slice(-period); const gains=recent.filter(v=>v>0).reduce((a,b)=>a+b,0)/Math.max(1,recent.length); const losses=Math.abs(recent.filter(v=>v<0).reduce((a,b)=>a+b,0))/Math.max(1,recent.length); if(!losses)return 70; return 100-100/(1+gains/losses); }
function macd(data:number[]){return ema(data,12)-ema(data,26);}
function fmt(v:number){return `₹${v.toLocaleString("en-IN",{maximumFractionDigits:2})}`;}

export function TechnicalAnalysis({ candles }: { candles: TechnicalCandle[] }) {
  const [open, setOpen] = useState<string | null>("summary");
  const analysis = useMemo(() => {
    const closes=candles.map(c=>c.close), volumes=candles.map(c=>c.volume), last=candles[candles.length-1];
    const sma20=sma(closes,20), sma50=sma(closes,50), ema20=ema(closes,20), ema50=ema(closes,50), rsi14=rsi(closes,14), macdValue=macd(closes), avgVolume=sma(volumes,20);
    const volumeRatio=avgVolume?last.volume/avgVolume:1, pivot=(last.high+last.low+last.close)/3, r1=2*pivot-last.low, s1=2*pivot-last.high, r2=pivot+(last.high-last.low), s2=pivot-(last.high-last.low);
    const score=[last.close>sma20,last.close>sma50,last.close>ema20,last.close>ema50,rsi14>=50,macdValue>=0].filter(Boolean).length;
    const summary=score>=5?"Strong Bullish":score>=4?"Bullish":score<=1?"Bearish":score<=2?"Weak Bearish":"Neutral";
    return {last,sma20,sma50,ema20,ema50,rsi14,macdValue,volumeRatio,pivot,r1,s1,r2,s2,summary,delivery:last.deliveryPct};
  },[candles]);
  const tone=analysis.summary.includes("Bullish")?"text-up":analysis.summary.includes("Bearish")?"text-down":"text-muted-foreground";
  const metric=(label:string,value:string,extra?:string)=><div className="rounded-lg border border-line bg-black/10 p-3"><div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div><div className="mt-1 font-mono text-[13px]">{value}</div>{extra&&<div className="mt-1 font-mono text-[9px] text-muted-foreground">{extra}</div>}</div>;
  const section=(id:string,title:string,children:React.ReactNode)=><div className="border-b border-line last:border-b-0"><button type="button" onClick={()=>setOpen(open===id?null:id)} className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-white/[0.03]"><span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em]">{title}</span><span className="font-mono text-[13px] text-muted-foreground">{open===id?"−":"+"}</span></button>{open===id&&<div className="px-4 pb-4">{children}</div>}</div>;

  return <div className="mt-5"><Panel title="Technical Analysis" tag="(i)" meta="CLICK TO EXPAND">
    <div className="divide-y-0">
      {section("summary","Technical Analysis Summary",<div className="flex flex-wrap items-center justify-between gap-3 pt-1"><div><div className="font-mono text-[9px] uppercase text-muted-foreground">Overall signal</div><div className={`mt-1 font-display text-xl font-bold ${tone}`}>{analysis.summary}</div></div><div className="rounded-lg border border-line px-3 py-2"><div className="font-mono text-[9px] text-muted-foreground">RSI (14)</div><div className="font-mono text-lg">{analysis.rsi14.toFixed(1)}</div></div></div>)}
      {section("moving","Moving Averages — SMA / EMA",<div className="grid grid-cols-2 gap-2 md:grid-cols-4">{metric("SMA 20",fmt(analysis.sma20),analysis.last.close>analysis.sma20?"Price above":"Price below")}{metric("SMA 50",fmt(analysis.sma50),analysis.last.close>analysis.sma50?"Price above":"Price below")}{metric("EMA 20",fmt(analysis.ema20),analysis.last.close>analysis.ema20?"Price above":"Price below")}{metric("EMA 50",fmt(analysis.ema50),analysis.last.close>analysis.ema50?"Price above":"Price below")}</div>)}
      {section("osc","Oscillators",<div className="grid grid-cols-2 gap-2 md:grid-cols-4">{metric("RSI (14)",analysis.rsi14.toFixed(1),analysis.rsi14>70?"Overbought":analysis.rsi14<30?"Oversold":"Neutral zone")}{metric("MACD",analysis.macdValue.toFixed(2),analysis.macdValue>=0?"Positive":"Negative")}{metric("Signal",analysis.macdValue>=0?"Bullish bias":"Bearish bias","MACD direction")}{metric("Momentum",analysis.rsi14>=50?"Positive":"Negative","RSI midpoint")}</div>)}
      {section("pivot","Pivot Points",<div className="grid grid-cols-2 gap-2 md:grid-cols-5">{metric("S2",fmt(analysis.s2))}{metric("S1",fmt(analysis.s1))}{metric("Pivot",fmt(analysis.pivot))}{metric("R1",fmt(analysis.r1))}{metric("R2",fmt(analysis.r2))}</div>)}
      {section("volume","Volume",<div className="grid grid-cols-2 gap-2 md:grid-cols-3">{metric("Current Volume",analysis.last.volume.toLocaleString("en-IN"))}{metric("20-period Avg",(analysis.last.volume/analysis.volumeRatio).toLocaleString("en-IN",{maximumFractionDigits:0}))}{metric("Volume Ratio",`${(analysis.volumeRatio*100).toFixed(0)}%`,analysis.volumeRatio>=1?"Above average":"Below average")}</div>)}
      {section("delivery","Delivery",<div className="grid grid-cols-2 gap-2 md:grid-cols-3">{metric("Delivery %",`${analysis.delivery.toFixed(1)}%`,`Delivery / traded quantity`)}{metric("Traded Quantity",analysis.last.volume.toLocaleString("en-IN"),"Indicative volume")}{metric("Delivery Signal",analysis.delivery>=50?"High delivery":analysis.delivery>=35?"Moderate delivery":"Low delivery","Indicative")}</div>)}
      {section("notes","How to Read",<div className="space-y-2 font-mono text-[10px] leading-5 text-muted-foreground"><p><b className="text-foreground">SMA / EMA:</b> compare price with moving averages to gauge trend direction.</p><p><b className="text-foreground">Oscillators:</b> RSI and MACD help assess momentum and potential overbought/oversold conditions.</p><p><b className="text-foreground">Pivot:</b> classic support and resistance reference levels.</p><p><b className="text-foreground">Volume / Delivery:</b> activity and indicative delivery participation.</p><p className="pt-2 text-amber-400/80">Indicators are educational and calculated from the candles available in the terminal. Delivery remains indicative/demo until an exchange data feed is connected.</p></div>)}
    </div>
  </Panel></div>;
}
