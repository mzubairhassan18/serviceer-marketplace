# AGENTS.md — Serviceer Marketplace

## Component Architecture
- Always create reusable components in `src/components/`. Never inline complex UI in page files.
- Separate concerns: page files fetch data and compose layout; components handle UI and client interaction.
- Server components fetch data. Client components handle state, events, and browser APIs.

## Styling
- Use CSS custom properties from `globals.css` for all colors. Never hardcode hex values in components.
- Prefer inline styles with CSS variables for consistency. No Tailwind utility classes for new components.

## State & Data
- Server actions in `actions.ts` files handle mutations. Client components call them — never use `createClient` in client code for writes.
- All tables must have RLS policies. Never assume a table is accessible without explicit policies.

## UX Patterns
- Every async button must show a loading spinner and be disabled while processing to prevent duplicate submissions.
- Use button groups (not native radios) for filter controls on table views.
- Navigation between pages should show the top progress bar.
- All tabular data (orders, gigs, users) should have filter controls for key columns like status.

## Code Quality
- Prefer small, focused files. If a component exceeds 150 lines, split it.
- No default exports for components used in more than one place.
- Use TypeScript interfaces in `src/lib/types.ts` for shared types. Never use `any` for API responses.
