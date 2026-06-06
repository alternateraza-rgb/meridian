# Meridian

Meridian is an AI content studio MVP for turning a topic, article, script, news story, or rough idea
into a production-ready video package.

The current implementation focuses on the first sellable workflow:

1. Create a project.
2. Generate a research brief.
3. Generate a video script.
4. Generate storyboard scenes.
5. Generate a shot list.
6. Export a production package as Markdown, JSON, or CSV.

## Stack

- Next.js App Router
- React
- TypeScript
- Supabase-ready auth/database/storage architecture
- OpenAI/Anthropic-ready generation routes
- Local browser storage demo persistence

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Copy `.env.example` to `.env.local` and fill in the providers you want to enable.

If no Supabase keys are present, the app runs in demo mode with local browser storage.
If no AI keys are present, generation endpoints return deterministic fallback content so the MVP can be
tested end to end.

## Supabase

Apply the initial schema:

```bash
supabase db push
```

The migration lives at:

```text
supabase/migrations/20260606162400_initial_schema.sql
```

It includes:

- Profiles
- Workspaces
- Workspace members
- Projects
- Research briefs
- Scripts
- Storyboard scenes
- Shot list items
- Exports
- AI generation logs
- Subscriptions
- Row Level Security policies

## Product scope

This MVP intentionally does not include:

- Native video editing
- AI video generation
- AI image generation
- Voiceover generation
- Team collaboration
- Timeline/NLE exports

Those are reserved for later product versions after the production-brief workflow is validated.
