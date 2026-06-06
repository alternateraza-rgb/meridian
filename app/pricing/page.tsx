import Link from "next/link";

import { Brand } from "@/components/brand";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Try the production brief workflow.",
    features: ["2 demo projects", "Fallback AI generation", "Markdown exports"]
  },
  {
    name: "Creator",
    price: "$19",
    description: "For solo creators and faceless channels.",
    features: ["More projects", "Script + storyboard credits", "CSV and JSON exports"]
  },
  {
    name: "Pro",
    price: "$49",
    description: "For editors, agencies, and serious teams.",
    features: ["Higher AI limits", "Brand kit roadmap", "Voiceover credits later"]
  }
];

export default function PricingPage() {
  return (
    <>
      <header className="container">
        <nav className="nav">
          <Brand />
          <div className="nav-links">
            <Link className="muted" href="/login">
              Log in
            </Link>
            <Link className="button primary" href="/app">
              Open studio
            </Link>
          </div>
        </nav>
      </header>

      <main className="container section">
        <div className="eyebrow">Pricing draft</div>
        <h2>Credit-based plans for AI production work.</h2>
        <div className="grid three">
          {plans.map((plan) => (
            <article className="card card-inner" key={plan.name}>
              <span className="tag">{plan.name}</span>
              <h3 style={{ fontSize: "2.4rem", margin: "18px 0 8px" }}>
                {plan.price}
                <span className="muted" style={{ fontSize: "1rem" }}>
                  /mo
                </span>
              </h3>
              <p className="muted">{plan.description}</p>
              <ul className="small-list">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
