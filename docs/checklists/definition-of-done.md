# Definition of Done

A feature, bugfix, or task is "Done" when:

1. [ ] **Code Completeness**: All requirements specified in the Feature Doc or prompt have been met.
2. [ ] **UI Integrity**: No approved CSS layouts have been broken. Placeholders exist for unimplemented backend wiring.
3. [ ] **API Standards**: Any new API endpoints match `05-api-standards.md` (e.g., standard `{ok, data}` JSON envelope).
4. [ ] **DB Migrations**: Any schema changes are captured in an ordered local `.sql` migration file.
5. [ ] **Error Handling**: `try/catch` is implemented. API failures surface graceful toast errors to the UI without crashing the client state.
6. [ ] **No Dead Ends**: The UI correctly recovers or returns to a stable view after a failure.
7. [ ] **Documentation**: The respective `docs/features/` document has been updated to reflect the new "Current State".
8. [ ] **Peer Reviewed**: Codex has reviewed the branch and found no regressions.
9. [ ] **Hygiene**: No temporary scratch files, seed scripts, or wrangler log files are staged in Git.
