# CleanOps UI Design Guide

This document defines the approved UI and UX patterns for the CleanOps app.

Future CleanOps implementation work must read this file before changing layout, interaction, overlays, action panels, buttons, cards, or record workflows.

CleanOps should feel like one coherent operations app:

- same shell
- same spacing
- same buttons
- same modals
- same cards
- same interaction logic

Pages do **not** need to look identical. Different modules can adapt to their workflow, but they must use the same underlying UI language and layout rules.

Approved source patterns already emerging in the product:

- Clients list/detail
- Requests list/detail/workspace
- Quotes register
- Quote editor overlay
- Quote document/PDF preview
- Jobs action panel/workspace direction

---

## 1. Approved CleanOps visual language

CleanOps should feel:

- calm
- practical
- structured
- operational
- professional

Approved visual direction:

- calm off-white app background
- soft white cards
- subtle borders
- consistent radius
- muted chips
- strong green only for primary or positive actions
- red only for destructive or problem states
- amber only for warning or attention
- blue only for informational or ready states
- no loud experimental colours
- no raw browser-default buttons
- compact, practical layouts
- information-dense but not cramped
- simple, calm, operations-focused admin/SaaS feel

The visual goal is not “fancy”. The goal is a trustworthy working surface that can be used all day without fatigue.

---

## 2. Approved layout patterns

These are the default layout patterns for CleanOps. New modules should use one of these patterns unless the user explicitly asks for a new one and the design guide is updated.

### A. Page header

Use for all main pages.

Pattern:

- breadcrumb or top context
- page title
- short subtitle
- primary action button top-right

Examples:

- `Quotes / New quote`
- `Jobs / New job`
- `Requests / New request`

Rules:

- keep primary actions in the header action area
- do not place primary buttons awkwardly inline with subtitle text
- keep subtitles short and operational

### B. Register / list page

Use for:

- Quotes
- Invoices
- Jobs list
- Clients list
- Requests list where suitable

Pattern:

- page header
- search/filter row
- table/register controls that can support sorting and pagination where useful
- main table/register card
- aligned columns
- row action button/menu
- rows open workspace/detail

Approved example:

- Quotes register

Rules:

- this is the stable database/register view
- do not replace the full register with kanban by default
- columns should be practical, scannable, and aligned

### B.1 Register / table interaction rules

Normal register/list tables should be designed to support:

- search
- filters
- sortable columns where useful
- pagination and page size controls for larger datasets
- aligned columns
- compact row actions menu
- row opens workspace/detail where appropriate

This applies to:

- Jobs register
- Quotes register
- Invoices register
- Clients register
- Requests register where a table/register view is used
- Reports/history tables
- Billable events tables
- Scheduled cleans list views

Sorting:

- useful columns should visually support sorting later
- examples: date, client, property, status, amount, updated/valid, next clean
- do not add sorting indicators to every tiny embedded table if it adds clutter

Pagination:

- any table that may grow beyond roughly 25-50 records should be pagination-ready
- page size and next/previous controls can be added when real data/backend support exists
- v0/mock tables may use static controls if full sorting/pagination is not implemented yet

Exceptions:

- kanban/action panels
- quote builder line items
- invoice builder line items
- checklist builder tasks
- small embedded summary tables
- forms or editors where sorting would be confusing

Kanban/action panels are not a replacement for the full register/list. Where action panels exist, a register/list should remain available below or nearby.

### C. Row action menu

Use compact dropdown menus for row-level actions.

Approved pattern:

- `Actions ▼`
- small floating menu
- consistent options
- no huge buttons in every row

Examples:

- Edit
- Preview
- Generate document
- Mark sent
- Duplicate
- Create alternative
- Archive

Use this pattern for:

- quotes
- jobs
- invoices
- scheduled cleans where appropriate

### D. Workspace / detail page

Use when opening a record.

Pattern:

- compact record header
- main left content column
- right-side summary/context column
- section cards
- actions near relevant sections
- no giant header carrying everything

Use for:

- Client detail/workspace
- Job workspace
- Request detail/workspace
- Quote editor if not document-style
- Invoice workspace later

### E. Large editor overlay / document editor

Use for focused document-style editing.

Approved example:

- Quote editor overlay

Pattern:

- large near-full workspace overlay
- main editor area left
- context/assist panel right
- sticky or bottom action bar where helpful
- close/back action
- enough width for real work

Use for:

- Quote editor
- Invoice editor later
- Job setup editor if complex
- Scheduled clean detail if it requires real control
- Checklist builder

Do not replace this with narrow side drawers.

### F. Layered workspace

Use when going one level deeper without losing context.

Examples:

