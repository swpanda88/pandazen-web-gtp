# CleanOps DB Wiring Operating Manual

## 1. Purpose

This file is the operating manual for all future CleanOps database and backend wiring work. It exists to prevent backend integration from damaging, hiding, simplifying, or replacing the approved CleanOps frontend. Every DB/API wiring stage must preserve the approved frontend shell and bind real data and workflow logic underneath it.

Future Codex or AG prompts for CleanOps DB/backend work must start by reading this file and must explicitly name the B-stage being implemented.

## 2. Approved Frontend Baseline

- Approved frontend reference commit: `3f03c9f`
- Approved frontend deployment: `https://cc9d311a.pandazen-web-gtp.pages.dev/`
- Corrective merge restoring approved frontend onto current backend: PR #115 / `main` @ `9e4c6c1`
- Future backend work must preserve this approved UI unless the owner explicitly approves a UI change.

## 3. Non-Negotiable UI Protection Rules

- Do not remove buttons.
- Do not hide buttons.
- Do not remove panels, cards, sidebars, or workspaces.
- Do not replace approved pages with simplified drawer/list flows.
- Do not replace a page with a full-page "Could not load..." message.
- Do not redesign during DB wiring.
- Unwired controls must remain visible and disabled or clearly labelled as coming-next.
- UI/functionality polish happens only after the app is DB-backed and working.

## 4. Backend Wiring Principle

Backend wiring means:

- keep the approved frontend shell, layout, and control set;
- bind DB/API data into the existing UI;
- add workflow logic behind existing controls;
- preserve mock/demo fallback if the API fails or returns unusable data.

Backend wiring does not mean simplifying the UI to match the current backend. The backend must grow into the approved UI.

## 5. Stage Size Rule

A stage should be one complete workflow layer for one page/object, not one button at a time and not the whole app at once.

Good examples:

- Requests read/list/detail from DB.
- Requests create/edit/save.
- Quote create/edit/save.

Bad examples:

- Wire the whole app in one PR.
- Remove UI because backend is incomplete.
- One tiny PR per single button forever.

## 6. Required Fallback Behaviour

- API failure must not destroy the approved page.
- Approved frontend fallback/mock/demo state must remain available.
- Errors should be inline, toast, or banner only.
- The user should still be able to see the full approved UI.
- Empty DB state must show a friendly empty/demo-compatible state, not a broken layout.

## 7. Backend Wiring Stage Plan

### B1 - Requests Read/List/Detail From DB

Scope:
- Wire Requests list, row data, and review/detail data to DB-backed API reads.
- Preserve the approved Requests page, filters, sidebars, workspaces, and controls.

What must work by the end:
- Requests list loads from DB.
- Request rows show DB customer, property, status, source, and notes where available.
- Clicking a request opens the approved review/detail experience.
- Mock/demo fallback remains available if the API fails.

What is not included:
- Request create/edit/save.
- Request status workflow actions.
- Quote/job/assessment conversion.

Required browser tests:
- Requests page loads with DB data.
- Existing mock/demo fallback still displays when the API is unavailable or unusable.
- Row click opens the approved detail/review UI.
- Filters and visible controls are either functional or disabled/coming-next.

Required fallback behaviour:
- API failure shows an inline/toast/banner error while preserving the page.
- Empty DB state shows a friendly empty/demo-compatible state.

### B2 - Requests Create/Edit/Save

Scope:
- Wire New Request and Request Review edit/save to DB-backed create/update endpoints.
- Preserve planned controls as visible disabled/coming-next placeholders if not wired.

What must work by the end:
- New Request creates a DB-backed request.
- Request Review edit mode updates practical customer/property/request fields.
- Saved changes persist after refresh.
- Errors are shown without clearing user input.

What is not included:
- Existing customer/property linking unless explicitly scoped.
- Quote/job/assessment conversion.
- Delete/archive workflow.

Required browser tests:
- New Request creates a request and refreshes the list.
- Editing a request saves and persists after reload.
- Cancel restores unsaved values.
- Invalid input/API errors appear cleanly.

Required fallback behaviour:
- Create/update failures keep the modal/drawer open with user-entered values.
- API read failure after save does not destroy the approved page.

### B3 - Requests Workflow/Status Actions

Scope:
- Wire approved request workflow buttons and status/action controls to supported backend workflow logic.
- Keep planned future actions visible but disabled/coming-next if not in scope.

What must work by the end:
- Supported status transitions save to DB and persist after refresh.
- Current action/status controls reflect real DB state.
- Unsupported conversions remain disabled/coming-next.

What is not included:
- Quote creation.
- Job creation.
- Assessment creation.
- Delete/archive unless explicitly scoped.

Required browser tests:
- Each supported status/action transition works without DB constraint errors.
- Unsupported actions are visibly disabled/coming-next.
- No fake enabled actions remain.

