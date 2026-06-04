# CleanOps Architecture and Data Semantics

This document serves as the **single source of truth** for the current PandaZen/CleanOps operational model, data semantics, and UI direction. It replaces the legacy `/admin` and Assessment-first workflow architectures.

---

## 1. Direction and Build Principles

* **Direction**: `/cleanops` is the future app direction. The old `/admin` cockpit is legacy, fallback, and reference only.
* **Inspiration**: CleanOps is Jobber-inspired in layout/UX, but it is not a direct clone.
* **Frontend-led API**: Do not wire real D1, API, or backend services until the key frontend layouts and data semantics are stable. The frontend should define the required API and data shape first; the backend will implement it later.
* **Current Foundations**: `Schedule v0`, `Clients v0`, `Requests v0`, and `Quote Builder v0` establish the desired app style and frontend-led data semantics.
* **Next Priority**: `Jobs v0` should follow the Jobs workflow documented in `docs/cleanops-jobs-workflow.md`. Dashboards should be built last, only once real queues/data exist.

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

---

## 3. UI and UX Patterns

List pages should share a consistent, predictable pattern across the app, as established in the `Clients` and `Quotes` screens:
* **Page Layout**: Page title -> Subtitle -> Search/Filter row -> Table/Card list.
* **Right-side Panel**: An optional right-side helper panel for context.
* **Client Detail**: A workspace view reached from the Clients list.

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

---

## 5. Reference Documentation

The following documents serve as external supporting reference for the operational guidelines driving CleanOps:
* `docs/cleanops-software-specification.md`
* `docs/cleanops-jobber-manual.md`
* `docs/cleanops-jobs-workflow.md`
