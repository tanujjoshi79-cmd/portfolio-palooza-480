import { createFileRoute } from "@tanstack/react-router";
import { Shell, Panel } from "@/components/tti/Shell";

export const Route = createFileRoute("/operational-cost")({ component: OperationalCost });

const rows = [
  ["Hosting / deployment", "₹1,000–₹3,000 / month", "Basic platform infrastructure"],
  ["Database / backend", "₹500–₹1,500 / month", "Depends on usage"],
  ["Domain / email / misc.", "₹500–₹1,500 / month", "Typical recurring essentials"],
  ["Estimated basic platform total", "₹3,000–₹6,000 / month", "Initial estimate; usage-based services extra"],
];

function OperationalCost() {
  return <Shell><div className="mx-auto max-w-5xl"><div className="mb-5"><div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Planning · August 2026</div><h1 className="mt-1 font-display text-2xl font-bold">Operational Cost Estimate</h1><p className="mt-1 text-[12px] text-muted-foreground">TTI platform operating-cost estimate. Usage-based services such as video delivery, OTP and payment processing are separate.</p></div><div className="grid gap-5 lg:grid-cols-2"><Panel title="Monthly Estimate" tag="BASE PLATFORM"><div className="divide-y divide-line">{rows.map(([item,cost,note])=><div key={item} className="grid grid-cols-[1.2fr_auto] gap-4 px-4 py-4"><div><div className="text-[12px] font-medium">{item}</div><div className="mt-1 text-[10px] text-muted-foreground">{note}</div></div><div className="font-mono text-[11px] text-right">{cost}</div></div>)}</div></Panel><Panel title="Additional / Usage Costs" tag="VARIABLE"><div className="space-y-4 px-4 py-4 text-[11px]"><div><b>Video hosting & delivery</b><p className="mt-1 text-muted-foreground">Scales with storage, bandwidth and number of students.</p></div><div><b>OTP / SMS</b><p className="mt-1 text-muted-foreground">Depends on login and verification volume.</p></div><div><b>Payment gateway</b><p className="mt-1 text-muted-foreground">Transaction-based charges may apply.</p></div><div><b>Market-data APIs</b><p className="mt-1 text-muted-foreground">Live market feeds can require a separate paid subscription.</p></div></div></Panel></div><div className="mt-5 rounded-xl border border-line bg-white/[0.03] p-4"><div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Source note</div><p className="mt-2 text-[11px] leading-5 text-muted-foreground">This page is the in-app accessible version of the Operational Cost Estimate. The original estimate gives a basic platform range of ₹3,000–₹6,000 per month, with usage-based costs treated separately.</p><button type="button" onClick={()=>window.print()} className="mt-4 rounded-lg border border-line px-3 py-2 font-mono text-[10px] uppercase hover:bg-white/[0.05]">Print / Save as PDF</button></div></div></Shell>;
}
