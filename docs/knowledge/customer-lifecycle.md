# Customer Lifecycle

This document describes the progression of a customer relationship over time.

## 1. Acquisition
- A customer submits an enquiry via the public website, generating a **Lead Request**.
- The system automatically creates a `Client` (status: `lead`) and a `Property`.
- Staff review the Request and contact the Client.

## 2. Quoting & Assessment
- If an in-person assessment is needed, a Visit is scheduled for quoting.
- A **Quote** is built using the Client's property details (bedrooms, bathrooms).
- Client status shifts to `prospect`.

## 3. Active Service
- The Quote is accepted, becoming a **Job**.
- The Client becomes an `active_client`.
- Recurring Visits are generated based on the Job's cadence.

## 4. Retention & Offboarding
- Invoices are sent regularly.
- If the customer cancels, the Job is marked `cancelled` and the Client becomes `inactive`.
