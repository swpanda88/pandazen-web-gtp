# 03: Business Workflow

This document outlines the operational process of the PandaZen cleaning business. The software must strictly mirror this real-world flow.

## The Core Flow

The journey of a cleaning engagement flows sequentially down this path:

```
Client
  ↓
Property
  ↓
Request
  ↓
Quote
  ↓
Job
  ↓
Visit
  ↓
Invoice
```

### 1. Client
A person or company paying for services. They can be created manually by staff or automatically via a website enquiry (Lead).

### 2. Property
The physical location where the cleaning happens. A single Client can own multiple Properties. All service logic (bedrooms, access, pets) is tied to the Property, not the Client.

### 3. Request
An expression of interest or a query for a specific Property. Examples:
- "Can you clean my house next Tuesday?"
- A website form submission asking for a deep clean.
Requests are reviewed by staff and either rejected or converted into Quotes or Jobs.

### 4. Quote
A formal estimate of price and time sent to the Client. A Quote belongs to a Request. Once accepted, a Quote is converted into a Job.

### 5. Job
The agreed-upon contract for work. Jobs can be:
- **One-off**: A single deep clean.
- **Recurring**: A weekly or fortnightly cadence.
A Job defines the scope and frequency, but does not represent a specific day on the calendar.

### 6. Visit
A specific, scheduled instance of work on the calendar derived from a Job. Example: "The Friday 10 AM clean for Job #442". Staff clock in and out of Visits.

### 7. Invoice
The bill generated for a completed Visit or a batch of Visits. Invoices are sent to the Client for payment.

## Operational Rules
- We cannot create a Job without a Client and a Property.
- A recurring Job spawns infinite Visits into the future, but they are only materialized on the calendar up to a certain horizon (e.g., 30 days).
- Invoices are generated *after* work is done based on the actual time tracked on a Visit (or flat rate if agreed upon).
