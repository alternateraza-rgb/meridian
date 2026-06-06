import { NextResponse } from "next/server";

import { buildFallbackShotList } from "@/lib/ai/fallback-generators";
import { generateStructuredJson } from "@/lib/ai/providers";
import { shotListItemSchema } from "@/lib/ai/schemas";
import type { StoryboardScene } from "@/lib/types";

export async function POST(request: Request) {
  const { storyboardScenes } = (await request.json()) as { storyboardScenes?: StoryboardScene[] };

  if (!storyboardScenes?.length) {
    return NextResponse.json({ error: "Storyboard scenes are required." }, { status: 400 });
  }

  const generated = await generateStructuredJson({
    system:
      "You are Meridian, an experienced video producer. Create a concise shot list that an editor can source or generate.",
    prompt: JSON.stringify({ storyboardScenes }),
    schemaHint:
      "[{ sceneNumber: number, shot: string, assetType: 'b-roll' | 'graphic' | 'screen-recording' | 'generated-image' | 'stock' | 'text-card', notes: string }]"
  });
  const parsed = shotListItemSchema.array().safeParse(generated);

  return NextResponse.json({
    shotList: parsed.success ? parsed.data : buildFallbackShotList(storyboardScenes),
    provider: parsed.success ? process.env.AI_PROVIDER || "openai" : "fallback"
  });
}
