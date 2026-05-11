# PandaZen Admin Operations Blueprint

## 1. Purpose

Single source of truth for the PandaZen admin/operations system. Replaces separate FDS docs for now.

Current build priority:

> **Lead Capture + Admin Review + Quote Assist**

Do not build future modules unless specifically selected. The first useful working slice is:

```text
Public enquiry form → Lead record → Admin task → Admin review → Quote Assist → Next action
```

---

## 2. Product Intent

PandaZen is a small, trust-led domestic cleaning business. The system should support:

- form-first enquiries with no public prices
- bespoke quoting and lead filtering
- admin review before booking
- quote assist for hours/price/fit judgement
- future home assessments as source of truth
- future recurring cleaning plans, jobs, checklists and reports
- future invoicing, files, staff and cleaner app
- GDPR-aware privacy, retention and anonymisation

The system starts with one admin and one cleaner but must allow growth.

---

## 3. Build Principles

- Build module by module.
- Keep public website, admin shell, APIs and migrations loosely coupled.
- Use focused forms for serious data entry.
- Use dashboards for scanning/action queues, not heavy data entry.
- Prefer dropdowns and structured fields, with `Other` for exceptions.
- Admin UI must be type-aware: dropdowns, toggles, checkboxes, date/time pickers, numeric inputs, currency/duration controls and textareas should match the field schema/settings.
- Do not store real customer data until admin/API routes are protected.
- Keep D1 for structured data only; use R2/file storage later for uploads.
- Treat photos/files as temporary unless marked to keep.
- Use tasks/reminders before risky automation.
- Quote Assist supports judgement; it does not replace it.
- Every recommendation must be explainable and editable.
- Keep commercial learning from lost quotes, but anonymise personal details.

---

## 4. Stable App Structure

```text
/admin/                 Full admin cockpit
/cleaner/               Future cleaner mobile/PWA view
/api/public/*           Public website APIs
/api/admin/*            Admin-only APIs
/api/cleaner/*          Cleaner-only restricted APIs

/functions/api/
  _util.js              Shared helpers
  _quoteAssist.js       Lead scoring / quote assist logic

/migrations/            D1 schema changes
/docs/                  Setup/security/workflow notes
```

Cleaner APIs must not return sensitive admin data. Do not rely on hiding sensitive data in the frontend.

Important transition rule:

The current prototype still has legacy API routes directly under `/api/*`, for example `/api/leads`, `/api/jobs`, `/api/clients` and `/api/invoices`.

Before storing real customer data, do one of these:

1. Protect all `/api/*` routes with Cloudflare Access until the API is fully namespaced.
2. Migrate admin routes to `/api/admin/*`, public routes to `/api/public/*`, cleaner routes to `/api/cleaner/*`, then remove or disable the old legacy routes.

Do not protect only `/api/admin/*` while legacy `/api/*` routes still exist with sensitive data access.

---

## 5. Current Module: Lead Capture + Quote Assist

### Done when

- public enquiry form submits to controlled API
- lead is saved in D1
- lead appears in admin list/detail
- admin can update status and add notes
- new lead creates follow-up task
- Quote Assist runs and stores recommendation
- admin sees fit score, hours, price range, confidence and next action
- Privacy Policy acknowledgement is stored
- optional marketing opt-in is stored separately
- lost leads can be marked with lost reason
- lost leads get anonymisation review date
- no T&C acceptance is forced at enquiry stage

---

## 6. First Data Tables

### 6.1 `leads`

Purpose: public enquiry before it becomes an assessment, quote or client.

Core fields:

```text
id, created_at, updated_at, status,
closed_at, lost_reason, anonymise_after, anonymised_at,
name, phone, email, preferred_contact_method, best_contact_time,
area, postcode, source, source_tag,
service_type, frequency, urgency, preferred_days_times,
property_type, bedrooms, bathrooms, reception_rooms,
kitchen_size, property_size, property_condition,
priorities, pets, parking, product_preferences,
photo_available, notes,
privacy_policy_accepted, privacy_policy_version, privacy_policy_accepted_at,
marketing_opt_in, marketing_opt_in_at, marketing_source
```

Notes:

- Full address is not required at first enquiry.
- Do not collect alarm/key/access details on public form.
- Multi-select fields may be JSON/text for MVP.
- T&C acceptance belongs at quote/booking, not enquiry.

