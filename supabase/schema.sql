create table if not exists reservations (
  session_id text primary key,
  cancel_token text unique not null,
  status text not null,
  created_at timestamptz not null default now(),
  email_sent boolean not null default false,
  p24_order_id bigint,
  customer jsonb not null,
  event jsonb not null,
  items jsonb not null,
  total_pln integer not null,
  amount_grosze integer not null,
  date_from date not null,
  date_to date not null
);

alter table reservations enable row level security;
