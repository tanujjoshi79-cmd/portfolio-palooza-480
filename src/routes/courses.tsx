import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Shell, Panel } from "@/components/tti/Shell";
import { courses } from "@/data/courses";

export const Route = createFileRoute("/courses")({ component: Courses });

function Courses() {
  const course = courses[0];
  const [selected, setSelected] = useState(1);
  const [completed, setCompleted] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem("tti-course-progress") || "[]"); } catch { return []; }
  });
  const lecture = course.lectures.find((l) => l.id === selected) ?? course.lectures[0];
  const progress = Math.round((completed.length / course.lectures.length) * 100);

  useEffect(() => { localStorage.setItem("tti-course-progress", JSON.stringify(completed)); }, [completed]);
  const videoId = useMemo(() => lecture.url.match(/(?:live\/|youtu\.be\/|v=)([A-Za-z0-9_-]{11})/)?.[1], [lecture.url]);
  const toggleComplete = () => setCompleted((p) => p.includes(lecture.id) ? p.filter((id) => id !== lecture.id) : [...p, lecture.id]);

  return <Shell>
    <div className="mb-5"><div className="flex flex-wrap items-end justify-between gap-3"><div><div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">TTI Academy</div><h1 className="mt-1 font-display text-2xl font-bold">Courses</h1><p className="mt-1 text-[12px] text-muted-foreground">Learn trading step-by-step with your lecture library.</p></div><div className="min-w-52"><div className="mb-1 flex justify-between font-mono text-[10px] text-muted-foreground"><span>Course progress</span><span>{completed.length}/{course.lectures.length} · {progress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-up transition-all" style={{ width: `${progress}%` }} /></div></div></div></div>
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-12 lg:col-span-8"><Panel title={lecture.title} tag="VIDEO LECTURE" meta={`${selected} / ${course.lectures.length}`}><div className="aspect-video bg-black"><iframe className="h-full w-full" src={`https://www.youtube.com/embed/${videoId}?rel=0`} title={lecture.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div><div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3"><div><div className="font-display text-sm font-semibold">{course.title}</div><div className="font-mono text-[10px] text-muted-foreground">Lecture {lecture.id} · YouTube</div></div><button type="button" onClick={toggleComplete} className={`rounded-lg border px-3 py-2 font-mono text-[10px] uppercase tracking-wider ${completed.includes(lecture.id) ? "border-up/40 bg-up/10 text-up" : "border-line bg-white/[0.03] text-muted-foreground hover:text-foreground"}`}>{completed.includes(lecture.id) ? "✓ Completed" : "Mark Complete"}</button></div></Panel></div>
      <div className="col-span-12 lg:col-span-4"><Panel title="Lecture List" tag="(01)" meta={`${completed.length}/${course.lectures.length} DONE`}><div className="max-h-[520px] divide-y divide-line overflow-y-auto">{course.lectures.map((l) => <button key={l.id} type="button" onClick={() => setSelected(l.id)} className={`flex w-full items-center gap-3 px-4 py-3 text-left ${selected === l.id ? "bg-white/[0.07]" : "hover:bg-white/[0.04]"}`}><span className="grid size-7 shrink-0 place-items-center rounded-md border border-line font-mono text-[10px]">{completed.includes(l.id) ? "✓" : l.id}</span><span className="min-w-0 flex-1"><span className="block truncate text-[12px] font-medium">{l.title}</span><span className="font-mono text-[9px] text-muted-foreground">YouTube lecture</span></span><span className="font-mono text-[9px] text-muted-foreground">▶</span></button>)}</div></Panel></div>
    </div>
  </Shell>;
}
