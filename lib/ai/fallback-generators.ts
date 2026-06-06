import type {
  Project,
  ResearchBrief,
  ShotListItem,
  StoryboardScene,
  VideoScript
} from "@/lib/types";

const defaultSourceNote =
  "Add a verified source before publishing. Meridian flags unsupported factual claims during planning.";

function normalizeTopic(project: Pick<Project, "title" | "sourceText" | "description">) {
  return project.title || project.description || project.sourceText.slice(0, 80) || "Untitled story";
}

function sentence(input: string, fallback: string) {
  const cleaned = input.replace(/\s+/g, " ").trim();
  if (!cleaned) {
    return fallback;
  }

  return cleaned.endsWith(".") || cleaned.endsWith("!") || cleaned.endsWith("?")
    ? cleaned
    : `${cleaned}.`;
}

export function buildFallbackResearchBrief(project: Project): ResearchBrief {
  const topic = normalizeTopic(project);
  const audience = project.targetAudience || "viewers";
  const sourcePreview = sentence(
    project.sourceText.slice(0, 240),
    `${topic} needs a clear production angle before scriptwriting.`
  );

  return {
    summary: `${topic} is framed for ${audience} as a ${project.videoType.toLowerCase()} on ${project.targetPlatform}. ${sourcePreview}`,
    keyPoints: [
      `Define the central promise: why ${audience} should care now.`,
      "Open with a concrete tension, surprising fact, or viewer problem.",
      "Organize the story into three clear movements: context, development, and takeaway.",
      "Use visual evidence, data, or examples whenever the narration makes a claim."
    ],
    suggestedAngles: [
      "Problem-solution explainer",
      "Behind-the-scenes breakdown",
      "News-style context and implications",
      "Myth versus reality narrative"
    ],
    claimsToVerify: [
      "Statistics, dates, names, and financial figures mentioned in the source material.",
      "Causal claims that connect events, companies, policies, or people.",
      "Any quote or attribution that will appear on screen or in voiceover."
    ],
    sources: [
      {
        title: project.sourceUrl ? "Submitted source URL" : "Creator-provided brief",
        url: project.sourceUrl || undefined,
        note: project.sourceUrl
          ? "Use this as the starting point for research, then corroborate key details."
          : defaultSourceNote
      },
      {
        title: "Editorial fact-check pass",
        note: "Before export, add at least two independent references for important factual claims."
      }
    ]
  };
}

export function buildFallbackScript(project: Project, researchBrief?: ResearchBrief): VideoScript {
  const topic = normalizeTopic(project);
  const duration = project.desiredLengthSeconds || 300;
  const angle = researchBrief?.suggestedAngles?.[0] || "clear explainer";
  const keyPoints = researchBrief?.keyPoints?.length
    ? researchBrief.keyPoints
    : buildFallbackResearchBrief(project).keyPoints;
  const body = keyPoints.slice(0, 4).map((point, index) => ({
    title: `Section ${index + 1}: ${point.split(":")[0]}`,
    narration: `Here is where Meridian develops the idea: ${point} Support this beat with a concrete example, visual proof, and a quick transition into the next point.`
  }));

  const hook = `What if the real story behind ${topic} is not the headline, but the chain reaction it creates for ${project.targetAudience || "the audience"}?`;
  const intro = `In this ${angle.toLowerCase()}, we will break down the context, the stakes, and the practical takeaway in a way that feels ${project.tone.toLowerCase()}.`;
  const outro = `The bigger takeaway is that ${topic} matters because it changes what viewers should watch, question, or do next.`;
  const cta = "If this breakdown helped, save it for your next production meeting and subscribe for sharper story workflows.";
  const fullScript = [hook, intro, ...body.map((section) => section.narration), outro, cta].join("\n\n");

  return {
    title: `${topic}: Video Script`,
    hook,
    intro,
    body,
    outro,
    cta,
    fullScript,
    estimatedDurationSeconds: duration,
    version: 1
  };
}

export function buildFallbackStoryboard(project: Project, script?: VideoScript): StoryboardScene[] {
  const workingScript = script || buildFallbackScript(project, project.researchBrief);
  const scriptBeats = [
    { title: "Hook", narration: workingScript.hook },
    { title: "Context", narration: workingScript.intro },
    ...workingScript.body,
    { title: "Takeaway", narration: workingScript.outro },
    { title: "CTA", narration: workingScript.cta }
  ];
  const perSceneDuration = Math.max(12, Math.round(workingScript.estimatedDurationSeconds / scriptBeats.length));

  return scriptBeats.map((beat, index) => ({
    id: `scene-${index + 1}`,
    sceneNumber: index + 1,
    title: beat.title,
    narration: beat.narration,
    visualDescription:
      index === 0
        ? "Fast opening montage with bold text, close-up details, and one curiosity-driving visual."
        : "Layer relevant b-roll, sourced images, simple motion graphics, and tasteful captions over the narration.",
    onScreenText: index === 0 ? "The real story starts here" : beat.title,
    brollSuggestions: [
      "Relevant archival or stock footage",
      "Close-up texture shots",
      "Simple animated map, chart, or timeline"
    ],
    assetSuggestions: [
      "Verified source screenshot",
      "Brand-safe title card",
      "Lower-third caption template"
    ],
    estimatedDurationSeconds: perSceneDuration
  }));
}

export function buildFallbackShotList(scenes: StoryboardScene[]): ShotListItem[] {
  return scenes.flatMap((scene) => [
    {
      sceneNumber: scene.sceneNumber,
      shot: `${scene.title} establishing visual`,
      assetType: "b-roll",
      notes: scene.visualDescription
    },
    {
      sceneNumber: scene.sceneNumber,
      shot: `On-screen text: ${scene.onScreenText}`,
      assetType: "text-card",
      notes: "Use brand typography and keep title-safe margins."
    }
  ]);
}