### 6.2 `lead_notes`

Purpose: admin notes, calls, quote notes and history.

```text
id, lead_id, note, note_type, created_at, created_by
```

Note types: general, call, quote, follow-up, internal, concern, lost reason detail.

### 6.3 `admin_tasks`

Purpose: operational reminders and to-dos.

```text
id, title, notes, task_type, status, priority,
due_at, linked_type, linked_id, assigned_to,
repeat_rule, created_at, completed_at
```

Initial task types: Lead follow-up, Quote, Assessment, Invoice, File cleanup, Lost lead anonymisation, Business admin, Staff, Vehicle, Client care, Other.

New lead should automatically create a follow-up task.

### 6.4 `lead_quote_assist`

Purpose: store system recommendation at the time of lead creation/review.

```text
id, lead_id,
fit_score, price_shopper_risk, travel_suitability,
estimated_first_clean_hours_min, estimated_first_clean_hours_max,
estimated_recurring_hours_min, estimated_recurring_hours_max,
suggested_price_min, suggested_price_max, minimum_recommended_price,
recommended_next_action, confidence, explanation,
risk_flags, positive_flags, rule_version,
created_at, updated_at
```

Store historical recommendation; do not only recalculate live.

### 6.5 Legal/settings later

May become `policy_versions`, `legal_settings` or editable `settings`.

Purpose: track Privacy Policy and T&C version/date shown at each stage.

### 6.6 `public_submission_attempts`

Purpose: support public form anti-spam/rate-limit checks without keeping more personal data than needed.

Suggested fields:

```text
id, created_at,
ip_hash, contact_hash,
route, outcome, reason,
user_agent_hash
```

Rules:

- store hashes, not raw IP addresses, where practical
- use a server-side salt/secret when hashing
- contact hash can be based on normalised email or phone
- outcome examples: accepted, rate_limited, honeypot, validation_failed
- keep records short-term only, for example 7 to 30 days
- mention this limited anti-spam processing in the Privacy Policy

This table should not become a long-term tracking table.

---

## 7. First API Routes

Minimum current routes:

```text
POST  /api/public/leads
GET   /api/admin/leads
GET   /api/admin/leads/:id
PATCH /api/admin/leads/:id
POST  /api/admin/leads/:id/notes
GET   /api/admin/tasks
PATCH /api/admin/tasks/:id
```

Possible later quote routes:

```text
POST  /api/admin/leads/:id/run-quote-assist
PATCH /api/admin/leads/:id/quote-assist
```

Public lead endpoint rules:

- POST only, JSON only
- validate required fields and field lengths
- allow only known dropdown values where possible
- honeypot spam field
- basic rate limiting
- generic polite response for suspicious submissions
- no public file uploads in MVP
- no sensitive access details
- store only short-term hashed anti-spam/rate-limit events

Required public fields:

- name
- phone or email
- area/postcode
- service type
- Privacy Policy acknowledgement

Suggested limits:

```text
name 80, phone 40, email 120, area/postcode 120,
preferred days/times 160, notes 1000
```

Suggested rate limits:

```text
same IP: 3/hour, 8/day
same email/phone: 2/day
```

Rate-limit privacy:

- hash IP/contact identifiers before storage where practical
- retain rate-limit events only briefly
- use them only for security, abuse prevention and form reliability
- include a short Privacy Policy note that technical anti-spam data may be processed

---

## 8. Client-Facing Enquiry Form

Preferred CTA:

> **Request a cleaning quote**

Form purpose: gather enough information for a sensible first response without feeling intrusive.

Suggested intro:

> Tell us a little about your home and what you need. This helps us give a realistic first response and decide whether a short call, photo-supported estimate or home visit is the best next step.

Field groups:

- Contact: name, phone, email, preferred contact method, best time, area/postcode
- Service: service type, frequency, preferred days/times, urgency
- Property: type, bedrooms, bathrooms, reception rooms, kitchen size, approximate size, pets, parking
- Condition: well maintained / generally tidy / busy home reset / deep clean first / moving / not sure
- Priorities: trust/reliability, same cleaner, detail, regular schedule, kitchen/bathroom hygiene, busy home support, guests, cheapest price
- Products/notes: preferences, optional notes, photos available yes/no

Photos:

- no public uploads in MVP
- ask whether photos are available
- request photos separately after replying if needed

---

