import { NextResponse } from "next/server";

import { buildFallbackScript } from "@/lib/ai/fallback-generators";
import { generateStructuredJson } from "@/lib/ai/providers";
import { videoScriptSchema } from "@/lib/ai/schemas";
import type { Project, ResearchBrief } from "@/lib/types";

export async function POST(request: Request) {
  const { project, researchBrief } = (await request.json()) as {
    project: Project;
    researchBrief?: ResearchBrief;
  };

  if (!project) {
    return NextResponse.json({ error: "Project is required." }, { status: 400 });
  }

  const generated = await generateStructuredJson({
    system:
      "You are Meridian, a senior video scriptwriter. Write production-ready narration with a clear hook, structure, and editor-friendly pacing.",
    prompt: JSON.stringify({ project, researchBrief }),
    schemaHint:
      "{ title: string, hook: string, intro: string, body: { title: string, narration: string }[], outro: string, cta: string, fullScript: string, estimatedDurationSeconds: number, version: number }"
  });
  const parsed = videoScriptSchema.safeParse(generated);

  return NextResponse.json({
    script: parsed.success ? parsed.data : buildFallbackScript(project, researchBrief),
    provider: parsed.success ? process.env.AI_PROVIDER || "openai" : "fallback"
  });
}
