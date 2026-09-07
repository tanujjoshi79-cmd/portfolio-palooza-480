import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell, Panel } from "@/components/tti/Shell";

export const Route = createFileRoute("/free-courses")({ component: FreeCourses });

const freeCourses = [
  {
    id: "market-introduction",
    title: "Stock Market Introduction",
    description: "Understand the basics of stocks, exchanges, indices, demat accounts and market terminology.",
    lessons: ["What is the stock market?", "Stocks, exchanges & indices", "Demat and trading accounts", "Basic market terminology"],
  },
  {
    id: "risk-management",
    title: "Trading Risk Management",
    description: "Learn simple concepts for position sizing, stop-losses and managing trading risk.",
    lessons: ["Risk per trade", "Stop-loss basics", "Position sizing", "Trading discipline"],
  },
  {
    id: "technical-analysis-basics",
    title: "Technical Analysis Basics",
    description: "Get familiar with charts, trends, support, resistance and common indicators.",
    lessons: ["Reading price charts", "Trend identification", "Support & resistance", "Indicators overview"],
  },
];

function FreeCourses() {
  return (
    <Shell>
      <div className="mb-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-up">TTI Academy</div>
        <h1 className="mt-1 font-display text-2xl font-bold">Free Courses</h1>
        <p className="mt-1 text-[12px] text-muted-foreground">Start learning the fundamentals for free.</p>
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {freeCourses.map((course, index) => (
          <Panel key={course.id} title={course.title} tag={`FREE · ${String(index + 1).padStart(2, "0")}`}>
            <div className="p-5">
              <p className="text-[12px] leading-5 text-muted-foreground">{course.description}</p>
              <div className="mt-4 space-y-2">
                {course.lessons.map((lesson, i) => (
                  <div key={lesson} className="flex items-center gap-2 rounded-lg border border-line bg-white/[0.02] px-3 py-2">
                    <span className="font-mono text-[9px] text-up">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-[11px]">{lesson}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-wider text-up">Free access</span>
                <Link to="/account" className="rounded-lg border border-up/40 bg-up/10 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-up">Start Learning</Link>
              </div>
            </div>
          </Panel>
        ))}
      </div>
      <div className="mt-6">
        <Panel title="Paid Courses" tag="₹40,000">
          <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-display text-sm font-semibold">Stock Market Basics — Premium Lecture Library</div>
              <div className="mt-1 text-[11px] text-muted-foreground">The eight existing YouTube lectures are reserved for paid-course access.</div>
            </div>
            <Link to="/course-pricing" className="shrink-0 rounded-lg border border-up/40 bg-up/10 px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-up">View Paid Course</Link>
          </div>
        </Panel>
      </div>
    </Shell>
  );
}
