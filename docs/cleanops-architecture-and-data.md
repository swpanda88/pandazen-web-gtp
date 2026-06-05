# CleanOps Architecture and Data Semantics

This document serves as the **single source of truth** for the current PandaZen/CleanOps operational model, data semantics, and high-level app direction. It replaces the legacy `/admin` and Assessment-first workflow architectures.

For detailed layout, overlay, action-panel, modal, workspace, and button rules, use `docs/cleanops-ui-design-guide.md` as the UI source of truth.

---

## 1. Direction and Build Principles

* **Direction**: `/cleanops` is the future app direction. The old `/admin` cockpit is legacy, fallback, and reference only.
* **Inspiration**: CleanOps is Jobber-inspired in layout/UX, but it is not a direct clone.
* **Frontend-led API**: Do not wire real D1, API, or backend services until the key frontend layouts and data semantics are stable. The frontend should define the required API and data shape first; the backend will implement it later.
* **Current Foundations**: Schedule v0, Clients v0, Requests v0, and Quotes v0 establish the desired app style and frontend-led data semantics.
* **Current CleanOps Status**:

  * **Schedule v0**: Built and refined.
  * **Clients / Properties v0**: Built and refined.
  * **Requests v0**: Features request list/detail, client enquiry vs internal quote prep separation, Request Review drawer, Quote Assist, missing-info checklist, and request → quote readiness flow.
  * **Quotes v0**: Built. Features a quote register, overlay editor, catalogue item selection, templates, and document status tracking.
* **Known Limitations / Not Implemented Yet**:

  * Everything is currently frontend/mock-only with no real persistence after reload.
  * No D1/API backend wiring.
  * No real email sending, payment handling, or real PDF storage/download.
  * Playwright/browser smoke testing is problematic in some environments due to missing `playwright-core`; DOM/VM smoke has been used instead.
  * Quote Assist is currently mock/rule-based, not true AI/backend logic.
  * Catalogue and templates are currently mock foundations, not fully editable settings pages.
* **Next Build Priorities**:

  1. **Finish visual review and merge order**:

     * Merge PR #89 (Requests v0) first.
     * Then update/rebase PR #90 (Quotes v0) onto the new base.
     * Then merge PR #90 (Quotes v0).
  2. **Stabilise mock flows/regression**.
  3. **Jobs v0 next**:

     * Follow the Jobs workflow documented in `docs/cleanops-jobs-workflow.md`.
     * Convert accepted quote → Job Plan / work order.
     * Link job to client/property/source quote.
     * Distinguish between recurring job plans and one-off jobs.
     * Generate scheduled jobs/cleans from recurring job setup, rather than dumping unscheduled recurring work into Schedule.
  4. **Schedule integration**:

     * Schedule is the calendar view of generated scheduled jobs/cleans.
     * Use Schedule mainly for alterations, exceptions, one-off jobs, ad-hoc extras, rescheduling, and capacity checking.
  5. **Billable event / invoice foundation**:

     * Completed/approved scheduled jobs create billable events.
     * Billable events later become invoice lines.
     * Invoice line items should derive from the same catalogue as quote items.
  6. **Later backend/API/D1 wiring** only after frontend/data semantics are stable.
  7. **Later Settings/library**:

     * Manage service/product catalogue, quote templates, reusable text snippets, terms/exclusions.
  8. **Later real document/email flow**:

     * Generate/store real PDFs, email quotes, and support online accept/reject workflows.
  9. **Later customer-facing portal/payment features**.

---

## 2. Core Functional Hierarchy

The new operational flow relies on strict, structural object boundaries.

```text
Client / Customer
  -> Property / Home / Location
    -> Request / Assessment
      -> Quote
        -> Job Plan
          -> Scheduled Job / Clean
            -> Job Report
              -> Billable Event
                -> Invoice / Payment
```

### Definitions
* **Client**: A person, company, contact, or billing container.
* **Property**: The physical place where work happens.
* **Request**: An enquiry or work need. Assessment and scoping are part of the Request for now.
* **Quote**: A commercial offer.
* **Job Plan**: The accepted service/control record created from an accepted quote. For recurring work, it defines cadence, defaults, checklist, duration, team, and billing basis.
* **Scheduled Job / Clean**: A dated occurrence generated from a Job Plan and shown on the Schedule/calendar. User-facing wording should prefer "Scheduled clean" or "Scheduled job" over making "Visit" a heavy separate module.
* **Job Report**: The completion record showing what happened after a scheduled job/clean.
* **Billable Event**: Completed, chargeable work created from an approved scheduled job/report before or linked to an invoice.
* **Invoice**: The accounting/commercial document.

### Jobs and Schedule Boundary

Jobs decides what work exists and under what rules. Schedule is the calendar view of generated scheduled jobs/cleans and the place for visual adjustments, exceptions, one-off placements, staff/time changes, and capacity checking.

For recurring work, the Job Plan setup must create the repeating schedule pattern. Do not design recurring work so it creates dozens of unscheduled items that must be manually arranged on the Schedule page.

Normal recurring cleans should follow an all-good fast path: if the clean is completed, checklist is complete, and there are no remarks, issues, extra time, no-access events, or complaints, CleanOps should store the report quietly, create/prepare the billable event, avoid creating action-board noise, and leave the next generated scheduled clean in place.

