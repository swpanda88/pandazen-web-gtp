# PandaZen Product Scope & Design Principles

## 1. Executive decision summary

PandaZen is a lean cleaning-operations system, not a generic enterprise CRM.

It is building a practical operating model for:

- new enquiries
- internal scoped assessments
- commercial quotes
- accepted clients and properties
- future jobs, visits, and invoices

It is not building:

- a heavy sales pipeline product
- a large automation platform
- a complex accounting suite
- a customer portal first
- a full workforce-management platform

The design rule is simple:

```text
Keep object boundaries clear.
Build only the next operational layer that the business can actually use.
```

## 2. Product scope statement

PandaZen is a lean cleaning-operations system for managing enquiries, scoped assessments, quotes, accepted clients and properties, future jobs and visits, and later invoices, with just enough structure to support real admin work without dragging the product into enterprise CRM or field-service complexity too early.

## 3. In-scope for PandaZen v1

### Build now

#### Leads
- capture public and manual enquiries
- qualify, close, reject, or move into Assessment
- store Quote Assist guidance against the lead
- keep lead history and anonymisation hooks

#### Assessments / Scoped Work
- global assessment queue
- assessment history
- scoped-work details for one piece of work
- existing-client extra work path
- not-proceeding close-out

#### Quotes
- draft / sent / accepted / rejected / expired / void / superseded lifecycle
- quote versioning
- quote editor / preview / print
- link Quote to Assessment and, where applicable, Client

#### Clients & Homes
- operational accepted customer/property hub
- linked Assessments
- linked Quotes
- editable core client/property fields

#### Cleaning plan
- light/default planning context only
- enough structure to support future recurring work
- not a full scheduling or workforce engine yet

#### Notes / Tasks
- practical reminders and operational notes
- linked to the right business object
- no giant event-stream system

#### Basic schedule visibility
- enough schedule visibility to understand future delivery direction
- no full delivery architecture assumed yet

#### Exports / backups
- data export and backup awareness
- operational safety before risky schema/data changes

#### Security/privacy basics
- admin/public/cleaner route separation
- no real customer-data trust until route protection is in place
- lead anonymisation rules

## 4. Out-of-scope for PandaZen v1

### Avoid

- full enterprise CRM pipeline
- complex sales automation
- full customer portal
- advanced staff payroll or HR
- full route optimisation
- advanced payment reconciliation
- heavy audit/event system
- AI-driven automatic decision-making
- complex pricebook library
- multi-branch enterprise controls
- broad BI/reporting stack
- deep permissions matrix for many internal roles

These are not "nice if easy." They are explicitly outside v1 scope.

## 5. Later scope, but not now

### Build later

#### Job / Work Order layer
- worth building when accepted Quote is ready to become the real delivery trigger
- do not mix this into quote/assessment cleanup work

#### Visit / Appointment layer
- worth building when scheduling needs to represent recurring versus one-off work properly
- especially important once recurring clients are being managed operationally in-app

#### Invoice / billable-events layer
- worth building once completed work or chargeable items need to turn into payment requests
- do not assume one job = one invoice

#### Payment tracking
- worth building only after invoices exist in a usable form
- keep it light at first

#### Customer portal
- worth building only after quote, job, and invoice boundaries are stable
- not before internal admin workflows are trusted

#### Cleaner mobile checklist
- worth building when the Job and Visit model is stable enough to give cleaners only the right work context

#### Recurring schedule automation
- worth building after Job and Visit are explicit and recurring plans are defined

#### Reporting dashboards
- worth building once the core objects are stable enough that reports will not be reporting on the wrong model

## 6. Market comparison principles

PandaZen should borrow the structure of strong field-service tools, not their bulk.

### Principles to keep

#### From Jobber / Housecall Pro
- do not confuse quote with job
- accepted quote/estimate should become delivery work
- customer and service location are separate concepts
- invoice should follow work, not replace the work model

#### From ZenMaid / Launch27 / MaidCentral
- keep operations practical and cleaning-focused
- recurring service and one-off work should both fit the model
- client history should be visible from the client record
- scheduling should not be faked inside quote or intake objects

#### From ServiceTitan as the anti-bloat reference
- clear object separation is valuable
- enterprise complexity is not the target
- do not import dispatch-board, payroll, sales coaching, pricebook, and reporting complexity into a boutique tool

### Product rule

```text
Borrow object clarity from bigger tools.
Borrow operational practicality from cleaning tools.
Do not borrow enterprise weight.
```

## 7. Object ownership rules

### Lead

**Owns**
- raw enquiry
- early qualification
- first-contact information
- Quote Assist context

**Must not own**
- accepted customer relationship
- long-term property record
- delivery history
- invoice history

### Client

**Owns**
- relationship
- payer
- main contact
- linked properties and work history

**Must not own**
- all scope detail for every job in one blob
- one-off assessment-specific internals

### Property

**Owns**
- service location
- address
- property context
- logistics/access baseline

**Must not own**
- customer relationship itself
- quote lifecycle
- invoice lifecycle

### Assessment

**Owns**
- scoped-work context
- quote-prep detail
- assessment-specific property/access corrections
- internal scoping notes

**Must not own**
- the whole client record
- the permanent property master record
- delivery execution history
- invoice state

