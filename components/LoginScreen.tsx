"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, BookOpen, Check, Flame, Sparkles } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

type User = { id: string; name: string; email: string; avatar: string | null };
type AuthResult = { user?: User; error?: string };

export default function LoginScreen({ api, onAuthenticated, error: initialError }: { api: string; onAuthenticated: (user: User) => void; error?: string }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspaceName, setWorkspaceName] = useState("Study Room");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState(initialError ?? "");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const registering = mode === "register";
      const body = registering
        ? { name, email, password, ...(inviteCode.trim() ? { inviteCode: inviteCode.trim() } : { workspaceName }) }
        : { email, password };
      const response = await fetch(`${api}${registering ? "/auth/register" : "/auth/login"}`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const responseText = await response.text();
      let result: AuthResult;
      try {
        result = JSON.parse(responseText) as AuthResult;
      } catch {
        throw new Error(`The server returned an unexpected response (${response.status}). Please try again shortly.`);
      }
      if (!response.ok) throw new Error(result.error ?? "Could not sign in");
      if (!result.user) throw new Error("The server response did not include your account. Please try again.");
      onAuthenticated(result.user);
    } catch (cause) {
      setError(cause instanceof TypeError ? `Cannot reach the API at ${api}. Please try again shortly.` : cause instanceof Error ? cause.message : "Could not connect to the study workspace API");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-form-panel">
        <header className="auth-header">
          <a className="auth-brand" href="/" aria-label="Study Together home">
            <span className="auth-brand-mark"><BookOpen size={17} strokeWidth={2.4} /></span>
            <span>Study<span>Together</span></span>
          </a>
          <span className="auth-header-note">LEARN AT YOUR PACE</span>
        </header>

        <div className="auth-form-wrap">
          <div className="auth-mode-tabs" role="tablist" aria-label="Account access">
            <button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "selected" : ""} onClick={() => { setError(""); setMode("login"); }}>Sign in</button>
            <button type="button" role="tab" aria-selected={mode === "register"} className={mode === "register" ? "selected" : ""} onClick={() => { setError(""); setMode("register"); }}>Create account</button>
          </div>
          <span className="auth-kicker"><Sparkles size={13} /> YOUR NEXT CHAPTER STARTS HERE</span>
          <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p className="auth-subtitle">{mode === "login" ? "Pick up where you left off and keep your streak alive." : "Build a study rhythm with friends and your own learning roadmap."}</p>

          <form className="auth-form" onSubmit={submit}>
            {mode === "register" && <label className="auth-field"><span>Your name</span><input required autoComplete="name" value={name} onChange={event => setName(event.target.value)} placeholder="Full name" /></label>}
            <label className="auth-field"><span>Email address</span><input required type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="name@example.com" /></label>
            <label className="auth-field"><span>Password</span><input required type="password" minLength={mode === "register" ? 10 : 1} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={event => setPassword(event.target.value)} placeholder={mode === "register" ? "At least 10 characters" : "Enter your password"} /></label>
            {mode === "register" && <>
              <label className="auth-field"><span>Workspace invite code <em>· optional</em></span><input value={inviteCode} onChange={event => setInviteCode(event.target.value)} placeholder="Enter your friend’s code to join" /></label>
              {!inviteCode.trim() && <label className="auth-field"><span>New workspace name</span><input required value={workspaceName} onChange={event => setWorkspaceName(event.target.value)} placeholder="Study Room" /></label>}
            </>}
            {error && <div className="auth-error" role="alert">{error}</div>}
            <button className="auth-submit" type="submit" disabled={busy}>
              <span>{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</span>
              {!busy && <ArrowRight size={17} />}
            </button>
          </form>

          <p className="auth-switch">
            {mode === "login" ? "New to Study Together?" : "Already have an account?"}
            <button type="button" onClick={() => { setError(""); setMode(mode === "login" ? "register" : "login"); }}>
              {mode === "login" ? "Create an account" : "Sign in"}
            </button>
          </p>
          {mode === "register" && !inviteCode.trim() && <p className="auth-invite-hint">Your friend can share their workspace invite code from Settings.</p>}
        </div>

        <footer className="auth-footer">A little progress, made consistently.</footer>
      </section>

      <aside className="auth-showcase">
        <div className="auth-orb auth-orb-one" /><div className="auth-orb auth-orb-two" />
        <div className="auth-showcase-top"><span className="auth-brand-lockup"><span className="auth-brand-mark"><Flame size={17}/></span><strong>StudyPulse</strong></span><ThemeToggle/></div>
        <div className="auth-showcase-content">
          <div className="auth-illustration" aria-hidden="true">
            <div className="auth-illustration-window"><span /><span /><span /></div>
            <div className="auth-book auth-book-one" /><div className="auth-book auth-book-two" /><div className="auth-plant"><i /><i /><i /><b /></div>
            <div className="auth-glass-card">
              <div className="auth-glass-icon"><Flame size={19} /></div>
              <div className="auth-glass-overline">STUDY TOGETHER, GROW FASTER</div>
              <h2>Your daily study<br />accountability engine.</h2>
              <p>Build streaks, craft a personal roadmap, and watch your friends’ progress in real time.</p>
              <div className="auth-benefit"><span><Flame size={13} /></span><div><strong>Daily streaks</strong><small>Build a steady habit, one session at a time</small></div></div>
              <div className="auth-benefit"><span className="mint"><Check size={12} /></span><div><strong>Roadmaps &amp; friends</strong><small>Make a plan and grow together</small></div></div>
            </div>
            <div className="auth-floor" />
          </div>
          <div className="auth-showcase-caption"><span>SHOW UP. MAKE PROGRESS.</span><p>Your next study session starts here.</p></div>
        </div>
        <div className="auth-showcase-footer"><span>Plan thoughtfully</span><i /> <span>Learn steadily</span><i /> <span>Grow together</span></div>
      </aside>
    </main>
  );
}