Required fallback behaviour:
- Failed workflow updates show inline/toast/banner errors and preserve current UI state.

### B4 - Clients + Properties DB Read/Create/Update

Scope:
- Wire Clients and Properties records to DB reads and practical create/update flows.
- Preserve approved client/property page layouts and linked request context.

What must work by the end:
- Client list/detail loads from DB.
- Property data loads and updates from DB.
- Creating/updating client and property shells persists after refresh.
- Request-linked customer/property records display consistently.

What is not included:
- Billing, jobs, visits, or invoice workflows.
- Global UI cleanup.

Required browser tests:
- Clients page loads with DB-backed data.
- Property details display and save.
- Request-linked records navigate/display correctly where controls exist.

Required fallback behaviour:
- API failure preserves approved client/property UI with mock/demo fallback.

### B5 - Quotes Read/List/Detail From DB

Scope:
- Wire Quotes list, detail, version summary, and document status from DB.

What must work by the end:
- Quotes list loads from DB.
- Quote detail opens from a row.
- Current totals/statuses/document metadata display from DB.
- Approved quote controls remain visible.

What is not included:
- Quote create/edit/save/versioning.
- Create quote from request.
- Invoice conversion.

Required browser tests:
- Quotes list/detail loads from DB.
- Empty/error states preserve approved UI.
- Unwired actions are disabled/coming-next.

Required fallback behaviour:
- API failure preserves the approved Quotes page and mock/demo fallback.

### B6 - Quotes Create/Edit/Save/Versioning

Scope:
- Wire quote create/edit/save and versioning behaviour to DB.

What must work by the end:
- New quote can be created.
- Quote header/lines/totals can be edited and saved.
- Versioning rules persist after refresh.
- Errors preserve entered values.

What is not included:
- Create quote from request.
- Convert quote to job.
- Invoice creation.

Required browser tests:
- Create quote.
- Edit quote.
- Save and reload.
- Versioning flow works.

Required fallback behaviour:
- Save failures keep edit state and values.
- API failure does not replace the page with a full-page error.

### B7 - Create Quote From Request

Scope:
- Wire the approved "create quote from request" workflow.

What must work by the end:
- A request can start a quote using existing request/customer/property context.
- The created quote persists and links back to the request.
- Request UI remains intact.

What is not included:
- Job creation.
- Invoice creation.
- Broad quote page redesign.

Required browser tests:
- Start from a request.
- Create quote.
- Confirm linked quote appears in quote list/detail.
- Confirm request remains accessible.

Required fallback behaviour:
- Failed conversion shows inline/toast/banner error and keeps the request drawer/page open.

### B8 - Jobs Read/List/Detail From DB

Scope:
- Wire Jobs list/detail to DB-backed reads.

What must work by the end:
- Jobs list loads from DB.
- Job detail opens and displays customer/property/schedule/status data.
- Approved job controls remain visible.

What is not included:
- Create job from quote/request.
- Visit scheduling.
- Invoice/billable event logic.

Required browser tests:
- Jobs page loads DB data.
- Job detail opens.
- Empty/error states preserve approved UI.

Required fallback behaviour:
- API failure preserves approved Jobs UI and mock/demo fallback.

### B9 - Create Job From Quote/Request

Scope:
- Wire approved job creation flows from quote and/or request.

What must work by the end:
- A job can be created from supported source records.
- Linked customer/property/source records persist.
- Job appears in Jobs list/detail after refresh.

What is not included:
- Schedule assignment unless explicitly included.
- Invoice creation.
- Broad Jobs redesign.

Required browser tests:
- Create job from quote/request.
- Confirm linked job persists and opens.
- Confirm source record remains accessible.

Required fallback behaviour:
- Failed job creation preserves the source page/drawer and entered choices.

### B10 - Visits + Schedule Read From DB

Scope:
- Wire Visits and Schedule views to DB-backed reads.
- Preserve Month/Week/Day/Workload view controls.

What must work by the end:
- Schedule views load visits from DB.
- Visit cards display approved minimal data.
- Workload grouping/collapse remains intact.

What is not included:
- Create/edit/assign visits.
- Drag/drop persistence.
- Invoice/billable events.

Required browser tests:
- Month, Week, Day, and Workload views load.
- Visit popovers still open.
- Filters remain functional or disabled/coming-next.

Required fallback behaviour:
- API failure preserves schedule shell and mock/demo fallback.

### B11 - Schedule Create/Edit/Assign Visit

Scope:
- Wire approved schedule create/edit/assign interactions to DB.

What must work by the end:
- Create visit.
- Edit visit.
- Assign visit/team/person where approved controls exist.
- Changes persist after refresh.

What is not included:
- Billing/invoice generation.
- Broad schedule redesign.

