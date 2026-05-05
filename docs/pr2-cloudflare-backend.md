# PR2 Cloudflare Backend Setup

This PR adds the first Panda Zen backend foundation:

- Cloudflare Pages Functions in `/functions/api`
- D1 schema migrations in `/migrations`
- Demo seed data
- Admin UI that uses `/api/*` when deployed
- Local fallback data when opened from disk

## Cloudflare Dashboard Steps

1. Create a D1 database called `pandazen`.
2. In the Pages project, add a D1 binding:
   - Variable name: `DB`
   - D1 database: `pandazen`
3. Redeploy the Pages project after adding the binding.

## Apply Migrations

If using Wrangler locally, update `wrangler.toml` with the real `database_id`, then run:

```bash
wrangler d1 migrations apply pandazen --remote
```

Apply both migrations:

- `0001_initial.sql`
- `0002_seed_demo.sql`

## Admin App Behaviour

- Local file preview uses fake data.
- Deployed Cloudflare preview tries `/api/options`, `/api/leads`, `/api/jobs`, etc.
- If the D1 binding is missing, the admin screen falls back to demo data and shows a warning.

## API Routes Added

```text
GET  /api/options
POST /api/options
GET  /api/dashboard
GET  /api/leads
POST /api/leads
PATCH /api/leads/:id
GET  /api/assessments
POST /api/assessments
GET  /api/clients
POST /api/clients
GET  /api/jobs
POST /api/jobs
PATCH /api/jobs/:id
PATCH /api/checklist/:id
POST /api/generate-jobs
GET  /api/invoices
POST /api/invoices
GET  /api/export/:type
```
