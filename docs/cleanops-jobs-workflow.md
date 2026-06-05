# CleanOps Jobs Workflow and Recurring Schedule Model

Status: Jobs v0 planning only  
Scope: Documentation and product model, not implemented runtime functionality

This document defines the CleanOps Jobs model before Jobs v0 is built. It exists to keep future implementation aligned around recurring cleaning plans, generated scheduled work, cleaner reports, billable events, and invoices.

Do not treat Jobs as only a kanban board. Do not make Schedule duplicate Jobs. Do not make a heavy separate Visit module prominent in the user-facing UI unless future evidence proves it is needed.

## 1. Preferred User-Facing Model

CleanOps should use language that matches how a cleaning company thinks about work:

```text
Accepted quote
  -> Job Plan
    -> Generated Scheduled Jobs / Cleans
      -> Schedule calendar placement
        -> Completed Job Report
          -> Billable Event
            -> Invoice
```

### Object Definitions

**Job Plan**  
The parent service/control record. For one-off work, it may only generate one scheduled job. For recurring work, it defines the recurrence and default rules.

**Scheduled Job / Clean**  
A dated occurrence generated from a Job Plan and shown on the Schedule/calendar. User-facing wording can be "Scheduled clean", "Scheduled job", or "Job occurrence". Avoid making "Visit" a major separate user-facing module in v0.

**Job Report**  
The completion record: what happened after a scheduled job/clean was completed.

**Billable Event**  
The chargeable output created from a completed and approved scheduled job/report.

**Invoice**  
The accounting document created from selected billable events.

## 2. Job Plan

A Job Plan is the agreed service record. It controls what work exists and under what rules.

For a one-off clean, the Job Plan may generate one Scheduled Job. For recurring domestic or commercial cleaning, it defines the repeating pattern and default operational setup.

### Minimum Job Plan Fields

- `job_plan_id`
- `client_id`
- `property_id`
- `source_quote_id`
- `job_display_name`, usually a short address label such as `55 Castle Road` or `Unit 5 All Saints`
- service type
- one-off or recurring
- cadence / recurrence rule
- preferred day/time
- start date
- optional end date
- default duration
- default cleaner/team if known
- checklist template
- products/equipment rules
- price/billing basis
- internal notes
- status

### Setup-Complete Checkpoint

A Job Plan should only leave Needs setup when practical setup is complete enough to run.

Setup complete means:

- client is linked
- property is linked
- source quote is linked, or the job is clearly marked as manual
- service type is selected
- one-off or recurring pattern is confirmed
- start date/time is confirmed
- default duration is confirmed
- cleaner/team is selected or marked flexible
- checklist template is selected
- price/billing basis is confirmed
- products/equipment notes are confirmed
- recurrence generation has been reviewed/confirmed if recurring

Jobs v0 should include a clear action/state transition:

- Mark setup complete

This action should move the Job Plan out of Needs setup only after the practical setup fields above are present or intentionally marked flexible/manual/to confirm where the business accepts that risk.

### Job Plan Status Examples

- Draft
- Needs setup
- Active
- Paused
- Completed
- Cancelled
- Archived

### Job Plan Setup Must Confirm

- Client and property links
- Source quote or manual source
- Service type
- One-off or recurring pattern
- Start date/time
- Cleaning plan exists
- Recurrence/cadence is known where recurring
- Checklist template is selected
- Duration is set
- Cleaner/team is assigned or marked flexible
- Billing basis is known
- Products/equipment notes are confirmed
- First schedule generation has been confirmed

## 3. Scheduled Job / Clean

A Scheduled Job is one dated occurrence generated from a Job Plan. It is what appears on the Schedule/calendar.

### Minimum Scheduled Job Fields

- `scheduled_job_id`
- `job_plan_id`
- date
- start time
- end time / duration
- assigned cleaner/team
- status
- checklist copy
- skip/cancel flag
- skip/cancel reason
- completion/report link
- billable status

### Scheduled Job Status Examples

- Planned
- Confirmed
- In progress
- Completed
- Skipped
- Cancelled
- No access
- Needs review
- Approved

The checklist should be copied onto the Scheduled Job at generation time or start time so later checklist template edits do not accidentally rewrite historical work.

## 3.1 All-Good Fast Path

Normal recurring cleans should not create admin work every time.

If a Scheduled Job/Clean is completed and all of the following are true:

