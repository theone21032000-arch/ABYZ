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
  { type: "Idea", icon: "✦", color: "violet" },
  { type: "Objective", icon: "◎", color: "blue" },
  { type: "User", icon: "👤", color: "green" },
  { type: "Feature", icon: "▦", color: "blue" },
  { type: "Question", icon: "?", color: "amber" },
  { type: "Decision", icon: "✓", color: "violet" },
  { type: "Constraint", icon: "⚠", color: "amber" },
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

  // Reasoning workspace state
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
          // Restore any local notes saved for this project
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
    return () => {
      ignore = true;
    };
  }, [id, isSignedIn]);

  const handleNotesChange = (val: string) => {
    setWorkspaceNotes(val);
    setSavedStatus("● Saving…");
    const localKey = `abyz-project-workspace-${id}`;
    localStorage.setItem(localKey, val);
    setTimeout(() => {
      setSavedStatus("● Saved locally");
    }, 400);
  };

  const addBlockToNotes = (blockType: string) => {
    const snippet = `\n\n[${blockType.toUpperCase()}]\nDécrivez votre réflexion ici...\n`;
    const updated = workspaceNotes + snippet;
    handleNotesChange(updated);
  };

  if (!isLoaded || loading) {
    return (
      <div className="landing-shell">
        <div className="landing-center">
          <div className="brand-large"><span>AB</span><b>YZ</b></div>
          <div className="loading-pulse" />
          <p style={{ color: "var(--muted)", marginTop: 16 }}>Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="landing-shell">
        <div className="empty-state">
          <div className="empty-icon">⚠</div>
          <h2>{error || "Project not found"}</h2>
          <p>We could not find or load this workspace. It might have been deleted or belong to another account.</p>
          <Link href="/" className="primary" style={{ display: "inline-block", padding: "10px 18px", textDecoration: "none" }}>
            ← Back to projects
          </Link>
        </div>
      </div>
    );
  }

  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "U";

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <Link className="brand" href="/"><span>AB</span><b>YZ</b></Link>

        {/* Project switcher preview */}
        <Link href="/" className="switcher" style={{ textDecoration: "none", color: "inherit" }}>
          <i></i>
          <span>
            <small>PROJET ACTIF</small>
            <strong id="project-name">{project.name}</strong>
          </span>
          <em>⌄</em>
        </Link>

        <nav>
          <p>WORKSPACE</p>
          <button
            className={activeView === "thinkpad" ? "active" : ""}
            onClick={() => setActiveView("thinkpad")}
          >
            ✦ <span>ThinkPad & Reasoning</span>
            {activeView === "thinkpad" && <i className="active-dot" />}
          </button>
          <button
            className={activeView === "visual" ? "active" : ""}
            onClick={() => setActiveView("visual")}
          >
            ◎ <span>Visual Architecture</span>
            {activeView === "visual" && <i className="active-dot" />}
          </button>
          <button
            className={activeView === "blueprint" ? "active" : ""}
            onClick={() => setActiveView("blueprint")}
          >
            ▤ <span>Blueprint (Specs)</span>
            {activeView === "blueprint" && <i className="active-dot" />}
          </button>
          <button
            className={activeView === "prompt" ? "active" : ""}
            onClick={() => setActiveView("prompt")}
          >
            ›_ <span>Prompt Studio</span>
            {activeView === "prompt" && <i className="active-dot" />}
          </button>
        </nav>

        <div className="side-bottom">
          <Link href="/" style={{ textDecoration: "none" }}>
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
        <header className="topbar">
          <div className="crumbs">
            <Link href="/" style={{ color: "var(--muted)", textDecoration: "none" }}>Projects</Link>
            <b>/</b>
            <strong>{project.name}</strong>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span id="save-state">{savedStatus}</span>
            <AuthControls />
          </div>
        </header>

        {/* Workspace Views */}
        <section className="view active" style={{ display: "block" }}>
          {/* Project Header Info */}
          <header className="heading" style={{ marginBottom: 20 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span className={`stage-badge ${STAGE_COLORS[project.stage] || "violet"}`}>
                  {STAGE_LABELS[project.stage] || project.stage}
                </span>
                <span className="project-type" style={{ fontSize: 12 }}>
                  Type: {project.type}
                </span>
              </div>
              <h1 style={{ margin: "4px 0 8px" }}>{project.name}</h1>
              <p style={{ color: "var(--muted)", margin: 0, fontSize: 14, maxWidth: 700 }}>
                {project.description || "Aucune description fournie pour ce projet."}
              </p>
            </div>
            <div>
              <Link href="/" className="secondary" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none", padding: "0 14px", height: 34, borderRadius: 7 }}>
                ← Retour
              </Link>
            </div>
          </header>

          {/* THINKPAD & REASONING VIEW */}
          {activeView === "thinkpad" && (
            <div className="thinkpad">
              {/* Blocks aside */}
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
                      {b.type}
                    </button>
                  ))}
                </div>
                <footer>
                  <b>✦ Zone de raisonnement</b> Cliquez pour insérer un bloc conceptuel dans votre espace de réflexion.
                </footer>
              </aside>

              {/* Editor Workspace */}
              <article className="editor-wrap">
                <header>
                  <span>● LIVE WORKSPACE</span>
                  <b>{project.name} / Reasoning Pad</b>
                  <em>Markdown support</em>
                </header>
                <div style={{ height: "calc(100% - 43px)", display: "flex", flexDirection: "column", padding: "20px 24px" }}>
                  <label style={{ fontSize: 11, color: "var(--dim)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
                    Zone de travail et d'exploration de l'idée
                  </label>
                  <textarea
                    value={workspaceNotes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Écrivez votre raisonnement, les objectifs, les cas d'usage, et les contraintes techniques du projet ici..."
                    style={{
                      flex: 1,
                      width: "100%",
                      background: "transparent",
                      border: "1px solid var(--line)",
                      borderRadius: 8,
                      padding: 18,
                      color: "var(--text)",
                      fontFamily: "inherit",
                      fontSize: 14,
                      lineHeight: 1.6,
                      resize: "none",
                      outline: "none",
                    }}
                  />
                </div>
              </article>

              {/* Assistant guidance panel */}
              <aside className="assistant">
                <header>
                  <b>✦ ASSISTANT ABYZ</b>
                </header>
                <p>
                  Bienvenue dans l'espace de raisonnement de <strong>{project.name}</strong>.
                </p>
                <label>STRUCTURE DU PROJET</label>
                <div style={{ padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
                  <small style={{ color: "var(--dim)" }}>Identifiant Neon :</small>
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

                <label>ACTIONS CONSEILLÉES</label>
                <button onClick={() => addBlockToNotes("Objective")}>
                  <i className="blue">◎</i>
                  <span>
                    <strong>Définir l'objectif clé</strong>
                    <small>Quel problème précis résout ce projet ?</small>
                  </span>
                </button>
                <button onClick={() => addBlockToNotes("User")}>
                  <i className="green">👤</i>
                  <span>
                    <strong>Identifier les cibles</strong>
                    <small>Qui sont les utilisateurs principaux ?</small>
                  </span>
                </button>
                <button onClick={() => addBlockToNotes("Constraint")}>
                  <i className="amber">⚠</i>
                  <span>
                    <strong>Poser les contraintes</strong>
                    <small>Délai, stack, sécurité, etc.</small>
                  </span>
                </button>
              </aside>
            </div>
          )}

          {/* VISUAL ARCHITECTURE VIEW */}
          {activeView === "visual" && (
            <div>
              <div className="toolbar">
                Visual Thinking & Concept Map <span>Projet : {project.name}</span>
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

          {/* BLUEPRINT (SPECS) VIEW */}
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
                <p>{project.description || "Spécification en cours de rédaction dans l'espace de raisonnement."}</p>
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
                    <small>DERNIÈRE MISE À JOUR</small>
                    <b>{new Date(project.updatedAt).toLocaleDateString()}</b>
                  </div>
                  <div>
                    <small>SOURCE</small>
                    <b className="linked">✦ Base Neon (PostgreSQL)</b>
                  </div>
                </div>
              </article>
            </div>
          )}

          {/* PROMPT STUDIO VIEW */}
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
${workspaceNotes || "Aucune note pour le moment."}
`}
                </pre>
              </article>
              <div className="coverage">
                <p>COUVERTURE DU PROJET</p>
                <h3>Prêt pour l'implémentation</h3>
                <div className="bar"><i style={{ width: "65%" }}></i></div>
                <button style={{ color: "#86efac" }}>✓ Données synchronisées avec Neon</button>
                <button>✦ Espace de raisonnement actif</button>
                <button>▦ Spécifications prêtes à l'export</button>
                <footer>
                  Ce prompt peut être directement transmis à un agent de code pour exécuter le développement.
                </footer>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

