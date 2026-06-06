"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import type {
  InputType,
  Project,
  ProjectStatus,
  ResearchBrief,
  ScriptSection,
  ShotListItem,
  Source,
  StoryboardScene,
  VideoScript
} from "@/lib/types";

const STORAGE_KEY = "meridian.projects";

type SupabaseClient = NonNullable<ReturnType<typeof createSupabaseBrowserClient>>;

type ProjectRow = {
  id: string;
  title: string;
  description: string | null;
  input_type: InputType;
  source_url: string | null;
  source_text: string | null;
  video_type: string;
  target_platform: string;
  target_audience: string;
  tone: string;
  language: string;
  desired_length_seconds: number;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
};

type ResearchBriefRow = {
  summary: string;
  key_points: unknown;
  sources: unknown;
  claims_to_verify: unknown;
  suggested_angles: unknown;
};

type ScriptRow = {
  title: string;
  hook: string;
  intro: string;
  body: unknown;
  outro: string;
  cta: string;
  full_script: string;
  estimated_duration_seconds: number;
  version: number;
};

type StoryboardSceneRow = {
  id: string;
  scene_number: number;
  title: string;
  narration: string;
  visual_description: string;
  on_screen_text: string;
  broll_suggestions: unknown;
  asset_suggestions: unknown;
  estimated_duration_seconds: number;
};

type ShotListItemRow = {
  scene_number: number;
  shot: string;
  asset_type: ShotListItem["assetType"];
  notes: string;
};

