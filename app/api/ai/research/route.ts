import { NextResponse } from "next/server";

import { buildFallbackResearchBrief } from "@/lib/ai/fallback-generators";
import { generateStructuredJson } from "@/lib/ai/providers";
import { researchBriefSchema } from "@/lib/ai/schemas";
import type { Project } from "@/lib/types";

export async function POST(request: Request) {
  const { project } = (await request.json()) as { project: Project };

  if (!project?.title && !project?.sourceText) {
    return NextResponse.json({ error: "Project title or source text is required." }, { status: 400 });
  }

  const generated = await generateStructuredJson({
    system:
      "You are Meridian, an expert AI research producer for video creators. Create concise, source-aware pre-production research.",
    prompt: JSON.stringify({ project }),
    schemaHint:
      "{ summary: string, keyPoints: string[], suggestedAngles: string[], claimsToVerify: string[], sources: { title: string, url?: string, note: string }[] }"
  });
  const parsed = researchBriefSchema.safeParse(generated);

  return NextResponse.json({
    researchBrief: parsed.success ? parsed.data : buildFallbackResearchBrief(project),
    provider: parsed.success ? process.env.AI_PROVIDER || "openai" : "fallback"
  });
}
