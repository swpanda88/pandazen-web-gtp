# PandaZen CRM / Field-Service Structure Audit

## Executive summary

PandaZen is moving in a sensible direction for a boutique cleaning operations app, but some object boundaries are still carrying legacy overlap from the earlier Lead and Q&A phase.

The strongest pattern across cleaning and field-service software is:

```text
Lead / Request
-> Customer / Client
-> Property / Service Address
-> Estimate / Quote
-> Job / Work Order
-> Visit / Appointment
-> Invoice
-> Payment
```

PandaZen is already doing two important things well:

- separating internal scoping from the commercial quote
- allowing existing clients to generate new scoped work instead of treating all work as new-lead-only

The main structural risk is that Assessment can still drift into doing too many jobs at once: survey, opportunity, quote-prep container, and future delivery spec. The clean direction is:

- Lead = raw enquiry and early triage
- Assessment = internal scoped-work record
- Quote = commercial offer
- Client and Property = accepted relationship and service location
- Job / Work Order = delivery container
- Visit / Appointment = scheduled occurrence
- Invoice = payment request

That keeps PandaZen lean without dragging it into enterprise complexity too early.

## Common industry workflow

Across Jobber, Housecall Pro, ServiceTitan, and lighter cleaning tools such as ZenMaid, the workflow is usually:

1. Lead / inquiry / request arrives
2. Customer record exists or is created
3. Service location or property is identified
4. Estimate / quote is created
5. Accepted work becomes a job / work order
6. One or more visits / appointments are scheduled
7. Invoice is issued
8. Payment is tracked

Common structural patterns:

- the commercial quote is separate from internal notes and scoping
- customer and property are distinct concepts even if shown together in the UI
- existing customers can create new estimates or jobs without creating a new lead
- one job is not always one invoice
- recurring work usually separates the job/work container from scheduled visits

## Object model comparison

| Industry object | PandaZen equivalent | Current status | Recommendation |
|---|---|---|---|
| Lead / Inquiry / Request | Lead | Good | Keep Lead as raw enquiry and early triage only. |
| Customer / Client | Client & Home | Partly good | Keep the combined module for now, but define Client separately from Property in the architecture. |
| Property / Service Address / Site | Home inside Client & Home | Under-modelled | Treat Property as its own concept even if not fully separated in UI yet. |
| Opportunity / Scoped work / Survey | Assessment | Strong direction but overloaded | Keep Assessment as the internal scoped-work record; do not let it become the delivery object. |
| Estimate / Quote | Quote | Good direction | Keep Quote as the separate commercial record with status and versioning. |
| Sold estimate / accepted scope | Accepted Quote + Assessment | Transitional | Make accepted Quote the future trigger for Job / Work Order. |
| Job / Work Order | Future Jobs | Not yet firm | Define Job as the delivery container created after accepted work. |
| Visit / Appointment | Future Schedule / Visits | Not yet separate | Split Visit from Job before schedule complexity grows. |
| Invoice | Planned accounting / invoices | Correctly postponed | Build later from billable work, not from one job = one invoice. |
| Payment | Later | Not started | Fine to postpone. |
| Task / Activity / Reminder | Tasks + Notes | Good enough | Keep light and operational rather than building a heavy CRM activity feed. |

## What PandaZen is doing well

- Lead is not being treated as the permanent customer record.
- Assessment is separated from Quote.
- Existing-client extra work can create new scoped work.
- Quote workflow is becoming a real commercial layer instead of a free-text note.
- Client & Home is being treated as the operational hub after acceptance or conversion.
- The system is already resisting hidden back-sync between historical and operational records.
- Invoicing and payments are being postponed until the core object model is firmer.

## Where PandaZen is structurally confused

- Assessment is still at risk of carrying too much responsibility.
- Client and Property are still visually and conceptually bundled too tightly.
- Older documentation still uses Q&A language and some legacy workflow framing.
- The temporary Assessment -> Client & Home bridge can blur the long-term accepted-quote boundary.
- Job versus Visit is not yet explicit, which becomes risky in recurring cleaning.
- Too much identity can drift into ad hoc labels instead of structured client, property, service, and status data.

## Recommended object model