- checklist is complete
- no cleaner remarks
- no client remarks
- no issue flag
- no extra time
- no access failure
- no complaint

Then CleanOps should:

- store the Job Report quietly
- create or prepare the Billable Event
- avoid creating an action-board card
- allow the recurring Job Plan to continue normally
- leave the next generated Scheduled Job/Clean in place

Only exceptions should appear in the action panel, such as remarks, incomplete checklist items, extra time, no access, complaints, possible revisits, skipped/cancelled work, or billing uncertainty.

## 4. Job Report

A Job Report is created when a Scheduled Job/Clean is completed. It records what actually happened.

### Minimum Job Report Fields

- `job_report_id`
- `scheduled_job_id`
- completed at
- completed by
- checklist completion
- cleaner remarks
- client remarks
- issue/severity flag if needed
- photos if later supported
- management review status
- client-visible summary if later supported

### Report Principles

- Reports should not pollute the main Jobs workspace.
- Job cards/list rows should show only the last 3 reports or the latest important remark.
- Full report history belongs in Reports / Job history.
- Reports should support later filtering/searching by client, property, cleaner/team, issue type, date, and billing state.
- Completed cleans and reports should not all sit in the main Jobs workspace forever.
- Cleaner remarks and client remarks should be reviewable before billing if they affect scope, quality, or price.

### Review Severity Chips

Use a small number of practical chips:

- Note
- Extra time
- No access
- Complaint
- Urgent

Do not create a separate Issues column in Jobs v0. Issues and complaints should appear in Needs review with severity chips.

## 5. Billable Event

A Billable Event is the chargeable work output created from a completed and approved Scheduled Job/Report.

### Minimum Billable Event Fields

- `billable_event_id`
- source scheduled job/report
- catalogue item / quote item reference
- client_id
- property_id
- job_plan_id
- amount
- billing status
- invoice_id if invoiced

### Billable Event Status Examples

- Ready to invoice
- Invoiced
- Written off

Invoices should be created from selected billable events, not directly from the quote or directly from the parent Job Plan. This allows recurring work, extras, corrections, and write-offs to be handled cleanly.

The billing chain is:

```text
Job Plan = agreement/service control record
Scheduled clean = planned work occurrence
Job Report = proof/record of what happened
Billable Event = chargeable item created from completed/approved work
Invoice = commercial/accounting document created from billable events
```

Do not create invoices directly from the Job Plan without completed/approved work unless a later, explicit contract/monthly billing model supports that behaviour.

## 6. Recurring Jobs

Recurring domestic and commercial cleaning often stays stable for months or years at the same address, on the same day/time, with the same cleaner/team. CleanOps must support calendar-style recurrence generation.

### Recurring Setup Flow

1. Choose recurrence frequency, e.g. weekly, fortnightly, monthly.
2. Choose day.
3. Choose time.
4. Choose duration.
5. Choose cleaner/team if known.
6. Choose start date.
7. Choose optional end date.
8. Choose generate-ahead window, e.g. 1 month or 3 months.
9. Preview generated scheduled jobs.
10. Confirm generation.

### Generated Schedule Preview

The user should see a spreadsheet-like generated schedule preview before or immediately after confirmation.

| Date | Job / clean | Time | Cleaner/team | Status | Skip/cancel checkbox | Reason/note |
| --- | --- | --- | --- | --- | --- | --- |
| 12 Jun | Regular clean | 09:00 | Panda Cleaner | Planned | No | - |
| 19 Jun | Regular clean | 09:00 | Panda Cleaner | Planned | No | - |
| 26 Jun | Regular clean | 09:00 | Panda Cleaner | Skipped | Yes | Client holiday |
| 03 Jul | Regular clean | 09:00 | Panda Cleaner | Planned | No | - |

This preview matters because it lets the business see capacity 1 to 3 months ahead before accepting one-off jobs.

### Generation Strategy

- For recurring jobs, generate scheduled jobs ahead, e.g. next 1 month or 3 months.
- Later, support rolling generation, e.g. always maintain 1 to 3 months of future scheduled jobs.
- Individual generated jobs can differ from the parent plan in date/time/team/status/reason.
- Holidays, cancellations, sickness, or no access should be handled as per-occurrence exceptions.

## 7. Schedule Relationship

Schedule is the calendar view of generated scheduled jobs/cleans. Jobs controls the service plan and operational workflow.

### Important Scheduling Principle

The Schedule/calendar page must not become a dumping ground for dozens of unscheduled recurring work items.

