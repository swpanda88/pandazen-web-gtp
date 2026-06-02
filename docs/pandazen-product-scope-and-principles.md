> [!NOTE]
> **SEE NEW DIRECTION**: The current development focus is the Jobber-inspired `/cleanops` application. See `docs/cleanops-architecture-and-data.md` for the single source of truth regarding the new architecture and data semantics.

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

Additional owner decisions now locked in:

- invoice address defaults to the service address
- if invoice address is different, it belongs under Client billing context
- accepted Quote creates the Job / Work Order shell
- generated schedule items should be called Visits, not Jobs
- recurring cleaning in v0 is represented as a Recurring Job / Cleaning Plan that generates Visits for a selected planning horizon
- Invoice Builder must use unbilled Billable Events as its source items, not the Quote directly

## 2. Product scope statement

PandaZen is a lean cleaning-operations system for managing enquiries, scoped assessments, quotes, accepted clients and properties, future jobs and visits, Billable Events, and invoices, with just enough structure to support real admin work without dragging the product into enterprise CRM or field-service complexity too early.

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

#### Client & Property Workspace
*See docs/client-property-workspace-v0-spec.md for boundary rules.*
- operational accepted customer/property hub
- linked Assessments
- linked Quotes
- editable core client/property fields
- billing context, including separate invoice address only when different from service address

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
- generated schedule items should be called Visits, not Jobs
- readiness warnings should tell admin when work is not yet schedule-ready

#### Required-field readiness
- minimal fields required to create records
- separate readiness rules for quoting, scheduling, and invoicing
- warning-led data completion rather than blocking everything
- thin red borders should mark required/invalid fields until valid data is entered

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
- accepted Quote creates the Job / Work Order shell
- Job Builder then builds the operational job specification from Quote + Assessment + Client/Property data
- this is valid v0 architecture, but not part of the current branch unless explicitly selected
- recurring cleaning in v0 should be represented as a Recurring Job / Cleaning Plan under Client + Property

#### Visit / Appointment layer
- worth building when scheduling needs to represent recurring versus one-off work properly
- especially important once recurring clients are being managed operationally in-app
- generated schedule items should be called Visits, not Jobs
- Recurring Job / Cleaning Plan should generate Visits for a selected planning horizon such as 1 week, 2 weeks, or 4 weeks
- generated Visits are what appear in the Scheduler
- Scheduler should stay global, Visit-oriented, compact, and cleaner/duration/location focused
- no Visit module build should start until the Visit v0 spec is documented and accepted

#### Invoice / billable-events layer
- worth building once completed work or chargeable items need to turn into payment requests
- do not assume one job = one invoice
- completed Visit should create Billable Event
- Invoice Builder should select unbilled Billable Events
- Invoice Builder should work in the same architectural spirit as Quote Builder:
  - select source items
  - build invoice
  - preview
  - send / record
- no invoice or Billable Event module build should start until the billing v0 spec is documented and accepted

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

**Billing rule**
- service address is the default invoice address
- if billing address differs, store it under Client billing context rather than creating another work object

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

**Delivery rule**
- accepted Quote creates the Job / Work Order shell

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

**Billing rule**
- completed Visit creates the Billable Event used later by Invoice Builder

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
- required fields should stay minimal
- readiness warnings should be clearer than blanket blocking
- empty required/invalid fields should use a thin red border until valid
- Scheduler should be global and Visit-oriented, not a disguised Job list
- Scheduler should emphasise postcode/location, duration, cleaner/cleaners, and status
- Scheduler should show unscheduled Visits for the selected planning horizon and let admin place them into a day/hour view

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
- making every Assessment field required just because it exists

## 10. Naming principles

- **Assessment** = internal scoped work
- **Quote** = commercial offer
- **Job** = accepted work package
- **Visit** = scheduled occurrence
- **Client** = relationship / payer
- **Property** = work location
- **Invoice address** = billing detail under Client when different from service address
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
- verify required-vs-readiness logic stays minimal and warning-led

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

For each module PR, define before implementation:

- purpose
- object ownership
- required data
- statuses
- screens / tabs
- actions
- upstream / downstream links
- acceptance tests
- existing PandaZen structure to reuse

The spec must explicitly answer:

- Can this reuse Quote Builder structure?
- Can this reuse Quote Preview structure?
- Can this reuse Assessment Wizard table/grid structure?
- Can this reuse Workspace Action Panel structure?
- What genuinely needs a new pattern?

Module-build rule:

- build the smallest complete working module
- reuse proven PandaZen structures first
- do not rebuild a new pattern from scratch unless the object purpose truly requires it
- do not start Job, Visit, Invoice, or Billable Event implementation until that module's v0 docs/scope are locked

Reuse-first examples:

- Invoice Builder should be architecturally based on Quote Builder:
  - select source items
  - build lines
  - preview
  - send / record
- Job Builder should be architecturally based on Quote Builder plus Assessment structure:
  - pull source data
  - select / confirm operational scope
  - generate job spec
- Scheduler should reuse compact workspace/action patterns, but needs its own calendar and Visit-planning view.

## 13. Anti-scope-creep rules

Future prompts must pass this checklist:

- Is this needed for v1?
- Is this operationally useful?
- Is it duplicating existing data?
- Can it be derived?
- Does it belong to a future module?
- Is this one PR or multiple?
- Is this a coherent module v0 or just a micro-patch pretending to be architecture?
- Which existing PandaZen structure should this reuse?
- What genuinely has to be different because the object purpose is different?

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
| recurring Job / Cleaning Plan generating Visits | Build later as defined v0 chain | Concept is locked; implementation comes with Job/Visit module work | Job + Visit model |
| property model | Build now conceptually, later structurally | Critical boundary, but can stay partly bundled in UI for now | Owner decision on storage timing |
| client multi-property support | Needs owner decision, but likely later structurally | Architecture should allow it, UI/data model can mature later | Property model |
| invoice address override | Build now, lightly | Billing address differs sometimes, but should stay under Client billing context | Client billing context |
| required-field red-border warnings | Build now | Minimal friction with clear readiness signal | Form validation patterns |
| automatic Job shell on accepted Quote | Build later as next delivery step | Owner has decided the trigger, but delivery module is still pending | Job model PR |
| Billable Event creation from completed Visit | Build later | Billing chain depends on Visit model existing | Visit + invoice model |
| Invoice Builder based on Billable Events | Build later | Needed for practical invoicing; should reuse Quote Builder pattern | Billable Event model |

## 15. Final principles

1. Client is the top relationship object.
2. Property sits below Client.
3. Lead is intake, not the customer record.
4. Assessment is internal scoped work, not the commercial quote.
5. Quote is commercial offer, not delivery.
6. Accepted Quote should become Job.
7. Visit is a scheduled occurrence, not a synonym for Job.
8. Use structured data for identity; avoid `work_label` as the main label.
9. Keep required fields minimal and use readiness warnings before hard blocks.
10. Recurring cleaning should be represented as a Recurring Job / Cleaning Plan that generates Visits.
11. Invoice sources should be completed Billable Events, not the Quote itself.
12. Before building a new module, identify what existing PandaZen pattern it should reuse.
13. Build only the next operational layer the business can really use.
14. If a feature adds complexity without changing workflow value, do not build it.
