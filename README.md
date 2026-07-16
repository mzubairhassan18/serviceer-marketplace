# Serviceer — Service Marketplace

A full-stack service marketplace platform where buyers find service providers, place orders, chat, leave reviews, and admin manages the entire ecosystem.

**Live**: [serviceer-marketplace.vercel.app](https://serviceer-marketplace.vercel.app)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.10 (App Router, Turbopack) |
| Language | TypeScript 5 |
| UI | React 19, Lucide icons, CSS custom properties |
| Styling | Tailwind CSS v4 (base) + inline styles with CSS variables |
| Database | PostgreSQL (Supabase hosted) |
| ORM | Drizzle ORM 0.45 |
| Auth | Supabase Auth (email/password) |
| State | Server Actions + React state |
| Package Manager | pnpm 10.17.1 |
| Deployment | Vercel (auto-deploy from GitHub) |

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Generate database migrations
pnpm db:generate

# Apply migrations to Supabase
pnpm db:apply

# Start development server
pnpm dev
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
```

- `NEXT_PUBLIC_*` — Used by both browser and server
- `DATABASE_URL` — Used only by Drizzle migrations (not at runtime)

## Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `profiles` | User profiles (name, email, phone, role: buyer/provider/admin) |
| `gigs` | Service listings (title, description, category, price, status, featured_until) |
| `gig_tags` | Searchable tags per gig |
| `gig_media` | Media files per gig |
| `ad_packages` | Subscription packages (name, price in paisa, duration, max_gigs) |
| `provider_subscriptions` | Provider's active package subscriptions |
| `gig_boosts` | Boost requests (pending/approved/rejected) |
| `orders` | Orders between buyer and provider (11 statuses) |
| `messages` | Chat messages within orders |
| `reviews` | Buyer reviews (1-5 stars, one per order) |
| `provider_profiles` | Extended provider info (bio, skills, experience) |
| `notifications` | User notifications with read status |
| `audit_events` | Admin action log |
| `order_status_history` | Status transition history |

### Order Status Flow

```
inquiry → offered → accepted → in_progress → delivered → payment_received → completed
                                     ↓
                              disputed → dispute_resolved / dispute_closed
                                     ↓
                              cancelled
```

### Price Convention

All prices are stored in **paisa** (PKR × 100). Use `formatPrice()` from `src/lib/format.ts` to display:

```typescript
formatPrice(15000) // "Rs. 150"
```

## Project Structure

```
serviceer-marketplace/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (ThemeProvider, Header)
│   │   ├── page.tsx                # Home page (hero search, all gigs)
│   │   ├── globals.css             # All CSS (themes, components, layout)
│   │   ├── admin/                  # Admin panel
│   │   │   ├── layout.tsx          # Admin layout (AdminShell sidebar)
│   │   │   ├── dashboard/          # Stats overview
│   │   │   ├── gigs/               # Gigs + Boosts (combined, tabs)
│   │   │   ├── orders/             # Orders + Packages (combined, tabs)
│   │   │   ├── users/              # User management
│   │   │   ├── analytics/          # Revenue & subscription analytics
│   │   │   ├── audit/              # Audit log
│   │   │   └── packages/           # Package management
│   │   ├── app/                    # Provider panel
│   │   │   ├── layout.tsx          # Provider layout (AppShell sidebar)
│   │   │   ├── gigs/               # Gig CRUD
│   │   │   ├── orders/             # Orders, chat, reviews, disputes
│   │   │   ├── messages/           # Order chat
│   │   │   ├── notifications/      # Notifications
│   │   │   ├── packages/           # Subscribe to packages
│   │   │   ├── profile/            # Provider profile
│   │   │   └── settings/           # User settings
│   │   ├── auth/                   # Auth pages
│   │   ├── contact/                # Order placement
│   │   ├── gigs/[gigId]/           # Public gig detail
│   │   └── providers/[providerId]/ # Public provider profile
│   ├── components/
│   │   ├── admin/                  # Admin UI components
│   │   ├── layout/                 # AppShell (provider sidebar)
│   │   ├── orders/                 # Order chat, status timeline
│   │   └── [shared components]     # GigCard, HeroSearch, etc.
│   ├── lib/
│   │   ├── format.ts               # formatPrice() helper
│   │   ├── notify.ts               # Notification creation
│   │   ├── audit.ts                # Audit event logging
│   │   └── types.ts                # TypeScript interfaces
│   ├── db/
│   │   └── schema.ts               # Drizzle schema (all tables)
│   └── utils/supabase/             # Supabase client helpers
├── drizzle/                        # SQL migration files
├── public/                         # Static assets
├── AGENTS.md                       # AI agent instructions
└── vercel.json                     # Vercel deployment config
```

## Features

### Buyer
- Search services by keyword and category (inline on home page)
- Browse all gigs with grid/list view toggle
- View gig details with provider info, reviews, ratings
- Place orders with custom messages
- Chat with providers in real-time
- Track order status with timeline
- Leave reviews after order completion
- Receive notifications for order updates

### Provider
- Create and manage gigs (with category, tags, pricing)
- Subscribe to ad packages for gig boosting
- Request gig boosts (admin approval required)
- Manage orders (accept, deliver, complete)
- Chat with buyers and admin
- Edit provider profile (bio, skills, experience)
- View notifications

### Admin
- **Dashboard**: Stats overview (users, gigs, orders, disputes, boosts)
- **Gigs & Boosts**: Combined view with tabs, approve/reject actions
- **Orders & Packages**: Combined view with tabs, dispute resolution
- **Users**: User management with role display
- **Analytics**: Revenue from packages, monthly breakdown, subscription stats
- **Audit Log**: Complete history of all admin actions
- **Package Management**: Edit package prices, descriptions, durations inline

### Keyboard Shortcuts (Admin)
| Key | Action |
|-----|--------|
| `D` | Dashboard |
| `G` | Gigs & Boosts |
| `O` | Orders & Packages |
| `U` | Users |
| `A` | Analytics |
| `/` | Focus search box |

## UI System

### Theme
- Light and dark mode via `data-theme` attribute on `<html>`
- CSS custom properties for all colors (no hardcoded hex in components)
- Soft dark colors (no pure black)
- Theme persisted in localStorage

### Components
| Component | Location | Purpose |
|-----------|----------|---------|
| `GigCard` | `src/components/gig-card.tsx` | Reusable gig card (grid/list, featured) |
| `AdminTableView` | `src/components/admin/admin-table-view.tsx` | Table/grid with search + toggle |
| `FilterBar` | `src/components/filter-bar.tsx` | Button group filters |
| `ViewToggle` | `src/components/view-toggle.tsx` | Grid/list switcher |
| `LoadingButton` | `src/components/loading-button.tsx` | Spinner button |
| `HeroSearch` | `src/components/hero-search.tsx` | Hero search with category dropdown |
| `NotificationBell` | `src/components/notification-bell.tsx` | Header notification dropdown |
| `ThemeToggle` | `src/components/theme-toggle.tsx` | Sun/moon theme switch |
| `NavigationProgress` | `src/components/navigation-progress.tsx` | URL polling progress bar |
| `OrderChat` | `src/components/orders/order-chat.tsx` | Chat with sender identification |
| `StatusTimeline` | `src/components/orders/status-timeline.tsx` | Order status history |

## Server Actions

All mutations go through server actions in `actions.ts` files:

| Action File | Key Actions |
|-------------|-------------|
| `src/app/admin/gigs/actions.ts` | `approveGigAction`, `rejectGigAction` |
| `src/app/admin/boosts/actions.ts` | `approveBoostAction`, `rejectBoostAction` |
| `src/app/admin/orders/actions.ts` | `resolveDisputeAction`, `closeDisputeAction`, `adminUpdateOrderStatusAction` |
| `src/app/admin/packages/actions.ts` | `updatePackageAction` |
| `src/app/app/orders/actions.ts` | `updateOrderStatus`, `raiseDispute`, `sendOffer` |
| `src/app/app/messages/actions.ts` | `sendMessageAction` |
| `src/app/app/gigs/create/actions.ts` | `createGigAction` |
| `src/app/contact/actions.ts` | `placeOrderAction` |
| `src/app/app/packages/actions.ts` | `subscribeAction` |

## Deployment

### Vercel
- **Repo**: `mzubairhassan18/serviceer-marketplace.git`
- **Branch**: `main` (auto-deploys on push)
- **Build**: `pnpm install` → `pnpm next build`
- **Framework**: Next.js (detected automatically)

### Supabase
- **Project**: `mzwnmdeivqlkriicclxd`
- **URL**: `https://mzwnmdeivqlkriicclxd.supabase.co`
- **Dashboard**: `https://supabase.com/dashboard/project/mzwnmdeivqlkriicclxd`

### GitHub
- **Repo**: `https://github.com/mzubairhassan18/serviceer-marketplace`
- **Auto-deploy**: Push to `main` triggers Vercel deployment

## Development Commands

```bash
pnpm dev          # Start development server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm typecheck    # TypeScript type checking
pnpm db:generate  # Generate Drizzle migrations
pnpm db:apply     # Apply migrations to Supabase
```

## Known Issues

1. **Auth Site URL**: Must be set to `https://serviceer-marketplace.vercel.app` in Supabase Dashboard → Authentication → URL Configuration
2. **`/search` and `/gigs`**: Redirect to home page (search is inline on home)
3. **`/admin/boosts`**: Standalone page removed, merged into `/admin/gigs` as a tab
4. **`/admin/packages`**: Standalone page removed, merged into `/admin/orders` as a tab