For regular recurring jobs, scheduling should mainly happen during Job Plan setup:

- choose recurrence
- choose day/time
- choose cleaner/team if known
- choose start date
- choose optional end date
- choose generate-ahead window, e.g. 3 months
- generate scheduled jobs ahead
- maintain rolling generation, e.g. add 1 month ahead as time passes

Generated recurring jobs should already have planned dates/times from the Job Plan. They should appear in the Schedule as planned/scheduled work, not as a large pile of unscheduled items.

### Schedule Page Should Mainly Be Used For

- visual calendar view of generated scheduled jobs
- alterations/adjustments to existing scheduled jobs
- dealing with exceptions
- one-off jobs
- ad-hoc extra jobs
- cancellations/rescheduling
- staff/time changes
- capacity checking before accepting new work

For recurring work, Job Plan setup creates the repeating schedule pattern. Schedule edits exceptions and adjustments.

For one-off work, Schedule may be the main place to choose date/time because there is no recurring pattern.

## 8. Cancellation, Holiday, and Exceptions

Keep this lean and flexible. Do not create dozens of exception types.

### Minimum Actions

- Pause job plan
- Resume job plan
- Skip selected scheduled clean
- Cancel selected scheduled clean
- Add extra one-off scheduled clean
- Add simple reason/note

### Example Reasons

- Client holiday
- Cleaner unavailable
- No access
- Client cancelled this week
- Extra clean requested

## 9. Jobs Page Layout

Jobs v0 should have three levels.

### 9.1 Action Panel

The top action panel should show only work needing human/admin action. It should not show normal scheduled or completed jobs.

Use lean columns:

- Needs setup
- Needs review
- Ready to bill

#### Needs Setup

Accepted quote/job shell exists but Job Plan is not operationally ready.

Examples:

- no cleaning plan
- recurrence/cadence missing
- checklist missing
- duration/team missing
- billing basis missing
- first schedule generation not confirmed

The main transition out of this column should be Mark setup complete.

#### Needs Review

Completed Scheduled Job/Report needs human review.

Examples:

- cleaner remark
- client remark
- checklist incomplete
- extra time
- no access
- complaint
- possible revisit

Use severity chips such as Note, Extra time, No access, Complaint, and Urgent.

#### Ready to Bill

Completed and approved work has billable events not yet invoiced.

### 9.2 Jobs List / Register

The Jobs list should show all Job Plans separately. The same client/property may have multiple jobs, and they must be displayed separately.

Rows/cards should use address-first naming because cleaners and operators naturally refer to work by location.

The address/property short label should be derived from the first address line where practical, with future override support.

Example:

```text
55 Castle Road
John Smith - Regular domestic clean - Weekly
Next: Fri 09:00 - Panda Cleaner
Price: GBP 90 per clean
Recent: All good - Cleaner note - Skipped holiday
```

Example:

```text
Unit 5 All Saints
ABC Ltd - Commercial clean - Mon/Wed/Fri
Next: Today 18:00 - Team 1
Price: GBP 650/month
Recent: Note left
```

### Multiple Jobs Per Client/Property

A client can have multiple jobs. A property can have multiple jobs. Jobs must remain separate service records even if they share the same client/property.

Do not merge jobs just because the client/property is the same.

Example:

```text
Unit 5 All Saints - Weekly office clean
Unit 5 All Saints - Monthly deep clean
Unit 5 All Saints - One-off carpet clean
```

### 9.3 Job Workspace

Clicking a Job Plan opens a full job workspace, similar to the Client workspace pattern.

The job workspace should include:

- job summary
- client/property
- source quote
- cleaning plan / recurrence
- generated scheduled jobs table
- checklist template
- recent reports
- billing/billable events
- notes
- actions

Do not put everything directly on the Jobs list.

## 10. Module Boundaries

Jobs decides what work exists and under what rules.

Schedule decides when generated scheduled jobs happen and supports visual adjustments/exceptions.

Reports record what happened.

Invoices bill for what was completed and approved.

## 11. Known Future Needs

- Editable checklist templates
- Report/history view with filters
- Cleaner-facing checklist/report workflow
- Client-facing report for selected jobs/issues
- Real schedule conflict/capacity checking
- Real recurring generation engine
- Backend persistence
- Invoices from billable events

Do not build these until Jobs v0 has a stable frontend model and the next implementation scope is explicitly agreed.
