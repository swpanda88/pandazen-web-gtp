# Statuses Dictionary

This document defines the standard statuses for all primary entities in PandaZen to ensure consistency across features.

## Clients
- `lead`: Created via an initial enquiry, not yet qualified.
- `prospect`: Qualified, potentially receiving quotes.
- `active_client`: Has accepted jobs and receives active service.
- `commercial`: A B2B client receiving active service.
- `paused`: Service temporarily halted.
- `inactive`: No longer receiving service.

## Requests
- `new`: Unread or unprocessed.
- `contacted`: Acknowledged by staff.
- `waiting`: Waiting on client response.
- `assessment_required`: Needs an on-site visit before quoting.
- `quoted`: Quote generated from this request.
- `won`: Converted to a job.
- `lost`: Rejected or declined.

## Quotes
- `draft`: Being assembled by staff.
- `sent`: Sent to client, awaiting decision.
- `accepted`: Approved by client.
- `declined`: Rejected by client.
- `expired`: Time window lapsed.

## Jobs
- `planned`: Accepted quote, but dates not yet scheduled.
- `active`: Live job generating visits.
- `paused`: Temporarily halted.
- `completed`: A one-off job that is finished.
- `cancelled`: Terminated before completion.

## Invoices
- `draft`: Being assembled.
- `sent`: Sent to client.
- `paid`: Payment received and reconciled.
- `overdue`: Payment past due date.
- `void`: Cancelled.
