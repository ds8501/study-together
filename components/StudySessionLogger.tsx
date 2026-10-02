"use client";
import { useState } from "react";
import { Clock3 } from "lucide-react";

export default function StudySessionLogger({onLog}:{onLog:(minutes:number)=>Promise<boolean>}){
  const [minutes,setMinutes]=useState(25);
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState("");
  async function submit(){setSaving(true);setMessage("");const ok=await onLog(minutes);setMessage(ok?"Session saved. Your streak is up to date.":"Could not save this session. Please try again.");setSaving(false);}
  return <div style={{borderTop:"1px solid #eeeef2",paddingTop:17,marginTop:20}}><div style={{fontSize:11,fontWeight:700,marginBottom:9}}>Log a study session</div><div style={{display:"flex",gap:8}}><label style={{display:"flex",alignItems:"center",gap:7,border:"1px solid #e7e7ed",borderRadius:8,padding:"0 10px",fontSize:11,color:"#777"}}><Clock3 size={14}/><input aria-label="Study session minutes" type="number" min={1} max={720} value={minutes} onChange={e=>setMinutes(Math.min(720,Math.max(1,Number(e.target.value)||1)))} style={{width:43,border:0,outline:0,fontSize:12}}/>min</label><button className="button-secondary" disabled={saving} onClick={()=>void submit()}>{saving?"Saving…":"Save session"}</button></div>{message&&<div role="status" style={{fontSize:10,color:message.startsWith("Session")?"#38836a":"#c44",marginTop:8}}>{message}</div>}</div>;
}
