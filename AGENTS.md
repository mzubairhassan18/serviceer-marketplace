# AGENTS.md — Serviceer Marketplace

## Project Identity
- **Name**: serviceer-marketplace
- **Repo**: `mzubairhassan18/serviceer-marketplace.git` on GitHub
- **Deploy**: Vercel (auto-deploys on push to `main`)
- **Live URL**: `https://serviceer-marketplace.vercel.app`
- **Supabase project**: `mzwnmdeivqlkriicclxd` at `https://mzwnmdeivqlkriicclxd.supabase.co`
- **Stack**: Next.js 16.2.10, React 19, TypeScript, pnpm 10.17.1, Tailwind v4, Supabase (Auth + PostgreSQL), Drizzle ORM, Lucide icons
- **IMPORTANT**: Do NOT confuse with `D:\planisher` (mzubairhassan18/planisher.git) — that is a separate project.

## Architecture Overview
This is a **service marketplace** where:
- **Buyers** search for services, place orders, chat with providers, leave reviews
- **Providers** create gigs, subscribe to ad packages, boost gigs, manage orders
- **Admin** manages users, gigs, boosts, orders, disputes, packages, analytics, audit log

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://mzwnmdeivqlkriicclxd.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable__uiRhNhoxzhKNNLH1FS2xg_t6P9Vh5K
NEXT_PUBLIC_SITE_URL=https://serviceer-marketplace.vercel.app
DATABASE_URL=postgresql://postgres:g7NPsbvaveyGtNOB@db.mzwnmdeivqlkriicclxd.supabase.co:5432/postgres
```
- `DATABASE_URL` is used by Drizzle migrations only (not by the app at runtime)
- Vercel env vars are set in the Vercel dashboard, not in `.env.local`

## Database
- Supabase hosted PostgreSQL at `db.mzwnmdeivqlkriicclxd.supabase.co:5432/postgres`
- Schema defined in `src/db/schema.ts` (Drizzle ORM)
- Migrations in `drizzle/` directory
- All tables have RLS enabled with explicit policies
- Prices stored in **paisa** (PKR × 100). `formatPrice()` in `src/lib/format.ts` divides by 100.

### Tables
| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (name, email, phone, role, avatar). Role: buyer/provider/admin |
| `gigs` | Service listings. Status: draft/pending/approved/rejected/archived |
| `gig_tags` | Searchable tags per gig |
| `gig_media` | Media files per gig |
| `ad_packages` | Subscription packages (name, price, duration, max_gigs) |
| `provider_subscriptions` | Provider's active package subscriptions |
| `gig_boosts` | Boost requests (pending/approved/rejected) |
| `orders` | Orders between buyer and provider. 11 statuses |
| `messages` | Chat messages within orders |
| `reviews` | Buyer reviews (1-5 stars, one per order) |
| `provider_profiles` | Extended provider info (bio, skills, experience) |
| `notifications` | User notifications with read status |
| `audit_events` | Admin action log (who did what, when) |
| `order_status_history` | Status transition history for orders |

### Order Status Flow
`inquiry → offered → accepted → in_progress → delivered → payment_received → completed`
- `disputed` can be raised from any active status
- `dispute_resolved` / `dispute_closed` = admin resolution
- `cancelled` at any point

## File Structure
```
src/
├── app/
│   ├── layout.tsx              # Root layout (ThemeProvider, Header, NotificationBell)
│   ├── page.tsx                # Home page (fetches all gigs, passes to client)
│   ├── globals.css             # All CSS (Tailwind v4, theme vars, all component styles)
│   ├── admin/
│   │   ├── layout.tsx          # Admin layout (wraps in AdminShell)
│   │   ├── dashboard/page.tsx  # Stats overview
│   │   ├── gigs/page.tsx       # Gigs + Boosts (combined, tabs)
│   │   ├── orders/page.tsx     # Orders + Packages (combined, tabs)
│   │   ├── users/page.tsx      # User management
│   │   ├── analytics/page.tsx  # Revenue, subscriptions, monthly breakdown
│   │   ├── audit/page.tsx      # Audit log
│   │   └── packages/actions.ts # Package CRUD server actions
│   ├── app/
│   │   ├── layout.tsx          # Provider layout (AppShell sidebar)
│   │   ├── dashboard/page.tsx  # Provider dashboard
│   │   ├── gigs/               # Gig CRUD (create, edit, list)
│   │   ├── orders/             # Order list, detail, chat, review, dispute
│   │   ├── messages/           # Order chat
│   │   ├── notifications/      # All notifications
│   │   ├── packages/           # Browse & subscribe to packages
│   │   ├── profile/            # Provider profile edit
│   │   └── settings/           # User settings
│   ├── auth/                   # Sign in, sign up, forgot password, callback
│   ├── contact/                # Order placement (placeOrderAction)
│   ├── gigs/[gigId]/           # Public gig detail page
│   ├── providers/[providerId]/ # Public provider profile
│   └── search/                 # Redirects to home with params
├── components/
│   ├── admin/
│   │   ├── admin-shell.tsx     # Admin sidebar (keyboard nav, 5 menu items)
│   │   ├── admin-table-view.tsx # Reusable table/grid with search + toggle
│   │   ├── admin-gigs-client.tsx    # Gigs + Boosts tabs
│   │   ├── admin-orders-client.tsx  # Orders + Packages tabs
│   │   ├── admin-users-client.tsx   # Users with grid view
│   │   ├── admin-packages-client.tsx # Package cards with inline edit
│   │   └── admin-audit-client.tsx   # Audit log with grid view
│   ├── layout/app-shell.tsx    # Provider sidebar nav
│   ├── orders/
│   │   ├── order-chat.tsx      # Chat with sender name/icon/role badges
│   │   └── status-timeline.tsx # Status history timeline
│   ├── gig-card.tsx            # Reusable gig card (grid/list, featured styling)
│   ├── hero-search.tsx         # Hero search with category dropdown
│   ├── home-page-client.tsx    # Home page client (search, filter, categories)
│   ├── notification-bell.tsx   # Header notification dropdown
│   ├── notifications-list.tsx  # Full notifications page
│   ├── theme-provider.tsx      # Dark/light context with localStorage
│   ├── theme-toggle.tsx        # Sun/moon toggle
│   ├── header-search.tsx       # Header search (hidden on home)
│   ├── navigation-progress.tsx # Click-based URL polling progress bar
│   ├── filter-bar.tsx          # Button group filters
│   ├── view-toggle.tsx         # Grid/list toggle
│   ├── loading-button.tsx      # Reusable spinner button
│   └── gig-boost-button.tsx    # Boost request UI
├── lib/
│   ├── format.ts               # formatPrice(paisa) helper
│   ├── notify.ts               # Notification creation helper
│   ├── audit.ts                # Audit event logging helper
│   └── types.ts                # All TypeScript interfaces
├── db/
│   └── schema.ts               # Drizzle schema (all tables)
├── utils/
│   └── supabase/               # Supabase client helpers (server/client)
└── middleware.ts               # Auth middleware
```

## Routing
| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Home page with hero search, all gigs, category groups |
| `/gigs/[gigId]` | Public | Gig detail with reviews, provider info |
| `/providers/[providerId]` | Public | Provider public profile |
| `/sign-in`, `/sign-up` | Public | Auth pages |
| `/app` | Provider | Provider dashboard |
| `/app/gigs` | Provider | My gigs list |
| `/app/gigs/create` | Provider | Create new gig |
| `/app/gigs/[gigId]/edit` | Provider | Edit gig |
| `/app/orders` | Provider | My orders (buyer or provider side) |
| `/app/orders/[orderId]` | Provider | Order detail, chat, review, dispute |
| `/app/messages` | Provider | Messages overview |
| `/app/messages/[orderId]` | Provider | Order chat |
| `/app/packages` | Provider | Browse & subscribe to packages |
| `/app/notifications` | Provider | All notifications |
| `/app/profile` | Provider | Edit provider profile |
| `/admin` | Admin | Redirects to dashboard |
| `/admin/dashboard` | Admin | Stats overview |
| `/admin/gigs` | Admin | Gigs + Boosts (tabs) |
| `/admin/orders` | Admin | Orders + Packages (tabs) |
| `/admin/users` | Admin | User management |
| `/admin/analytics` | Admin | Revenue, subscriptions, monthly data |
| `/admin/audit` | Admin | Audit log |
| `/admin/packages` | Admin | Package management (price editing) |

## Key Patterns
- **Server components** fetch data, **client components** handle UI interaction
- **Server actions** in `actions.ts` files handle all mutations
- **RLS policies** on every table — never assume table access
- **Notifications** created via `src/lib/notify.ts` for all state changes
- **Audit logging** via `src/lib/audit.ts` for all admin actions
- **CSS variables** for all colors — never hardcode hex in components
- **formatPrice()** for all price display (paisa → PKR)
- **Status history** tracked in `order_status_history` for every status change

## Admin Keyboard Shortcuts
- `D` → Dashboard
- `G` → Gigs & Boosts
- `O` → Orders & Packages
- `U` → Users
- `A` → Analytics
- `/` → Focus search box

## Coding Standards
1. Reusable components go in `src/components/`. Never inline complex UI in page files.
2. Use CSS variables from `globals.css` for all colors. No hardcoded hex.
3. Every async button must show a loading spinner and be disabled while processing.
4. Prefer small, focused files. Split components over 150 lines.
5. Use TypeScript interfaces in `src/lib/types.ts` for shared types.
6. All tabular data must have filter controls for status columns.
7. Server components fetch data. Client components handle state and events.
8. All mutations go through server actions, not client-side DB calls.

## Deployment
- **GitHub**: Push to `main` → Vercel auto-deploys
- **Build**: `pnpm build` (Turbopack)
- **Vercel config**: `vercel.json` with `pnpm install` + `pnpm next build`
- **Middleware**: Auth middleware in `src/middleware.ts`
- **Domain**: `serviceer-marketplace.vercel.app`

## Known Issues
- Supabase Auth Site URL must be set to `https://serviceer-marketplace.vercel.app` in Supabase Dashboard → Authentication → URL Configuration
- `/search` and `/gigs` redirect to home page (search is inline on home)