## 9. Privacy, Marketing and Terms Flow

### Enquiry stage

Required:

- Privacy Policy acknowledgement

Optional:

- marketing opt-in

Not required:

- T&C acceptance

Reason: Privacy Policy applies because personal data is collected. T&C applies when quoting/booking service obligations.

Checkbox wording:

> I understand PandaZen will use my details to respond to this enquiry, in line with the Privacy Policy.

> I’m happy for PandaZen to contact me occasionally about availability, offers or cleaning tips. This is optional and I can opt out at any time.

Marketing must not be pre-ticked.

Store:

```text
privacy_policy_accepted, privacy_policy_version, privacy_policy_accepted_at,
marketing_opt_in, marketing_opt_in_at, marketing_source
```

### Quote/booking stage

Quote wording:

> This quote is based on the information provided and is subject to PandaZen Terms & Conditions. Please review them before confirming your booking.

Booking wording:

> Thank you — your booking is confirmed. By confirming the booking, you agree to PandaZen Terms & Conditions, including our cancellation, access and payment terms.

Later store:

```text
terms_version, quote_sent_at, quote_accepted_at,
booking_confirmed_at, acceptance_method
```

---

## 10. Quote Assist / Lead Intelligence

Purpose: help admin judge fit, likely hours, price/range and next step.

Outputs:

- fit score 0–100
- price-shopper risk: Low/Medium/High
- travel suitability: Good/Borderline/Poor
- estimated first clean hours
- estimated recurring hours
- suggested price range
- minimum recommended price
- recommended next action
- confidence: Low/Medium/High
- explanation, positive flags and risk flags

Version 1 should be rule-based, not ML.

---

## 11. Rule Logic

### Fit score

Start at 100 and adjust.

Positive factors:

- local/short travel +10
- weekly/fortnightly regular clean +20
- values trust/reliability/consistency +15
- parking available +5
- clear details +10
- photos available/provided later +5
- flexible availability +10
- trusted referral/source +10

Negative factors:

- too far -20 to -50
- one-off low-value job -10 to -30
- urgent same/next day -10 to -25
- cheapest price priority -30
- no parking/difficult access -5 to -15
- vague info -10
- poor condition but low expected hours -20
- outside working hours -20

Interpretation:

```text
80–100 strong fit
60–79 possible fit
40–59 borderline
<40 likely poor fit / decline / premium / waitlist
```

### Price-shopper risk

High-risk indicators:

- chooses cheapest price
- asks only “how much per hour?”
- gives little detail
- wants short booking for large property
- compares to low-price competitors
- refuses photos/call/visit but wants fixed price

Low-risk indicators:

- values trust/reliability/consistency
- wants regular cleaning
- gives detail
- understands quote depends on property/condition
- flexible on timing

### Recommended actions

- Quote from form
- Request photos
- Arrange follow-up call
- Offer home visit
- Offer regular-client assessment
- Quote premium due to travel/capacity
- Add to waiting list
- Decline politely / not suitable

Examples:

- high fit + regular + local = call/home visit
- medium fit + enough info = quote range
- medium fit + poor info = request photos/details
- far + one-off = premium or decline
- high price-shopper risk = minimum boundary/polite filter
- full capacity = waitlist or premium only

---

## 12. Hours and Pricing Logic

### Base recurring hours

| Property | Recurring clean |
|---|---:|
| 1-bed flat | 1.5–2.0 h |
| 2-bed flat/house | 2.0–2.5 h |
| 3-bed house | 2.5–3.5 h |
| 4-bed house | 3.5–4.5 h |
| 5-bed+ / large detached | 4.5 h+ |

Bathroom modifier:

```text
1 bath +0
2 baths +0.3–0.5
3 baths +0.7–1.0
4+ baths +1.0+
```

Condition modifier:

```text
well maintained x1.0
generally tidy x1.1
busy family home x1.25
reset/deep clean first: recurring x1.1, first clean x1.8–2.5
end of tenancy x2.0–3.0
```

Pets:

```text
none +0
cat/dog +0.25–0.5
multiple/heavy hair +0.5–1.0
```

First clean multiplier:

```text
well maintained x1.25
generally tidy x1.5
busy family home x1.75
needs reset x2.0–2.5
```

Minimum booking:

- 2 hours minimum
- round below-minimum jobs to 2 hours
- travel-heavy jobs need higher minimum or travel built in

