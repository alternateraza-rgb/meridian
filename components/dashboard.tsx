"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, FileText, Film, Layers3, Search } from "lucide-react";

import { readProjects } from "@/lib/project-store";
import type { Project } from "@/lib/types";

function metric(projects: Project[], label: string, predicate: (project: Project) => boolean) {
  return {
    label,
    value: projects.filter(predicate).length
  };
}

export function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const handle = window.setTimeout(() => {
      readProjects()
        .then((items) => setProjects(items.filter((project) => project.status !== "archived")))
        .catch((caught) =>
          setError(caught instanceof Error ? caught.message : "Could not load projects from Supabase.")
        )
        .finally(() => setIsLoading(false));
    }, 0);

    return () => window.clearTimeout(handle);
  }, []);

  const metrics = useMemo(
    () => [
      metric(projects, "Projects", () => true),
      metric(projects, "Scripts", (project) => Boolean(project.script)),
      metric(projects, "Storyboards", (project) => Boolean(project.storyboardScenes?.length)),
      metric(projects, "Exports ready", (project) => Boolean(project.shotList?.length))
    ],
    [projects]
  );

  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">Studio dashboard</div>
          <h1>Build production packages faster.</h1>
          <p className="muted">
            Create a project, generate a research brief, draft the script, then turn it into a
            storyboard and editor handoff.
          </p>
        </div>
        <Link className="button primary" href="/app/projects/new">
          New project <ArrowRight size={17} />
        </Link>
      </div>

      <div className="grid four">
        <div className="grid two">
          {metrics.map((item) => (
            <div className="card card-inner" key={item.label}>
              <div className="muted">{item.label}</div>
              <strong style={{ fontSize: "2.4rem" }}>{item.value}</strong>
            </div>
          ))}
        </div>
      </div>

      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="page-heading">
          <div>
            <h2 style={{ fontSize: "2rem", margin: 0 }}>Recent projects</h2>
            <p className="muted">
              Logged-in users are stored in Supabase. Visitors without a session use local demo storage.
            </p>
          </div>
        </div>

        {error && <div className="notice">{error}</div>}

        {isLoading ? (
          <div className="card card-inner">
            <h3>Loading projects...</h3>
            <p className="muted">Checking your Supabase workspace.</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="card card-inner">
            <div className="grid two">
              <div>
                <h3>No projects yet</h3>
                <p className="muted">
                  Start with a topic, article, script, or rough idea. Meridian will generate the
                  production plan step by step.
                </p>
                <Link className="button primary" href="/app/projects/new">
                  Create your first project
                </Link>
              </div>
              <div className="stack">
                <span className="tag">
                  <Search size={14} /> Research brief
                </span>
                <span className="tag">
                  <FileText size={14} /> AI script
                </span>
                <span className="tag">
                  <Film size={14} /> Storyboard scenes
                </span>
                <span className="tag">
                  <Layers3 size={14} /> Export package
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="project-list">
            {projects.map((project) => (
              <Link className="card project-card" href={`/app/projects/${project.id}`} key={project.id}>
                <div>
                  <strong>{project.title}</strong>
                  <p className="muted" style={{ margin: "6px 0 0" }}>
                    {project.videoType} for {project.targetPlatform} · {project.tone}
                  </p>
                </div>
                <span className="status-pill">{project.status}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
