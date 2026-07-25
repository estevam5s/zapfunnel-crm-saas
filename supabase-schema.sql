-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  ZapFunnel — Schema SaaS + Painel Administrativo (admin.md)        ║
-- ╚══════════════════════════════════════════════════════════════════╝
create extension if not exists pgcrypto;

-- ── SaaS core ─────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text, full_name text, plan_slug text default 'inicial',
  trial_ends_at timestamptz, is_demo boolean default false,
  blocked boolean default false, created_at timestamptz default now()
);

create table if not exists public.app_plans (
  slug text primary key, name text not null, description text,
  price_month integer not null default 0, price_year integer not null default 0,
  stripe_price_month text, stripe_price_year text,
  features jsonb default '[]'::jsonb, limits jsonb default '{}'::jsonb,
  highlighted boolean default false, sort_order integer default 0
);

create table if not exists public.app_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan_slug text not null default 'inicial', status text not null default 'inactive',
  stripe_customer_id text, stripe_subscription_id text, cycle text,
  current_period_end timestamptz, refund_eligible_until timestamptz,
  cancel_at_period_end boolean default false, updated_at timestamptz default now()
);

create table if not exists public.app_payment_events (
  id text primary key, type text, user_id uuid, amount integer, created_at timestamptz default now()
);

-- ── CRM (dados do usuário) ────────────────────────────────────────────
create table if not exists public.crm_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text, phone text, email text, tags text[] default '{}',
  stage text default 'novo', value integer default 0, notes text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create index if not exists idx_crm_contacts_user on public.crm_contacts(user_id);

-- ── Painel administrativo (admin.md) ──────────────────────────────────
create table if not exists public.saas_products (
  id uuid primary key default gen_random_uuid(),
  slug text unique, name text not null, description text, category text,
  domain text, status text default 'ativo',
  price_month integer default 0, price_year integer default 0, price_lifetime integer default 0,
  customers integer default 0, mrr integer default 0, arr integer default 0,
  revenue_month integer default 0, revenue_year integer default 0,
  costs integer default 0, profit integer default 0,
  conversion numeric default 0, churn numeric default 0, arpu integer default 0, ltv integer default 0,
  trial_customers integer default 0, paying_customers integer default 0, canceled_customers integer default 0,
  sort_order integer default 0, created_at timestamptz default now(), updated_at timestamptz default now()
);

create table if not exists public.finance_entries (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.saas_products(id) on delete set null,
  kind text not null default 'receita',           -- receita | despesa | investimento | custo
  category text, description text, amount integer not null default 0,
  recurring boolean default false, entry_date date default current_date,
  created_at timestamptz default now()
);

create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  code text unique, name text, kind text default 'percent',   -- percent | fixed
  amount integer not null default 0,               -- % (0-100) ou centavos
  stripe_coupon_id text, applies_to text default 'all',
  starts_at timestamptz default now(), ends_at timestamptz,
  max_redemptions integer, redemptions integer default 0,
  active boolean default true, created_at timestamptz default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor text, actor_id uuid, level text default 'info',         -- info | warning | error | security
  action text not null, target text, detail jsonb default '{}'::jsonb,
  ip text, user_agent text, created_at timestamptz default now()
);
create index if not exists idx_audit_created on public.audit_logs(created_at desc);
create index if not exists idx_audit_level on public.audit_logs(level);

create table if not exists public.visitors (
  id uuid primary key default gen_random_uuid(),
  country text, country_code text, city text, region text,
  device text, browser text, os text, source text, path text,
  lat numeric, lng numeric, created_at timestamptz default now()
);
create index if not exists idx_visitors_created on public.visitors(created_at desc);

create table if not exists public.admin_api_keys (
  id uuid primary key default gen_random_uuid(),
  name text, key_prefix text, key_hash text, scopes text[] default '{read}',
  last_used_at timestamptz, revoked boolean default false, created_at timestamptz default now()
);

create table if not exists public.seo_settings (
  id integer primary key default 1,
  meta_title text, meta_description text, og_title text, og_description text, og_image text,
  twitter_card text default 'summary_large_image', canonical_base text,
  robots text default 'index,follow', ga_id text, gtm_id text, gsc_verification text,
  updated_at timestamptz default now()
);

create table if not exists public.service_status (
  id uuid primary key default gen_random_uuid(),
  service text unique, status text default 'operational',  -- operational | degraded | down
  latency_ms integer default 0, uptime numeric default 100, checked_at timestamptz default now()
);

create table if not exists public.backups (
  id uuid primary key default gen_random_uuid(),
  kind text default 'manual', size_bytes bigint default 0, tables_count integer default 0,
  status text default 'done', note text, created_at timestamptz default now()
);

