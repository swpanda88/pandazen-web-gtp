> [!NOTE]
> **SEE NEW DIRECTION**: The current development focus is the Jobber-inspired `/cleanops` application. See `docs/cleanops-architecture-and-data.md` for the single source of truth regarding the new architecture and data semantics.

# PandaZen Functional Architecture

## 1. Purpose

PandaZen Admin exists to run a boutique home cleaning business from first enquiry through quoting, delivery, follow-up, and later invoicing.

It should help admin answer a few practical questions quickly:

- who is this customer
- which property is the work for
- what scoped work are we pricing or planning
- what is the current commercial status
- what is the next operational action

PandaZen should stay lean. It is not trying to become a large enterprise CRM. The architecture should support trust-led domestic cleaning operations without blurring core object boundaries.

## 2. Core hierarchy

```text
Client / Customer
  -> Property / Home / Location
    -> Assessment / Scoped Work
      -> Quote
        -> Job / Work Order
          -> Visit / Appointment
            -> Invoice / Payment
```

Supporting entry object:

```text
Lead
  -> may become a Client + Property + first Assessment
```

Supporting cross-cutting objects:

```text
Task
Note
```

## 3. Object definitions

### Lead

**Purpose**
- Raw new enquiry and early triage record.

**When created**
- When a public web enquiry, phone enquiry, or manual admin enquiry is logged before PandaZen has decided this is active client work.

**What it owns**
- initial contact details
- rough area and service request
- early qualification data
- Quote Assist inputs and outputs
- early follow-up and loss/no-response history

**What it must not own**
- long-term operational client history
- repeat job history
- accepted customer relationship
- invoice history

**Key relationships**
- may produce the first Assessment
- may later become or link to a Client and Property

### Client

**Purpose**
- The relationship, payer, main contact, and long-term customer record.

**When created**
- When PandaZen accepts or converts work into an active customer relationship.

**What it owns**
- customer identity
- main contact details
- billing context
- relationship status
- linked properties
- linked assessments, quotes, jobs, visits, invoices, tasks, and notes

**What it must not own**
- all scoped-work detail as one undifferentiated blob
- one-off quote-prep notes that belong to a specific Assessment
- property-specific logistics mixed into the client identity without structure

**Key relationships**
- one Client can have multiple Properties
- one Client can have multiple Assessments across one or more Properties
- invoice address defaults to the service address unless separate billing details are stored under the Client billing context

### Property / Home / Location

**Purpose**
- The place where work happens.

**When created**
- When a property is known well enough to be stored as an operational service location.

**What it owns**
- address and area
- property attributes relevant to cleaning
- access and logistics context
- home-specific notes

**What it must not own**
- the whole customer relationship
- commercial quote lifecycle
- generic task history unrelated to that property

**Key relationships**
- belongs to one Client
- can have multiple Assessments
- can have multiple Jobs and Visits over time
- service address is normally the default invoice address unless Client billing details override it

### Assessment / Scoped Work

**Purpose**
- Internal scoped-work record for one piece of work being understood, priced, or reviewed.

**When created**
- From a Lead for new business
- From an existing Client / Property for extra or follow-up work
- From future internal follow-up or review workflow if needed

**What it owns**
- service and scope context for this specific piece of work
- property and access details copied or corrected for this assessment only
- internal assessment notes
- quote-prep data
- quote linkage

**What it must not own**
- the whole client relationship
- the permanent property master record
- job execution checklist history
- invoice history
- separate invoice-address workflow

**Key relationships**
- belongs to one Client and one Property context logically, even if current storage is transitional
- may originate from one Lead
- can have multiple Quote versions
- may later produce a Job / Work Order after accepted Quote

### Quote

**Purpose**
- Commercial offer made from an Assessment.

**When created**
- After PandaZen has enough assessment information to price and propose work.

**What it owns**
- commercial version and reference
- commercial scope presentation
- sent / accepted / rejected / expired state
- quote-specific notes and validity terms

**What it must not own**
- the entire internal scoping conversation
- delivery execution history
- payment history

