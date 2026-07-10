# Review Checklist

This checklist is used by Codex (or human reviewers) to validate a PR/branch before merging.

1. [ ] **Scope Containment**: Did the author only touch files relevant to the stated task? Are there random formatting changes in unrelated files?
2. [ ] **UI Integrity**: Was the approved visual design preserved?
3. [ ] **Data Flow**: Is data correctly mapped from the DOM (`value('id')`) to the API payload, to the D1 query parameters, and back?
4. [ ] **SQL Injection**: Are all database inputs properly parameterized (`.bind(...)`)?
5. [ ] **XSS Prevention**: Are all user-supplied strings properly escaped (`escapeHtml()`) before being injected via JS template literals?
6. [ ] **Rule Alignment**: Does this change adhere to `01-project-principles.md`? Does it duplicate logic that already existed?
7. [ ] **Documentation Sync**: Were the relevant `docs/features/` updated to reflect the new state of the app?
