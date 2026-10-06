"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, BookOpen, Check, ChevronDown, ChevronRight, CircleHelp, Flame, LayoutDashboard, LockKeyhole, Map, Music2, Pause, Play, Plus, RotateCcw, Search, Sparkles, Timer, Trash2, Trophy, UserRound, Users, X } from "lucide-react";
import Universe from "./Universe";
import WorkspaceSettings from "./WorkspaceSettings";
import StudySessionLogger from "./StudySessionLogger";
import RoadmapDashboard from "./RoadmapDashboard";
import ThemeToggle from "./ThemeToggle";
import Roadmap3DGalaxy from "./three/Roadmap3DGalaxy";
import StudyRoom3DDesk from "./three/StudyRoom3DDesk";
import Friends3DOrbit from "./three/Friends3DOrbit";
import Leaderboard3DPodium from "./three/Leaderboard3DPodium";
import Settings3DIdentity from "./three/Settings3DIdentity";

type Status = "Completed" | "In progress" | "Not started";
export type MonthDay = { key: string; dayNumber: number; dayOfWeek: string; active: boolean; today: boolean; future: boolean };
export type StudyStats = { currentStreak: number; bestStreak: number; totalDaysStudiedThisMonth?: number; monthName?: string; year?: number; month?: MonthDay[]; week: Array<{ key: string; label: string; active: boolean; today: boolean }> };
type Topic = { id?:string; title:string; category:string; status:Status; difficulty:string; hours:number; day:number; owner:"Divya"|"Alex"; description:string };
const initialTopics:Topic[] = [
 {id:"topic-1",title:"HLD: Event-driven architecture",category:"System Design",status:"Completed",difficulty:"Advanced",hours:2,day:1,owner:"Divya",description:"Explore event-driven systems, message brokers, and delivery guarantees through a practical architecture exercise."},
 {id:"topic-2",title:"Kafka consumer groups",category:"System Design",status:"Completed",difficulty:"Medium",hours:2,day:2,owner:"Divya",description:"Understand partition assignment, consumer coordination, offsets, and how groups scale across a service."},
 {id:"topic-3",title:"Dynamic programming patterns",category:"DSA",status:"In progress",difficulty:"Medium",hours:1.5,day:3,owner:"Divya",description:"Build intuition for state, transitions, and bottom-up solutions with a curated set of problems."},
 {id:"topic-4",title:"SOLID: Dependency inversion",category:"LLD",status:"Not started",difficulty:"Easy",hours:1,day:4,owner:"Divya",description:"Apply dependency inversion to keep high-level policy independent from implementation details."},
 {id:"topic-5",title:"Design a URL shortener",category:"System Design",status:"Not started",difficulty:"Advanced",hours:2.5,day:5,owner:"Divya",description:"A system design prompt covering key generation, redirects, storage, caching, and analytics."},
 {id:"topic-6",title:"Python foundations",category:"Python",status:"Completed",difficulty:"Easy",hours:2,day:1,owner:"Alex",description:"Review Python collections, control flow, functions, and idiomatic ways to structure a small program."},
 {id:"topic-7",title:"React hooks in practice",category:"React",status:"In progress",difficulty:"Medium",hours:1.5,day:2,owner:"Alex",description:"Practice composing effects and state with the hooks that power everyday React applications."},
 {id:"topic-8",title:"Gradient descent intuition",category:"Machine Learning",status:"Not started",difficulty:"Medium",hours:2,day:3,owner:"Alex",description:"Connect the geometry of a loss surface to the iterative updates behind gradient descent."},
 {id:"topic-9",title:"Binary trees: traversal",category:"Competitive Programming",status:"Not started",difficulty:"Easy",hours:1,day:4,owner:"Alex",description:"Compare depth-first and breadth-first traversals and learn when each pattern is useful."},
];
const paths = { Dashboard:"/dashboard", Journey:"/journey", "My roadmap":"/roadmap", Activity:"/activity" };
function Avatar({friend=false,name}:{friend?:boolean;name?:string}){return <div className={`avatar ${friend?"friend":""}`}>{name?name.trim().split(/\s+/).slice(0,2).map(p=>p[0]).join("").toUpperCase():friend?"AL":"DV"}</div>}
function Sidebar({page,onNavigate,currentName,streak}:{page:string;onNavigate:(p:string)=>void;currentName:string;streak:number}) {
  const nav=[{name:"Dashboard",icon:LayoutDashboard},{name:"Roadmap",icon:Map},{name:"Study Room",icon:Timer},{name:"Friends",icon:Users},{name:"Leaderboard",icon:Trophy},{name:"Profile",icon:UserRound}];
  return <header className="sidebar"><a className="brand" href="/dashboard" aria-label="StudyPulse dashboard"><span className="brand-mark"><Flame size={18}/></span><span className="brand-name">StudyPulse</span></a><nav className="top-nav" aria-label="Main navigation">{nav.map(({name,icon:Icon})=><button key={name} className={`nav-link ${page===name?"active":""}`} onClick={()=>onNavigate(name)}><Icon size={16}/><span>{name}</span></button>)}</nav><div className="nav-account"><ThemeToggle/><span className="nav-streak"><Flame size={15}/>{streak}</span><div className="nav-avatar"><Avatar name={currentName}/></div></div></header>
}
function ProgressCard({friend,topics,currentName,friendName}:{friend?:boolean;topics:Topic[];currentName:string;friendName:string}) { const mine=topics.filter(t=>t.owner===(friend?"Alex":"Divya"));const done=mine.filter(t=>t.status==="Completed").length;const active=mine.filter(t=>t.status==="In progress").length;const total=mine.length;const pct=total?Math.round(done/total*100):0;return <div className="progress-card"><div className="card-heading"><div className="person-label"><Avatar friend={friend} name={friend?friendName:currentName}/>{friend?friendName:currentName}{!friend&&<span style={{fontSize:9,color:"#9698a2",fontWeight:400}}>You</span>}</div><span className={`progress-pill ${friend?"green":""}`}>{pct}% complete</span></div><div className="stats-row"><div className="stat-item"><div className="stat-value">{done.toString().padStart(2,"0")}</div><div className="stat-label">Completed</div></div><div className="stat-item"><div className="stat-value">{active.toString().padStart(2,"0")}</div><div className="stat-label">In progress</div></div><div className="stat-item"><div className="stat-value">{Math.max(0,total-done-active).toString().padStart(2,"0")}</div><div className="stat-label">Remaining</div></div></div><div className="progress-track"><div className={`progress-fill ${friend?"green":""}`} style={{width:`${pct}%`}}/></div></div> }
function TopicPanel({topic,onClose,onStatus,onDelete,canDelete,onLogSession,canLog}:{topic:Topic;onClose:()=>void;onStatus:(t:Topic)=>void;onDelete:()=>void;canDelete:boolean;onLogSession:(topic:Topic,minutes:number)=>Promise<boolean>;canLog:boolean}) { return <motion.aside className="topic-panel" initial={{x:30,opacity:0}} animate={{x:0,opacity:1}} exit={{x:30,opacity:0}}><button className="icon-button close" onClick={onClose}><X size={16}/></button><div className="panel-kicker">{topic.category} · Day {topic.day}</div><h2>{topic.title}</h2><p className="panel-desc">{topic.description}</p><div className="detail-grid"><div className="detail-box"><small>Status</small><strong>{topic.status}</strong></div><div className="detail-box"><small>Difficulty</small><strong>{topic.difficulty}</strong></div><div className="detail-box"><small>Estimated time</small><strong>{topic.hours} hours</strong></div><div className="detail-box"><small>Roadmap owner</small><strong>{topic.owner}</strong></div></div><div style={{fontSize:11,color:"#888",lineHeight:1.7}}>This topic is part of <b style={{color:"#555"}}>{topic.owner}’s independent roadmap</b>. Progress here is visible to everyone in the workspace.</div>{canLog&&<StudySessionLogger onLog={minutes=>onLogSession(topic,minutes)}/>}<div className="panel-actions">{canDelete&&<button className="button-secondary" onClick={onDelete}><Trash2 size={14}/> Delete topic</button>}<button className="button-primary" onClick={()=>onStatus({...topic,status:topic.status==="Completed"?"In progress":"Completed"})}><Check size={14}/>{topic.status==="Completed"?"Reopen topic":"Mark complete"}</button></div></motion.aside> }
 function DashboardHome(props: Parameters<typeof RoadmapDashboard>[0]) { return <RoadmapDashboard {...props} />; }

