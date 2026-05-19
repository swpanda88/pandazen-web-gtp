# PandaZen Admin Operations Blueprint

## 1. Purpose

Single source of truth for the PandaZen admin/operations system.

The system is now moving from early CRM prototype into a practical operating stack for enquiries, Q&A/assessment, quote preparation and commercial document generation.

Current build priority:

> **Editable Q&A and Client & Home workspace details**

Next selected slice:

```text
Expanded Q&A / Client & Home workspace
-> Edit details
-> Save / Cancel
-> refreshed source data for Quote Assist and Quote Builder
```

Do not build future modules unless specifically selected.

---

## 2. Product Intent

PandaZen is a small, trust-led domestic cleaning business serving Durham and surrounding areas. The system should support:

- form-first enquiries with no public prices
- admin-led triage before quote/booking
- Q&A / assessment as the internal working record
- Quote Assist as explainable pricing/fit guidance
- Quote Builder as a fast way to turn system information into quote lines
- editable quote documents and printable client-facing quote output
- future accepted-quote conversion into Client & Home
- future cleaning plans, schedule/jobs, checklists, billable events and invoices
- GDPR-aware privacy, retention and anonymisation

The system starts with one admin and one cleaner but must allow growth.

---

## 3. Current Accepted Build State

Accepted / merged foundations:

```text
Lead Capture Foundation = done
Lead active/history = done
Lead close/reject/not suitable = done
Lead drawer contact/enquiry edit mode = done
Q&A / Assessment active/history workspace = done
Client & Home active/history workspace = done
Q&A not proceeding close-out = done
Quote Workflow MVP = done
Quote version/status lifecycle = done
Quote Document Editor + A4 preview/print = done
Q&A Quote Builder with work modules = done
Go-live D1 quote migration checklist = documented
```

Current live workflow:

```text
Lead
-> Q&A / Assessment
-> Quote Assist
-> Quote Builder
-> Draft Quote
-> Quote Editor
-> Quote Preview / Print
-> Quote sent / accepted / rejected / expired
```

Temporary bridge still present:

```text
Q&A -> Client & Home
```

Future intended bridge:

```text
Accepted Quote -> Client & Home
```

Known current operational gap:

- Q&A and Client & Home expanded workspace details are still mostly read-only.
- Quote Builder depends on source data, so admin needs to be able to correct Q&A/C&H details in place.
- GitHub issue #71 is ready for this next slice.

---

## 4. Stable Architecture Rules

```text
/admin/                 Full admin cockpit
/cleaner/               Future cleaner mobile/PWA view
/api/public/*           Public website APIs later
/api/admin/*            Admin-only APIs later
/api/cleaner/*          Cleaner-only restricted APIs later
/functions/api/         Current Cloudflare Functions API
/migrations/            D1 schema changes
/docs/                  Setup/security/workflow notes
```

Important security transition rule:

The prototype still has legacy API routes directly under `/api/*`. Before storing real customer data, either:

1. Protect all `/api/*` routes with Cloudflare Access, or
2. Migrate routes to `/api/admin/*`, `/api/public/*`, `/api/cleaner/*` and disable old legacy routes.

Do not protect only `/api/admin/*` while legacy `/api/*` routes still exist with sensitive access.

No real customer data until admin and API protection is in place.

---

## 5. Core Build Principles

- Build module by module.
- Use focused GitHub issues as work orders.
- Keep PRs small enough to preview-test.
- Use D1 for structured data; use R2/file storage later for uploads.
- Keep public website, admin shell, APIs and migrations loosely coupled.
- Use dashboards/lists for scanning and work queues.
- Use expanded workspaces for heavier operational work.
- Use document editor/preview surfaces for commercial/client-facing documents.
- Use dropdowns, toggles, checkboxes, date/time, numeric/currency/duration controls where appropriate.
- Do not render every field as free text.
- If a field does not have a safe editor yet, render it read-only.
- Quote Assist supports judgement; it does not replace admin judgement.
- Every recommendation must be explainable and editable.
- Sent/commercial documents must not be silently overwritten.
- Internal notes must not leak into client-facing output.

