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
    
    // New B2a fields
    requestType: row.request_type,
    cadence: row.cadence,
    howSoon: row.how_soon,
    preferredDay: row.preferred_day,
    preferredTimeWindow: row.preferred_time_window,
    approxSize: row.approx_size,
    photosHelpful: row.photos_helpful,
    quoteReadiness: row.quote_readiness,
    assessmentRequired: row.assessment_required,
    initialCleanRequired: row.initial_clean_required,
    pricingBasis: row.pricing_basis,
    estimatedRegularDurationMinutes: row.estimated_regular_duration_minutes,
    estimatedInitialDurationMinutes: row.estimated_initial_duration_minutes,
    estimatedTeamSize: row.estimated_team_size,
    scopeConfidence: row.scope_confidence,
    mainPriorities: row.main_priorities_json ? JSON.parse(row.main_priorities_json) : undefined,
    quoteConsiderations: row.quote_considerations_json ? JSON.parse(row.quote_considerations_json) : undefined,
    cleaningProducts: row.cleaning_products,
    vacuumHoover: row.vacuum_hoover,
    mop: row.mop,
    setupConfirmed: row.setup_confirmed === 1,
    customerMessage: row.customer_message !== null ? row.customer_message : (row.notes || ""),
    shortScopingNote: row.short_scoping_note,
    propertyNotes: row.property_notes,
    cleaningNotes: row.cleaning_notes,
    internalNotes: row.internal_notes,

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
    propertyType: row.property_type,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    petsPresent: row.pets_present,
    parking: row.parking,
    email: row.email,
    phone: row.phone
  };
}

export async function listRequests(db, options = {}) {
  let query = `
    SELECT r.*, 
           c.type AS customer_type, c.first_name, c.last_name, c.company_name, c.email, c.phone, 
           p.address_line1, p.city, p.postcode, p.property_type, p.bedrooms, p.bathrooms, p.pets_present, p.parking
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
           c.type AS customer_type, c.first_name, c.last_name, c.company_name, c.email, c.phone, 
           p.address_line1, p.city, p.postcode, p.property_type, p.bedrooms, p.bathrooms, p.pets_present, p.parking
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
    INSERT INTO requests (
      id, customer_id, property_id, source_type, status, notes,
      request_type, cadence, how_soon, preferred_day, preferred_time_window,
      approx_size, photos_helpful, quote_readiness, assessment_required,
      initial_clean_required, pricing_basis, estimated_regular_duration_minutes,
      estimated_initial_duration_minutes, estimated_team_size, scope_confidence,
      main_priorities_json, quote_considerations_json, cleaning_products,
      vacuum_hoover, mop, setup_confirmed, customer_message, short_scoping_note,
      property_notes, cleaning_notes, internal_notes
    )
    VALUES (
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?
    )
    RETURNING *
  `;
  const row = await db.prepare(query).bind(
    input.id, // Caller must generate/provide the ID
    input.customerId || null,
    input.propertyId || null,
    input.sourceType || 'request',
    input.status || 'new',
    input.notes || null,
    input.requestType || null,
    input.cadence || null,
    input.howSoon || null,
    input.preferredDay || null,
    input.preferredTimeWindow || null,
    input.approxSize || null,
    input.photosHelpful || null,
    input.quoteReadiness || null,
    input.assessmentRequired || null,
    input.initialCleanRequired || null,
    input.pricingBasis || null,
    input.estimatedRegularDurationMinutes || null,
    input.estimatedInitialDurationMinutes || null,
    input.estimatedTeamSize || null,
    input.scopeConfidence || null,
    input.mainPriorities ? JSON.stringify(input.mainPriorities) : null,
    input.quoteConsiderations ? JSON.stringify(input.quoteConsiderations) : null,
    input.cleaningProducts || null,
    input.vacuumHoover || null,
    input.mop || null,
    input.setupConfirmed ? 1 : 0,
    input.customerMessage || null,
    input.shortScopingNote || null,
    input.propertyNotes || null,
    input.cleaningNotes || null,
    input.internalNotes || null
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

  if (updates.requestType !== undefined) { sets.push('request_type = ?'); params.push(updates.requestType); }
  if (updates.cadence !== undefined) { sets.push('cadence = ?'); params.push(updates.cadence); }
  if (updates.howSoon !== undefined) { sets.push('how_soon = ?'); params.push(updates.howSoon); }
  if (updates.preferredDay !== undefined) { sets.push('preferred_day = ?'); params.push(updates.preferredDay); }
  if (updates.preferredTimeWindow !== undefined) { sets.push('preferred_time_window = ?'); params.push(updates.preferredTimeWindow); }
  if (updates.approxSize !== undefined) { sets.push('approx_size = ?'); params.push(updates.approxSize); }
  if (updates.photosHelpful !== undefined) { sets.push('photos_helpful = ?'); params.push(updates.photosHelpful); }
  if (updates.quoteReadiness !== undefined) { sets.push('quote_readiness = ?'); params.push(updates.quoteReadiness); }
  if (updates.assessmentRequired !== undefined) { sets.push('assessment_required = ?'); params.push(updates.assessmentRequired); }
  if (updates.initialCleanRequired !== undefined) { sets.push('initial_clean_required = ?'); params.push(updates.initialCleanRequired); }
  if (updates.pricingBasis !== undefined) { sets.push('pricing_basis = ?'); params.push(updates.pricingBasis); }
  if (updates.estimatedRegularDurationMinutes !== undefined) { sets.push('estimated_regular_duration_minutes = ?'); params.push(updates.estimatedRegularDurationMinutes); }
  if (updates.estimatedInitialDurationMinutes !== undefined) { sets.push('estimated_initial_duration_minutes = ?'); params.push(updates.estimatedInitialDurationMinutes); }
  if (updates.estimatedTeamSize !== undefined) { sets.push('estimated_team_size = ?'); params.push(updates.estimatedTeamSize); }
  if (updates.scopeConfidence !== undefined) { sets.push('scope_confidence = ?'); params.push(updates.scopeConfidence); }
  
  if (updates.mainPriorities !== undefined) { 
    sets.push('main_priorities_json = ?'); 
    params.push(updates.mainPriorities ? JSON.stringify(updates.mainPriorities) : null); 
  }
  if (updates.quoteConsiderations !== undefined) { 
    sets.push('quote_considerations_json = ?'); 
    params.push(updates.quoteConsiderations ? JSON.stringify(updates.quoteConsiderations) : null); 
  }

  if (updates.cleaningProducts !== undefined) { sets.push('cleaning_products = ?'); params.push(updates.cleaningProducts); }
  if (updates.vacuumHoover !== undefined) { sets.push('vacuum_hoover = ?'); params.push(updates.vacuumHoover); }
  if (updates.mop !== undefined) { sets.push('mop = ?'); params.push(updates.mop); }
  if (updates.setupConfirmed !== undefined) { sets.push('setup_confirmed = ?'); params.push(updates.setupConfirmed ? 1 : 0); }
  
  if (updates.customerMessage !== undefined) { sets.push('customer_message = ?'); params.push(updates.customerMessage); }
  if (updates.shortScopingNote !== undefined) { sets.push('short_scoping_note = ?'); params.push(updates.shortScopingNote); }
  if (updates.propertyNotes !== undefined) { sets.push('property_notes = ?'); params.push(updates.propertyNotes); }
  if (updates.cleaningNotes !== undefined) { sets.push('cleaning_notes = ?'); params.push(updates.cleaningNotes); }
  if (updates.internalNotes !== undefined) { sets.push('internal_notes = ?'); params.push(updates.internalNotes); }

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
