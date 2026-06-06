"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, FileText, Film, Layers3, Search, Trash2 } from "lucide-react";

import { archiveProject, findProject, saveProject } from "@/lib/project-store";
import type { Project, ResearchBrief, ShotListItem, StoryboardScene, VideoScript } from "@/lib/types";

type Tab = "overview" | "research" | "script" | "storyboard" | "shot-list" | "export";

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "research", label: "Research" },
  { id: "script", label: "Script" },
  { id: "storyboard", label: "Storyboard" },
  { id: "shot-list", label: "Shot list" },
  { id: "export", label: "Export" }
];

function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(payload.error || "Generation failed.");
  }

  return response.json() as Promise<T>;
}

export function ProjectWorkspace({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState<string>("");
  const [error, setError] = useState("");

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setProject(findProject(projectId) || null);
      setHasLoaded(true);
    }, 0);

    return () => window.clearTimeout(handle);
  }, [projectId]);

  const completion = useMemo(() => {
    const items = [
      Boolean(project?.researchBrief),
      Boolean(project?.script),
      Boolean(project?.storyboardScenes?.length),
      Boolean(project?.shotList?.length)
    ];

    return Math.round((items.filter(Boolean).length / items.length) * 100);
  }, [project]);

  function updateProject(nextProject: Project) {
    const withTimestamp = { ...nextProject, updatedAt: new Date().toISOString() };
    saveProject(withTimestamp);
    setProject(withTimestamp);
  }

  async function generateResearch() {
    if (!project) {
      return;
    }

    setLoading("research");
    setError("");

    try {
      const { researchBrief } = await postJson<{ researchBrief: ResearchBrief }>("/api/ai/research", {
        project
      });
      updateProject({ ...project, researchBrief, status: "ready" });
      setTab("research");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Research generation failed.");
    } finally {
      setLoading("");
    }
  }

  async function generateScript() {
    if (!project) {
      return;
    }

    setLoading("script");
    setError("");

    try {
      const { script } = await postJson<{ script: VideoScript }>("/api/ai/script", {
        project,
        researchBrief: project.researchBrief
      });
      updateProject({ ...project, script, status: "ready" });
      setTab("script");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Script generation failed.");
    } finally {
      setLoading("");
    }
  }

  async function generateStoryboard() {
    if (!project) {
      return;
    }

    setLoading("storyboard");
    setError("");

    try {
      const { storyboardScenes } = await postJson<{ storyboardScenes: StoryboardScene[] }>(
        "/api/ai/storyboard",
        {
          project,
          script: project.script
        }
      );
      updateProject({ ...project, storyboardScenes, status: "ready" });
      setTab("storyboard");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Storyboard generation failed.");
    } finally {
      setLoading("");
    }
  }

  async function generateShotList() {
    if (!project?.storyboardScenes?.length) {
      setError("Generate a storyboard before creating the shot list.");
      return;
    }

    setLoading("shot-list");
    setError("");

    try {
      const { shotList } = await postJson<{ shotList: ShotListItem[] }>("/api/ai/shot-list", {
        storyboardScenes: project.storyboardScenes
      });
      updateProject({ ...project, shotList, status: "ready" });
      setTab("shot-list");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Shot list generation failed.");
    } finally {
      setLoading("");
    }
  }

  async function exportProject(type: "markdown" | "json" | "csv") {
    if (!project) {
      return;
    }

    setLoading(type);
    setError("");

    try {
      const { filename, content } = await postJson<{ filename: string; content: string }>("/api/exports", {
        project,
        type
      });
      downloadFile(filename, content);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Export failed.");
    } finally {
      setLoading("");
    }
  }

  function archiveCurrentProject() {
    if (!project) {
      return;
    }

    archiveProject(project.id);
    router.push("/app");
  }

  if (!hasLoaded) {
    return (
      <div className="card card-inner">
        <h1>Loading project...</h1>
        <p className="muted">Opening the local demo workspace.</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="card card-inner">
        <h1>Project not found</h1>
        <p className="muted">This demo project may live in another browser or may have been archived.</p>
        <Link className="button primary" href="/app/projects/new">
          Create a project
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">{project.targetPlatform} production workspace</div>
          <h1>{project.title}</h1>
          <p className="muted">
            {project.videoType} · {project.tone} · {project.desiredLengthSeconds}s target
          </p>
        </div>
        <button className="button danger" onClick={archiveCurrentProject} type="button">
          <Trash2 size={16} /> Archive
        </button>
      </div>

      {error && <div className="notice">{error}</div>}

      <div className="workspace-grid" style={{ marginTop: 18 }}>
        <section>
          <div className="tabs">
            {tabs.map((item) => (
              <button
                className={`tab ${tab === item.id ? "active" : ""}`}
                key={item.id}
                onClick={() => setTab(item.id)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="card card-inner">
            {tab === "overview" && (
              <div className="stack">
                <h2>Production overview</h2>
                <p className="prose-box">{project.description || project.sourceText || "No brief provided."}</p>
                <div className="grid two">
                  <div className="scene-card">
                    <strong>Audience</strong>
                    <p className="muted">{project.targetAudience}</p>
                  </div>
                  <div className="scene-card">
                    <strong>Language</strong>
                    <p className="muted">{project.language}</p>
                  </div>
                </div>
              </div>
            )}

            {tab === "research" && (
              <div className="stack">
                <h2>Research brief</h2>
                {project.researchBrief ? (
                  <>
                    <p className="prose-box">{project.researchBrief.summary}</p>
                    <h3>Key points</h3>
                    <ul className="small-list">
                      {project.researchBrief.keyPoints.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                    <h3>Claims to verify</h3>
                    <ul className="small-list">
                      {project.researchBrief.claimsToVerify.map((claim) => (
                        <li key={claim}>{claim}</li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="muted">Generate a research brief to start shaping the production angle.</p>
                )}
              </div>
            )}

            {tab === "script" && (
              <div className="stack">
                <h2>Script</h2>
                {project.script ? (
                  <p className="prose-box">{project.script.fullScript}</p>
                ) : (
                  <p className="muted">Generate a script after the research brief, or start directly from the project input.</p>
                )}
              </div>
            )}

            {tab === "storyboard" && (
              <div className="stack">
                <h2>Storyboard</h2>
                {project.storyboardScenes?.length ? (
                  project.storyboardScenes.map((scene) => (
                    <article className="scene-card" key={scene.id}>
                      <span className="tag">Scene {scene.sceneNumber}</span>
                      <h3>{scene.title}</h3>
                      <p className="prose-box">{scene.narration}</p>
                      <p className="muted">{scene.visualDescription}</p>
                      <ul className="small-list">
                        {scene.brollSuggestions.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </article>
                  ))
                ) : (
                  <p className="muted">Generate scene cards from the script.</p>
                )}
              </div>
            )}

            {tab === "shot-list" && (
              <div className="stack">
                <h2>Shot list</h2>
                {project.shotList?.length ? (
                  project.shotList.map((item) => (
                    <article className="scene-card" key={`${item.sceneNumber}-${item.shot}`}>
                      <span className="tag">Scene {item.sceneNumber}</span>
                      <h3>{item.shot}</h3>
                      <p className="muted">
                        {item.assetType} · {item.notes}
                      </p>
                    </article>
                  ))
                ) : (
                  <p className="muted">Generate the shot list after storyboard scenes are available.</p>
                )}
              </div>
            )}

            {tab === "export" && (
              <div className="stack">
                <h2>Export package</h2>
                <p className="muted">
                  Download a handoff package for producers and editors. PDF and NLE timeline exports
                  are planned for the next product iteration.
                </p>
                <div className="actions">
                  <button className="button primary" onClick={() => exportProject("markdown")} type="button">
                    <Download size={16} /> Markdown brief
                  </button>
                  <button className="button" onClick={() => exportProject("json")} type="button">
                    JSON package
                  </button>
                  <button className="button" onClick={() => exportProject("csv")} type="button">
                    CSV shot list
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <aside className="stack">
          <div className="card card-inner">
            <span className="tag">{completion}% complete</span>
            <h3>Next production steps</h3>
            <div className="stack">
              <button className="button full" disabled={Boolean(loading)} onClick={generateResearch} type="button">
                <Search size={16} /> {loading === "research" ? "Generating..." : "Generate research"}
              </button>
              <button className="button full" disabled={Boolean(loading)} onClick={generateScript} type="button">
                <FileText size={16} /> {loading === "script" ? "Generating..." : "Generate script"}
              </button>
              <button className="button full" disabled={Boolean(loading)} onClick={generateStoryboard} type="button">
                <Film size={16} /> {loading === "storyboard" ? "Generating..." : "Generate storyboard"}
              </button>
              <button className="button full" disabled={Boolean(loading)} onClick={generateShotList} type="button">
                <Layers3 size={16} /> {loading === "shot-list" ? "Generating..." : "Generate shot list"}
              </button>
            </div>
          </div>

          <div className="card card-inner">
            <h3>Source material</h3>
            <p className="muted">{project.sourceUrl || "No source URL"}</p>
            <p className="prose-box">{project.sourceText || "No source text was pasted."}</p>
          </div>
        </aside>
      </div>
    </>
  );
}
