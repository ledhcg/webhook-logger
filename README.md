# Webhook Logger

A simple webhook logging server built with Next.js 15, TypeScript, and Supabase. It allows you to receive, log, and inspect webhook requests in real-time.

## Features

- Captures webhook POST requests
- Logs request method, headers, body, source, and path
- Real-time display of webhook logs
- Detailed view for each log entry
- Real-time updates with Supabase Realtime
- User authentication and token-based webhook access
- Filter webhook logs by specific tokens
- Built with Next.js 15, TypeScript, and Supabase

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd webhook-logger
```

2. Install dependencies:

```bash
npm install
```

3. Set up Supabase:

   - Create a new Supabase project at [https://supabase.com](https://supabase.com)
   - Create tables using the following schema:

     ```sql
     -- User webhooks tokens table (create this first)
     create table user_webhooks (
       id uuid default uuid_generate_v4() primary key,
       user_id uuid not null,
       token text not null unique,
       name text,
       created_at timestamp with time zone default now(),
       foreign key (user_id) references auth.users (id)
     );

     -- Main webhook logs table
     create table webhook_logs (
       id uuid default uuid_generate_v4() primary key,
       created_at timestamp with time zone default now(),
       method text not null,
       headers jsonb not null,
       body jsonb,
       source text,
       path text,
       user_id uuid,
       token_id uuid
     );

     -- Add foreign key constraint to user_id
     alter table webhook_logs add constraint fk_user_id foreign key (user_id) references auth.users (id);

     -- Add foreign key constraint to token_id
     alter table webhook_logs add constraint fk_token_id foreign key (token_id) references user_webhooks (id);

     -- Index to improve performance when filtering logs by token
     create index idx_webhook_logs_token_id on webhook_logs (token_id);
     ```

   - Enable Realtime for the `webhook_logs` table:
     - Go to your Supabase Dashboard
     - Navigate to Table Editor, select the "webhook_logs" table
     - Look for the "Realtime" toggle (it shows "Realtime off" by default)
     - Click to toggle it to "Realtime on"
   - Enable Row Level Security and create necessary policies (see `create_webhook_logs.sql` for details)
   - Copy your Supabase URL, anon key, and service role key to `.env.local`:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
     NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
     NEXT_PUBLIC_APP_URL=your_domain_here_or_http://localhost:3000
     ```
   - To get your service role key:
     - Go to your Supabase Dashboard
     - Navigate to Project Settings (gear icon in sidebar)
     - Select "API" from the menu
     - Find the "service_role" key in the "Project API keys" section
     - **Important:** This key has admin privileges and bypasses Row Level Security. Only use it in server-side code.

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Authentication

The application supports user accounts. Each user can create multiple webhook tokens and view only their own logs.

### Webhook Tokens

1. Create a webhook token in the dashboard
2. Use the token in your webhook requests by adding the header `X-Webhook-Token: your_token_here`
3. Filter logs by specific tokens in the dashboard

### Sending Webhooks

The application uses the `NEXT_PUBLIC_APP_URL` environment variable to determine the base URL for webhook endpoints. By default, it will use `http://localhost:3000` if not provided.

Send webhook requests to:

- `${your_domain}/api/webhook`

Only POST method is supported.

Include your token in the header:

```
X-Webhook-Token: your_token_here
```

All requests will be logged and displayed on the dashboard, filtered by the authenticated user and optionally by token.

## Example Webhook Test

You can use curl to test the webhook:

```bash
curl -X POST ${your_domain}/api/webhook \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Token: your_token_here" \
  -d '{"event":"test", "data":{"message":"Hello World"}}'
```

Where `${your_domain}` is the value of your `NEXT_PUBLIC_APP_URL` environment variable.

## License

MIT