function readLocalProjects(): Project[] {
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

function writeLocalProjects(projects: Project[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function asSources(value: unknown): Source[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is Source =>
      Boolean(item) &&
      typeof item === "object" &&
      "title" in item &&
      "note" in item &&
      typeof item.title === "string" &&
      typeof item.note === "string"
  );
}

function asScriptSections(value: unknown): ScriptSection[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is ScriptSection =>
      Boolean(item) &&
      typeof item === "object" &&
      "title" in item &&
      "narration" in item &&
      typeof item.title === "string" &&
      typeof item.narration === "string"
  );
}

function baseProjectFromRow(row: ProjectRow): Project {
  return {
    id: row.id,
    title: row.title,
    description: row.description || "",
    inputType: row.input_type,
    sourceUrl: row.source_url || undefined,
    sourceText: row.source_text || "",
    videoType: row.video_type,
    targetPlatform: row.target_platform,
    targetAudience: row.target_audience,
    tone: row.tone,
    language: row.language,
    desiredLengthSeconds: row.desired_length_seconds,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function researchBriefFromRow(row: ResearchBriefRow): ResearchBrief {
  return {
    summary: row.summary,
    keyPoints: asStringArray(row.key_points),
    suggestedAngles: asStringArray(row.suggested_angles),
    claimsToVerify: asStringArray(row.claims_to_verify),
    sources: asSources(row.sources)
  };
}

function scriptFromRow(row: ScriptRow): VideoScript {
  return {
    title: row.title,
    hook: row.hook,
    intro: row.intro,
    body: asScriptSections(row.body),
    outro: row.outro,
    cta: row.cta,
    fullScript: row.full_script,
    estimatedDurationSeconds: row.estimated_duration_seconds,
    version: row.version
  };
}

function storyboardSceneFromRow(row: StoryboardSceneRow): StoryboardScene {
  return {
    id: row.id,
    sceneNumber: row.scene_number,
    title: row.title,
    narration: row.narration,
    visualDescription: row.visual_description,
    onScreenText: row.on_screen_text,
    brollSuggestions: asStringArray(row.broll_suggestions),
    assetSuggestions: asStringArray(row.asset_suggestions),
    estimatedDurationSeconds: row.estimated_duration_seconds
  };
}

function shotListItemFromRow(row: ShotListItemRow): ShotListItem {
  return {
    sceneNumber: row.scene_number,
    shot: row.shot,
    assetType: row.asset_type,
    notes: row.notes
  };
}

async function getSupabaseUser(client: SupabaseClient) {
  const { data } = await client.auth.getUser();
  return data.user;
}

async function getProjectStorage() {
  const client = createSupabaseBrowserClient();
  if (!client) {
    return null;
  }

  const user = await getSupabaseUser(client);
  if (!user) {
    return null;
  }

  return { client, user };
}

async function ensureWorkspace(client: SupabaseClient, userId: string) {
  const { data: membership, error: membershipError } = await client
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    throw membershipError;
  }

  if (membership?.workspace_id) {
    return membership.workspace_id as string;
  }

  const { data: workspace, error: workspaceError } = await client
    .from("workspaces")
    .insert({
      name: "Personal workspace",
      owner_id: userId
    })
    .select("id")
    .single();

  if (workspaceError) {
    throw workspaceError;
  }

  const workspaceId = workspace.id as string;
  const { error: memberInsertError } = await client.from("workspace_members").insert({
    workspace_id: workspaceId,
    user_id: userId,
    role: "owner"
  });

  if (memberInsertError) {
    throw memberInsertError;
  }

  return workspaceId;
}

async function hydrateProject(client: SupabaseClient, row: ProjectRow): Promise<Project> {
  const project = baseProjectFromRow(row);

  const [{ data: research }, { data: script }, { data: scenes }, { data: shotList }] = await Promise.all([
    client
      .from("research_briefs")
      .select("summary,key_points,sources,claims_to_verify,suggested_angles")
      .eq("project_id", row.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    client
      .from("scripts")
      .select("title,hook,intro,body,outro,cta,full_script,estimated_duration_seconds,version")
      .eq("project_id", row.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    client
      .from("storyboard_scenes")
      .select(
        "id,scene_number,title,narration,visual_description,on_screen_text,broll_suggestions,asset_suggestions,estimated_duration_seconds"
      )
      .eq("project_id", row.id)
      .order("scene_number", { ascending: true }),
    client
      .from("shot_list_items")
      .select("scene_number,shot,asset_type,notes")
      .eq("project_id", row.id)
      .order("scene_number", { ascending: true })
  ]);

  return {
    ...project,
    researchBrief: research ? researchBriefFromRow(research as ResearchBriefRow) : undefined,
    script: script ? scriptFromRow(script as ScriptRow) : undefined,
    storyboardScenes: scenes?.map((scene) => storyboardSceneFromRow(scene as StoryboardSceneRow)),
    shotList: shotList?.map((item) => shotListItemFromRow(item as ShotListItemRow))
  };
}

function saveLocalProject(project: Project) {
  const projects = readLocalProjects();
  const nextProjects = projects.some((item) => item.id === project.id)
    ? projects.map((item) => (item.id === project.id ? project : item))
    : [project, ...projects];

  writeLocalProjects(nextProjects);
  return project;
}

async function deleteGeneratedProjectData(client: SupabaseClient, projectId: string) {
  const results = await Promise.all([
    client.from("research_briefs").delete().eq("project_id", projectId),
    client.from("scripts").delete().eq("project_id", projectId),
    client.from("storyboard_scenes").delete().eq("project_id", projectId),
    client.from("shot_list_items").delete().eq("project_id", projectId)
  ]);

  const failedResult = results.find((result) => result.error);
  if (failedResult?.error) {
    throw failedResult.error;
  }
}

async function saveGeneratedProjectData(client: SupabaseClient, project: Project) {
  if (project.researchBrief) {
    const { error } = await client.from("research_briefs").insert({
      project_id: project.id,
      summary: project.researchBrief.summary,
      key_points: project.researchBrief.keyPoints,
      sources: project.researchBrief.sources,
      claims_to_verify: project.researchBrief.claimsToVerify,
      suggested_angles: project.researchBrief.suggestedAngles
    });

    if (error) {
      throw error;
    }
  }

  if (project.script) {
    const { error } = await client.from("scripts").insert({
      project_id: project.id,
      title: project.script.title,
      hook: project.script.hook,
      intro: project.script.intro,
      body: project.script.body,
      outro: project.script.outro,
      cta: project.script.cta,
      full_script: project.script.fullScript,
      estimated_duration_seconds: project.script.estimatedDurationSeconds,
      version: project.script.version
    });

    if (error) {
      throw error;
    }
  }

  if (project.storyboardScenes?.length) {
    const { error } = await client.from("storyboard_scenes").insert(
      project.storyboardScenes.map((scene) => ({
        project_id: project.id,
        scene_number: scene.sceneNumber,
        title: scene.title,
        narration: scene.narration,
        visual_description: scene.visualDescription,
        on_screen_text: scene.onScreenText,
        broll_suggestions: scene.brollSuggestions,
        asset_suggestions: scene.assetSuggestions,
        estimated_duration_seconds: scene.estimatedDurationSeconds
      }))
    );

    if (error) {
      throw error;
    }
  }

  if (project.shotList?.length) {
    const { error } = await client.from("shot_list_items").insert(
      project.shotList.map((item) => ({
        project_id: project.id,
        scene_number: item.sceneNumber,
        shot: item.shot,
        asset_type: item.assetType,
        notes: item.notes
      }))
    );

    if (error) {
      throw error;
    }
  }
}

export async function readProjects(): Promise<Project[]> {
  const storage = await getProjectStorage();
  if (!storage) {
    return readLocalProjects();
  }

  const workspaceId = await ensureWorkspace(storage.client, storage.user.id);
  const { data, error } = await storage.client
    .from("projects")
    .select(
      "id,title,description,input_type,source_url,source_text,video_type,target_platform,target_audience,tone,language,desired_length_seconds,status,created_at,updated_at"
    )
    .eq("workspace_id", workspaceId)
    .neq("status", "archived")
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return Promise.all((data || []).map((row) => hydrateProject(storage.client, row as ProjectRow)));
}

export async function findProject(projectId: string): Promise<Project | undefined> {
  const storage = await getProjectStorage();
  if (!storage) {
    return readLocalProjects().find((project) => project.id === projectId);
  }

  const { data, error } = await storage.client
    .from("projects")
    .select(
      "id,title,description,input_type,source_url,source_text,video_type,target_platform,target_audience,tone,language,desired_length_seconds,status,created_at,updated_at"
    )
    .eq("id", projectId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? hydrateProject(storage.client, data as ProjectRow) : undefined;
}

export async function saveProject(project: Project): Promise<Project> {
  const storage = await getProjectStorage();
  if (!storage) {
    return saveLocalProject(project);
  }

  const workspaceId = await ensureWorkspace(storage.client, storage.user.id);
  const { data, error } = await storage.client
    .from("projects")
    .upsert({
      id: project.id,
      workspace_id: workspaceId,
      created_by: storage.user.id,
      title: project.title,
      description: project.description,
      input_type: project.inputType,
      source_url: project.sourceUrl || null,
      source_text: project.sourceText,
      video_type: project.videoType,
      target_platform: project.targetPlatform,
      target_audience: project.targetAudience,
      tone: project.tone,
      language: project.language,
      desired_length_seconds: project.desiredLengthSeconds,
      status: project.status,
      updated_at: project.updatedAt
    })
    .select(
      "id,title,description,input_type,source_url,source_text,video_type,target_platform,target_audience,tone,language,desired_length_seconds,status,created_at,updated_at"
    )
    .single();

  if (error) {
    throw error;
  }

  await deleteGeneratedProjectData(storage.client, project.id);
  await saveGeneratedProjectData(storage.client, project);

  return hydrateProject(storage.client, data as ProjectRow);
}

export async function archiveProject(projectId: string) {
  const storage = await getProjectStorage();
  if (!storage) {
    const projects = readLocalProjects().map((project) =>
    project.id === projectId
      ? { ...project, status: "archived" as const, updatedAt: new Date().toISOString() }
      : project
    );

    writeLocalProjects(projects);
    return;
  }

  const { error } = await storage.client
    .from("projects")
    .update({
      status: "archived",
      updated_at: new Date().toISOString()
    })
    .eq("id", projectId);

  if (error) {
    throw error;
  }
}
