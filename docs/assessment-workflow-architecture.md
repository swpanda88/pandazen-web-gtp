> [!WARNING]
> **LEGACY REFERENCE**: This document refers to the old `/admin` monolithic architecture and the `Lead -> Assessment` workflow. The current development focus is the Jobber-inspired `/cleanops` application. See `docs/cleanops-architecture-and-data.md` for current guidelines.

# Assessment Workflow Architecture

This note records the agreed direction for Assessments, Client & Home, quotes, jobs and invoices.

It is a planning/specification document only. It does not replace `docs/admin-operations-blueprint.md`, but should be folded into the blueprint when the next major documentation sync happens.

---

## Core Principle

```text
Assessment = source-of-truth document for one scoped chunk of work.
Quote = commercial offer based on that assessment.
Job / checklist = operational execution based on that assessment plus accepted quote.
Invoice = selected billable events grouped into a payment request.
```

Do not treat an assessment as one phone call, one visit, one photo review or one cleaner comment.

Instead:

```text
One Assessment = one proposed scope of work.
Phone calls, home visits, photos, admin edits and cleaner comments are updates to that same Assessment.
```

---

## Object Separation

```text
Lead = raw enquiry / early triage
Assessment = scoped work document
Quote Assist = internal recommendation / guidance
Quote Builder = selected modules and commercial quote lines
Quote = commercial offer / promise
Client & Home = accepted customer/property hub
Cleaning Plan = recurring operational agreement
Job / Work Order = actual scheduled/completed work
Billable Event = chargeable item
Invoice = selected billable events grouped for payment
Payment = money received / reconciliation later
```

Important rule:

```text
Do not make the quote the operational source of truth.
```

The quote is simplified and client-facing. The Assessment contains the work detail that can feed both Quote Builder and future Job Builder.

---

## New Prospect Flow

```text
Web form
-> Lead
-> Assessment created from lead data
-> admin adds phone/photo/visit details into same Assessment
-> Quote Assist
-> Quote Builder
-> Quote
-> Accepted Quote
-> Client & Home
-> Cleaning Plan / Jobs later
```

The web form only starts the Assessment. The Assessment becomes the richer work-scope document.

---

## Existing Client New Work Flow

Existing clients may ask for new one-off or extra work. This is still sales/quote work and must not be hidden inside one client record.

Flow:

```text
Client & Home
-> + New Assessment
-> system pulls client/home defaults
-> Assessment appears in global Assessments queue
-> define scope
-> Quote Assist if useful
-> Quote Builder
-> Quote
-> Accepted
-> Job / Checklist / Billable Event later
```

Client/home defaults that should be pulled into a new Assessment where available:

- client name
- contact details
- address / area / postcode
- parking / access notes
- pets
- product preferences
- known home details
- relevant cleaner/internal notes where safe

The new Assessment must be linked to the existing Client/Home from the start.

Do not create a duplicate client.

---

## Global Assessments Queue

All scoped/quoteable work must appear in the global Assessments queue, whether it comes from a new lead or an existing client.

This prevents new quote opportunities from being buried inside dozens of Client & Home records.

```text
Assessments module = global sales/scope work queue
Client & Home -> Assessments tab = filtered view of assessments for that client/home
```

Same Assessment record, two views.

Examples that should appear in the global Assessments queue:

- new prospect regular cleaning assessment
- existing client after-builders clean
- existing client after-party one-off clean
- spring clean request
- oven/window extra if separately quoted
- cleaner follow-up that needs a quote/decision
- complaint/review if it creates chargeable or corrective work

---

## Client & Home Role

Client & Home is the operational hub for accepted customers/properties.

Future Client & Home tabs should trend toward:

```text
Overview
Contact / Access
Home Details
Cleaning Plan
Assessments
Quotes
Jobs / Visits
Invoices
Notes / Tasks
```

Invoices should appear inside Client & Home as a filtered client view. There should also be a global Accounting view later for all invoices, unpaid invoices, overdue invoices and exports.

```text
Client & Home -> invoices for this client/home
Accounting -> all invoices / unpaid / overdue / export
```

---

## Base Recurring Work vs One-Off Work

Base recurring work:

```text
Base Assessment
-> accepted regular quote
-> Cleaning Plan
-> recurring jobs/checklists
```

Regular recurring visits do not need a new Assessment every time. They inherit the base Cleaning Plan unless the scope changes.

Separate one-off/extra work:

```text
Client & Home
-> New Assessment
-> separate quote if needed
-> job/checklist if accepted
-> billable event / invoice later
```

Examples of separate one-off/extra assessments:

- after-builders clean
- after-party clean
- spring clean
- one-off deep clean
- guest / B&B turnover batch
- post-tenant reset
- oven/window/cupboard extra if separately priced

---

## Assessment Acceptance / Linking Rules

For a new prospect Assessment:

```text
lead_id = source lead
client_id = null until accepted/conversion
home_id = null until accepted/conversion
```

When accepted:

```text
Accepted Quote / accepted Assessment
-> create Client/Home if not already existing
-> link Assessment to the new Client/Home
```

For an existing-client Assessment:

```text
lead_id = null unless there is a specific linked lead source
client_id = existing client
home_id = existing home/property
```

When accepted:

```text
Do not create a new Client/Home.
Keep linked to the existing Client/Home.
Create future job/checklist/billable work from the accepted Assessment/Quote.
```

The Assessment should not be moved between modules. It is one record with links, visible in both the global Assessments queue and the filtered Client & Home view.

---

## Quote Builder vs Job Builder

Quote Builder answers:

```text
What are we offering commercially, and at what price?
```

Future Job Builder answers:

```text
What exactly should the cleaner do on site?
```

Both should draw from the Assessment.

```text
Assessment
-> Quote Builder
-> Quote

Assessment + Accepted Quote
-> Job Builder
-> Cleaner checklist / work order
```

Example:

```text
Quote line:
After-builders clean - £240

Cleaner checklist may include:
- remove building dust from skirting/floor edges
- wipe kitchen units if agreed
- clean bathrooms
- exclude paint/adhesive removal unless agreed
- bring extra cloths/dust mask
- access from 9am
```

The quote alone is too simplified to be the operational checklist source.

---

## UI Naming Direction

Long term, the current `Q&A` module may become:

```text
Assessments
```

Reason:

- `Q&A` sounds like new enquiry paperwork.
- `Assessments` can cover prospect assessments, existing-client extra-work assessments and cleaner follow-up assessments.

Do not rename immediately unless selected as a focused issue. For now, issue #71 should remain focused on editable workspace details.

---

## Immediate Build Scope Still Unchanged

Current selected coding issue remains:

```text
#71 Add editable details to Q&A and Client & Home workspaces
```

This should still build:

- section-level Edit / Save / Cancel for Q&A Details
- section-level Edit / Save / Cancel for Client & Home key details
- no autosave
- no hidden cross-table sync
- change logging where practical

Do not add the full Assessment architecture, Job Builder, invoices or module library inside issue #71.

---

## Future Suggested Build Order

After issue #71:

```text
Assessment architecture refinement
- clarify Q&A as Assessments
- allow Assessments linked to Lead or Client/Home
- global Assessments queue for new/existing-client work

Configurable Quote/Scope Module Library
- module names
- default wording
- default prices/hours/rates
- recurring yes/no
- selected by default
- assessment/checklist defaults

Accepted Quote -> Client & Home / Cleaning Plan seed

Job Builder / Cleaner checklist

Billable Events + Invoices
```

Security/API namespace hardening may need to be pulled forward before real customer data is used.
