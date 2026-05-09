# Panda Zen Admin Operations Blueprint

This document is the working map for the Panda Zen admin system. Its job is to keep the build modular, avoid constant backbone changes, and make each new block easier to design, test and deploy.

## Product Intent

Panda Zen needs a simple operations system for a small, trust-led domestic cleaning business.

The system should support:

- Manual enquiry handling and booking by admin.
- Bespoke quoting with no public prices.
- A client-facing enquiry form that gathers enough information to decide the next step without feeling intrusive.
- Home assessment records that become the source of truth.
- Recurring cleaning plans and generated work orders.
- Cleaner checklists and job reports.
- Follow-up notes that carry into the next visit.
- Internal admin tasks and reminders.
- Simple invoice tracking and CSV export.
- Temporary photo/file references for enquiries and jobs.
- Secure access before real customer data is stored.

The first version should be useful with one admin and one cleaner, but structured so more cleaners, staff records and permissions can be added later.

## Build Principles

- Keep the public website, admin shell, API routes and database migrations loosely coupled.
- Add features as modules rather than reshaping the whole app every time.
- Prefer focused form pages for serious data entry.
- Keep the admin dashboard for scanning, filtering and quick review.
- Use dropdowns wherever possible, with `Other` fields for exceptions.
- Allow repeatable rows for rooms, checklist items, notes, documents and reminders.
- Store enough structure to reduce typing later.
- Do not store real customer data until `/admin/*` and `/api/*` are protected.
- Keep accounting lightweight: invoice records and CSV export, not full accounts.
- Keep large files out of D1. Store file references in D1 and put files in dedicated storage later.
- Treat enquiry/job photos as temporary unless admin deliberately marks them to keep.
- Use tasks/reminders before automation when deletion or follow-up needs human judgement.

## Stable Backbone

These parts should change slowly.

```text
/admin/
  index.html          Main admin shell, dashboard, lists, schedule
  admin.css           Shared admin UI styling
  admin.js            Shared admin UI behaviour

/admin/forms/
  form.css            Shared focused-form styling
  form.js             Shared focused-form behaviour
  *.html              One form page per serious workflow

/functions/api/
  _util.js            Shared API helpers
  <module>.js         Module API list/create routes
  <module>/<id>.js    Module API update routes

/migrations/
  0001_*.sql          Foundation schema
  0002_*.sql          Seed/demo data
  000x_*.sql          Small module migrations

/docs/
  *.md                Setup, security and workflow documents
```

When adding a new feature, prefer:

- one migration,
- one or two API routes,
- one admin list/detail change,
- one focused form page if data entry is serious,
- one short docs update.

## Data Architecture

MVP uses one Cloudflare D1 database for structured business data.

This means one database, with separate linked tables such as:

- leads
- assessments
- clients
- cleaning plans
- jobs
- checklist items
- follow-ups
- invoices
- staff
- admin tasks
- uploaded file references
- options/settings

D1 should store business records and file metadata only. It should not store large binary files.

Files/photos should later use dedicated storage, likely Cloudflare R2 or another secure file store. D1 stores references such as storage key, linked record, expiry date and keep/delete status.

This keeps the system suitable for the Cloudflare free/low-cost path while leaving room to grow.

## Core Objects

### Lead

Purpose: capture a client-facing enquiry before it becomes an assessment, quote or client.

Key data:

- customer name
- phone/email
- area
- postcode, optional
- enquiry source
- service type
- preferred contact method
- best time to contact
- preferred days/times
- property type
- bedrooms/bathrooms
- approximate property size
- cleaning priorities
- preferred frequency
- urgency
- pets
- parking
- product preferences
- optional customer notes
- optional temporary photo references
- status
- notes

Main statuses:

- New
- Contacted
- Assessment booked
- Quote sent
- Accepted
- Lost

Client-facing wording should avoid implying every enquiry gets a free visit. Prefer CTAs like:

- `Request a cleaning quote`
- `Tell us about your home`
- `Start an enquiry`
- `Request a call back`
- `Check availability`

Preferred CTA: `Request a cleaning quote`.

