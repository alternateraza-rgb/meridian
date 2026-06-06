import { NextResponse } from "next/server";

import type { Project } from "@/lib/types";

function renderMarkdown(project: Project) {
  const research = project.researchBrief;
  const script = project.script;
  const scenes = project.storyboardScenes || [];
  const shotList = project.shotList || [];

  return `# ${project.title}

## Production Settings

- Platform: ${project.targetPlatform}
- Format: ${project.videoType}
- Audience: ${project.targetAudience}
- Tone: ${project.tone}
- Target length: ${project.desiredLengthSeconds} seconds

## Research Brief

${research?.summary || "No research brief generated yet."}

### Key Points

${research?.keyPoints.map((point) => `- ${point}`).join("\n") || "- None yet."}

### Claims To Verify

${research?.claimsToVerify.map((claim) => `- ${claim}`).join("\n") || "- None yet."}

## Script

${script?.fullScript || "No script generated yet."}

## Storyboard

${scenes
  .map(
    (scene) => `### Scene ${scene.sceneNumber}: ${scene.title}

- Duration: ${scene.estimatedDurationSeconds}s
- On-screen text: ${scene.onScreenText}
- Visuals: ${scene.visualDescription}
- Narration: ${scene.narration}
- B-roll: ${scene.brollSuggestions.join(", ")}
`
  )
  .join("\n")}

## Shot List

${shotList
  .map((item) => `- Scene ${item.sceneNumber}: ${item.shot} (${item.assetType}) - ${item.notes}`)
  .join("\n")}
`;
}

function renderCsv(project: Project) {
  const header = ["scene_number", "shot", "asset_type", "notes"];
  const rows = (project.shotList || []).map((item) => [
    item.sceneNumber,
    item.shot,
    item.assetType,
    item.notes
  ]);

  return [header, ...rows]
    .map((row) =>
      row
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(",")
    )
    .join("\n");
}

export async function POST(request: Request) {
  const { project, type } = (await request.json()) as { project?: Project; type?: string };

  if (!project) {
    return NextResponse.json({ error: "Project is required." }, { status: 400 });
  }

  if (type === "json") {
    return NextResponse.json({ filename: `${project.title}.json`, content: JSON.stringify(project, null, 2) });
  }

  if (type === "csv") {
    return NextResponse.json({ filename: `${project.title}-shot-list.csv`, content: renderCsv(project) });
  }

  return NextResponse.json({ filename: `${project.title}-production-brief.md`, content: renderMarkdown(project) });
}
