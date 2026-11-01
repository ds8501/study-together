"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Bell, BookOpen, Check, ChevronDown, ChevronRight, CircleHelp, Code2, Copy, Flame, GripVertical, LayoutDashboard, Link, LockKeyhole, Map, MessageCircle, MoveDown, MoveUp, Pause, Play, Plus, QrCode, RotateCcw, Search, Share2, Sparkles, Target, Timer, Trash2, Trophy, UserRound, Users, X } from "lucide-react";
import WorkspaceSettings from "./WorkspaceSettings";
import StudySessionLogger from "./StudySessionLogger";
import RoadmapDashboard from "./RoadmapDashboard";
import ThemeToggle from "./ThemeToggle";
import StudyRoomClock from "./StudyRoomClock";
import InviteQrCode from "./InviteQrCode";
import Leaderboard3DPodium from "./three/Leaderboard3DPodium";
import { APP_NAME, APP_PUBLIC_URL } from "@/lib/brand";
import { displayTopicTitle } from "@/lib/topic-title";
import TiltCard from "./TiltCard";

const Settings3DIdentity = dynamic(() => import("./three/Settings3DIdentity"), {
  ssr: false,
  loading: () => <div className="identity-3d-fallback" aria-hidden="true"><span /></div>
});
const Universe = dynamic(() => import("./Universe"), {
  ssr: false,
  loading: () => <div className="journey-universe-fallback" aria-hidden="true" />
});

type Status = "Completed" | "In progress" | "Not started";
export type MonthDay = { key: string; dayNumber: number; dayOfWeek: string; active: boolean; today: boolean; future: boolean; topicsStudied?: number; minutesStudied?: number };
export type StudyStats = { currentStreak: number; bestStreak: number; totalStudyMinutes?: number; totalDaysStudiedThisMonth?: number; monthName?: string; year?: number; month?: MonthDay[]; week: Array<{ key: string; label: string; active: boolean; today: boolean }> };
type Topic = { id?: string | number; title: string; category: string; status: Status; difficulty: string; hours: number; day: number; order?: number; owner: "Divya" | "Alex"; description: string };
type LearningGoal = "System Design" | "DSA" | "LLD" | "Interview Prep";
const roadmapTemplates: Record<LearningGoal, Array<{ title: string; description: string; hours: number }>> = {
  "System Design": [
    { title: "API design and service boundaries", description: "Define resource-oriented APIs and split responsibilities into clear services.", hours: 1.5 },
    { title: "Caching and data storage", description: "Choose storage and caching strategies for common access patterns.", hours: 2 },
    { title: "Design a URL shortener", description: "Design key generation, redirects, storage, caching, and analytics.", hours: 2.5 },
    { title: "Queues and asynchronous work", description: "Use queues to make services resilient and scale background work.", hours: 2 },
    { title: "Capacity planning and tradeoffs", description: "Estimate load and explain tradeoffs in a system design interview.", hours: 1.5 }
  ],
  DSA: [
    { title: "Arrays, strings, and hash maps", description: "Practice frequency maps, prefix sums, and common array patterns.", hours: 2 },
    { title: "Two pointers and sliding windows", description: "Recognize and solve linear-time window problems.", hours: 2 },
    { title: "Trees and graph traversal", description: "Use DFS, BFS, and visited sets to explore connected structures.", hours: 2.5 },
    { title: "Dynamic programming patterns", description: "Build state definitions and transitions for common DP problems.", hours: 2.5 },
    { title: "Timed coding practice", description: "Solve a mixed set of interview problems under a time limit.", hours: 1.5 }
  ],
  LLD: [
    { title: "Object modeling and SOLID", description: "Turn requirements into cohesive objects with clear responsibilities.", hours: 2 },
    { title: "Parking lot design", description: "Model a parking lot, its vehicles, spots, tickets, and pricing rules.", hours: 2.5 },
    { title: "Design patterns in context", description: "Choose patterns to solve concrete extensibility problems.", hours: 2 },
    { title: "Concurrency and thread safety", description: "Protect shared state and reason about concurrent operations.", hours: 2 },
    { title: "Rate limiter design", description: "Compare token bucket, leaky bucket, and fixed-window approaches.", hours: 2 }
  ],
  "Interview Prep": [
    { title: "Craft your introduction", description: "Prepare a concise introduction focused on your experience and impact.", hours: 1 },
    { title: "Behavioral stories with STAR", description: "Prepare clear examples for collaboration, ownership, and conflict.", hours: 1.5 },
    { title: "Resume deep dive", description: "Practice explaining the choices and outcomes behind your projects.", hours: 1.5 },
    { title: "Mock coding interview", description: "Work through a coding prompt while explaining your approach aloud.", hours: 2 },
    { title: "Mock system design interview", description: "Lead a design discussion from requirements through tradeoffs.", hours: 2 }
  ]
};
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
function Avatar({friend=false,name,avatar}:{friend?:boolean;name?:string;avatar?:string|null}){return <div className={`avatar ${friend?"friend":""}`}>{avatar?.startsWith("emoji:")?avatar.slice(6):name?name.trim().split(/\s+/).slice(0,2).map(p=>p[0]).join("").toUpperCase():friend?"AL":"DV"}</div>}
function Sidebar({page,onNavigate,currentName,currentAvatar,streak}:{page:string;onNavigate:(p:string)=>void;currentName:string;currentAvatar?:string|null;streak:number}) {
  const nav=[{name:"Dashboard",icon:LayoutDashboard},{name:"Roadmap",icon:Map},{name:"Study Room",icon:Timer},{name:"Friends",icon:Users},{name:"Leaderboard",icon:Trophy},{name:"Profile",icon:UserRound}];
  return <header className="sidebar"><a className="brand" href="/dashboard" aria-label={`${APP_NAME} dashboard`}><span className="brand-mark"><Flame size={18}/></span><span className="brand-name">{APP_NAME}</span></a><nav className="top-nav" aria-label="Main navigation">{nav.map(({name,icon:Icon})=><button key={name} className={`nav-link ${page===name?"active":""}`} onClick={()=>onNavigate(name)}><Icon size={16}/><span>{name}</span></button>)}<a className="nav-link" href="/debugging-interview"><Code2 size={16}/><span>Debugging practice</span></a></nav><div className="nav-account"><ThemeToggle/>{streak ? <span className="nav-streak"><Flame size={15}/>{streak}</span> : <button type="button" className="nav-streak nav-streak-start" onClick={() => onNavigate("Study Room")} aria-label="Start a study session to begin your streak"><Flame size={15}/>Start</button>}<div className="nav-avatar"><Avatar name={currentName} avatar={currentAvatar}/></div></div><nav className="mobile-bottom-nav" aria-label="Mobile navigation">{nav.map(({name,icon:Icon})=><button type="button" key={name} className={page===name?"active":""} aria-current={page===name?"page":undefined} onClick={()=>onNavigate(name)}><Icon size={18}/><span>{name}</span></button>)}<a href="/debugging-interview"><Code2 size={18}/><span>Debugging</span></a></nav></header>
}
function ProgressCard({friend,topics,currentName,friendName}:{friend?:boolean;topics:Topic[];currentName:string;friendName:string}) { const mine=topics.filter(t=>t.owner===(friend?"Alex":"Divya"));const done=mine.filter(t=>t.status==="Completed").length;const active=mine.filter(t=>t.status==="In progress").length;const total=mine.length;const pct=total?Math.round(done/total*100):0;return <div className="progress-card"><div className="card-heading"><div className="person-label"><Avatar friend={friend} name={friend?friendName:currentName}/>{friend?friendName:currentName}{!friend&&<span style={{fontSize:9,color:"#9698a2",fontWeight:400}}>You</span>}</div><span className={`progress-pill ${friend?"green":""}`}>{pct}% complete</span></div><div className="stats-row"><div className="stat-item"><div className="stat-value">{done.toString().padStart(2,"0")}</div><div className="stat-label">Completed</div></div><div className="stat-item"><div className="stat-value">{active.toString().padStart(2,"0")}</div><div className="stat-label">In progress</div></div><div className="stat-item"><div className="stat-value">{Math.max(0,total-done-active).toString().padStart(2,"0")}</div><div className="stat-label">Remaining</div></div></div><div className="progress-track"><div className={`progress-fill ${friend?"green":""}`} style={{width:`${pct}%`}}/></div></div> }
function TopicPanel({topic,onClose,onStatus,onDelete,canDelete,onLogSession,canLog}:{topic:Topic;onClose:()=>void;onStatus:(t:Topic)=>void;onDelete:()=>void;canDelete:boolean;onLogSession:(topic:Topic,minutes:number)=>Promise<boolean>;canLog:boolean}) { return <motion.aside className="topic-panel" initial={{x:30,opacity:0}} animate={{x:0,opacity:1}} exit={{x:30,opacity:0}}><button className="icon-button close" onClick={onClose}><X size={16}/></button><div className="panel-kicker">{topic.category} · Day {topic.day}</div><h2>{displayTopicTitle(topic.title)}</h2><p className="panel-desc">{topic.description}</p><div className="detail-grid"><div className="detail-box"><small>Status</small><strong>{topic.status}</strong></div><div className="detail-box"><small>Difficulty</small><strong>{topic.difficulty}</strong></div><div className="detail-box"><small>Estimated time</small><strong>{topic.hours} hours</strong></div><div className="detail-box"><small>Roadmap owner</small><strong>{topic.owner}</strong></div></div><div style={{fontSize:11,color:"#888",lineHeight:1.7}}>This topic is part of <b style={{color:"#555"}}>{topic.owner}’s independent roadmap</b>. Progress here is visible to everyone in the workspace.</div>{canLog&&<StudySessionLogger onLog={minutes=>onLogSession(topic,minutes)}/>}<div className="panel-actions">{canDelete&&<button className="button-secondary" onClick={onDelete}><Trash2 size={14}/> Delete topic</button>}<button className="button-primary" onClick={()=>onStatus({...topic,status:topic.status==="Completed"?"In progress":"Completed"})}><Check size={14}/>{topic.status==="Completed"?"Reopen topic":"Mark complete"}</button></div></motion.aside> }
 function DashboardHome(props: Parameters<typeof RoadmapDashboard>[0]) { return <RoadmapDashboard {...props} />; }

