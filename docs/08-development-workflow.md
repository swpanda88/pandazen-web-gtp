# 08: Development Workflow

This document outlines the lifecycle of a task from conception to production on PandaZen.

## The Triad
Work is executed by three entities:
1. **ChatGPT (Architect)**: Scopes work, sets milestones in `docs/context/roadmap.md`, drafts ADRs, and spins up Agents.
2. **AG (Builder)**: Writes the code, runs local tests, updates documentation, commits the branch.
3. **Codex (Reviewer)**: Challenges AG's logic, runs regression tests against `docs/checklists/testing.md`, and validates Definition of Done.

## Source Responsibilities
- **Documentation**: The single current source of truth for the project. This refers specifically to the maintained permanent documentation set under `docs/`, including standards, features, knowledge, context, and accepted ADRs. Agents should not force users or future agents to read old PRs to understand current behaviour.
- **PR/Git History**: A historical record of how and why code changed, not a substitute for current documentation.
- **Feature Docs**: Describe current feature behaviour and future direction.
- **Context Docs**: Outline the roadmap, priorities, and recent project state.
- **ADRs**: Capture significant accepted architectural decisions.

## When to Update Documentation
Update documentation when:
- feature behaviour changes,
- business rules change,
- architecture or schema design changes,
- a reusable development rule is discovered,
- project priority or roadmap changes.

**Do not** update documentation for:
- isolated bug fixes that restore already-documented intended behaviour,
- formatting changes,
- internal refactors with no behavioural or architectural impact,
- temporary testing work.

### Milestone Updates
Feature docs should be updated:
- when a meaningful feature stage is completed,
- before or as part of the final PR for that stage,
- **not** after every tiny commit.

## Workflow States

```text
Planning
      ↓
Definition of Ready (DoR)
      ↓
Implementation
      ↓
Code Review
      ↓
Preview Validation
      ↓
User Acceptance
      ↓
Merge
      ↓
Production Rollout
      ↓
Documentation Review
```

### 1. Planning
- **Input:** Human user requests a feature.
- **Action:** ChatGPT scopes it, updates `features/feature-name.md`, and drafts the prompt for AG.

### 2. Definition of Ready (DoR)
- **Action:** Before AG begins implementation, verify that the task satisfies `docs/checklists/definition-of-ready.md`.
- **Validation:** Scope, Product, Technical, Workflow, and Dependencies criteria must be clear and agreed upon.

### 3. Implementation
- **Branch:** AG creates `feat/feature-name` from `main`.
- **Code:** AG implements the frontend, API, and DB migrations.
- **Local Validation:** AG runs `wrangler pages dev` or local curl commands to ensure it compiles and responds.
- **Commit:** AG commits the code and pauses for review.

### 4. Code Review
- **Action:** Codex checks out the branch.
- **Validation:** Codex runs the checks listed in `docs/checklists/review.md`.
- **Feedback:** If issues are found, Codex hands it back to AG. If clean, Codex approves.

### 5. Preview Validation
- **Action:** AG deploys the branch to a Cloudflare Pages preview environment if requested.
- **Action:** The team verifies the preview environment functionally works as expected.

### 6. User Acceptance
- **Action:** The human user reviews the final UI or git diff on the preview and gives the final sign-off.

### 7. Merge
- **Merge:** Only a human or explicitly authorized agent merges the branch into `main`.

### 8. Production Rollout
- **Action:** Human triggers or pushes `main` to Cloudflare.
- **Remote Migrations:** Human explicitly applies `wrangler d1 migrations apply DB --remote`.

### 9. Documentation Review
- **Action:** Confirm that any necessary documentation impact from the merged feature has been fully captured.

## Commit Guidelines
- Use Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`).
- Commits should be granular. Do not squash an entire feature into a single commit if it involves complex backend and frontend steps.
- Provide descriptive commit messages explaining *what* changed and *why*.

## Documentation Impact
Every task must assess its documentation impact before completion. Most isolated bug fixes may correctly select `None`.

```md
- [ ] None
- [ ] Update feature documentation
- [ ] Update project principles or standards
- [ ] Update shared domain knowledge
- [ ] Update roadmap or priorities
- [ ] Create or update an ADR

Reason: [Brief explanation]
```
