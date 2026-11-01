"use client";

import { useRef } from "react";
import { Flame, Sparkles } from "lucide-react";

const levels = ["Curious", "Focused", "Builder", "Scholar", "Mentor"];

export default function Settings3DIdentity({
  name, workspaceName, streak, bestStreak, totalStudyMinutes, completedTopics, memberSince, avatar
}: {
  name: string; workspaceName: string; streak: number; bestStreak: number;
  totalStudyMinutes: number; completedTopics: number; memberSince?: string; avatar?: string | null;
}) {
  const card = useRef<HTMLElement>(null);
  const hours = Math.floor(totalStudyMinutes / 60);
  const level = Math.min(levels.length - 1, Math.floor(hours / 5));
  const initials = name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase() || "ST";
  const since = memberSince ? new Date(memberSince).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "—";

  function tilt(event: React.PointerEvent<HTMLElement>) {
    if (event.pointerType === "touch" || !card.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.current.style.setProperty("--id-rotate-x", `${-y * 11}deg`);
    card.current.style.setProperty("--id-rotate-y", `${x * 14}deg`);
  }

  return <section className="profile-id-wrap" aria-label="Study Together member card">
    <article ref={card} className="profile-id-card" onPointerMove={tilt} onPointerLeave={() => {
      card.current?.style.setProperty("--id-rotate-x", "0deg");
      card.current?.style.setProperty("--id-rotate-y", "0deg");
    }}>
      <div className="profile-id-shine" aria-hidden="true" />
      <div className="profile-id-top"><span><Sparkles size={14}/> STUDY TOGETHER</span><span className="profile-id-chip">MEMBER</span></div>
      <div className="profile-id-person">
        <div className="profile-id-avatar">{avatar?.startsWith("emoji:") ? avatar.slice(6) : initials}</div>
        <div className="profile-id-name"><small>LEARNER ID</small><h2>{name}</h2><span>{workspaceName}</span></div>
      </div>
      <div className="profile-id-stats">
        <div><small>STREAK</small><strong><Flame size={15}/>{streak} {streak === 1 ? "day" : "days"}</strong></div>
        <div><small>LEVEL {String(level + 1).padStart(2, "0")}</small><strong>{levels[level]}</strong></div>
        <div><small>MEMBER SINCE</small><strong>{since}</strong></div>
      </div>
      <div className="profile-id-footer"><span>BEST STREAK <b>{bestStreak} {bestStreak === 1 ? "day" : "days"}</b></span><span>TOPICS <b>{completedTopics} complete</b></span><span>{String(hours).padStart(2, "0")} HRS</span></div>
    </article>
  </section>;
}
