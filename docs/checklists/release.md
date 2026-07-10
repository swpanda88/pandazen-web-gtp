# Release Checklist

When a feature branch is ready for production, follow these steps:

1. [ ] **Definition of Done**: Verify the branch passes all criteria in `docs/checklists/definition-of-done.md`.
2. [ ] **Merge**: Human merges the feature branch into `main`.
3. [ ] **Remote Migrations**: Run `npx wrangler d1 migrations apply DB --remote` to update the production database schema.
4. [ ] **Deploy**: Push to `main` (Cloudflare Pages will automatically trigger a build, or deploy manually if needed).
5. [ ] **Sanity Check**: Visit the live production site to ensure the app loads without fatal white-screens.
6. [ ] **Update Context**: Move the completed feature from `Next` to `Completed` in `docs/context/roadmap.md`.
