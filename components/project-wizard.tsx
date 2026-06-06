"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { saveProject } from "@/lib/project-store";
import type { InputType, Project } from "@/lib/types";

const videoTypes = [
  "YouTube explainer",
  "Faceless documentary",
  "News recap",
  "Product marketing video",
  "Educational video",
  "Short-form script"
];

const tones = [
  "Clear and authoritative",
  "Energetic and punchy",
  "Investigative and serious",
  "Warm and conversational",
  "Cinematic documentary"
];

export function ProjectWizard() {
  const router = useRouter();
  const [inputType, setInputType] = useState<InputType>("topic");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [videoType, setVideoType] = useState(videoTypes[0]);
  const [targetPlatform, setTargetPlatform] = useState("YouTube");
  const [targetAudience, setTargetAudience] = useState("Curious general audience");
  const [tone, setTone] = useState(tones[0]);
  const [language, setLanguage] = useState("English");
  const [desiredLengthSeconds, setDesiredLengthSeconds] = useState(360);

  function submitProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const now = new Date().toISOString();
    const project: Project = {
      id: crypto.randomUUID(),
      title: title || "Untitled Meridian project",
      description,
      inputType,
      sourceUrl: inputType === "article_url" ? sourceUrl : undefined,
      sourceText,
      videoType,
      targetPlatform,
      targetAudience,
      tone,
      language,
      desiredLengthSeconds,
      status: "draft",
      createdAt: now,
      updatedAt: now
    };

    saveProject(project);
    router.push(`/app/projects/${project.id}`);
  }

  return (
    <form className="card card-inner form-grid" onSubmit={submitProject}>
      <div className="grid two">
        <div className="field">
          <label htmlFor="title">Project title</label>
          <input
            className="input"
            id="title"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Example: Why AI studios are changing YouTube production"
            required
            value={title}
          />
        </div>
        <div className="field">
          <label htmlFor="input-type">Input type</label>
          <select
            className="select"
            id="input-type"
            onChange={(event) => setInputType(event.target.value as InputType)}
            value={inputType}
          >
            <option value="topic">Topic or idea</option>
            <option value="article_url">Article URL</option>
            <option value="pasted_text">Pasted article or notes</option>
            <option value="script">Existing script</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="description">Production brief</label>
        <textarea
          className="textarea"
          id="description"
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What should this video achieve? Include audience, angle, references, or constraints."
          value={description}
        />
      </div>

      {inputType === "article_url" && (
        <div className="field">
          <label htmlFor="source-url">Article URL</label>
          <input
            className="input"
            id="source-url"
            onChange={(event) => setSourceUrl(event.target.value)}
            placeholder="https://..."
            type="url"
            value={sourceUrl}
          />
        </div>
      )}

      <div className="field">
        <label htmlFor="source-text">Source text, notes, or script</label>
        <textarea
          className="textarea"
          id="source-text"
          onChange={(event) => setSourceText(event.target.value)}
          placeholder="Paste article text, rough notes, an outline, or the current script."
          value={sourceText}
        />
      </div>

      <div className="grid three">
        <div className="field">
          <label htmlFor="video-type">Video type</label>
          <select
            className="select"
            id="video-type"
            onChange={(event) => setVideoType(event.target.value)}
            value={videoType}
          >
            {videoTypes.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="platform">Target platform</label>
          <input
            className="input"
            id="platform"
            onChange={(event) => setTargetPlatform(event.target.value)}
            value={targetPlatform}
          />
        </div>
        <div className="field">
          <label htmlFor="length">Length in seconds</label>
          <input
            className="input"
            id="length"
            min={30}
            onChange={(event) => setDesiredLengthSeconds(Number(event.target.value))}
            type="number"
            value={desiredLengthSeconds}
          />
        </div>
      </div>

      <div className="grid three">
        <div className="field">
          <label htmlFor="audience">Audience</label>
          <input
            className="input"
            id="audience"
            onChange={(event) => setTargetAudience(event.target.value)}
            value={targetAudience}
          />
        </div>
        <div className="field">
          <label htmlFor="tone">Tone</label>
          <select className="select" id="tone" onChange={(event) => setTone(event.target.value)} value={tone}>
            {tones.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="language">Language</label>
          <input
            className="input"
            id="language"
            onChange={(event) => setLanguage(event.target.value)}
            value={language}
          />
        </div>
      </div>

      <div className="actions">
        <button className="button primary" type="submit">
          Create production workspace
        </button>
      </div>
    </form>
  );
}
