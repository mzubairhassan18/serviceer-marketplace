# Serviceer - Service Marketplace

A service marketplace platform built with Next.js, Supabase, and Drizzle ORM.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** PostgreSQL (Supabase) via Drizzle ORM
- **Auth:** Supabase Auth (email/password, Google OAuth, passkeys)
- **PWA:** Service worker + install prompt + passkey support
- **Package Manager:** pnpm

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy env vars
cp .env.example .env.local
# Fill in your Supabase project credentials

# Generate & apply database migrations
pnpm db:generate
pnpm db:apply

# Start dev server
pnpm dev
```

## Project Structure

- `src/app/` — Next.js App Router pages (auth, marketplace, app, admin)
- `src/db/` — Drizzle schema and database utilities
- `src/utils/supabase/` — Supabase client helpers (server, client, middleware)
- `src/components/` — Shared UI components
- `drizzle/` — Generated SQL migration files

## Roles

- **Buyer** — Browse gigs, search, contact providers
- **Provider** — Create & manage gigs, subscribe to ad packages
- **Admin** — Approve gigs, manage users, orders, packages
