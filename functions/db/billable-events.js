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
    updatedAt: row.updated_at
  };
}

export async function listBillableEvents(db, options = {}) {
  let query = "SELECT * FROM billable_events WHERE 1=1";
  const params = [];

  if (options.status) {
    query += " AND status = ?";
    params.push(options.status);
  }
  if (options.visitId) {
    query += " AND visit_id = ?";
    params.push(options.visitId);
  }
  if (options.jobId) {
    query += " AND job_id = ?";
    params.push(options.jobId);
  }
  if (options.invoiceId) {
    query += " AND invoice_id = ?";
    params.push(options.invoiceId);
  }

  query += " ORDER BY created_at DESC, id DESC";

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
  const query = "SELECT * FROM billable_events WHERE id = ?";
  const row = await db.prepare(query).bind(billableEventId).first();
  return mapBillableEventRow(row);
}

export async function listUninvoicedBillableEvents(db, options = {}) {
  let query = "SELECT * FROM billable_events WHERE invoice_id IS NULL";
  const params = [];

  if (options.jobId) {
    query += " AND job_id = ?";
    params.push(options.jobId);
  }
  
  query += " ORDER BY created_at ASC, id ASC";
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
