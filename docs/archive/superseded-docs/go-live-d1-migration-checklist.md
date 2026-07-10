# Go-live D1 Migration Checklist

This note exists so we do not forget the quote-versioning database check before PandaZen goes live with real data.

## Context

During Quote Workflow MVP testing, the preview D1 database still had this old schema:

```sql
quote_number INTEGER UNIQUE
```

That broke quote versioning because revised quotes must share the same base quote number:

```text
Q-00007/01
Q-00007/02
Q-00007/03
```

Those records all need the same `quote_number` and different `version_number` / `display_reference` values.

The correct schema is:

```sql
quote_number INTEGER
```

with `display_reference` unique.

## Before production go-live

Before connecting real PandaZen data or using the production D1 database for clients, apply migrations in order and verify the final quote schema.

Required quote migrations:

```text
0012_accounting_quote_status_fields.sql
0013_quote_number_versioning_fix.sql
```

## Verification SQL

Run this against the production D1 database after migrations:

```sql
SELECT sql
FROM sqlite_master
WHERE type IN ('table','index')
  AND (name = 'accounting_quotes' OR name LIKE '%accounting_quotes%');
```

Expected table definition must include:

```sql
quote_number INTEGER
```

It must **not** include:

```sql
quote_number INTEGER UNIQUE
```

or:

```sql
UNIQUE(quote_number)
```

Expected indexes:

```text
UNIQUE: display_reference
UNIQUE or otherwise controlled: assessment_quote_id + version_number
NORMAL/non-unique: quote_number
NORMAL/non-unique: status, lead_id, superseded_by_quote_id
```

## Functional test after migration

Use junk/test data first:

```text
1. Create or find a Q&A record with Q-xxxxx/01 marked Sent.
2. Click Create Revised Draft.
3. Confirm Q-xxxxx/02 appears as Draft.
4. Confirm Q-xxxxx/01 remains Sent or Superseded according to the current workflow.
5. Click Create Revised Draft again while /02 is still Draft.
6. Confirm it reuses the existing draft and does not create /03.
7. Mark /02 Sent.
8. Create another revised draft.
9. Confirm Q-xxxxx/03 appears as Draft.
```

## Production safety rule

For production database changes:

```text
1. Test migration on preview/dev D1 first.
2. Export/backup production D1 before applying migration.
3. Apply migration to production.
4. Run schema verification SQL.
5. Run a minimal safe smoke test.
6. Do not store real client data until Cloudflare Access/API protection is in place.
```
