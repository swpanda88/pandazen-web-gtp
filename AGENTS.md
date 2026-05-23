# AGENTS.md - PandaZen Web/Admin Build Rules

## Project

PandaZen is a trust-led domestic cleaning business system.

The current priority is:

Assessment + Quote workflow on top of the Client -> Property -> Assessment hierarchy

Do not build future modules unless explicitly requested.

## Source of Truth

Use:

- `docs/admin-operations-blueprint.md` as the product/build blueprint.
- `docs/pandazen-functional-architecture.md` as the core hierarchy and object model.
- `docs/pandazen-object-glossary.md` as the stable naming and definition guide.
- This `AGENTS.md` for stable coding and project rules.

If there is a conflict, ask for clarification or follow the blueprint for product behaviour and this file for coding discipline.

## Build Discipline

Work module by module.

Current workflow target:

Public enquiry form -> Lead -> Assessment -> Quote -> Client & Home -> future Job / Visit / Invoice

Lead capture, Quote Assist, Assessments, Quote workflow, and Client & Home are now part of the accepted core architecture. Do not jump ahead into Jobs, Visits, Invoices, cleaner app, or broader accounting workflows unless specifically requested.

Keep changes small and modular.

Prefer:

- one migration
- one/two API routes
- one admin screen update
- one focused form update
- one short docs update

Avoid mixing unrelated work.

Use Codex for focused implementation, bug fixes, testable docs updates and specific PR review fixes. Use chat/planning outside Codex for vague brainstorming, business logic debates and issue drafting. Every Codex task should reference one clear issue/PR with purpose, scope, exclusions, required behaviour and acceptance criteria.

Future implementation must follow `docs/pandazen-functional-architecture.md`. In particular:

- Client / Customer is the top relationship object.
- Property / Home / Location sits below Client.
- Assessment is the internal scoped-work record.
- Quote is the commercial offer.
- Accepted Quote is the long-term trigger for Job / Work Order creation.
- Existing-client extra work must create a new Assessment under the same Client, not a duplicate Client or Lead.

## Data and Security

Do not store real customer data until admin/API protection is in place.

Admin routes:

- `/admin/*`
- `/api/admin/*`

Cleaner routes later:

- `/cleaner/*`
- `/api/cleaner/*`

Public routes:

- `/api/public/*`

Transition rule:

- The current prototype may still have legacy `/api/*` routes.
- Before real data, either protect all `/api/*` routes or migrate/remove legacy routes before relying only on `/api/admin/*` protection.

Do not send sensitive admin data to cleaner routes. Do not rely on frontend hiding for security.

Use Cloudflare D1 for structured data only.

Do not store large files in D1. Use file references now and dedicated storage later.

For public form rate limiting, store short-term hashed identifiers where practical, not long-term raw tracking data.

Once real data exists, production and preview/dev must not share the same live D1 data. Test DB/API/data-affecting changes against preview/dev D1 with junk data, and require a production export/backup before merging/deploying schema changes, data-writing APIs, deletion/anonymisation, bulk updates, import/export, or auth/security changes.

## Enquiry Rules

The public enquiry form should collect enough detail for admin to judge the lead.

Do not ask for:

- alarm codes
- key safe codes
- full access instructions
- unnecessary sensitive personal details

Privacy Policy acknowledgement is required at enquiry stage.

Marketing opt-in is optional and must not be pre-ticked.

Do not add Terms & Conditions acceptance to the enquiry form. T&C belongs at quote/booking stage.

No public file uploads in MVP.

## Quote Assist Rules

Quote Assist supports admin judgement; it does not replace it.

Version 1 should be rule-based and explainable.

Store the generated recommendation against the lead. Do not only recalculate live.

Quote Assist should output:

- fit score
- price-shopper risk
- estimated hours
- suggested price/range
- confidence
- recommended next action
- explanation/flags

Admin must be able to review and override later.

## Lost Lead / Anonymisation Rules

Lost/unconverted leads should keep commercial learning data but not unnecessary personal identity.

When a lead is marked lost/no response/not suitable, set:

- `closed_at`
- `anonymise_after = closed_at + 90 days`

Later anonymisation should remove:

- name
- phone
- email
- full address
- house number/name
- street
- identifying free-text notes
- photos unless there is a specific reason to retain them

Keep non-identifying trend data such as:

- area/postcode district
- service type
- property type
- bedrooms/bathrooms
- condition
- source
- quote amount/range
- lost reason
- fit score
- price-shopper risk

## UI Rules

Admin should be a working cockpit, not a demo dashboard.

Preferred admin layout:

- left sidebar for modules
- top bar for search/quick add/user
- main list/board/calendar area
- right detail/actions panel

Design primarily for iPad and PC.

Cleaner view later should be separate from admin, mobile-first, and only show assigned safe job data.

Admin screens should be compact and action-led. They should help admin answer: what is this, why does it matter, and what do I do next?

Avoid wide tables and normal-use horizontal scrolling. Prefer compact grouped rows/cards, chips/tokens, saved views, and a right-side detail panel for full explanations and long notes.

Hover previews are useful on desktop, but every preview must have a touch/iPad alternative such as tap, long-press, or an info button. Previews must not expose sensitive data to users/routes without permission.

Selected records should show a clear next-action area with practical actions such as call, copy WhatsApp, generate email, mark contacted, snooze, or add note.

Admin UI must be type-aware. Do not render all editable fields as plain text inputs.

Use:

- dropdowns for controlled option groups
- checkboxes for multi-selects
- toggles for yes/no
- date/time pickers for dates and times
- numeric inputs for counts and hours
- currency controls for prices
- duration controls for man-hours
- textareas for notes and long free text
- read-only badges or summaries for calculated fields such as Quote Assist

When field schemas/settings exist, use them to choose the control. If the UI cannot safely edit a field yet, render it as read-only rather than a misleading text input.

## Testing

Use junk/test data until protection is live.

After changes:

- test public form submission
- test validation failure
- test admin list/detail
- test status update
- test note creation
- test automatic task creation
- test quote assist output

Do not proceed to the next module until the current slice works.

Before merge, check that the PR scope matches the issue, the Cloudflare preview was tested, no unrelated modules changed, and no fake/demo data is mixed into a real workflow.

## Documentation

After each accepted module:

- compress the blueprint section
- keep only current structure, decisions, constraints and unresolved questions
- remove outdated prompts/debate
- make the next module the most detailed section
