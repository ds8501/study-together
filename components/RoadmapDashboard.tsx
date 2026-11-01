"use client";

import { BookOpen, Check, ChevronLeft, ChevronRight, Flame, LockKeyhole, Plus, Sparkles } from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";
import { displayTopicTitle } from "@/lib/topic-title";
import TiltCard from "./TiltCard";

type Topic = {
  id?: string | number;
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
  topicsStudied?: number;
  minutesStudied?: number;
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
  api?: string;
  isAuthenticated?: boolean;
  onNavigate?: (tab: string) => void;
};

function getMonthCalendarData(streak: StudyStats, monthOffset: number) {
  const now = new Date();
  const selectedMonth = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = selectedMonth.getFullYear();
  const monthIdx = selectedMonth.getMonth();
  const monthName = selectedMonth.toLocaleString("en", { month: "long" });
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const firstDayWeekday = new Date(year, monthIdx, 1).getDay();
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const statsMatchSelectedMonth = streak.year === year && streak.monthName === monthName;
  const currentMonthActivity = new Map((streak.month ?? []).map(day => [day.key, day]));
  const monthDays: MonthDay[] = Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1;
    const date = new Date(year, monthIdx, d);
    const key = `${year}-${String(monthIdx + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const activity = statsMatchSelectedMonth ? currentMonthActivity.get(key) : undefined;
    return {
      key,
      dayNumber: d,
      dayOfWeek: labels[date.getDay()],
      active: activity?.active ?? false,
      today: key === todayKey,
      future: date > now,
      topicsStudied: activity?.topicsStudied ?? 0,
      minutesStudied: activity?.minutesStudied ?? 0
    };
  });

  const activeCount = statsMatchSelectedMonth ? streak.totalDaysStudiedThisMonth ?? monthDays.filter(d => d.active).length : 0;
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
  const [displayValue, setDisplayValue] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayValue(value);
      return;
    }
    const startedAt = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / 850);
      setDisplayValue(Math.round(value * progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return (
    <div
      className="mastery-ring"
      style={{ "--fill-level": `${displayValue}%` } as CSSProperties}
      aria-label={`${value}% complete`}
      role="img"
    >
      <span className="mastery-liquid" aria-hidden="true" />
      <div className="mastery-ring-center">
        <strong>{displayValue}%</strong>
        <span>mastery</span>
      </div>
    </div>
  );
}

export default function RoadmapDashboard({ topics, onSelect, onStatus, onAdd, currentName, friendName, streak, api, isAuthenticated, onNavigate }: Props) {
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState("");
  const [monthOffset, setMonthOffset] = useState(0);
  const [calendarStats, setCalendarStats] = useState(streak);
  useEffect(() => {
    if (monthOffset === 0) {
      setCalendarStats(streak);
      return;
    }
    if (!api || !isAuthenticated) return;
    const selected = new Date(new Date().getFullYear(), new Date().getMonth() + monthOffset, 1);
    const controller = new AbortController();
    const query = new URLSearchParams({ year: String(selected.getFullYear()), month: String(selected.getMonth() + 1) });
    fetch(`${api}/study-stats?${query}`, { credentials: "include", signal: controller.signal })
      .then(response => response.ok ? response.json() as Promise<StudyStats> : null)
      .then(result => { if (result) setCalendarStats(result); })
      .catch(error => { if (error instanceof Error && error.name !== "AbortError") setSaveError("Could not load activity for that month."); });
    return () => controller.abort();
  }, [api, isAuthenticated, monthOffset, streak]);
  const monthData = getMonthCalendarData(calendarStats, monthOffset);
  const studiedToday = monthOffset === 0 && monthData.monthDays.some(day => day.today && day.active);
  const mine = topics.filter(topic => topic.owner === "Divya" || !topic.owner).sort((a, b) => a.day - b.day);
  const topicsByDay = mine.reduce<Array<{ day: number; topics: Topic[] }>>((days, topic) => {
    const group = days[days.length - 1];
    if (group?.day === topic.day) group.topics.push(topic);
    else days.push({ day: topic.day, topics: [topic] });
    return days;
  }, []);
  const friendTopics = topics.filter(topic => topic.owner === "Alex");
  const completed = mine.filter(topic => topic.status === "Completed").length;
  const progress = mine.length ? Math.round((completed / mine.length) * 100) : 0;
  const friendCompleted = friendTopics.filter(topic => topic.status === "Completed").length;
  const friendProgress = friendTopics.length ? Math.round((friendCompleted / friendTopics.length) * 100) : 0;
  const activeIndex = mine.findIndex(topic => topic.status === "In progress");
  const currentIndex = activeIndex >= 0 ? activeIndex : mine.findIndex(topic => topic.status !== "Completed");
  const activeCount = currentIndex >= 0 ? 1 : 0;
  const remaining = Math.max(0, mine.length - completed - activeCount);
  const activeTopic = currentIndex >= 0 ? mine[currentIndex] : undefined;
  const firstName = currentName.trim().split(/\s+/)[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const toggleComplete = async (topic: Topic) => {
    if (!topic.id || savingId) return;
    const tid = String(topic.id);
    setSavingId(tid);
    setSaveError("");
    try {
      const saved = await onStatus({ ...topic, status: topic.status === "Completed" ? "Not started" : "Completed" });
      if (!saved) setSaveError("Could not save that update. Please try again.");
    } catch {
      setSaveError("Could not save that update. Please try again.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="sync-dashboard">
      <div className="sync-page-heading">
        <div>
          <div className="sync-eyebrow"><BookOpen size={13} /> YOUR LEARNING PLAN · {mine.length} TOPICS · {completed} COMPLETED</div>
          <h1>{greeting}, {firstName}</h1>
          <p className="sync-today-focus">Today’s focus: <strong>{activeTopic ? displayTopicTitle(activeTopic.title) : "Choose a topic and keep your momentum"}</strong>{activeTopic && <span> · Day {activeTopic.day} · {activeTopic.category}</span>}</p>
        </div>
        <div className="sync-heading-actions">
          <div className="sync-legend"><span><i className="legend-complete" /> Done</span><span><i className="legend-current" /> Current</span><span><i className="legend-upcoming" /> Upcoming</span></div>
          <button className="sync-add-button" onClick={onAdd}><Plus size={16} /> Add topic</button>
        </div>
      </div>

      <div className="sync-dashboard-grid">
        <div className="sync-main-column">
          <section className="sync-mastery-card" style={{ gap: 20 }}>
            <div className="sync-mastery-visual-wrap">
              <ProgressRing value={progress} />
            </div>
            <div className="sync-mastery-copy">
              <div className="sync-mastery-title"><div><span className="sync-eyebrow">Your learning plan</span><h2>Overall Mastery</h2></div><span className="sync-on-track"><i /> {progress === 100 && mine.length ? "COMPLETE" : "ON TRACK"}</span></div>
              <p>Your progress is based on the topics completed in your roadmap.</p>
              <div className="sync-mastery-stats">
                <TiltCard><div><small>COMPLETED</small><strong>{completed}</strong></div></TiltCard>
                <TiltCard><div title="Active means your in-progress topic, or the next unfinished topic."><small>ACTIVE · NEXT</small><strong className="sync-violet-text">{activeCount}</strong></div></TiltCard>
                <TiltCard><div><small>REMAINING</small><strong>{remaining}</strong></div></TiltCard>
              </div>
              <p className="sync-stats-help">Active is your in-progress topic, or the next unfinished topic.</p>
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
                          <div className={`sync-timeline-row ${done ? "is-done" : ""} ${current ? "is-current" : ""}`} key={topic.id ?? `${topic.day}-${displayTopicTitle(topic.title)}`}>
                            <span className="sync-timeline-rail"><button type="button" className="sync-timeline-node" role="checkbox" aria-checked={done} aria-label={`${done ? "Mark as not done" : "Mark as done"}: ${displayTopicTitle(topic.title)}`} disabled={!topic.id || savingId === String(topic.id)} onClick={() => void toggleComplete(topic)}>{done ? <Check size={15} /> : current ? <BookOpen size={14} /> : <span>{String(index + 1).padStart(2, "0")}</span>}</button></span>
                            <button type="button" className="sync-topic-content sync-topic-open" onClick={() => onSelect(topic)}><span className="sync-topic-title">{displayTopicTitle(topic.title)}{current && <span className="sync-live-tag">CURRENT</span>}</span><span className="sync-topic-subtitle">{topic.category}</span></button>
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
            {friendTopics.length ? <div className="sync-friend-row"><div className="sync-friend-avatar friend">{friendName.split(/\s+/).map(part => part[0]).slice(0, 2).join("").toUpperCase()}</div><div className="sync-friend-info"><div><strong>{friendName}</strong><span>{friendProgress}%</span></div><small>Learning alongside you</small><div className="sync-friend-track"><i className="friend-fill" style={{ width: `${friendProgress}%` }} /></div></div></div> : <div className="sync-friend-empty"><p>Your study partner’s progress will appear here when they join.</p><button className="button-secondary" onClick={() => onNavigate?.("Friends")}>Invite a study partner</button></div>}
          </section>

          <section className="sync-week-card" aria-label="Monthly study streak calendar">
            <div className="sync-week-glow" />
            
            <div className="sync-month-header">
              <div className="sync-month-controls"><button type="button" className="sync-month-nav" aria-label="Previous month" onClick={() => setMonthOffset(value => value - 1)}><ChevronLeft size={15} /></button><span className="sync-month-title">{monthData.monthName} {monthData.year}</span><button type="button" className="sync-month-nav" aria-label="Next month" disabled={monthOffset >= 0} onClick={() => setMonthOffset(value => Math.min(0, value + 1))}><ChevronRight size={15} /></button></div>
              <span className="sync-month-badge">
                <Flame className="streak-flame" size={12} fill={streak.currentStreak > 0 ? "#ffd166" : "none"} color={streak.currentStreak > 0 ? "#ffd166" : "#fff"} style={{ transform: `scale(${1 + Math.min(streak.currentStreak, 30) / 100})` }} />
                {streak.currentStreak ? `${streak.currentStreak}d streak` : "Start today"}
              </span>
            </div>

            <strong className="sync-week-number">{streak.currentStreak}<small> day{streak.currentStreak === 1 ? "" : "s"}</small></strong>
            <span className="sync-week-label">{!studiedToday && streak.currentStreak ? "Your streak is at risk. Study today to keep it going." : streak.currentStreak ? "active study streak" : "Study for 10 minutes today to start your streak."}</span>
            {!studiedToday && <button type="button" className="sync-streak-cta" onClick={() => onNavigate?.("Study Room")}>Start a 10-minute session</button>}
            <div className="streak-milestones" aria-label="Streak milestones">{[3,7,30,100].map(days=><span key={days} className={streak.currentStreak>=days?"reached":""} aria-label={`${days} day milestone${streak.currentStreak>=days?", reached":""}`}>{days}d</span>)}</div>

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
                    className={`sync-month-cell ${day.active ? "active" : ""} ${day.minutesStudied ? `heat-${Math.min(4, Math.max(1, Math.ceil(day.minutesStudied / 30)))}` : day.topicsStudied ? "heat-1" : ""} ${day.today ? "today" : ""} ${day.future ? "future" : ""}`}
                    title={`${day.key}: ${day.topicsStudied ?? 0} topic${day.topicsStudied === 1 ? "" : "s"}, ${day.minutesStudied ?? 0} min${day.today ? " · Today" : ""}`}
                  >
                    <span>{day.dayNumber}</span>
                  </div>
                ))}
              </div>
              <div className="sync-heat-legend" aria-label="Study activity intensity legend"><span><i className="heat-none"/>No study</span><span><i className="heat-1"/>1–30 min</span><span><i className="heat-2"/>31–60 min</span><span><i className="heat-3"/>61–90 min</span><span><i className="heat-4"/>91+ min</span></div>
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
                <strong>{streak.bestStreak ? `${streak.bestStreak} days` : "Build your first streak"}</strong>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
