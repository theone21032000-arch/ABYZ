"use client";

import { useEffect, useState } from "react";
import { AuthControls } from "./components/auth-controls";

const tools = ["Overview", "ThinkPad", "Visual Thinking", "Blueprint", "Prompt Studio", "Build Room", "Validation"];
const blocks = ["Idea", "Objective", "User", "Page", "Feature", "Business rule", "Data", "Interaction", "Design", "Constraint", "Question", "Decision", "Test"];

export default function Home() {
  const [active, setActive] = useState("ThinkPad");
  const [content, setContent] = useState("Help students stay on top of their academic journey.");
  const [saved, setSaved] = useState("Saved just now");

  useEffect(() => {
    const draft = localStorage.getItem("abyz-thinkpad-v2");
    if (draft) setContent(draft);
  }, []);

  function updateDraft(value: string) {
    setContent(value); setSaved("Saving…");
    localStorage.setItem("abyz-thinkpad-v2", value);
    window.setTimeout(() => setSaved("Saved just now"), 400);
  }

  return <div className="app-shell">
    <aside className="sidebar"><a className="brand" href="#"><span>AB</span><b>YZ</b></a><button className="switcher"><i /><span><small>PROJET ACTIF</small><strong>StudentFlow</strong></span><em>⌄</em></button><nav><p>WORKSPACE</p>{tools.map((tool) => <button key={tool} className={active === tool ? "active" : ""} onClick={() => setActive(tool)}><span>{tool}</span></button>)}</nav><div className="side-bottom"><button>＋ <span>New project</span></button><div className="profile"><b>MR</b><span><strong>Marc Rousseau</strong><small>Personal workspace</small></span></div></div></aside>
    <main><header className="topbar"><div className="crumbs">Projects <b>/</b> <strong>StudentFlow / {active}</strong></div><div><span id="save-state">● {saved}</span><button className="share">Share</button><AuthControls /></div></header>
      {active === "ThinkPad" ? <section className="view active"><header className="heading"><div><p>THINKPAD</p><h1>Shape the idea before the build.</h1><span>Capture what matters. ABYZ turns it into a clear product map.</span></div><button className="primary" onClick={() => updateDraft(`${content}\n\nNew idea: `)}>＋ Add block</button></header><div className="thinkpad"><aside className="blocks"><div className="label">THINKING BLOCKS</div>{blocks.map((block) => <button className="block-button" key={block} onClick={() => updateDraft(`${content}\n\n${block}: `)}><i>✦</i>{block}</button>)}</aside><article className="editor-wrap"><header><span>● LIVE DOCUMENT</span><b>Student experience</b></header><textarea className="thinkpad-editor" value={content} onChange={(event) => updateDraft(event.target.value)} aria-label="ThinkPad document" /></article><aside className="assistant"><header><b>✦ ABYZ ASSISTANT</b></header><p>I found <strong>4 things</strong> worth making clear before you move on.</p><label>MISSING DETAIL</label><button><i className="amber">?</i><span><strong>Define the support signal</strong><small>What triggers an advisor alert?</small></span>›</button><button><i className="blue">⌘</i><span><strong>Name the user roles</strong><small>Students, advisors, educators?</small></span>›</button><button className="ask">✦ Ask ABYZ anything</button></aside></div></section> : <section className="view active empty"><p>{active.toUpperCase()}</p><h1>{active === "Prompt Studio" ? "A prompt grounded in decisions." : `${active} is ready for its server-backed data model.`}</h1><span>This Next.js foundation keeps project context ready for the next implementation phase.</span><button className="secondary" onClick={() => setActive("ThinkPad")}>Return to ThinkPad</button></section>}
    </main>
  </div>;
}
