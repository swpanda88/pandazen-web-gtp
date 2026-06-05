# Cleaning Company Management Software Specification

> [!IMPORTANT]
> **Active Implementation Note**: This document outlines the initial broad requirements and general business goals for CleanOps. For the active, true state of the application's data semantics and architectural decisions, refer to `docs/cleanops-architecture-and-data.md` as the single source of truth. For approved UI layout, workspace, overlay, and interaction patterns, refer to `docs/cleanops-ui-design-guide.md`.

Version: 1.1  
Prepared for: UK-based cleaning company operations  
Product type: Web application with mobile-first field staff experience  
Working product name: CleanOps

## 1. Product Vision

CleanOps is a lean, clean, operations-first platform for managing a UK cleaning company. It should help the company run daily work with less admin, fewer missed details, and a better client experience.

The product should feel calm, fast, and practical. It should not feel like bloated enterprise software. The core idea is simple:

> Every client, property, clean, quote, visit, invoice, note, and team action should be easy to find, easy to understand, and easy to act on.

The app is inspired by the best parts of Jobber-style field service software, but focused specifically on cleaning companies. That means the workflows, language, forms, checklists, and reporting should fit domestic cleaning, end-of-tenancy cleans, deep cleans, office cleaning, communal area cleaning, and specialist cleaning services.

## 2. Product Goals

### Primary Goals

- Manage the full client journey from enquiry to quote, booking, visit completion, invoicing, payment, and follow-up.
- Give office staff a clean command centre for scheduling, client records, quotes, jobs, invoices, and issues.
- Give cleaners a simple mobile workflow for today's visits, access notes, checklists, timers, photos, and completion updates.
- Reduce missed information, access failures, late invoices, forgotten follow-ups, and unclear job scopes.
- Support recurring domestic and commercial cleaning schedules.
- Keep sensitive access and property information controlled and auditable.
- Provide useful business reporting without making the interface heavy.

### Non-Goals for Version 1

- Full payroll processing.
- Full accounting ledger replacement.
- Complex HR management.
- Inventory warehouse management.
- Advanced route optimisation with traffic prediction.
- Marketplace-style customer booking for the public.
- Multi-company franchise management.

## 3. Target Users

### Company Owner or Director

Needs:

- Overview of sales, work, revenue, overdue invoices, team performance, and complaints.
- Control over settings, services, pricing, templates, permissions, and integrations.
- Confidence that operations are under control.

### Office Manager or Administrator

Needs:

- Process new enquiries quickly.
- Create accurate quotes.
- Schedule jobs without clashes.
- Communicate with clients.
- Prepare invoices.
- Track overdue payments and unresolved issues.

### Supervisor or Team Leader

Needs:

- See assigned teams and daily route.
- Check job notes, photos, forms, access instructions, and completion status.
- Support cleaners during the day.
- Review quality and issues.

### Cleaner or Field Operative

Needs:

- See only today's assigned work.
- Understand where to go, what to clean, how to access the property, and what to report.
- Complete checklists quickly.
- Add notes and photos.
- Mark visits complete.

### Client

Needs:

- Request work.
- Approve quotes.
- Confirm bookings.
- See appointment details.
- Pay invoices.
- Request changes or raise an issue.

### Bookkeeper or Accountant

Needs:

- Review invoices, payments, VAT details, and exports.
- Sync with accounting software.
- Avoid operational clutter.

## 4. Design Principles

### UX Personality

The interface should be:

- Lean.
- Clean.
- Quiet.
- Fast.
- Trustworthy.
- Operational rather than decorative.
- Built for repeated daily use.

For active implementation work, the detailed UI pattern rules now live in `docs/cleanops-ui-design-guide.md`. Use this specification for product scope and goals, and use the design guide for approved UI patterns.

The design should prioritise clarity over visual drama. No marketing-style dashboard full of oversized cards. No excessive gradients. No crowded sidebars. No vague labels.

### Visual Direction

Recommended design style:

- Light interface by default.
- Warm off-white application shell with white content panels.
- One calm primary accent colour.
- Strong readable typography.
- Dense but breathable layout.
- Clear status chips.
- Small, practical icons.
- 8px or smaller border radius.
- Tables for operational lists.
- Drawers and modals for focused actions.
- Calendar and schedule views that are readable at a glance.

Suggested colour system:

- App shell: `#F5F3EC`
- Background: `#FAFAF7`
- Surface: `#FFFFFF`
- Text primary: `#123235`
- Text secondary: `#6F7F79`
- Border: `#E3E5DE`
- Primary accent: `#2F8A2F`
- Primary accent hover: `#247226`
- Soft green state: `#E7F2E3`
- Success: `#2F8A2F`
- Warning: `#B76A20`
- Danger: `#B5443E`
- Info: `#2D6E8F`

Avoid:

