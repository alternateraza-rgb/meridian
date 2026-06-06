export default function BillingPage() {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">Billing</div>
          <h1>Usage and plan controls.</h1>
          <p className="muted">
            Stripe checkout and webhook handling are the next implementation step once production
            Supabase persistence is enabled.
          </p>
        </div>
      </div>

      <div className="grid three">
        <div className="card card-inner">
          <span className="tag">Free</span>
          <h3>Demo mode</h3>
          <p className="muted">Local projects, fallback AI output, and basic exports.</p>
        </div>
        <div className="card card-inner">
          <span className="tag">Creator</span>
          <h3>$19/mo</h3>
          <p className="muted">Credit-backed text generations, more projects, and export history.</p>
        </div>
        <div className="card card-inner">
          <span className="tag">Pro</span>
          <h3>$49/mo</h3>
          <p className="muted">Higher limits, team workspace path, brand kit, and voiceover roadmap.</p>
        </div>
      </div>
    </>
  );
}
