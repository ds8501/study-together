"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Dashboard from "./Dashboard";
import LoginScreen from "./LoginScreen";
import { getApiBaseUrl } from "@/lib/api-base";

const API = getApiBaseUrl();
type User = { id: string | number; name: string; email: string; avatar: string | null; createdAt?: string | null };
type Workspace = { id: string | number; name: string; inviteCode?: string; members: Array<{ user: User; role: string }> };
type Plan = { id: string | number; owner: { id: string | number; name: string; avatar: string | null }; topics: Array<{ id: string | number; title: string; description: string | null; dayNumber: number | null; order?: number; estimatedHours: number | null; status: string; difficulty: string; category: { name: string } | null }> };
export type MonthDay = { key: string; dayNumber: number; dayOfWeek: string; active: boolean; today: boolean; future: boolean; topicsStudied?: number; minutesStudied?: number };
export type StudyStats = { currentStreak: number; bestStreak: number; totalStudyMinutes?: number; totalDaysStudiedThisMonth?: number; monthName?: string; year?: number; month?: MonthDay[]; week: Array<{ key: string; label: string; active: boolean; today: boolean }> };
type SessionData = { user: User; workspace: Workspace; plans: Plan[]; stats: StudyStats };

export default function StudyTogetherApp(){
  const router = useRouter();
  const pathname = usePathname();
  const [data, setData] = useState<SessionData|null>(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<User|null>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [error, setError] = useState("");

  function handleProfileUpdated(user: User) {
    setAuthenticatedUser(user);
    setData(previous => previous ? {
      ...previous,
      user,
      workspace: { ...previous.workspace, members: previous.workspace.members.map(member => String(member.user.id) === String(user.id) ? { ...member, user } : member) }
    } : previous);
  }

  async function load(user?: User) {
    try {
      const [workspaceRes, plansRes, statsRes] = await Promise.all([
        fetch(`${API}/workspace`, { credentials: "include" }),
        fetch(`${API}/study-plans`, { credentials: "include" }),
        fetch(`${API}/study-stats`, { credentials: "include" })
      ]);
      if (!workspaceRes.ok || !plansRes.ok || !statsRes.ok)
        throw new Error("We could not load your workspace. Please sign in again.");
      const workspace: Workspace = await workspaceRes.json();
      const { plans }: { plans: Plan[] } = await plansRes.json();
      const stats: StudyStats = await statsRes.json();
      const current = user ?? (await fetch(`${API}/auth/me`, { credentials: "include" }).then(r => r.json())).user;
      setData({ user: current, workspace, plans, stats });
      setError("");
      if (pathname === "/login") {
        router.replace("/dashboard");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load workspace");
    }
  }

  useEffect(() => {
    // Localhost and 127.0.0.1 have separate host-only session cookies. Use
    // one canonical dev host so a valid local session is not mistaken for a
    // signed-out account when the app is opened through the other alias.
    if (window.location.hostname === "localhost") {
      const canonicalUrl = new URL(window.location.href);
      canonicalUrl.hostname = "127.0.0.1";
      window.location.replace(canonicalUrl.toString());
      return;
    }

    fetch(`${API}/auth/me`, { credentials: "include" })
      .then(async r => {
        // Only show the signed-out preview after the API explicitly confirms
        // there is no session. A network/API failure is not an auth result.
        if (!r.ok) {
          if (r.status === 401) setAuthResolved(true);
          else {
            setError("We couldn’t connect to your study workspace.");
            setAuthResolved(true);
          }
          return null;
        }
        const { user } = await r.json();
        setAuthenticatedUser(user);
        await load(user);
        setAuthResolved(true);
        return user;
      })
      .catch(() => {
        setError("We couldn’t connect to your study workspace.");
        setAuthResolved(true);
      });
  }, []);

  // When on /login page
  if (pathname === "/login") {
    if (data) {
      router.replace("/dashboard");
      return null;
    }
    return (
      <LoginScreen
        api={API}
        error={error}
        onAuthenticated={user => {
          setError("");
          setAuthenticatedUser(user);
          setAuthResolved(true);
          void load(user).then(() => {
            window.location.href = "/dashboard";
          });
        }}
      />
    );
  }

  if (!authResolved) {
    return <main className="app-loading" role="status" aria-live="polite" aria-busy="true"><div className="skeleton-brand"/><div className="skeleton-toolbar"/><div className="skeleton-hero"><div/><div/><div/></div><div className="skeleton-content"><div/><div/><div/></div><span className="visually-hidden">Loading your study workspace…</span></main>;
  }

  if (error) {
    return <main className="workspace-error"><div className="workspace-error-card"><span className="eyebrow">STUDY TOGETHER</span><h1>We couldn’t load your workspace</h1><p>{error}</p><button type="button" className="button-primary" onClick={() => window.location.reload()}>Try again</button></div></main>;
  }

  // When on /dashboard page (or any workspace view)
  const currentPlan = data?.plans.find(p => String(p.owner.id) === String(data.user.id));
  const friendPlan = data?.plans.find(p => String(p.owner.id) !== String(data.user.id));

  const topics = data ? [
    ...(currentPlan?.topics ?? []).map(t => ({
      id: String(t.id),
      title: t.title,
      category: t.category?.name ?? "General",
      status: (t.status === "COMPLETED" ? "Completed" : t.status === "IN_PROGRESS" ? "In progress" : "Not started") as "Completed" | "In progress" | "Not started",
      difficulty: t.difficulty[0] + t.difficulty.slice(1).toLowerCase(),
      hours: t.estimatedHours ?? 1,
      day: t.dayNumber ?? 1,
      order: t.order ?? 0,
      owner: "Divya" as const,
      description: t.description ?? "A learning milestone on your personal roadmap."
    })),
    ...(friendPlan?.topics ?? []).map(t => ({
      id: String(t.id),
      title: t.title,
      category: t.category?.name ?? "General",
      status: (t.status === "COMPLETED" ? "Completed" : t.status === "IN_PROGRESS" ? "In progress" : "Not started") as "Completed" | "In progress" | "Not started",
      difficulty: t.difficulty[0] + t.difficulty.slice(1).toLowerCase(),
      hours: t.estimatedHours ?? 1,
      day: t.dayNumber ?? 1,
      order: t.order ?? 0,
      owner: "Alex" as const,
      description: t.description ?? "A learning milestone on your personal roadmap."
    })),
  ] : [];

  return (
    <Dashboard
      initialTopics={topics}
      initialStats={data?.stats}
      currentName={authenticatedUser?.name ?? data?.user.name ?? "Divya Singh"}
      currentAvatar={authenticatedUser?.avatar ?? data?.user.avatar ?? null}
      memberSince={authenticatedUser?.createdAt ?? data?.user.createdAt ?? null}
      currentEmail={authenticatedUser?.email ?? data?.user.email ?? ""}
      friendName={friendPlan?.owner.name ?? data?.workspace.members.find(m => m.user.id !== data.user.id)?.user.name ?? "Study partner"}
      workspaceName={data?.workspace.name ?? "Study Together Room"}
      memberCount={data?.workspace.members.length ?? 1}
      api={API}
      planId={currentPlan?.id != null ? String(currentPlan.id) : undefined}
      inviteCode={data?.workspace.inviteCode}
      isAuthenticated={!!authenticatedUser}
      authResolved={authResolved}
      onProfileUpdated={handleProfileUpdated}
    />
  );
}
