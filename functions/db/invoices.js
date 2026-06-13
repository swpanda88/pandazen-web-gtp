// functions/db/invoices.js

import { 
  calculateLineTotals, 
  calculateDocumentTotals, 
  parseSnapshot, 
  serializeSnapshot, 
  fromPence 
} from './utils.js';

function mapInvoiceRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    customerId: row.customer_id,
    propertyId: row.property_id,
    sourceType: row.source_type,
    incomeCategory: row.income_category,
    invoiceStatus: row.invoice_status,
    paymentState: row.payment_state,
    businessVatStatusSnapshot: row.business_vat_status_snapshot,
    customerSnapshot: parseSnapshot(row.customer_snapshot_json),
    billingAddressSnapshot: parseSnapshot(row.billing_address_snapshot_json),
    serviceAddressSnapshot: parseSnapshot(row.service_address_snapshot_json),
    dueDate: row.due_date,
    netTotalPence: row.net_total_pence,
    vatTotalPence: row.vat_total_pence,
    grossTotalPence: row.gross_total_pence,
    grossTotal: fromPence(row.gross_total_pence),
    createdAt: row.created_at,
    updatedAt: row.updated_at,

    firstName: row.first_name,
    lastName: row.last_name,
    companyName: row.company_name
  };
}

function mapInvoiceLineRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    invoiceId: row.invoice_id,
    billableEventId: row.billable_event_id,
    catalogueItemId: row.catalogue_item_id,
    name: row.name,
    description: row.description,
    quantity: row.quantity,
    unitPricePence: row.unit_price_pence,
    netAmountPence: row.net_amount_pence,
    vatCode: row.vat_code,
    vatAmountPence: row.vat_amount_pence,
    grossAmountPence: row.gross_amount_pence,
    sortOrder: row.sort_order
  };
}

export async function listInvoices(db, options = {}) {
  let query = "SELECT i.*, c.first_name, c.last_name, c.company_name FROM invoices i LEFT JOIN customers c ON c.id = i.customer_id WHERE 1=1";
  const params = [];

  if (options.invoiceStatus) {
    query += " AND i.invoice_status = ?";
    params.push(options.invoiceStatus);
  }
  if (options.paymentState) {
    query += " AND i.payment_state = ?";
    params.push(options.paymentState);
  }
  if (options.customerId) {
    query += " AND i.customer_id = ?";
    params.push(options.customerId);
  }
  if (options.propertyId) {
    query += " AND i.property_id = ?";
    params.push(options.propertyId);
  }
  if (options.incomeCategory) {
    query += " AND i.income_category = ?";
    params.push(options.incomeCategory);
  }
  if (options.search) {
    query += " AND (i.invoice_number LIKE ? OR c.company_name LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ?)";
    const term = "%" + options.search + "%";
    params.push(term, term, term, term);
  }

  query += " ORDER BY i.created_at DESC, i.id DESC";

  if (options.limit) {
    query += " LIMIT ?";
    params.push(options.limit);
    if (options.offset) {
      query += " OFFSET ?";
      params.push(options.offset);
    }
  }

  const { results } = await db.prepare(query).bind(...params).all();
  return results.map(mapInvoiceRow);
}

export async function listInvoiceLines(db, invoiceId) {
  const query = "SELECT * FROM invoice_lines WHERE invoice_id = ? ORDER BY sort_order ASC, id ASC";
  const { results } = await db.prepare(query).bind(invoiceId).all();
  return results.map(mapInvoiceLineRow);
}

export async function getInvoiceById(db, invoiceId) {
  const query = "SELECT i.*, c.first_name, c.last_name, c.company_name FROM invoices i LEFT JOIN customers c ON c.id = i.customer_id WHERE i.id = ?";
  const row = await db.prepare(query).bind(invoiceId).first();
  if (!row) return null;
  
  const invoice = mapInvoiceRow(row);
  invoice.lines = await listInvoiceLines(db, invoiceId);
  return invoice;
}

export async function getInvoiceByNumber(db, invoiceNumber) {
  const query = "SELECT i.*, c.first_name, c.last_name, c.company_name FROM invoices i LEFT JOIN customers c ON c.id = i.customer_id WHERE i.invoice_number = ?";
  const row = await db.prepare(query).bind(invoiceNumber).first();
  if (!row) return null;
  
  const invoice = mapInvoiceRow(row);
  invoice.lines = await listInvoiceLines(db, invoice.id);
  return invoice;
}