function Journey({topics,onSelect,currentName,friendName}:{topics:Topic[];onSelect:(t:Topic)=>void;currentName:string;friendName:string}) {return <><div className="page-heading"><div><div className="eyebrow">The long game</div><h1>Your journeys</h1><p className="subheading">Every small step adds up to something bigger.</p></div><button className="button-secondary"><ChevronDown size={14}/> All time</button></div><div className="scene-card" style={{height:280}}><div className="scene-overlay"><div className="scene-title">Two independent paths</div><div className="scene-subtitle">A shared view of your learning progress</div></div><Universe topics={topics} onSelect={onSelect}/><div className="scene-footer"><div className="scene-person"><Avatar name={currentName}/><div>{currentName}<span>{topics.filter(t=>t.owner==="Divya"&&t.status==="Completed").length} milestones reached</span></div></div><div className="scene-person right"><div>{friendName}<span>{topics.filter(t=>t.owner==="Alex"&&t.status==="Completed").length} milestones reached</span></div><Avatar friend name={friendName}/></div></div></div><div className="journey-view">{(["Divya","Alex"] as const).map(owner=>{const ownerTopics=topics.filter(t=>t.owner===owner).sort((a,b)=>a.day-b.day);return <div className="journey-lane" key={owner}><div className="lane-header"><Avatar friend={owner==="Alex"}/>{owner=== "Divya"?"Divya’s journey":"{friendName}’s journey"}<span className="section-meta" style={{marginLeft:"auto"}}>{ownerTopics.filter(t=>t.status==="Completed").length} of {ownerTopics.length} complete</span></div><div className="day-track">{Array.from(new Set(ownerTopics.map(t=>t.day))).map(day=>{const dayTopics=ownerTopics.filter(t=>t.day===day);const complete=dayTopics.every(t=>t.status==="Completed");return <div className={`day-group ${complete?"completed":""}`} key={day}><div className="day-dot"/><div className="day-number">DAY {day}</div><div className="day-topics">{dayTopics.map(t=><div key={t.title} onClick={()=>onSelect(t)} style={{cursor:"pointer"}}>{t.title}</div>)}</div></div>})}</div></div>})}</div></> }
function Roadmap({topics,onSelect,onAdd,onStatus,onDelete}:{topics:Topic[];onSelect:(t:Topic)=>void;onAdd:(day?:number)=>void;onStatus:(t:Topic)=>Promise<boolean>;onDelete:(t:Topic)=>void}) {
  const [query,setQuery]=useState("");
  const [filter,setFilter]=useState<"All"|"To do"|"Done">("All");
  const [categoryFilter,setCategoryFilter]=useState("All");
  const [expandedDays,setExpandedDays]=useState<Set<number>>(()=>{
    const incomplete=topics.filter(t=>t.owner==="Divya"&&t.status!=="Completed").map(t=>t.day);
    const allDays=topics.filter(t=>t.owner==="Divya").map(t=>t.day);
    const firstDay=incomplete.length?Math.min(...incomplete):allDays.length?Math.min(...allDays):NaN;
    return Number.isFinite(firstDay)?new Set([firstDay]):new Set();
  });
  const [savingId,setSavingId]=useState<string|null>(null);
  const [saveError,setSaveError]=useState("");
  const mine=topics.filter(t=>t.owner==="Divya");
  const categories=Array.from(new Set(mine.map(t=>t.category)));
  const completed=mine.filter(t=>t.status==="Completed").length;
  const percent=mine.length?Math.round(completed/mine.length*100):0;
  const filtered=mine.filter(t=>{
    const matchesQuery=`${t.title} ${t.category}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesStatus=filter==="All"||(filter==="Done"?t.status==="Completed":t.status!=="Completed");
    return matchesQuery&&matchesStatus&&(categoryFilter==="All"||t.category===categoryFilter);
  });
  const days=Array.from(new Set(filtered.map(t=>t.day))).sort((a,b)=>a-b);
  const toggleDay=(day:number)=>setExpandedDays(old=>{const next=new Set(old);next.has(day)?next.delete(day):next.add(day);return next});
  const toggleDone=async(topic:Topic)=>{
    if(!topic.id)return;
    setSavingId(topic.id);setSaveError("");
    const ok=await onStatus({...topic,status:topic.status==="Completed"?"Not started":"Completed"});
    if(!ok)setSaveError("Could not save that update. Please try again.");
    setSavingId(null);
  };
  return <>
    <div className="page-heading roadmap-heading"><div><div className="eyebrow">Owned by you · {mine.length} topics</div><h1>My roadmap</h1><p className="subheading">A clear, day-by-day checklist for your learning plan.</p></div><button className="button-primary" onClick={()=>onAdd()}><Plus size={15}/> Add a topic</button></div>
    <section className="roadmap-progress-card"><div><span className="roadmap-progress-label">Overall progress</span><strong>{completed}<small> / {mine.length} done</small></strong></div><div className="roadmap-progress-right"><span>{percent}%</span><div className="progress-track"><div className="progress-fill" style={{width:`${percent}%`}}/></div></div></section>
    <Roadmap3DGalaxy topics={topics} onSelect={onSelect} />
    <div className="roadmap-toolbar"><label className="roadmap-search"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find a topic or question" aria-label="Search roadmap"/></label><select className="roadmap-category-select" aria-label="Filter by category" value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)}><option value="All">All categories</option>{categories.map(category=><option key={category} value={category}>{category}</option>)}</select><div className="roadmap-filters">{(["All","To do","Done"] as const).map(item=><button key={item} className={`roadmap-filter ${filter===item?"selected":""}`} onClick={()=>setFilter(item)}>{item}</button>)}</div></div>
    {saveError&&<div className="roadmap-save-error" role="alert">{saveError}</div>}
    <div className="roadmap-days">{days.map(day=>{const dayTopics=filtered.filter(t=>t.day===day);const dayDone=dayTopics.filter(t=>t.status==="Completed").length;const expanded=expandedDays.has(day)||Boolean(query);const dayCategories=Array.from(new Set(dayTopics.map(t=>t.category)));return <section className={`roadmap-day ${dayDone===dayTopics.length?"day-complete":""}`} key={day}><div className="roadmap-day-header"><button className="roadmap-day-toggle" onClick={()=>toggleDay(day)} aria-expanded={expanded}><span className="roadmap-day-number">{dayDone===dayTopics.length&&dayTopics.length>0?<Check size={15}/>:String(day).padStart(2,"0")}</span><span className="roadmap-day-title"><strong>Day {day}</strong><small>{dayDone===dayTopics.length&&dayTopics.length>0?"Day complete":"Keep moving at your own pace"}</small></span><span className="roadmap-day-count">{dayDone}/{dayTopics.length} done</span><span className="roadmap-day-chevron"><ChevronDown size={16}/></span></button><button className="roadmap-day-add" onClick={()=>onAdd(day)} aria-label={`Add a topic or question to Day ${day}`} title="Add to this day"><Plus size={14}/></button></div>{expanded&&<div className="roadmap-day-content">{dayCategories.map(category=><div className="roadmap-topic-group" key={`${day}-${category}`}><h3>{category}</h3>{dayTopics.filter(t=>t.category===category).map(topic=>{const done=topic.status==="Completed";return <div className={`roadmap-topic-row ${done?"topic-done":""}`} key={topic.id??topic.title}><button type="button" className="roadmap-checkbox" role="checkbox" aria-checked={done} aria-label={`${done?"Mark as not done":"Mark as done"}: ${topic.title}`} disabled={savingId===topic.id} onClick={()=>void toggleDone(topic)}>{done&&<Check size={13}/>}</button><button type="button" className="roadmap-topic-title" onClick={()=>onSelect(topic)}><span>{topic.title}</span><small>{topic.status}{topic.hours?` · ${topic.hours}h`:""}</small></button><button type="button" className="roadmap-delete" aria-label={`Delete ${topic.title}`} title="Delete topic" onClick={()=>onDelete(topic)}><Trash2 size={14}/></button></div>})}</div>)}</div>}</section>})}{days.length===0&&<div className="roadmap-empty">No topics match those filters.</div>}</div>
  </>;
}
function StudyRoom({topics,onLog}:{topics:Topic[];onLog:(topic:Topic,minutes:number)=>Promise<boolean>}) {
  const mine=topics.filter(topic=>topic.owner==="Divya"&&topic.id);
  const [topicId,setTopicId]=useState(mine.find(topic=>topic.status!=="Completed")?.id??mine[0]?.id??"");
  const [minutes,setMinutes]=useState(25),[remaining,setRemaining]=useState(1500),[running,setRunning]=useState(false),[saving,setSaving]=useState(false),[message,setMessage]=useState("");
  useEffect(()=>{if(!running)return;const timer=window.setInterval(()=>setRemaining(value=>Math.max(0,value-1)),1000);return()=>window.clearInterval(timer);},[running]);
  useEffect(()=>{if(remaining===0)setRunning(false);},[remaining]);
  const setPreset=(value:number)=>{setMinutes(value);setRemaining(value*60);setRunning(false);setMessage("");};
  const save=async()=>{const topic=mine.find(item=>item.id===topicId);if(!topic)return;setSaving(true);const studied=Math.max(1,Math.ceil((minutes*60-remaining)/60));const ok=await onLog(topic,studied);setMessage(ok?"Session saved. Your streak is up to date.":"Could not save the session. Please try again.");setSaving(false);if(ok){setRunning(false);setRemaining(minutes*60);}};
  const clock=`${String(Math.floor(remaining/60)).padStart(2,"0")}:${String(remaining%60).padStart(2,"0")}`;
  return <div className="focus-page"><div className="page-heading"><div><div className="eyebrow">STUDY ROOM</div><h1>Focus mode</h1><p className="subheading">Set a goal, start the timer, and let the clock keep you honest.</p></div></div><div style={{marginBottom:20}}><StudyRoom3DDesk running={running} remaining={remaining} minutes={minutes} topicTitle={mine.find(item=>item.id===topicId)?.title}/></div><div className="focus-grid"><section className="focus-card"><label className="focus-topic-label">What are you working on?</label><select value={topicId} onChange={event=>setTopicId(event.target.value)}><option value="">Choose a roadmap topic</option>{mine.map(topic=><option key={topic.id} value={topic.id}>{topic.title}</option>)}</select><div className="focus-clock"><strong>{clock}</strong><span>{running?"FOCUSING":remaining===0?"SESSION COMPLETE":"READY"}</span></div><div className="focus-controls"><button className="button-primary" onClick={()=>{if(remaining===0)setRemaining(minutes*60);setRunning(value=>!value)}}>{running?<Pause size={16}/>:<Play size={16}/>}{running?"Pause":"Start"}</button><button className="button-secondary" onClick={()=>{setRunning(false);setRemaining(minutes*60);setMessage("")}}><RotateCcw size={15}/>Reset</button></div><div className="focus-presets">{[{label:"Pomodoro · 25m",value:25},{label:"Short break · 5m",value:5},{label:"Deep focus · 50m",value:50},{label:"Sprint · 15m",value:15}].map(preset=><button key={preset.value} className={minutes===preset.value?"selected":""} onClick={()=>setPreset(preset.value)}>{preset.label}</button>)}</div><button className="focus-save" disabled={!topicId||saving||running||remaining===minutes*60} onClick={()=>void save()}>{saving?"Saving session…":"Save focused session"}</button>{!mine.length&&<p className="focus-message">Add a topic to your roadmap to log a focus session.</p>}{message&&<p className="focus-message" role="status">{message}</p>}</section><aside className="focus-side"><section className="focus-card"><span className="focus-side-label">THIS SESSION</span><strong><Timer size={19}/>{remaining===0?"Ready to save":"Focus on one task"}</strong><p>Select a roadmap topic above, then log your session to update your streak.</p></section><section className="focus-card focus-premium-card" aria-label="Vibes, premium feature coming soon" aria-disabled="true"><span className="focus-side-label"><Music2 size={14}/> VIBES <span className="premium-lock"><LockKeyhole size={12}/> PREMIUM · COMING SOON</span></span><p>Playlist integrations are part of StudyPulse Premium and will be available later.</p><div className="focus-tags"><span>Lofi</span><span>Rain</span><span>Coffee shop</span><span>Forest</span></div></section><section className="focus-card"><span className="focus-side-label">A SMALL TIP</span><p>Pair a Pomodoro with a specific sub-task from your roadmap. Mark it done after the timer to keep your momentum going.</p></section></aside></div></div>;
}
function FriendsPage({currentName,friendName,inviteCode,memberCount,onCopy}:{currentName:string;friendName:string;inviteCode?:string;memberCount:number;onCopy:()=>void}) {
  return <div className="friends-page"><div className="page-heading"><div><div className="eyebrow">FRIENDS</div><h1>Study with your crew</h1><p className="subheading">Share your invite code and keep each other moving.</p></div></div><div style={{marginBottom:20}}><Friends3DOrbit currentName={currentName} friendName={friendName} memberCount={memberCount}/></div><div className="friends-cards"><section className="friends-card"><h2>Your study partner</h2><div className="friend-profile"><Avatar friend name={friendName}/><div><strong>{friendName}</strong><small>{memberCount>1?"In your workspace":"No study partner yet"}</small></div></div><p>When a friend joins your workspace, their roadmap progress appears alongside yours.</p></section><section className="friends-card"><h2>Invite by code</h2><p>Share this code with a friend so they can join your workspace.</p><div className="invite-code-row"><strong>{inviteCode??"Invite code unavailable"}</strong><button className="button-primary" disabled={!inviteCode} onClick={onCopy}>Copy code</button></div></section></div><section className="friends-card friends-list"><h2>Your friends <span>({Math.max(0,memberCount-1)})</span></h2>{memberCount>1?<div className="friend-profile"><Avatar friend name={friendName}/><div><strong>{friendName}</strong><small>Learning alongside {currentName}</small></div><span className="friend-online-dot"/></div>:<div className="friends-empty"><Users size={25}/><p>No friends yet. Send someone your invite code to study together.</p></div>}</section></div>;
}
function LeaderboardPage({topics,currentName,friendName,streak,memberCount}:{topics:Topic[];currentName:string;friendName:string;streak:number;memberCount:number}) {
  const rows=[{name:currentName,completed:topics.filter(topic=>topic.owner==="Divya"&&topic.status==="Completed").length,streak:streak as number|undefined,you:true},...(memberCount>1?[{name:friendName,completed:topics.filter(topic=>topic.owner==="Alex"&&topic.status==="Completed").length,streak:undefined as number|undefined,you:false}]:[])].sort((a,b)=>b.completed-a.completed);
  return <div className="leaderboard-page"><div className="page-heading"><div><div className="eyebrow">LEADERBOARD</div><h1><Trophy size={25}/> Streak champions</h1><p className="subheading">A little friendly motivation for your shared learning journey.</p></div></div><div style={{marginBottom:20}}><Leaderboard3DPodium rows={rows}/></div><section className="leaderboard-card">{rows.map((row,index)=><div className={`leaderboard-row ${index===0?"leader":""}`} key={row.name}><span className="leader-rank">{index+1}</span><Avatar friend={!row.you} name={row.name}/><div className="leader-person"><strong>{row.name}{row.you&&<small>YOU</small>}</strong><span>{row.completed} topics completed</span></div><div className="leader-score"><strong><Flame size={16}/>{row.streak??"—"}</strong><span>{row.completed} tasks</span></div></div>)}{rows.length<2&&<div className="leaderboard-empty">Invite a friend to see them here.</div>}</section></div>;
}

function generateDefaultStats(): StudyStats {
  const now = new Date();
  const year = now.getFullYear();
  const monthIdx = now.getMonth();
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const todayDate = now.getDate();

  const currentStreak = 4;
  const bestStreak = 7;
  let activeCount = 0;

  const month: MonthDay[] = Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1;
    const date = new Date(year, monthIdx, d);
    const key = `${year}-${String(monthIdx + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const isToday = d === todayDate;
    const isFuture = d > todayDate;
    const isActive = d <= todayDate && d >= Math.max(1, todayDate - currentStreak + 1);
    if (isActive) activeCount++;
    return {
      key,
      dayNumber: d,
      dayOfWeek: labels[date.getDay()],
      active: isActive,
      today: isToday,
      future: isFuture
    };
  });

  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    const key = date.toISOString().slice(0, 10);
    const isToday = date.toDateString() === now.toDateString();
    const d = date.getDate();
    const isActive = d <= todayDate && d >= Math.max(1, todayDate - currentStreak + 1);
    return {
      key,
      label: labels[date.getDay()],
      active: isActive,
      today: isToday
    };
  });

  return {
    currentStreak,
    bestStreak,
    totalDaysStudiedThisMonth: activeCount,
    monthName: monthNames[monthIdx],
    year,
    month,
    week
  };
}

