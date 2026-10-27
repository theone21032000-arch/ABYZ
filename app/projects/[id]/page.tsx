"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";
import { AuthControls } from "../../components/auth-controls";

type Project = {
  id: string;
  name: string;
  description: string | null;
  type: string;
  stage: string;
  createdAt: string;
  updatedAt: string;
  thoughts?: Array<{
    id: string;
    type: string;
    content: string;
    position: number;
  }>;
};

type ViewMode = "thinkpad" | "visual" | "blueprint" | "prompt";

const STAGE_LABELS: Record<string, string> = {
  IDEA: "Idea",
  IN_DESIGN: "In Design",
  SPECIFICATIONS_READY: "Specs Ready",
  EXISTING_CODE: "Existing Code",
};

const STAGE_COLORS: Record<string, string> = {
  IDEA: "violet",
  IN_DESIGN: "blue",
  SPECIFICATIONS_READY: "green",
  EXISTING_CODE: "amber",
};

const BLOCK_TYPES = [
  { type: "Idea",       icon: "✦", color: "violet" },
  { type: "Objective",  icon: "◎", color: "blue"   },
  { type: "User",       icon: "👤", color: "green"  },
  { type: "Feature",    icon: "▦", color: "blue"   },
  { type: "Question",   icon: "?", color: "amber"  },
  { type: "Decision",   icon: "✓", color: "violet" },
  { type: "Constraint", icon: "⚠", color: "amber"  },
];

