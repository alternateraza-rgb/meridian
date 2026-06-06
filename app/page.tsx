import Link from "next/link";
import { ArrowRight, Boxes, FileText, Film, Mic2, Search, Sparkles } from "lucide-react";

import { Brand } from "@/components/brand";

const workflow = [
  {
    icon: Search,
    title: "Research brief",
    text: "Turn a topic, article, or pasted notes into a concise source-aware production brief."
  },
  {
    icon: FileText,
    title: "Script",
    text: "Generate hooks, narration, structured sections, CTAs, and voiceover-ready copy."
  },
  {
    icon: Film,
    title: "Storyboard",
    text: "Convert scripts into scene cards with visuals, on-screen text, b-roll, and timing."
  },
  {
    icon: Boxes,
    title: "Editor package",
    text: "Export a markdown brief, JSON package, or CSV shot list for production handoff."
  }
];

export default function HomePage() {
  return (
    <>
      <header className="container">
        <nav className="nav">
          <Brand />
          <div className="nav-links">
            <Link className="muted" href="/pricing">
              Pricing
            </Link>
            <Link className="muted" href="/login">
              Log in
            </Link>
            <Link className="button primary" href="/app">
              Open studio
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="container hero">
          <div>
            <div className="eyebrow">AI pre-production studio</div>
            <h1>From rough idea to production-ready video plan.</h1>
            <p>
              Meridian helps creators, editors, marketing teams, and newsrooms turn topics, articles,
              scripts, and story ideas into research briefs, scripts, storyboards, shot lists, and
              export packages.
            </p>
            <div className="actions">
              <Link className="button primary" href="/app/projects/new">
                Start a project <ArrowRight size={18} />
              </Link>
              <Link className="button" href="/app">
                View dashboard
              </Link>
            </div>
          </div>

          <div className="card studio-preview">
            <div className="preview-header">
              <strong>Documentary workflow</strong>
              <span className="status-pill">Ready to export</span>
            </div>
            <div className="preview-body">
              <div className="timeline-row">
                <strong>01 Research angle</strong>
                <span className="muted">What changed, who is affected, and what must be verified?</span>
              </div>
              <div className="timeline-row">
                <strong>02 Voiceover script</strong>
                <span className="muted">Hook, context, three acts, clean transitions, and CTA.</span>
              </div>
              <div className="timeline-row">
                <strong>03 Storyboard scenes</strong>
                <span className="muted">B-roll, text cards, visuals, editor notes, and estimated timing.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="container section">
          <div className="eyebrow">MVP workflow</div>
          <h2>The production layer before editing begins.</h2>
          <div className="grid four">
            <div className="grid three">
              {workflow.map((item) => {
                const Icon = item.icon;
                return (
                  <article className="card card-inner" key={item.title}>
                    <Icon color="var(--accent)" />
                    <h3>{item.title}</h3>
                    <p className="muted">{item.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="container section">
          <div className="card card-inner">
            <div className="grid two">
              <div>
                <div className="eyebrow">Built for teams later</div>
                <h2>Start simple. Scale into voiceover, assets, and timeline exports.</h2>
                <p className="muted">
                  The first version focuses on the sellable wedge: production briefs. The architecture
                  already leaves room for Supabase workspaces, ElevenLabs voiceover, brand kits, asset
                  libraries, and video generation providers.
                </p>
              </div>
              <div className="stack">
                <span className="tag">
                  <Sparkles size={14} /> AI script generation
                </span>
                <span className="tag">
                  <Mic2 size={14} /> Voiceover-ready narration
                </span>
                <span className="tag">
                  <Film size={14} /> Storyboard + shot list
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
