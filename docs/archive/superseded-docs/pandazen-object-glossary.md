# PandaZen Object Glossary

This glossary is the stable naming layer between product discussions, implementation prompts, and the current PandaZen admin UI.

Use it together with:

- [pandazen-functional-architecture.md](C:/Users/sewer/Documents/Codex/2026-05-05/how-do-i-work-with-you/github-worktree/docs/pandazen-functional-architecture.md)
- [admin-operations-blueprint.md](C:/Users/sewer/Documents/Codex/2026-05-05/how-do-i-work-with-you/github-worktree/docs/admin-operations-blueprint.md)

## Lead

**Purpose**
- Raw enquiry and early triage record.

**Created when**
- A public web enquiry, phone enquiry, or manual inbound request is logged before PandaZen has accepted the work as active client work.

**Owns**
- first-contact details
- initial service request
- early qualification data
- Quote Assist context and recommendation
- loss / no-response close-out data

**Must not own**
- long-term operational client history
- job delivery history
- invoice history

**Key relationships**
- may produce the first Assessment
- may later become or link to Client + Property

## Client

**Purpose**
- Relationship, payer, main contact, and long-term customer record.

**Created when**
- PandaZen accepts or converts work into an active customer relationship.

**Owns**
- customer identity
- main contact details
- billing context
- relationship status
- linked Properties
- linked Assessments, Quotes, Jobs, Visits, Invoices, Tasks, and Notes

**Must not own**
- all scoped-work detail in one undifferentiated block
- one-off assessment-specific scope notes

**Key relationships**
- can have multiple Properties
- can have multiple Assessments over time
- invoice address defaults to the service address unless separate billing details are stored under the Client billing context
- invoice address override is a billing detail, not a separate Assessment or work object

## Property / Home / Location

**Purpose**
- Where work happens.

**Created when**
- A service location is known well enough to be stored operationally.

**Owns**
- address and area
- property-specific cleaning context
- access and logistics details

**Must not own**
- the entire customer relationship
- quote lifecycle
- invoice history

**Key relationships**
- belongs to one Client
- can have multiple Assessments and Jobs over time
- service address normally acts as the default invoice address

## Assessment / Scoped Work

**Purpose**
- Internal scoped-work record for one piece of work being understood, priced, reviewed, or followed up.

**Created when**
- From a Lead for new business
- From an existing Client / Property for extra work
- From future follow-up or complaint/review workflow if needed

**Owns**
- scope and service context for this piece of work
- property/access details for this assessment
- internal assessment notes
- quote-prep data

**Must not own**
- the whole client relationship
- the permanent property master record
- delivery execution history
- invoice history
- separate invoice-address workflow

**Key relationships**
- may originate from one Lead
- belongs logically to one Client and one Property context
- can have multiple Quote versions

## Quote

**Purpose**
- Commercial offer linked to an Assessment.

**Created when**
- PandaZen has enough assessment information to prepare a price and formal offer.

**Owns**
- commercial reference/version
- commercial scope presentation
- sent / accepted / rejected / expired lifecycle

**Must not own**
- the full internal assessment conversation
- delivery execution notes
- payment history

**Key relationships**
- belongs to one Assessment
- may link to one Client
- accepted Quote creates the first Job / Work Order shell in the delivery chain

## Job / Work Order

**Purpose**
- Delivery container for accepted work.

**Created when**
- After accepted Quote creates the first delivery shell, or later from a recurring service plan.

**Owns**
- work to be delivered
- operational status
- assignment and scheduling linkage
- operational specification built from Quote + Assessment + Client/Property data

**Must not own**
- raw lead qualification data
- quote version history
- invoice payment history

**Key relationships**
- derived from accepted work
- recurring cleaning in v0 is represented as a Recurring Job / Cleaning Plan under one Client + Property
- recurring Job / Cleaning Plan generates Visits for a selected planning horizon such as 1 week, 2 weeks, or 4 weeks
- can have one or more Visits

## Visit / Appointment

**Purpose**
- Scheduled occurrence of a Job or recurring service.

**Created when**
- A Job or recurring plan produces a scheduled occurrence.

**Owns**
- timing
- visit status
- visit-specific completion or issue notes

**Must not own**
- the whole job definition
- quote lifecycle

**Key relationships**
- belongs to one Job / Work Order
- generated Visits are the scheduled occurrences that appear in the Scheduler
- completed Visit creates the Billable Event that later feeds invoicing

## Invoice

**Purpose**
- Payment request for billable work.

**Created when**
- Completed work is ready to charge.

**Owns**
- invoice number
- amount due
- invoice lines
- issue / due / paid status
- invoice address, defaulting from the service address unless separate Client billing details override it

**Billing rule**
- invoice address is billing context only; it must not create extra workflow objects

**Must not own**
- raw scoping notes
- job planning state

**Key relationships**
- belongs to one Client
- is generated from selected unbilled Billable Events, not directly from the Quote
- later may include multiple billable work items

## Task

**Purpose**
- Operational reminder or next-action item.

**Created when**
- Admin or workflow needs a trackable action.

**Owns**
- title
- due date
- linked object reference
- completion status

**Must not own**
- the full business record it points to

**Key relationships**
- may link to Lead, Client, Property, Assessment, Quote, Job, or Invoice

## Note

**Purpose**
- Useful human context and history.

**Created when**
- Admin needs to preserve context that does not deserve a dedicated structured field.

**Owns**
- timestamped narrative context
- note type if available

**Must not own**
- status logic that belongs in structured fields
- key identity data that should live in dedicated fields

**Key relationships**
- may attach to Lead, Client, Assessment, Quote, Job, or Invoice
