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
    propertyType: row.property_type,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    petsPresent: row.pets_present,
    parking: row.parking,
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
    INSERT INTO properties (
      id, customer_id, address_line1, address_line2, city, postcode, country, access_notes,
      property_type, bedrooms, bathrooms, pets_present, parking
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    input.accessNotes || null,
    input.propertyType || null,
    input.bedrooms || null,
    input.bathrooms || null,
    input.petsPresent || null,
    input.parking || null
  ).first();
  return mapPropertyRow(row);
}

export async function updateCustomer(db, customerId, updates) {
  const sets = [];
  const params = [];

  if (updates.type !== undefined) { sets.push('type = ?'); params.push(updates.type); }
  if (updates.firstName !== undefined) { sets.push('first_name = ?'); params.push(updates.firstName); }
  if (updates.lastName !== undefined) { sets.push('last_name = ?'); params.push(updates.lastName); }
  if (updates.companyName !== undefined) { sets.push('company_name = ?'); params.push(updates.companyName); }
  if (updates.email !== undefined) { sets.push('email = ?'); params.push(updates.email); }
  if (updates.phone !== undefined) { sets.push('phone = ?'); params.push(updates.phone); }

  if (sets.length === 0) return await getCustomerById(db, customerId);

  sets.push('updated_at = CURRENT_TIMESTAMP');
  params.push(customerId);

  const query = `
    UPDATE customers
    SET ${sets.join(', ')}
    WHERE id = ?
    RETURNING *
  `;
  const row = await db.prepare(query).bind(...params).first();
  return mapCustomerRow(row);
}

export async function updateProperty(db, propertyId, updates) {
  const sets = [];
  const params = [];

  if (updates.addressLine1 !== undefined) { sets.push('address_line1 = ?'); params.push(updates.addressLine1); }
  if (updates.addressLine2 !== undefined) { sets.push('address_line2 = ?'); params.push(updates.addressLine2); }
  if (updates.city !== undefined) { sets.push('city = ?'); params.push(updates.city); }
  if (updates.postcode !== undefined) { sets.push('postcode = ?'); params.push(updates.postcode); }
  if (updates.propertyType !== undefined) { sets.push('property_type = ?'); params.push(updates.propertyType); }
  if (updates.bedrooms !== undefined) { sets.push('bedrooms = ?'); params.push(updates.bedrooms); }
  if (updates.bathrooms !== undefined) { sets.push('bathrooms = ?'); params.push(updates.bathrooms); }
  if (updates.petsPresent !== undefined) { sets.push('pets_present = ?'); params.push(updates.petsPresent); }
  if (updates.parking !== undefined) { sets.push('parking = ?'); params.push(updates.parking); }

  if (sets.length === 0) return await getPropertyById(db, propertyId);

  sets.push('updated_at = CURRENT_TIMESTAMP');
  params.push(propertyId);

  const query = `
    UPDATE properties
    SET ${sets.join(', ')}
    WHERE id = ?
    RETURNING *
  `;
  const row = await db.prepare(query).bind(...params).first();
  return mapPropertyRow(row);
}