function Journey({topics,onSelect,currentName,friendName}:{topics:Topic[];onSelect:(t:Topic)=>void;currentName:string;friendName:string}) {return <><div className="page-heading"><div><div className="eyebrow">The long game</div><h1>Your journeys</h1><p className="subheading">Every small step adds up to something bigger.</p></div><button className="button-secondary"><ChevronDown size={14}/> All time</button></div><div className="scene-card" style={{height:280}}><div className="scene-overlay"><div className="scene-title">Two independent paths</div><div className="scene-subtitle">A shared view of your learning progress</div></div><Universe topics={topics} onSelect={onSelect}/><div className="scene-footer"><div className="scene-person"><Avatar name={currentName}/><div>{currentName}<span>{topics.filter(t=>t.owner==="Divya"&&t.status==="Completed").length} milestones reached</span></div></div><div className="scene-person right"><div>{friendName}<span>{topics.filter(t=>t.owner==="Alex"&&t.status==="Completed").length} milestones reached</span></div><Avatar friend name={friendName}/></div></div></div><div className="journey-view">{(["Divya","Alex"] as const).map(owner=>{const ownerTopics=topics.filter(t=>t.owner===owner).sort((a,b)=>a.day-b.day);return <div className="journey-lane" key={owner}><div className="lane-header"><Avatar friend={owner==="Alex"}/>{owner=== "Divya"?"Divya’s journey":"{friendName}’s journey"}<span className="section-meta" style={{marginLeft:"auto"}}>{ownerTopics.filter(t=>t.status==="Completed").length} of {ownerTopics.length} complete</span></div><div className="day-track">{Array.from(new Set(ownerTopics.map(t=>t.day))).map(day=>{const dayTopics=ownerTopics.filter(t=>t.day===day);const complete=dayTopics.every(t=>t.status==="Completed");return <div className={`day-group ${complete?"completed":""}`} key={day}><div className="day-dot"/><div className="day-number">DAY {day}</div><div className="day-topics">{dayTopics.map(t=><div key={displayTopicTitle(t.title)} onClick={()=>onSelect(t)} style={{cursor:"pointer"}}>{displayTopicTitle(t.title)}</div>)}</div></div>})}</div></div>})}</div></> }
function Roadmap({topics,onSelect,onAdd,onStatus,onDelete,onReorder}:{topics:Topic[];onSelect:(t:Topic)=>void;onAdd:(day?:number)=>void;onStatus:(t:Topic)=>Promise<boolean>;onDelete:(t:Topic)=>void;onReorder:(ids:string[])=>Promise<boolean>}) {
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
  const [view,setView]=useState<"path"|"list">("path");
  const [draggedId,setDraggedId]=useState<string|null>(null);
  const mine=topics.filter(t=>t.owner==="Divya").sort((a,b)=>a.day-b.day||(a.order??0)-(b.order??0));
  const categories=Array.from(new Set(mine.map(t=>t.category)));
  const completed=mine.filter(t=>t.status==="Completed").length;
  const percent=mine.length?Math.round(completed/mine.length*100):0;
  const filtered=mine.filter(t=>{
    const matchesQuery=`${displayTopicTitle(t.title)} ${t.category}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesStatus=filter==="All"||(filter==="Done"?t.status==="Completed":t.status!=="Completed");
    return matchesQuery&&matchesStatus&&(categoryFilter==="All"||t.category===categoryFilter);
  });
  const days=Array.from(new Set(filtered.map(t=>t.day))).sort((a,b)=>a-b);
  const currentTopic=mine.find(t=>t.status==="In progress")??mine.find(t=>t.status!=="Completed");
  const toggleDay=(day:number)=>setExpandedDays(old=>{const next=new Set(old);next.has(day)?next.delete(day):next.add(day);return next});
  const toggleDone=async(topic:Topic)=>{
    if(!topic.id)return;
    const tid = String(topic.id);
    setSavingId(tid);setSaveError("");
    try {
      const ok=await onStatus({...topic,status:topic.status==="Completed"?"Not started":"Completed"});
      if(!ok)setSaveError("Could not save that update. Please try again.");
    } catch {
      setSaveError("Could not save that update. Please try again.");
    } finally {
      setSavingId(null);
    }
  };
  const dropBefore=async(target:Topic,sourceId=draggedId,after=false)=>{
    if(!sourceId||sourceId===String(target.id))return;
    const source=mine.find(t=>String(t.id)===sourceId);
    if(!source||source.day!==target.day)return;
    const inDay=mine.filter(t=>t.day===target.day);
    const from=inDay.findIndex(t=>String(t.id)===sourceId);
    if(from<0)return;
    const moved=[...inDay];const [item]=moved.splice(from,1);const targetIndex=moved.findIndex(t=>String(t.id)===String(target.id));moved.splice(targetIndex+(after?1:0),0,item);
    const orderIds=mine.map(t=>String(t.id));
    const dayIds=new Set(inDay.map(t=>String(t.id)));
    const reordered=orderIds.map(id=>dayIds.has(id)?undefined:id).filter((id):id is string=>Boolean(id));
    const firstDayIndex=orderIds.findIndex(id=>dayIds.has(id));
    reordered.splice(firstDayIndex,0,...moved.map(t=>String(t.id)));
    setDraggedId(null);
    if(!await onReorder(reordered))setSaveError("Could not save the new topic order. Please try again.");
  };
  return <>
    <div className="page-heading roadmap-heading"><div><div className="eyebrow">Owned by you · {mine.length} topics</div><h1>My roadmap</h1><p className="subheading">A clear, day-by-day checklist for your learning plan.</p></div><button className="button-primary" onClick={()=>onAdd()}><Plus size={15}/> Add a topic</button></div>
    <section className="roadmap-progress-card"><div><span className="roadmap-progress-label">Overall progress</span><strong>{completed}<small> / {mine.length} done</small></strong></div><div className="roadmap-progress-right"><span>{percent}%</span><div className="progress-track"><div className="progress-fill" style={{width:`${percent}%`}}/></div></div></section>
    <TiltCard className="roadmap-current-hero"><div><span className="eyebrow">YOUR NEXT STEP · DAY {currentTopic?.day ?? "—"}</span><h2>{currentTopic?displayTopicTitle(currentTopic.title):mine.length?"Roadmap complete":"Your path is clear"}</h2><p>{currentTopic?`${currentTopic.category} · ${currentTopic.hours}h estimated`:mine.length?"You have completed every topic on your roadmap.":"Add your first milestone to build a learning path."}</p></div>{currentTopic&&<button className="button-primary" onClick={()=>onSelect(currentTopic)}>Continue <ChevronRight size={15}/></button>}</TiltCard>
    <div className="roadmap-view-toggle" role="tablist" aria-label="Roadmap display"><button role="tab" aria-selected={view==="path"} className={view==="path"?"selected":""} onClick={()=>setView("path")}>Level path</button><button role="tab" aria-selected={view==="list"} className={view==="list"?"selected":""} onClick={()=>setView("list")}>List</button></div>
    {view==="path"?<div className="level-path">{Array.from(new Set(mine.map(t=>t.day))).map((day,dayIndex)=>{const dayTopics=mine.filter(t=>t.day===day);const status=dayTopics.every(t=>t.status==="Completed")?"done":dayTopics.some(t=>t.status==="In progress")||dayTopics.some(t=>t===currentTopic)?"current":"upcoming";return <section className={`level-path-day ${status} ${dayIndex%2===0?"path-left":"path-right"}`} key={day}><div className="level-path-node">{status==="done"?<Check size={20}/>:<span>{String(day).padStart(2,"0")}</span>}</div><div className="level-path-content"><div className="level-path-heading"><strong>Day {day}</strong><small>{dayTopics.filter(t=>t.status==="Completed").length}/{dayTopics.length} complete</small></div>{dayTopics.map(topic=><button className="level-path-topic" key={topic.id??topic.title} onClick={()=>onSelect(topic)}><span>{displayTopicTitle(topic.title)}</span><small>{topic.category} · {topic.status}</small></button>)}</div></section>})}</div>:<><div className="roadmap-toolbar"><label className="roadmap-search"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find a topic or question" aria-label="Search roadmap"/></label><select className="roadmap-category-select" aria-label="Filter by category" value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)}><option value="All">All categories</option>{categories.map(category=><option key={category} value={category}>{category}</option>)}</select><div className="roadmap-filters">{(["All","To do","Done"] as const).map(item=><button key={item} className={`roadmap-filter ${filter===item?"selected":""}`} onClick={()=>setFilter(item)}>{item}</button>)}</div></div>
    {saveError&&<div className="roadmap-save-error" role="alert">{saveError}</div>}
    <div className="roadmap-days">{days.map(day=>{const dayTopics=filtered.filter(t=>t.day===day);const dayDone=dayTopics.filter(t=>t.status==="Completed").length;const expanded=expandedDays.has(day)||Boolean(query);const dayCategories=Array.from(new Set(dayTopics.map(t=>t.category)));return <section className={`roadmap-day ${dayDone===dayTopics.length?"day-complete":""}`} key={day}><div className="roadmap-day-header"><button className="roadmap-day-toggle" onClick={()=>toggleDay(day)} aria-expanded={expanded}><span className="roadmap-day-number">{dayDone===dayTopics.length&&dayTopics.length>0?<Check size={15}/>:String(day).padStart(2,"0")}</span><span className="roadmap-day-title"><strong>Day {day}</strong><small>{dayDone===dayTopics.length&&dayTopics.length>0?"Day complete":"Keep moving at your own pace"}</small></span><span className="roadmap-day-count">{dayDone}/{dayTopics.length} done</span><span className="roadmap-day-chevron"><ChevronDown size={16}/></span></button><button className="roadmap-day-add" onClick={()=>onAdd(day)} aria-label={`Add a topic or question to Day ${day}`} title="Add to this day"><Plus size={14}/></button></div>{expanded&&<div className="roadmap-day-content">{dayCategories.map(category=><div className="roadmap-topic-group" key={`${day}-${category}`}><h3>{category}</h3>{dayTopics.filter(t=>t.category===category).map(topic=>{const done=topic.status==="Completed";return <div className={`roadmap-topic-row ${done?"topic-done":""}`} key={topic.id??topic.title} draggable={!savingId} onDragStart={()=>setDraggedId(String(topic.id))} onDragEnd={()=>setDraggedId(null)} onDragOver={event=>event.preventDefault()} onDrop={event=>{event.preventDefault();void dropBefore(topic)}}><button className="roadmap-drag-handle" aria-label={`Drag to reorder ${displayTopicTitle(topic.title)}`} title="Drag to reorder"><GripVertical size={14}/></button><button type="button" className="roadmap-checkbox" role="checkbox" aria-checked={done} aria-label={`${done?"Mark as not done":"Mark as done"}: ${displayTopicTitle(topic.title)}`} disabled={savingId===String(topic.id)} onClick={()=>void toggleDone(topic)}>{done&&<Check size={13}/>}</button><button type="button" className="roadmap-topic-title" onClick={()=>onSelect(topic)}><span>{displayTopicTitle(topic.title)}</span><small>{topic.status}{topic.hours?` · ${topic.hours}h`:""}</small></button><button type="button" className="roadmap-move-button" aria-label={`Move ${displayTopicTitle(topic.title)} up`} onClick={()=>{const siblings=mine.filter(t=>t.day===topic.day);const i=siblings.findIndex(t=>String(t.id)===String(topic.id));if(i>0)void dropBefore(siblings[i-1],String(topic.id));}}><MoveUp size={13}/></button><button type="button" className="roadmap-move-button" aria-label={`Move ${displayTopicTitle(topic.title)} down`} onClick={()=>{const siblings=mine.filter(t=>t.day===topic.day);const i=siblings.findIndex(t=>String(t.id)===String(topic.id));if(i>=0&&i<siblings.length-1)void dropBefore(siblings[i+1],String(topic.id),true);}}><MoveDown size={13}/></button><button type="button" className="roadmap-delete" aria-label={`Delete ${displayTopicTitle(topic.title)}`} title="Delete topic" onClick={()=>onDelete(topic)}><Trash2 size={14}/></button></div>})}</div>)}</div>}</section>})}{days.length===0&&<div className="roadmap-empty">No topics match those filters.</div>}</div></>}
  </>;
}
function StudyRoom({topics,onLog,todayFocusMinutes}:{topics:Topic[];onLog:(topic:Topic,minutes:number)=>Promise<boolean>;todayFocusMinutes:number}) {
  const mine=topics.filter(topic=>(topic.owner==="Divya"||!topic.owner)&&topic.id);
  const [topicId,setTopicId]=useState(mine.find(topic=>topic.status!=="Completed")?.id??mine[0]?.id??"");
  const [minutes,setMinutes]=useState(25),[remaining,setRemaining]=useState(1500),[running,setRunning]=useState(false),[saving,setSaving]=useState(false),[message,setMessage]=useState("");
  const completedRef=useRef(false);
  useEffect(()=>{if(!running)return;const timer=window.setInterval(()=>setRemaining(value=>Math.max(0,value-1)),1000);return()=>window.clearInterval(timer);},[running]);
  useEffect(()=>{
    if(!running||remaining!==0||completedRef.current)return;
    completedRef.current=true;
    setRunning(false);
    const topic=mine.find(item=>String(item.id)===String(topicId));
    if(!topic){setMessage("Choose a roadmap topic to save this session.");return;}
    setSaving(true);
    void onLog(topic,minutes).then(ok=>{
      setMessage(ok?"Session complete and saved. Your streak is up to date.":"Session complete, but it could not be saved.");
      setSaving(false);
      if(ok)setRemaining(minutes*60);
    });
  },[minutes,mine,onLog,remaining,running,topicId]);
  useEffect(()=>{
    const onKeyDown=(event:KeyboardEvent)=>{
      const target=event.target as HTMLElement|null;
      if(event.code!=="Space"||target?.isContentEditable||["INPUT","TEXTAREA","SELECT","BUTTON"].includes(target?.tagName??""))return;
      event.preventDefault();
      if(saving)return;
      if(remaining===0){completedRef.current=false;setRemaining(minutes*60);}
      if(!running)completedRef.current=false;
      setRunning(value=>!value);
    };
    window.addEventListener("keydown",onKeyDown);
    return()=>window.removeEventListener("keydown",onKeyDown);
  },[minutes,remaining,running,saving]);
  const setPreset=(value:number)=>{completedRef.current=false;setMinutes(value);setRemaining(value*60);setRunning(false);setMessage("");};
  const reset=()=>{completedRef.current=false;setRunning(false);setRemaining(minutes*60);setMessage("");};
  const save=async()=>{const topic=mine.find(item=>String(item.id)===String(topicId));if(!topic)return;setSaving(true);const studied=Math.max(1,Math.ceil((minutes*60-remaining)/60));const ok=await onLog(topic,studied);setMessage(ok?"Session saved. Your streak is up to date.":"Could not save the session. Please try again.");setSaving(false);if(ok)reset();};
  return <div className="focus-page"><div className="page-heading"><div><div className="eyebrow">STUDY ROOM</div><h1>Focus mode</h1><p className="subheading">Set a goal, start the timer, and let the clock keep you honest.</p></div></div><StudyRoomClock running={running} remaining={remaining} minutes={minutes} todayFocusMinutes={todayFocusMinutes} topicTitle={displayTopicTitle(mine.find(item=>item.id===topicId)?.title ?? "") || undefined}/><div className="focus-grid"><section className="focus-card"><label className="focus-topic-label">What are you working on?</label><select value={topicId} onChange={event=>setTopicId(event.target.value)}><option value="">Choose a roadmap topic</option>{mine.map(topic=><option key={topic.id} value={topic.id}>{displayTopicTitle(topic.title)}</option>)}</select><div className="focus-controls"><button className="button-primary" onClick={()=>{if(remaining===0){completedRef.current=false;setRemaining(minutes*60);}if(!running)completedRef.current=false;setRunning(value=>!value)}} disabled={saving||!topicId}>{running?<Pause size={16}/>:<Play size={16}/>} {running?"Pause":"Start"}</button><button className="button-secondary" onClick={reset} disabled={saving}><RotateCcw size={15}/> Reset</button></div><div className="focus-presets">{[{label:"Pomodoro · 25m",value:25},{label:"Short break · 5m",value:5},{label:"Deep focus · 50m",value:50},{label:"Sprint · 15m",value:15}].map(preset=><button key={preset.value} className={minutes===preset.value?"selected":""} onClick={()=>setPreset(preset.value)} disabled={running||saving}>{preset.label}</button>)}</div><button className="focus-save" disabled={!topicId||saving||running||remaining===minutes*60} onClick={()=>void save()}><Check size={15}/>{saving?"Saving session…":"Save focused session"}</button>{!topicId&&mine.length>0&&<p className="focus-message">Choose a topic to begin.</p>}{topicId&&!running&&remaining===minutes*60&&!message&&<p className="focus-message">Start a timer, then save a partial session here.</p>}{!mine.length&&<p className="focus-message">Add a topic to your roadmap to log a focus session.</p>}{message&&<p className="focus-message" role="status">{message}</p>}</section><aside className="focus-side"><section className="focus-card"><span className="focus-side-label">THIS SESSION</span><strong><Timer size={19}/>{remaining===0?"Session complete":"Focus on one task"}</strong><p>Completed sessions save automatically and update your streak and activity calendar.</p><small>Press Space to {running?"pause":"start or resume"}.</small></section><section className="focus-card"><span className="focus-side-label">A SMALL TIP</span><p>Pair a Pomodoro with a specific sub-task from your roadmap. Pause when you’re ready to save a partial session.</p></section></aside></div></div>;
}
function FriendsPage({topics,currentName,friendName,inviteCode,memberCount,onEncourage}:{topics:Topic[];currentName:string;friendName:string;inviteCode?:string;memberCount:number;onEncourage:(kind:"nudge"|"cheer")=>void}) {
  const mine=topics.filter(topic=>topic.owner==="Divya");const theirs=topics.filter(topic=>topic.owner==="Alex");
  const myProgress=mine.length?Math.round(mine.filter(topic=>topic.status==="Completed").length/mine.length*100):0;
  const friendProgress=theirs.length?Math.round(theirs.filter(topic=>topic.status==="Completed").length/theirs.length*100):0;
  const [shareLink,setShareLink]=useState("");const[copied,setCopied]=useState(false);const[codeCopied,setCodeCopied]=useState(false);
  useEffect(()=>{
    if (!inviteCode) { setShareLink(""); return; }
    const inviteUrl = new URL("/login", APP_PUBLIC_URL);
    inviteUrl.searchParams.set("invite", inviteCode.trim());
    setShareLink(inviteUrl.toString());
  },[inviteCode]);
  const copyLink=async()=>{if(!shareLink)return;try{await navigator.clipboard.writeText(shareLink);setCopied(true);window.setTimeout(()=>setCopied(false),1800);}catch{setCopied(false);}};
  const copyCode=async()=>{if(!inviteCode)return;try{await navigator.clipboard.writeText(inviteCode);setCodeCopied(true);window.setTimeout(()=>setCodeCopied(false),1800);}catch{setCodeCopied(false);}};
  const whatsappMessage = `Join me on Study Together and compare our learning progress:\n${shareLink}`;
  const whatsappHref=`https://wa.me/?${new URLSearchParams({ text: whatsappMessage }).toString()}`;
  return <div className="friends-page"><div className="page-heading"><div><div className="eyebrow">FRIENDS</div><h1>Study with your crew</h1><p className="subheading">Share an invite and make steady progress together.</p></div></div>
    {memberCount<2?<section className="friends-invite-panel"><div className="friends-invite-main"><span className="friends-invite-kicker"><Users size={15}/> YOUR STUDY CIRCLE</span><h2>Your next study partner is one invite away</h2><p>Share the link or short code. When they join, you’ll see each other’s progress here.</p><div className="friends-code-box"><div><span>YOUR INVITE CODE</span><strong>{inviteCode??"Loading code…"}</strong></div><button type="button" className="friends-copy-code" disabled={!inviteCode} onClick={()=>void copyCode()}><Copy size={13}/>{codeCopied?"Copied":"Copy code"}</button></div><div className="friends-link-row"><Link size={15}/><span>{shareLink||"Preparing your share link…"}</span></div><div className="friends-share-actions"><a className="friends-whatsapp" href={shareLink?whatsappHref:undefined} target="_blank" rel="noreferrer" aria-disabled={!shareLink}><MessageCircle size={16}/> Share on WhatsApp</a><button type="button" className="button-secondary" onClick={()=>void copyLink()} disabled={!shareLink}><Copy size={15}/>{copied?"Link copied":"Copy invite link"}</button></div><small className="friends-invite-note">Your friend can enter the code during sign-up, or open the link to have it filled in.</small></div><aside className="friends-preview"><div className="friends-preview-heading"><span>WHAT YOU’LL UNLOCK</span><QrCode size={15}/></div><div className="friends-preview-card"><div className="friends-preview-title"><span>PROGRESS COMPARISON</span><b>PREVIEW</b></div><div className="friends-preview-person"><Avatar name={currentName}/><div><strong>{currentName}</strong><small>Learning roadmap</small></div><em>{myProgress}%</em></div><i className="friends-preview-track"><b style={{width:`${myProgress}%`}}/></i><div className="friends-preview-person ghost"><Avatar friend name="Study partner"/><div><strong>Your study partner</strong><small>Roadmap progress</small></div><em>—</em></div><i className="friends-preview-track ghost-track"><b/></i><div className="friends-preview-foot"><span>Shared goals</span><span>Streaks</span><span>Milestones</span></div></div><div className="friends-qr-wrap">{shareLink?<InviteQrCode value={shareLink}/>:<div className="friends-qr-placeholder"/>}<span>SCAN TO JOIN</span></div></aside></section>:<><div className="friends-cards"><TiltCard className="friends-tilt"><section className="friends-card"><h2>Your study partner</h2><div className="friend-profile"><Avatar friend name={friendName}/><div><strong>{friendName}</strong><small>In your workspace</small></div></div><p>Your roadmaps are side by side. Keep each other moving with a nudge or cheer.</p><div className="friend-social-actions"><button type="button" className="button-secondary" onClick={()=>onEncourage("nudge")}><Bell size={14}/> Nudge</button><button type="button" className="button-secondary" onClick={()=>onEncourage("cheer")}><Sparkles size={14}/> Cheer</button></div></section></TiltCard><TiltCard className="friends-tilt"><section className="friends-card"><h2>Invite another friend</h2><p>Share a link to invite someone into your workspace.</p><div className="invite-code-row"><strong>{inviteCode??"Invite code unavailable"}</strong><button className="button-secondary" disabled={!shareLink} onClick={()=>void copyLink()}>{copied?"Link copied":"Copy link"}</button></div></section></TiltCard></div><section className="friends-card friends-comparison"><h2>Progress comparison</h2><div className="head-to-head"><div><span>{currentName} · {myProgress}%</span><i><b style={{width:`${myProgress}%`}}/></i></div><div><span>{friendName} · {friendProgress}%</span><i><b style={{width:`${friendProgress}%`}}/></i></div></div></section><section className="friends-card friends-list"><h2>Your friends <span>({memberCount-1})</span></h2><div className="friend-profile"><Avatar friend name={friendName}/><div><strong>{friendName}</strong><small>In your workspace</small></div></div></section></>}
  </div>;
}
function LeaderboardPage({topics,currentName,friendName,memberCount}:{topics:Topic[];currentName:string;friendName:string;memberCount:number}) {
  const rows=[{name:currentName,completed:topics.filter(topic=>topic.owner==="Divya"&&topic.status==="Completed").length,you:true},...(memberCount>1?[{name:friendName,completed:topics.filter(topic=>topic.owner==="Alex"&&topic.status==="Completed").length,you:false}]:[])].sort((a,b)=>b.completed-a.completed);
  return <div className="leaderboard-page"><div className="page-heading"><div><div className="eyebrow">LEADERBOARD · TOPICS COMPLETED</div><h1><Trophy size={25}/> Topic champions</h1><p className="subheading">Ranked by completed roadmap topics.</p></div></div><div style={{marginBottom:20}}><Leaderboard3DPodium rows={rows}/></div><section className="leaderboard-card">{rows.map((row,index)=><div className={`leaderboard-row ${index===0?"leader":""}`} key={row.name}><span className="leader-rank">{index+1}</span><Avatar friend={!row.you} name={row.name}/><div className="leader-person"><strong>{row.name}{row.you&&<small>YOU</small>}</strong><span>Personal roadmap progress</span></div><div className="leader-score"><strong><BookOpen size={16}/>{row.completed}</strong><span>topics completed</span></div></div>)}{rows.length<2&&<div className="leaderboard-empty">Invite a friend to compare roadmap progress.</div>}</section></div>;
}

function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function generateDefaultStats(studyDates: string[] = [], previousBest = 0): StudyStats {
  const now = new Date();
  const year = now.getFullYear();
  const monthIdx = now.getMonth();
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const studied = new Set(studyDates);
  let activeCount = 0;
  let bestStreak = Math.max(0, previousBest);
  let run = 0;
  let prior: Date | null = null;
  for (const key of [...studied].sort()) {
    const date = new Date(`${key}T12:00:00`);
    run = prior && Math.round((date.getTime() - prior.getTime()) / 86400000) === 1 ? run + 1 : 1;
    bestStreak = Math.max(bestStreak, run);
    prior = date;
  }

  const today = localDateKey(now);
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const startsOn = studied.has(today) ? now : studied.has(localDateKey(yesterdayDate)) ? yesterdayDate : null;
  let currentStreak = 0;
  if (startsOn) {
    const cursor = new Date(startsOn);
    while (studied.has(localDateKey(cursor))) {
      currentStreak++;
      cursor.setDate(cursor.getDate() - 1);
    }
  }

  const month: MonthDay[] = Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1;
    const date = new Date(year, monthIdx, d);
    const key = localDateKey(date);
    const isToday = key === today;
    const isFuture = date > now;
    const isActive = studied.has(key);
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
    const key = localDateKey(date);
    const isToday = key === today;
    const isActive = studied.has(key);
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
  currentAvatar = null,
  memberSince = null,
  friendName = "Study partner",
  api,
  planId,
  inviteCode,
  initialStats,
  currentEmail = "",
  workspaceName = "SDE-2 Study Room",
  memberCount = 1,
  isAuthenticated = true,
  authResolved = true,
  onProfileUpdated
}: {
  initialTopics?: Topic[];
  currentName?: string;
  currentAvatar?: string | null;
  memberSince?: string | null;
  friendName?: string;
  api: string;
  planId?: string;
  inviteCode?: string;
  initialStats?: StudyStats;
  currentEmail?: string;
  workspaceName?: string;
  memberCount?: number;
  isAuthenticated?: boolean;
  authResolved?: boolean;
  onProfileUpdated?: (user: { id: string | number; name: string; email: string; avatar: string | null; createdAt?: string | null }) => void;
}) {
  const [page, setPage] = useState("Dashboard");
  const [topics, setTopics] = useState<Topic[]>(providedTopics.length ? providedTopics : isAuthenticated ? [] : initialTopics);
  const [studyStats, setStudyStats] = useState<StudyStats>(initialStats ?? defaultStats);
  const [selected, setSelected] = useState<Topic | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("DSA");
  const [newDay, setNewDay] = useState(1);
  const [newOwner, setNewOwner] = useState<"Divya" | "Alex">("Divya");
  const [inviteCopied, setInviteCopied] = useState(false);
  const [currentInviteCode, setCurrentInviteCode] = useState(inviteCode);
  const [notice, setNotice] = useState<{ text: string; kind: "success" | "error" } | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboardingGoal, setOnboardingGoal] = useState<LearningGoal>("System Design");
  const [onboardingSaving, setOnboardingSaving] = useState(false);
  const [onboardingError, setOnboardingError] = useState("");
  const studyDatesKey = currentEmail ? `studypulse_study_dates:${currentEmail.trim().toLowerCase()}` : "studypulse_study_dates:preview";

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setHelpOpen(false);
        setShowAdd(false);
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "")) return;
      if (event.key === "?") {
        event.preventDefault();
        setHelpOpen(true);
      } else if (event.key.toLowerCase() === "n" && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        setPage("Roadmap");
        setShowAdd(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (providedTopics && providedTopics.length > 0) {
      setTopics(providedTopics);
    } else if (isAuthenticated) {
      setTopics([]);
    } else if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("studypulse_topics");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTopics(parsed);
          }
        }
      } catch {}
    }
  }, [providedTopics, isAuthenticated]);

  useEffect(() => {
    if (!authResolved || !isAuthenticated || !planId) return;
    const key = `study-together-onboarding:${(currentEmail || currentName).trim().toLowerCase()}`;
    let alreadyHandled = false;
    try { alreadyHandled = window.localStorage.getItem(key) === "done"; } catch {}
    const hasTopics = providedTopics.some(topic => topic.owner === "Divya");
    setOnboardingOpen(!alreadyHandled && !hasTopics);
  }, [authResolved, currentEmail, currentName, isAuthenticated, planId, providedTopics]);

  useEffect(() => {
    if (initialStats) {
      setStudyStats(initialStats);
    } else if (typeof window !== "undefined") {
      try {
        const dates = JSON.parse(localStorage.getItem(studyDatesKey) ?? "[]");
        setStudyStats(generateDefaultStats(Array.isArray(dates) ? dates.filter((date): date is string => typeof date === "string") : []));
      } catch {}
    }
  }, [initialStats, studyDatesKey]);

  useEffect(() => {
    if (inviteCode) {
      setCurrentInviteCode(inviteCode);
    }
  }, [inviteCode]);

  const handleStatus = async (next: Topic) => {
    const idStr = next.id != null ? String(next.id) : "";
    const isMock = !idStr || idStr.startsWith("topic-");
    const previousTopics = topics;
    const previousSelected = selected;

    // 1. Optimistic state update immediately
    setTopics(old => {
      const updated = old.map(t => {
        const matches = idStr ? String(t.id) === idStr : t.title === next.title;
        return matches ? { ...t, ...next, id: t.id ?? next.id } : t;
      });
      try {
        localStorage.setItem("studypulse_topics", JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setSelected(current => {
      if (!current) return null;
      const matches = idStr ? String(current.id) === idStr : current.title === next.title;
      return matches ? { ...current, ...next, id: current.id ?? next.id } : current;
    });

    // Persist the status before logging completion activity.
    if (!isMock && isAuthenticated) {
      try {
        const response = await fetch(`${api}/topics/${idStr}`, {
          method: "PATCH",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            status: next.status === "Completed" ? "COMPLETED" : next.status === "In progress" ? "IN_PROGRESS" : "NOT_STARTED"
          })
        });
        if (!response.ok) throw new Error(`Topic update failed (${response.status})`);
      } catch {
        setTopics(previousTopics);
        setSelected(previousSelected);
        try { localStorage.setItem("studypulse_topics", JSON.stringify(previousTopics)); } catch {}
        setNotice({ text: "Could not save that topic update. Try again.", kind: "error" });
        return false;
      }
    }

    if (next.status === "Completed") await logStudySession(next, 25);
    setNotice({ text: next.status === "Completed" ? "Topic completed! 🎉" : "Topic reopened.", kind: "success" });

    return true;
  };

  const reorderTopics = async (ids: string[]) => {
    const order = new globalThis.Map(ids.map((id, index) => [id, index]));
    const previousTopics = topics;
    const reordered = topics.map(topic => order.has(String(topic.id)) ? { ...topic, order: order.get(String(topic.id)) } : topic);
    setTopics(reordered);
    try { localStorage.setItem("studypulse_topics", JSON.stringify(reordered)); } catch {}
    if (isAuthenticated && planId && ids.every(id => !id.startsWith("topic-"))) {
      try {
        const response = await fetch(`${api}/study-plans/${planId}/topics/order`, {
          method: "PUT",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ topicIds: ids.map(Number) })
        });
        if (!response.ok) throw new Error("Topic order could not be saved");
      } catch {
        setTopics(previousTopics);
        try { localStorage.setItem("studypulse_topics", JSON.stringify(previousTopics)); } catch {}
        return false;
      }
    }
    return true;
  };

  const encourageFriend = async (kind: "nudge" | "cheer") => {
    const message = kind === "nudge"
      ? `Hey ${friendName}, ready for a short study session together?`
      : `Great work on your roadmap, ${friendName}! Keep it up!`;
    try {
      await navigator.clipboard.writeText(message);
      setNotice({ text: `${kind === "nudge" ? "Nudge" : "Cheer"} copied. Paste it to ${friendName}.`, kind: "success" });
    } catch {
      setNotice({ text: "Clipboard access is unavailable in this browser.", kind: "error" });
    }
  };

  const logStudySession = async (topic: Topic, minutes: number) => {
    const today = localDateKey(new Date());
    let studyDates: string[] = [];
    try {
      const storedDates = JSON.parse(localStorage.getItem(studyDatesKey) ?? "[]");
      if (Array.isArray(storedDates)) studyDates = storedDates.filter((date): date is string => typeof date === "string");
    } catch {}
    if (!studyDates.includes(today)) studyDates.push(today);

    // Update the dashboard immediately, then reconcile with the server response.
    try { localStorage.setItem(studyDatesKey, JSON.stringify(studyDates)); } catch {}
    const optimisticStats = generateDefaultStats(studyDates, studyStats.bestStreak);
    const todayTotal = (studyStats.month?.find(day => day.today)?.minutesStudied ?? 0) + minutes;
    optimisticStats.month = optimisticStats.month?.map(day => day.today ? { ...day, minutesStudied: todayTotal } : day);
    setStudyStats(optimisticStats);
    try { localStorage.setItem("studypulse_stats", JSON.stringify(optimisticStats)); } catch {}

    const idStr = topic.id != null ? String(topic.id) : "";
    const isMock = !idStr || idStr.startsWith("topic-");

    if (!isMock && isAuthenticated) {
      try {
        const response = await fetch(api + "/study-sessions", {
          method: "POST",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            topicId: idStr,
            durationMinutes: minutes,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          })
        });
        if (response.ok) {
          const result = await response.json();
          if (result.stats) {
            setStudyStats(result.stats);
            try { localStorage.setItem("studypulse_stats", JSON.stringify(result.stats)); } catch {}
          }
        }
      } catch {
        // Fallback to local offline state update
      }
    }
    return true;
  };

  const deleteTopic = async (topic: Topic) => {
    const idStr = topic.id != null ? String(topic.id) : "";
    if (!idStr || (topic.owner && topic.owner !== "Divya") || !window.confirm("Delete " + topic.title + " from your roadmap? This cannot be undone.")) return;
    const isMock = idStr.startsWith("topic-");
    if (!isMock && isAuthenticated) {
      try {
        await fetch(api + "/topics/" + idStr, {
          method: "DELETE",
          credentials: "include"
        });
      } catch {}
    }
    setTopics(old => {
      const updated = old.filter(t => String(t.id) !== idStr);
      try { localStorage.setItem("studypulse_topics", JSON.stringify(updated)); } catch {}
      return updated;
    });
    setSelected(null);
  };

  const rotateInvite = async () => {
    const response = await fetch(api + "/workspace/invite/rotate", {
      method: "POST",
      credentials: "include"
    });
    const result = await response.json();
    if (response.ok) setCurrentInviteCode(result.inviteCode);
  };

  const saveProfile = async (name: string, avatar: string) => {
    const response = await fetch(`${api}/auth/profile`, {
      method: "PATCH",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, avatar })
    });
    if (!response.ok) return false;
    const result = await response.json();
    if (!result.user) return false;
    onProfileUpdated?.(result.user);
    return true;
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
    if (!newTitle.trim()) return;
    let createdId: string = `topic-${Date.now()}`;
    if (planId && isAuthenticated) {
      try {
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
        if (res.ok) {
          const result = await res.json();
          if (result.topic?.id != null) createdId = String(result.topic.id);
        }
      } catch {}
    }
    const created: Topic = {
      id: createdId,
      title: newTitle.trim(),
      category: newCategory,
      status: "Not started",
      difficulty: "Medium",
      hours: 1.5,
      day: newDay,
      owner: "Divya",
      description: "A new learning milestone in your personal roadmap."
    };
    setTopics(old => {
      const updated = [...old, created];
      try { localStorage.setItem("studypulse_topics", JSON.stringify(updated)); } catch {}
      return updated;
    });
    setNewTitle("");
    setShowAdd(false);
  };

  const finishOnboarding = () => {
    const key = `study-together-onboarding:${(currentEmail || currentName).trim().toLowerCase()}`;
    try { window.localStorage.setItem(key, "done"); } catch {}
    setOnboardingOpen(false);
    setOnboardingError("");
  };

  const createStarterRoadmap = async () => {
    if (!planId) {
      setOnboardingError("Your roadmap is not ready yet. Reload the page and try again.");
      return;
    }
    setOnboardingSaving(true);
    setOnboardingError("");
    const created: Topic[] = [];
    try {
      for (const [index, starter] of roadmapTemplates[onboardingGoal].entries()) {
        const response = await fetch(`${api}/study-plans/${planId}/topics`, {
          method: "POST",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            title: starter.title,
            description: starter.description,
            categoryName: onboardingGoal,
            dayNumber: index + 1,
            difficulty: "MEDIUM",
            estimatedHours: starter.hours
          })
        });
        if (!response.ok) throw new Error("We couldn’t save the starter roadmap.");
        const result = await response.json();
        const saved = result.topic ?? result;
        created.push({
          id: String(saved.id ?? `starter-${Date.now()}-${index}`),
          title: starter.title,
          category: onboardingGoal,
          status: "Not started",
          difficulty: "Medium",
          hours: starter.hours,
          day: index + 1,
          owner: "Divya",
          description: starter.description
        });
      }
      setTopics(previous => {
        const updated = [...previous, ...created];
        try { window.localStorage.setItem("studypulse_topics", JSON.stringify(updated)); } catch {}
        return updated;
      });
      finishOnboarding();
      setNotice({ text: `${onboardingGoal} roadmap added. You’re ready to start!`, kind: "success" });
    } catch (error) {
      if (created.length) {
        setTopics(previous => {
          const updated = [...previous, ...created];
          try { window.localStorage.setItem("studypulse_topics", JSON.stringify(updated)); } catch {}
          return updated;
        });
        finishOnboarding();
        setNotice({ text: `Added ${created.length} starter topics. You can add more from your roadmap.`, kind: "error" });
      } else {
        setOnboardingError(error instanceof Error ? error.message : "We couldn’t save the starter roadmap.");
      }
    } finally {
      setOnboardingSaving(false);
    }
  };

  const exportProgressCard = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 630;
    const context = canvas.getContext("2d");
    if (!context) {
      setNotice({ text: "Your browser couldn’t create the progress card.", kind: "error" });
      return;
    }
    const roundedRect = (x: number, y: number, width: number, height: number, radius: number) => {
      context.beginPath();
      context.moveTo(x + radius, y);
      context.arcTo(x + width, y, x + width, y + height, radius);
      context.arcTo(x + width, y + height, x, y + height, radius);
      context.arcTo(x, y + height, x, y, radius);
      context.arcTo(x, y, x + width, y, radius);
      context.closePath();
    };
    const owned = topics.filter(topic => topic.owner === "Divya");
    const completed = owned.filter(topic => topic.status === "Completed").length;
    const mastery = owned.length ? Math.round(completed / owned.length * 100) : 0;
    const background = context.createLinearGradient(0, 0, 1200, 630);
    background.addColorStop(0, "#17152b");
    background.addColorStop(1, "#272044");
    context.fillStyle = background;
    context.fillRect(0, 0, 1200, 630);
    context.fillStyle = "#9d7bff24";
    context.beginPath();
    context.arc(1040, 70, 280, 0, Math.PI * 2);
    context.fill();
    roundedRect(64, 56, 1072, 518, 30);
    context.fillStyle = "#ffffff0d";
    context.fill();
    context.strokeStyle = "#ffffff25";
    context.lineWidth = 2;
    context.stroke();
    context.fillStyle = "#c2aaff";
    context.font = "700 22px Manrope, sans-serif";
    context.fillText(APP_NAME.toUpperCase(), 112, 130);
    context.fillStyle = "#ffffff";
    context.font = "700 48px Manrope, sans-serif";
    context.fillText(`${currentName}’s learning progress`, 112, 210, 960);
    context.fillStyle = "#c5c3d6";
    context.font = "500 22px 'DM Sans', sans-serif";
    context.fillText("Small steps, steady progress.", 112, 260);
    context.fillStyle = "#ffffff";
    context.font = "800 96px Manrope, sans-serif";
    context.fillText(`${mastery}%`, 112, 410);
    context.fillStyle = "#c5c3d6";
    context.font = "700 18px 'DM Sans', sans-serif";
    context.fillText("ROADMAP MASTERY", 118, 450);
    context.fillStyle = "#ffffff";
    context.font = "800 56px Manrope, sans-serif";
    context.fillText(`${studyStats.currentStreak}`, 710, 405);
    context.fillStyle = "#ffc95e";
    context.font = "700 26px 'DM Sans', sans-serif";
    context.fillText("day streak", 785, 404);
    context.fillStyle = "#c5c3d6";
    context.font = "500 20px 'DM Sans', sans-serif";
    context.fillText(`${completed} of ${owned.length} topics complete`, 710, 450);
    roundedRect(112, 492, 950, 14, 7);
    context.fillStyle = "#ffffff20";
    context.fill();
    roundedRect(112, 492, Math.max(14, 950 * mastery / 100), 14, 7);
    context.fillStyle = "#a78bfa";
    context.fill();
    context.fillStyle = "#a9a5bc";
    context.font = "500 15px 'DM Sans', sans-serif";
    context.fillText("Keep learning with me · study-together", 112, 540);
    canvas.toBlob(blob => {
      if (!blob) {
        setNotice({ text: "Your browser couldn’t export the progress card.", kind: "error" });
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `study-together-progress-${new Date().toISOString().slice(0, 10)}.png`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice({ text: "Your progress card was downloaded as a PNG.", kind: "success" });
    }, "image/png");
  };

  return (
    <MotionConfig reducedMotion="user">
    <div className="app-shell">
      <Sidebar page={page} onNavigate={setPage} currentName={currentName} currentAvatar={currentAvatar} streak={studyStats.currentStreak} />
      <main className="main">
        <header className="topbar">
          <div className="crumb">
            <span className="crumb-workspace">{workspaceName}</span>
            <ChevronRight className="crumb-separator" size={12} />
            <b>{page}</b>
          </div>
          <div className="top-actions">
            <button type="button" className="button-secondary share-progress-button" onClick={exportProgressCard} aria-label="Download a shareable progress card" title="Download a shareable progress card"><Share2 size={15}/><span>Share progress</span></button>
            <button className="icon-button" aria-label="Keyboard shortcuts" title="Keyboard shortcuts (?)" onClick={() => setHelpOpen(true)}><CircleHelp size={16} /></button>
            <button className="icon-button"><Bell size={16} /><i className="notification-dot" /></button>
            <Avatar name={currentName} avatar={currentAvatar} />
            {isAuthenticated ? (
              <button className="button-secondary" onClick={logout}>Sign out</button>
            ) : authResolved ? (
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
            ) : null}
          </div>
        </header>

        {authResolved && !isAuthenticated && (
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
                await navigator.clipboard.writeText(`${window.location.origin}/login?invite=${encodeURIComponent(currentInviteCode)}`);
                setInviteCopied(true);
                setTimeout(() => setInviteCopied(false), 1800);
              }}
            >
              <Share2 size={13} />
              {inviteCopied ? "Invite link copied" : `Invite · ${currentInviteCode}`}
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
            api={api}
            isAuthenticated={isAuthenticated}
            onNavigate={setPage}
          />
        ) : page === "Friends" ? (
          <FriendsPage
            topics={topics}
            currentName={currentName}
            friendName={friendName}
            inviteCode={currentInviteCode}
            memberCount={memberCount}
            onEncourage={encourageFriend}
          />
        ) : page === "Roadmap" ? (
          <Roadmap
            topics={topics}
            onSelect={setSelected}
            onAdd={openAddTopic}
            onStatus={handleStatus}
            onDelete={topic => void deleteTopic(topic)}
            onReorder={reorderTopics}
          />
        ) : page === "Study Room" ? (
          <StudyRoom topics={topics} onLog={logStudySession} todayFocusMinutes={studyStats.month?.find(day => day.today)?.minutesStudied ?? 0} />
        ) : page === "Leaderboard" ? (
          <LeaderboardPage
            topics={topics}
            currentName={currentName}
            friendName={friendName}
            memberCount={memberCount}
          />
        ) : page === "Profile" ? (
          <>
            <Settings3DIdentity
              name={currentName}
              workspaceName={workspaceName}
              streak={studyStats.currentStreak}
              bestStreak={studyStats.bestStreak}
              totalStudyMinutes={studyStats.totalStudyMinutes ?? (studyStats.month ?? []).reduce((sum, day) => sum + (day.minutesStudied ?? 0), 0)}
              completedTopics={topics.filter(topic => topic.owner === "Divya" && topic.status === "Completed").length}
              memberSince={memberSince ?? undefined}
              avatar={currentAvatar}
            />
            <WorkspaceSettings
              name={currentName}
              avatar={currentAvatar}
              email={currentEmail}
              workspaceName={workspaceName}
              memberCount={memberCount}
              inviteCode={currentInviteCode}
              totalStudyMinutes={studyStats.totalStudyMinutes ?? (studyStats.month ?? []).reduce((sum, day) => sum + (day.minutesStudied ?? 0), 0)}
              bestStreak={studyStats.bestStreak}
              badgesEarned={[
                (studyStats.totalStudyMinutes ?? 0) > 0,
                studyStats.bestStreak >= 3,
                studyStats.bestStreak >= 7,
                (studyStats.totalStudyMinutes ?? 0) >= 600,
                (studyStats.totalStudyMinutes ?? 0) >= 1500
              ].filter(Boolean).length}
              onRotate={() => void rotateInvite()}
              onLogout={() => void logout()}
              onSaveProfile={saveProfile}
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
                  key={displayTopicTitle(t.title)}
                  onClick={() => setSelected(t)}
                  style={{ cursor: "pointer", borderBottom: "1px solid #f4f4f6", paddingBottom: 13 }}
                >
                  <div className="activity-icon"><Check size={13} /></div>
                  <div>
                    <b>{t.owner} · {displayTopicTitle(t.title)}</b>
                    <small>{t.status} · {t.category}</small>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {notice && <div className={`study-toast ${notice.kind}`} role="status" aria-live="polite"><Check size={16}/>{notice.text}</div>}
      {notice?.text.startsWith("Topic completed") && <div className="completion-confetti" aria-hidden="true">{Array.from({ length: 16 }, (_, i) => <i key={i} className={`confetti-piece c${i % 8}`}/>)}</div>}

      {onboardingOpen && <div className="onboarding-backdrop"><section className="onboarding-dialog" role="dialog" aria-modal="true" aria-labelledby="onboarding-title"><div className="onboarding-icon"><Target size={20}/></div><span className="eyebrow">A PLAN THAT FITS YOUR GOAL</span><h2 id="onboarding-title">What are you preparing for?</h2><p>Choose a focus and we’ll add a five step starter roadmap to your account.</p><div className="onboarding-goals" role="radiogroup" aria-label="Choose a learning goal">{(Object.keys(roadmapTemplates) as LearningGoal[]).map(goal=><button type="button" role="radio" aria-checked={onboardingGoal===goal} key={goal} className={onboardingGoal===goal?"selected":""} onClick={()=>setOnboardingGoal(goal)}><span>{goal}</span><small>5 starter topics</small></button>)}</div>{onboardingError&&<p className="onboarding-error" role="alert">{onboardingError}</p>}<div className="onboarding-actions"><button type="button" className="button-secondary" disabled={onboardingSaving} onClick={finishOnboarding}>I’ll start from scratch</button><button type="button" className="button-primary" disabled={onboardingSaving} onClick={()=>void createStarterRoadmap()}>{onboardingSaving?"Building your roadmap…":"Create my roadmap"}</button></div></section></div>}

      <AnimatePresence>
        {helpOpen && <motion.div className="shortcut-backdrop" role="presentation" onClick={() => setHelpOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.section className="shortcut-dialog" role="dialog" aria-modal="true" aria-labelledby="shortcut-title" onClick={event => event.stopPropagation()} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 12, opacity: 0 }}><button type="button" className="shortcut-close" aria-label="Close keyboard shortcuts" onClick={() => setHelpOpen(false)}><X size={16}/></button><span className="eyebrow">QUICK KEYS</span><h2 id="shortcut-title">Keyboard shortcuts</h2><div className="shortcut-row"><kbd>N</kbd><span>Add a roadmap topic</span></div><div className="shortcut-row"><kbd>Space</kbd><span>Start or pause the timer in Study Room</span></div><div className="shortcut-row"><kbd>?</kbd><span>Show this help</span></div></motion.section></motion.div>}
      </AnimatePresence>

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
    </MotionConfig>
  );
}
