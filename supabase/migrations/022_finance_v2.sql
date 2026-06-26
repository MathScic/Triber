-- Migration 022 : module finances complet
-- Templates de cotisation, tarifs par catégorie, paiements, buvette

create table if not exists contribution_templates (
  id              uuid        primary key default gen_random_uuid(),
  organization_id uuid        not null references organizations on delete cascade,
  title           text        not null,
  description     text,
  deadline        date,
  warning_message text,
  is_buvette      boolean     not null default false,
  is_active       boolean     not null default true,
  created_by      uuid        references auth.users,
  created_at      timestamptz default now()
);

alter table contribution_templates enable row level security;
create policy "ct_select" on contribution_templates for select using (organization_id in (select organization_id from organization_members where user_id = auth.uid()));
create policy "ct_insert" on contribution_templates for insert with check (exists (select 1 from organization_members where user_id = auth.uid() and organization_id = contribution_templates.organization_id and role in ('admin','member_active')));
create policy "ct_update" on contribution_templates for update using (exists (select 1 from organization_members where user_id = auth.uid() and organization_id = contribution_templates.organization_id and role in ('admin','member_active')));
create policy "ct_delete" on contribution_templates for delete using (exists (select 1 from organization_members where user_id = auth.uid() and organization_id = contribution_templates.organization_id and role = 'admin'));

create table if not exists contribution_tarifs (
  id          uuid primary key default gen_random_uuid(),
  template_id uuid not null references contribution_templates on delete cascade,
  category    text not null,
  amount_cents int  not null check (amount_cents > 0),
  unique(template_id, category)
);

alter table contribution_tarifs enable row level security;
create policy "tarifs_select" on contribution_tarifs for select using (template_id in (select ct.id from contribution_templates ct where ct.organization_id in (select organization_id from organization_members where user_id = auth.uid())));
create policy "tarifs_insert" on contribution_tarifs for insert with check (template_id in (select ct.id from contribution_templates ct where ct.organization_id in (select organization_id from organization_members where user_id = auth.uid() and role in ('admin','member_active'))));
create policy "tarifs_delete" on contribution_tarifs for delete using (template_id in (select ct.id from contribution_templates ct where ct.organization_id in (select organization_id from organization_members where user_id = auth.uid() and role in ('admin','member_active'))));

create table if not exists contribution_payments (
  id                uuid        primary key default gen_random_uuid(),
  template_id       uuid        not null references contribution_templates on delete cascade,
  organization_id   uuid        not null references organizations on delete cascade,
  user_id           uuid        references auth.users on delete set null,
  manual_name       text,
  category          text,
  amount_cents      int         not null,
  status            text        not null default 'pending' check (status in ('pending','paid','failed')),
  payment_method    text        check (payment_method in ('cash','tpe','stripe','transfer','autre')),
  stripe_payment_id text,
  paid_at           timestamptz,
  paid_by           uuid        references auth.users,
  notes             text,
  created_at        timestamptz default now(),
  constraint check_person check (user_id is not null or manual_name is not null)
);

alter table contribution_payments enable row level security;
create policy "cp_select" on contribution_payments for select using (organization_id in (select organization_id from organization_members where user_id = auth.uid() and role in ('admin','member_active')));
create policy "cp_insert" on contribution_payments for insert with check (exists (select 1 from organization_members where user_id = auth.uid() and organization_id = contribution_payments.organization_id and role in ('admin','member_active')));
create policy "cp_update" on contribution_payments for update using (exists (select 1 from organization_members where user_id = auth.uid() and organization_id = contribution_payments.organization_id and role in ('admin','member_active')));
create policy "cp_delete" on contribution_payments for delete using (exists (select 1 from organization_members where user_id = auth.uid() and organization_id = contribution_payments.organization_id and role in ('admin','member_active')));

create table if not exists treasury_entries (
  id                    uuid        primary key default gen_random_uuid(),
  organization_id       uuid        not null references organizations on delete cascade,
  template_id           uuid        references contribution_templates on delete set null,
  amount_declared_cents int         not null,
  amount_ticket_cents   int,
  photo_url             text,
  entry_date            date        not null default current_date,
  notes                 text,
  entered_by            uuid        references auth.users,
  reviewed_by           uuid        references auth.users,
  reviewed_at           timestamptz,
  created_at            timestamptz default now()
);

alter table treasury_entries enable row level security;
create policy "te_select" on treasury_entries for select using (organization_id in (select organization_id from organization_members where user_id = auth.uid() and role in ('admin','member_active')));
create policy "te_insert" on treasury_entries for insert with check (exists (select 1 from organization_members where user_id = auth.uid() and organization_id = treasury_entries.organization_id and role in ('admin','member_active')));
create policy "te_update" on treasury_entries for update using (exists (select 1 from organization_members where user_id = auth.uid() and organization_id = treasury_entries.organization_id and role in ('admin','member_active')));
