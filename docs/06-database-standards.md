# 06: Database Standards

PandaZen uses Cloudflare D1 (SQLite) as the primary database.

## 1. Migrations
- All database schema changes MUST be tracked via SQL migration files in the `migrations/` directory.
- Migrations must be strictly ordered (e.g., `0001_...`, `0002_...`).
- Once a migration is committed and merged, **it cannot be modified**. To change the schema, you must write a new migration that alters the existing tables.
- See `docs/checklists/migration.md` for the exact local and remote application steps.

## 2. Table Design
- Use `id TEXT PRIMARY KEY` with UUIDs (e.g., `cust-123e4567...`, `req-987...`) rather than auto-incrementing integers. This makes client-side generation and distributed syncing easier.
- Use `created_at DATETIME DEFAULT CURRENT_TIMESTAMP` and `updated_at DATETIME DEFAULT CURRENT_TIMESTAMP` on all major tables.
- Foreign keys should strictly enforce relationships (e.g., `ON DELETE CASCADE` or `ON DELETE RESTRICT`) based on business logic.

## 3. Data Types
- SQLite does not have strict booleans. Use `INTEGER` (0 or 1).
- SQLite does not have strict enums. Use `TEXT` with a `CHECK (column_name IN ('val1', 'val2'))` constraint.

## 4. Querying
- Always use parameterized queries (e.g., `.bind(...)`) to prevent SQL injection.
- Centralize queries in `functions/db/` so they can be reused across different API routes.
- When selecting rows, use a mapping function (e.g., `mapCustomerRow`) to convert `snake_case` DB columns into `camelCase` JS objects.

## 5. Avoid Premature Normalization
- Flat fields on a parent table are preferred over joining to a metadata table if the data is purely 1-to-1 (e.g., putting `billing_address` directly on `customers` rather than forcing it into `customer_addresses` if the UI only manages a single flat billing string).
