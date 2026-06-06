# CleanOps Invoices Workflow

Status: Invoices v0 planning and frontend/mock implementation  
Scope: Money control centre, invoice drafting, document preview, and manual status tracking. No backend, real email, stored PDFs, Stripe/payment links, or full accounting export in v0.

This document defines how CleanOps Invoices should work at v0 so the module stays aligned with Jobs, billable events, and the approved CleanOps UI patterns.

## 1. Role of Invoices

Invoices is the money control centre.

Jobs creates billable events from completed/reviewed work. Invoices consumes billable events, creates invoice drafts/documents, and tracks manual invoice status.

```text
Job Plan
  -> Scheduled Clean
    -> Job Report
      -> Billable Event
        -> Invoice Draft
          -> Invoice Document
            -> Sent / Paid / Overdue / Void
```

Invoices must not issue work instructions, manage cleaners, or decide whether a visit happened. That belongs to Jobs and Reports. Invoices decides what ready chargeable items become commercial invoice documents.

## 2. Billing Ownership

Billing setup mainly belongs under:

```text
Client
  -> Service Address / Property
    -> Job override only when needed
```

Client/property billing setup should include:

- billing name or company
- billing address
- invoice email/contact
- default payment terms
- delivery method
- PO/reference requirement
- billing frequency
- invoice timing
- grouping rule
- extras handling
- cancellation fee policy

Job-level billing overrides are for exceptions, not the default place for billing identity.

## 3. Invoice Creation Routes

Invoices v0 supports two creation routes.

### A. Create From Billable Events

```text
Ready billable events
  -> select events
  -> invoice setup
  -> create invoice draft
  -> invoice editor
```

Rules:

- one billable event can belong to only one active invoice
- selected billable events become invoice lines
- each selected billable event remains traceable as its own invoice line in v0
- invoice lines retain source event/report/job references
- if the invoice is voided, linked billable events return to `ready_to_bill`
- invoice creation is manual; no automatic invoice generation in v0

Selection should group events by billing setup, usually client/property/job.

### B. Manual Invoice

Manual invoice supports work or charges that do not come from a quote/job.

Use cases:

- non-cleaning one-off service
- manual charge
- sundry work
- deposit
- correction
- work without quote

Manual invoice flow:

```text
New invoice
  -> Manual invoice
  -> choose client/property or manual customer
  -> add manual lines
  -> invoice editor
```

## 4. Invoice Status Model

Use lean statuses:

- Draft
- Ready to send
- Sent
- Part-paid
- Paid
- Overdue
- Void

Serious transitions need confirmation guards:

- mark ready to send
- mark sent
- mark paid
- mark part-paid
- void invoice

Void rule:

```text
Void invoice
  -> invoice cannot be edited/sent/paid
  -> linked billable events return to ready_to_bill
```

## 5. Invoice Lines and Adjustments

Invoice lines may come from:

- billable events
- manual entry
- adjustments
- extras
- discounts
- cancellation fee
- correction
- deposit/payment adjustment

Allowed line types:

- service
- extra
- discount
- adjustment
- cancellation_fee
- manual
- correction

Cleaning invoices must allow positive adjustments, negative adjustments, discounts, goodwill reductions, cancellation fees, and corrections.

## 6. VAT Handling

CleanOps must support both:

- Not VAT registered
- VAT registered

For not VAT registered:

- invoice preview shows `VAT: Not applicable`
- do not show `VAT: £0.00`
- do not imply a 0% VAT-rated sale

For VAT registered later:

- VAT number
- default VAT rate
- line VAT rates
- VAT summary

Invoices v0 keeps VAT registered mode mock-ready only. It does not implement full VAT accounting.

## 7. Invoices Page Layout

Use the approved CleanOps patterns:

1. Money KPI strip
2. Action panel
3. Invoice register

Action panel columns:

- Ready to invoice
- Needs action
- Overdue / chase

Do not add a `sent but not due` column. Sent/unpaid invoices belong in the register and KPI strip unless they require action.

The Needs action column should include draft invoices needing review, ready-to-send invoices, part-paid follow-up, billing review items, disputed/correction items, cancellation-fee decisions, and missing-price decisions. Sent invoices should leave Needs action unless they become overdue or otherwise require attention.

The Invoice register is the stable database view and must be search/filter/sort/pagination-ready.

## 8. Invoice Editor and Preview

The Invoice editor should reuse the Quote editor/document editor pattern:

- main editor area for client/billing details, lines, totals, notes, terms
- right context panel for source billable events, linked jobs/reports, billing setup, balance, payment status
- bottom actions for save, preview, ready-to-send, sent mock, close

The invoice document preview should reuse the Quote document/PDF preview pattern:

- company details
- invoice number
- invoice date
- due date
- bill to
- service address/job reference where relevant
- line items
- subtotal
- `VAT: Not applicable` where applicable
- total
- payment instructions
- footer/terms

PDF/export/send are preview-only or mock in v0.

## 9. Payment Tracking

Invoices v0 supports mock/manual payment status:

- Mark sent
- Mark paid
- Mark part-paid
- Void invoice

Part-paid should capture:

- amount paid
- date paid
- remaining balance

No Stripe, payment links, bank reconciliation, receipts, or accounting export in v0.

## 10. Finance Settings

Invoices v0 should expose finance settings in mock UI:

- invoice prefix
- next invoice number
- company legal/trading details
- registered address
- company number if applicable
- default payment instructions/bank details
- default payment terms
- invoice footer text
- VAT status
- rounding rule

These are mock settings until backend/settings persistence exists.

## 11. Boundaries

Invoices v0 must not build:

- real email sending
- real PDF file storage
- Stripe/payment links
- bank reconciliation
- accounting export
- full credit notes
- statements of account
- full reminder automation
- full VAT returns/accounting logic

It must not block future support for those features.
