"use client";

import type { Project } from "@/lib/types";

const STORAGE_KEY = "meridian.projects";

export function readProjects(): Project[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeProjects(projects: Project[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function findProject(projectId: string) {
  return readProjects().find((project) => project.id === projectId);
}

export function saveProject(project: Project) {
  const projects = readProjects();
  const nextProjects = projects.some((item) => item.id === project.id)
    ? projects.map((item) => (item.id === project.id ? project : item))
    : [project, ...projects];

  writeProjects(nextProjects);
  return project;
}

export function archiveProject(projectId: string) {
  const projects = readProjects().map((project) =>
    project.id === projectId
      ? { ...project, status: "archived" as const, updatedAt: new Date().toISOString() }
      : project
  );

  writeProjects(projects);
}
