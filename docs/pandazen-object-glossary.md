# PandaZen Object Glossary

This glossary is the stable naming layer between product discussions, implementation prompts, and the current PandaZen admin UI.

Use it together with:

- `docs/pandazen-functional-architecture.md`
- `docs/admin-operations-blueprint.md`
- `docs/pandazen-product-scope-and-principles.md`

## Locked object chain

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

## Client / Customer

**Purpose**
- Relationship, payer, main contact, and long-term customer record.

**Owns**
- customer identity
- main contact details
- relationship status
- linked Properties
- billing address if different from service address
- linked Assessments, Quotes, Jobs, Visits, Billable Events, Invoices, Tasks, and Notes

**Must not own**
- all scoped-work detail in one undifferentiated block
- one-off assessment-specific scope notes
- duplicate work locations just because billing address is different

**Key relationships**
- can have multiple Properties
- can have multiple Assessments over time
- invoices belong to Client

## Property / Home / Location

**Purpose**
- Where work happens.

**Owns**
- service address and area
- property-specific cleaning context
- access/logistics details
- home-specific notes

**Must not own**
- the entire customer relationship
- quote lifecycle
- invoice/payment lifecycle

**Key relationships**
- belongs to one Client
- can have multiple Assessments and Jobs over time
- Visits happen at a Property

## Assessment / Scoped Work

**Purpose**
- Internal scoped-work record for one piece of work being understood, priced, reviewed, or followed up.

**Created when**
- From a Lead for new business
- From an existing Client / Property for extra work
- From future follow-up or complaint/review workflow if needed

**Owns**
- scope and service context for this piece of work
- property/access details relevant to this assessment
- internal assessment notes
- quote-prep data

**Must not own**
- the whole client relationship
- the permanent property master record
- delivery execution history
- invoice history

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
- pricing/validity terms
- sent / accepted / rejected / expired lifecycle

**Must not own**
- the full internal assessment conversation
- delivery execution notes
- payment history

**Key relationships**
- belongs to one Assessment
- may link to one Client
- accepted Quote creates or enables Job / Work Order shell

## Job / Work Order

**Purpose**
- Delivery container for accepted work.

**Created when**
- After accepted Quote, or later from a recurring service plan.

**Owns**
- operational job spec
- work to be delivered
- operational status
- assignment/scheduling context

**Must not own**
- raw lead qualification data
- quote version history
- invoice/payment history

**Key relationships**
- derived from accepted work
- can have one or more Visits
- recurring cleaning can be represented as a Recurring Job / Cleaning Plan

## Recurring Job / Cleaning Plan

**Purpose**
- Repeating delivery pattern for recurring cleaning.

**Created when**
- Accepted Quote confirms recurring cleaning.

**Owns**
- recurrence pattern
- default duration
- preferred service window
- default cleaner/team if known
- plan-level operational notes

**Must not own**
- invoice/payment state
- every generated visit as a separate job definition

**Key relationships**
- belongs to Client + Property
- generates Visits for a selected horizon, e.g. 1w / 2w / 4w
- generated schedule items are Visits, not Jobs

## Visit / Appointment

**Purpose**
- Scheduled occurrence of a Job or recurring service.

**Created when**
- Work is assigned to a date/time/window.
- A recurring plan generates upcoming schedule items.
- An unscheduled Visit is dragged into the scheduler.

**Owns**
- timing
- cleaner/team assignment
- duration
- visit status
- visit-specific completion or issue notes

**Must not own**
- the whole job definition
- quote lifecycle
- invoice/payment lifecycle

**Key relationships**
- belongs to one Job / Work Order or Recurring Job / Cleaning Plan
- completed Visit creates a Billable Event

## Billable Event

**Purpose**
- Chargeable work item created from completed work or another approved chargeable action.

**Created when**
- Visit is completed
- no-access/cancellation charge is confirmed
- extra approved charge is recorded

**Owns**
- billable date
- source object reference, usually Visit
- billable description
- quantity/rate/amount where applicable
- billed/unbilled state

**Must not own**
- the full invoice document
- the full job or visit history
- payment state beyond whether it has been invoiced/voided

**Key relationships**
- belongs to Client
- usually links to Property and Visit
- selected by Invoice Builder when unbilled
- becomes invoice line/source when invoiced

## Invoice

**Purpose**
- Payment request for one or more Billable Events.

**Created when**
- Invoice Builder selects unbilled Billable Events and generates the invoice.

**Owns**
- invoice number
- invoice lines
- amount due
- issue / due / paid / void status
- billing address snapshot

**Must not own**
- raw scoping notes
- job planning state
- customer relationship notes unrelated to billing

**Key relationships**
- belongs to one Client
- may include one or more Billable Events
- payment tracking follows the Invoice/Payment layer

## Payment

**Purpose**
- Records money received or payment status against an Invoice.

**Created when**
- Payment is logged or synced later from a payment/accounting flow.

**Owns**
- amount received
- date received
- method/reference if needed

**Must not own**
- delivery status
- quote acceptance status

**Key relationships**
- belongs to one Invoice

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
- hidden workflow status that belongs on the real object

**Key relationships**
- may link to Lead, Client, Property, Assessment, Quote, Job, Visit, Billable Event, or Invoice

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
- may attach to Lead, Client, Property, Assessment, Quote, Job, Visit, Billable Event, or Invoice
