// functions/db/quotes.js

import { 
  calculateLineTotals, 
  calculateDocumentTotals, 
  parseSnapshot, 
  serializeSnapshot, 
  boolFromDb, 
  boolToDb, 
  fromPence 
} from './utils.js';

function mapQuoteRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    quoteNumber: row.quote_number,
    version: row.version,
    displayRef: row.display_ref,
    customerId: row.customer_id,
    propertyId: row.property_id,
    sourceType: row.source_type,
    incomeCategory: row.income_category,
    quoteStatus: row.quote_status,
    documentStatus: row.document_status,
    businessVatStatusSnapshot: row.business_vat_status_snapshot,
    customerSnapshot: parseSnapshot(row.customer_snapshot_json),
    billingAddressSnapshot: parseSnapshot(row.billing_address_snapshot_json),
    serviceAddressSnapshot: parseSnapshot(row.service_address_snapshot_json),
    validUntil: row.valid_until,
    netTotalPence: row.net_total_pence,
    vatTotalPence: row.vat_total_pence,
    grossTotalPence: row.gross_total_pence,
    grossTotal: fromPence(row.gross_total_pence),
    createdAt: row.created_at,
    updatedAt: row.updated_at,

    firstName: row.first_name,
    lastName: row.last_name,
    companyName: row.company_name,
    customerName: row.company_name || [row.first_name, row.last_name].filter(Boolean).join(" ") || null,
    propertyLabel: row.address_line1 || null,
    propertyAddressLine1: row.address_line1,
    propertyCity: row.city,
    propertyPostcode: row.postcode,
    quoteDisplayRef: row.display_ref
  };
}

function mapQuoteLineRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    quoteId: row.quote_id,
    catalogueItemId: row.catalogue_item_id,
    name: row.name,
    description: row.description,
    quantity: row.quantity,
    unitPricePence: row.unit_price_pence,
    netAmountPence: row.net_amount_pence,
    vatCode: row.vat_code,
    vatAmountPence: row.vat_amount_pence,
    grossAmountPence: row.gross_amount_pence,
    isOptional: boolFromDb(row.is_optional),
    sortOrder: row.sort_order
  };
}

export async function listQuotes(db, options = {}) {
  let query = "SELECT q.*, c.first_name, c.last_name, c.company_name, p.address_line1, p.city, p.postcode FROM quotes q LEFT JOIN customers c ON c.id = q.customer_id LEFT JOIN properties p ON p.id = q.property_id WHERE 1=1";
  const params = [];

  if (options.quoteStatus) {
    query += " AND q.quote_status = ?";
    params.push(options.quoteStatus);
  }
  if (options.customerId) {
    query += " AND q.customer_id = ?";
    params.push(options.customerId);
  }
  if (options.propertyId) {
    query += " AND q.property_id = ?";
    params.push(options.propertyId);
  }
  if (options.incomeCategory) {
    query += " AND q.income_category = ?";
    params.push(options.incomeCategory);
  }
  if (options.documentStatus) {
    query += " AND q.document_status = ?";
    params.push(options.documentStatus);
  }
  if (options.search) {
    query += " AND (q.quote_number LIKE ? OR q.display_ref LIKE ? OR c.company_name LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ?)";
    const term = "%" + options.search + "%";
    params.push(term, term, term, term, term);
  }

  query += " ORDER BY q.created_at DESC, q.id DESC";

  if (options.limit) {
    query += " LIMIT ?";
    params.push(options.limit);
    if (options.offset) {
      query += " OFFSET ?";
      params.push(options.offset);
    }
  }

  const { results } = await db.prepare(query).bind(...params).all();
  return results.map(mapQuoteRow);
}

export async function listQuoteLines(db, quoteId) {
  const query = "SELECT * FROM quote_lines WHERE quote_id = ? ORDER BY sort_order ASC, id ASC";
  const { results } = await db.prepare(query).bind(quoteId).all();
  return results.map(mapQuoteLineRow);
}

