import { z } from "zod";

export const sourceSchema = z.object({
  title: z.string(),
  url: z.string().url().optional(),
  note: z.string()
});

export const researchBriefSchema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()),
  suggestedAngles: z.array(z.string()),
  claimsToVerify: z.array(z.string()),
  sources: z.array(sourceSchema)
});

export const scriptSectionSchema = z.object({
  title: z.string(),
  narration: z.string()
});

export const videoScriptSchema = z.object({
  title: z.string(),
  hook: z.string(),
  intro: z.string(),
  body: z.array(scriptSectionSchema),
  outro: z.string(),
  cta: z.string(),
  fullScript: z.string(),
  estimatedDurationSeconds: z.number(),
  version: z.number()
});

export const storyboardSceneSchema = z.object({
  id: z.string(),
  sceneNumber: z.number(),
  title: z.string(),
  narration: z.string(),
  visualDescription: z.string(),
  onScreenText: z.string(),
  brollSuggestions: z.array(z.string()),
  assetSuggestions: z.array(z.string()),
  estimatedDurationSeconds: z.number()
});

export const shotListItemSchema = z.object({
  sceneNumber: z.number(),
  shot: z.string(),
  assetType: z.enum(["b-roll", "graphic", "screen-recording", "generated-image", "stock", "text-card"]),
  notes: z.string()
});
