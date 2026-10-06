"use client";

import { BookOpen, Check, Flame, LockKeyhole, Plus, Sparkles } from "lucide-react";
import { useState, type CSSProperties } from "react";
import Dashboard3DCore from "./three/Dashboard3DCore";

type Topic = {
  id?: string;
  title: string;
  category: string;
  status: "Completed" | "In progress" | "Not started";
  difficulty: string;
  hours: number;
  day: number;
  owner: "Divya" | "Alex";
  description: string;
};

export type MonthDay = {
  key: string;
  dayNumber: number;
  dayOfWeek: string;
  active: boolean;
  today: boolean;
  future: boolean;
};

export type StudyStats = {
  currentStreak: number;
  bestStreak: number;
  totalDaysStudiedThisMonth?: number;
  monthName?: string;
  year?: number;
  month?: MonthDay[];
  week: Array<{ key: string; label: string; active: boolean; today: boolean }>;
};

type Props = {
  topics: Topic[];
  onSelect: (topic: Topic) => void;
  onStatus: (topic: Topic) => Promise<boolean>;
  onAdd: () => void;
  currentName: string;
  friendName: string;
  streak: StudyStats;
  onNavigate?: (tab: string) => void;
};

function getMonthCalendarData(streak: StudyStats) {
  const now = new Date();
  const year = streak.year ?? now.getFullYear();
  const monthName = streak.monthName ?? now.toLocaleString("default", { month: "long" });
  const monthIdx = now.getMonth();
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const firstDayWeekday = new Date(year, monthIdx, 1).getDay();
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  let monthDays: MonthDay[] = streak.month && streak.month.length > 0 ? streak.month : [];
  if (monthDays.length === 0) {
    const todayDate = now.getDate();
    const activeWeekKeys = new Set((streak.week ?? []).filter(w => w.active).map(w => w.key));
    monthDays = Array.from({ length: daysInMonth }, (_, i) => {
      const d = i + 1;
      const date = new Date(year, monthIdx, d);
      const key = date.toISOString().slice(0, 10);
      const isToday = d === todayDate;
      const isFuture = d > todayDate;
      const isActive = activeWeekKeys.has(key) || (d <= todayDate && d >= Math.max(1, todayDate - streak.currentStreak + 1));
      return {
        key,
        dayNumber: d,
        dayOfWeek: labels[date.getDay()],
        active: isActive,
        today: isToday,
        future: isFuture
      };
    });
  }

  const activeCount = streak.totalDaysStudiedThisMonth ?? monthDays.filter(d => d.active).length;
  const progressPct = Math.round((activeCount / daysInMonth) * 100);

  return {
    year,
    monthName,
    firstDayWeekday,
    monthDays,
    activeCount,
    progressPct,
    daysInMonth
  };
}

function ProgressRing({ value }: { value: number }) {
  return (
    <div
      className="mastery-ring"
      style={{ "--fill-level": `${value}%` } as CSSProperties}
      aria-label={`${value}% complete`}
    >
      <span className="mastery-liquid" aria-hidden="true" />
      <div className="mastery-ring-center">
        <strong>{value}%</strong>
        <span>complete</span>
      </div>
    </div>
  );
}