---

## 6. Current Data / Module Concepts

### 6.1 Leads

Purpose: public enquiry before assessment/quote/client.

Core fields include contact, area/postcode, service type, frequency, property details, priorities, pets, parking, products/notes, privacy acknowledgement and marketing opt-in.

Lead stage is intentionally narrow:

- review enquiry
- contact prospect
- add notes/tasks
- decide whether it moves into Q&A / Assessment
- close as rejected / not suitable if it should stop here

Active Lead statuses:

```text
New
Contacted
Waiting customer
Assessment needed
```

Lead history includes rejected, not suitable, converted and legacy inactive statuses.

### 6.2 Q&A / Assessment

Purpose: internal working record for evaluation, property/scope detail, notes, Quote Assist, Quote Builder and quote preparation.

Q&A is not the commercial quote itself.

Current Q&A behaviour:

- Active Q&A and Q&A History are separate containers.
- Workspace-first layout is implemented.
- Drawer is collapsed by default in workspace-first pages.
- Q&A can be closed as not proceeding with reason/note.
- Closed Q&A stays traceable and may still be converted later if the customer changes their mind.
- Current Q&A -> Client & Home conversion is temporary until accepted Quote becomes the conversion trigger.

Next work:

- Make Q&A Details editable from the expanded workspace.
- Use section-level Edit / Save / Cancel rather than autosave.
- Preserve workspace context after saving where practical.

### 6.3 Client & Home

Purpose: operational customer/home record after acceptance/conversion.

Current Client & Home behaviour:

- Same workspace-first active/history architecture as Q&A.
- Active Clients and Client History are separate.
- Client & Home is the future source for cleaning plan, schedule, jobs, checklists, billable events and invoices.

Next work:

- Make key Client & Home details editable from expanded workspace.
- Focus on home/service/source fields that later feed scheduling, checklists and billing.

Future Client & Home data includes:

- contact details
- active/paused/past status
- linked homes/properties
- internal Client Score / Client Memory
- access/parking/product/pet notes
- cleaning plans, jobs, invoices, documents
- complaints/praise/service history

Client Score / Client Memory is admin-only and must not be shown to clients or over-shared with cleaners.

---

## 7. Quote / Commercial Backend Architecture

The quote layer now has four clear parts:

```text
Quote Assist = recommendation / guidance
Quote Builder = turns Q&A/system info into selected work modules and quote lines
Quote Editor = polishes the generated commercial document
Quote Preview = A4/print/PDF-style client-facing output
```

### 7.1 Quote Assist

Purpose: help admin judge fit, likely hours, price/range and next step.

Outputs:

- fit score
- price-shopper risk
- travel suitability
- estimated first clean hours
- estimated recurring hours
- suggested price range
- minimum recommended price
- recommended next action
- confidence
- explanation, positive flags and risk flags

Version 1 is rule-based, not ML.

### 7.2 Accounting Quote Records

Quote is a separate commercial/accounting record linked to Q&A/Lead/Client.

Current quote lifecycle:

```text
draft
sent
accepted
rejected
expired
void
superseded
```

Versioning rule:

- Display reference format: `Q-00023/01`, `Q-00023/02`, etc.
- Sent quote versions must not be silently overwritten.
- Revised sent quotes create a new version.
- Usually only one version should be accepted.
- Rejected/expired/void/superseded versions stay traceable.

Important D1 migration rule:

- `quote_number` must not be unique.
- `display_reference` should be unique.
- Production go-live must apply and verify quote migrations from the D1 migration checklist.

### 7.3 Quote Document Editor

Accepted state:

- Draft quote content can be edited in an admin modal/overlay.
- Non-draft quote content is protected from silent editing.
- Draft-only content updates are saved through the quote API.
- Editor supports scope, included/excluded items, assumptions, pricing notes, client notes, internal notes, price lines, total price, recurring price and valid-until.
- Valid-until quick buttons exist.
- Editor shows customer/job context and safe admin guidance.

Client-facing safety:

- Internal notes/Q&A notes must not automatically become client notes.
- Client-facing notes should be blank or safe generic text unless manually edited.
- Client-facing quote document must not show internal status such as Draft/Sent/Superseded.

### 7.4 Quote Preview / Print

Accepted state:

- Lightweight A4-style quote preview exists.
- Preview opens separately and can be printed/saved as PDF via browser.
- Close tab behaviour is implemented.
- Client-facing document shows quote reference, date, valid-until, client/prospect, scope, included items, assumptions, pricing and client-facing notes.
- Internal workflow status is not shown on the printable/client-facing quote.

Future possible improvement:

- Add an explicit Save as PDF helper only if browser/client workflow needs it. Browser Print -> Save as PDF is acceptable for MVP.

### 7.5 Quote Builder with Work Modules

Accepted state:

- Quote Builder tab exists inside expanded Q&A workspace, after Quote Assist and before Quotes.
- Builder shows Q&A source context and Quote Assist recommendations.
- Builder creates practical default work modules based on service type/frequency.
- Admin can select/deselect modules, edit module names/descriptions/hours/rates/amounts, set recurring yes/no and add custom modules.
- Builder calculates one-off/initial total and recurring visit price.
- Generate / Update Draft Quote creates or updates a draft quote.
- Existing sent/non-draft quotes are not silently overwritten; quote workflow handles revised draft/version behaviour.
- Generated quote content populates scope, included items, assumptions, price lines, total price, recurring price, pricing notes and client notes.

Current limitations:

- Work module defaults are still code/static defaults.
- Module names, default wording and prices are not yet configurable in Settings.
- Assumptions are safe defaults but not yet selectable from a library.
- Builder state is MVP/in-memory; generated quote content is saved to the quote record.

Future issue after editable details:

```text
Configurable Quote Module Library / Pricing Defaults
```

This should eventually allow admin to configure:

- module name
- client-facing wording
- default hours/rate/fixed amount
- recurring yes/no
- service-type trigger
- selected by default yes/no
- active/inactive
- assumption defaults

---

## 8. Commercial Object Separation

```text
Lead = early enquiry / triage
Q&A / Assessment = internal evaluation and quote-prep record
Quote Assist = internal recommendation
Quote Builder = selected scope/work modules and generated quote lines
Quote = commercial offer / promise
Quote Document = client-facing representation of the quote
Client & Home = operational accepted customer/home record
Cleaning Plan = future recurring service plan
Job / Work Order = scheduled or completed visit
Billable Event = chargeable item generated from job/extra/manual charge
Invoice = selected billable events grouped into payment request
Payment = money received / reconciliation later
```

Invoices should eventually be generated from selected billable events, not automatically one-per-job.

Example future invoicing:

- one monthly invoice containing four regular cleans and one extra deep clean
- one ad-hoc B&B invoice containing several turnover visits across a few weeks
- one immediate invoice for a one-off deep clean

---

## 9. Future Core Workflow

Current live workflow:

```text
Lead
-> Q&A / Assessment
-> Quote Assist
-> Quote Builder
-> Draft Quote
-> Quote Editor / Preview
-> Quote sent / accepted / rejected / expired
-> temporary Q&A -> Client & Home bridge
```

Future intended workflow:

```text
Lead
-> Q&A / Assessment
-> Quote Assist
-> Quote Builder
-> Draft Quote
-> Quote sent
-> Quote accepted / rejected / expired
-> Accepted Quote converts Q&A to Client & Home
-> Cleaning Plan
-> Jobs / Visits
-> Reports / Follow-ups
-> Billable Events
-> Invoice from selected billable events
-> Payment tracking later
```