The enquiry form should explain that Panda Zen may quote after reviewing the enquiry and a short call, or may suggest a home visit for larger, regular or more complex work.

### Assessment

Purpose: structured follow-on assessment record and basis for quote, client record and cleaning plan.

Assessment should build from the lead/enquiry data, not start from zero.

Key data:

- linked lead/client
- assessment date/time
- property basics
- rooms/areas
- surfaces/materials
- pets
- access/parking
- safety/risk notes
- product preferences
- estimated man-hours
- suggested frequency
- draft checklist
- quote notes

Assessment may be:

- desk assessment from submitted enquiry plus follow-up call
- in-person home visit for suitable regular or complex jobs
- photo-supported review for end-of-tenancy, deep clean or unusual one-off jobs

### Client

Purpose: long-term customer record.

Key data:

- customer identity
- preferred name/reference
- area
- contact details
- private address/access notes
- active/inactive status
- linked assessments
- linked cleaning plans
- linked invoices/documents

Sensitive data should be treated carefully. Full address, keys, alarm codes and access instructions should be protected and not shown casually.

### Cleaning Plan

Purpose: reusable plan for recurring jobs.

Key data:

- client
- service type
- frequency
- default day/time
- estimated/default man-hours
- main cleaner
- helper/cover
- standing instructions
- product notes
- default checklist
- active/inactive status

### Job / Work Order

Purpose: one scheduled visit, generated from a cleaning plan or created manually.

Key data:

- client
- cleaning plan
- date/time
- job type
- status
- main cleaner
- helper
- man-hours
- special instructions
- copied checklist
- completion notes
- submitted/reviewed timestamps

Useful statuses:

- Scheduled
- In progress
- Completed by cleaner
- Reviewed by admin
- Invoice ready
- Cancelled
- Rescheduled

### Checklist

Purpose: task list for cleaning plan or individual job.

Key data:

- parent type: plan or job
- label
- room/area
- required/optional
- completed
- cleaner note
- sort order

Checklists must allow unlimited items.

### Follow-Up

Purpose: carry “do this next time” notes from one job to the next.

Key data:

- client
- source job
- target job, optional
- note
- status
- created by
- created/resolved dates

Example: client asks for extra kitchen time, cleaner skips study, note says `Follow up next visit: clean study shelves`.

### Invoice

Purpose: lightweight invoice tracking and accounting export.

Key data:

- invoice number
- client
- invoice date
- job/date range
- amount
- status
- paid date
- notes

Main statuses:

- Draft
- Sent
- Paid
- Overdue
- Cancelled

### Staff

Purpose: staff/cleaner records, inspired partly by tools like BrightHR but kept small.

Key data:

- name
- role
- contact details
- active/inactive
- availability
- documents
- training/DBS notes
- absence/holiday records

This can wait until the core cleaning workflow is working.

### Uploaded File / Document

Purpose: file references for enquiry photos, business documents, staff documents and client records.

Examples:

- enquiry photos
- end-of-tenancy condition photos
- DBS certificate
- insurance
- assessment PDF
- signed agreement
- client notes
- invoice file

Likely storage later: Cloudflare R2 or another secure document store. For MVP, document records can be references only.

Large files should not be stored in D1. D1 stores metadata and links.

Suggested data:

- linked type: lead, assessment, job, staff, business
- linked id
- file name
- storage key/url
- file type
- uploaded by
- uploaded at
- expires at
- keep permanently: yes/no
- deleted at

Photo retention policy:

- enquiry photos are temporary decision-support files
- keep while lead/job is active
- prompt admin to review/delete after rejection, decline or completion
- auto-delete can come later after the process is trusted
- regular-client photos are only kept if admin marks them as important

### Admin Task / Reminder

Purpose: operational prompts and manual to-dos that stop things being forgotten.

Examples:

- assessment needs quote
- missing cleaner report
- invoice not sent
- invoice overdue
- DBS renewal
- follow up a client
- review expired enquiry photos
- renew insurance
- MOT/service car
- order uniforms
- staff induction
- call client before first clean

