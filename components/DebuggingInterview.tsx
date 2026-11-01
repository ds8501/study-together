"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, ChevronDown, ChevronRight, CircleHelp, Clock3, Code2, FileCode2, Folder, GitBranch, LockKeyhole, Play, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { getApiBaseUrl } from "@/lib/api-base";

const API = getApiBaseUrl();
type Repository = { id: string; name: string; title: string; language: string; framework: string; difficulty: string; estimatedMinutes: number; bugCount: number; summary: string; topics: string[]; runCommand: string; accessLevel: "FREE" | "PREMIUM"; files: Record<string, string>; hints: string[]; explanation: string; checks: string[] };
type CheckOutcome = { name: string; passed: boolean };
type ProjectNode = { name: string; path: string; children?: ProjectNode[] };

function difficultyClass(difficulty: string) {
  return `level-${difficulty.trim().toLowerCase().replace(/\s+/g, "-")}`;
}

function createProjectTree(paths: string[]): ProjectNode[] {
  const root: ProjectNode[] = [];
  for (const path of paths) {
    let level = root;
    const parts = path.split("/");
    parts.forEach((part, index) => {
      const nodePath = parts.slice(0, index + 1).join("/");
      let node = level.find(item => item.name === part);
      if (!node) {
        node = { name: part, path: nodePath, ...(index < parts.length - 1 ? { children: [] } : {}) };
        level.push(node);
      }
      if (node.children) level = node.children;
    });
  }
  return root;
}

function ProjectTreeItem({ node, depth, activeFile, onSelect }: { node: ProjectNode; depth: number; activeFile: string; onSelect: (path: string) => void }) {
  if (node.children) return <div role="group">
    <div className="di-tree-folder" style={{ paddingLeft: 12 + depth * 13 }}><ChevronDown size={12}/><Folder size={14}/><span>{node.name}</span></div>
    {node.children.map(child => <ProjectTreeItem key={child.path} node={child} depth={depth + 1} activeFile={activeFile} onSelect={onSelect}/>)}
  </div>;
  const isTest = node.path.includes("/test/");
  return <button role="treeitem" aria-selected={activeFile === node.path} className={`di-tree-file ${activeFile === node.path ? "active" : ""} ${isTest ? "readonly" : ""}`} style={{ paddingLeft: 25 + depth * 13 }} onClick={() => onSelect(node.path)} title={node.path}>
    <FileCode2 size={14}/><span>{node.name}</span>{isTest && <small>TEST</small>}
  </button>;
}

