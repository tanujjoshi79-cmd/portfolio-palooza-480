import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shell, Panel } from "@/components/tti/Shell";
import { setCourseUser } from "@/lib/course-access";
import { getCurrentUserFn, loginFn, logoutFn, signupFn } from "@/lib/auth.functions";

type AccountUser = NonNullable<Awaited<ReturnType<typeof getCurrentUserFn>>>;

export const Route = createFileRoute("/account")({ component: Account });

function Account() {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    getCurrentUserFn()
      .then((currentUser) => {
        setUser(currentUser);
        if (currentUser) setCourseUser(currentUser);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleStatus = params.get("google");
    if (googleStatus === "success") setMessage("Google login successful.");
    if (googleStatus === "cancelled") setMessage("Google sign-in was cancelled.");
    if (googleStatus === "error") setMessage("Google sign-in failed. Please try again.");
  }, []);

  const submit = async () => {
    setMessage("");
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail || !password || (mode === "signup" && !cleanName)) {
      setMessage("Please fill all required fields.");
      return;
    }

    try {
      const result = mode === "signup"
        ? await signupFn({ data: { fullName: cleanName, email: cleanEmail, password } })
        : await loginFn({ data: { email: cleanEmail, password } });

      if ("error" in result && result.error) {
        setMessage(result.error);
        if (mode === "signup" && result.error.includes("already exists")) setMode("login");
        return;
      }

      if (result.user) {
        setUser(result.user);
        setCourseUser(result.user);
        setPassword("");
        setMessage(mode === "signup" ? "Account created successfully." : "Login successful.");
      }
    } catch {
      setMessage("Unable to connect to the account server. Please try again.");
    }
  };

  const logout = async () => {
    try {
      await logoutFn();
      localStorage.removeItem("tti-user");
      setUser(null);
      setMessage("Logged out.");
    } catch {
      setMessage("Logout failed. Please try again.");
    }
  };

  const googleLogin = () => {
    window.location.assign("/auth/google");
  };

  return (
    <Shell>
      <div className="mx-auto max-w-xl py-4">
        <Panel title="My Account" tag="TTI ACCOUNT">
          <div className="p-5 space-y-5">
            {loading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Checking account...</div>
            ) : user ? (
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

                <button type="button" onClick={googleLogin} className="flex w-full items-center justify-center gap-3 rounded-lg border border-line bg-white px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-gray-900 hover:bg-gray-100">
                  <span className="text-base font-bold">G</span>
                  Continue with Google
                </button>

                <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  <div className="h-px flex-1 bg-line" />
                  <span>or continue with email</span>
                  <div className="h-px flex-1 bg-line" />
                </div>

                {mode === "signup" && <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" className="w-full rounded-lg border border-line bg-white/[0.03] px-3 py-3 text-sm outline-none" />}
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email" className="w-full rounded-lg border border-line bg-white/[0.03] px-3 py-3 text-sm outline-none" />
                <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (minimum 8 characters)" type="password" className="w-full rounded-lg border border-line bg-white/[0.03] px-3 py-3 text-sm outline-none" />
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