- Heavy purple gradients.
- Decorative blobs.
- Oversized hero sections.
- Nested cards.
- Overly rounded pill-heavy UI.
- Long explanatory text inside the app.
- Feature descriptions where direct controls would work better.

### Reference-Inspired UX System

The preferred interface style is a Jobber-like operational layout:

- A narrow persistent left navigation rail in a warm off-white colour.
- A compact brand mark at the top of the rail.
- Primary create action near the top of the rail.
- Clear module navigation: Home, Schedule, Clients, Requests, Quotes, Jobs, Invoices, Team, Reports, Settings.
- Active navigation item shown as a white rounded rectangle with a subtle border or shadow.
- Top utility bar with search, notifications, help, and settings icons.
- Page title area with object name, status chip, and primary actions on the right.
- Main content split into a wide primary column and a narrower right-side context column on detail screens.
- White panels with light borders, 8px radius, compact headings, and clear empty states.
- Green primary buttons for meaningful actions such as Email, New Job, Send Quote, or Create Invoice.
- Secondary actions as quiet bordered buttons.
- Status chips should use pale fills and small text, not loud badges.
- Empty states should be short, calm, and action-oriented.

This style should be treated as the baseline for all admin screens. The app must feel like a practical work surface for a cleaning company, not a generic SaaS landing page.

### Layout Rules

- Desktop admin layout uses a fixed left rail of approximately 168px.
- Content width should be fluid, with generous horizontal space on large displays.
- Detail screens should use a 2-column content grid: main work content and right context panel.
- List screens should use tables with compact filters above them.
- Schedule screens may use a full-width operational grid because calendar density matters.
- Mobile cleaner screens should not reuse the full admin rail; they should use a simple mobile header and bottom navigation.
- Client portal screens should be simpler than admin screens and should avoid internal operational language.

### Component Rules

- Buttons: 36-40px height on desktop, 44px touch targets on mobile.
- Panels: white background, 1px border, 8px radius.
- Inputs: light border, 8px radius, compact labels.
- Search: top utility search with placeholder only.
- Tables: sticky header where useful, clear status chips, row actions in a final column.
- Tabs: thin underline active state using primary green.
- Icons: small line icons, 16-20px, muted by default.
- Empty states: icon circle, one strong line, one muted line, one optional action.
- Drawers: right-side for create/edit flows where context should remain visible.
- Modals: only for destructive confirmations, payment actions, or focused short tasks.

### Interaction Principles

- Every main object should have a clear status.
- Every workflow should show the next best action.
- Critical information should be visible before opening details.
- Sensitive information should be hidden until intentionally revealed.
- Mobile cleaner screens should require minimal typing.
- Office screens should support keyboard-friendly admin work.
- Lists should have search, filters, saved views, and bulk actions where useful.

## 5. Core Modules

Version 1 should include these modules:

1. Dashboard.
2. Clients and properties.
3. Enquiries.
4. Quotes.
5. Jobs.
6. Schedule and generated scheduled jobs/cleans.
7. Field staff mobile app.
8. Checklists and forms.
9. Invoices and payments.
10. Communications.
11. Issues and quality control.
12. Staff and permissions.
13. Reports.
14. Settings and templates.

## 6. Key Workflows

### 6.1 Enquiry to Quote to Job

Flow:

1. New enquiry is created from office entry, website form, phone call, email, or client portal.
2. Office reviews enquiry.
3. Client and property record are created or matched.
4. Office records cleaning requirements.
5. Quote is created using a service template.
6. Optional extras and deposit are added.
7. Quote is sent to client.
8. Client approves quote.
9. Quote is converted to a one-off or recurring Job Plan.
10. Scheduled jobs/cleans are generated or placed on the Schedule.
11. Booking confirmation is sent.

Acceptance criteria:

- User can create an enquiry in under 2 minutes.
- User can convert an enquiry into a quote without retyping client details.
- User can convert an approved quote into a Job Plan without retyping quote line items.
- Quote approval status is visible in the client timeline.

### 6.2 One-Off Cleaning Job

Used for:

- End-of-tenancy clean.
- Deep clean.
- Spring clean.
- Carpet clean.
- Oven clean.
- Ad hoc commercial clean.

Flow:

1. Create Job Plan.
2. Select client and property.
3. Select service template.
4. Add line items and price.
5. Add scheduled job date, duration, arrival window, and assigned team.
6. Add access details and internal notes.
7. Send confirmation.
8. Cleaner completes the scheduled job/clean.
9. Office reviews completion.
10. Billable event is created and invoice is issued from billable work.

Acceptance criteria:

- One-off Job Plan can generate one or multiple scheduled jobs/cleans if needed.
- Job Plan can be created from an approved quote.
- Internal notes are separated from client-visible notes.
- Scheduled job completion can create a Job Report and billable event.

### 6.3 Recurring Cleaning Contract

Used for:

- Weekly domestic cleaning.
- Fortnightly domestic cleaning.
- Daily office cleaning.
- Weekly communal area cleaning.
- Monthly specialist maintenance.

Flow:

1. Create recurring Job Plan.
2. Set frequency.
3. Set start date and optional end date.
4. Set visit duration and preferred time window.
5. Assign regular cleaner or team.
6. Choose invoice schedule.
7. Preview generated scheduled jobs/cleans for the chosen horizon.
8. Confirm generation and adjust individual scheduled jobs only when needed.

Acceptance criteria:

- Recurring Job Plans can repeat daily, weekly, fortnightly, every 4 weeks, monthly, or custom.
- Individual scheduled jobs can be rescheduled without changing the whole series.
- Series changes can apply to future scheduled jobs only.
- Public holiday handling can skip, reschedule, or keep generated scheduled jobs.
- Recurring Job Plan setup should generate planned scheduled jobs directly; it must not create dozens of unscheduled items that the Schedule page has to manually sort.

### 6.4 Daily Cleaner Workflow

Flow:

1. Cleaner opens mobile app.
2. Cleaner sees today's assigned scheduled jobs/cleans.
3. Cleaner opens first scheduled clean.
4. Cleaner reviews address, arrival window, access notes, hazards, checklist, and client preferences.
5. Cleaner starts visit.
6. Cleaner completes checklist.
7. Cleaner adds photos or notes if required.
8. Cleaner stops timer.
9. Cleaner marks the scheduled clean complete.
10. Next scheduled clean appears.

Acceptance criteria:

- Cleaner can complete a normal scheduled clean without using desktop screens.
- Cleaner sees only assigned work unless permission allows more.
- Sensitive access notes are protected by permission and reveal logging.
- Scheduled job completion records timestamp, user, and optional GPS metadata where lawful and configured.

### 6.5 Invoice and Payment

Flow:

1. Invoice draft is generated from selected billable events created by completed/approved scheduled jobs.
2. Office reviews line items, VAT, payment terms, and deposit allocation.
3. Invoice is sent by email.
4. Client pays online or by bank transfer.
5. Payment is recorded.
6. Receipt is sent.
7. Overdue reminders are triggered automatically.

Acceptance criteria:

- Invoice can be created from selected billable events, including recurring scheduled jobs and approved extras.
- Deposit payments can be applied to invoices.
- VAT can be configured for VAT-registered companies.
- Overdue invoices are visible on dashboard.

## 7. Information Architecture

### Main Navigation

Primary navigation:

- Dashboard.
- Schedule.
- Clients.
- Enquiries.
- Quotes.
- Jobs.
- Invoices.
- Team.
- Reports.
- Settings.

Mobile cleaner navigation:

- Today.
- Upcoming.
- Timesheet.
- Profile.

Supervisor mobile navigation:

- Today.
- Team.
- Issues.
- Timesheets.

### Global Search

Global search should find:

- Clients.
- Properties.
- Jobs.
- Visits.
- Quotes.
- Invoices.
- Phone numbers.
- Email addresses.
- Postcodes.

Search result format:

- Object type.
- Name/title.
- Status.
- Address or key context.
- Last activity.

## 8. Dashboard Specification

### Owner Dashboard

Widgets:

- Today's visits.
- Open enquiries.
- Quotes awaiting approval.
- Jobs requiring scheduling.
- Overdue invoices.
- Revenue this month.
- Recurring revenue.
- Issues requiring attention.
- Staff availability.

Design:

- Compact metrics row.
- Work queue table.
- Today schedule strip.
- Exceptions first.

### Office Dashboard

Widgets:

- New enquiries.
- Quotes to follow up.
- Jobs to schedule.
- Tomorrow access checks.
- Invoices to send.
- Overdue invoices.
- Complaints or revisits.

### Cleaner Dashboard

Widgets:

- Today's visits.
- Next job.
- Required actions.
- Timesheet status.

Cleaner dashboard should not show company revenue, all clients, or unrelated team data.

## 9. Clients and Properties

### Client Record

Fields:

- Client ID.
- Client type: domestic, landlord, letting agent, commercial, property manager.
- Name or company name.
- Primary contact.
- Email.
- Phone.
- Billing address.
- Preferred contact method.
- Payment terms.
- VAT notes if relevant.
- Tags.
- Status: lead, active, paused, former, blocked.
- Created date.
- Last activity date.

### Property Record

Fields:

- Property ID.
- Client ID.
- Service address.
- Postcode.
- Property type.
- Bedrooms.
- Bathrooms.
- Approximate size.
- Furnished status.
- Parking notes.
- Access method.
- Key holding status.
- Alarm notes.
- Pets.
- Sensitive surfaces.
- Product restrictions.
- Hazards.
- Standard checklist.
- Internal notes.

One client may have multiple properties. This is essential for landlords, letting agents, commercial groups, and property managers.

### Client Timeline

Show all activity:

- Enquiries.
- Quotes.
- Jobs.
- Visits.
- Invoices.
- Payments.
- Emails.
- SMS messages.
- Notes.
- Issues.
- Photos.
- Changes to sensitive access details.

Timeline should be filterable by type.

## 10. Enquiries Module

### Enquiry Sources

Supported sources:

- Manual entry.
- Website form.
- Client portal.
- Phone.
- Email.
- Referral.
- Repeat client request.

### Enquiry Statuses

- New.
- Awaiting information.
- Assessment required.
- Quote required.
- Quote sent.
- Converted.
- Declined.
- Lost.

### Enquiry Fields

- Source.
- Client details.
- Property details.
- Service type.
- Preferred date.
- Preferred frequency.
- Urgency.
- Notes.
- Photos.
- Assigned office user.
- Follow-up date.

### Cleaning Intake Forms

Create form templates:

- Regular domestic clean.
- Deep clean.
- End-of-tenancy clean.
- Commercial clean.
- Communal area clean.
- Specialist clean.

## 11. Quotes Module

### Quote Statuses

- Draft.
- Sent.
- Viewed.
- Awaiting approval.
- Approved.
- Changes requested.
- Declined.
- Expired.
- Converted.

### Quote Fields

- Quote number.
- Client.
- Property.
- Service type.
- Line items.
- Optional extras.
- Deposit amount.
- VAT.
- Valid until date.
- Terms.
- Internal notes.
- Client-visible notes.

### Quote Builder

Features:

- Service templates.
- Optional extras.
- Price presets.
- Deposit toggle.
- VAT handling.
- Preview as client.
- Send by email.
- Send by SMS link.
- Approval tracking.
- Convert to job.

### Quote Templates

Must include:

- Domestic regular.
- Deep clean.
- End-of-tenancy.
- Office cleaning.
- Communal area.
- Carpet or specialist.

## 12. Jobs Module

Jobs v0 should follow `docs/cleanops-jobs-workflow.md`.

The Jobs module should not be modelled as only a kanban board. It should manage Job Plans, generated scheduled jobs/cleans, recent report summaries, and billable-event readiness.

Preferred user-facing chain:

```text
Accepted quote
  -> Job Plan
    -> Generated Scheduled Jobs / Cleans
      -> Completed Job Report
        -> Billable Event
          -> Invoice
```

### Job Types

- One-off.
- Recurring.
- Contract.
- Assessment.
- Revisit.
- Warranty/correction.

### Job Statuses

- Draft.
- Needs setup.
- Active.
- Paused.
- Completed.
- Cancelled.
- Archived.

### Job Fields

- Job Plan ID.
- Job display name, preferably address-first and derived from the first address line where practical.
- Client ID.
- Property ID.
- Source quote ID.
- Service type.
- One-off or recurring.
- Cadence / recurrence rule.
- Preferred day/time.
- Start date and optional end date.
- Default duration.
- Default cleaner/team.
- Checklist template.
- Products/equipment rules.
- Price/billing basis.
- Internal notes.
- Status.

### Setup Complete

A Job Plan should only leave Needs setup when it is practical enough to run.

Setup complete means:

- client linked.
- property linked.
- source quote linked or marked manual.
- service type selected.
- one-off or recurring pattern confirmed.
- start date/time confirmed.
- default duration confirmed.
- cleaner/team selected or marked flexible.
- checklist template selected.
- price/billing basis confirmed.
- products/equipment notes confirmed.
- recurrence generation reviewed/confirmed if recurring.

Jobs v0 should include a clear Mark setup complete action.

### Jobs Page Layout

Jobs v0 should have three levels:

1. Action panel at top for human/admin action only.
2. Jobs list/register showing all Job Plans separately.
3. Job workspace for the selected Job Plan.

The action panel should use:

- Needs setup.
- Needs review.
- Ready to bill.

Do not add a separate Issues column in Jobs v0. Issues, complaints, no access, extra time, and cleaner/client remarks should appear in Needs review with severity chips.

Normal completed recurring cleans should not create admin work every time. If checklist is complete and there are no cleaner remarks, client remarks, issues, extra time, no access, or complaints, the Job Report should be stored quietly, a billable event should be created/prepared, the action panel should stay clean, the recurring Job Plan should continue normally, and the next generated scheduled clean should remain in place.

Jobs list rows/cards should show only the last 3 reports or the latest important remark. Full history belongs in Reports / Job history, where it can later be searched and filtered.

The same client/property may have multiple separate Job Plans. Do not merge jobs just because the client/property is the same.

Example:

- `Unit 5 All Saints - Weekly office clean`
- `Unit 5 All Saints - Monthly deep clean`
- `Unit 5 All Saints - One-off carpet clean`

### Job Actions