Key data:

- title
- notes
- task type
- status
- priority
- due date
- due time
- linked type
- linked id
- assigned to
- repeat rule, optional
- completed at
- created at

Useful statuses:

- Open
- Scheduled
- Done
- Cancelled

Useful task types:

- Lead follow-up
- Quote
- Invoice
- File cleanup
- Business admin
- Staff
- Vehicle
- Client care
- Other

Tasks can be manual at first. Later, the system can create them automatically, for example:

- new enquiry creates follow-up task
- quote sent creates chase task
- expired photos create cleanup review task
- completed job creates invoice task
- annual insurance renewal creates reminder

## Main Workflows

### 1. Website Enquiry To Admin Review

1. Customer chooses `Request a cleaning quote`.
2. Website form gathers contact, location, service, property basics, priorities, timing and optional photos.
3. Form creates lead.
4. System creates/admin shows a follow-up task.
5. Admin reviews enquiry and decides next step:
   - quote after form review and call
   - arrange home visit
   - ask for more detail/photos
   - politely decline/not a fit
6. Lead status changes to the correct next state.

Modules involved:

- Leads
- Client-facing enquiry form
- Uploaded file references, optional
- Admin tasks/reminders

### 2. Lead Review To Assessment Or Quote

1. Admin contacts customer manually where needed.
2. Admin uses submitted form information as the starting point.
3. Admin either prepares a quote, creates a desk assessment, or books a home visit.
4. Home visit is only used when suitable and worthwhile.
5. Lead status changes to `Assessment booked` or `Quote sent`.

Modules involved:

- Leads
- Assessment form
- Admin tasks/reminders
- Schedule, if visit is booked

### 3. Assessment To Quote

1. Admin opens focused assessment form.
2. Assessment is prefilled or informed by website enquiry data.
3. Admin records property, safety and cleaning scope.
4. Admin estimates man-hours.
5. Admin drafts checklist and quote notes.
6. Admin sends bespoke quote manually.
7. Lead status changes to `Quote sent`.

Modules involved:

- Assessment form
- Clients
- Cleaning plans
- Uploaded file/document references later

### 4. Accepted Quote To Client

1. Customer accepts quote.
2. Admin creates/activates client record.
3. Admin creates cleaning plan.
4. Admin sets frequency, cleaner and default checklist.
5. Lead status changes to `Accepted`.

Modules involved:

- Clients
- Cleaning plan form
- Settings/dropdowns

### 5. Cleaning Plan To Jobs

1. Admin reviews next month/week.
2. Admin generates jobs from active cleaning plans.
3. Admin checks schedule and adjusts manually.
4. Admin assigns helper if needed.
5. Jobs appear in schedule and cleaner view.

Modules involved:

- Cleaning plans
- Jobs
- Schedule
- Staff later

### 6. Job Checklist To Completion Report

1. Cleaner opens job report page.
2. Cleaner reviews instructions/checklist.
3. Cleaner ticks completed items.
4. Cleaner adds notes and follow-ups.
5. Cleaner submits report when online.
6. Admin reviews if needed.
7. Job becomes `Invoice ready`.

Modules involved:

- Job report form
- Checklists
- Follow-ups
- Jobs

Offline note: full offline sync is not MVP. Initial workaround is submit when connection is available.

### 7. Follow-Up To Next Visit

1. Cleaner/admin creates follow-up note.
2. Follow-up stays open against client.
3. Next job shows open follow-ups.
4. Cleaner/admin resolves follow-up after completion.

Modules involved:

- Follow-ups
- Jobs
- Cleaner report

### 8. Completed Jobs To Invoice Export

1. Admin reviews completed jobs.
2. Admin creates invoice record manually.
3. Invoice marked sent/paid.
4. Admin exports invoice CSV.
5. CSV is checked against bank/accounting records.

Modules involved:

- Jobs
- Invoices
- Exports

### 9. File Cleanup Prompt

1. Enquiry/job photos are uploaded as temporary files.
2. File records get an expiry date.
3. When lead/job becomes rejected, declined, completed or stale, system creates a cleanup review task.
4. Admin chooses delete, keep or extend.
5. Later, trusted cleanup rules may auto-delete expired temporary files.