Jobs v0 should use only three action-panel groups: Needs setup, Needs review, and Ready to bill. Issues, complaints, no access, and urgent problems belong inside Needs review with severity chips rather than a separate Issues column.

Invoices should be created from billable events produced by completed/approved work. Do not invoice directly from the parent Job Plan unless a later explicit contract/monthly billing model supports that behaviour.

---

## 3. UI and UX Patterns

CleanOps UI work must follow `docs/cleanops-ui-design-guide.md`.

At architecture level, the main rule is consistency:

- list/register screens should use the approved register pattern
- record screens should use the approved workspace/detail pattern
- complex editors should use the approved large overlay or layered workspace patterns
- small confirmations should use the approved centered modal pattern
- Jobs, Quotes, Requests, Clients, Invoices, and future Schedule work should reuse the same underlying shell, spacing, cards, buttons, and interaction logic

This file defines the architecture and data semantics. The design guide defines the approved visual and interaction patterns.

---

## 4. Data Semantics and Field Rules

CleanOps must avoid letting random labels or manual tags become the data model.
* Chips and UI labels must come from **structured fields** or **derived logic**.
* Manual tags may exist later, but they must not replace core operational data.

### 4.1 Client Data
The Client record is a simple shell. It holds identity, contact info, billing context, and status. It **must not** contain the full cleaning scope, nor act as a request or assessment form.

**Included Fields**:
* Display name
* Client type (Individual / Company)
* Company name
* First / Last name
* Email
* Phone
* Status
* Lead source
* Billing address
* Internal notes
* Timestamps

### 4.2 Property Data
The Property record holds the long-lived practical setup for a specific physical location.

**Included Fields**:
* Property type
* Bedrooms
* Bathrooms
* Default service type
* Cadence
* Preferred day
* Preferred time window
* Access method
* Parking
* Pets present
* **Cleaning products supplied by**
* **Vacuum / Hoover supplied by**
* **Mop supplied by**
* Property notes
* Cleaning notes

**Important Rules for Properties**:
* Do not create a separate "cloths" or "consumables" field. This is duplicated effort; "cleaning products supplied by" covers this.
* **Limit free-text**. Rely on structured dropdowns where possible. Free-text is limited strictly to `property notes`, `cleaning notes`, and `internal notes`.

### 4.3 Client-Friendly Capture Rule
Fields must be realistic and normal for a cleaning customer to provide.

**Do not ask intrusive, spying, or risk-assessment style questions** (e.g., "pet behaviour", "angry dog", "biohazard", "heavy clutter", "difficult customer", "high-value property").

*If a client volunteers practical information such as "the dog is friendly but jumps up" or "the key safe is behind the gate", it belongs in the `property notes`.*

### 4.4 Request Data
A Request is not the same as a Client.

**Website Enquiry Flow**:
1. Request arrives.
2. System creates/finds the Client shell.
3. System creates/finds the Property shell.
4. The Request is attached to the Client + Property.
5. Client status can remain Lead/Prospect. Request status = "New enquiry".

**Manual Request from Client Detail**:
1. Client is already known.
2. Choose selected/existing/new Property.
3. Create the Request with service and assessment details.

### 4.5 Quotes and Workflow Decisions
Quotes represent a commercial offer created from a Request or manually.

**Quote Workflow Principles**:
1. Quotes page behaves like a quote document register (grouped by status: Drafts, Sent to customer, Accepted / converted, Archive).
2. The quote builder/editor is not a permanent full page. Editing happens in an overlay/modal/drawer.
3. Quote history/options/versions are visible in the register/list.
4. Quote document/PDF generation is represented by an A4 document/print view.
5. Customer-facing documents/previews must never include internal notes, Quote Assist, scope confidence, missing checklists, or internal scoping notes unless explicitly copied into client-facing fields.

**Quote Status Flow**:
* Draft → Mark ready to send → ready_to_send
* Ready to send → Mark sent to customer → sent
* Sent/viewed → Mark accepted or Mark rejected
* Accepted → Convert to job
* Rejected/expired/superseded/archived → Archive section

**Quote Revision Rules**:
* Draft and `ready_to_send` quotes are editable.
* Sent, viewed, accepted, rejected, expired, superseded, and converted quotes are guarded/read-only.
* To change a used quote, create a revision. To offer a different option, create an alternative quote.
* Quote refs use a version format (e.g., Q-2089/01, Q-2089/02).

**Catalogue, Templates, and Billable Items**:
* Quote items must be selected from a reusable service/product catalogue, not random hardcoded rows.
* Catalogue items carry structure (id, code, name, description, unit/rate/amount, billing type, billable flag) to later map to billable events and invoice line items.
* Billing types: `one_off`, `per_visit`, `monthly`. (Optional is a separate flag, not a billing type).
* Quote templates assemble catalogue items plus reusable client-facing text.

**Request → Quote Relationship**:
* Quote uses request as source/context but remains a separate commercial document.
* Request-linked quotes pull property/service/context into client-facing quote text where appropriate.
* The source request context is internal and not automatically sent to the customer.

---

## 5. Reference Documentation

The following documents serve as external supporting reference for the operational guidelines driving CleanOps:
* `docs/cleanops-software-specification.md`
* `docs/cleanops-jobber-manual.md`
* `docs/cleanops-jobs-workflow.md`