export default function ProjectWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewMode>("thinkpad");

  // Mobile sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Reasoning workspace
  const [workspaceNotes, setWorkspaceNotes] = useState("");
  const [savedStatus, setSavedStatus] = useState("● Ready");

  useEffect(() => {
    if (!isSignedIn || !id) return;

    let ignore = false;
    async function loadProject() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/projects/${id}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error("Project not found");
          throw new Error("Failed to load project details");
        }
        const data = await res.json();
        if (!ignore) {
          setProject(data);
          const localKey = `abyz-project-workspace-${id}`;
          const savedNotes = localStorage.getItem(localKey);
          if (savedNotes) {
            setWorkspaceNotes(savedNotes);
          } else if (data.description) {
            setWorkspaceNotes(data.description);
          }
        }
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : "Error loading project");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadProject();
    return () => { ignore = true; };
  }, [id, isSignedIn]);

  const handleNotesChange = (val: string) => {
    setWorkspaceNotes(val);
    setSavedStatus("● Saving…");
    const localKey = `abyz-project-workspace-${id}`;
    localStorage.setItem(localKey, val);
    setTimeout(() => setSavedStatus("● Saved locally"), 400);
  };

  const addBlockToNotes = (blockType: string) => {
    const snippet = `\n\n[${blockType.toUpperCase()}]\nDécrivez votre réflexion ici...\n`;
    handleNotesChange(workspaceNotes + snippet);
  };

  const switchView = (view: ViewMode) => {
    setActiveView(view);
    setSidebarOpen(false);
  };

  // --- Loading ---
  if (!isLoaded || loading) {
    return (
      <div className="landing-shell">
        <div className="landing-center">
          <div className="brand-large"><span>AB</span><b>YZ</b></div>
          <div className="loading-pulse" />
          <p style={{ color: "var(--muted)", marginTop: 16, textAlign: "center" }}>Loading workspace…</p>
        </div>
      </div>
    );
  }

  // --- Error / Not found ---
  if (error || !project) {
    return (
      <div className="landing-shell">
        <div className="empty-state">
          <div className="empty-icon">⚠</div>
          <h2>{error || "Project not found"}</h2>
          <p>We could not find or load this workspace. It might have been deleted or belong to another account.</p>
          <Link href="/" className="primary" style={{ display: "inline-block", padding: "10px 18px", textDecoration: "none", marginTop: 8 }}>
            ← Back to projects
          </Link>
        </div>
      </div>
    );
  }

  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "U";

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay visible"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
        <Link className="brand" href="/" onClick={() => setSidebarOpen(false)}>
          <span>AB</span><b>YZ</b>
        </Link>

        {/* Active project indicator */}
        <Link href="/" className="switcher" onClick={() => setSidebarOpen(false)}>
          <i></i>
          <span>
            <small>PROJET ACTIF</small>
            <strong>{project.name}</strong>
          </span>
          <em>⌄</em>
        </Link>

        <nav>
          <p>WORKSPACE</p>
          <button
            className={activeView === "thinkpad" ? "active" : ""}
            onClick={() => switchView("thinkpad")}
          >
            ✦ <span>ThinkPad & Reasoning</span>
            {activeView === "thinkpad" && <i className="active-dot" />}
          </button>
          <button
            className={activeView === "visual" ? "active" : ""}
            onClick={() => switchView("visual")}
          >
            ◎ <span>Visual Architecture</span>
            {activeView === "visual" && <i className="active-dot" />}
          </button>
          <button
            className={activeView === "blueprint" ? "active" : ""}
            onClick={() => switchView("blueprint")}
          >
            ▤ <span>Blueprint (Specs)</span>
            {activeView === "blueprint" && <i className="active-dot" />}
          </button>
          <button
            className={activeView === "prompt" ? "active" : ""}
            onClick={() => switchView("prompt")}
          >
            ›_ <span>Prompt Studio</span>
            {activeView === "prompt" && <i className="active-dot" />}
          </button>
        </nav>

        <div className="side-bottom">
          <Link href="/" style={{ textDecoration: "none", display: "block" }} onClick={() => setSidebarOpen(false)}>
            <button style={{ width: "100%" }}>← <span>All projects</span></button>
          </Link>
          <div className="profile">
            <b>{initials}</b>
            <span>
              <strong>{user?.fullName || user?.primaryEmailAddress?.emailAddress || "User"}</strong>
              <small>Personal workspace</small>
            </span>
          </div>
        </div>
      </aside>

      {/* Main workspace */}
      <main>
        {/* Topbar */}
        <header className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0, flex: 1 }}>
            <button
              className="hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              ☰
            </button>
            <div className="crumbs">
              <Link href="/" style={{ color: "var(--muted)", textDecoration: "none", flexShrink: 0 }}>
                Projects
              </Link>
              <b>/</b>
              <strong>{project.name}</strong>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <span id="save-state" style={{ color: "var(--muted)", fontSize: 11 }}>{savedStatus}</span>
            <AuthControls />
          </div>
        </header>

        {/* Content view */}
        <section className="view active">

          {/* Project header: title + back button — responsive via ws-heading */}
          <header className="ws-heading">
            <div className="ws-project-meta">
              <div className="ws-badge-row">
                <span className={`stage-badge ${STAGE_COLORS[project.stage] || "violet"}`}>
                  {STAGE_LABELS[project.stage] || project.stage}
                </span>
                <span className="project-type">
                  {project.type}
                </span>
              </div>
              <h1 style={{ margin: "4px 0 6px", fontSize: "clamp(20px, 4vw, 28px)", letterSpacing: "-0.04em", lineHeight: 1.2 }}>
                {project.name}
              </h1>
              <p style={{ color: "var(--muted)", margin: 0, fontSize: 13, lineHeight: 1.55, maxWidth: 680 }}>
                {project.description || "Aucune description fournie pour ce projet."}
              </p>
            </div>
            <div style={{ flexShrink: 0 }}>
              <Link
                href="/"
                className="secondary"
                style={{ display: "inline-flex", alignItems: "center", textDecoration: "none", padding: "0 14px", height: 34, borderRadius: 7, gap: 6 }}
              >
                ← <span className="back-label">Retour</span>
              </Link>
            </div>
          </header>

          {/* ── THINKPAD VIEW ─────────────────────────────── */}
          {activeView === "thinkpad" && (
            <div className="thinkpad">
              {/* Block palette */}
              <aside className="blocks">
                <div className="label">THINKING BLOCKS <b>✦</b></div>
                <div id="block-list">
                  {BLOCK_TYPES.map((b) => (
                    <button
                      key={b.type}
                      className="block-button"
                      onClick={() => addBlockToNotes(b.type)}
                    >
                      <i className={b.color}>{b.icon}</i>
                      <span>{b.type}</span>
                    </button>
                  ))}
                </div>
                <footer>
                  <b>✦ Zone de raisonnement</b>{" "}
                  Cliquez pour insérer un bloc dans votre espace de réflexion.
                </footer>
              </aside>

              {/* Editor */}
              <article className="editor-wrap">
                <header>
                  <span>● LIVE WORKSPACE</span>
                  <b>{project.name} / Reasoning Pad</b>
                  <em>auto-saved</em>
                </header>
                <div className="ws-editor-inner">
                  <label style={{ fontSize: 11, color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    Zone de travail
                  </label>
                  <textarea
                    className="ws-textarea"
                    value={workspaceNotes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Écrivez votre raisonnement, objectifs, cas d'usage, contraintes…"
                  />
                </div>
              </article>

              {/* Assistant panel */}
              <aside className="assistant">
                <header>
                  <b>✦ ASSISTANT ABYZ</b>
                </header>
                <p>
                  Espace de raisonnement de <strong>{project.name}</strong>.
                </p>
                <label>STRUCTURE</label>
                <div style={{ padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
                  <small style={{ color: "var(--dim)" }}>ID Neon :</small>
                  <div style={{ fontSize: 11, fontFamily: "monospace", color: "var(--blue)", wordBreak: "break-all" }}>
                    {project.id}
                  </div>
                </div>
                <div style={{ padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
                  <small style={{ color: "var(--dim)" }}>Statut :</small>
                  <div style={{ fontSize: 12, color: "var(--text)" }}>
                    {STAGE_LABELS[project.stage] || project.stage}
                  </div>
                </div>
                <label>ACTIONS</label>
                <button onClick={() => addBlockToNotes("Objective")}>
                  <i className="blue">◎</i>
                  <span>
                    <strong>Définir l&apos;objectif</strong>
                    <small>Quel problème résout ce projet ?</small>
                  </span>
                </button>
                <button onClick={() => addBlockToNotes("User")}>
                  <i className="green">👤</i>
                  <span>
                    <strong>Identifier les cibles</strong>
                    <small>Qui sont les utilisateurs ?</small>
                  </span>
                </button>
                <button onClick={() => addBlockToNotes("Constraint")}>
                  <i className="amber">⚠</i>
                  <span>
                    <strong>Poser les contraintes</strong>
                    <small>Délai, stack, sécurité…</small>
                  </span>
                </button>
              </aside>
            </div>
          )}

          {/* ── VISUAL ARCHITECTURE VIEW ──────────────────── */}
          {activeView === "visual" && (
            <div>
              <div className="toolbar">
                <span>Visual Thinking &amp; Concept Map</span>
                <span>Projet : {project.name}</span>
              </div>
              <div className="map">
                <i className="line one"></i>
                <i className="line two"></i>
                <i className="line three"></i>
                <button className="node goal"><small>OBJECTIF</small>{project.name}</button>
                <button className="node user"><small>USER</small>Utilisateur Cible</button>
                <button className="node page"><small>PAGE</small>Interface Principale</button>
                <button className="node feature"><small>FEATURE</small>Moteur de Raisonnement</button>
                <button className="node open"><small>QUESTION</small>Validation MVP ?</button>
              </div>
            </div>
          )}

          {/* ── BLUEPRINT VIEW ────────────────────────────── */}
          {activeView === "blueprint" && (
            <div className="blueprint">
              <aside>
                <button className="active">Spécifications <b>01</b></button>
                <button>Exigences <b>03</b></button>
                <button>Modèle de données <b>02</b></button>
                <button className="warn">Questions ouvertes <b>01</b></button>
              </aside>
              <article>
                <header>
                  <small>SPEC-{project.id.slice(0, 6).toUpperCase()}</small>
                  <span>DOCUMENT ACTIF</span>
                </header>
                <h2>{project.name} — Cahier des charges</h2>
                <p>{project.description || "Spécification en cours de rédaction."}</p>
                <div className="requirements">
                  <div>
                    <small>TYPE</small>
                    <b>{project.type}</b>
                  </div>
                  <div>
                    <small>ÉTAPE</small>
                    <b className="yellow">{project.stage}</b>
                  </div>
                  <div>
                    <small>MISE À JOUR</small>
                    <b>{new Date(project.updatedAt).toLocaleDateString()}</b>
                  </div>
                  <div>
                    <small>SOURCE</small>
                    <b className="linked">✦ Neon (PostgreSQL)</b>
                  </div>
                </div>
              </article>
            </div>
          )}

          {/* ── PROMPT STUDIO VIEW ────────────────────────── */}
          {activeView === "prompt" && (
            <div className="prompt-layout">
              <article className="prompt">
                <header>
                  <button className="active">Prompt IA Généré</button>
                </header>
                <pre>
{`# Brief Projet : ${project.name}
Type : ${project.type}
Étape : ${project.stage}

## Description
${project.description || "Non spécifiée"}

## Notes & Réflexions de travail
${workspaceNotes || "Aucune note pour le moment."}`}
                </pre>
              </article>
              <div className="coverage">
                <p>COUVERTURE DU PROJET</p>
                <h3>Prêt pour l&apos;implémentation</h3>
                <div className="bar"><i style={{ width: "65%" }}></i></div>
                <button style={{ color: "#86efac" }}>✓ Données synchronisées avec Neon</button>
                <button>✦ Espace de raisonnement actif</button>
                <button>▦ Spécifications prêtes à l&apos;export</button>
                <footer>
                  Ce prompt peut être directement transmis à un agent de code.
                </footer>
              </div>
            </div>
          )}

        </section>
      </main>
    </div>
  );
}
