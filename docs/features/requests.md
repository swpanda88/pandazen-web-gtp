# Feature: Requests

## Purpose
Manages incoming leads and queries (Requests). This is the triage area before something becomes a Quote or a Job.

## Business Workflow
A Request is typically generated via the public website enquiry form. Staff review the Request in CleanOps, link it to an existing (or new) Client and Property, and then either reject it or convert it to a Quote/Job.

## UI
- `cleanops/requests.js`
- Renders a list of pending requests.
- Clicking a request opens a detailed review drawer where staff can map it to a Client/Property.

## API
- `/api/cleanops/requests`

## Database
- `requests` table (ID, Status, Name, Email, Phone, Postcode, Service Type, Message)

## Current State
- The UI lists requests and allows opening the review drawer.
- We can save the Client/Property linking mapping.

## Future Direction
- Automatically parsing website forms into this DB table. Currently, website forms just send an email. In the future, they will POST directly here.

## Known Issues
- Currently, public forms are not yet wired to CleanOps directly.

## Open Decisions
None.

## Completed Milestones
- [x] Initial scaffolding
- [x] DB Migration 0004

## Next Milestone
- [ ] Unknown.

## Testing
- Ensure the Review Drawer maintains state correctly when saving mappings.
