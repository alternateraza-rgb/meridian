export default function SettingsPage() {
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">Settings</div>
          <h1>Workspace configuration.</h1>
          <p className="muted">
            This MVP saves logged-in projects and generated production assets to Supabase. Visitors
            without a session can still use local demo storage.
          </p>
        </div>
      </div>

      <div className="card card-inner stack">
        <h2>Environment checklist</h2>
        <ul className="small-list">
          <li>Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.</li>
          <li>Apply supabase/migrations/20260606162400_initial_schema.sql.</li>
          <li>Add OPENAI_API_KEY or ANTHROPIC_API_KEY for live model output.</li>
          <li>Add Stripe and ElevenLabs credentials when enabling billing and voiceover.</li>
        </ul>
      </div>
    </>
  );
}