- Create or edit Job Plan.
- Generate scheduled jobs/cleans.
- Preview generated schedule.
- Pause job plan.
- Resume job plan.
- Skip selected scheduled clean.
- Cancel selected scheduled clean.
- Add extra one-off scheduled clean.
- Assign team.
- Send confirmation.
- Add note.
- Review report.
- Create billable event.
- Mark ready to bill.
- Mark setup complete.
- Duplicate.

## 12.1 Recurring Job Generation

Recurring Job Plan setup should:

- choose recurrence frequency.
- choose day/time.
- choose cleaner/team if known.
- choose start date.
- choose optional end date.
- choose generate-ahead window, e.g. 1 month or 3 months.
- preview generated scheduled jobs/cleans before or immediately after confirmation.

Generated recurring work should appear in the Schedule as planned/scheduled work. It should not appear as a large pile of unscheduled items that must be manually arranged.

The generated schedule preview should be spreadsheet-like and include:

- Date.
- Job / clean.
- Time.
- Cleaner/team.
- Status.
- Skip/cancel checkbox.
- Reason/note.

This allows 1 to 3 months of generated recurring work to be reviewed before confirmation.

## 13. Scheduling Module

Schedule is the calendar view of generated scheduled jobs/cleans. It should not duplicate the Jobs workspace.

### Schedule Views

Required views:

- Day.
- Week.
- Month.
- Team view.
- Route/list view.
- Unscheduled one-off/ad-hoc work.

### Scheduled Job Card Information

Show:

- Time window.
- Client/property.
- Service type.
- Assigned staff.
- Status.
- Duration.
- Access warning.
- Payment/deposit warning.
- Issue flag.

### Scheduled Job Statuses

- Unscheduled.
- Scheduled.
- Confirmed.
- On the way.
- Started.
- Completed.
- Missed.
- Access failed.
- Cancelled.
- Rescheduled.

### Scheduling Features

- Drag and drop scheduled jobs.
- Assign staff.
- Reassign staff.
- Recurring schedule generation.
- Conflict warnings.
- Staff availability.
- Travel buffer.
- Area/postcode grouping.
- Public holiday handling.
- Schedule notes.

### Schedule Boundary

Schedule should mainly be used for:

- visual calendar view of generated scheduled jobs.
- alterations/adjustments to existing scheduled jobs.
- dealing with exceptions.
- one-off jobs.
- ad-hoc extra jobs.
- rescheduling cancelled/skipped work.
- staff/time changes.
- capacity checking before accepting new work.

For recurring work, Job Plan setup creates the repeating schedule pattern. Schedule edits exceptions and adjustments.

For one-off work, Schedule may be the main place to choose the date/time because there is no recurring pattern.

## 14. Field Staff Mobile Experience

### Mobile Visit Screen

Sections:

- Client and property.
- Time window.
- Address and map link.
- Access details.
- Hazards.
- Service scope.
- Checklist.
- Notes.
- Photos.
- Timer.
- Completion button.

### Cleaner Actions

- Start visit.
- Pause or stop timer.
- Complete checklist.
- Add note.
- Upload photo.
- Report issue.
- Request office help.
- Mark complete.

### Sensitive Access UX

Access details should:

- Be hidden by default.
- Require tap to reveal.
- Log who revealed them and when.
- Be unavailable to users without permission.
- Be excluded from client-visible screens.

### Offline Support

Version 1 should support basic offline resilience:

- Today's assigned visits cached locally.
- Checklists can be completed offline.
- Notes and photos queue for upload.
- Clear sync status shown.

## 15. Checklists and Forms

### Checklist Features

- Template library.
- Required items.
- Optional items.
- Conditional sections.
- Cleaner comments.
- Photo required option.
- Supervisor review option.

### Standard Templates

- Domestic regular clean.
- Deep clean.
- End-of-tenancy clean.
- Commercial clean.
- Communal area clean.
- Carpet clean.
- Supervisor inspection.
- Access failure.
- Damage report.

### Form Output

Completed forms should attach to:

- Visit.
- Job.
- Client timeline.

Optionally send selected client-facing completion summaries.

## 16. Invoices and Payments

### Invoice Statuses

- Draft.
- Sent.
- Viewed.
- Part paid.
- Paid.
- Overdue.
- Written off.
- Cancelled.

### Invoice Features

- Create from selected billable events.
- Group multiple billable events onto one invoice.
- Link each billable event back to completed/approved work.
- Apply deposit.
- Add VAT.
- Add discounts.
- Add expenses or charges.
- Send by email.
- Payment link.
- Manual payment recording.
- Receipts.
- Automatic reminders.

Do not create invoices directly from the parent Job Plan without completed/approved work unless a later explicit contract/monthly billing model supports that behaviour.

### UK VAT Requirements

If VAT registered, invoice templates must support:

- VAT registration number.
- Sequential invoice numbers.
- Tax point.
- VAT rate.
- Net amount.
- VAT amount.
- Total amount.

If not VAT registered:

- VAT must not appear as a separate charge.