export async function createInvoice(db, input) {
  if (!input.id || !input.invoiceNumber) {
    throw new Error("createInvoice requires id and invoiceNumber to be provided by the caller.");
  }

  const businessVatStatus = input.businessVatStatusSnapshot || "not_registered";
  
  const preparedLines = (input.lines || []).map((line, index) => {
    const totals = calculateLineTotals({
      quantity: line.quantity,
      unitPricePence: line.unitPricePence,
      vatCode: line.vatCode,
      businessVatStatus: businessVatStatus
    });

    return {
      id: line.id,
      invoice_id: input.id,
      billable_event_id: line.billableEventId || null,
      catalogue_item_id: line.catalogueItemId || null,
      name: line.name,
      description: line.description || null,
      quantity: line.quantity,
      unit_price_pence: line.unitPricePence,
      net_amount_pence: totals.netAmountPence,
      vat_code: totals.vatCode,
      vat_amount_pence: totals.vatAmountPence,
      gross_amount_pence: totals.grossAmountPence,
      sort_order: line.sortOrder !== undefined ? line.sortOrder : index
    };
  });

  const docTotals = calculateDocumentTotals(preparedLines);

  const invoiceStmt = db.prepare(
    "INSERT INTO invoices (id, invoice_number, customer_id, property_id, source_type, income_category, invoice_status, payment_state, business_vat_status_snapshot, customer_snapshot_json, billing_address_snapshot_json, service_address_snapshot_json, due_date, net_total_pence, vat_total_pence, gross_total_pence) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(
    input.id,
    input.invoiceNumber,
    input.customerId,
    input.propertyId || null,
    input.sourceType || null,
    input.incomeCategory || null,
    input.invoiceStatus || "draft",
    input.paymentState || "unpaid",
    businessVatStatus,
    serializeSnapshot(input.customerSnapshot),
    serializeSnapshot(input.billingAddressSnapshot),
    serializeSnapshot(input.serviceAddressSnapshot),
    input.dueDate || null,
    docTotals.netTotalPence,
    docTotals.vatTotalPence,
    docTotals.grossTotalPence
  );

  const lineStmts = preparedLines.map(line => {
    return db.prepare(
      "INSERT INTO invoice_lines (id, invoice_id, billable_event_id, catalogue_item_id, name, description, quantity, unit_price_pence, net_amount_pence, vat_code, vat_amount_pence, gross_amount_pence, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      line.id, line.invoice_id, line.billable_event_id, line.catalogue_item_id, line.name, line.description,
      line.quantity, line.unit_price_pence, line.net_amount_pence, line.vat_code,
      line.vat_amount_pence, line.gross_amount_pence, line.sort_order
    );
  });

  await db.batch([invoiceStmt, ...lineStmts]);

  return getInvoiceById(db, input.id);
}

export async function updateInvoiceStatus(db, invoiceId, status, options = {}) {
  const query = "UPDATE invoices SET invoice_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *";
  const row = await db.prepare(query).bind(status, invoiceId).first();
  return mapInvoiceRow(row);
}

export async function recalculateInvoiceTotals(db, invoiceId) {
  const lines = await listInvoiceLines(db, invoiceId);
  const docTotals = calculateDocumentTotals(lines.map(line => ({
    netAmountPence: line.netAmountPence,
    vatAmountPence: line.vatAmountPence,
    grossAmountPence: line.grossAmountPence
  })));

  const query = "UPDATE invoices SET net_total_pence = ?, vat_total_pence = ?, gross_total_pence = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *";
  const row = await db.prepare(query).bind(
    docTotals.netTotalPence,
    docTotals.vatTotalPence,
    docTotals.grossTotalPence,
    invoiceId
  ).first();
  
  return mapInvoiceRow(row);
}

export async function listInvoicesForCustomer(db, customerId) {
  return listInvoices(db, { customerId });
}

export async function listOverdueInvoices(db, options = {}) {
  let query = "SELECT i.*, c.first_name, c.last_name, c.company_name FROM invoices i LEFT JOIN customers c ON c.id = i.customer_id WHERE i.invoice_status != 'draft' AND i.invoice_status != 'void' AND i.payment_state != 'paid' AND i.due_date < date('now') ORDER BY i.due_date ASC";
  const { results } = await db.prepare(query).all();
  return results.map(mapInvoiceRow);
}
