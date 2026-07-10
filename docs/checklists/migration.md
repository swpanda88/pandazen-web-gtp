# Migration Checklist

When modifying the database schema, strictly follow these steps:

1. [ ] **Verify Current Schema**: Inspect existing `migrations/*.sql` files to ensure the column/table doesn't already exist under a different name.
2. [ ] **Create Local File**: Manually create `migrations/XXXX_descriptive_name.sql` using the next sequential number.
3. [ ] **Immutable Migrations**: Never modify an existing `.sql` file that has already been applied remotely. Always create a new file that `ALTER`s the table.
4. [ ] **Write SQL**: Use raw D1/SQLite syntax.
5. [ ] **Apply Locally**: Run `npx wrangler d1 migrations apply DB --local`.
6. [ ] **Test Locally**: Verify the UI and API continue to function as expected with the new schema in place locally.
7. [ ] **Remote Application**: Only a human can apply migrations remotely to production. An agent should never run `--remote` unless explicitly authorized.
