export type InputType = "topic" | "article_url" | "pasted_text" | "script";

export type ProjectStatus = "draft" | "generating" | "ready" | "archived";

export type ProjectSettings = {
  videoType: string;
  targetPlatform: string;
  targetAudience: string;
  tone: string;
  language: string;
  desiredLengthSeconds: number;
};

export type Source = {
  title: string;
  url?: string;
  note: string;
};

export type ResearchBrief = {
  summary: string;
  keyPoints: string[];
  suggestedAngles: string[];
  claimsToVerify: string[];
  sources: Source[];
};

export type ScriptSection = {
  title: string;
  narration: string;
};

export type VideoScript = {
  title: string;
  hook: string;
  intro: string;
  body: ScriptSection[];
  outro: string;
  cta: string;
  fullScript: string;
  estimatedDurationSeconds: number;
  version: number;
};

export type StoryboardScene = {
  id: string;
  sceneNumber: number;
  title: string;
  narration: string;
  visualDescription: string;
  onScreenText: string;
  brollSuggestions: string[];
  assetSuggestions: string[];
  estimatedDurationSeconds: number;
};

export type ShotListItem = {
  sceneNumber: number;
  shot: string;
  assetType: "b-roll" | "graphic" | "screen-recording" | "generated-image" | "stock" | "text-card";
  notes: string;
};

export type Project = ProjectSettings & {
  id: string;
  title: string;
  description: string;
  inputType: InputType;
  sourceUrl?: string;
  sourceText: string;
  status: ProjectStatus;
  researchBrief?: ResearchBrief;
  script?: VideoScript;
  storyboardScenes?: StoryboardScene[];
  shotList?: ShotListItem[];
  createdAt: string;
  updatedAt: string;
};

export type GenerationKind = "research" | "script" | "storyboard" | "shot-list";
