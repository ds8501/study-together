"use client";

import { useEffect, useState } from "react";
import { Copy, RefreshCw, LogOut, Users, Check, LoaderCircle, PencilLine } from "lucide-react";
import { APP_NAME } from "@/lib/brand";

const avatars = ["🌿", "🌙", "🔥", "🌸", "🪴", "☀️", "🐳", "⭐"];

export default function WorkspaceSettings({
  name, email, avatar, workspaceName, memberCount, inviteCode, totalStudyMinutes, bestStreak, badgesEarned,
  onRotate, onLogout, onSaveProfile
}: {
  name: string; email: string; avatar?: string | null; workspaceName: string; memberCount: number;
  inviteCode?: string; totalStudyMinutes: number; bestStreak: number; badgesEarned: number;
  onRotate: () => void; onLogout: () => void;
  onSaveProfile: (name: string, avatar: string) => Promise<boolean>;
}) {
  const [draftName, setDraftName] = useState(name);
  const [draftAvatar, setDraftAvatar] = useState(avatar?.startsWith("emoji:") ? avatar.slice(6) : "🌿");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => { setDraftName(name); }, [name]);
  useEffect(() => { if (avatar?.startsWith("emoji:")) setDraftAvatar(avatar.slice(6)); }, [avatar]);

  async function save() {
    setSaving(true); setMessage("");
    try {
      const ok = await onSaveProfile(draftName.trim(), `emoji:${draftAvatar}`);
      setMessage(ok ? "Profile saved." : "We couldn’t save your profile. Try again.");
    } catch { setMessage("We couldn’t save your profile. Try again."); }
    finally { setSaving(false); }
  }

  return <>
    <div className="page-heading"><div><div className="eyebrow">YOUR {APP_NAME.toUpperCase()} ACCOUNT</div><h1>Profile</h1><p className="subheading">Your learning record, milestones, and account settings.</p></div></div>
    <section className="profile-stats-grid" aria-label="Study totals">
      <article className="profile-stat-card"><span>TOTAL STUDY TIME</span><strong>{(totalStudyMinutes / 60).toFixed(totalStudyMinutes >= 600 ? 0 : 1)} <small>hours</small></strong><p>Across all logged sessions</p></article>
      <article className="profile-stat-card"><span>BEST STREAK</span><strong>{bestStreak} <small>{bestStreak === 1 ? "day" : "days"}</small></strong><p>Your personal best</p></article>
      <article className="profile-stat-card"><span>BADGES EARNED</span><strong>{badgesEarned} <small>of 5</small></strong><p>Milestones reached</p></article>
    </section>
    <div className="profile-settings-grid">
      <section className="plan-box profile-edit-box">
        <div className="card-heading"><div><h3>Edit your profile</h3><div className="section-meta" style={{ marginTop: 5 }}>Choose how your study circle sees you.</div></div><PencilLine size={17}/></div>
        <label className="profile-input-label">Display name<input value={draftName} maxLength={80} onChange={event => setDraftName(event.target.value)} aria-label="Display name" /></label>
        <fieldset className="profile-avatar-picker"><legend>Choose an avatar</legend>{avatars.map(choice => <button type="button" key={choice} className={draftAvatar === choice ? "selected" : ""} aria-label={`Choose ${choice} avatar`} aria-pressed={draftAvatar === choice} onClick={() => setDraftAvatar(choice)}>{choice}</button>)}</fieldset>
        <div className="profile-save-row"><button type="button" className="button-primary" disabled={saving || draftName.trim().length < 2} onClick={() => void save()}>{saving ? <LoaderCircle size={14} className="profile-spin"/> : <Check size={14}/>} {saving ? "Saving…" : "Save profile"}</button>{message && <span role="status" className={message.includes("couldn’t") ? "profile-save-error" : "profile-save-success"}>{message}</span>}</div>
        <div className="profile-account-row"><div><b>{email}</b><small>Email address</small></div><span>Verified account</span></div>
      </section>
      <section className="plan-box profile-badges-box"><div className="card-heading"><div><h3>Milestone badges</h3><div className="section-meta" style={{ marginTop: 5 }}>Small wins that mark your progress.</div></div><span className="category-count">{badgesEarned} earned</span></div>
        <div className="profile-badge-list">{[
          { title: "First session", detail: "Log your first focused session", earned: totalStudyMinutes > 0, icon: "✦" },
          { title: "Three day rhythm", detail: "Build a 3 day streak", earned: bestStreak >= 3, icon: "🔥" },
          { title: "Week of focus", detail: "Reach a 7 day streak", earned: bestStreak >= 7, icon: "🌙" },
          { title: "Ten hours in", detail: "Study for 10 hours total", earned: totalStudyMinutes >= 600, icon: "⌛" },
          { title: "Steady learner", detail: "Log 25 hours of study", earned: totalStudyMinutes >= 1500, icon: "🌱" },
        ].map(badge => <div className={`profile-badge ${badge.earned ? "earned" : "locked"}`} key={badge.title}><span className="profile-badge-icon">{badge.icon}</span><div><strong>{badge.title}</strong><small>{badge.detail}</small></div><span className="profile-badge-state">{badge.earned ? "EARNED" : "UP NEXT"}</span></div>)}</div>
      </section>
    </div>
    <section className="plan-box profile-workspace-box"><div className="card-heading"><div><h3>Workspace</h3><div className="section-meta" style={{ marginTop: 5 }}>A shared space for study accountability.</div></div><span className="category-count"><Users size={13} style={{ verticalAlign: "-2px", marginRight: 4 }}/>{memberCount}/2 members</span></div><div className="category-row"><div><b>{workspaceName}</b><small>Shared progress, independent roadmaps</small></div></div><div style={{ marginTop: 17 }}><label style={{ fontSize: 11, fontWeight: 700, display: "block", marginBottom: 7 }}>Invite code</label><div style={{ display: "flex", gap: 8 }}><input readOnly value={inviteCode ?? "Invite code is available to the workspace owner"} style={{ width: "100%", minWidth: 0, padding: "10px 11px", border: "1px solid #e7e7ed", borderRadius: 8, fontSize: 11, color: "#666", background: "#fafafa" }}/><button className="button-secondary" disabled={!inviteCode} aria-label="Copy invite code" title="Copy invite code" onClick={() => { if (inviteCode) { void navigator.clipboard.writeText(inviteCode); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } }}><Copy size={14}/>{copied ? "Copied" : ""}</button></div>{memberCount < 2 && <button className="button-secondary" style={{ marginTop: 10 }} disabled={!inviteCode} onClick={onRotate}><RefreshCw size={13}/> Generate a new invite code</button>}</div></section>
    <section className="plan-box profile-signout-box"><div className="card-heading"><div><h3>Sign out</h3><div className="section-meta" style={{ marginTop: 5 }}>End this session on this device.</div></div><button className="button-secondary" onClick={onLogout}><LogOut size={14}/> Sign out</button></div></section>
  </>;
}
