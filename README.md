# Smart Bookmark

A simple, real-time bookmark manager built with Next.js (App Router), Supabase, and Tailwind CSS.

## Live URL

> **Deployed on Vercel:** _(URL will be available after publishing)_

## Features

- **Google OAuth login** -- Sign in with your Google account (no email/password)
- **Add bookmarks** -- Save any URL with a custom title
- **Private bookmarks** -- Each user can only see their own bookmarks (enforced by Row Level Security)
- **Real-time sync** -- Open two tabs and add a bookmark in one; it appears in the other instantly via Supabase Realtime
- **Delete bookmarks** -- Remove bookmarks you no longer need

## Tech Stack

| Layer      | Technology                        |
| ---------- | --------------------------------- |
| Framework  | Next.js 16 (App Router)          |
| Auth       | Supabase Auth (Google OAuth)      |
| Database   | Supabase (PostgreSQL)             |
| Realtime   | Supabase Realtime (Postgres CDC)  |
| Styling    | Tailwind CSS                      |
| Deployment | Vercel                            |

## Architecture

```
app/
  page.tsx                  -- Landing page with Google sign-in (redirects to /dashboard if logged in)
  dashboard/page.tsx        -- Protected bookmark manager (server component fetches initial data)
  auth/callback/route.ts    -- OAuth callback handler (exchanges code for session)
  auth/error/page.tsx       -- Auth error fallback page
  actions/auth.ts           -- Server actions for sign-in and sign-out
components/
  google-sign-in-button.tsx -- Client component for Google OAuth trigger
  add-bookmark-form.tsx     -- Client component for adding bookmarks
  bookmark-list.tsx         -- Client component with real-time subscription
  user-nav.tsx              -- User avatar, name, and sign-out button
lib/supabase/
  client.ts                 -- Browser Supabase client (for client components)
  server.ts                 -- Server Supabase client (for server components / actions)
  middleware.ts             -- Middleware session refresh logic
middleware.ts               -- Root middleware (protects /dashboard route)
```

## Database Schema

```sql
CREATE TABLE public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Row Level Security Policies

- **SELECT**: Users can only view their own bookmarks (`auth.uid() = user_id`)
- **INSERT**: Users can only insert bookmarks for themselves (`auth.uid() = user_id`)
- **DELETE**: Users can only delete their own bookmarks (`auth.uid() = user_id`)

### Realtime

The `bookmarks` table is added to the `supabase_realtime` publication so INSERT and DELETE events are broadcast to connected clients.

## How Real-Time Works

1. The dashboard page (server component) fetches the initial list of bookmarks on page load.
2. The `BookmarkList` client component subscribes to Supabase Realtime `postgres_changes` on the `bookmarks` table.
3. When a bookmark is added or deleted (even from another tab/device), the subscription callback updates the local state instantly -- no page refresh needed.

## Problems I Ran Into and How I Solved Them

### 1. OAuth Redirect URL Mismatch

**Problem:** Google OAuth requires exact redirect URIs. During development, the callback URL didn't match what was configured in the Supabase dashboard, causing `redirect_uri_mismatch` errors.

**Solution:** I used the request `origin` and `x-forwarded-host` headers in the server action to dynamically construct the correct redirect URL (`/auth/callback`). This ensures it works in both local development and production on Vercel without hardcoding URLs.

### 2. RLS Blocking Realtime Events

**Problem:** Supabase Realtime respects Row Level Security. Initially, the real-time subscription wasn't receiving events because the client wasn't properly authenticated when subscribing.

**Solution:** The browser Supabase client (`createBrowserClient` from `@supabase/ssr`) automatically uses the session cookies set by middleware. As long as the middleware refreshes the session on each request, the Realtime subscription authenticates correctly and only receives events for the current user's bookmarks.

### 3. Middleware Session Refresh

**Problem:** Supabase auth tokens expire. Without middleware to refresh them, users would get randomly logged out, and server components would fail to fetch data.

**Solution:** I implemented the recommended `updateSession` middleware pattern from Supabase docs. It runs on every request, refreshes the token if needed, and ensures both server and client components have a valid session.

### 4. Duplicate Bookmarks in Real-Time

**Problem:** When adding a bookmark, both the optimistic local insert and the Realtime subscription callback could add the same bookmark, causing duplicates.

**Solution:** In the Realtime INSERT handler, I check if the bookmark already exists in the local state by ID before adding it: `if (prev.some((b) => b.id === newBookmark.id)) return prev`.

### 5. Deploying on Vercel with Environment Variables

**Problem:** The app requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to be available at build time since they're used in client-side code.

**Solution:** These are automatically injected by the Supabase integration on Vercel. I also ensured the Google OAuth redirect URI in Supabase Auth settings includes the production Vercel URL (e.g., `https://<project>.vercel.app/auth/callback`).

## Local Development

```bash
# Install dependencies
pnpm install

# Set environment variables (or use Vercel integration)
cp .env.example .env.local

# Run development server
pnpm dev
```

### Required Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Setup

1. Enable Google Auth provider in Supabase Dashboard > Authentication > Providers
2. Add your Google OAuth Client ID and Secret
3. Add the redirect URL: `https://<your-domain>/auth/callback`
