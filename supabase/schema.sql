-- アポ獲得トラッカー: Supabase スキーマ定義
-- Supabaseダッシュボードの SQL Editor にこの内容を貼り付けて実行してください。

create extension if not exists pgcrypto;

-- 担当者
create table if not exists reps (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  month_goal int not null default 20,
  week_goal int not null default 5,
  created_at timestamptz not null default now()
);

-- 日次記録
create table if not exists daily_logs (
  id uuid primary key default gen_random_uuid(),
  rep_id uuid not null references reps(id) on delete cascade,
  date date not null,
  calls int not null default 0,
  appointments int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists daily_logs_rep_id_idx on daily_logs(rep_id);
create index if not exists daily_logs_date_idx on daily_logs(date);

-- 週次の架電予定数
create table if not exists call_plans (
  id uuid primary key default gen_random_uuid(),
  rep_id uuid not null references reps(id) on delete cascade,
  week_start date not null,
  planned_calls int not null default 0,
  unique (rep_id, week_start)
);

-- Row Level Security
-- 社内ツールで認証は行わないため、anon キーからの読み書きを全許可する。
alter table reps enable row level security;
alter table daily_logs enable row level security;
alter table call_plans enable row level security;

create policy "reps: public select" on reps for select using (true);
create policy "reps: public insert" on reps for insert with check (true);
create policy "reps: public update" on reps for update using (true) with check (true);

create policy "daily_logs: public select" on daily_logs for select using (true);
create policy "daily_logs: public insert" on daily_logs for insert with check (true);
create policy "daily_logs: public delete" on daily_logs for delete using (true);

create policy "call_plans: public select" on call_plans for select using (true);
create policy "call_plans: public insert" on call_plans for insert with check (true);
create policy "call_plans: public update" on call_plans for update using (true) with check (true);

-- 初期メンバー(HTML版プロトタイプと同じ初期値。不要なら削除・変更してください)
insert into reps (name, month_goal, week_goal) values
  ('田尻', 20, 5),
  ('奥野', 20, 5),
  ('岡崎', 20, 5),
  ('山﨑', 20, 5),
  ('樋口', 20, 5),
  ('福島', 40, 5)
on conflict (name) do nothing;

-- リアルタイム更新(複数人での同時利用)を有効にする場合は、
-- Supabaseダッシュボードの Database > Replication で
-- reps / daily_logs / call_plans テーブルを supabase_realtime publication に追加してください。
-- もしくは以下のSQLでも設定できます。
alter publication supabase_realtime add table reps, daily_logs, call_plans;
