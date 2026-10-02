"use client";
import { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import LoginScreen from "./LoginScreen";

const API = process.env.NODE_ENV === "production" ? "/api" : process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";
type User = { id:string; name:string; email:string; avatar:string|null };
type Workspace = { id:string; name:string; inviteCode?:string; members:Array<{user:User;role:string}> };
type Plan = { id:string; owner:{id:string;name:string;avatar:string|null}; topics:Array<{id:string;title:string;description:string|null;dayNumber:number|null;estimatedHours:number|null;status:string;difficulty:string;category:{name:string}|null}> };
type StudyStats = { currentStreak:number; bestStreak:number; week:Array<{key:string;label:string;active:boolean;today:boolean}> };
type SessionData = { user:User; workspace:Workspace; plans:Plan[]; stats:StudyStats };
export default function StudyTogetherApp(){const [data,setData]=useState<SessionData|null>(null);const [loading,setLoading]=useState(true);const [error,setError]=useState("");
  async function load(user?:User){try{const [workspaceRes,plansRes,statsRes]=await Promise.all([fetch(`${API}/workspace`,{credentials:"include"}),fetch(`${API}/study-plans`,{credentials:"include"}),fetch(`${API}/study-stats`,{credentials:"include"})]);if(!workspaceRes.ok||!plansRes.ok||!statsRes.ok)throw new Error("We could not load your workspace. Please sign in again.");const workspace:Workspace=await workspaceRes.json();const {plans}: {plans:Plan[]}=await plansRes.json();const stats:StudyStats=await statsRes.json();const current=user??(await fetch(`${API}/auth/me`,{credentials:"include"}).then(r=>r.json())).user;setData({user:current,workspace,plans,stats});}catch(e){setError(e instanceof Error?e.message:"Could not load workspace");setData(null);}finally{setLoading(false);}}
  useEffect(()=>{fetch(`${API}/auth/me`,{credentials:"include"}).then(async r=>{if(!r.ok){setLoading(false);return null;}const {user}=await r.json();await load(user);return user;}).catch(()=>setLoading(false));},[]);
  if(loading)return <div style={{minHeight:"100vh",display:"grid",placeItems:"center",color:"#898b96",fontSize:13}}>Opening your study space…</div>;
  if(!data)return <LoginScreen api={API} error={error} onAuthenticated={user=>{setLoading(true);setError("");void load(user);}}/>;
  const currentPlan=data.plans.find(p=>p.owner.id===data.user.id);
  const friendPlan=data.plans.find(p=>p.owner.id!==data.user.id);
  const topics=[
    ...(currentPlan?.topics??[]).map(t=>({id:t.id,title:t.title,category:t.category?.name??"General",status:(t.status==="COMPLETED"?"Completed":t.status==="IN_PROGRESS"?"In progress":"Not started") as "Completed"|"In progress"|"Not started",difficulty:t.difficulty[0]+t.difficulty.slice(1).toLowerCase(),hours:t.estimatedHours??1,day:t.dayNumber??1,owner:"Divya" as const,description:t.description??"A learning milestone on your personal roadmap."})),
    ...(friendPlan?.topics??[]).map(t=>({id:t.id,title:t.title,category:t.category?.name??"General",status:(t.status==="COMPLETED"?"Completed":t.status==="IN_PROGRESS"?"In progress":"Not started") as "Completed"|"In progress"|"Not started",difficulty:t.difficulty[0]+t.difficulty.slice(1).toLowerCase(),hours:t.estimatedHours??1,day:t.dayNumber??1,owner:"Alex" as const,description:t.description??"A learning milestone on your personal roadmap."})),
  ];
  return <Dashboard initialTopics={topics} initialStats={data.stats} currentName={data.user.name} currentEmail={data.user.email} friendName={friendPlan?.owner.name??data.workspace.members.find(m=>m.user.id!==data.user.id)?.user.name??"Study partner"} workspaceName={data.workspace.name} memberCount={data.workspace.members.length} api={API} planId={currentPlan?.id} inviteCode={data.workspace.inviteCode}/>;
}
