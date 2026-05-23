# PandaZen Functional Architecture

## 1. Purpose

PandaZen Admin exists to run a boutique home-cleaning business from first enquiry through assessment, quoting, delivery, billing, and follow-up.

It should help admin answer practical questions quickly:

- who the customer is
- which property the work is for
- what scoped work is being priced or delivered
- what commercial status the work is in
- what the next operational action is
- which visits are scheduled, completed, unbilled, or paid

PandaZen should stay lean. It is not trying to become a large enterprise CRM, accounting suite, or workforce-management platform.

## 2. Locked core hierarchy

The core object chain is:

```text
Client / Customer
  -> Property / Home / Location
    -> Assessment / Scoped Work
      -> Quote
        -> Job / Work Order
          -> Visit / Appointment
            -> Billable Event
              -> Invoice / Payment
```

Supporting entry object:

```text
Lead
  -> may become first Client + Property + Assessment
```

Supporting cross-cutting objects:

```text
Task
Note
```

Locked rules:

- Client / Customer is the top relationship object.
- Property / Home / Location sits under Client.
- Invoice address defaults to the service address.
- If billing address differs, it is a billing address under Client, not a second work object.
- Assessment is the internal scoped-work record.
- Quote is the commercial offer.
- Accepted Quote creates or enables a Job / Work Order shell.
- Job / Work Order is the operational delivery container.
- Visit / Appointment is the scheduled occurrence.
- Completed Visit creates a Billable Event.
- Invoice Builder selects unbilled Billable Events and generates an Invoice.
- Do not use `work_label` as workflow identity.

## 3. Object definitions

### Lead

**Purpose**
- Raw enquiry and early triage record.

**Created when**
- A public web enquiry, phone enquiry, or manual admin enquiry is logged before PandaZen has decided this is active client work.

**Owns**
- initial contact details
- rough area and service request
- early qualification data
- Quote Assist inputs/outputs
- early follow-up and loss/no-response history

**Must not own**
- long-term client history
- repeat job history
- accepted customer relationship
- invoice history

**Relationships**
- may produce the first Assessment
- may later become or link to Client + Property

### Client / Customer

**Purpose**
- The relationship, payer, main contact, and long-term customer record.

**Owns**
- customer identity
- main contact details
- relationship status
- linked properties
- billing address if different from service address
- linked assessments, quotes, jobs, visits, invoices, tasks, and notes

**Must not own**
- all scoped-work detail as one undifferentiated blob
- property-specific logistics mixed into client identity
- duplicate work/address objects just for billing

**Relationships**
- one Client can have multiple Properties
- one Client can have multiple Assessments across one or more Properties

### Property / Home / Location

**Purpose**
- The place where work happens.

**Owns**
- service address and area
- property attributes relevant to cleaning
- access/logistics context
- home-specific notes

**Must not own**
- the whole customer relationship
- commercial quote lifecycle
- invoice lifecycle

**Relationships**
- belongs to one Client
- can have multiple Assessments
- can have multiple Jobs and Visits over time

### Assessment / Scoped Work

**Purpose**
- Internal scoped-work record for one piece of work being understood, priced, reviewed, or prepared.

**Created from**
- a Lead for new business
- an existing Client / Property for extra or follow-up work
- future complaint/review/follow-up workflow if needed

**Owns**
- service and scope context for this specific piece of work
- property/access details relevant to the assessment
- internal assessment notes
- quote-prep data
- quote linkage

**Must not own**
- the whole client relationship
- the permanent property master record
- job execution checklist history
- invoice history

**Relationships**
- may originate from one Lead
- belongs logically to one Client and one Property context
- can have multiple Quote versions
- accepted Quote may produce Job / Work Order

### Quote

**Purpose**
- Commercial offer made from an Assessment.

**Owns**
- commercial version and reference
- commercial scope presentation
- sent / accepted / rejected / expired state
- quote-specific notes and validity terms

**Must not own**
- the full internal scoping conversation
- delivery execution history
- payment history

**Relationships**
- belongs to one Assessment
- may link to one Client
- accepted Quote creates or enables Job / Work Order shell

### Job / Work Order

**Purpose**
- Delivery container for accepted work.

**Created when**
- a Quote is accepted and moved to delivery
- or a recurring Cleaning Plan / Recurring Job is created from accepted recurring work

**Owns**
- operational job spec
- work status
- assignment and scheduling linkage
- follow-up operational notes

**Must not own**
- raw lead qualification data
- quote version history
- invoice/payment history

**Relationships**
- derived from accepted work
- can have one or more Visits
- can generate billable events through completed Visits

### Recurring Job / Cleaning Plan

**Purpose**
- Repeating delivery pattern for recurring cleaning.

**Created when**
- accepted Quote confirms recurring work such as weekly, fortnightly, or monthly cleaning.

**Owns**
- recurrence pattern
- default duration
- default cleaner/team if known
- service window preferences
- operational cleaning-plan notes

**Must not own**
- every visit as manually duplicated job records
- invoice/payment state