The direct Q&A -> Client & Home conversion is only a temporary bridge.

---

## 10. Settings / Data / Backups

GitHub protects code, not live D1 business data.

MVP backup workflow later:

- Settings -> Data & Backups
- Export all data
- Export selected data
- Export history/log
- Backup reminder settings

Every export should write an export log entry with date/time, export type, tables, record counts, exported by, file name, status and notes.

Production rule:

- Test D1/data changes on preview/dev with junk data.
- Export/backup production D1 before production schema/API/data-affecting changes once operational.
- Preview PRs must not write to production D1 once real data exists.

---

## 11. Cleaner App / Cleaner View Strategy

Future cleaner experience should be separate from admin, not permission-hiding admin data.

Recommended route:

```text
/admin/        full admin cockpit
/cleaner/      cleaner app/mobile/PWA view
/api/admin/*   admin APIs
/api/cleaner/* restricted cleaner APIs
```

Cleaner should see only assigned safe job data:

- today's jobs
- job time/window
- client/property reference
- address/access notes only when needed
- parking, pets, products, safety notes
- checklist
- open follow-ups for that job/property
- start/complete buttons
- completion notes
- issue/unable-access/extra-time report

Cleaner should not see leads, quotes, prices, invoices, profitability, marketing consent, lost lead notes, all clients/homes or business settings.

---

## 12. Privacy, Marketing and Terms Flow

Enquiry stage requires Privacy Policy acknowledgement and optional marketing opt-in.

T&C acceptance is not required at enquiry stage.

Quote/booking stage should eventually show:

> This quote is based on the information provided and is subject to PandaZen Terms & Conditions. Please review them before confirming your booking.

Later store:

```text
terms_version
quote_sent_at
quote_accepted_at
booking_confirmed_at
acceptance_method
```

Lost leads/quotes should be anonymised after review, with useful non-identifying quote outcome data retained for pricing intelligence.

---

## 13. Suggested Build Order

Accepted/completed:

```text
Phase 1 - Lead Capture Foundation
Phase 2 - Quote Assist Foundation
Phase 3 - Lost/reject/not suitable handling foundation
Phase 4 - Q&A / Client workspace foundation
Phase 5 - Accounting Quote Workflow MVP
Phase 6 - Quote Document Editor / A4 Preview
Phase 7 - Q&A Quote Builder with work modules
```

Next selected phase:

### Phase 8 - Editable Q&A and Client & Home Workspaces

Goal:

```text
Make expanded Q&A and Client & Home details editable in place so bad/missing source data can be corrected before Quote Assist, Quote Builder and future operations.
```

Required:

- Q&A Details tab gets section-level Edit / Save / Cancel.
- Client & Home key details get section-level Edit / Save / Cancel.
- Use existing PATCH routes where possible.
- Add focused PATCH routes only if needed.
- Use dropdowns/selects for enum-like fields.
- Use textareas only for notes/long text.
- Preserve workspace context after save where practical.
- Do not implement autosave.

Out of scope:

- quote module library
- assumptions library
- invoices
- billable events
- job scheduling
- cleaner portal
- customer portal
- public website changes
- major UI redesign

Later phases:

```text
Phase 9 - Configurable Quote Module Library / Pricing Defaults
Phase 10 - Accepted Quote -> Client & Home conversion path
Phase 11 - Cleaning Plans
Phase 12 - Schedule + Jobs
Phase 13 - Cleaner Experience
Phase 14 - Billable Events + Invoicing
Phase 15 - Files, Staff, Business Reminders
Phase 16 - Security/API namespace hardening before real data
```

Security foundation may be pulled forward before real customer use.

---

## 14. Current MVP State

Already present:

- public website and enquiry form
- admin shell and drawer/workspace patterns
- Lead active/history workflow
- Lead edit details drawer mode
- Quote Assist inside Q&A
- Q&A active/history workflow
- Client & Home workspace foundation
- Q&A close/not proceeding
- quote records, versions and statuses
- quote editor and A4 preview/print
- Q&A Quote Builder with work modules
- current temporary Q&A -> Client & Home bridge
- D1 migrations and Cloudflare Functions API

