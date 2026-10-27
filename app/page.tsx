"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth, useUser, SignIn } from "@clerk/nextjs";
import { AuthControls } from "./components/auth-controls";

type Project = {
  id: string;
  name: string;
  description: string | null;
  type: string;
  stage: string;
  updatedAt: string;
};

const PROJECT_TYPES = [
  { value: "WEB_APP", label: "Web App" },
  { value: "WEBSITE", label: "Website" },
  { value: "MOBILE_APP", label: "Mobile App" },
  { value: "DASHBOARD", label: "Dashboard" },
  { value: "API", label: "API" },
  { value: "INTERNAL_TOOL", label: "Internal Tool" },
  { value: "OTHER", label: "Other" },
];

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

function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Home() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create project modal
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState("WEB_APP");
  const [creating, setCreating] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to load projects");
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSignedIn) fetchProjects();
  }, [isSignedIn, fetchProjects]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDesc.trim() || undefined,
          type: newType,
          stage: "IDEA",
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to create project");
      }
      setNewName("");
      setNewDesc("");
      setNewType("WEB_APP");
      setShowCreate(false);
      await fetchProjects();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error creating project");
    } finally {
      setCreating(false);
    }
  }

  // --- Loading state (Clerk not loaded yet) ---
  if (!isLoaded) {
    return (
      <div className="landing-shell">
        <div className="landing-center">
          <div className="brand-large"><span>AB</span><b>YZ</b></div>
          <div className="loading-pulse" />
        </div>
      </div>
    );
  }

  // --- Not signed in: show Clerk sign-in ---
  if (!isSignedIn) {
    return (
      <div className="landing-shell">
        <div className="landing-center">
          <div className="brand-large"><span>AB</span><b>YZ</b></div>
          <p className="landing-tagline">Think clearly. Build intentionally.</p>
          <div className="clerk-signin-wrap">
            <SignIn routing="hash" />
          </div>
        </div>
      </div>
    );
  }

  // --- Signed in: show real dashboard ---
  const firstName = user?.firstName || "there";
  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "U";

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <a className="brand" href="/"><span>AB</span><b>YZ</b></a>
        <nav>
          <p>WORKSPACE</p>
          <button className="active"><span>Projects</span></button>
        </nav>
        <div className="side-bottom">
          <button onClick={() => setShowCreate(true)}>＋ <span>New project</span></button>
          <div className="profile">
            <b>{initials}</b>
            <span>
              <strong>{user?.fullName || user?.primaryEmailAddress?.emailAddress || "User"}</strong>
              <small>Personal workspace</small>
            </span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main>
        <header className="topbar">
          <div className="crumbs">
            <strong>Projects</strong>
          </div>
          <div>
            <AuthControls />
          </div>
        </header>

        <section className="view active">
          <header className="heading">
            <div>
              <p>PROJECTS</p>
              <h1>Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"}, {firstName}.</h1>
              <span>{projects.length} project{projects.length !== 1 ? "s" : ""} in your workspace</span>
            </div>
            <div>
              <button className="primary" onClick={() => setShowCreate(true)}>＋ New project</button>
            </div>
          </header>

          {/* Loading */}
          {loading && (
            <div className="projects-grid">
              {[1, 2, 3].map((i) => (
                <article key={i} className="project-card skeleton-card">
                  <div className="skeleton-line w60" />
                  <div className="skeleton-line w80" />
                  <div className="skeleton-line w40" />
                </article>
              ))}
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="empty-state">
              <div className="empty-icon">⚠</div>
              <h2>Something went wrong</h2>
              <p>{error}</p>
              <button className="primary" onClick={fetchProjects}>Retry</button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && projects.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">✦</div>
              <h2>No projects yet</h2>
              <p>Start your first project and shape the idea before the build.</p>
              <button className="primary" onClick={() => setShowCreate(true)}>＋ Create your first project</button>
            </div>
          )}

          {/* Project grid */}
          {!loading && !error && projects.length > 0 && (
            <div className="projects-grid">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="project-card"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div>
                    <small className={`stage-badge ${STAGE_COLORS[project.stage] || ""}`}>
                      {STAGE_LABELS[project.stage] || project.stage}
                    </small>
                    <span className="project-type">{PROJECT_TYPES.find((t) => t.value === project.type)?.label || project.type}</span>
                  </div>
                  <h2>{project.name}</h2>
                  {project.description && <p>{project.description}</p>}
                  <footer>
                    <span className="project-updated">Updated {timeAgo(project.updatedAt)}</span>
                  </footer>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Create project dialog */}
      {showCreate && (
        <div className="dialog-backdrop" onClick={() => setShowCreate(false)}>
          <dialog className="dialog-open" open onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleCreate}>
              <button type="button" className="x" onClick={() => setShowCreate(false)}>×</button>
              <p>NEW PROJECT</p>
              <h2>Start with the essential.</h2>
              <label>
                Project name
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  placeholder="e.g. StudyFlow"
                  autoFocus
                  minLength={2}
                  maxLength={100}
                />
              </label>
              <label>
                One-line intention
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="What are you trying to make?"
                  maxLength={500}
                />
              </label>
              <label>
                Project type
                <select value={newType} onChange={(e) => setNewType(e.target.value)}>
                  {PROJECT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </label>
              <menu>
                <button type="button" className="secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="primary" disabled={creating}>
                  {creating ? "Creating…" : "Create workspace"}
                </button>
              </menu>
            </form>
          </dialog>
        </div>
      )}
    </div>
  );
}
