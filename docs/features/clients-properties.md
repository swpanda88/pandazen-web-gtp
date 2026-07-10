# Feature: Clients & Properties

## Purpose
Manages the core relationships of the business. A Client is the entity paying the bill, and a Property is the physical location where the cleaning takes place.

## Business Workflow
Clients are the root of all operations. We cannot create Jobs or Requests without a Client and an associated Property.

## UI
- `cleanops/clients.js`
- Renders a list view of clients on the left, and a detail view on the right.
- New Client and Edit Client sliding side-drawers for data entry.

## API
- `/api/cleanops/customers` (GET list, POST create)
- `/api/cleanops/customers/[id]` (GET single, PATCH update)
- Properties are fetched alongside Customers in the GET queries.

## Database
- `customers` table (ID, Name, Status, Billing Address, Internal Note, etc.)
- `properties` table (ID, Customer ID, Address, Bedrooms, Bathrooms, Pets, Access, etc.)

## Current State
- Creating, editing, and listing Clients works.
- Creating a first Property during Client creation works.
- Standalone Property creation works.

## Future Direction
- This module will eventually support complex multi-property management and deeper CRM notes syncing with accounting software (if ever required). We want to keep it simple for now.

## Known Issues
None currently identified.

## Open Decisions
None.

## Completed Milestones
- [x] Initial scaffolding
- [x] Database migrations (0001, 0005, 0006, 0007)
- [x] D1 wiring and UI fixes

## Next Milestone
- [ ] Unknown at this time.

## Testing
- Ensure the "Add first property" checkbox correctly evaluates when rendering the New Client modal.
