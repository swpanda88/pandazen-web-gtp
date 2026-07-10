# 00: PandaZen Operating Manual (AI Developer README)

Welcome to PandaZen! This document answers one question: **"How do AI agents work on PandaZen?"**
Read this document FIRST.

## Core Mandates
1. **Never touch the public site**: This repository (`pandazen-web-gtp`) handles CleanOps (internal admin CRM and Field Service). Do not deploy to or modify the temporary public website.
2. **Never redesign the UI unless instructed**: We preserve the approved, functional vanilla CSS UI. We do not switch to Tailwind, React, or modern SPA frameworks.
3. **No new rules in prompts**: If you (AG or Codex) discover a recurring project rule, propose adding it to `01-project-principles.md`. Do not invent temporary rules inside conversational prompts.
4. **Use Pointer Prompts**: Read these permanent docs instead of asking the user to copy-paste architecture into the prompt.
5. **Check `docs/context/` for what's next**: Never ask "what feature should I build next?". Read `docs/context/priorities.md`.

## Documentation Hierarchy
When information exists in multiple places, the following precedence applies:
1. ADRs (accepted architectural decisions)
2. Project Principles
3. Architecture & Standards
4. Feature documentation
5. Context documents
6. Current prompt

## Agent Responsibilities
To minimise overlap and reduce duplicated effort, we strictly enforce these roles:

### AG (The Builder)
- Implementation and refactoring
- Authoring and updating this permanent documentation
- Running local tests and fixing immediate failures
- Making granular, descriptive Git commits
- *Does not merge.*

### Codex (The Reviewer)
- Peer review and challenging AG's assumptions
- Regression testing and verification
- Validating the Definition of Done (`docs/checklists/definition-of-done.md`)
- Recommending merges or finding logical holes

### ChatGPT (The Architect)
- Architecture, high-level planning, and product decisions
- Prompt generation and technical discussions
- Discussing open decisions for Feature Docs or drafting ADRs

## Branch Workflow
We use a standard feature-branch workflow.
- **Main branch:** `main` (Production)
- **Feature branches:** `feat/feature-name` or `fix/bug-name`
- **Merging:** Never merge automatically. Always wait for Codex to review and the human user to approve.

See `08-development-workflow.md` for detailed lifecycle states.

## Database & Migrations
- We use Cloudflare D1 (SQLite).
- All schema changes MUST go through local migrations via `wrangler d1 migrations create`.
- NEVER apply remote migrations without explicit human permission.
- See `docs/checklists/migration.md` for the exact steps.

## Prompt Philosophy
We operate on a **Documentation-First Workflow**.
- Prompts should be **very small**.
- Prompts should only describe: (1) the current task, (2) exceptional constraints, and (3) references to relevant documentation.
- Do not restate the entire project history. 

## Updating Documentation
Every AG task should end by asking/verifying:
- [ ] none
- [ ] update feature doc
- [ ] update checklist
- [ ] update principles
- [ ] create ADR
- [ ] update roadmap

This prevents the documentation from becoming stale.

---
*If you are an AI starting a new session, you are now caught up. Proceed to your specific task instructions and consult `docs/context/` or `docs/features/` as needed.*
