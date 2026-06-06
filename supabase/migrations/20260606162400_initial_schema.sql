create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  input_type text not null check (input_type in ('topic', 'article_url', 'pasted_text', 'script')),
  source_url text,
  source_text text not null default '',
  video_type text not null default 'YouTube explainer',
  target_platform text not null default 'YouTube',
  target_audience text not null default 'General audience',
  tone text not null default 'Clear and authoritative',
  language text not null default 'English',
  desired_length_seconds integer not null default 300,
  status text not null default 'draft' check (status in ('draft', 'generating', 'ready', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.research_briefs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  summary text not null,
  key_points jsonb not null default '[]'::jsonb,
  sources jsonb not null default '[]'::jsonb,
  claims_to_verify jsonb not null default '[]'::jsonb,
  suggested_angles jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.scripts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  hook text not null,
  intro text not null,
  body jsonb not null default '[]'::jsonb,
  outro text not null,
  cta text not null,
  full_script text not null,
  estimated_duration_seconds integer not null default 300,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.storyboard_scenes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  script_id uuid references public.scripts(id) on delete set null,
  scene_number integer not null,
  title text not null,
  narration text not null,
  visual_description text not null,
  on_screen_text text not null,
  broll_suggestions jsonb not null default '[]'::jsonb,
  asset_suggestions jsonb not null default '[]'::jsonb,
  estimated_duration_seconds integer not null default 20,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shot_list_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  scene_number integer not null,
  shot text not null,
  asset_type text not null check (asset_type in ('b-roll', 'graphic', 'screen-recording', 'generated-image', 'stock', 'text-card')),
  notes text not null,
  created_at timestamptz not null default now()
);

create table public.exports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  export_type text not null check (export_type in ('markdown', 'pdf', 'json', 'csv')),
  file_url text,
  payload jsonb,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  model text not null,
  generation_type text not null check (generation_type in ('research_brief', 'script', 'storyboard', 'shot_list', 'export')),
  prompt_tokens integer,
  completion_tokens integer,
  cost_estimate numeric(12, 6),
  status text not null check (status in ('queued', 'running', 'succeeded', 'failed')),
  error_message text,
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'free',
  status text not null default 'inactive',
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.projects enable row level security;
alter table public.research_briefs enable row level security;
alter table public.scripts enable row level security;
alter table public.storyboard_scenes enable row level security;
alter table public.shot_list_items enable row level security;
alter table public.exports enable row level security;
alter table public.ai_generations enable row level security;
alter table public.subscriptions enable row level security;

create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.project_workspace_id(target_project_id uuid)
returns uuid
language sql
security definer
set search_path = public
as $$
  select workspace_id from public.projects where id = target_project_id;
$$;

create or replace function public.is_workspace_owner(target_workspace_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspaces
    where id = target_workspace_id
      and owner_id = auth.uid()
  );
$$;

create policy "Users can view their own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Users can update their own profile"
  on public.profiles for update
  using (id = auth.uid());

create policy "Users can view member workspaces"
  on public.workspaces for select
  using (public.is_workspace_member(id));

create policy "Users can create owned workspaces"
  on public.workspaces for insert
  with check (owner_id = auth.uid());

create policy "Workspace owners can update workspaces"
  on public.workspaces for update
  using (owner_id = auth.uid());

create policy "Users can view workspace membership"
  on public.workspace_members for select
  using (public.is_workspace_member(workspace_id));

create policy "Workspace owners can create memberships"
  on public.workspace_members for insert
  with check (public.is_workspace_owner(workspace_id));

create policy "Workspace members can manage projects"
  on public.projects for all
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id) and created_by = auth.uid());

create policy "Workspace members can manage research briefs"
  on public.research_briefs for all
  using (public.is_workspace_member(public.project_workspace_id(project_id)))
  with check (public.is_workspace_member(public.project_workspace_id(project_id)));

create policy "Workspace members can manage scripts"
  on public.scripts for all
  using (public.is_workspace_member(public.project_workspace_id(project_id)))
  with check (public.is_workspace_member(public.project_workspace_id(project_id)));

create policy "Workspace members can manage storyboard scenes"
  on public.storyboard_scenes for all
  using (public.is_workspace_member(public.project_workspace_id(project_id)))
  with check (public.is_workspace_member(public.project_workspace_id(project_id)));

create policy "Workspace members can manage shot list items"
  on public.shot_list_items for all
  using (public.is_workspace_member(public.project_workspace_id(project_id)))
  with check (public.is_workspace_member(public.project_workspace_id(project_id)));

create policy "Workspace members can manage exports"
  on public.exports for all
  using (public.is_workspace_member(public.project_workspace_id(project_id)))
  with check (public.is_workspace_member(public.project_workspace_id(project_id)) and created_by = auth.uid());

create policy "Workspace members can view AI generations"
  on public.ai_generations for select
  using (public.is_workspace_member(workspace_id));

create policy "Workspace members can create AI generations"
  on public.ai_generations for insert
  with check (public.is_workspace_member(workspace_id) and user_id = auth.uid());

create policy "Workspace members can view subscriptions"
  on public.subscriptions for select
  using (public.is_workspace_member(workspace_id));