### Quote

**Owns**
- commercial offer
- version
- quote lifecycle
- commercial presentation of scope and pricing

**Must not own**
- raw lead history
- full operational delivery state
- payment tracking

### Job

**Owns**
- accepted work package
- operational execution state
- assignment/scheduling context

**Must not own**
- quote versioning
- intake qualification history
- invoice reconciliation

### Visit

**Owns**
- one scheduled occurrence
- timing
- visit completion/outcome

**Must not own**
- the whole job definition
- commercial quote lifecycle

### Invoice

**Owns**
- payment request
- billable lines
- issue/due/paid state

**Must not own**
- scoping narrative
- job planning model

### Task

**Owns**
- next action
- due date
- linked object reference

**Must not own**
- shadow copies of the real record

### Note

**Owns**
- human context that is genuinely useful

**Must not own**
- workflow-critical state that belongs in structured fields

## 8. UI / UX principles

### Build now

- global queues are for active work needing attention
- client-local tabs are for history and context under that client
- one row should answer:
  - who
  - where
  - what
  - status
- action buttons should be context-specific
- drawer should not be required for core workflow actions
- finite values should use dropdowns/selects
- free text only where narrative context is genuinely needed
- workspace surfaces should be clearer than drawers for heavier operations

### Avoid

- duplicated data in row headers
- one header pretending a client has only one service/frequency
- hidden core actions inside drawers only
- random form fields with no operational meaning
- vanity/nickname fields unless clearly operationally justified

## 9. Data principles

Fields are allowed only if they help:

- contact the client
- identify property
- estimate price/time
- plan access/logistics
- help cleaner do the job
- create quote/job/invoice
- track status/history

### Reject explicitly

- optional labels that duplicate structured data
- essay fields nobody will maintain
- extra statuses that do not drive workflow
- manually entered summaries that can be derived
- AI-friendly data points that are not operationally useful
- duplicate address fragments repeated across summary fields

## 10. Naming principles

- **Assessment** = internal scoped work
- **Quote** = commercial offer
- **Job** = accepted work package
- **Visit** = scheduled occurrence
- **Client** = relationship / payer
- **Property** = work location
- avoid `Q&A` in user-facing admin
- avoid `Convert` where no new client is created
- avoid `work_label` as the normal workflow identity
- use customer + property + service + status as the default display identity

## 11. Current branch / immediate merge scope

### Build now

Before merging the current Assessment / Client & Home cleanup branch, only finish:

- remove active `work_label` usage as normal workflow identity
- fix duplicated property/address display
- verify assessment creation
- verify Client & Home linked assessments
- verify Quote Assist / Quote Builder
- verify row display consistency

### Avoid

- adding delivery features
- adding invoice features
- redesigning the whole admin app
- adding extra workflow concepts not needed to stabilise the current branch

## 12. Next implementation PRs

1. Finish Assessment / Client & Home cleanup and merge
2. Stabilise display and naming consistency if still needed
3. Define Job / Visit delivery model
4. Build minimal Job object
5. Build Visit scheduling
6. Build invoice / billable-event model

## 13. Anti-scope-creep rules

Future prompts must pass this checklist:

- Is this needed for v1?
- Is this operationally useful?
- Is it duplicating existing data?
- Can it be derived?
- Does it belong to a future module?
- Is this one PR or multiple?

If the answer points to "future module," stop and narrow scope.

## 14. Decision table

| Feature / idea | Decision | Reason | Dependency |
|---|---|---|---|
| `work_label` | Avoid as normal identity | Structured identity is clearer and safer | None |
| Job Builder | Build later | Delivery model is not stable yet | Accepted Quote -> Job model |
| Visit model | Build later | Needed after Job exists | Job object |
| customer portal | Build later | Internal workflows must stabilise first | Stable quote/job/invoice flow |
| cleaner checklist | Build later | Cleaner surface depends on Job/Visit shape | Job + Visit model |
| route optimisation | Avoid for v1 | Too heavy for boutique scope | Mature schedule data later |
| automated pricing | Avoid | Quote Assist should guide, not decide | None |
| advanced reports | Build later | Need stable objects first | Stable object model |
| payment tracking | Build later | Needs usable invoice model first | Invoice layer |
| notes/tasks | Build now | Operationally useful and lightweight | None |
| quote versioning | Build now | Commercial traceability is essential | Quote layer |
| recurring cleaning plan | Build now, lightly | Needed as context, not full automation | Client + Property + future Job |
| property model | Build now conceptually, later structurally | Critical boundary, but can stay partly bundled in UI for now | Owner decision on storage timing |
| client multi-property support | Needs owner decision, but likely later structurally | Architecture should allow it, UI/data model can mature later | Property model |

## 15. Final principles

1. Client is the top relationship object.
2. Property sits below Client.
3. Lead is intake, not the customer record.
4. Assessment is internal scoped work, not the commercial quote.
5. Quote is commercial offer, not delivery.
6. Accepted Quote should become Job.
7. Visit is a scheduled occurrence, not a synonym for Job.
8. Use structured data for identity; avoid `work_label` as the main label.
9. Build only the next operational layer the business can really use.
10. If a feature adds complexity without changing workflow value, do not build it.