export default function DebuggingInterview() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [files, setFiles] = useState<Record<string, string>>({});
  const [activeFile, setActiveFile] = useState("");
  const [result, setResult] = useState<null | { checks: CheckOutcome[] }>(null);
  const [loadError, setLoadError] = useState("");
  const [hintCount, setHintCount] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [running, setRunning] = useState(false);
  const [solved, setSolved] = useState<string[]>([]);
  const [solvedLoaded, setSolvedLoaded] = useState(false);
  const isTestFile = activeFile.includes("/test/");
  const challenge = repositories.find(item => item.id === selectedId);
  const projectTree = challenge ? createProjectTree(Object.keys(challenge.files)) : [];
  const passed = result?.checks.filter(check => check.passed).length ?? 0;

  useEffect(() => {
    fetch(`${API}/debugging-repositories`)
      .then(async response => {
        if (!response.ok) throw new Error("The repository service is unavailable. Start the backend and reload this page.");
        return response.json() as Promise<Repository[]>;
      })
      .then(items => {
        setRepositories(items);
        setSelectedId("");
      })
      .catch(error => setLoadError(error instanceof Error ? error.message : "Could not load repositories"));
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem("study-together-debugging-solved") ?? "[]");
      if (Array.isArray(saved)) setSolved(saved.filter((id): id is string => typeof id === "string"));
    } catch { /* Ignore invalid local progress and start fresh. */ }
    setSolvedLoaded(true);
  }, []);

  useEffect(() => {
    if (solvedLoaded) window.localStorage.setItem("study-together-debugging-solved", JSON.stringify(solved));
  }, [solved, solvedLoaded]);

  function isLocked(id: string) {
    const index = repositories.findIndex(repo => repo.id === id);
    return index > 0 && !solved.includes(repositories[index - 1].id);
  }

  function choose(id: string) {
    const next = repositories.find(item => item.id === id);
    if (!next || isLocked(id)) return;
    setSelectedId(id); setFiles({ ...next.files });
    setActiveFile(Object.keys(next.files).find(path => path.includes("/main/")) ?? Object.keys(next.files)[0]);
    setResult(null); setHintCount(0); setShowExplanation(false);
  }
  function reset() { if (challenge) setFiles({ ...challenge.files }); setResult(null); setShowExplanation(false); }
  async function runChecks() {
    if (!challenge) return;
    setRunning(true); setResult(null);
    try {
      const response = await fetch(`${API}/debugging-repositories/${challenge.id}/evaluate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ files }) });
      if (!response.ok) throw new Error("Could not evaluate this repository. Check that the backend is running.");
      const evaluation = await response.json() as { checks: CheckOutcome[]; allPassed: boolean };
      setResult({ checks: evaluation.checks });
      setLoadError("");
      if (evaluation.allPassed) setSolved(previous => previous.includes(challenge.id) ? previous : [...previous, challenge.id]);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Could not evaluate changes");
    } finally { setRunning(false); }
  }

  if (!repositories.length) return <main className="di-page"><header className="di-topbar"><Link href="/dashboard" className="di-back"><ArrowLeft size={16}/> Study Together</Link><div className="di-top-title"><span className="di-mark"><Code2 size={16}/></span><span>Debugging Interview</span></div><div className="di-top-right"><ThemeToggle/></div></header><section className="di-loading"><Code2 size={24}/><h1>{loadError ? "Repository service unavailable" : "Loading Java repositories…"}</h1><p>{loadError || "Connecting to the Study Together backend."}</p><Link href="/dashboard">← Back to dashboard</Link></section></main>;

  if (!challenge) return <main className="di-page di-roadmap-page">
    <header className="di-topbar"><Link href="/dashboard" className="di-back"><ArrowLeft size={16}/> Study Together</Link><div className="di-top-title"><span className="di-mark"><Code2 size={16}/></span><span>Debugging Interview</span></div><div className="di-top-right"><ThemeToggle/><span className="di-avatar">DS</span></div></header>
    <main className="di-roadmap">
      <div className="di-roadmap-intro"><div><div className="di-kicker">PRACTICE PATH</div><h1>Repository debugging</h1><p>Work through realistic Java codebases. Open a challenge to inspect the full repository, trace the bug, and run the checks.</p></div><div className="di-roadmap-progress"><strong>{solved.length}<span> / {repositories.length}</span></strong><small>CHALLENGES SOLVED</small><div><i style={{width:`${repositories.length ? solved.length / repositories.length * 100 : 0}%`}}/></div></div></div>
      <div className="di-roadmap-toolbar"><div><span className="di-roadmap-icon"><GitBranch size={17}/></span><div><strong>Java debugging track</strong><small>{repositories.length} repository challenges · JDK 17+</small></div></div><span className="di-track-badge">FREE</span></div>
      <section className="di-challenge-list" aria-label="Repository debugging challenges">{repositories.map((repo,index)=>{
        const done=solved.includes(repo.id);
        const locked=isLocked(repo.id);
        return <button className={`di-challenge-row ${locked?"locked":""}`} key={repo.id} onClick={()=>{choose(repo.id);window.scrollTo({top:0,behavior:"smooth"});}} disabled={locked} aria-label={`${repo.title}, ${done?"solved":locked?"locked until previous challenge is solved":"available"}`}>
          <span className={`di-roadmap-node ${done?"done":""} ${locked?"locked":""}`}>{done?<Check size={15}/>:locked?<LockKeyhole size={13}/>:index+1}</span><span className="di-challenge-main"><span className="di-challenge-title">{repo.title}</span><span className="di-challenge-summary">{repo.summary}</span><span className="di-challenge-tags">{repo.topics.slice(0,4).map(topic=><i key={topic}>{topic}</i>)}</span></span><span className="di-challenge-meta"><i className={`di-level ${difficultyClass(repo.difficulty)}`}>{repo.difficulty}</i><small><Clock3 size={13}/>{repo.estimatedMinutes} min</small><b>{done?"Solved":locked?"Locked":"Start"}{locked?<LockKeyhole size={12}/>:<ChevronRight size={15}/>}</b></span>
        </button>;
      })}</section>
      <section className="di-coming-tracks" aria-label="Upcoming language tracks"><div className="di-coming-heading"><span className="di-kicker">MORE LANGUAGES</span><small>ON THE ROADMAP</small></div><div className="di-coming-grid"><article className="di-coming-card"><span className="di-coming-language python">Py</span><div><strong>Python debugging</strong><p>Read real projects, trace runtime issues, and practice reliable fixes.</p></div><span className="di-coming-soon">Coming soon</span></article><article className="di-coming-card"><span className="di-coming-language javascript">JS</span><div><strong>JavaScript debugging</strong><p>Explore frontend and Node.js bugs across practical codebases.</p></div><span className="di-coming-soon">Coming soon</span></article></div></section>
      <div className="di-roadmap-note"><ShieldCheck size={16}/><span>Source files are editable, bundled tests are protected, and evaluation uses deterministic checks.</span></div>
    </main>
  </main>;

  const checks = result?.checks ?? challenge.checks.map(name => ({ name, passed: false }));

  return <main className="di-page">
    <header className="di-topbar"><Link href="/dashboard" className="di-back"><ArrowLeft size={16}/> Study Together</Link><div className="di-top-title"><span className="di-mark"><Code2 size={16}/></span><span>Debugging Interview</span></div><div className="di-top-right"><ThemeToggle/><span className="di-avatar">DS</span></div></header>
    <div className="di-layout">
      <aside className="di-sidebar"><div className="di-side-head"><div><div className="di-kicker">{challenge ? "PROJECT" : "PRACTICE LIBRARY"}</div><h2>{challenge ? challenge.name : "Repositories"}</h2></div><span>{challenge ? Object.keys(challenge.files).length : repositories.length}</span></div>
        {!challenge && <><p className="di-side-copy">Explore complete Java projects. Source files are editable; bundled tests are read-only.</p>
        <div className="di-repo-list">{repositories.map((repo, index) => <button key={repo.id} onClick={() => choose(repo.id)} disabled={isLocked(repo.id)} title={isLocked(repo.id) ? "Solve the previous challenge to unlock this repository" : undefined} className={`di-repo ${selectedId === repo.id ? "active" : ""} ${isLocked(repo.id) ? "locked" : ""}`}>
          <span className={`di-repo-icon tone-${index}`}><GitBranch size={16}/></span><span className="di-repo-text"><strong>{repo.name}</strong><small>Java · {repo.framework}</small></span>
          {solved.includes(repo.id) && <span className="di-solved"><Check size={12}/></span>}
        </button>)}</div></>}
        {challenge && <div className="di-project-tree" role="tree" aria-label={`${challenge.name} files`}>
          <div className="di-tree-root"><ChevronDown size={13}/><Folder size={14}/><strong>{challenge.name}</strong></div>
          {projectTree.map(node => <ProjectTreeItem key={node.path} node={node} depth={0} activeFile={activeFile} onSelect={setActiveFile}/>) }
        </div>}
        <div className="di-safety"><ShieldCheck size={17}/><div><strong>Safe by design</strong><p>Checks inspect source edits. Java code is not executed in this MVP.</p></div></div>
        <div className="di-side-footer"><Link href="/dashboard">← Back to dashboard</Link></div>
      </aside>
      <section className="di-main">
        <div className="di-breadcrumb"><button className="di-all-challenges" onClick={()=>setSelectedId("")}>All challenges</button><ChevronRight size={13}/><span>{challenge.name}</span><ChevronRight size={13}/><b>{challenge.title}</b></div>
        <div className="di-heading"><div><div className="di-kicker">REPOSITORY DEBUGGING</div><h1>{challenge.title}</h1><p>{challenge.summary}</p></div><div className="di-heading-tags"><span className={`di-difficulty ${difficultyClass(challenge.difficulty)}`}>{challenge.difficulty}</span><span className="di-time"><Clock3 size={14}/>{challenge.estimatedMinutes} min</span></div></div>
        <div className="di-workspace">
          <div className="di-editor-pane"><div className="di-editor-top"><div className="di-editor-label"><span className="di-dot"/> {challenge.name} <span className="di-branch">main</span></div><button className="di-reset" onClick={reset}><RotateCcw size={13}/> Reset files</button></div>
            <div className="di-file-tab"><FileCode2 size={14}/>{activeFile}<span className="di-ts">{isTestFile ? "READ ONLY" : "JAVA"}</span></div>
            <div className="di-code-wrap"><div className="di-lines">{(files[activeFile] ?? "").split("\n").map((_, i) => <span key={i}>{i + 1}</span>)}</div><textarea aria-label={`View ${activeFile}`} spellCheck={false} readOnly={isTestFile} value={files[activeFile] ?? ""} onChange={e => { setFiles(current => ({ ...current, [activeFile]: e.target.value })); setResult(null); }}/></div>
            <div className="di-runbar"><span><span className="di-status-dot"/> Source checks · tests protected</span><button onClick={runChecks} disabled={running} className="di-run"><Play size={14} fill="currentColor"/>{running ? "Checking…" : "Run checks"}</button></div>
          </div>
          <div className="di-brief-pane"><div className="di-brief-title"><span className="di-brief-icon"><GitBranch size={16}/></span><div><small>JAVA {challenge.framework} · {challenge.bugCount} BUGS</small><strong>{challenge.name}</strong></div></div>
            <div className="di-tabs"><span className="selected">Candidate brief</span><span>Checks <i>{challenge.checks.length}</i></span></div>
            <div className="di-brief-content">{loadError && <div className="di-error">{loadError}</div>}<div className="di-task-label">YOUR TASK</div><p>{challenge.summary}</p><div className="di-topics">{challenge.topics.map(topic => <span key={topic}>{topic}</span>)}</div>
              <div className="di-test-list">{checks.map(check => <div className="di-test-row" key={check.name}><span className={`di-test-icon ${result && check.passed ? "passed" : ""}`}>{result && check.passed ? <Check size={12}/> : <span/>}</span>{check.name}</div>)}</div>
              {result && <div className={`di-result ${passed === challenge.checks.length ? "success" : ""}`}><strong>{passed === challenge.checks.length ? "All source checks passed" : `${passed} of ${challenge.checks.length} checks passed`}</strong><span>{passed === challenge.checks.length ? "Nice work. You addressed the challenge checks." : "Keep investigating and check your changes again."}</span></div>}
              <div className="di-help"><button onClick={() => setHintCount(count => Math.min(count + 1, challenge.hints.length))} disabled={hintCount >= challenge.hints.length}><CircleHelp size={15}/>{hintCount >= challenge.hints.length ? "All hints revealed" : `Show hint ${hintCount + 1}`}</button>
                {hintCount > 0 && <div className="di-hints">{challenge.hints.slice(0, hintCount).map((hint, i) => <p key={i}><Sparkles size={13}/>{hint}</p>)}</div>}
                <button className="di-explain-btn" onClick={() => setShowExplanation(value => !value)}>{showExplanation ? "Hide explanation" : "View explanation"}</button>
                {showExplanation && <div className="di-explanation">{challenge.explanation}<p className="di-command">Local test command: <code>{challenge.runCommand}</code></p></div>}
              </div>
            </div>
          </div>
        </div>
        <footer className="di-footer"><span><ShieldCheck size={14}/> No account or payment required</span><span>{solved.length} / {repositories.length} challenges solved</span></footer>
      </section>
    </div>
  </main>;
}