Pricing concept:

```text
estimated hours × rate + travel adjustment + difficulty adjustment
```

Pricing settings later:

- standard rate
- deep clean rate
- one-off multiplier
- minimum booking price
- travel bands
- busy/capacity multiplier
- VAT setting if future needed

Use ranges at first:

```text
suggested estimate £120–£160
minimum recommended £115
confidence Medium
```

---

## 13. Self-Improving Quote Intelligence

Store quote outcomes to improve future suggestions.

For each quote/enquiry store:

- original form data
- suggested hours/price
- manual quoted hours/price
- accepted/rejected/lost/no response
- lost reason
- actual hours and travel if completed
- issues encountered
- client quality/profitability rating
- quote accuracy: too low/about right/too high

Learning starts simple:

- compare predicted vs actual hours
- surface repeated underquoting patterns
- show similar historical jobs once enough data exists

Example future prompt:

> Similar 3-bed busy family homes with 2 bathrooms averaged 3.9h, while the current rule predicts 3.1h. Consider increasing the modifier.

Similar-job factors:

- bedrooms, bathrooms, property type, condition, pets
- service type, frequency, travel band, source
- outcome: accepted/lost/declined/no response

---

## 14. Lost Lead / Lost Quote Anonymisation

Lost quote data is useful, but personal details should not be kept longer than needed.

Trigger statuses:

- Lost
- Declined
- Not suitable
- No response
- Quote rejected
- Waiting too long

Default review period:

> 90 days after closed/lost

Prompt:

> This lost quote has been closed for 90 days. Review and anonymise client details?

Actions:

- Anonymise now
- Keep another 30 days
- Delete completely
- Mark converted/booked

Remove:

- name, phone, email
- full address, house number/name, street
- free-text direct identifiers
- prospect photos unless specific lawful reason to keep

Keep:

- postcode district/outward code e.g. DH7
- general area if not identifying
- service type, property type, bedrooms, bathrooms
- condition, pets, parking, frequency
- source channel
- quote amount/range
- suggested/final hours
- fit score, price-shopper risk, recommended action
- lost reason
- month/date of enquiry
- whether photos were requested/provided, without keeping photos
- rewritten non-identifying notes

Lost reason categories:

- Too expensive
- No reply
- Too far away
- Fully booked / no availability
- Wanted cheapest price
- Wanted unsuitable time/day
- Job too small
- Job too large/complex
- Access or parking issue
- Not a good fit
- Went with another cleaner
- Client cancelled need
- Other

Keep anonymisation log without deleted personal details:

```text
original enquiry ID, closed date, anonymised date,
who anonymised, action taken, photos deleted yes/no
```

---

## 15. Admin Information Architecture

Admin should be a working cockpit, not a demo dashboard.

Main modules:

1. Dashboard / Today
2. CRM / Leads
3. Clients & Homes
4. Quotes & Assessments
5. Schedule / Work Orders
6. Tasks / Reminders
7. Cleaner Reports / Quality
8. Accounting / Invoices
9. Messages / Email Templates
10. Files / Documents
11. Staff / Cleaner Management later
12. Settings

Preferred iPad/PC layout:

```text
Left sidebar: modules
Top bar: search + quick add + user
Main area: list/board/calendar
Right panel: selected record detail/actions
```

Admin cockpit principle:

The dashboard should answer:

```text
What is this?
Why does it matter?
What do I do next?
```

The UI should be action-led, not just data-led. Dashboard cards, lead rows, schedule blocks and task rows should surface the next sensible admin action wherever possible.

Compact layout rules:

- Avoid horizontal scrolling during normal admin use.
- Prefer compact grouped rows/cards over many narrow columns.
- Use short chips/tokens for repeatable facts, for example `3h`, `£75-90`, `DH7`, `3b / 2ba`, `Low risk`, `New`, `Quote sent`.
- Full labels, explanations and long notes belong in the right-side detail panel, not in table columns.
- Important dashboard metrics should be clickable filters where practical.
- `+ New` should eventually open a small menu for common create actions such as lead, task, job and client note.

Example compact row groups:

- Lead cell: name, area, preferred contact.
- Requirement cell: service type, frequency, bedrooms/bathrooms, pets/parking.
- Fit cell: fit score, price-shopper risk, estimated hours, suggested price/range.
- Status cell: current status and next action.