export default function RoadmapDashboard({ topics, onSelect, onStatus, onAdd, currentName, friendName, streak, onNavigate }: Props) {
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState("");
  const monthData = getMonthCalendarData(streak);
  const mine = topics.filter(topic => topic.owner === "Divya").sort((a, b) => a.day - b.day);
  const topicsByDay = mine.reduce<Array<{ day: number; topics: Topic[] }>>((days, topic) => {
    const group = days[days.length - 1];
    if (group?.day === topic.day) group.topics.push(topic);
    else days.push({ day: topic.day, topics: [topic] });
    return days;
  }, []);
  const friendTopics = topics.filter(topic => topic.owner === "Alex");
  const completed = mine.filter(topic => topic.status === "Completed").length;
  const inProgress = mine.filter(topic => topic.status === "In progress").length;
  const remaining = Math.max(0, mine.length - completed - inProgress);
  const progress = mine.length ? Math.round((completed / mine.length) * 100) : 0;
  const friendCompleted = friendTopics.filter(topic => topic.status === "Completed").length;
  const friendProgress = friendTopics.length ? Math.round((friendCompleted / friendTopics.length) * 100) : 0;
  const activeIndex = mine.findIndex(topic => topic.status === "In progress");
  const currentIndex = activeIndex >= 0 ? activeIndex : mine.findIndex(topic => topic.status !== "Completed");
  const toggleComplete = async (topic: Topic) => {
    if (!topic.id || savingId) return;
    setSavingId(topic.id);
    setSaveError("");
    const saved = await onStatus({ ...topic, status: topic.status === "Completed" ? "Not started" : "Completed" });
    if (!saved) setSaveError("Could not save that update. Please try again.");
    setSavingId(null);
  };

  return (
    <div className="sync-dashboard">
      <div className="sync-page-heading">
        <div>
          <div className="sync-eyebrow"><BookOpen size={13} /> {mine[0]?.category ?? "Your learning plan"} · {mine.length} topics · {completed} completed</div>
          <h1>My Roadmap</h1>
          <p>Small steps, steady progress. Keep building your momentum.</p>
        </div>
        <div className="sync-heading-actions">
          <div className="sync-legend"><span><i className="legend-complete" /> Done</span><span><i className="legend-current" /> Current</span><span><i className="legend-upcoming" /> Upcoming</span></div>
          <button className="sync-add-button" onClick={onAdd}><Plus size={16} /> Add topic</button>
        </div>
      </div>

      <div className="sync-dashboard-grid">
        <div className="sync-main-column">
          <section className="sync-mastery-card" style={{ gap: 20 }}>
            <div style={{ width: 220, height: 200, flexShrink: 0 }}>
              <Dashboard3DCore progress={progress} completed={completed} inProgress={inProgress} remaining={remaining} streak={streak.currentStreak} />
            </div>
            <div className="sync-mastery-copy">
              <div className="sync-mastery-title"><div><span className="sync-eyebrow">Your learning plan</span><h2>Overall Mastery</h2></div><span className="sync-on-track"><i /> {progress === 100 && mine.length ? "COMPLETE" : "ON TRACK"}</span></div>
              <p>Your progress is based on the topics completed in your roadmap.</p>
              <div className="sync-mastery-stats">
                <div><small>COMPLETED</small><strong>{completed}</strong></div>
                <div><small>ACTIVE</small><strong className="sync-violet-text">{inProgress}</strong></div>
                <div><small>REMAINING</small><strong>{remaining}</strong></div>
              </div>
            </div>
          </section>

          <section className="sync-roadmap-card">
            <div className="sync-card-heading"><div><span className="sync-eyebrow">Your plan</span><h2>Learning path</h2></div><span className="sync-topic-count">{mine.length} topics</span></div>
            {mine.length ? (
              <div className="sync-timeline">
                {saveError && <div className="sync-roadmap-error" role="alert">{saveError}</div>}
                {topicsByDay.map(({ day, topics: dayTopics }) => {
                  const dayCompleted = dayTopics.filter(topic => topic.status === "Completed").length;
                  return (
                    <section className="sync-day-group" key={day} aria-label={`Day ${day}`}>
                      <div className="sync-day-heading">
                        <strong>Day {day}</strong>
                        <span>{dayCompleted} / {dayTopics.length} complete</span>
                      </div>
                      {dayTopics.map(topic => {
                        const index = mine.indexOf(topic);
                        const done = topic.status === "Completed";
                        const current = !done && index === currentIndex;
                        return (
                          <div className={`sync-timeline-row ${done ? "is-done" : ""} ${current ? "is-current" : ""}`} key={topic.id ?? `${topic.day}-${topic.title}`}>
                            <button type="button" className="sync-quick-check" role="checkbox" aria-checked={done} aria-label={`${done ? "Mark as not done" : "Mark as done"}: ${topic.title}`} disabled={!topic.id || savingId === topic.id} onClick={() => void toggleComplete(topic)}>{done && <Check size={12} />}</button>
                            <span className="sync-timeline-rail"><span className="sync-timeline-node">{done ? <Check size={15} /> : current ? <BookOpen size={14} /> : <span>{String(index + 1).padStart(2, "0")}</span>}</span></span>
                            <button type="button" className="sync-topic-content sync-topic-open" onClick={() => onSelect(topic)}><span className="sync-topic-title">{topic.title}{current && <span className="sync-live-tag">CURRENT</span>}</span><span className="sync-topic-subtitle">{topic.category}</span></button>
                            <span className={`sync-topic-status ${done ? "done" : current ? "current" : "upcoming"}`}>{done ? "Done" : current ? "In progress" : "Upcoming"}</span>
                            {!done && !current && <LockKeyhole className="sync-upcoming-lock" size={14} />}
                          </div>
                        );
                      })}
                    </section>
                  );
                })}
              </div>
            ) : (
              <div className="sync-empty-roadmap"><div><Sparkles size={20} /></div><h3>Your roadmap starts here</h3><p>Add your first topic and turn your goals into a clear learning path.</p><button className="sync-add-button" onClick={onAdd}><Plus size={15} /> Add your first topic</button></div>
            )}
          </section>
        </div>

        <aside className="sync-side-column">
          <section className="sync-friends-card">
            <div className="sync-card-heading"><div><span className="sync-eyebrow">Study together</span><h2>Friends’ Progress</h2></div><span className="sync-friends-count">{friendTopics.length ? "1 partner" : "Workspace"}</span></div>
            <div className="sync-friend-row"><div className="sync-friend-avatar">{currentName.split(/\s+/).map(part => part[0]).slice(0, 2).join("").toUpperCase()}</div><div className="sync-friend-info"><div><strong>{currentName}</strong><span>{progress}%</span></div><small>Your roadmap</small><div className="sync-friend-track"><i style={{ width: `${progress}%` }} /></div></div></div>
            <div className="sync-friend-row"><div className="sync-friend-avatar friend">{friendName.split(/\s+/).map(part => part[0]).slice(0, 2).join("").toUpperCase()}</div><div className="sync-friend-info"><div><strong>{friendName}</strong><span>{friendTopics.length ? `${friendProgress}%` : "—"}</span></div><small>{friendTopics.length ? "Learning alongside you" : "Waiting for their first topic"}</small><div className="sync-friend-track"><i className="friend-fill" style={{ width: `${friendProgress}%` }} /></div></div></div>
          </section>

          <section className="sync-week-card" aria-label="Monthly study streak calendar">
            <div className="sync-week-glow" />
            
            <div className="sync-month-header">
              <span className="sync-month-title">{monthData.monthName} {monthData.year}</span>
              <span className="sync-month-badge">
                <Flame size={12} fill={streak.currentStreak > 0 ? "#ffd166" : "none"} color={streak.currentStreak > 0 ? "#ffd166" : "#fff"} />
                {streak.currentStreak}d streak
              </span>
            </div>

            <strong className="sync-week-number">{streak.currentStreak}<small> day{streak.currentStreak === 1 ? "" : "s"}</small></strong>
            <span className="sync-week-label">active study streak</span>

            <div className="sync-month-calendar">
              <div className="sync-month-weekdays">
                <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
              </div>
              <div className="sync-month-grid">
                {Array.from({ length: monthData.firstDayWeekday }, (_, i) => (
                  <div key={`empty-${i}`} className="sync-month-cell empty" />
                ))}
                {monthData.monthDays.map(day => (
                  <div
                    key={day.key}
                    className={`sync-month-cell ${day.active ? "active" : ""} ${day.today ? "today" : ""} ${day.future ? "future" : ""}`}
                    title={`${day.key}: ${day.active ? "Completed study session" : day.today ? "Today" : day.future ? "Upcoming" : "No session logged"}`}
                  >
                    <span>{day.dayNumber}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="sync-month-footer">
              <div className="sync-month-stats-row">
                <span>Monthly activity</span>
                <strong>{monthData.activeCount} / {monthData.daysInMonth} days</strong>
              </div>
              <div className="sync-month-progress">
                <div className="sync-month-progress-fill" style={{ width: `${monthData.progressPct}%` }} />
              </div>
              <div className="sync-month-stats-row" style={{ marginTop: 2 }}>
                <span>Best streak</span>
                <strong>{streak.bestStreak} days</strong>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
