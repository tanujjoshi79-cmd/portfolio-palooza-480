import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shell, Panel } from "@/components/tti/Shell";
import { getCourseUser, setCourseUser } from "@/lib/course-access";

export const Route = createFileRoute("/account")({ component: Account });

function Account() {
  const existing = getCourseUser();
  const [user, setUser] = useState(existing);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const submit = () => {
    setMessage("");
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    if (!cleanEmail || !password || (mode === "signup" && !cleanName)) {
      setMessage("Please fill all required fields.");
      return;
    }

    const stored = localStorage.getItem("tti-account");
    const account = stored ? JSON.parse(stored) : null;

    if (mode === "signup") {
      if (account?.email === cleanEmail) {
        setMessage("Account already exists. Please login.");
        setMode("login");
        return;
      }
      const newAccount = {
        id: crypto.randomUUID(),
        name: cleanName,
        email: cleanEmail,
        password,
      };
      localStorage.setItem("tti-account", JSON.stringify(newAccount));
      const courseUser = { id: newAccount.id, name: newAccount.name, email: newAccount.email };
      setCourseUser(courseUser);
      setUser(courseUser);
      setMessage("Account created successfully.");
      return;
    }

    if (!account || account.email !== cleanEmail || account.password !== password) {
      setMessage("Invalid email or password.");
      return;
    }

    const courseUser = { id: account.id, name: account.name, email: account.email };
    setCourseUser(courseUser);
    setUser(courseUser);
    setMessage("Login successful.");
  };

  const logout = () => {
    localStorage.removeItem("tti-user");
    setUser(null);
    setMessage("Logged out.");
  };

  return (
    <Shell>
      <div className="mx-auto max-w-xl py-4">
        <Panel title="My Account" tag="TTI ACCOUNT">
          <div className="p-5 space-y-5">
            {user ? (
              <>
                <div className="rounded-lg border border-line bg-white/[0.03] p-4">
                  <div className="font-display text-lg font-semibold">{user.name}</div>
                  <div className="mt-1 font-mono text-[10px] text-muted-foreground">{user.email}</div>
                </div>
                <div className="rounded-lg border border-line p-4">
                  <div className="font-mono text-[10px] uppercase text-muted-foreground">Course access</div>
                  <div className="mt-2 text-sm">{user.isAdmin || user.coursePaid ? "✓ Course unlocked" : "🔒 Course locked — payment required"}</div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link to={user.isAdmin || user.coursePaid ? "/courses" : "/course-pricing"} className="inline-flex rounded-lg border border-up/40 bg-up/10 px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-up">
                    {user.isAdmin || user.coursePaid ? "Open Courses" : "Enroll for ₹40,000"}
                  </Link>
                  <button type="button" onClick={logout} className="rounded-lg border border-line px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Log out</button>
                </div>
                {message && <div className="text-xs text-up">{message}</div>}
              </>
            ) : (
              <>
                <div className="flex rounded-lg border border-line p-1">
                  <button type="button" onClick={() => { setMode("login"); setMessage(""); }} className={`flex-1 rounded-md px-4 py-2 font-mono text-[10px] uppercase tracking-wider ${mode === "login" ? "bg-white/10 text-white" : "text-muted-foreground"}`}>Sign In</button>
                  <button type="button" onClick={() => { setMode("signup"); setMessage(""); }} className={`flex-1 rounded-md px-4 py-2 font-mono text-[10px] uppercase tracking-wider ${mode === "signup" ? "bg-white/10 text-white" : "text-muted-foreground"}`}>Sign Up</button>
                </div>

                {mode === "signup" && <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" className="w-full rounded-lg border border-line bg-white/[0.03] px-3 py-3 text-sm outline-none" />}
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email" className="w-full rounded-lg border border-line bg-white/[0.03] px-3 py-3 text-sm outline-none" />
                <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full rounded-lg border border-line bg-white/[0.03] px-3 py-3 text-sm outline-none" />
                <button type="button" onClick={submit} className="w-full rounded-lg border border-up/40 bg-up/10 px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-up">
                  {mode === "login" ? "Sign In" : "Create Account"}
                </button>
                {message && <div className="text-xs text-muted-foreground">{message}</div>}
                <div className="text-center text-xs text-muted-foreground">
                  {mode === "login" ? "New to TTI? " : "Already have an account? "}
                  <button type="button" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setMessage(""); }} className="text-up underline">
                    {mode === "login" ? "Sign Up" : "Sign In"}
                  </button>
                </div>
              </>
            )}
          </div>
        </Panel>
      </div>
    </Shell>
  );
}