**Key relationships**
- belongs to one Assessment
- may link to one Client
- accepted Quote creates the first Job / Work Order shell in the delivery chain

### Job / Work Order

**Purpose**
- Delivery container for accepted work.

**When created**
- Immediately after a Quote is accepted as the first delivery shell, or later extended from an agreed recurring plan.

**What it owns**
- the operational instruction set for the work being delivered
- work status
- build-ready delivery specification created from Quote + Assessment + Client/Property data
- assignment and scheduling linkage
- follow-up operational notes

**What it must not own**
- raw lead qualification data
- quote version history
- invoice payment history

**Key relationships**
- derived from accepted work
- recurring cleaning in v0 is represented as a Recurring Job / Cleaning Plan under one Client + Property
- recurring Job / Cleaning Plan generates Visits for a selected planning horizon such as 1 week, 2 weeks, or 4 weeks
- can have one or more Visits
- can generate billable events later

### Visit / Appointment

**Purpose**
- Scheduled occurrence of a Job or recurring service.

**When created**
- When a Job or recurring plan produces a scheduled occurrence on a specific date/time/window.

**What it owns**
- planned or completed occurrence data
- timing
- attendance/completion status
- visit-specific notes

**What it must not own**
- the whole job definition
- quote lifecycle
- customer master record

**Key relationships**
- belongs to one Job / Work Order
- generated Visits are the scheduled occurrences that appear in the Scheduler
- completed Visit creates the Billable Event that later feeds invoicing

### Invoice

**Purpose**
- Payment request for completed billable work.

**When created**
- After work is billable and ready to charge.

**What it owns**
- invoice number
- invoice lines
- amount due
- issue/due/paid status
- invoice address, which defaults from the service address unless separate Client billing details override it

**What it must not own**
- raw scoping notes
- full job planning state
- customer relationship notes unrelated to billing

**Key relationships**
- belongs to one Client
- is generated from selected unbilled Billable Events, not directly from the Quote
- may include work from one or more Visits or Billable Events

## 3.1 Data readiness model

PandaZen should keep required fields minimal and separate readiness from hard creation rules.

Use four readiness levels:

- **Required to create record**
- **Recommended / required to quote accurately**
- **Required to schedule**
- **Required to invoice**

Rules:

- Do not make all Assessment fields required.
- Missing critical fields should show readiness warnings rather than blocking the whole workflow.
- Empty required/invalid fields should use a thin red border until valid data is entered.
- Once valid data is entered, the border should disappear.

Examples:

- Assessment can be created with minimal data.
- Assessment is not quote-ready until it has enough pricing or scope detail.
- Visit is not schedule-ready until service address, duration, and cleaner/time are defined.
- Invoice is not invoice-ready until completed unbilled Billable Events exist.

This keeps data entry practical without allowing half-defined records to masquerade as quote-ready, schedule-ready, or invoice-ready.

## 3.2 Module build principle

PandaZen should build modules as coherent v0 units, not one-field micro-patches. This is a mandatory build rule.

Before building a module, define:

- purpose
- object ownership
- required data
- statuses
- screens / tabs
- actions
- upstream / downstream links
- acceptance tests
- existing PandaZen structure to reuse

The module spec must explicitly answer:

- Can this reuse Quote Builder structure?
- Can this reuse Quote Preview structure?
- Can this reuse Assessment Wizard table/grid structure?
- Can this reuse Workspace Action Panel structure?
- What genuinely needs a new pattern because the object purpose is different?

Then implement the smallest complete version that satisfies those rules.

Before creating a new module pattern, first identify:

- which existing PandaZen structure it should reuse
- what must be different because the object purpose is different
- what must not be rebuilt from scratch

Reuse-first principle:

- Quote Builder should inform Job Builder, Invoice Builder, and future structured document builders.
- Quote Preview should inform invoice preview, job/work-order summary, and client-facing confirmations where sensible.
- Quote lifecycle/versioning patterns should inform invoice lifecycle and job-spec revision handling where needed.
- Assessment Wizard and compact table/grid layouts should inform Job Builder intake/spec screens and Visit readiness screens.
- Workspace action panel patterns should be reused across Jobs, Visits, Invoices, and client-local tabs unless a different interaction is clearly necessary.

