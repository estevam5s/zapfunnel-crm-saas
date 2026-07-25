-- ============================================================
-- ZapFunnel — módulos CRM (Broadcast, Flows, Automações, Pipelines)
-- Inspirado no wacrm, adaptado às convenções do ZapFunnel:
--   backend usa admin client (service role) + filtro por user_id.
--   RLS liga com policy own-row (auth.uid() = user_id).
-- ============================================================

create extension if not exists "uuid-ossp";

-- ---------- BROADCAST ----------
create table if not exists public.broadcasts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  message text not null,
  media_url text,
  status text not null default 'draft' check (status in ('draft','scheduled','sending','sent','failed')),
  scheduled_at timestamptz,
  audience jsonb not null default '{}'::jsonb,  -- { tags:[], all:bool }
  total integer not null default 0,
  sent_count integer not null default 0,
  failed_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_broadcasts_user on public.broadcasts(user_id);

create table if not exists public.broadcast_recipients (
  id uuid primary key default uuid_generate_v4(),
  broadcast_id uuid not null references public.broadcasts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  phone text not null,
  status text not null default 'pending' check (status in ('pending','sent','delivered','read','failed')),
  wa_message_id text,
  error text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_bcast_recip on public.broadcast_recipients(broadcast_id);

-- ---------- AUTOMAÇÕES (regras trigger→ação, estilo N8N simples) ----------
create table if not exists public.automations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  trigger_type text not null,             -- new_message | keyword | new_contact | deal_stage | schedule
  trigger_config jsonb not null default '{}'::jsonb,
  actions jsonb not null default '[]'::jsonb,   -- [{ type, config }]  N8N-like ordered steps
  is_active boolean not null default false,
  execution_count integer not null default 0,
  last_executed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_automations_user on public.automations(user_id);

create table if not exists public.automation_logs (
  id uuid primary key default uuid_generate_v4(),
  automation_id uuid not null references public.automations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  trigger_event text not null,
  steps_executed jsonb not null default '[]'::jsonb,
  status text not null check (status in ('success','partial','failed')),
  error_message text,
  created_at timestamptz not null default now()
);
create index if not exists idx_automation_logs on public.automation_logs(automation_id);

-- ---------- FLOWS (chatbot conversacional / fluxo de nós) ----------
create table if not exists public.flows (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'draft' check (status in ('draft','active','paused')),
  trigger_type text not null default 'keyword',   -- keyword | any_message | new_contact
  trigger_config jsonb not null default '{}'::jsonb,
  nodes jsonb not null default '[]'::jsonb,   -- [{ key, type, config, x, y }]
  edges jsonb not null default '[]'::jsonb,   -- [{ from, to, on }]
  entry_node text,
  execution_count integer not null default 0,
  last_executed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_flows_user on public.flows(user_id);

create table if not exists public.flow_runs (
  id uuid primary key default uuid_generate_v4(),
  flow_id uuid not null references public.flows(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  conversation_id uuid references public.conversations(id) on delete set null,
  current_node text,
  status text not null default 'active' check (status in ('active','completed','abandoned','handoff')),
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_flow_runs on public.flow_runs(flow_id);

-- ---------- PIPELINES / DEALS (funil) ----------
create table if not exists public.pipelines (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  stages jsonb not null default '["Lead","Qualificado","Proposta","Ganho","Perdido"]'::jsonb,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_pipelines_user on public.pipelines(user_id);

create table if not exists public.deals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pipeline_id uuid references public.pipelines(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  title text not null,
  value numeric not null default 0,
  currency text not null default 'BRL',
  stage text not null default 'Lead',
  status text not null default 'open' check (status in ('open','won','lost')),
  position integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_deals_user on public.deals(user_id);
create index if not exists idx_deals_pipeline on public.deals(pipeline_id);

-- ---------- updated_at trigger ----------
create or replace function public.set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

do $$
declare t text;
begin
  foreach t in array array['broadcasts','automations','flows','flow_runs','deals']
  loop
    execute format('drop trigger if exists trg_%1$s_updated on public.%1$s', t);
    execute format('create trigger trg_%1$s_updated before update on public.%1$s for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ---------- RLS (own-row) ----------
do $$
declare t text;
begin
  foreach t in array array[
    'broadcasts','broadcast_recipients','automations','automation_logs',
    'flows','flow_runs','pipelines','deals'
  ]
  loop
    execute format('alter table public.%s enable row level security', t);
    execute format('drop policy if exists own_row on public.%s', t);
    execute format('create policy own_row on public.%s for all using (auth.uid() = user_id) with check (auth.uid() = user_id)', t);
  end loop;
end $$;