Preview rules:

- Desktop/PC may use hover preview cards for extra context.
- Tablet/touch must have a tap, long-press or info-button alternative because hover is unreliable.
- Preview cards should help scan without replacing the right-side detail panel.
- Preview cards must not show sensitive data unless the current user/route has permission.
- Cleaner-facing previews must only use safe assigned job data from `/api/cleaner/*`.

Useful preview content:

- Schedule/calendar jobs: address or area, cleaner, parking, pets, checklist summary, open follow-ups, special notes, invoice/status flags.
- Leads list: contact preference, property summary, Quote Assist summary, next action, latest note/task.
- Tasks: notes, linked lead/client/job, due date, next action.
- Invoices/accounting later: linked jobs, payment notes, due date, last reminder.

Admin field rendering rules:

- Do not render every editable field as a text input or textarea.
- Use dropdowns for controlled option groups.
- Use checkboxes for multi-select fields.
- Use toggles for yes/no values.
- Use date/time pickers for dates and times.
- Use numeric inputs for counts and hours.
- Use currency controls for prices and invoice amounts.
- Use duration controls for man-hours.
- Use textareas for notes and long free-text fields only.
- Use read-only badges/summaries for calculated fields such as Quote Assist.
- If a field does not have a safe editor yet, render it read-only rather than as a misleading free-text control.

Dashboard should show action queues:

- new leads needing reply
- quotes to chase
- assessments due
- today’s jobs
- missing reports
- invoices to send/overdue
- anonymisation reviews
- urgent tasks

Dashboard view controls:

- Dashboard: Today / This week.
- Leads: List / Board / Priority.
- Schedule: Day / Week / Month.

Quick filters and saved views:

- New leads
- Needs reply
- Quote sent
- Chase due
- High fit leads
- Waiting list
- Lost
- Due for anonymisation

Next-action strip:

Selected records should show a clear next-action strip near the top of the right-side detail panel.

Examples:

- Next action: Request photos.
- Buttons: Copy WhatsApp, Generate email, Mark contacted, Snooze, Add note.

Snooze/reminder workflow:

- Remind tomorrow
- Remind in 3 days
- Custom date
- Mark done

Contact logging:

Contact actions should allow admin to record what happened:

- Called, no answer
- Called, spoke
- WhatsApp sent manually
- Email sent manually
- Quote sent
- Photos requested

Recent activity:

Records should show a lightweight activity feed:

- lead created
- Quote Assist generated
- note added
- message copied/sent
- status changed
- task created/completed

Sidebar behaviour:

- Full sidebar on desktop.
- Collapsed/sidebar-light mode on smaller screens and iPad where needed.
- Labels or icons must be clear enough to avoid confusion.

### CRM / Leads

Pipeline for people who enquired but are not clients yet.

Statuses may include:

- New
- Contacted
- Needs info/photos
- Call needed
- Assessment suggested/booked
- Quote sent
- Accepted
- Lost
- No response
- Waiting list

Lead detail should show enquiry data, Quote Assist, notes, tasks and actions.

### Clients & Homes

CRM-style records for accepted/current/past clients and the homes/properties serviced.

Separate from Leads because not every enquiry becomes a client.

A client may later have multiple homes/properties.

Client/Home records later include:

- contact details
- active/paused/past status
- linked homes/properties
- internal Client Score / Client Memory
- access/parking/product/pet notes
- cleaning plans, jobs, invoices, documents
- complaints/praise/service history
- open follow-ups

Client Score / Client Memory is admin-only and belongs here, not in Leads or Quote Assist. It helps decide whether to prioritise, retain, review price, pause or avoid a client after they become accepted/current/past.

Simple internal rating:

```text
A = excellent client
B = good normal client
C = awkward but manageable
D = avoid / only premium / no renewal
```

Factors may include pays on time, easy access/parking, reasonable expectations, flexibility, recurring value, safe/pleasant working relationship, cleaner feedback, complaints/issues and repeated scope creep. Do not expose this to clients and do not over-share it with cleaners.

### Quotes & Assessments

Future module for desk assessments, home visits, quote drafts, quote sent/accepted/lost, quote expiry and T&C sent status.

### Schedule / Work Orders

Future operational calendar for jobs, cleaner assignment, duration, travel/area, status and notes.

Schedule items should show status and warnings where relevant:

