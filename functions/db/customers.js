// functions/db/customers.js
import { boolFromDb } from './utils.js';

function mapCustomerRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    type: row.type,
    sourceType: row.source_type,
    firstName: row.first_name,
    lastName: row.last_name,
    companyName: row.company_name,
    email: row.email,
    phone: row.phone,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function listCustomers(db, options = {}) {
  let query = `SELECT * FROM customers WHERE 1=1`;
  const params = [];

  if (options.type) {
    query += ` AND type = ?`;
    params.push(options.type);
  }
  if (options.sourceType) {
    query += ` AND source_type = ?`;
    params.push(options.sourceType);
  }
  if (options.search) {
    query += ` AND (company_name LIKE ? OR first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)`;
    const term = `%${options.search}%`;
    params.push(term, term, term, term);
  }

  query += ` ORDER BY COALESCE(company_name, first_name, last_name)`;

  const { results } = await db.prepare(query).bind(...params).all();
  return results.map(mapCustomerRow);
}

export async function getCustomerById(db, customerId) {
  const row = await db.prepare(`SELECT * FROM customers WHERE id = ?`).bind(customerId).first();
  return mapCustomerRow(row);
}

function mapAddressRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    customerId: row.customer_id,
    addressType: row.address_type,
    label: row.label,
    addressLine1: row.address_line1,
    addressLine2: row.address_line2,
    city: row.city,
    postcode: row.postcode,
    country: row.country,
    isDefaultBilling: boolFromDb(row.is_default_billing),
    isDefaultService: boolFromDb(row.is_default_service),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function listCustomerAddresses(db, customerId) {
  const { results } = await db.prepare(`SELECT * FROM customer_addresses WHERE customer_id = ? ORDER BY created_at DESC`).bind(customerId).all();
  return results.map(mapAddressRow);
}

function mapPropertyRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    customerId: row.customer_id,
    addressLine1: row.address_line1,
    addressLine2: row.address_line2,
    city: row.city,
    postcode: row.postcode,
    country: row.country,
    accessNotes: row.access_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function listPropertiesForCustomer(db, customerId) {
  const { results } = await db.prepare(`SELECT * FROM properties WHERE customer_id = ? ORDER BY created_at DESC`).bind(customerId).all();
  return results.map(mapPropertyRow);
}

export async function getPropertyById(db, propertyId) {
  const row = await db.prepare(`SELECT * FROM properties WHERE id = ?`).bind(propertyId).first();
  return mapPropertyRow(row);
}

export async function getCustomerByEmail(db, email) {
  if (!email) return null;
  const row = await db.prepare("SELECT * FROM customers WHERE email = ? COLLATE NOCASE").bind(email).first();
  return mapCustomerRow(row);
}

export async function createCustomer(db, input) {
  const query = `
    INSERT INTO customers (id, type, source_type, first_name, last_name, company_name, email, phone)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING *
  `;
  const row = await db.prepare(query).bind(
    input.id,
    input.type || 'individual',
    input.sourceType || 'request',
    input.firstName || null,
    input.lastName || null,
    input.companyName || null,
    input.email || null,
    input.phone || null
  ).first();
  return mapCustomerRow(row);
}

export async function createProperty(db, input) {
  const query = `
    INSERT INTO properties (id, customer_id, address_line1, address_line2, city, postcode, country, access_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING *
  `;
  const row = await db.prepare(query).bind(
    input.id,
    input.customerId,
    input.addressLine1 || null,
    input.addressLine2 || null,
    input.city || null,
    input.postcode || null,
    input.country || null,
    input.accessNotes || null
  ).first();
  return mapPropertyRow(row);
}