Still required before real use:

- Cloudflare Access protection
- protect legacy `/api/*` routes or remove/migrate them before storing real data
- final endpoint security/anti-spam review
- editable Q&A and C&H workspace details
- accepted Quote -> C&H conversion trigger
- configurable quote module/pricing defaults later
- lost lead/quote anonymisation hooks
- settings/dropdown editor later
- billable events and invoicing later
- files/photos later

---

## 15. Open Design Questions

Current/near-term:

1. Exact fields to expose in Q&A Details edit mode?
2. Exact fields to expose in Client & Home edit mode?
3. Which Q&A/C&H fields need controlled dropdowns vs free text?
4. Standard hourly target rate for module defaults?
5. One-off/deep clean premium?
6. Ideal/borderline/too-far service radius?
7. Fixed per visit vs internal hourly pricing?
8. Should client ever see hourly rate? Current assumption: no, only internal unless deliberately exposed.
9. Default quote validity period? Current likely default: 14 days.
10. Which assumptions should become configurable default checkboxes later?

Future:

11. Cleaner view: mobile web, PWA, or native later?
12. Exact fields safe for `/api/cleaner/*`?
13. Which details visible to cleaners and when?
14. Hide full address/access until job day?
15. Photo upload limits and retention?
16. Google Calendar integration timing?
17. Minimum invoice/accounting fields?
18. Payment tracking method?

---

## 16. Agent / GitHub Workflow

Use the conversation for planning, business logic and issue drafting. Use GitHub issues as focused work orders. Use Codex/Antigravity for one clear issue/branch at a time.

Current agent discipline:

```text
main = stable accepted work
one issue = one branch = one PR
no direct commits to main
preview test before merge
merge only after accepted
```

Good agent work:

- focused implementation
- bug fixes
- focused docs updates
- tests and verification
- specific PR review fixes

Avoid:

- vague brainstorming tasks
- large mixed rewrites
- hidden extras
- multiple agents editing the same branch
- unrelated work bundled into one PR

Every issue should include:

```text
Purpose
Scope
Explicit exclusions
Required behaviour
Acceptance criteria
Manual test steps
```

PR safety rules:

- keep PRs testable
- confirm changed scope matches issue
- test Cloudflare preview before merge
- use junk data only until admin/API routes are protected
- for DB/API/data-affecting changes, use preview/dev D1 and backup production before live merge once operational

Efficient flow:

```text
1. Discuss here
2. Create focused GitHub issue
3. Send agent one compact prompt referencing the issue
4. Test preview
5. Send back only specific fix comments
6. Merge when accepted
7. Sync blueprint/checkpoint after major accepted module
```

---

## 17. Next Build Instruction Block

```text
Work only on issue #71: Add editable details to Q&A and Client & Home workspaces.

Goal:
Make expanded Q&A and Client & Home workspace details editable in place so admin can correct source data before Quote Assist, Quote Builder and later operations.

Build:
- Q&A Details tab section-level Edit / Save / Cancel
- Client & Home key details section-level Edit / Save / Cancel
- use existing PATCH routes where possible
- add focused PATCH routes only if needed
- use dropdowns/selects for enum-like fields
- use numeric/date controls where appropriate
- use textareas only for notes/long free text
- refresh data after save and keep same workspace context where practical

Do not build:
- autosave
- quote module library
- assumptions library
- invoices
- billable events
- scheduling
- cleaner portal
- public website changes
- major layout redesign

Do not break:
- Leads
- Q&A active/history
- Q&A close-out
- Quote Assist
- Quote Builder
- Quote Document Editor / Preview
- Q&A -> Client & Home bridge
- Client & Home active/history

Run syntax checks for changed JS/function files.
Use test/junk data only until admin and API routes are protected.
```