const defaultStats: StudyStats = generateDefaultStats();

export default function Dashboard({
  initialTopics: providedTopics = [],
  currentName = "Divya Singh",
  friendName = "Study partner",
  api,
  planId,
  inviteCode,
  initialStats,
  currentEmail = "",
  workspaceName = "SDE-2 Study Room",
  memberCount = 1,
  isAuthenticated = true
}: {
  initialTopics?: Topic[];
  currentName?: string;
  friendName?: string;
  api: string;
  planId?: string;
  inviteCode?: string;
  initialStats?: StudyStats;
  currentEmail?: string;
  workspaceName?: string;
  memberCount?: number;
  isAuthenticated?: boolean;
}) {
  const [page, setPage] = useState("Dashboard");
  const [topics, setTopics] = useState<Topic[]>(providedTopics.length ? providedTopics : initialTopics);
  const [studyStats, setStudyStats] = useState<StudyStats>(initialStats ?? defaultStats);
  const [selected, setSelected] = useState<Topic | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("DSA");
  const [newDay, setNewDay] = useState(1);
  const [newOwner, setNewOwner] = useState<"Divya" | "Alex">("Divya");
  const [inviteCopied, setInviteCopied] = useState(false);
  const [currentInviteCode, setCurrentInviteCode] = useState(inviteCode);

  useEffect(() => {
    if (providedTopics && providedTopics.length > 0) {
      setTopics(providedTopics);
    }
  }, [providedTopics]);

  useEffect(() => {
    if (initialStats) {
      setStudyStats(initialStats);
    } else if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("studypulse_stats");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed.currentStreak === "number") {
            setStudyStats(parsed);
          }
        }
      } catch {}
    }
  }, [initialStats]);

  useEffect(() => {
    if (inviteCode) {
      setCurrentInviteCode(inviteCode);
    }
  }, [inviteCode]);

  const handleStatus = async (next: Topic) => {
    if (next.id && !next.id.startsWith("topic-")) {
      try {
        const response = await fetch(`${api}/topics/${next.id}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            status: next.status === "Completed" ? "COMPLETED" : next.status === "In progress" ? "IN_PROGRESS" : "NOT_STARTED"
          })
        });
        if (!response.ok) return false;
      } catch {
        return false;
      }
    }
    setTopics(old => old.map(t => ((next.id ? t.id === next.id : t.title === next.title) ? next : t)));
    setSelected(current => (current?.id === next.id ? next : current));

    if (next.status === "Completed") {
      void logStudySession(next, 25);
    }
    return true;
  };

  const logStudySession = async (topic: Topic, minutes: number) => {
    let savedStats: StudyStats | null = null;
    if (topic.id && !topic.id.startsWith("topic-")) {
      try {
        const response = await fetch(api + "/study-sessions", {
          method: "POST",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            topicId: topic.id,
            durationMinutes: minutes,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          })
        });
        if (response.ok) {
          const result = await response.json();
          if (result.stats) savedStats = result.stats;
        }
      } catch {
        // Fallback to local offline state update
      }
    }

    if (savedStats) {
      setStudyStats(savedStats);
      try { localStorage.setItem("studypulse_stats", JSON.stringify(savedStats)); } catch {}
      return true;
    }

    // Local state fallback update - ensures streak always increments & illuminates
    setStudyStats(prev => {
      const todayDate = new Date().getDate();
      const nextMonth = (prev.month ?? []).map(d => (d.today || d.dayNumber === todayDate) ? { ...d, active: true } : d);
      const isAlreadyActiveToday = prev.month?.some(d => (d.today || d.dayNumber === todayDate) && d.active);
      const nextCurrent = isAlreadyActiveToday ? prev.currentStreak : prev.currentStreak + 1;
      const nextBest = Math.max(prev.bestStreak, nextCurrent);
      const nextWeek = prev.week.map(d => d.today ? { ...d, active: true } : d);
      const totalStudied = (prev.totalDaysStudiedThisMonth ?? 0) + (isAlreadyActiveToday ? 0 : 1);
      const updated: StudyStats = {
        ...prev,
        currentStreak: nextCurrent,
        bestStreak: nextBest,
        totalDaysStudiedThisMonth: totalStudied,
        month: nextMonth,
        week: nextWeek
      };
      try { localStorage.setItem("studypulse_stats", JSON.stringify(updated)); } catch {}
      return updated;
    });
    return true;
  };

  const deleteTopic = async (topic: Topic) => {
    if (!topic.id || topic.owner !== "Divya" || !window.confirm("Delete " + topic.title + " from your roadmap? This cannot be undone.")) return;
    const response = await fetch(api + "/topics/" + topic.id, {
      method: "DELETE",
      credentials: "include"
    });
    if (response.ok) {
      setTopics(old => old.filter(t => t.id !== topic.id));
      setSelected(null);
    }
  };

  const rotateInvite = async () => {
    const response = await fetch(api + "/workspace/invite/rotate", {
      method: "POST",
      credentials: "include"
    });
    const result = await response.json();
    if (response.ok) setCurrentInviteCode(result.inviteCode);
  };

  const logout = async () => {
    await fetch(api + "/auth/logout", { method: "POST", credentials: "include" });
    window.location.href = "/login";
  };

  const openAddTopic = (day?: number) => {
    setNewDay(day ?? (Math.max(0, ...topics.filter(t => t.owner === "Divya").map(t => t.day)) + 1));
    setShowAdd(true);
  };

  const addTopic = async () => {
    if (!newTitle.trim() || !planId) return;
    const res = await fetch(`${api}/study-plans/${planId}/topics`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: newTitle.trim(),
        categoryName: newCategory,
        dayNumber: newDay,
        difficulty: "MEDIUM",
        estimatedHours: 1.5
      })
    });
    const result = await res.json();
    if (!res.ok) return;
    const created: Topic = {
      id: result.topic.id,
      title: result.topic.title,
      category: newCategory,
      status: "Not started",
      difficulty: "Medium",
      hours: 1.5,
      day: result.topic.dayNumber ?? newDay,
      owner: "Divya",
      description: "A new learning milestone in your personal roadmap."
    };
    setTopics(old => [...old, created]);
    setNewTitle("");
    setShowAdd(false);
  };

  return (
    <div className="app-shell">
      <Sidebar page={page} onNavigate={setPage} currentName={currentName} streak={studyStats.currentStreak} />
      <main className="main">
        <header className="topbar">
          <div className="crumb">
            <span className="crumb-workspace">{workspaceName}</span>
            <ChevronRight className="crumb-separator" size={12} />
            <b>{page}</b>
          </div>
          <div className="top-actions">
            <button className="icon-button"><CircleHelp size={16} /></button>
            <button className="icon-button"><Bell size={16} /><i className="notification-dot" /></button>
            <Avatar name={currentName} />
            {isAuthenticated ? (
              <button className="button-secondary" onClick={logout}>Sign out</button>
            ) : (
              <a
                href="/login"
                className="button-primary"
                style={{
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 14px",
                  fontSize: 12,
                  borderRadius: 8,
                  fontWeight: 600
                }}
              >
                <Sparkles size={13} /> Sign in
              </a>
            )}
          </div>
        </header>

        {!isAuthenticated && (
          <div
            style={{
              background: "linear-gradient(90deg, #8b5cf618 0%, #38bdf812 100%)",
              border: "1px solid #8b5cf633",
              borderRadius: 12,
              padding: "10px 16px",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              fontSize: 12
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#d1d5db" }}>
              <Sparkles size={15} style={{ color: "#8b5cf6", flexShrink: 0 }} />
              <span>
                <strong>Preview Mode</strong> — You’re exploring the study workspace with sample milestones. Sign in to save your personal roadmap.
              </span>
            </div>
            <a
              href="/login"
              className="button-primary"
              style={{
                textDecoration: "none",
                padding: "5px 12px",
                fontSize: 11,
                borderRadius: 7,
                flexShrink: 0
              }}
            >
              Sign in
            </a>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -17, marginBottom: 12 }}>
          {currentInviteCode && (
            <button
              className="button-secondary"
              onClick={async () => {
                await navigator.clipboard.writeText(currentInviteCode);
                setInviteCopied(true);
                setTimeout(() => setInviteCopied(false), 1800);
              }}
            >
              <Sparkles size={13} />
              {inviteCopied ? "Invite code copied" : `Invite a friend · ${inviteCode}`}
            </button>
          )}
        </div>

        {page === "Dashboard" ? (
          <DashboardHome
            topics={topics}
            onSelect={setSelected}
            onStatus={handleStatus}
            onAdd={() => openAddTopic()}
            currentName={currentName}
            friendName={friendName}
            streak={studyStats}
            onNavigate={setPage}
          />
        ) : page === "Friends" ? (
          <FriendsPage
            currentName={currentName}
            friendName={friendName}
            inviteCode={currentInviteCode}
            memberCount={memberCount}
            onCopy={() => {
              if (currentInviteCode) {
                void navigator.clipboard.writeText(currentInviteCode).then(() => {
                  setInviteCopied(true);
                  setTimeout(() => setInviteCopied(false), 1800);
                });
              }
            }}
          />
        ) : page === "Roadmap" ? (
          <Roadmap
            topics={topics}
            onSelect={setSelected}
            onAdd={openAddTopic}
            onStatus={handleStatus}
            onDelete={topic => void deleteTopic(topic)}
          />
        ) : page === "Study Room" ? (
          <StudyRoom topics={topics} onLog={logStudySession} />
        ) : page === "Leaderboard" ? (
          <LeaderboardPage
            topics={topics}
            currentName={currentName}
            friendName={friendName}
            streak={studyStats.currentStreak}
            memberCount={memberCount}
          />
        ) : page === "Profile" ? (
          <>
            <Settings3DIdentity name={currentName} workspaceName={workspaceName} streak={studyStats.currentStreak} />
            <WorkspaceSettings
              name={currentName}
              email={currentEmail}
              workspaceName={workspaceName}
              memberCount={memberCount}
              inviteCode={currentInviteCode}
              onRotate={() => void rotateInvite()}
              onLogout={() => void logout()}
            />
          </>
        ) : (
          <>
            <div className="page-heading">
              <div>
                <div className="eyebrow">Keep the momentum</div>
                <h1>Shared activity</h1>
                <p className="subheading">Celebrate the work you’re both putting in.</p>
              </div>
            </div>
            <div className="journey-view">
              {topics.map(t => (
                <div
                  className="activity-item"
                  key={t.title}
                  onClick={() => setSelected(t)}
                  style={{ cursor: "pointer", borderBottom: "1px solid #f4f4f6", paddingBottom: 13 }}
                >
                  <div className="activity-icon"><Check size={13} /></div>
                  <div>
                    <b>{t.owner} · {t.title}</b>
                    <small>{t.status} · {t.category}</small>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <AnimatePresence>
        {selected && (
          <TopicPanel
            topic={selected}
            onClose={() => setSelected(null)}
            onStatus={handleStatus}
            onDelete={() => void deleteTopic(selected)}
            canDelete={selected.owner === "Divya"}
            canLog={selected.owner === "Divya"}
            onLogSession={logStudySession}
          />
        )}
      </AnimatePresence>

      {showAdd && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#14131b66",
            zIndex: 30,
            display: "grid",
            placeItems: "center",
            padding: 20
          }}
          onClick={() => setShowAdd(false)}
        >
          <motion.div
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
            style={{
              background: "white",
              width: "min(430px, 100%)",
              borderRadius: 15,
              padding: 24,
              boxShadow: "0 20px 70px #0003"
            }}
          >
            <div className="card-heading">
              <div>
                <div className="eyebrow">Make it yours</div>
                <h2 style={{ font: "700 20px Manrope", margin: 0 }}>Add a topic</h2>
              </div>
              <button className="icon-button" onClick={() => setShowAdd(false)}><X size={15} /></button>
            </div>
            <p className="subheading" style={{ lineHeight: 1.6, margin: "10px 0 20px" }}>
              Add a milestone to your independent roadmap.
            </p>
            <label style={{ fontSize: 11, fontWeight: 600, display: "block", marginBottom: 7 }}>Topic or question</label>
            <input
              autoFocus
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="e.g. Build a rate limiter or DP Question 3"
              style={{
                width: "100%",
                padding: "11px 12px",
                border: "1px solid #e7e7ed",
                borderRadius: 8,
                fontSize: 12,
                outlineColor: "#7459e8",
                marginBottom: 15
              }}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 110px", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, display: "block", marginBottom: 7 }}>Category</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  style={{ width: "100%", padding: 10, border: "1px solid #e7e7ed", borderRadius: 8, fontSize: 11, background: "white" }}
                >
                  {Array.from(
                    new Set([
                      "DSA",
                      "LLD & OOP",
                      "HLD / System Design",
                      "Java",
                      "Spring",
                      "Databases",
                      "Kafka",
                      "Cloud",
                      "CS Fundamentals",
                      "Interview Prep",
                      ...topics.filter(t => t.owner === "Divya").map(t => t.category)
                    ])
                  ).map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, display: "block", marginBottom: 7 }}>Day</label>
                <input
                  type="number"
                  min={1}
                  value={newDay}
                  onChange={e => setNewDay(Math.max(1, Number(e.target.value) || 1))}
                  style={{ width: "100%", padding: 10, border: "1px solid #e7e7ed", borderRadius: 8, fontSize: 11 }}
                />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 22 }}>
              <button className="button-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="button-primary" onClick={addTopic}><Plus size={14} /> Add topic</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
