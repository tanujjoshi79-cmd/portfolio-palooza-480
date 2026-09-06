import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shell, Panel } from "@/components/tti/Shell";
import { getCourseUser, setCourseUser } from "@/lib/course-access";

export const Route = createFileRoute("/account")({ component: Account });
function Account() {
  const existing = getCourseUser();
  const [user, setUser] = useState(existing);
  const [name, setName] = useState(existing?.name || "");
  const [email, setEmail] = useState(existing?.email || "");
  const save = () => { const u={id:existing?.id||crypto.randomUUID(),name:name.trim(),email:email.trim(),isAdmin:existing?.isAdmin,coursePaid:existing?.coursePaid}; setCourseUser(u); setUser(u); };
  return <Shell><div className="mx-auto max-w-xl py-4"><Panel title="My Account" tag="TTI ACCOUNT"><div className="p-5">{user ? <div className="space-y-4"><div className="rounded-lg border border-line bg-white/[0.03] p-4"><div className="font-display text-lg font-semibold">{user.name}</div><div className="mt-1 font-mono text-[10px] text-muted-foreground">{user.email}</div></div><div className="rounded-lg border border-line p-4"><div className="font-mono text-[10px] uppercase text-muted-foreground">Course access</div><div className="mt-2 text-sm">{user.isAdmin || user.coursePaid ? "✓ Course unlocked" : "🔒 Course locked — payment required"}</div></div><Link to={user.isAdmin || user.coursePaid ? "/courses" : "/course-pricing"} className="inline-flex rounded-lg border border-up/40 bg-up/10 px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-up">{user.isAdmin || user.coursePaid ? "Open Courses" : "Enroll for ₹40,000"}</Link></div> : <div className="space-y-3"><input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="w-full rounded-lg border border-line bg-white/[0.03] px-3 py-3 text-sm outline-none"/><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" type="email" className="w-full rounded-lg border border-line bg-white/[0.03] px-3 py-3 text-sm outline-none"/><button type="button" onClick={save} disabled={!name.trim()||!email.trim()} className="rounded-lg border border-up/40 bg-up/10 px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-up disabled:opacity-40">Create Account</button></div>}</div></Panel></div></Shell>;
}
