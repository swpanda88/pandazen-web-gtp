# CleanOps Stage 5A Backend Audit

## 1. D1 Schema & Migrations

The current schema (`migrations/0001_cleanops_v1_schema.sql`) provides a robust foundation but relies heavily on string/JSON storage for complex mappings:
* **Customers**: Simple profile with `source_type`. Distinguishes individuals vs companies.
* **Properties**: Separate from addresses, strictly linked to `customers`. Does not contain a "pending" status for quotes.
* **Requests / Enquiries**: Linked to `customers` and `properties`. Contains `status` lifecycle (e.g. `quote_needed`).
* **Quotes**: Uses `document_status`, stores snapshot of VAT status and customer/address details natively as JSON strings (`customer_snapshot_json`, etc.). Contains lines in `quote_lines`. Amounts stored strictly in pence (`net_total_pence`, `vat_total_pence`, `gross_total_pence`).
* **Jobs**: Basic join table linking quotes, customers, and properties with a `status` field. Missing amount values.
* **Visits**: Links to `jobs`. Has `scheduled_start`, `scheduled_end`, `status`, and `assigned_team` (stored as text instead of a relation).
* **Billable Events**: Links `visit_id`, `job_id`, `invoice_id`. Holds `amount_pence` and `status`. 
* **Invoices & Payments**: Invoices mirror quote schema for snapshot fields. Payments linked via `invoice_id` with `amount_pence` and `status`.

## 2. Seed Data

The current seed data (`migrations/0002_cleanops_v1_seed_dev.sql`) sets up a complete test workflow but has some key gaps:
* **Missing Payments**: The seed flow stops at creating an `invoiced` Billable Event and a `sent` Invoice (`inv-1`). It lacks a Payment Record, meaning the `/api/cleanops/payments` endpoint returns an empty array.
* **Visit State Inconsistency**: `visit-1` has `status: 'completed'` but both `scheduled_start` and `scheduled_end` are left `NULL`. This caused the frontend UI bug where the completed visit fell into the "Unscheduled work" queue.
* **Status Mismatches**: The primary test flow creates a `job` with `active` status, a `visit` with `completed` status, a `billable_event` with `invoiced` status, and an `invoice` with `sent` status.

## 3. Repository Layer (`functions/db/*.js`)

The DB access layer generally uses `list*` and `get*` functions, but join logic is inconsistent:
* **Joined Properties**: `jobs` and `visits` properly execute `LEFT JOIN` on both `customers` and `properties` to retrieve `first_name`, `address_line1`, etc.
* **Missing Joins**: `quotes` and `invoices` join `customers` but **miss** the `properties` join. `billable-events` does absolutely no joins for its primary list (`SELECT * FROM billable_events`). `payments` also performs no joins.
* **Amount Normalisation**: Repositories use `fromPence()` helper to expose decimal `grossTotal` / `displayAmount` alongside `*Pence` fields, but frontend JS overrides this logic in many places.

## 4. API Endpoints (`functions/api/cleanops/*.js`)

Current API handlers are strictly pass-through functions to the repository layer:
* **Shape**: Returns standard `{ ok: true, data: [...] }`.
* **Missing Context**: Because endpoints like `/api/cleanops/billable-events` pass through un-joined data, the frontend is forced to look up or "invent" missing client and address labels (e.g., `-` for Client).
* **Write Readiness**: Every API endpoint starts with `if (context.request.method !== "GET") return error(...)`. They currently block all POST/PUT requests, meaning they are completely unsuitable for write workflows without updates.

## 5. Frontend API Adapter (`cleanops/api.js`)

* **Role**: Only acts as a wrapper around native `fetch()`, returning raw `json.data`.
* **Issue**: Contains zero normalization. Instead, the downstream UI modules (`invoices.js`, `jobs.js`, etc.) perform extensive and duplicated mapping (e.g. `inv.invoice_ref = inv.invoiceNumber`, parsing `amountPence / 100`). This mapping should eventually shift closer to the API boundary.

## 6. Workflow Readiness

| Workflow | Assessment | Requirements |
| :--- | :--- | :--- |
| **A. Create Request** | **Needs minor backend work** | Repository `createRequest` exists, but API endpoint needs `POST` support. |
| **B. Request → Quote** | **Needs minor backend work** | Repository `createQuote` exists. Needs API endpoint mapping. |
| **C. Accept Quote → Job** | **Needs minor backend work** | Repositories have `updateQuoteStatus` and `createJob`. API needs wiring. |
| **D. Generate Visits** | **Needs minor backend work** | `createVisit` is ready. API requires wiring. |
| **E. Visit → Billable Event** | **Needs minor backend work** | `createBillableEvent` and `updateVisitStatus` ready. API requires wiring. |
| **F. Billable Event → Invoice**| **Needs minor backend work** | `createInvoice` is ready. |
| **G. Payment / Mark paid** | **Needs minor backend work** | `createPaymentRecord` exists. API endpoint needs `POST`. |

**Overall Conclusion**: The repository layer is highly capable and ready for writes. The API layer (`functions/api/cleanops`) is the primary bottleneck as it rejects all non-GET requests.

## 7. Recommended Next Stages

1. **Stage 5B: Read Endpoint Enhancements**
   Update missing `LEFT JOIN` properties in the repository layer for Quotes, Invoices, Billable Events, and Payments to prevent frontend fallback states (`-`).
2. **Stage 5C: Seed Data Cleanup**
   Fix `visit-1` null dates and inject seed `payment_records` so API endpoints return complete datasets.
3. **Stage 6A: POST /api/cleanops/requests**
   Open the API layer to write operations, starting with Enquiries/Requests.
4. **Stage 6B: Frontend Write Wiring**
   Connect the "New Request" UI flow to the newly unblocked `POST` endpoint.
5. **Stage 7A+: Sequential Workflows**
   Unlock Request → Quote → Job → Visit sequentially.
