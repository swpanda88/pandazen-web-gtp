# PandaZen Scope Decisions Needed

This file lists decisions the owner should make before future implementation work expands beyond the current Assessment / Quote / Client & Home foundation.

## Must decide before next major dev PR

- **Exact point where Quote becomes Job**
  - Should accepted Quote always be the trigger for creating a Job / Work Order?
  - Recommendation: yes, unless the business wants a deliberate manual hold step.

- **Manual or automatic Job creation after quote accepted**
  - Build now decision needed for future delivery architecture.
  - Recommendation: start with manual confirmation, automate later if truly helpful.

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

- **Minimum required Assessment fields**
  - Which fields are mandatory before a Quote can be created?
  - Recommendation: decide the minimum operational set explicitly, then enforce it consistently.

- **What global queues are needed for v1**
  - Recommended v1 queues:
    - Leads
    - Assessments
    - Quotes
    - Tasks
    - light schedule visibility only

## Can decide during Jobs/Visits phase

- **Recurring cleaning model**
  - Is recurring work:
    - one Job with many Visits
    - or a Plan with generated Visits?
  - Recommendation: treat recurring work as a plan that generates Visits, with Job/Work Order as the delivery container.

- **Whether Property needs its own table soon**
  - Can Property remain partly inside Client & Home for now, or should it become first-class before delivery work expands?
  - Recommendation: decide this before serious Job / Visit build-out.

- **How to handle multiple properties under one client**
  - Recommendation: support it architecturally now, even if the UI stays simple until there is real operational need.

- **What fields are dropdowns vs free text**
  - Recommendation: finite workflow-driving values should be dropdowns; narrative-only context should be free text.

- **Invoice trigger rules**
  - Recommendation: define after Job / Visit architecture is stable, not before.

## Can decide later

- **Whether invoices are per visit, per job, monthly, or mixed**
  - Recommendation: mixed model is probably most practical, but only worth defining after the billable-work model is ready.

- **How detailed reporting needs to become**
  - Recommendation: defer until the core objects stop shifting.

- **How much customer self-service should exist**
  - Recommendation: only decide once internal admin flows are trusted.

- **Cleaner mobile scope**
  - Recommendation: decide after Job and Visit boundaries are finished.

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