Modules involved:

- Uploaded files/documents
- Admin tasks/reminders
- Leads
- Jobs

### 10. Staff Absence And Cover

Later workflow.

1. Staff absence/holiday is recorded.
2. Schedule highlights affected jobs.
3. Admin assigns helper/cover.
4. Cleaner/client continuity notes are visible.

Modules involved:

- Staff
- Schedule
- Jobs
- Reminders

## Admin Capabilities

### Dashboard

Purpose: quick daily overview.

Should show:

- leads needing reply
- assessments due
- today/next jobs
- missing job reports
- open follow-ups
- due/overdue admin tasks
- invoices needing action
- small rolling calendar

### Lead Board

Purpose: simple Asana-style pipeline.

Capabilities:

- view by status
- open lead detail
- create intake
- mark contacted
- book assessment
- convert to client later

### Client-Facing Enquiry Form

Purpose: gather enough information from the public website to support a sensible admin decision without making the customer feel exposed or interrogated.

Capabilities:

- friendly `Request a cleaning quote` CTA
- clear expectation that a quote may come after review/call, or a visit may be suggested
- dropdowns/checkboxes for most fields
- optional notes
- optional photo attachments later
- creates lead record
- creates admin follow-up task

Suggested customer-facing field groups:

- contact details
- area/postcode
- preferred contact and best contact time
- service type
- property type
- bedrooms/bathrooms
- cleaning priorities
- frequency/timing
- urgency
- pets
- parking
- products preference
- optional notes
- optional photos

### Schedule

Purpose: plan work and check availability.

Capabilities:

- month navigation
- Monday to Sunday layout
- filters by client, cleaner, status
- job click opens detail
- later: reschedule/cancel/create job
- later: staff absence overlay

### Client Records

Purpose: source for ongoing relationship.

Capabilities:

- view client summary
- view plans/jobs/invoices/follow-ups
- open cleaning plan form
- later: document references

### Staff Records

Purpose: lightweight cleaner/admin management.

Capabilities later:

- profile
- availability
- absence/holiday
- assigned jobs
- document references

### Admin Tasks / Reminders

Purpose: internal to-do list for admin work and business reminders.

Capabilities:

- create manual task
- due date/time
- priority
- assign to admin/staff later
- link to lead/client/job/invoice/file
- repeat annual/monthly reminders later
- show compact list on dashboard
- full task page for filtering and planning
- support prompted cleanup rather than risky automatic deletion

Examples:

- follow up new lead
- send quote
- review expired photos
- chase invoice
- renew insurance
- MOT/service car
- order uniforms
- staff induction

### Focused Forms

Purpose: clean, private, low-distraction data entry.

Current form pages:

- intake
- assessment
- cleaning plan
- job report
- invoice record

Rules:

- every form has Back, Save draft and Submit
- no busy admin lists behind the form
- split into a few clear steps only when it reduces clutter
- avoid one-question-per-page unless genuinely needed
- dropdown first, free text only where useful
- repeatable lists for flexible items

### Settings

Purpose: make dropdowns editable without code.

Likely groups:

- lead source
- service type
- contact preference
- lead status
- job status
- frequency
- room type
- checklist category
- staff role
- invoice status

Settings should become a module after core forms are connected to D1.

### Exports

Purpose: backup and accounting/admin checks.

MVP exports:

- invoices CSV
- jobs CSV
- clients CSV

Later exports:

- leads
- assessments
- staff/absence
- follow-ups

## Module Template

Each module should be designed using this checklist.

```text
Module name:
Purpose:
Primary users:
Core data:
Sensitive data:
Statuses:
Admin screens:
Focused forms:
API routes:
Database tables:
Exports:
Permissions later:
Test data:
Done when:
```

## Suggested Build Order

### Phase 0: Security Foundation

Goal: protect admin and API before real data.

Tasks:

- finish Cloudflare domain onboarding
- set Cloudflare Access for `/admin/*`
- set Cloudflare Access for `/api/*`
- decide admin login users
- confirm no real data before protection

### Phase 1: Form Data Foundation

Goal: make the client-facing enquiry and focused forms store useful structured data.

Tasks:

- public website CTA changes to `Request a cleaning quote`
- client-facing enquiry form submits to leads
- enquiry form creates an admin follow-up task
- optional photo upload design is prepared, with D1 storing references only
- assessment form saves structured assessment data
- cleaning plan form saves plan and checklist
- job report form updates job checklist and follow-ups
- invoice form saves invoice record

### Phase 2: Admin Tasks And Lead Review

Goal: make the admin dashboard useful as a daily operating cockpit.

Tasks:

- admin task table/API
- task list page
- compact dashboard task list
- manual task creation
- lead follow-up task generation
- file cleanup review task shape

### Phase 3: Client And Plan Workflow

Goal: make accepted work turn into repeatable jobs.

Tasks:

- convert accepted lead to client
- create cleaning plan from assessment or accepted enquiry
- edit default checklist
- generate jobs from cleaning plan

### Phase 4: Schedule And Job Control

Goal: make the calendar operational.

Tasks:

- create manual job
- reschedule job
- cancel job
- assign cleaner/helper
- status flow from scheduled to reviewed

### Phase 5: Cleaner Experience

Goal: make the cleaner report usable on mobile.

Tasks:

- mobile job list
- focused job report page
- checklist completion
- completion notes
- follow-up next visit
- submit when back online if signal was poor

### Phase 6: Admin Review And Invoicing

Goal: close the loop from work done to money tracked.

Tasks:

- missing report alerts
- admin review step
- invoice-ready jobs
- invoice records
- invoice CSV export

### Phase 7: Files, Staff And Business Reminders

Goal: add operational support without heavy HR complexity.

Tasks:

- uploaded file references
- temporary photo cleanup prompts
- staff profiles
- absence/holiday
- document references
- renewal tracking

## Deployment Approach

Cloudflare Pages deploys the site as a project, but development should still be modular.

For each meaningful update:

1. Keep changes small and named.
2. Add one migration if database changes are needed.
3. Package the current site into a zip.
4. Upload/deploy.
5. Apply migration in D1 if needed.
6. Test with junk data.
7. Only then move to the next module.

Avoid mixing unrelated work, for example:

- do not change public website design while wiring invoice APIs
- do not redesign admin navigation while adding assessment fields
- do not change database schema and CSS polish in the same step unless necessary

## Current MVP State

Already present:

- public Panda Zen website
- public website enquiry form, early version
- admin shell
- lead board
- schedule view
- jobs table
- cleaner checklist preview
- invoice/export preview
- D1 migrations
- Cloudflare Functions API
- follow-up table/API
- focused form page pattern
- admin operations blueprint

Still to do before real use:

- Cloudflare Access protection
- proper form submit wiring
- public CTA/enquiry wording update
- exact client-facing enquiry field review
- exact assessment field review, based on enquiry data
- admin tasks/reminders module
- uploaded file reference model and retention rules
- settings/dropdown editor
- job status transitions
- admin review step
- safer handling for sensitive client data

## Open Design Questions

- Which client details must be visible to cleaners?
- Should full address/access notes be hidden until job day?
- Which enquiry fields feel helpful rather than intrusive?
- Which photo uploads should be allowed, and what maximum size/count?
- What default expiry period should temporary enquiry photos use?
- Which admin tasks should be auto-created first?
- What exact assessment fields are essential versus nice to have?
- What are the minimum invoice fields for accounting checks?
- How much staff/HR functionality is useful in year one?
- Should cleaner job reports support photo uploads later?
- Should Google Calendar integration wait until jobs are stable?

## Next Recommended Step

Review this blueprint, then choose one module to wire properly.

Recommended next module: `Client-facing enquiry`.

Reason: the assessment should build from the website enquiry, not start from zero. The public form and CTA need to collect enough structured information for admin to quote, call, arrange a visit, request photos, or decline without repeatedly asking basic questions.
