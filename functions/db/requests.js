// functions/db/requests.js

function mapRequestRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    customerId: row.customer_id,
    propertyId: row.property_id,
    sourceType: row.source_type,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    
    // Joined customer fields (if requested/available in the row)
    customerType: row.customer_type,
    firstName: row.first_name,
    lastName: row.last_name,
    companyName: row.company_name,
    customerName: row.company_name || [row.first_name, row.last_name].filter(Boolean).join(" ") || null,
    propertyLabel: row.address_line1 || null,
    propertyAddressLine1: row.address_line1,
    propertyCity: row.city,
    propertyPostcode: row.postcode,
    email: row.email,
    phone: row.phone
  };
}

export async function listRequests(db, options = {}) {
  let query = `
    SELECT r.*, 
           c.type AS customer_type, c.first_name, c.last_name, c.company_name, c.email, c.phone, p.address_line1, p.city, p.postcode
    FROM requests r
    LEFT JOIN customers c ON c.id = r.customer_id
    LEFT JOIN properties p ON p.id = r.property_id
    WHERE 1=1
  `;
  const params = [];

  if (options.status) {
    query += ` AND r.status = ?`;
    params.push(options.status);
  }
  if (options.sourceType) {
    query += ` AND r.source_type = ?`;
    params.push(options.sourceType);
  }
  if (options.customerId) {
    query += ` AND r.customer_id = ?`;
    params.push(options.customerId);
  }
  if (options.propertyId) {
    query += ` AND r.property_id = ?`;
    params.push(options.propertyId);
  }
  if (options.search) {
    query += ` AND (
      r.notes LIKE ? OR 
      c.first_name LIKE ? OR 
      c.last_name LIKE ? OR 
      c.company_name LIKE ? OR 
      c.email LIKE ? OR 
      c.phone LIKE ?
    )`;
    const term = `%${options.search}%`;
    params.push(term, term, term, term, term, term);
  }

  query += ` ORDER BY r.created_at DESC, r.id DESC`;

  if (options.limit) {
    query += ` LIMIT ?`;
    params.push(options.limit);
    if (options.offset) {
      query += ` OFFSET ?`;
      params.push(options.offset);
    }
  }

  const { results } = await db.prepare(query).bind(...params).all();
  return results.map(mapRequestRow);
}

export async function getRequestById(db, requestId) {
  const query = `
    SELECT r.*, 
           c.type AS customer_type, c.first_name, c.last_name, c.company_name, c.email, c.phone, p.address_line1, p.city, p.postcode
    FROM requests r
    LEFT JOIN customers c ON c.id = r.customer_id
    LEFT JOIN properties p ON p.id = r.property_id
    WHERE r.id = ?
  `;
  const row = await db.prepare(query).bind(requestId).first();
  return mapRequestRow(row);
}

export async function createRequest(db, input) {
  // Using SQLite RETURNING clause to get the inserted row directly
  const query = `
    INSERT INTO requests (id, customer_id, property_id, source_type, status, notes)
    VALUES (?, ?, ?, ?, ?, ?)
    RETURNING *
  `;
  const row = await db.prepare(query).bind(
    input.id, // Caller must generate/provide the ID
    input.customerId || null,
    input.propertyId || null,
    input.sourceType || 'request',
    input.status || 'new',
    input.notes || null
  ).first();

  return mapRequestRow(row);
}

export async function updateRequestStatus(db, requestId, status, options = {}) {
  // Using SQLite RETURNING clause to get the updated row directly
  const query = `
    UPDATE requests 
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
    RETURNING *
  `;
  const row = await db.prepare(query).bind(status, requestId).first();
  return mapRequestRow(row);
}

export async function updateRequest(db, requestId, updates) {
  const sets = [];
  const params = [];

  if (updates.status !== undefined) { sets.push('status = ?'); params.push(updates.status); }
  if (updates.notes !== undefined) { sets.push('notes = ?'); params.push(updates.notes); }
  if (updates.sourceType !== undefined) { sets.push('source_type = ?'); params.push(updates.sourceType); }
  if (updates.propertyId !== undefined) { sets.push('property_id = ?'); params.push(updates.propertyId); }

  if (sets.length === 0) return await getRequestById(db, requestId);

  sets.push('updated_at = CURRENT_TIMESTAMP');
  params.push(requestId);

  const query = `
    UPDATE requests
    SET ${sets.join(', ')}
    WHERE id = ?
    RETURNING *
  `;
  const row = await db.prepare(query).bind(...params).first();
  return mapRequestRow(row);
}
