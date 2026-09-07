import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Shell, Panel } from "@/components/tti/Shell";

export const Route = createFileRoute("/free-courses")({ component: FreeCourses });

const lectures = [
  { id: 1, title: "Lecture 1", url: "https://www.youtube.com/live/Y6thOCApJA8?si=bXP6hPLJmohL5GJX" },
  { id: 2, title: "Lecture 2", url: "https://www.youtube.com/live/sxmv3e3jYhI?si=oxJXgn3F8MkQaGOb" },
  { id: 3, title: "Lecture 3", url: "https://www.youtube.com/live/68teI7QC1ME?si=p-B9Qyz9cBptwoS_" },
  { id: 4, title: "Lecture 4", url: "https://www.youtube.com/live/Wd4BKzJDGuo?si=2Y89NSAGaIQ6iod0" },
  { id: 5, title: "Lecture 5", url: "https://www.youtube.com/live/n0Ux1DCKdkU?si=t0qli7lJx48306lz" },
  { id: 6, title: "Lecture 6", url: "https://www.youtube.com/live/8WUR2aVlT10?si=S9d_CHgSeeugCoi0" },
  { id: 7, title: "Lecture 7", url: "https://youtu.be/UhNYA33CfDw?si=vg_aPXVmFd1i84uI" },
  { id: 8, title: "Lecture 8", url: "https://youtu.be/kY-Dlcdplog?si=EL-u8OBu-Amc0XX5" },
];

function FreeCourses() {
  const [selected, setSelected] = useState(1);
  const lecture = lectures.find((l) => l.id === selected) ?? lectures[0];
  const videoId = useMemo(() => lecture.url.match(/(?:live\/|youtu\.be\/|v=)([A-Za-z0-9_-]{11})/)?.[1], [lecture.url]);

  return (
    <Shell>
      <div className="mb-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-up">TTI Academy</div>
        <h1 className="mt-1 font-display text-2xl font-bold">Free Courses</h1>
        <p className="mt-1 text-[12px] text-muted-foreground">These 8 lectures are free and available to everyone.</p>
      </div>
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8">
          <Panel title={lecture.title} tag="FREE VIDEO LECTURE" meta={`${selected} / ${lectures.length}`}>
            <div className="aspect-video bg-black">
              <iframe className="h-full w-full" src={`https://www.youtube.com/embed/${videoId}?rel=0`} title={lecture.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
            </div>
            <div className="border-t border-line px-4 py-3">
              <div className="font-display text-sm font-semibold">Stock Market Basics — Free Lectures</div>
              <div className="mt-1 font-mono text-[10px] text-muted-foreground">Lecture {lecture.id} · Free access · YouTube</div>
            </div>
          </Panel>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <Panel title="Free Lecture List" tag="(01)" meta="8 LECTURES">
            <div className="divide-y divide-line">
              {lectures.map((l) => (
                <button key={l.id} type="button" onClick={() => setSelected(l.id)} className={`flex w-full items-center gap-3 px-4 py-3 text-left ${selected === l.id ? "bg-white/[0.07]" : "hover:bg-white/[0.04]"}`}>
                  <span className="grid size-7 shrink-0 place-items-center rounded-md border border-line font-mono text-[10px]">{l.id}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-[12px] font-medium">{l.title}</span><span className="font-mono text-[9px] text-up">FREE · YouTube</span></span>
                  <span className="font-mono text-[9px] text-muted-foreground">▶</span>
                </button>
              ))}
            </div>
          </Panel>
        </div>
      </div>
      <div className="mt-6">
        <Panel title="Premium Course" tag="₹40,000">
          <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div><div className="font-display text-sm font-semibold">Advanced Trading Course</div><div className="mt-1 text-[11px] text-muted-foreground">Premium content will be available after payment.</div></div>
            <Link to="/course-pricing" className="shrink-0 rounded-lg border border-up/40 bg-up/10 px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-up">View ₹40,000 Course</Link>
          </div>
        </Panel>
      </div>
    </Shell>
  );
}