### Payment Integrations

Recommended:

- Stripe for card payments.
- GoCardless for direct debit.
- Bank transfer instructions.
- Accounting sync with Xero or QuickBooks.

## 17. Communications

### Channels

- Email.
- SMS.
- Client portal notifications.
- Internal notes.

### Message Templates

Required templates:

- Quote sent.
- Quote follow-up.
- Quote approved.
- Booking confirmation.
- Appointment reminder.
- Access problem.
- Job completed.
- Invoice sent.
- Payment reminder.
- Payment receipt.
- Review request.
- Cancellation.
- Reschedule.

### Communication Log

Every outbound message should be logged with:

- Recipient.
- Channel.
- Template.
- Timestamp.
- Delivery status.
- Related object.

## 18. Client Portal

### Portal Features

Clients can:

- View quotes.
- Approve quotes.
- Request changes.
- View upcoming visits.
- Request new work.
- Pay invoices.
- View receipts.
- Update contact details.
- Send a message.

### Portal Design

The portal should be even simpler than the admin app:

- Clear next action.
- Minimal navigation.
- Mobile friendly.
- Secure magic link or account login.
- No operational clutter.

### Portal Security

- Links should expire or require verification for sensitive actions.
- Clients should only see their own properties and records.
- Access notes should never be visible.

## 19. Issues and Quality Control

### Issue Types

- Complaint.
- Revisit required.
- Damage reported.
- Access failed.
- Late arrival.
- Cleaner concern.
- Client no-show.
- Missing item allegation.
- Safety issue.
- Product issue.

### Issue Statuses

- Open.
- Investigating.
- Awaiting client.
- Revisit scheduled.
- Resolved.
- Closed.

### Issue Fields

- Related client.
- Related property.
- Related job/visit.
- Type.
- Priority.
- Description.
- Photos.
- Assigned owner.
- Resolution.

### Quality Features

- Supervisor inspections.
- Revisit tracking.
- Complaint history.
- Quality score per client or site.
- Cleaner performance notes.

## 20. Staff and Permissions

### Staff Fields

- Name.
- Email.
- Phone.
- Role.
- Employment type.
- Service areas.
- Skills.
- Availability.
- Active/inactive status.

### Roles

- Owner.
- Admin.
- Supervisor.
- Cleaner.
- Bookkeeper.

### Permission Rules

Permission system must support:

- View assigned visits only.
- View all visits.
- Manage clients.
- Manage quotes.
- Manage jobs.
- Manage invoices.
- View reports.
- Manage settings.
- Reveal access details.
- Manage users.

### Audit Logging

Log:

- User login.
- Sensitive access detail reveal.
- Quote approval.
- Invoice send.
- Payment record changes.
- Client data edits.
- Job cancellation.
- Permission changes.

## 21. Reports

### Operational Reports

- Today's scheduled jobs/cleans.
- Missed scheduled jobs/cleans.
- Access failures.
- Jobs ready to invoice.
- Unscheduled one-off/ad-hoc work.
- Cleaner utilisation.
- Scheduled job completion rate.
- Job report history.
- Latest important job remarks.

Jobs list/cards should only surface recent report summaries. Full completed-clean history belongs in Reports / Job history and should later support filtering/searching.

### Sales Reports

- New enquiries.
- Quote conversion.
- Average quote value.
- Lost quote reasons.
- Revenue by service.

### Finance Reports

- Revenue by month.
- Outstanding invoices.
- Overdue invoices.
- Payments received.
- VAT summary export.
- Revenue per labour hour.

### Quality Reports

- Complaints.
- Revisits.
- Inspection scores.
- Client retention.
- Cleaner performance indicators.

## 22. Settings

### Company Settings

- Company name.
- Trading name.
- Logo.
- Address.
- Phone.
- Email.
- Website.
- Business hours.
- Service areas.

### Service Settings

- Service catalogue.
- Price presets.
- Quote templates.
- Job templates.
- Checklist templates.
- Optional extras.

### Finance Settings

- Currency: GBP.
- VAT registration status.
- VAT number.
- Invoice numbering.
- Payment terms.
- Payment integrations.
- Accounting integrations.

### Communication Settings

- Email sender.
- SMS sender.
- Template editor.
- Reminder timing.
- Review link.

### Schedule Settings

- Default visit duration.
- Arrival window options.
- Public holiday rules.
- Cancellation rules.
- Travel buffer.

## 23. Data Model

Core entities:

- User.
- StaffProfile.
- Client.
- Contact.
- Property.
- Enquiry.
- Quote.
- QuoteLineItem.
- Job.
- Visit.
- VisitAssignment.
- ChecklistTemplate.
- ChecklistResponse.
- Invoice.
- InvoiceLineItem.
- Payment.
- Message.
- Issue.
- Attachment.
- Note.
- AuditLog.

### Entity Relationships