-- ── RLS ───────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.app_subscriptions enable row level security;
alter table public.app_plans enable row level security;
alter table public.crm_contacts enable row level security;
-- tabelas admin: somente service_role (sem políticas → RLS bloqueia clientes anon/auth)
alter table public.saas_products enable row level security;
alter table public.finance_entries enable row level security;
alter table public.promotions enable row level security;
alter table public.audit_logs enable row level security;
alter table public.visitors enable row level security;
alter table public.admin_api_keys enable row level security;
alter table public.seo_settings enable row level security;
alter table public.service_status enable row level security;
alter table public.backups enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "own sub" on public.app_subscriptions;
create policy "own sub" on public.app_subscriptions for select using (auth.uid() = user_id);
drop policy if exists "plans read" on public.app_plans;
create policy "plans read" on public.app_plans for select using (true);
drop policy if exists "own crm" on public.crm_contacts;
create policy "own crm" on public.crm_contacts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "promos read" on public.promotions;
create policy "promos read" on public.promotions for select using (active = true);

-- ── Trigger: profile + subscription c/ trial 7 dias ───────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, plan_slug, trial_ends_at)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name',''), 'inicial', now() + interval '7 days')
  on conflict (id) do nothing;
  insert into public.app_subscriptions (user_id, plan_slug, status)
  values (new.id, 'inicial', 'trialing') on conflict (user_id) do nothing;
  insert into public.audit_logs (actor, actor_id, level, action, target)
  values (new.email, new.id, 'info', 'signup', 'auth.users');
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

grant usage on schema public to service_role, anon, authenticated;
grant all on all tables in schema public to service_role;
grant select on public.app_plans to anon, authenticated;
grant select on public.promotions to anon, authenticated;

-- ── Seed planos ───────────────────────────────────────────────────────
insert into public.app_plans (slug, name, description, price_month, price_year, stripe_price_month, stripe_price_year, highlighted, sort_order, features, limits) values
 ('inicial','Inicial','Autônomo / testar',0,0,null,null,false,0,
   '["1 número de WhatsApp","100 contatos","2 atendentes","Funil até 4 etapas","Inbox de conversas","Histórico de 30 dias"]'::jsonb,
   '{"wa_numbers":1,"contacts":100,"members":2,"funnel_stages":4,"automations":false,"campaigns":false,"api":false,"history_days":30,"white_label":false}'::jsonb),
 ('starter','Starter','Pequeno negócio',9700,93100,'price_1TmKQZJ6zI3Lognz46uzDMgw','price_1TmKQaJ6zI3LognziS2mzbIp',false,1,
   '["1 número","1.000 contatos","4 atendentes","Funil ilimitado","Etiquetas e respostas rápidas","Automações de follow-up","Relatórios avançados","Histórico 12 meses"]'::jsonb,
   '{"wa_numbers":1,"contacts":1000,"members":4,"funnel_stages":-1,"automations":true,"campaigns":false,"api":false,"history_days":365,"white_label":false}'::jsonb),
 ('pro','Pro','Time de vendas / PME',29700,285100,'price_1TmKQbJ6zI3Lognz8KeLRDQb','price_1TmKQbJ6zI3LognzBN4xoLEN',true,2,
   '["3 números","Contatos ilimitados","15 atendentes + distribuição","Campanhas e disparos","Automações por etapa","Relatórios por atendente","API e webhooks","Suporte prioritário"]'::jsonb,
   '{"wa_numbers":3,"contacts":-1,"members":15,"funnel_stages":-1,"automations":true,"campaigns":true,"api":true,"history_days":-1,"white_label":false}'::jsonb),
 ('enterprise','Enterprise','Operação / multi-equipe',79700,765100,'price_1TmKQcJ6zI3Lognz5kURwG0T','price_1TmKQdJ6zI3LognzNtOhURjt',false,3,
   '["Números ilimitados","Atendentes ilimitados + permissões","Marca própria (white-label)","SSO e auditoria","API ampliada","Onboarding assistido (SLA)"]'::jsonb,
   '{"wa_numbers":-1,"contacts":-1,"members":-1,"funnel_stages":-1,"automations":true,"campaigns":true,"api":true,"history_days":-1,"white_label":true}'::jsonb)
on conflict (slug) do update set name=excluded.name, description=excluded.description, price_month=excluded.price_month,
  price_year=excluded.price_year, stripe_price_month=excluded.stripe_price_month, stripe_price_year=excluded.stripe_price_year,
  highlighted=excluded.highlighted, sort_order=excluded.sort_order, features=excluded.features, limits=excluded.limits;

-- seed status dos serviços + SEO base
insert into public.service_status (service, status, latency_ms, uptime) values
 ('Supabase','operational',42,99.98),('Stripe','operational',88,99.99),('API','operational',31,99.97),
 ('Webhooks','operational',54,99.95),('Vercel','operational',23,100)
on conflict (service) do nothing;
insert into public.seo_settings (id, meta_title, meta_description, canonical_base, og_title, og_description) values
 (1,'ZapFunnel — CRM de Vendas para WhatsApp','CRM focado em vendas no WhatsApp com funil visual, inbox e relatórios.','https://zapfunnel-crm.vercel.app','ZapFunnel','Venda mais pelo WhatsApp com um funil visual.')
on conflict (id) do nothing;

notify pgrst, 'reload schema';