- Job -> Scheduled Clean detail
- Job -> Checklist Builder
- Job -> Client/Property/Quote/Request preview
- Quote -> Document preview/editor
- Invoice -> Document preview later

Rules:

- must look like CleanOps workspace, not a random popover
- must include Back/Close
- must return to parent workspace cleanly
- must use enough width for actual work
- must use existing card/header/button style

Layer order:

1. base page
2. workspace/detail
3. layered workspace
4. small modal

### G. Small centered modal

Use only for quick input or confirmation.

Examples:

- complete with note
- skip reason
- confirm archive
- quick status change
- small warning or guard

Rules:

- centered
- sits above active workspace
- short form only
- close/cancel returns to current workspace
- not used for large editing workflows

### H. Compact popover

Use only for small menus/dropdowns.

Examples:

- row action menu
- more actions
- simple selector

Not for detailed editing.

### I. Right-side context card

Allowed inside a workspace for summary/context only.

Good uses:

- Job Context
- Billing Readiness
- Quote Assist
- Request Context
- Contact info
- Internal notes

Not allowed for heavy editing.

---

## 3. Kanban / action panel rule

Kanban-style columns are not banned completely, but they are not the default layout for every module.

Kanban or action-column layouts are allowed only where they represent a useful human work queue.

Allowed:

- compact action panels showing items requiring admin/operator decision
- request intake/triage where columns represent real active intake flow
- jobs action panel where cards represent human actions needed

Approved Jobs action panel:

- Needs setup
- Needs review
- Ready to bill

These are allowed because they answer:

> What needs my attention?

Not allowed by default:

- using kanban as the main layout for every module
- duplicating Schedule as a job kanban
- columns that mostly show normal work states rather than human action
- empty/problem-only columns such as Issues unless volume clearly justifies it
- replacing the full register/list with kanban only

For Jobs:

- action panel at top is allowed
- All Job Plans register below is still required
- do not use the old columns:
  - Scheduled
  - In progress
  - Ready to invoice
  - Issues

Visual rules:

- compact columns
- soft cards
- small count chips
- cards open the relevant workspace
- no loud colours except severity/problem chips

---

## 4. Explicitly disallowed patterns unless approved

Disallow by default:

- random right-side drawers for major editing
- side drawers for checklist builder
- side drawers for scheduled clean detail
- side drawers for report review
- side drawers for job setup/edit
- side drawers for quote editor
- side drawers for billing detail
- full checklist editor dumped into the main Job workspace
- new kanban layouts that do not match the approved action-panel model
- browser-default buttons
- huge essay text boxes
- dead buttons that do nothing
- placeholder previews that only say “summary goes here”
- detached full-page popovers that do not match the app shell
- cramped mini pages floating in large empty space
- multiple competing modal styles for the same type of task

If a button is not implemented:

- disable it with explanatory text, or
- mark it clearly as mock/unavailable, or
- open a useful mock preview

No silent dead buttons.

---

## 5. Jobs-specific UI rules

Jobs is the operational control centre.

### Jobs page layout

Jobs page layout:

1. Page header
2. Top action panel:
   - Needs setup
   - Needs review
   - Ready to bill
3. All Job Plans register below

Jobs page must not be only a kanban.

### Job workspace layout

Header:

- address-first title
- client/service/cadence subtitle
- status chips
- Edit job / Close actions

Left/main:

- Cleaning Plan / Setup
- Generated Scheduled Cleans
- Recent Reports
- Checklist Summary

Right:

- Job Context
- Billing Readiness
- Internal Notes

Job workspace should answer:

- What is this job?
- What is the plan?
- What is scheduled?
- What needs doing now?
- What happened last time?
- What can be billed?

### Job setup/edit

Job setup/edit is important and should not be a random narrow side drawer.

Use either:

- large editor overlay, or
- layered workspace, or
- structured modal if still genuinely small enough

It should follow the approved CleanOps editor pattern.

### Scheduled Clean detail

Scheduled Clean detail must use layered workspace or large editor style.

Do not use a detached mini-page or narrow drawer.

It should show:

- address/job context
- clean type: initial / regular / extra
- date/time
- duration
- cleaner/team
- status
- checklist copy
- report/completion status
- notes/reason
- billing source
- billable status
- relevant actions

### Checklist Builder

Checklist Builder must open as a layered workspace or large editor.

Main Job workspace should only show Checklist Summary.

Checklist Summary example:

- Initial clean: Initial/deep clean · 3 sections · 13 tasks
- Regular clean: Regular domestic clean · 4 sections · 13 tasks
- Used by: initial clean / regular cleans
- Open checklist builder

Checklist Builder should show:

- checklist inputs
- template
- property/request/quote context
- initial checklist
- regular checklist
- sections/tasks
- mock edit controls if available