- Client has many contacts.
- Client has many properties.
- Client has many enquiries.
- Client has many quotes.
- Client has many jobs.
- Property belongs to client.
- Job belongs to client and property.
- Job has many visits.
- Visit has many staff assignments.
- Quote can convert to job.
- Job can generate invoice.
- Invoice can have many payments.
- Visit can have checklist responses, notes, photos, and issues.

## 24. Status Model

### Enquiry Lifecycle

New -> Awaiting information -> Quote required -> Quote sent -> Converted

Alternative endings:

- Declined.
- Lost.

### Quote Lifecycle

Draft -> Sent -> Viewed -> Approved -> Converted

Alternative endings:

- Changes requested.
- Declined.
- Expired.

### Job Lifecycle

Draft -> Scheduled -> In progress -> Completed -> Ready to invoice -> Invoiced -> Paid

Alternative endings:

- Cancelled.
- On hold.

### Visit Lifecycle

Unscheduled -> Scheduled -> Confirmed -> Started -> Completed

Alternative endings:

- Access failed.
- Missed.
- Cancelled.
- Rescheduled.

### Invoice Lifecycle

Draft -> Sent -> Viewed -> Paid

Alternative states:

- Part paid.
- Overdue.
- Cancelled.
- Written off.

## 25. Notifications and Automations

### Client Automations

- Quote sent.
- Quote follow-up after 2 days.
- Booking confirmation.
- Appointment reminder 24 hours before.
- Invoice sent.
- Payment reminder after due date.
- Review request after completed clean.

### Internal Automations

- New enquiry assigned.
- Quote not followed up.
- Tomorrow's visits missing access details.
- Deposit unpaid before visit.
- Visit not completed by expected time.
- Cleaner reported issue.
- Invoice overdue.
- Recurring contract ending soon.

## 26. Integrations

### Required or High-Value Integrations

- Stripe.
- GoCardless.
- Xero.
- QuickBooks.
- Google Calendar or Outlook Calendar.
- Twilio or SMS provider.
- Mail provider.
- Google Maps or Mapbox.

### Future Integrations

- WhatsApp Business.
- Trustpilot or Google Reviews.
- Payroll software.
- HR system.
- Zapier or Make.
- Open banking payment reconciliation.

## 27. Security and Compliance

### Authentication

- Email and password.
- Multi-factor authentication for admins.
- Magic link option for clients.
- Session management.
- Password reset.

### Data Protection

The app must support UK GDPR-friendly operation:

- Role-based access.
- Audit logs.
- Data export.
- Client deletion or anonymisation workflow.
- Retention settings.
- Consent or lawful-basis notes where needed.
- Secure storage of sensitive access details.

### Sensitive Data Rules

Sensitive fields:

- Alarm codes.
- Key safe codes.
- Door codes.
- Lockbox locations.
- Client absence notes.
- Internal complaint notes.
- Photos inside homes.

Requirements:

- Sensitive fields are permission protected.
- Reveals are logged.
- Sensitive fields are never included in client portal.
- Sensitive fields can be cleared separately from general client history.

## 28. Technical Requirements

### Architecture

Recommended:

- Web app for office/admin.
- Mobile-responsive app or dedicated mobile app for cleaners.
- API-first backend.
- PostgreSQL database.
- Object storage for photos and attachments.
- Background jobs for reminders, recurring visits, and invoice automation.

### Performance

- Dashboard loads in under 2 seconds for typical data volumes.
- Search returns results in under 500ms for common queries.
- Schedule view supports at least 100 visits per day.
- Mobile visit screen loads quickly on standard mobile connections.

### Availability

- Target uptime: 99.5% for MVP, 99.9% for mature product.
- Backups daily at minimum.
- Point-in-time recovery preferred.

### Auditability

Every important action should record:

- User.
- Timestamp.
- Object affected.
- Before and after values where useful.
- IP/device metadata where appropriate.

## 29. MVP Scope

### MVP Must Have

- Login and roles.
- Clients and properties.
- Enquiries.
- Quotes.
- Jobs.
- Recurring jobs.
- Schedule.
- Cleaner mobile visit workflow.
- Checklists.
- Invoices.
- Basic payments/manual payment records.
- Email templates.
- Dashboard.
- Basic reports.
- Sensitive access note protection.

### MVP Should Have

- SMS reminders.
- Stripe payments.
- Photo uploads.
- Issue tracking.
- Quote approval portal.
- Invoice payment portal.
- Xero or QuickBooks export.

### MVP Could Have

- Route map.
- Cleaner GPS waypoints.
- GoCardless.
- Advanced public holiday rules.
- Review request automation.
- Supervisor inspections.

## 30. Future Roadmap

### Phase 2

- Advanced client portal.
- GoCardless direct debit.
- Accounting sync.
- Staff availability and holiday management.
- Better route planning.
- Supervisor quality scoring.
- Automated quote follow-up sequences.

### Phase 3

