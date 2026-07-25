# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, Cursor, etc.) when working with code in this repository. `CLAUDE.md` is a symlink to this file.

## Commands

```bash
npm run dev        # Next.js dev server (uses .dev.vars-style env via process.env — copy .dev.vars.example to .dev.vars)
npm run preview    # Build with OpenNext for Cloudflare and preview locally on workerd
npm run deploy     # Build and deploy to Cloudflare Workers
npm run lint       # next lint
npm run cf-typegen # Regenerate cloudflare-env.d.ts from wrangler.toml
```

There is no test suite. Production secrets are set with `wrangler secret put <NAME>`; local secrets live in `.dev.vars` (gitignored, see `.dev.vars.example` for the full list: `DATABASE_URL`, `CLOUDINARY_*`, `RESEND_API_KEY`, `ADMIN_USERNAME`/`ADMIN_PASSWORD`).

## Architecture

Next.js 16 (App Router, JSX not TypeScript) deployed to **Cloudflare Workers via @opennextjs/cloudflare** (`wrangler.toml`, `open-next.config.ts`). Data lives in **Neon Postgres** (`@neondatabase/serverless`), images in **Cloudinary**, email via **Resend**.

### The monolith component

Almost the entire UI — admin dashboard AND public booking flow — is one ~13k-line client component: `components/html-source/collaburo-html-app.jsx`. It originated as an HTML prototype (see `docs/archived/Mock UI/`) and is loaded with `ssr: false` via `collaburo-html-loader.jsx`. The App Router pages (`app/page.jsx`, `app/book/page.jsx`, `app/admin/[section]/page.jsx`) are thin shells that render this loader; routing inside the admin area is handled by the component itself with `history.pushState`, with `lib/navigation.js` validating section slugs server-side.

`publicMode` is derived from `window.location.pathname` (`/` and `/book` are the client-facing booking flow; everything else is admin). `middleware.js` enforces security for both `/admin/*` and `/api/*`: HTTP Basic auth on admin pages (fail-closed — 503 if `ADMIN_PASSWORD` unset in production; bypassed in `next dev` when no password is set), a signed session cookie so the admin SPA's `fetch()` calls authenticate, default-deny on all API routes except the two public ones (`GET /api/admin-state` — sanitized, and `POST /api/submissions`), and best-effort per-IP rate limiting. Route handlers trust the `x-collaburo-admin` header only because middleware strips any client-sent copy. See `docs/LAUNCH-CHECKLIST.md` for the account-level steps (Cloudflare WAF rules, Neon backups).

Supporting files in `components/html-source/`: `app-data.js` (sample steps/fields/rooms seed data), `tweaks.jsx` (design-tweak panel + form controls), `icons.jsx`, `runtime-widgets.jsx`, `navigation.js`. Several of these attach globals to `window` — the component relies on browser-only execution.

### Persistence model (read this before touching save/load)

State is persisted in **both localStorage and the database**, and the sync logic is fragile:

- localStorage keys are versioned constants near line ~10633 of `collaburo-html-app.jsx` (`collaburo.admin.workflow.v15`, `collaburo.admin.rentalsCatalog.v13`, pricing/siteSettings/progress/activityHistory keys, plus `collaburo.client.bookingDraft.v1` for the public flow).
- On mount, the app loads from localStorage, then fetches `/api/admin-state` and **replaces local state with the database payload** — unless the local `savedAt` timestamp is newer than the DB's by >2 minutes (guard at ~line 12318; a past production data-loss incident came from this overwrite). Preserve or strengthen this guard when changing load behavior.
- Saving writes to localStorage and PUTs the full state blob to `/api/admin-state` (via `putAdminStateToDatabase`, which sends `baseUpdatedAt` for optimistic concurrency — the server returns 409 on stale writes), uploading embedded data-URL images to Cloudinary first via `/api/uploads/images`.

### API routes (`app/api/`)

All routes degrade gracefully when env vars are missing — `admin-state` and `submissions` fall back to in-memory storage when `DATABASE_URL` is unset (so local dev "works" without persisting). Keep this dual-mode pattern when modifying them.

- `admin-state` — single-row JSONB blob in `collaburo_app_config` (key `"default"`); GET (strips `progressRecords` PII unless the request is admin-authenticated) / PUT (rejects stale writes with 409 via `baseUpdatedAt`)
- `submissions` — client booking submissions into `collaburo_submissions`, deduped via a server-computed `fingerprint` hash (email + space + date + total); duplicates return `{ duplicate: true }`
- `uploads/images` — signed Cloudinary upload from a data URL
- `send-email` — Resend-backed email send

DB schema is `db/schema.sql` (applied manually; no migration tooling). A production state snapshot backup lives in `docs/backups/`.
