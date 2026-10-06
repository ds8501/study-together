"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, BookOpen, Check, Flame, Sparkles } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import Auth3DPortal from "./three/Auth3DPortal";

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get("authError");
    if (authError === "google") setError("Google sign-in could not be completed. Please try again or use email and password.");
    else if (authError === "google_not_configured") setError("Google sign-in is not configured yet. Please use email and password.");
    else if (authError === "google_email") setError("Use a Gmail or Google Workspace account, or sign in with email and password.");
    if (authError) {
      params.delete("authError");
      const query = params.toString();
      window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
    }
  }, []);

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
    <main className="auth-page" style={{ position: "relative", overflow: "hidden" }}>
      <Auth3DPortal />
      <section className="auth-form-panel" style={{ position: "relative", zIndex: 1 }}>
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

          <a className="auth-google-button" href={`${api}/auth/google`} aria-label="Continue with Google">
            <svg aria-hidden="true" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.9c-.58 2.96-2.26 5.48-4.76 7.18l7.72 5.99c4.5-4.16 7.12-10.28 7.12-17.64Z"/><path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.2A23.9 23.9 0 0 0 0 24c0 3.88.93 7.57 2.56 10.78l7.97-6.19Z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.81l-7.72-5.99c-2.14 1.44-4.88 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"/></svg>
            Continue with Google
          </a>
          <div className="auth-or-divider"><span>OR CONTINUE WITH EMAIL</span></div>

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
