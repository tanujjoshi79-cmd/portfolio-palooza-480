import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, Panel } from "@/components/tti/Shell";

export const Route = createFileRoute("/course-pricing")({ component: CoursePricing });

function CoursePricing() {
  return <Shell>
    <div className="mx-auto max-w-4xl py-4">
      <div className="mb-6 text-center"><div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">TTI Academy</div><h1 className="mt-2 font-display text-3xl font-bold">Course Pricing</h1><p className="mt-2 text-sm text-muted-foreground">Complete access to the TTI course library.</p></div>
      <Panel title="Stock Market Course" tag="FULL ACCESS">
        <div className="p-6 text-center"><div className="font-mono text-xs text-muted-foreground">ONE-TIME COURSE FEE</div><div className="mt-2 font-display text-5xl font-bold">₹40,000</div><div className="mt-2 text-xs text-muted-foreground">Forty thousand rupees</div>
          <div className="mx-auto mt-6 max-w-md rounded-lg border border-line bg-white/[0.03] p-4 text-left"><div className="mb-3 font-display font-semibold">Includes</div>{['All available course lectures','Access to the complete lecture library','Course progress tracking','Future lectures added to this course'].map(x=><div key={x} className="flex gap-2 border-b border-line py-2 last:border-0"><span className="text-up">✓</span><span className="text-xs">{x}</span></div>)}</div>
          <Link to="/courses" className="mt-6 inline-flex rounded-lg border border-up/40 bg-up/10 px-6 py-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-up hover:bg-up/20">Enroll for ₹40,000</Link>
          <div className="mt-3 font-mono text-[9px] text-muted-foreground">Click to proceed to the course access page.</div>
        </div>
      </Panel>
    </div>
  </Shell>;
}