```text
Lead
  Raw new enquiry / early triage only

Client
  Relationship, payer, main contact

Property / Home / Location
  Where work happens
  A client can have multiple properties

Assessment / Scoped Work
  Internal scoped-work record
  Can come from:
  - new lead
  - existing client
  - future cleaner follow-up

Quote
  Commercial offer linked to one assessment
  Versioned and statused

Job / Work Order
  Delivery container created after accepted quote

Visit / Appointment
  Scheduled occurrence under a job or recurring plan

Invoice
  Payment request for completed billable work

Payment
  Money received and reconciled later
```

## Naming recommendations

Recommended sidebar/module names:

- Leads
- Assessments
- Clients & Homes
- Quotes
- Schedule
- Jobs
- Tasks
- Accounting

Recommended assessment/workflow language:

- Active Assessments
- Assessment History
- Assessment details
- Close Assessment
- Quote Builder
- Quotes
- Notes / Tasks

Avoid reintroducing user-facing Q&A language.

## Data discipline recommendations

Fields are worth keeping when they help:

- contact the client
- identify the property
- estimate time or price
- plan access and logistics
- help a cleaner do the job
- create a quote, job, or invoice
- track status or history

Prefer structured fields for:

- service type
- frequency
- property type
- status
- quote outcome
- visit state

Avoid overbuilding:

- vanity labels that compete with real identity data
- duplicate summary fields
- optional fields nobody uses operationally
- too many note boxes
- free-text where dropdowns or yes/no controls are clearer

## Priority roadmap

### Must fix before merge / go-live

- Keep accepted Quote as the intended future trigger for delivery objects.
- Keep existing-client extra work globally visible, not hidden only inside Client & Home.
- Tighten the conceptual split between Client and Property.
- Keep Quote lifecycle non-destructive and traceable.
- Prevent Assessment from absorbing too much job-execution logic.

### Next PR

- clarify customer-versus-property display everywhere
- strengthen Client & Home -> Assessments as linked work history
- define accepted-quote -> Job / Work Order transition more explicitly
- tighten naming around assessment status versus quote status
- improve structured identity on assessment rows and cards

### Later

- explicit Job / Work Order object
- explicit Visit / Appointment object
- invoice generation from billable work
- payment tracking
- deeper property normalization only if multi-property usage grows

### Avoid for now

- enterprise-style pipeline complexity
- elaborate automation trees
- heavy project management layers
- one-job-one-invoice assumptions
- large settings systems for every taxonomy

## Source URLs used

- [Jobber setup and workflow overview](https://help.getjobber.com/hc/en-us/articles/360056046054-The-Five-Minute-Guide-to-Getting-Set-Up-with-Jobber)
- [Jobber quote basics](https://help.getjobber.com/hc/en-us/articles/115009378727-Quote-Basics)
- [Jobber job basics](https://help.getjobber.com/hc/en-us/articles/115009379027-Job-Basics)
- [Jobber invoice basics](https://help.getjobber.com/hc/en-us/articles/115009685047-Invoice-Basics)
- [Housecall Pro estimate creation](https://help.housecallpro.com/en/articles/1185469-how-to-create-an-estimate)
- [Housecall Pro copy or convert jobs and estimates](https://help.housecallpro.com/en/articles/2883009-how-to-copy-or-convert-jobs-and-estimates)
- [Housecall Pro estimates on jobs](https://help.housecallpro.com/en/articles/9196840-estimates-on-jobs)
- [Housecall Pro customer profile overview](https://help.housecallpro.com/en/articles/9764383-customer-profile-overview)
- [ZenMaid estimate scheduling](https://answers.zenmaid.com/en/articles/2430543-how-to-send-and-schedule-an-estimate-on-zenmaid)
- [ZenMaid inquiry conversion flow](https://answers.zenmaid.com/en/articles/3417682-check-bookings-and-convert-inquiries-into-contacts-or-appointments)
- [ServiceTitan estimate workflows](https://help.servicetitan.com/docs/estimate-workflows-in-servicetitan-and-servicetitan-mobile)
- [ServiceTitan build estimates and close sales](https://help.servicetitan.com/docs/build-estimates-and-close-sales)
- [ServiceTitan customer and location records overview](https://help.servicetitan.com/construction/docs/customer-and-location-records-overview)
- [ServiceTitan job record overview](https://help.servicetitan.com/docs/job-record-overview)
- [ServiceTitan invoice walkthrough](https://help.servicetitan.com/how-to/navigate-invoice.htm)
- [Launch27 features overview](https://www.launch27.com/features/)