- confirmed
- tentative
- needs confirmation
- completed
- cancelled
- no cleaner assigned
- travel tight
- conflict/overbooked

### Tasks / Reminders

First-class module. Includes lead follow-up, quote chase, assessment prep, invoices, file cleanup, anonymisation, staff/admin/vehicle/client-care tasks.

### Cleaner Reports / Quality

Future module for completed checklists, cleaner notes, follow-ups, issue/damage reports and admin review.

### Accounting / Invoices

Lightweight only: invoice records, paid/unpaid/overdue, CSV export, jobs ready to invoice.

### Settings / Data & Backups

GitHub protects code, not live D1 business data. Backups are an operational requirement once real client data exists.

MVP backup workflow:

- Settings -> Data & Backups
- Export all data
- Export selected data
- Export history/log
- Backup reminder settings

Manual export comes first. Export key D1 tables as CSV/JSON and save outside Cloudflare, for example OneDrive, local PC or external storage. Automatic scheduled backup can come later.

Every export should write an export log entry:

```text
date/time
export type: full backup / leads only / clients / jobs / invoices
tables included
record counts
exported by
file name
status: completed / failed
notes
linked backup task id if applicable
```

Backup reminders are normal admin tasks, not a separate reminder system. Settings should control enabled/disabled, frequency, day, priority, instructions, `last_backup_completed_at` and `next_backup_due_at`. Example task: `Urgent: Backup PandaZen data`.

Scheduled backup reminders are normal operation. Backup-before-risky-deploy is a separate deployment safety rule.

### Messages / Email Templates

Start with outbound templates and logs, not full email inbox.

Useful templates:

- enquiry received
- request photos
- quote sent
- quote follow-up
- booking confirmation
- visit reminder
- reschedule/running late
- invoice/payment reminder
- review request
- no availability/waiting list
- lost quote close
- marketing only if opted in

Stage 1: generate copy/manual send.  
Stage 2: send via system and log.  
Stage 3: inbound email integration much later.

### Files / Documents

Future: quote/job photos, insurance, DBS, terms, client docs, staff docs, invoices. Use file references in D1 and dedicated storage later.

### Settings

Editable dropdowns/settings later:

- lead source/status/lost reason
- service type/contact preference/frequency
- job status/room/checklist/staff role
- invoice status
- policy versions
- quote/pricing settings
- email templates

---

## 16. Cleaner App / Cleaner View Strategy

Plan separate cleaner experience instead of permission-hiding admin data.

Recommended route:

```text
/admin/        full admin cockpit
/cleaner/      cleaner app/mobile/PWA view
/api/admin/*   admin APIs
/api/cleaner/* restricted cleaner APIs
```

Cleaner should see only assigned safe job data:

- today’s jobs
- job time/window
- client/property reference
- address/access notes only when needed
- parking, pets, products, safety notes
- checklist
- open follow-ups for that job/property
- start/complete buttons
- completion notes
- issue/unable-access/extra-time report

Cleaner should not see:

- leads, quotes, prices, invoices
- client profitability
- marketing consent
- lost lead/admin-only notes
- all clients/homes
- business settings

Build stages:

1. Mobile web cleaner view
2. PWA cleaner app
3. Native app only if justified later

Offline-capable PWA is possible later.

First offline scope:

- cache today’s assigned jobs/checklists/notes
- allow checklist ticks and notes offline
- save pending report locally
- show `Not synced yet`
- sync when online

Avoid early:

- offline photo uploads
- complex conflict resolution
- creating clients/jobs offline
- storing full schedule/client database offline

Security:

- require login
- revoke cleaner access
- store only near-term assigned jobs offline
- no prices/admin data offline
- clear local cache after day/logout where practical

---

## 17. Future Core Workflow

Master long-term workflow:

```text
Lead → Quote Assist → Assessment/Quote → Accepted → Client & Home → Cleaning Plan → Job → Report → Follow-Up → Invoice
```

Current build only:

```text
Lead → Quote Assist → Admin Review → Next Action
```

Future modules:

- Assessment: builds from lead data; desk/call/home/photo-supported assessment
- Cleaning Plan: recurring plan with frequency, cleaner, default checklist
- Job/Work Order: one scheduled visit from plan or manual booking
- Checklist: unlimited plan/job checklist items
- Follow-Up: carry “do this next time” notes forward
- Invoice: lightweight tracking and CSV export
- Staff: cleaner/admin profiles, availability, documents, absence
- Files: references to secure storage, temporary retention rules

