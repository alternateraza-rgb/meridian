import { NextResponse } from "next/server";

import { buildFallbackStoryboard } from "@/lib/ai/fallback-generators";
import { generateStructuredJson } from "@/lib/ai/providers";
import { storyboardSceneSchema } from "@/lib/ai/schemas";
import type { Project, VideoScript } from "@/lib/types";

export async function POST(request: Request) {
  const { project, script } = (await request.json()) as { project: Project; script?: VideoScript };

  if (!project) {
    return NextResponse.json({ error: "Project is required." }, { status: 400 });
  }

  const generated = await generateStructuredJson({
    system:
      "You are Meridian, an AI storyboard producer. Convert scripts into practical scene cards for editors and producers.",
    prompt: JSON.stringify({ project, script }),
    schemaHint:
      "[{ id: string, sceneNumber: number, title: string, narration: string, visualDescription: string, onScreenText: string, brollSuggestions: string[], assetSuggestions: string[], estimatedDurationSeconds: number }]"
  });
  const parsed = storyboardSceneSchema.array().safeParse(generated);

  return NextResponse.json({
    storyboardScenes: parsed.success ? parsed.data : buildFallbackStoryboard(project, script),
    provider: parsed.success ? process.env.AI_PROVIDER || "openai" : "fallback"
  });
}