Required browser tests:
- Create, edit, assign, reload.
- Verify affected Schedule views update.
- Verify unsupported actions are disabled/coming-next.

Required fallback behaviour:
- Save failure preserves edit state and values.

### B12 - Billable Events

Scope:
- Wire billable event reads and workflow creation from supported jobs/visits.

What must work by the end:
- Billable events list/read from DB.
- Supported creation/update flows persist.
- Linked job/visit/customer context displays correctly.

What is not included:
- Invoice creation unless explicitly scoped.
- Payment handling.

Required browser tests:
- Billable events load.
- Create/update supported event.
- Reload confirms persistence.

Required fallback behaviour:
- API failure preserves approved shell and fallback/demo state.

### B13 - Invoices Read/List/Detail From DB

Scope:
- Wire Invoices list/detail to DB-backed reads.

What must work by the end:
- Invoice list loads from DB.
- Invoice detail opens from a row.
- Status, customer, property, totals, and document state display from DB.

What is not included:
- Invoice create/update/payment.
- Quote/job conversion.

Required browser tests:
- Invoices page loads DB data.
- Detail opens.
- Empty/error states preserve approved UI.

Required fallback behaviour:
- API failure preserves approved Invoices UI and mock/demo fallback.

### B14 - Invoice Create/Update/Payment

Scope:
- Wire invoice create/update and payment recording workflows.

What must work by the end:
- Create invoice.
- Edit/update supported invoice fields.
- Record payment/status where approved controls exist.
- Changes persist after refresh.

What is not included:
- External payment provider integration unless explicitly scoped.
- Broad invoice redesign.

Required browser tests:
- Create invoice.
- Update invoice.
- Record payment/status.
- Reload confirms persistence.

Required fallback behaviour:
- Save/payment failures preserve edit state and entered values.

### B15 - Dashboard DB-Backed Summaries

Scope:
- Wire Dashboard cards, summaries, alerts, and recent activity to DB-backed aggregate/read APIs.

What must work by the end:
- Dashboard summary cards reflect DB data.
- Recent activity/alerts use real records where available.
- Empty states are friendly and approved-layout compatible.

What is not included:
- New workflow creation.
- Cross-page redesign.

Required browser tests:
- Dashboard loads with DB data.
- Counts match known seeded/local data.
- Empty/error paths preserve approved UI.

Required fallback behaviour:
- API failure preserves dashboard layout and mock/demo fallback.

### B16 - Cross-Page Consistency Pass

Scope:
- Verify DB-backed pages behave consistently across requests, clients, quotes, jobs, schedule, billable events, invoices, and dashboard.

What must work by the end:
- Cross-page links and labels are consistent.
- Shared status/source/customer/property displays align.
- Visible controls are either functional or disabled/coming-next.
- Approved UI remains intact across the app.

What is not included:
- New major workflow features.
- Broad visual redesign unless explicitly approved.

Required browser tests:
- Smoke every CleanOps page.
- Confirm linked records navigate/display correctly.
- Confirm no page has missing controls, dead full-page errors, or fake enabled actions.

Required fallback behaviour:
- API failures on any page preserve the approved shell and fallback/demo state.

## 8. Required Checks For Every DB Wiring PR

PowerShell / Node checks:

```powershell
& "C:\Program Files\nodejs\node.exe" --check cleanops/api.js
Get-ChildItem cleanops,functions -Recurse -Filter *.js | ForEach-Object { & "C:\Program Files\nodejs\node.exe" --check $_.FullName }
git diff --check
Select-String -Path cleanops/**/*.js,functions/**/*.js -Pattern '\\`'
```

This scan intentionally looks for the escaped sequence backslash + backtick. Do not simplify it to `'\`'`.

Every DB wiring PR must also include:

- `git status`
- `git diff --name-status`
- PR must report changed files.
- PR must confirm approved UI controls were not removed/hidden.
- PR must include local browser smoke.
- PR must include Cloudflare preview smoke before merge.

## 9. Definition Of Done For Each Stage

- Stage scope completed.
- Approved UI still intact.
- Fallback tested.
- Data persists after refresh if the stage includes write operations.
- Cloudflare preview checked.
- No unrelated page changes.
- No hidden or removed controls.
- No full-page "Could not load..." replacement.

## 10. Forbidden Actions

- Do not import damaged frontend rewrites.
- Do not restore old backend-breaking files over current backend without review.
- Do not change shared UI styles/layout unless explicitly approved.
- Do not merge a backend PR if the preview shows missing buttons/panels or dead error pages.
- Do not use "simplify UI" as a backend wiring strategy.

## 11. Prompt Rule

Future Codex/AG prompts for CleanOps DB/backend work must start by reading this file and must explicitly name the B-stage being implemented.
