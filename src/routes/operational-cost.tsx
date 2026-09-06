import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell, Panel } from "@/components/tti/Shell";

export const Route = createFileRoute("/operational-cost")({ component: OperationalCost });

const rows = [
  ["Hosting / deployment", "₹1,000–₹3,000 / month", "Basic platform infrastructure"],
  ["Database / backend", "₹500–₹1,500 / month", "Depends on usage"],
  ["Domain / email / misc.", "₹500–₹1,500 / month", "Typical recurring essentials"],
  ["Estimated basic platform total", "₹3,000–₹6,000 / month", "Initial estimate; usage-based services extra"],
] as const;

const variable = [
  ["Video hosting & delivery", "Scales with storage, bandwidth and number of students."],
  ["OTP / SMS", "Depends on login and verification volume."],
  ["Payment gateway", "Transaction-based charges may apply."],
  ["Market-data APIs", "Live market feeds can require a separate paid subscription."],
] as const;

function Detail({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return <div className="border-b border-line last:border-b-0"><button type="button" onClick={() => setOpen(v => !v)} className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left hover:bg-white/[0.04]"><span className="text-[12px] font-medium">{title}</span><span className="grid size-6 shrink-0 place-items-center rounded-md border border-line font-mono text-[13px]">{open ? "−" : "+"}</span></button>{open && <div className="px-4 pb-4 text-[11px] leading-5 text-muted-foreground">{children}</div>}</div>;
}

function OperationalCost() {
  return <Shell><div className="mx-auto max-w-5xl"><div className="mb-5"><div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Planning · August 2026</div><h1 className="mt-1 font-display text-2xl font-bold">Operational Cost Estimate</h1><p className="mt-1 text-[12px] text-muted-foreground">Tap any section below to open its complete details.</p></div>
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel title="Monthly Estimate" tag="TAP TO EXPAND"><div>{rows.map(([item,cost,note],i)=><Detail key={item} title={item} defaultOpen={i===3}><div className="flex flex-wrap items-center justify-between gap-3"><span>{note}</span><strong className="font-mono text-foreground">{cost}</strong></div></Detail>)}</div></Panel>
      <Panel title="Additional / Usage Costs" tag="TAP TO EXPAND"><div>{variable.map(([title,desc])=><Detail key={title} title={title}><p>{desc}</p><p className="mt-2">This is a variable operating expense and is separate from the basic platform estimate.</p></Detail>)}</div></Panel>
    </div>
    <div className="mt-5"><Panel title="Cost Calculator & Notes" tag="TAP TO EXPAND"><div><Detail title="What is included in ₹3,000–₹6,000/month?" defaultOpen><p>The estimate covers the basic recurring platform infrastructure represented by hosting/deployment, database/backend and domain/email/miscellaneous essentials.</p></Detail><Detail title="What is NOT included?"><p>Video delivery, OTP/SMS, payment-processing charges and paid live market-data subscriptions are treated as usage-based or separate costs.</p></Detail><Detail title="Source note"><p>This page is the in-app accessible version of the Operational Cost Estimate. The original estimate gives a basic platform range of ₹3,000–₹6,000 per month, with usage-based costs treated separately.</p></Detail></div></Panel></div>
    <button type="button" onClick={() => window.print()} className="mt-5 rounded-lg border border-line bg-white/[0.03] px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider hover:bg-white/[0.06]">Print / Save as PDF</button>
  </div></Shell>;
}