- Customer self-booking.
- AI quote assistant.
- AI visit summary.
- Profitability forecasting.
- Inventory and consumables.
- Advanced reporting.
- Multi-branch support.

### Phase 4

- Native mobile apps.
- Client mobile app.
- Payroll integrations.
- Advanced commercial contract management.
- Automated recurring price reviews.

## 31. Screen-by-Screen Specification

Static UX mockups have been created in:

`mockups/cleanops-mockups.html`

The mockup file is a clickable prototype covering:

- Home dashboard.
- Client detail.
- Schedule.
- Requests.
- Quotes.
- Jobs.
- Invoices.
- Team.
- Reports.
- Settings.
- Cleaner mobile app.
- Client portal.

The mockups should be used to validate the visual language before detailed UI design. They intentionally use a calm off-white shell, narrow left rail, compact top search, white content panels, pale status chips, green primary actions, detail-page sidebars, and short empty states.

### Dashboard Screen

Purpose:

- Show what needs attention today.

Key components:

- Metrics row.
- Today schedule.
- Work queue.
- Overdue invoices.
- Issues.
- Quick create button.

Primary actions:

- Create enquiry.
- Create quote.
- Create job.
- Open schedule.
- Send invoice reminder.

### Schedule Screen

Purpose:

- Manage visits by day, week, team, and status.

Key components:

- Calendar.
- Team column view.
- Unscheduled panel.
- Filters.
- Visit detail drawer.

Primary actions:

- Schedule visit.
- Drag visit.
- Assign cleaner.
- Reschedule.
- Mark confirmed.

### Client Detail Screen

Purpose:

- Single source of truth for a client.

Key components:

- Client summary.
- Properties.
- Timeline.
- Open jobs.
- Quotes.
- Invoices.
- Notes.
- Issues.

Primary actions:

- Add property.
- Create quote.
- Create job.
- Send message.
- Add note.

### Property Detail Screen

Purpose:

- Store cleaning-specific property information.

Key components:

- Address.
- Property details.
- Access details.
- Hazards.
- Cleaning preferences.
- Photos.
- Linked jobs and visits.

Primary actions:

- Edit access.
- Add hazard.
- Create job.
- Add photo.

### Quote Builder Screen

Purpose:

- Build accurate cleaning quotes quickly.

Key components:

- Client/property selector.
- Service template selector.
- Line item table.
- Optional extras.
- Deposit.
- Terms.
- Preview.

Primary actions:

- Save draft.
- Preview.
- Send.
- Convert to job.

### Job Detail Screen

Purpose:

- Manage the operational work record.

Key components:

- Job summary.
- Scope.
- Visits.
- Assigned team.
- Checklist.
- Notes.
- Invoice status.

Primary actions:

- Add visit.
- Assign team.
- Send confirmation.
- Create invoice.
- Mark complete.

### Mobile Today Screen

Purpose:

- Let cleaners complete their day with minimal friction.

Key components:

- Next visit.
- Visit list.
- Status indicators.
- Timesheet state.

Primary actions:

- Open visit.
- Start day.
- End day.

### Mobile Visit Screen

Purpose:

- Guide cleaner through one visit.

Key components:

- Address.
- Arrival window.
- Access reveal.
- Scope.
- Checklist.
- Timer.
- Notes/photos.
- Complete button.

Primary actions:

- Start visit.
- Complete checklist.
- Add note.
- Report issue.
- Mark complete.

## 32. Acceptance Criteria Summary

The application is successful when:

- Office can process enquiries, quotes, jobs, schedules, invoices, and issues in one system.
- Cleaners can complete daily work from mobile without needing office support for normal visits.
- Sensitive access details are controlled and audited.
- Recurring cleaning jobs are easy to create and maintain.
- Invoices are created quickly and overdue invoices are visible.
- Client communication is logged.
- Reports help the company understand work, revenue, quality, and team performance.
- UX remains calm, fast, and uncluttered even as data grows.

## 33. Open Product Decisions

These decisions should be confirmed before design and development:

- Should the first version include public self-booking, or only internal booking?
- Should cleaners use a responsive web app first, or native mobile apps?
- Which accounting software should be prioritised?
- Should payments start with Stripe only, or Stripe and GoCardless?
- Should quote approvals require client login or secure magic links?
- What exact VAT status and invoice wording applies to the company?
- What data retention policy should be applied to former clients and access details?
- Should GPS metadata be collected, and how will staff be informed?

## 34. Recommended Build Approach

Build in this order:

1. Core data model: clients, properties, jobs, visits, users.
2. Authentication and permissions.
3. Admin dashboard and client records.
4. Enquiries and quotes.
5. Scheduling.
6. Mobile cleaner workflow.
7. Invoices.
8. Client portal.
9. Automations.
10. Reports.
11. Integrations.

This order makes the system useful early while keeping the product grounded in real cleaning operations.
