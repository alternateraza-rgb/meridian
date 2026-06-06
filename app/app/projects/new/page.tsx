import { ProjectWizard } from "@/components/project-wizard";

export default function NewProjectPage() {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">New project</div>
          <h1>Create a production package.</h1>
          <p className="muted">
            Start with a topic, article, rough idea, or script. Meridian will help produce the
            research brief, script, storyboard, shot list, and export package.
          </p>
        </div>
      </div>
      <ProjectWizard />
    </>
  );
}
