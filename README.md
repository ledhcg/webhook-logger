# Webhook Logger

A simple webhook logging server built with Next.js 15, TypeScript, and Supabase. It allows you to receive, log, and inspect webhook requests in real-time.

## Features

- Captures webhook requests (GET, POST, PUT, DELETE, PATCH)
- Logs request method, headers, body, source, and path
- Real-time display of webhook logs
- Detailed view for each log entry
- Real-time updates with Supabase Realtime
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
   - Create a table named `webhook_logs` with the following schema:
     ```sql
     create table webhook_logs (
       id uuid default uuid_generate_v4() primary key,
       created_at timestamp with time zone default now(),
       method text not null,
       headers jsonb not null,
       body jsonb,
       source text,
       path text
     );
     ```
   - Enable Realtime for the `webhook_logs` table:
     - Go to your Supabase Dashboard
     - Navigate to Table Editor, select the "webhook_logs" table
     - Look for the "Realtime" toggle (it shows "Realtime off" by default)
     - Click to toggle it to "Realtime on"
   - Copy your Supabase URL and anon key to `.env.local`:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
     NEXT_PUBLIC_APP_URL=your_domain_here_or_http://localhost:3000
     ```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

The application uses the `NEXT_PUBLIC_APP_URL` environment variable to determine the base URL for webhook endpoints. By default, it will use `http://localhost:3000` if not provided.

Send webhook requests to any of these endpoints:

- `GET ${your_domain}/api/webhook`
- `POST ${your_domain}/api/webhook`
- `PUT ${your_domain}/api/webhook`
- `DELETE ${your_domain}/api/webhook`
- `PATCH ${your_domain}/api/webhook`

All requests will be logged and displayed on the main page.

## Example Webhook Test

You can use curl to test the webhook:

```bash
curl -X POST ${your_domain}/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"event":"test", "data":{"message":"Hello World"}}'
```

Where `${your_domain}` is the value of your `NEXT_PUBLIC_APP_URL` environment variable.

## License

MIT
