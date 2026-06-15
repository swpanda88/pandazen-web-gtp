// functions/db/payments.js

import { fromPence } from './utils.js';

function mapPaymentRecordRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    invoiceId: row.invoice_id,
    amountPence: row.amount_pence,
    displayAmount: fromPence(row.amount_pence),
    paymentMethod: row.payment_method,
    status: row.status,
    reference: row.reference,
    notes: row.notes,
    paidAt: row.paid_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    invoiceDisplayRef: row.invoice_number,
    customerName: row.company_name || [row.first_name, row.last_name].filter(Boolean).join(" ") || null
  };
}

export async function listPaymentRecords(db, options = {}) {
  let query = "SELECT p.*, i.invoice_number, c.first_name, c.last_name, c.company_name FROM payment_records p LEFT JOIN invoices i ON i.id = p.invoice_id LEFT JOIN customers c ON c.id = i.customer_id WHERE 1=1";
  const params = [];

  if (options.invoiceId) {
    query += " AND p.invoice_id = ?";
    params.push(options.invoiceId);
  }
  if (options.status) {
    query += " AND p.status = ?";
    params.push(options.status);
  }

  query += " ORDER BY p.paid_at DESC, p.created_at DESC";

  const { results } = await db.prepare(query).bind(...params).all();
  return results.map(mapPaymentRecordRow);
}

export async function getPaymentRecordById(db, paymentRecordId) {
  const query = "SELECT p.*, i.invoice_number, c.first_name, c.last_name, c.company_name FROM payment_records p LEFT JOIN invoices i ON i.id = p.invoice_id LEFT JOIN customers c ON c.id = i.customer_id WHERE p.id = ?";
  const row = await db.prepare(query).bind(paymentRecordId).first();
  return mapPaymentRecordRow(row);
}

export async function listPaymentsForInvoice(db, invoiceId) {
  return listPaymentRecords(db, { invoiceId });
}

export async function createPaymentRecord(db, input) {
  if (!input.id || !input.invoiceId || input.amountPence === undefined) {
    throw new Error("createPaymentRecord requires id, invoiceId, and amountPence.");
  }

  const query = "INSERT INTO payment_records (id, invoice_id, amount_pence, payment_method, status, reference, notes, paid_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *";
  const row = await db.prepare(query).bind(
    input.id,
    input.invoiceId,
    input.amountPence,
    input.paymentMethod || null,
    input.status || "recorded",
    input.reference || null,
    input.notes || null,
    input.paidAt || null
  ).first();

  return mapPaymentRecordRow(row);
}

export async function sumPaymentsForInvoice(db, invoiceId) {
  const query = "SELECT SUM(amount_pence) AS total_paid FROM payment_records WHERE invoice_id = ? AND status != 'failed' AND status != 'void'";
  const row = await db.prepare(query).bind(invoiceId).first();
  return row ? (row.total_paid || 0) : 0;
}

export async function updateInvoicePaymentState(db, invoiceId) {
  const invRow = await db.prepare("SELECT gross_total_pence FROM invoices WHERE id = ?").bind(invoiceId).first();
  if (!invRow) throw new Error("Invoice not found.");
  
  const grossTotal = invRow.gross_total_pence || 0;
  const totalPaid = await sumPaymentsForInvoice(db, invoiceId);
  
  let paymentState = "unpaid";
  if (totalPaid >= grossTotal && grossTotal > 0) {
    paymentState = "paid";
  } else if (totalPaid > 0) {
    paymentState = "part_paid";
  }

  const query = "UPDATE invoices SET payment_state = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
  await db.prepare(query).bind(paymentState, invoiceId).run();

  return { paymentState, totalPaid, grossTotal };
}