---

## 18. Suggested Build Order

### Phase 0 — Security Foundation

- Cloudflare domain onboarding
- Cloudflare Access for `/admin/*`
- Cloudflare Access for all sensitive APIs
- protect `/api/*` during transition, or remove/migrate legacy `/api/*` routes before protecting only `/api/admin/*`
- decide admin login users
- no real data before protection

### Phase 1 — Lead Capture Foundation

- leads table
- lead_notes table
- admin_tasks table
- lead_quote_assist table
- public enquiry submit API
- validation/honeypot/rate limits
- `public_submission_attempts` table or equivalent short-term anti-spam event storage
- new lead creates follow-up task
- admin lead list/detail
- status update and notes

### Phase 2 — Quote Assist Foundation

- `_quoteAssist.js`
- rule-based scoring
- run on lead creation/review
- store output
- display Quote Assist panel
- fit score, risk, hours, price range, confidence, next action

### Phase 3 — Lost Reasons + Anonymisation Hooks

- lost/no-response/not-suitable status handling
- `closed_at`
- `anonymise_after = closed_at + 90 days`
- future review task/workflow

### Phase 4 — Assessment Module

- assessment prefilled from lead
- structured property/scope data
- man-hours and quote notes

### Phase 5 — Clients & Homes + Cleaning Plans

- convert accepted lead to client/home
- create cleaning plan
- default checklist

### Phase 6 — Schedule + Jobs

- manual/generate jobs
- reschedule/cancel
- assign cleaner/helper
- status flow

### Phase 7 — Cleaner Experience

- mobile job list
- job report/checklist
- completion/follow-up notes
- later PWA/offline

### Phase 8 — Invoicing

- missing report alerts
- admin review
- invoice-ready jobs
- invoice records and CSV export

### Phase 9 — Files, Staff, Business Reminders

- uploaded file references
- photo cleanup prompts
- staff profiles/absence/documents
- renewals and business reminders

---

## 19. Module Lifecycle, Deployment and Blueprint Hygiene

Each module should follow this cycle:

```text
Plan → Build → Test → Deploy → Accept → Compress blueprint → Move to next module
```

Module statuses:

```text
[Planned]
[In build]
[Built - needs testing]
[Accepted]
[Deferred]
```

After a module is accepted, compress its blueprint section. Keep only:

- what was built
- current data/API structure
- important rules/constraints
- known limitations
- unresolved follow-up questions
- next module instructions

Remove or archive:

- old debate/thinking notes
- repeated explanations
- obsolete options
- temporary Codex prompts
- details that are now represented clearly in code/migrations

The master blueprint should stay around 5k–8k words where possible. The most detailed section should always be the current/next build module.

If one module becomes too large, split it into a separate module spec later, but keep this blueprint as the control document.

### Deployment rules

For each update:

1. Keep changes small and named.
2. Add one migration if needed.
3. Deploy/package current site.
4. Apply D1 migration if needed.
5. Test with junk data.
6. Mark module status.
7. Move to next module only after current slice works.
8. Compress accepted sections after deployment/acceptance.

Avoid mixing unrelated work:

- no public design changes while wiring invoice APIs
- no admin nav redesign while adding assessment fields
- no schema/CSS polish mixed unless necessary
- no future module implementation unless explicitly selected

### Production vs preview D1 safety

Once PandaZen is operational:

```text
Production site = real clients / real D1 database
Preview/dev site = fake/test clients / test D1 database
```

Preferred setup: same GitHub repo, Cloudflare PR previews for testing, and separate D1 databases/bindings for production vs preview/dev. PR previews must not write to the real production D1 database once real client data exists.

Normal CSS/content-only changes usually need preview testing only. Database/API/data-affecting changes require:

```text
1. test on preview/dev D1 with junk data
2. export/backup production D1 before merge/deploy
3. confirm rollback plan
4. merge/deploy
5. smoke test production with minimal safe checks
```

Data-affecting changes include D1 migrations, lead/client/job/task APIs, delete/anonymise logic, bulk updates, import/export logic, auth/security and settings that affect automation/tasks.

Backup/export is mandatory before production deployments that change schema, data-writing APIs, deletion/anonymisation, bulk updates, import/export or auth/security.

---

