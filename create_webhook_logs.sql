-- Create the user_webhooks table first
create table user_webhooks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null,
  token text not null unique,
  name text,
  created_at timestamp with time zone default now(),
  foreign key (user_id) references auth.users (id)
);

-- Then create the webhook_logs table with references to user_webhooks
create table webhook_logs (id uuid default uuid_generate_v4() primary key, created_at timestamp with time zone default now(), method text not null, headers jsonb not null, body jsonb, source text, path text, user_id uuid, token_id uuid);

-- Add foreign key constraint to user_id
alter table webhook_logs add constraint fk_user_id foreign key (user_id) references auth.users (id);

-- Add foreign key constraint to token_id
alter table webhook_logs add constraint fk_token_id foreign key (token_id) references user_webhooks (id);

-- Create RLS policies to secure webhook logs
alter table webhook_logs enable row level security;
alter table user_webhooks enable row level security;

-- Policy to allow users to only see their own logs
create policy "Users can only view their own webhook logs" on webhook_logs
  for select using (auth.uid() = user_id);

-- Policy to allow webhook creation from anonymous contexts
create policy "Anyone can insert webhook logs" on webhook_logs
  for insert to anon
  with check (true);

-- Policy for user_webhooks
create policy "Users can only view their own webhook tokens" on user_webhooks
  for select using (auth.uid() = user_id);

create policy "Users can only insert their own webhook tokens" on user_webhooks
  for insert to authenticated
  with check (auth.uid() = user_id);

-- Index to improve performance when filtering logs by token
create index idx_webhook_logs_token_id on webhook_logs (token_id);
