# AGENTS.md

## Cursor Cloud specific instructions

Meridian is a single Next.js 16 app (App Router). There is no monorepo, Docker Compose, or separate backend.

### Services

| Service | Required for demo E2E? | Notes |
|---|---|---|
| Next.js dev server (`npm run dev`) | Yes | Serves UI and API routes on port 3000 |
| Supabase | No | Optional; without keys the app uses demo mode + browser `localStorage` |
| OpenAI / Anthropic | No | Optional; without keys API routes return deterministic fallback content |

### Standard commands

See `README.md` and `package.json` scripts:

- Install: `npm install`
- Dev server: `npm run dev` → http://localhost:3000
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- Production build: `npm run build`

### Development notes

- **Demo mode is the default** for unauthenticated users. From the landing page, click **Start a project** (no Supabase keys needed). Projects persist in browser `localStorage`.
- **AI generation works without API keys** via fallback generators in `lib/ai/fallback-generators.ts`. Responses include `"provider": "fallback"`.
- The shot-list API (`POST /api/ai/shot-list`) expects `{ storyboardScenes }`, not the full project object.
- The MVP application code lives on branch `cursor/build-meridian-mvp-8b87`. `main` may only contain the initial README until that branch is merged.
- Run the dev server in a persistent tmux session if you need it to survive long-running agent work; a one-shot background shell is fine for quick checks.
- After `npm install`, Next.js dev hot-reload picks up dependency changes without restarting in most cases. Restart `npm run dev` if API routes behave unexpectedly after installs.

### Hello-world E2E path

1. `npm run dev`
2. Open http://localhost:3000 → **Start a project**
3. Create a project → generate Research → Script → Storyboard → Shot List → Export Markdown
