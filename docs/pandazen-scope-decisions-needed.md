# PandaZen Scope Decisions Needed

This file lists decisions the owner should make before future implementation work expands beyond the current Assessment / Quote / Client & Home foundation.

## Must decide before next major dev PR

- **Job Builder scope**
  - Accepted Quote now creates the Job / Work Order shell.
  - The next decision is what minimum operational specification Job Builder must assemble from Quote + Assessment + Client/Property data.

- **Minimum required Assessment fields**
  - Define the exact readiness checklist for:
    - assessment created
    - quote-ready
    - schedule-ready
    - invoice-ready
  - Recommendation: keep creation requirements minimal and use readiness warnings for the later stages.

- **Accepted existing-client extra work wording**
  - Should the UI say:
    - `Create Job`
    - `Accept and create Job`
    - `Move to delivery`
  - Recommendation: avoid `Convert` unless a new Client is actually being created.

- **Quote lifecycle/status rules**
  - Confirm the lean commercial lifecycle:
    - draft
    - sent
    - accepted
    - rejected
    - expired
    - void
    - superseded
  - Recommendation: keep this lean set and avoid adding extra statuses without workflow value.

- **What global queues are needed for v1**
  - Recommended v1 queues:
    - Leads
    - Assessments
    - Quotes
    - Tasks
    - light schedule visibility only

## Can decide during Jobs/Visits phase

- **Recurring cleaning model**
  - Working v0 decision:
    - recurring cleaning is represented as a Recurring Job / Cleaning Plan under Client + Property
    - it generates Visits for a selected planning horizon
    - generated schedule items are called Visits, not Jobs
  - Remaining implementation decision:
    - exact table naming and whether Plan is a Job subtype or adjacent object

- **Whether Property needs its own table soon**
  - Can Property remain partly inside Client & Home for now, or should it become first-class before delivery work expands?
  - Recommendation: decide this before serious Job / Visit build-out.

- **How to handle multiple properties under one client**
  - Recommendation: support it architecturally now, even if the UI stays simple until there is real operational need.

- **Visit generation rules**
  - Lock the operational rule:
    - Scheduler is global and Visit-oriented
    - it should generate/show unscheduled Visits for a selected horizon
    - admin should place Visits into the calendar/day view
  - Remaining implementation decision:
    - what the first practical horizon options should be, such as 1 week, 2 weeks, or 4 weeks

- **What fields are dropdowns vs free text**
  - Recommendation: finite workflow-driving values should be dropdowns; narrative-only context should be free text.

- **Invoice trigger rules**
  - Working v0 decision:
    - completed Visit creates Billable Event
    - Invoice Builder selects unbilled Billable Events
    - Invoice is generated from selected Billable Events
  - Remaining implementation decision:
    - minimum Billable Event fields needed for first Invoice Builder release

- **Job shell creation behaviour**
  - Working architecture decision:
    - accepted Quote creates or enables the Job / Work Order shell
  - Remaining implementation decisions:
    - whether the first release is manual-confirmed or fully automatic
    - exact action/button wording in admin

## Can decide later

- **Whether invoices are per visit, per job, monthly, or mixed**
  - Recommendation: mixed model is probably most practical, but only worth finalising after the billable-work model is ready.

- **How detailed reporting needs to become**
  - Recommendation: defer until the core objects stop shifting.

- **How much customer self-service should exist**
  - Recommendation: only decide once internal admin flows are trusted.

- **Cleaner mobile scope**
  - Recommendation: decide after Job and Visit boundaries are finished.

- **Invoice address override UI**
  - Architecture is fixed: invoice address defaults to service address and can be overridden under Client billing context.
  - The remaining question is how lightweight the admin UI should be for that override.

- **Reuse-first module rules in practice**
  - The rule is fixed:
    - new modules should reuse proven PandaZen structures first
  - The remaining question is implementation discipline:
    - which exact existing patterns Job Builder, Invoice Builder, and Scheduler will reuse first

## Avoid unless business changes

- **Enterprise-style sales pipeline expansion**
  - Avoid unless PandaZen becomes a much larger organisation with dedicated sales roles.

- **Advanced route optimisation**
  - Avoid unless the business volume makes route-planning a real constraint.

- **AI-driven automatic pricing/acceptance**
  - Avoid. Quote Assist should support judgement, not replace it.

- **Large pricebook / service-library complexity**
  - Avoid unless quoting becomes so repetitive that structured reusable modules clearly save time.

- **Heavy audit/event system**
  - Avoid unless regulation, staffing scale, or incident review makes it necessary.

- **Multi-branch enterprise controls**
  - Avoid unless the business expands beyond a small boutique operation.