## 20. Current MVP State

Already present/planned:

- public website
- early enquiry form
- admin shell
- lead board
- schedule/jobs/invoice previews
- D1 migrations
- Cloudflare Functions API
- focused form pattern
- Privacy Policy and Terms & Conditions
- PP checkbox and marketing checkbox

Still required before real use:

- Cloudflare Access protection
- protect legacy `/api/*` routes or remove/migrate them before storing real data
- proper form submit wiring
- final enquiry field review
- endpoint security/anti-spam
- short-term hashed rate-limit event storage and Privacy Policy wording
- quote assist table/helper/output
- admin lead review panel
- lead notes
- admin tasks/reminders
- lost lead anonymisation hooks
- settings/dropdown editor later
- files/photos later
- sensitive client data handling later

---

## 21. Open Design Questions

Current module:

1. Standard hourly target rate?
2. One-off/deep clean premium?
3. Ideal/borderline/too-far service radius?
4. Fixed per visit vs internal hourly pricing?
5. Should client ever see hourly rate?
6. Exact initial lead statuses?
7. Quote Assist automatic on lead creation or when admin opens lead?
8. Exact Privacy Policy version/date method?
9. Marketing opt-out workflow?
10. Source-tagged QR/link tracking method?

Future:

11. Cleaner view: mobile web, PWA, or native later?
12. Exact fields safe for `/api/cleaner/*`?
13. Which details visible to cleaners and when?
14. Hide full address/access until job day?
15. Photo upload limits and retention?
16. Auto-created task rules?
17. Essential assessment fields?
18. Minimum invoice/accounting fields?
19. Staff/HR scope in year one?
20. Google Calendar integration timing?

---

## 22. Codex / Agent Guidance

The repo should include a short `AGENTS.md` file for Codex. This file should contain stable build rules, not the full product blueprint.

Recommended use:

- `AGENTS.md` = permanent coding/project rules Codex should always follow
- `docs/admin-operations-blueprint.md` = full product/control blueprint
- prompt to Codex = exact current module/task only

`AGENTS.md` should be kept short and stable. Do not copy the whole blueprint into it.

### Codex usage policy

Use the conversation for planning, business logic, design discussion and issue drafting. Use GitHub issues as focused work orders. Use Codex for one clear issue/PR at a time.

Good Codex work:

- focused implementation
- bug fixes
- focused docs updates
- tests and verification
- specific PR review fixes

Avoid using Codex for vague brainstorming, large mixed rewrites, small wording debates or unrelated work bundled into one PR.

Every Codex issue should include:

```text
Purpose
Scope
Allowed files/areas if known
Explicit exclusions
Required behaviour
Acceptance criteria
Manual test steps where possible
```

PR safety rules:

- keep PRs small enough to test in 5-15 minutes where possible
- bigger PRs are allowed only when they are one logical module with clear acceptance criteria
- check changed scope matches the issue
- test the Cloudflare preview before merge
- do not mix hidden demo/fake data with real workflows
- if DB/API/data-affecting, use preview/dev D1 and backup production before live merge once operational

Efficient flow:

```text
1. Discuss here
2. Create focused GitHub issue
3. Send Codex one compact prompt referencing the issue
4. Test preview
5. Send Codex back only for specific fix comments
6. Merge only when accepted
```

---

## 23. Codex Instruction Block for Next Build

```text
Work only on the Lead Capture + Quote Assist foundation.

Goal:
Create the database/API/admin structure for public PandaZen enquiries and first-pass quote intelligence.

Build:
- leads table or migration updates for current enquiry form fields
- lead_notes table
- admin_tasks table
- lead_quote_assist table
- public lead creation API
- admin lead list/detail API
- admin lead status update
- admin note creation
- automatic follow-up task creation for new leads
- rule-based quote assist helper
- quote assist output saved against each lead
- admin display of quote assist summary
- Privacy Policy acknowledgement storage
- marketing opt-in storage
- short-term hashed anti-spam/rate-limit event storage
- lost reason fields and anonymise_after hook

Do not build clients, jobs, invoices, staff, file uploads or scheduling in this step.
Do not redesign the website/admin UI except where needed to display this workflow.
Do not add T&C acceptance to the enquiry form. T&C belongs at quote/booking stage.
Keep changes modular and document what was changed.
Use test/junk data only until admin and API routes are protected.
```