**Relationships**
- sits as a recurring Job / Cleaning Plan under Client + Property
- generates Visits for a selected horizon, e.g. 1w / 2w / 4w
- generated schedule items are Visits, not Jobs

### Visit / Appointment

**Purpose**
- Scheduled occurrence of a Job or recurring service.

**Created when**
- one-off work is scheduled
- recurring plan generates upcoming occurrences
- unscheduled work is dragged into a date/time slot in the scheduler

**Owns**
- planned date/time/window
- cleaner/team assignment
- duration
- visit status
- visit-specific notes and completion outcome

**Must not own**
- the whole job definition
- quote lifecycle
- customer master record

**Relationships**
- belongs to one Job / Work Order or recurring Cleaning Plan
- completed Visit creates a Billable Event

### Billable Event

**Purpose**
- Chargeable work item created after a Visit or other agreed chargeable action becomes billable.

**Created when**
- Visit is completed
- no-access/cancellation charge is confirmed
- an extra chargeable item is approved

**Owns**
- billable date
- source object, usually Visit
- description
- amount/hours/rate where applicable
- billed/unbilled state

**Must not own**
- the full invoice document
- the whole visit/job history

**Relationships**
- belongs to Client and usually Property/Visit
- selected by Invoice Builder when unbilled
- once invoiced, links to invoice line/source reference

### Invoice

**Purpose**
- Payment request for one or more Billable Events.

**Created when**
- Invoice Builder selects unbilled Billable Events and generates an invoice.

**Owns**
- invoice number
- invoice lines
- amount due
- issue/due/paid/void status
- billing address snapshot

**Must not own**
- raw scoping notes
- full job planning state
- customer relationship notes unrelated to billing

**Relationships**
- belongs to one Client
- may include one or more Billable Events
- payment state lives on Invoice/Payment, not on Job or Visit alone

### Task

**Purpose**
- Operational reminder or action item.

**Relationships**
- may link to Lead, Client, Property, Assessment, Quote, Job, Visit, Invoice, or Billable Event

### Note

**Purpose**
- Human context and history.

**Rule**
- Notes must not carry workflow-critical status that belongs in structured fields.

## 4. Lifecycle flows

### New web enquiry

```text
Public enquiry
-> Lead
-> Lead review + Quote Assist
-> Assessment
-> Quote
-> accepted Quote
-> Client + Property
-> Job / Work Order
-> Visit
-> Billable Event
-> Invoice / Payment
```

### Existing client extra work

```text
Existing Client
-> existing Property or new Property context
-> Assessment
-> Quote
-> accepted Quote
-> Job / Work Order
-> Visit
-> Billable Event
-> Invoice / Payment
```

Rules:

- existing-client Assessments link by `client_id`
- keep `lead_id = NULL` unless a separate explicit lead workflow is requested
- do not create duplicate Client
- do not create duplicate Lead

### Accepted quote

```text
Assessment
-> Quote accepted
-> create/link Client
-> create/link Property
-> create Job / Work Order shell
-> Job Builder prepares operational spec
```

Job creation should start with a controlled/manual confirmation step. Later automation can be added only if it proves useful.

### Recurring clean

```text
Assessment
-> Quote
-> accepted Quote
-> Recurring Job / Cleaning Plan
-> generated Visits for chosen horizon
-> completed Visits
-> Billable Events
-> periodic Invoice(s)
```

Recurring generated schedule items are Visits, not new Jobs.

### One-off clean

```text
Assessment
-> Quote
-> accepted Quote
-> one Job / Work Order
-> one or a few Visits
-> completed Visit(s)
-> Billable Event(s)
-> Invoice
```

## 5. Scheduler model

The scheduler should be global, compact, and Visit-oriented.

It should optimise for:

- date/time/day view
- cleaner/team
- duration
- property/location/postcode
- visit status
- unscheduled Visits waiting to be placed

Locked scheduler UX direction:

- schedule items shown on the calendar are Visits
- unscheduled Visits can be dragged into a day/hour view
- recurring plans generate Visits for a selected horizon such as 1w / 2w / 4w
- the scheduler should not create a new Job every time a recurring clean appears on the calendar
- Visit cards should stay compact: customer, postcode/location, duration, cleaner, status
- deeper detail opens in the Workspace Action Panel / record workspace, not by bloating the calendar card

## 6. Billing and invoice v0 model

Billing should follow completed billable work, not replace the work model.

Locked billing chain:

```text
Visit completed
-> Billable Event created
-> Invoice Builder selects unbilled Billable Events
-> Invoice generated
-> Payment status tracked
```

Invoice Builder rules:

- invoices belong to Client
- invoice address defaults to service address
- different billing address is a Client billing address, not a new work location
- one Invoice may include one or more Billable Events
- do not assume one Job = one Invoice
- do not assume one Visit = one Invoice
- unbilled Billable Events should remain visible until invoiced/voided

## 7. Global vs client-local views

### Global views

Global views should show cross-customer working queues:

- Leads needing triage/follow-up
- Assessments needing scoping, quoting, or close-out
- Quotes needing send/chase/decision
- Jobs needing operational preparation
- unscheduled/scheduled Visits
- Tasks due
- unbilled Billable Events
- Invoices needing send/payment follow-up

### Client-local views

Client-local views should show work history and active work for one customer/property context:

- client identity and contact details
- property context
- linked Assessments
- linked Quotes
- linked Jobs / Visits
- linked Billable Events / Invoices
- linked Tasks and Notes

Do not duplicate the same business object as a second hidden copy inside Client & Home.

## 8. Naming/display rules

- Global rows should show customer/client name first.
- Property/address should appear second.
- Service and purpose belong in structured columns, not fused into a confusing title string.
- Do not use `work_label` as normal workflow identity.
- Use structured display identity: client, property, service, purpose, status, quote/job/visit/invoice reference.
- Avoid duplicated address strings in the same row/card.
- Client & Home headers should not imply one single service/frequency for the whole client.
- Jobs and Visits must display operational status separately from quote status.

## 9. Required fields and readiness model

Required fields should be minimal.

UX rule:

- required/invalid fields use a thin red border until valid
- do not block broad testing with excessive required fields
- use readiness warnings for quote/schedule/invoice stages
- warnings should explain what is missing and why it matters

Stage examples:

- Quote readiness: enough client/property/scope/pricing data to prepare a commercial offer
- Job readiness: accepted Quote plus minimum operational spec
- Schedule readiness: Job/Visit duration, property/location, date/time/window, cleaner if required
- Invoice readiness: at least one unbilled Billable Event, Client, billing address, invoice line amount

## 10. Reuse-first architecture principle

Do not design every module from scratch.

Reuse where sensible:

- Quote Builder pattern for Job Builder and Invoice Builder
- Quote Preview pattern for invoice preview and job summaries
- Assessment Wizard table/grid layout for structured data entry
- Workspace Action Panel pattern for Jobs, Visits, Billable Events, and Invoices
- existing status/version/history patterns where they fit the object lifecycle

Reuse does not mean forcing the wrong abstraction. Reuse the interaction pattern and layout logic, while keeping object ownership clean.

## 11. Data discipline

Fields should exist only if they help to:

- contact the client
- identify the property
- estimate price or time
- plan access/logistics
- help the cleaner do the job
- create quote/job/visit/invoice records
- track status or history

Avoid:

- vanity labels as main identity
- duplicated summary fields
- optional fields nobody will fill
- free text where structured dropdowns are better
- carrying the same address/service string in multiple places without clear reason

Prefer:

- dropdowns for service, frequency, status, and purpose
- numeric fields for rooms, hours, counts, and price
- textareas only for genuinely open narrative

## 12. Status model

Recommended lean statuses:

### Lead

- new
- contacted
- waiting_customer
- assessment_needed
- closed_converted
- closed_not_suitable
- closed_lost
- closed_no_response

### Assessment

- draft
- in_progress
- review_needed
- ready_to_quote
- quote_created
- quote_sent
- waiting_customer
- converted
- not_proceeding

### Quote

- draft
- sent
- accepted
- rejected
- expired
- void
- superseded

### Client

- active
- inactive
- archived

### Job / Work Order

- draft
- ready_to_schedule
- scheduled
- in_progress
- completed
- cancelled

### Visit / Appointment

- unscheduled
- scheduled
- in_progress
- completed
- no_access
- cancelled
- rescheduled

### Billable Event

- unbilled
- invoiced
- void

### Invoice

- draft
- issued
- part_paid
- paid
- overdue
- void

## 13. Remaining scope decisions before dev

These are the real remaining decisions, not a reason to reopen the whole architecture:

- exact minimum Assessment fields for quote readiness
- exact Job Builder v0 fields
- exact Visit card fields and day/week scheduler layout
- exact Invoice Builder v0 grouping options
- whether Property gets its own table before Job/Visit work or remains transitional for one more slice
- how much cleaner-facing address/access detail is shown and when

## 14. Implementation guardrails

Future AG and Codex prompts must follow these rules:

- Do not collapse Client and Property into one permanent conceptual object.
- Do not make Location the top hierarchy object.
- Do not use `work_label` as normal workflow identity.
- Existing-client Assessments must link by `client_id` and use `lead_id = NULL` unless explicitly routed through Lead.
- Assessment is internal scoped work, not Quote and not Job.
- Quote is commercial offer, not delivery.
- Accepted Quote creates/enables Job / Work Order shell.
- Recurring clean is a Recurring Job / Cleaning Plan that generates Visits.
- Schedule items are Visits.
- Completed Visits create Billable Events.
- Invoice Builder selects unbilled Billable Events.
- Do not silently sync Assessment edits back into Client & Home.
- Do not silently sync Client & Home edits back into historical Lead or Assessment records.
- Keep global queue views and client-local history views aligned to the same underlying objects, not duplicated shadow records.
- Avoid schema expansion unless it strengthens the locked object boundaries.
