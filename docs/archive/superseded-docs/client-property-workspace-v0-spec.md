# Client & Property Workspace v0 Spec

This document defines the human-facing UX and product logic for managing work across a Client and their related Properties.

## 1. Client Workspace Principle

PandaZen enforces a strict operational hierarchy: **Client -> Property -> Work**.

*   **Client Header**: Displays the top-level relationship, main contact details (phone/email), and billing context.
*   **Property Selector**: Displays all Properties (work locations) associated with the Client.
*   **Active Context**: Selecting a Property switches the workspace context. All operational work (Assessments, Quotes, Jobs, Visits, Notes, and Tasks) displayed below the selector must be filtered to show *only* items belonging to the selected Property.
*   **Client Roll-up**: The Client-level view may still provide summary roll-ups across all properties (e.g., total unpaid invoices), but individual operational management must happen within a Property context.

This model prevents operational ambiguity. Users are never forced to mentally decipher which quote, job, or assessment belongs to which address when a client has multiple properties (e.g., a main home and a rental flat).

## 2. Property Selector / List v0

The Client workspace will feature a Property selector/list. Each Property card/row must display:

*   **Address / Display Label**: The computed display label (e.g., "22 Front Street, Esh Winning").
*   **Property Status**: Indicates if the property is active or inactive.
*   **Service Type / Latest Scope**: A summary of the main service provided here (e.g., "Regular clean" or "Deep clean").
*   **Commercial / Delivery State**: Current status of the work pipeline (e.g., "Quote accepted" or "Quote pending").
*   **Next Visit / Schedule Status**: High-level schedule context (e.g., "No visit scheduled" or "Next: Tomorrow 10am").
*   **Warning / Needs-Action Indicators**: Actionable badges (e.g., "Needs follow-up", "Unpaid invoices").

**Example Layout:**
> **Brian Stone**
>
> Properties:
> 1. **22 Front Street, Esh Winning**
>    Regular clean · Quote accepted · No visit scheduled
>
> 2. **5 Other Road, Durham**
>    Deep clean · Quote pending · Needs follow-up

## 3. Selected Property Workspace

Once a Property is selected from the list, the workspace tabs below populate strictly with data scoped to that `property_id`.

**Recommended Property-Scoped Tabs:**
1.  **Property Overview**: Address details, access, parking, pets, products, surfaces, and a high-level timeline of recent activity.
2.  **Assessments**: Scoped work assessments linked to this property.
3.  **Quotes**: Commercial offers specifically for work at this property.
4.  **Jobs & Visits**: Work orders and scheduled visits executing at this address.
5.  **Billing**: Billable events generated at this property and related invoices.
6.  **Notes & Tasks**: Property-specific operational notes and follow-up tasks.

## 4. Client-level vs. Property-level Data Boundary

Data boundaries must be strictly respected to avoid data pollution and duplication.

### Client-Level Data (The "Who" and "Payer")
*   Customer Name
*   Phone / Email
*   Contact Preferences
*   Billing Address Override (for invoicing)
*   Overall Relationship Status
*   All-Property Summaries (e.g., total account balance)
*   *Note: Invoices fundamentally belong to the Client, but optionally carry a `property_id` for context.*

### Property-Level Data (The "Where" and "Work")
*   Service Address (address, area, postcode)
*   Property Label (display only, computed if null)
*   Home Details (bedrooms, bathrooms, property condition)
*   Access & Logistics (parking, access methods, pets, products, surfaces)
*   Assessments (`property_id`)
*   Quotes (inherited `property_id`)
*   Jobs & Visits (`property_id`)
*   Billable Events (`property_id`)
*   Property-specific Notes & Tasks

*Important Billing Note*: Commercial/manual invoices may not have a property at all. Property-specific work invoices should surface under the selected Property's Billing tab, while a comprehensive list of all invoices should be available at the Client level.

## 5. New Assessment from Existing Client Flow

When initiating a new Assessment for an existing Client, the user must explicitly choose the property context to prevent duplicate addresses or mixed data.

**Choice 1: Use Existing Property (Default if properties exist)**
*   User selects one of the Client's existing properties.
*   The Assessment links directly to the selected `property_id`.
*   Property context fields (address, logistics) prefill from the selected Property.
*   *Result:* Creates a new scoped work record under the existing address/project (e.g., adding an oven clean to a home that already receives regular cleans).

**Choice 2: Create New Property**
*   User opts to add a new address.
*   A new Property record is created under the Client.
*   The Assessment links to the *new* `property_id`.
*   Property context fields are captured via the new assessment wizard.
*   *Result:* Expands the Client's portfolio (e.g., Client wants a deep clean at a newly acquired rental flat).

*Hard Rule:* The UI must not create a duplicate Property row when the user clearly intends to use an existing Property.

## 6. Quote / Job / Visit / Invoice Scoping

Operational objects inherit their spatial context (property) from the preceding object in the workflow.

*   **Quote**: Inherits `property_id` from the Assessment.
*   **Job**: Accepted Quote creates a Job shell carrying the same `property_id`.
*   **Visit**: Generated or scheduled from the Job, carrying the `property_id`.
*   **Billable Event**: Created upon Visit completion, logging the work against the `property_id`.
*   **Invoice Builder**: Can filter unbilled Billable Events by Client, and optionally group/filter by Property.
*   **Billing Visibility**: 
    *   Client-level Billing tab shows all invoices for the Client.
    *   Property-level Billing tab shows only billable events and invoices explicitly linked to that `property_id`.

## 7. Empty States

Clear, actionable empty states are required for a smooth user experience.

*   **No Property Selected**: "Select a property from the list above to view its assessments, jobs, and billing history."
*   **Client Has No Properties Yet**: "This client has no properties. Add a property or start a new Assessment to create one."
*   **Selected Property Has No Assessments**: "No scoped work assessments exist for this property. [Create Assessment]"
*   **Selected Property Has No Jobs/Visits**: "No active jobs or scheduled visits for this property."
*   **Selected Property Has No Billing Records**: "No billable events or invoices generated for work at this property yet."

## 8. v0 Implementation Guardrails

*   **No Unnecessary Multi-Property UI**: Do not build extensive standalone multi-property management interfaces yet, unless strictly required to unblock the "New Assessment from existing Client" flow.
*   **Scope Strictness**: Do not begin implementation of Scheduler, Job Builder, or Invoice Builder within this specification's PR.
*   **No Schema Changes**: This is a UX/Product specification. It relies entirely on the foundation established in PR #80.
*   **Context Visibility**: Address/property context should remain visible on every quote, job, visit, and invoice row where ambiguity is possible, reinforcing the property-centric operational model.
*   **Identity**: Never use the `property.label` as a workflow identity or strict dependency; it is a human vanity field. Identifiers should rely on structured data.
