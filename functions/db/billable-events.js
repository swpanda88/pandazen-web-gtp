// functions/db/billable-events.js

import { fromPence } from './utils.js';

function mapBillableEventRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    visitId: row.visit_id,
    jobId: row.job_id,
    invoiceId: row.invoice_id,
    status: row.status,
    amountPence: row.amount_pence,
    displayAmount: fromPence(row.amount_pence),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    scheduledStart: row.scheduled_start,
    scheduledEnd: row.scheduled_end,
    invoiceDisplayRef: row.invoice_number,
    customerName: row.company_name || [row.first_name, row.last_name].filter(Boolean).join(" ") || null
  };
}

export async function listBillableEvents(db, options = {}) {
  let query = "SELECT b.*, v.scheduled_start, v.scheduled_end, j.customer_id, i.invoice_number, c.first_name, c.last_name, c.company_name FROM billable_events b LEFT JOIN visits v ON v.id = b.visit_id LEFT JOIN jobs j ON j.id = b.job_id LEFT JOIN invoices i ON i.id = b.invoice_id LEFT JOIN customers c ON c.id = j.customer_id WHERE 1=1";
  const params = [];

  if (options.status) {
    query += " AND b.status = ?";
    params.push(options.status);
  }
  if (options.visitId) {
    query += " AND b.visit_id = ?";
    params.push(options.visitId);
  }
  if (options.jobId) {
    query += " AND b.job_id = ?";
    params.push(options.jobId);
  }
  if (options.invoiceId) {
    query += " AND b.invoice_id = ?";
    params.push(options.invoiceId);
  }

  query += " ORDER BY b.created_at DESC, b.id DESC";

  if (options.limit) {
    query += " LIMIT ?";
    params.push(options.limit);
    if (options.offset) {
      query += " OFFSET ?";
      params.push(options.offset);
    }
  }

  const { results } = await db.prepare(query).bind(...params).all();
  return results.map(mapBillableEventRow);
}

export async function getBillableEventById(db, billableEventId) {
  const query = "SELECT b.*, v.scheduled_start, v.scheduled_end, j.customer_id, i.invoice_number, c.first_name, c.last_name, c.company_name FROM billable_events b LEFT JOIN visits v ON v.id = b.visit_id LEFT JOIN jobs j ON j.id = b.job_id LEFT JOIN invoices i ON i.id = b.invoice_id LEFT JOIN customers c ON c.id = j.customer_id WHERE b.id = ?";
  const row = await db.prepare(query).bind(billableEventId).first();
  return mapBillableEventRow(row);
}

export async function listUninvoicedBillableEvents(db, options = {}) {
  let query = "SELECT b.*, v.scheduled_start, v.scheduled_end, j.customer_id, i.invoice_number, c.first_name, c.last_name, c.company_name FROM billable_events b LEFT JOIN visits v ON v.id = b.visit_id LEFT JOIN jobs j ON j.id = b.job_id LEFT JOIN invoices i ON i.id = b.invoice_id LEFT JOIN customers c ON c.id = j.customer_id WHERE b.invoice_id IS NULL";
  const params = [];

  if (options.jobId) {
    query += " AND b.job_id = ?";
    params.push(options.jobId);
  }
  
  query += " ORDER BY b.created_at ASC, b.id ASC";
  const { results } = await db.prepare(query).bind(...params).all();
  return results.map(mapBillableEventRow);
}

export async function createBillableEvent(db, input) {
  if (!input.id || input.amountPence === undefined) {
    throw new Error("createBillableEvent requires id and amountPence.");
  }

  const query = "INSERT INTO billable_events (id, visit_id, job_id, invoice_id, status, amount_pence) VALUES (?, ?, ?, ?, ?, ?) RETURNING *";
  const row = await db.prepare(query).bind(
    input.id,
    input.visitId || null,
    input.jobId || null,
    input.invoiceId || null,
    input.status || "uninvoiced",
    input.amountPence
  ).first();

  return mapBillableEventRow(row);
}

export async function markBillableEventInvoiced(db, billableEventId, invoiceId) {
  const query = "UPDATE billable_events SET invoice_id = ?, status = 'invoiced', updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *";
  const row = await db.prepare(query).bind(invoiceId, billableEventId).first();
  return mapBillableEventRow(row);
}

export async function listBillableEventsForJob(db, jobId) {
  return listBillableEvents(db, { jobId });
}

export async function listBillableEventsForVisit(db, visitId) {
  return listBillableEvents(db, { visitId });
}

export async function listBillableEventsForCustomer(db, customerId) {
  const query = "SELECT b.* FROM billable_events b JOIN jobs j ON j.id = b.job_id WHERE j.customer_id = ? ORDER BY b.created_at DESC";
  const { results } = await db.prepare(query).bind(customerId).all();
  return results.map(mapBillableEventRow);
}
