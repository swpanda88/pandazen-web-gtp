# PandaZen Project Status & AI Resource Guidelines

_Last updated from the `ag/rebuild-assessment-wizard` branch._

This document records the current state of the PandaZen admin build, the remaining known work, and the working rules for using AI/agent model allowance efficiently.

## Current Direction

PandaZen admin is moving toward a simple operations system for boutique cleaning work:

```text
Lead / enquiry
  -> Assessment / scoped work
  -> Quote
  -> Accepted work
  -> Future job / visit / invoice flow
```

The current focus is the admin-side **Assessments**, **Client & Home**, and **Quote** workflow.

## What Is Done / Largely Working

### Assessment architecture

- The admin UI now treats Q&A-style records as **Assessments**.
- Existing internal `assessment_quotes` table/routes are still used.
- Existing-client assessments link using `client_id`.
- Existing-client assessments use `lead_id = NULL`.
- `source_type = existing_client` is used for assessments created from Client & Home.
- Accepted existing-client assessments remain linked to the same client rather than creating duplicate clients.
- Accepted assessments move out of Active Assessments and into Assessment History/global history conventions.

### New Assessment Wizard

The New Assessment flow from Client & Home has been rebuilt into a 4-step wizard:

1. **Setup**
2. **Property / Access**
3. **Scope / Priorities**
4. **Review & Create**

Current behaviour:

- Assessment is only created on the final Review & Create step.
- Wizard state is kept client-side while stepping through.
- Cancel/close/create should reset wizard state.
- Existing property mode carries existing client/home context into the wizard.
- Another address mode is intended to start clean and avoid stale home details.
- Address unknown mode creates a minimal but identifiable assessment.
- Step 2/3/4 use a table/grid-style layout similar to the Quote Builder pattern.
- Finite values should use dropdown/select controls where practical instead of free text.

### Workspace action panel

Expanded Client & Home and Assessment workspaces now have a context-dependent action panel.

Client & Home examples:

- Assessments tab: `+ New Assessment`
- Contact / Access: Edit / Save / Cancel
- Home details: Edit / Save / Cancel
- Cleaning plan: Edit / Save / Cancel where applicable

Assessment examples:

- Overview: Accept/Convert or Open Client
- Details: Edit / Save / Cancel
- Quote Assist: Run Quote Assist
- Quotes: Create Draft / Revised Draft

The intent is that core actions should be available in the expanded workspace, not hidden in the drawer.

### Quote flow

- Quote Builder layout and preview are in a good functional direction.
- Quote Assist can be run from the expanded Assessment workspace.
- Draft quotes can be generated from assessments.
- Quote Preview is client-facing and should not expose internal workflow status.
- Internal notes should not leak into client-facing quote notes.

## What Is Outstanding / Needs Checking

### 1. Final work_label removal and address deduplication

Decision:

- `work_label` is redundant for normal PandaZen workflow.
- It duplicates structured data such as customer, property, service, purpose, quote, and status.
- It should not be shown in normal UI, should not be auto-generated, and should not be sent from the New Assessment wizard.
- The database column may remain for now to avoid schema churn, but the app should behave as if the field is unused.

Outstanding issue:

- After removing work label, some rows may still display duplicated property/address text such as:

```text
30 Hill View, Esh Winning - 30 Hill View, Esh Winning - Esh Winning
```

This is likely not `work_label` anymore; it is probably duplicated `property_label + address + area` display composition.

Required fix:

- Add/fix a clean property/address display helper.
- Do not concatenate identical values.
- If property label and address are the same, show once.
- If address already contains area/postcode, do not append them again.
- Use structured data only.

### 2. Global Assessment row display

Desired global Assessments row structure:

```text
Column 1: customer/client name
          clean property/address context

Column 2: service type
          source / purpose

Column 3: quote ref or estimate state
          date/client metadata if useful

Column 4: status pill

Column 5: Open
```

Rules:

- Do not use long work labels as titles.
- Do not duplicate service/address/context under the wrong column.
- Existing-client and lead-derived assessments should visually follow the same structure.

### 3. Client & Home row headers

Decision:

- Do not show a single `service / frequency` block in Client & Home row headers.
- A client can have multiple assessments, jobs, services, and frequencies.
- Service/frequency belongs in:
  - Cleaning plan tab
  - Assessments tab
  - Quotes/jobs where relevant

Client & Home row headers should show:

- client name
- area/address
- useful plan/status health
- active/status chip
- Open/Close/actions

### 4. Future Jobs / Work Delivery layer

Current accepted assessment = accepted scoped work under the same client.

Future direction:

```text
Assessment accepted
  -> Quote accepted
  -> Job / Work Order
  -> Cleaner checklist / visit
  -> Completion / invoice
```

Do not overbuild Job Builder inside current Assessment cleanup work.

### 5. Button wording

For existing-client assessments, the old wording `Accept & Convert to Client & Home` is conceptually misleading because no new client should be created.

Possible future wording:

- `Accept Scoped Work`
- `Mark Accepted`
- `Accept & Link to Client`

This should be handled in a small wording-only pass later.

## Data Discipline / First-Principles Rules

Every field or control should justify itself by helping at least one of these:

- contact the client
- identify the property
- estimate time/price
- plan access/logistics
- help the cleaner do the job
- create quote/job/invoice
- track status/history

If a field is optional, unlikely to be used, and can be derived from existing structured data, it should not be in the normal workflow.

Rules:

```text
Useful field -> structure it properly
Redundant field -> remove/hide it
Unclear field -> park it, do not build around it
```

Avoid:

- vanity labels
- duplicated generated titles
- optional essay boxes that will not be maintained
- fields added mainly because AI might like more data

Prefer:

- structured dropdowns/selectors for finite values
- short useful notes where genuinely needed
- generated display from existing structured data

## AI / Agent Resource Guidelines

Model allowance is a project resource. Treat it like time and cash.

### Planning / architecture

Use only when deciding product direction, workflow, or data model.

Recommended models:

- Claude Opus 4.6 Thinking
- Gemini 3.1 Pro High

Examples:

- Assessment vs Job vs Quote architecture
- What becomes a Job later
- Whether a field belongs in the system at all
- Major workflow decisions

### Normal implementation

Use for careful admin.js, UI state, handlers, and medium JS/CSS refactors.

Recommended model:

- Claude Sonnet 4.6 Thinking

Examples:

- remove active `work_label` usage
- fix address deduplication helper
- action panel event-handler bug
- wizard state bug
- quote/assessment linkage UI logic

### UI / layout polish

Use AG visual/UI-oriented models where visual reasoning helps.

Recommended models:

- Gemini 3.1 Pro Low/High for screenshots/layout work
- Claude Sonnet 4.6 for careful JS/CSS mixed refactors

Examples:

- wizard card layout
- table/grid input layout
- workspace action panel ergonomics
- spacing/alignment fixes

### Small mechanical edits

Use cheaper/faster models.

Recommended models:

- Gemini 3.5 Flash
- GPT-OSS 120B Medium

Examples:

- rename a button
- remove one obsolete text line
- update docs
- tiny CSS spacing change

### When to stop

If a simple issue takes more than one or two implementation passes, stop and reassess.

Ask:

```text
Is the field/control actually needed?
Are we polishing the wrong thing?
Can this be derived instead of stored?
Should this be a later PR?
```

Do not keep spending allowance trying to make a redundant field useful.

## Branch / PR Discipline

- Keep one PR focused on one concern where possible.
- Once a branch becomes large, stop adding extra features.
- After the current `ag/rebuild-assessment-wizard` work is fixed and tested, merge it rather than adding more scope.
- Start new branches for new modules such as Jobs, invoices, scheduling, or major naming changes.

## Immediate Next Action

Use Sonnet for a surgical cleanup:

```text
Remove all active work_label/workLabel UI/display/payload references.
Fix duplicated property/address display helper.
No other UI redesign.
No backend/schema changes unless absolutely required.
```

Browser-test only:

- New Assessment creates successfully.
- Global Assessments list is clean.
- Address/property does not duplicate.
- Existing old work labels do not display.
- C&H Assessments remains usable.
- Quote Assist and Quote Builder still work.
