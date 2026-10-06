"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Dashboard from "./Dashboard";
import LoginScreen from "./LoginScreen";

const API = process.env.NODE_ENV === "production" ? "/api" : process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";
type User = { id: string | number; name: string; email: string; avatar: string | null };
type Workspace = { id: string | number; name: string; inviteCode?: string; members: Array<{ user: User; role: string }> };
type Plan = { id: string | number; owner: { id: string | number; name: string; avatar: string | null }; topics: Array<{ id: string; title: string; description: string | null; dayNumber: number | null; estimatedHours: number | null; status: string; difficulty: string; category: { name: string } | null }> };
export type MonthDay = { key: string; dayNumber: number; dayOfWeek: string; active: boolean; today: boolean; future: boolean };
export type StudyStats = { currentStreak: number; bestStreak: number; totalDaysStudiedThisMonth?: number; monthName?: string; year?: number; month?: MonthDay[]; week: Array<{ key: string; label: string; active: boolean; today: boolean }> };
type SessionData = { user: User; workspace: Workspace; plans: Plan[]; stats: StudyStats };

export default function StudyTogetherApp(){
  const router = useRouter();
  const pathname = usePathname();
  const [data, setData] = useState<SessionData|null>(null);
  const [error, setError] = useState("");

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
      if (pathname === "/login") {
        router.replace("/dashboard");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load workspace");
    }
  }

  useEffect(() => {
    fetch(`${API}/auth/me`, { credentials: "include" })
      .then(async r => {
        if (!r.ok) return null;
        const { user } = await r.json();
        await load(user);
        return user;
      })
      .catch(() => {});
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
          void load(user).then(() => {
            window.location.href = "/dashboard";
          });
        }}
      />
    );
  }

  // When on /dashboard page (or any workspace view)
  const currentPlan = data?.plans.find(p => String(p.owner.id) === String(data.user.id));
  const friendPlan = data?.plans.find(p => String(p.owner.id) !== String(data.user.id));

  const topics = data ? [
    ...(currentPlan?.topics ?? []).map(t => ({
      id: t.id,
      title: t.title,
      category: t.category?.name ?? "General",
      status: (t.status === "COMPLETED" ? "Completed" : t.status === "IN_PROGRESS" ? "In progress" : "Not started") as "Completed" | "In progress" | "Not started",
      difficulty: t.difficulty[0] + t.difficulty.slice(1).toLowerCase(),
      hours: t.estimatedHours ?? 1,
      day: t.dayNumber ?? 1,
      owner: "Divya" as const,
      description: t.description ?? "A learning milestone on your personal roadmap."
    })),
    ...(friendPlan?.topics ?? []).map(t => ({
      id: t.id,
      title: t.title,
      category: t.category?.name ?? "General",
      status: (t.status === "COMPLETED" ? "Completed" : t.status === "IN_PROGRESS" ? "In progress" : "Not started") as "Completed" | "In progress" | "Not started",
      difficulty: t.difficulty[0] + t.difficulty.slice(1).toLowerCase(),
      hours: t.estimatedHours ?? 1,
      day: t.dayNumber ?? 1,
      owner: "Alex" as const,
      description: t.description ?? "A learning milestone on your personal roadmap."
    })),
  ] : [];

  return (
    <Dashboard
      initialTopics={topics}
      initialStats={data?.stats}
      currentName={data?.user.name ?? "Divya Singh"}
      currentEmail={data?.user.email ?? ""}
      friendName={friendPlan?.owner.name ?? data?.workspace.members.find(m => m.user.id !== data.user.id)?.user.name ?? "Study partner"}
      workspaceName={data?.workspace.name ?? "Study Together Room"}
      memberCount={data?.workspace.members.length ?? 1}
      api={API}
      planId={currentPlan?.id != null ? String(currentPlan.id) : undefined}
      inviteCode={data?.workspace.inviteCode}
      isAuthenticated={!!data}
    />
  );
}