Do not dump the full checklist inside the main Job workspace.

### Source previews

Client/property/quote/request previews from Job Context should open layered previews.

They should show useful mock data where available.

Do not use placeholder-only text.

---

## 6. Quotes-specific UI rules

Quotes register follows the approved register/list pattern.

Quote editor follows the large document/editor overlay pattern:

- main quote fields/items left
- context/assist panel right
- bottom actions
- document preview separate

Quote document/PDF preview follows the print/PDF preview pattern:

- centered A4 document
- Print / Close actions
- reusable later for invoice PDFs and report PDFs

---

## 7. Requests-specific UI rules

Requests can use:

- list/register pattern
- workspace/detail pattern
- right-side Quote Assist/context cards

Requests are an intake and scoping workflow, so some workflow-specific right panels are acceptable.

But Requests should still use shared CleanOps card, button, header, and overlay rules.

---

## 8. Invoices future rules

Invoices should reuse the Quotes document/register patterns wherever sensible.

Invoice register:

- similar to Quotes register

Invoice editor:

- similar to Quote editor

Invoice PDF preview:

- similar to Quote PDF preview

Invoice lines should derive from ready billable events and catalogue items, not random hardcoded UI.

---

## 9. Schedule future rules

Schedule is a calendar/time view, not the main operations database.

Schedule should show:

- what happens when
- alterations
- exceptions
- one-off/ad-hoc scheduling
- capacity checking

Schedule should not become a dumping ground for recurring jobs.

Recurring jobs should be generated from Job Plan setup with planned dates/times.

---

## 10. Button rules

Use consistent button families:

- primary green
- secondary/ghost
- danger/destructive
- small row/action buttons

Avoid:

- raw default HTML buttons
- random button sizes
- random colours
- ambiguous wording

Use human wording:

- Open
- Edit
- Back to job
- Close
- Complete all good
- Complete with note
- Skip / cancel
- Open client
- Open property
- Open quote
- Open request
- Open checklist builder

---

## 11. State and layering rules

Only one main active workspace at a time.

Layer order:

1. base page
2. workspace/detail
3. layered workspace
4. small modal

Closing behaviour:

- small modal returns to current workspace
- layered workspace returns to parent workspace
- workspace close returns to register/page

Avoid:

- trapped overlays
- buttons opening behind the active layer
- modal under workspace
- state where the page is stuck
- multiple unrelated overlays open at once

---

## 12. Data/context display rules

Context previews should show real mock data where possible.

Do not show placeholder-only content such as:

> Summary of client contact info, active work, etc.

If data does not exist, show:

- `Not linked`
- `No data available yet`

Or disable the button where appropriate.

Rows and cards should answer:

- who
- where
- what
- status
- action

---

## 13. Developer instruction

Future AG/Codex feature work must read this file before changing layout or interaction patterns.

Every future UI prompt should include:

> Before coding, read `docs/cleanops-ui-design-guide.md` and follow it. Do not introduce unapproved layout patterns.

Do not introduce a new visual pattern unless:

- explicitly requested by the user, and
- this design guide is updated if the pattern becomes approved

---

## 14. Confirmation / guard rules for serious actions

Serious actions must not happen from a single accidental click.

Use a small centered confirmation modal, guard popup, or clear review step before actions that:

- create a new commercial/operational record
- generate documents
- send something to a customer
- mark something as sent
- accept/reject/archive/delete something
- convert one record into another
- move work into a different status/workspace
- create billable events
- create invoices
- mark jobs/reports as complete where the action affects billing
- skip/cancel scheduled work
- close or supersede commercial records
- make something disappear from the current action queue

Examples requiring confirmation or guard:

- Convert quote to job
- Mark quote sent to customer
- Generate final document/PDF
- Archive quote/job/request
- Mark setup complete if it removes a job from Needs setup
- Complete all good if it creates a billable event
- Skip/cancel scheduled clean
- Mark reviewed and billable
- Create invoice from billable events
- Send invoice

The confirmation should be small and consistent with CleanOps modal style.

Good pattern:

- clear title
- one-sentence explanation
- primary action button
- cancel button
- show consequence if relevant

Example:

> Mark setup complete?
> This will remove the job from Needs setup and allow scheduled cleans to continue.
> [Cancel] [Mark setup complete]

Example:

> Complete and bill this clean?
> This will create a ready-to-bill event for £90.00.
> [Cancel] [Complete all good]

Do not use browser confirm alerts.
Do not rely only on toast messages for serious actions.
Do not make records disappear from queues without clear feedback.

Light actions do not need confirmation:

- open workspace
- open preview
- edit field
- change filter
- open action menu
- view document preview
