# 08: Development Workflow

This document outlines the lifecycle of a task from conception to production on PandaZen.

## The Triad
Work is executed by three entities:
1. **ChatGPT (Architect)**: Scopes work, sets milestones in `docs/context/roadmap.md`, drafts ADRs, and spins up Agents.
2. **AG (Builder)**: Writes the code, runs local tests, updates documentation, commits the branch.
3. **Codex (Reviewer)**: Challenges AG's logic, runs regression tests against `docs/checklists/testing.md`, and validates Definition of Done.

## Workflow States

### 1. Planning
- **Input:** Human user requests a feature.
- **Action:** ChatGPT scopes it, updates `features/feature-name.md`, and drafts the prompt for AG.

### 2. Implementation (AG)
- **Branch:** AG creates `feat/feature-name` from `main`.
- **Code:** AG implements the frontend, API, and DB migrations.
- **Local Validation:** AG runs `wrangler pages dev` or local curl commands to ensure it compiles and responds.
- **Commit:** AG commits the code and pauses for review.

### 3. Review (Codex)
- **Action:** Codex checks out the branch.
- **Validation:** Codex runs the checks listed in `docs/checklists/review.md`.
- **Feedback:** If issues are found, Codex hands it back to AG. If clean, Codex approves.

### 4. Human Approval
- **Action:** The human user reviews the final UI or git diff.
- **Merge:** Only a human or explicitly authorized agent merges the branch into `main`.

### 5. Release
- **Action:** Human triggers or pushes `main` to Cloudflare.
- **Remote Migrations:** Human explicitly applies `wrangler d1 migrations apply DB --remote`.

## Commit Guidelines
- Use Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`).
- Commits should be granular. Do not squash an entire feature into a single commit if it involves complex backend and frontend steps.
- Provide descriptive commit messages explaining *what* changed and *why*.