### Task

**Purpose**
- Operational reminder or action item.

**When created**
- When admin or automation identifies something to do next.

**What it owns**
- title
- due date
- linked object reference
- completion state

**What it must not own**
- the full business record it points to
- hidden workflow state that should live on the real object

**Key relationships**
- may link to Lead, Client, Property, Assessment, Quote, Job, or Invoice

### Note

**Purpose**
- Human context and history.

**When created**
- Whenever admin needs to preserve useful context that does not deserve a dedicated structured field.

**What it owns**
- timestamped free-text context
- note type if available

**What it must not own**
- status logic that should live in structured fields
- key identity data that belongs in dedicated fields

**Key relationships**
- may attach to Lead, Client, Assessment, Quote, Job, or Invoice

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
-> Invoice
```

### Phone enquiry

```text
Manual admin capture
-> Lead
-> Assessment when qualified
-> Quote
-> accepted Quote
-> Client + Property
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
-> Invoice
```

For existing-client-created Assessments:

- link by `client_id`
- keep `lead_id = NULL`
- do not create duplicate Client
- do not create duplicate Lead

### Accepted quote

```text
Assessment
-> Quote accepted
-> create or link Client
-> create or link Property
-> create Job / Work Order shell
-> later schedule Visit(s)
```

For existing clients:

- accepted quote must stay linked to the existing Client
- it must not create a duplicate Client

### Rejected quote / lost work

```text
Lead or Assessment
-> Quote rejected / expired / lost
-> keep commercial learning
-> keep status history
-> retain only appropriate identity data per retention rules
```

### Recurring clean

```text
Assessment
-> Quote
-> accepted Quote
-> Recurring Job / Cleaning Plan
-> repeated Visits
-> completed Visits create Billable Events
-> Invoice Builder selects unbilled Billable Events
-> periodic Invoices later
```

### One-off clean

```text
Assessment
-> Quote
-> accepted Quote
-> one Job / Work Order shell
-> one or a few Visits
-> completed Visits create Billable Events
-> Invoice Builder selects unbilled Billable Events
-> Invoice later
```

### Complaint / follow-up

```text
Existing Client / Property
-> Assessment
-> may or may not produce Quote
-> accepted Quote or approved follow-up
-> Job / Work Order shell if needed
```

### Job / Visit / Billing v0 chain

```text
Accepted Quote
-> Job / Work Order shell
-> Job Builder builds the operational job specification from Quote + Assessment + Client/Property data
-> recurring work is represented as a Recurring Job / Cleaning Plan under Client + Property
-> recurring Job / Cleaning Plan generates Visits for a selected planning horizon
-> Scheduler shows Visits globally with cleaner / duration / location emphasis
-> completed Visit creates Billable Event
-> Invoice Builder selects unbilled Billable Events
-> Invoice is generated from selected Billable Events
```

### Scheduler v0 principle

- Scheduler is global and Visit-oriented.
- It should generate or show unscheduled Visits for a selected horizon.
- Existing scheduled work should appear as compact coloured bars or boxes.
- Calendar views should show compact practical information only:
  - postcode / location
  - duration
  - cleaner / cleaners
  - status
- User should be able to drag unscheduled Visits onto a day.
- After dropping or selecting a day, a day/hour view should help fit the Visit into free cleaner time.
- Scheduler should stay location, duration, and cleaner oriented.
- Avoid extra clutter unless testing proves it is needed.

## 5. Global vs client-local views

### What appears globally

Global views should show cross-customer working queues:

- Leads needing triage or follow-up
- Assessments needing scoping, quoting, or close-out
- Quotes needing send/chase/decision
- Jobs and Visits needing scheduling or action
- Tasks due
- Invoices needing send or payment follow-up

Global lists should optimize for queue management and next action.

### What appears under Client & Property Workspace

See `docs/client-property-workspace-v0-spec.md` for full UX and boundary definitions.

Client-local views should show the work history and active work for one customer/property context:

- client identity and contact details
- property context
- linked Assessments
- linked Quotes
- linked Jobs / Visits later
- linked Tasks and Notes
- linked Invoices later
- billing context, including separate invoice address only if different from service address

### What must not be duplicated

- do not duplicate the same business object as a second hidden copy inside Client & Home
- do not store separate shadow versions of Assessment details inside Client & Home
- do not treat work labels as the main identity when structured client/property/service data already exists
- do not create a second lead or client just because a current client requests extra work
- do not create separate Assessment or workflow objects just because invoice address differs from service address

## 6. Naming/display rules

- Global assessment rows should show **customer/client name first**.
- Property/address should appear second.
- Service and purpose belong in the service or purpose column, not fused into one confusing title string.
- Do not use `work_label` as the normal workflow identity.
- Use structured display identity:
  - client
  - property
  - service
  - purpose
  - status
  - quote reference
- Avoid duplicated address strings in the same row or card.
- Client & Home row headers should not imply one single service/frequency for the whole client, because one client can have multiple assessments, quotes, jobs, or properties.
- Quotes should display commercial status and reference clearly.
- Jobs and Visits later should display operational status separately from quote status.

## 7. Data discipline

Fields should exist only if they help to:

- contact the client
- identify the property
- estimate price or time
- plan access or logistics
- help the cleaner do the job
- create quote, job, or invoice records
- track status or history

Avoid:

- vanity labels as the main identity
- duplicated summary fields
- optional fields nobody will fill
- free text where structured dropdowns are better
- carrying the same address or service string in multiple places without a clear reason

Prefer:

- dropdowns for service, frequency, status, and purpose
- numeric fields for rooms, hours, counts, and price
- textareas only for genuinely open narrative

## 8. Status model

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

### Job

- draft
- scheduled
- in_progress
- completed
- cancelled

### Visit

- scheduled
- in_progress
- completed
- no_access
- cancelled
- rescheduled

### Invoice

- draft
- issued
- part_paid
- paid
- overdue
- void

## 9. Open questions

- Should Property become its own first-class table and UI module sooner rather than later?
- Define the exact readiness checklist for:
  - assessment created
  - quote-ready
  - schedule-ready
  - invoice-ready
- What is the minimum Job Builder specification for v0?
- What is the minimum Billable Event model needed before invoicing?
- Which quote acceptance actions should be manual versus automated?
- How lightweight should the invoice-address override UI be under Client billing context?
- How much of address/access detail should cleaners see, and when?

## 10. Implementation guardrails

Future AG and Codex prompts should follow these rules:

- Do not collapse Client and Property into one permanent conceptual object.
- Do not make Location the top of the hierarchy; Client / Customer is the top relationship object.
- Do not use `work_label` as the normal workflow identity in lists or headers.
- Use structured data for display: client, property, service, purpose, status, quote.
- Existing-client-created Assessments must link by `client_id`.
- Existing-client-created Assessments must use `lead_id = NULL`.
- Do not create duplicate Clients for extra work requested by an existing client.
- Do not create duplicate Leads for existing-client extra work unless a separate explicit lead workflow is requested.
- Assessment is an internal scoped-work record, not the commercial Quote and not the delivery Job.
- Accepted Quote creates or enables the Job / Work Order shell.
- Recurring cleaning in v0 is represented as a Recurring Job / Cleaning Plan that generates Visits for a selected horizon.
- Generated schedule items should be called Visits, not Jobs.
- Scheduler should stay global, compact, Visit-oriented, and cleaner/duration/location focused.
- Invoicing should be built from completed Billable Events, not directly from the Quote.
- Keep required fields minimal and use readiness warnings plus thin red-border validation before hard blocks.
- Before building a module, define the v0 spec and identify which existing PandaZen structures it must reuse.
- Do not silently sync Assessment edits back into Client & Home.
- Do not silently sync Client & Home edits back into historical Lead or Assessment records.
- Keep global queue views and client-local history views aligned to the same underlying objects, not duplicated shadow records.
- Avoid schema expansion unless it clearly strengthens these object boundaries.