export async function getQuoteById(db, quoteId) {
  const query = "SELECT q.*, c.first_name, c.last_name, c.company_name, p.address_line1, p.city, p.postcode FROM quotes q LEFT JOIN customers c ON c.id = q.customer_id LEFT JOIN properties p ON p.id = q.property_id WHERE q.id = ?";
  const row = await db.prepare(query).bind(quoteId).first();
  if (!row) return null;
  
  const quote = mapQuoteRow(row);
  quote.lines = await listQuoteLines(db, quoteId);
  return quote;
}

export async function getQuoteByDisplayRef(db, displayRef) {
  const query = "SELECT q.*, c.first_name, c.last_name, c.company_name, p.address_line1, p.city, p.postcode FROM quotes q LEFT JOIN customers c ON c.id = q.customer_id LEFT JOIN properties p ON p.id = q.property_id WHERE q.display_ref = ?";
  const row = await db.prepare(query).bind(displayRef).first();
  if (!row) return null;
  
  const quote = mapQuoteRow(row);
  quote.lines = await listQuoteLines(db, quote.id);
  return quote;
}

export async function listQuoteVersions(db, quoteNumber) {
  const query = "SELECT q.*, c.first_name, c.last_name, c.company_name, p.address_line1, p.city, p.postcode FROM quotes q LEFT JOIN customers c ON c.id = q.customer_id LEFT JOIN properties p ON p.id = q.property_id WHERE q.quote_number = ? ORDER BY q.version DESC";
  const { results } = await db.prepare(query).bind(quoteNumber).all();
  return results.map(mapQuoteRow);
}

export async function createQuote(db, input) {
  if (!input.id || !input.quoteNumber || !input.displayRef) {
    throw new Error("createQuote requires id, quoteNumber, and displayRef to be provided by the caller.");
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
      quote_id: input.id,
      catalogue_item_id: line.catalogueItemId || null,
      name: line.name,
      description: line.description || null,
      quantity: line.quantity,
      unit_price_pence: line.unitPricePence,
      net_amount_pence: totals.netAmountPence,
      vat_code: totals.vatCode,
      vat_amount_pence: totals.vatAmountPence,
      gross_amount_pence: totals.grossAmountPence,
      is_optional: boolToDb(line.isOptional),
      sort_order: line.sortOrder !== undefined ? line.sortOrder : index
    };
  });

  const docTotals = calculateDocumentTotals(preparedLines);

  const quoteStmt = db.prepare(
    "INSERT INTO quotes (id, quote_number, version, display_ref, customer_id, property_id, source_type, income_category, quote_status, document_status, business_vat_status_snapshot, customer_snapshot_json, billing_address_snapshot_json, service_address_snapshot_json, valid_until, net_total_pence, vat_total_pence, gross_total_pence) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(
    input.id,
    input.quoteNumber,
    input.version || 1,
    input.displayRef,
    input.customerId,
    input.propertyId || null,
    input.sourceType || null,
    input.incomeCategory || null,
    input.quoteStatus || "draft",
    input.documentStatus || "not_generated",
    businessVatStatus,
    serializeSnapshot(input.customerSnapshot),
    serializeSnapshot(input.billingAddressSnapshot),
    serializeSnapshot(input.serviceAddressSnapshot),
    input.validUntil || null,
    docTotals.netTotalPence,
    docTotals.vatTotalPence,
    docTotals.grossTotalPence
  );

  const lineStmts = preparedLines.map(line => {
    return db.prepare(
      "INSERT INTO quote_lines (id, quote_id, catalogue_item_id, name, description, quantity, unit_price_pence, net_amount_pence, vat_code, vat_amount_pence, gross_amount_pence, is_optional, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      line.id, line.quote_id, line.catalogue_item_id, line.name, line.description,
      line.quantity, line.unit_price_pence, line.net_amount_pence, line.vat_code,
      line.vat_amount_pence, line.gross_amount_pence, line.is_optional, line.sort_order
    );
  });

  await db.batch([quoteStmt, ...lineStmts]);

  return getQuoteById(db, input.id);
}

export async function updateQuoteStatus(db, quoteId, status, options = {}) {
  const query = "UPDATE quotes SET quote_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *";
  const row = await db.prepare(query).bind(status, quoteId).first();
  return mapQuoteRow(row);
}
