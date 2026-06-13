// functions/db/jobs.js

function mapJobRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    quoteId: row.quote_id,
    customerId: row.customer_id,
    propertyId: row.property_id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,

    // Joined fields
    quoteDisplayRef: row.quote_display_ref,
    firstName: row.first_name,
    lastName: row.last_name,
    companyName: row.company_name,
    propertyAddressLine1: row.address_line1,
    propertyCity: row.city,
    propertyPostcode: row.postcode
  };
}

export async function listJobs(db, options = {}) {
  let query = "SELECT j.*, q.display_ref AS quote_display_ref, c.first_name, c.last_name, c.company_name, p.address_line1, p.city, p.postcode FROM jobs j LEFT JOIN quotes q ON q.id = j.quote_id LEFT JOIN customers c ON c.id = j.customer_id LEFT JOIN properties p ON p.id = j.property_id WHERE 1=1";
  const params = [];

  if (options.status) {
    query += " AND j.status = ?";
    params.push(options.status);
  }
  if (options.customerId) {
    query += " AND j.customer_id = ?";
    params.push(options.customerId);
  }
  if (options.propertyId) {
    query += " AND j.property_id = ?";
    params.push(options.propertyId);
  }
  if (options.quoteId) {
    query += " AND j.quote_id = ?";
    params.push(options.quoteId);
  }
  if (options.incomeCategory) {
    query += " AND q.income_category = ?";
    params.push(options.incomeCategory);
  }
  if (options.search) {
    query += " AND (q.display_ref LIKE ? OR c.company_name LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ? OR p.address_line1 LIKE ? OR p.postcode LIKE ?)";
    const term = "%" + options.search + "%";
    params.push(term, term, term, term, term, term);
  }

  query += " ORDER BY j.created_at DESC, j.id DESC";

  if (options.limit) {
    query += " LIMIT ?";
    params.push(options.limit);
    if (options.offset) {
      query += " OFFSET ?";
      params.push(options.offset);
    }
  }

  const { results } = await db.prepare(query).bind(...params).all();
  return results.map(mapJobRow);
}

export async function getJobById(db, jobId) {
  const query = "SELECT j.*, q.display_ref AS quote_display_ref, c.first_name, c.last_name, c.company_name, p.address_line1, p.city, p.postcode FROM jobs j LEFT JOIN quotes q ON q.id = j.quote_id LEFT JOIN customers c ON c.id = j.customer_id LEFT JOIN properties p ON p.id = j.property_id WHERE j.id = ?";
  const row = await db.prepare(query).bind(jobId).first();
  return mapJobRow(row);
}

export async function listJobsForCustomer(db, customerId) {
  return listJobs(db, { customerId });
}

export async function listJobsForProperty(db, propertyId) {
  return listJobs(db, { propertyId });
}

export async function listJobsForQuote(db, quoteId) {
  return listJobs(db, { quoteId });
}

export async function createJob(db, input) {
  if (!input.id || !input.customerId) {
    throw new Error("createJob requires id and customerId to be provided.");
  }

  const query = "INSERT INTO jobs (id, quote_id, customer_id, property_id, status) VALUES (?, ?, ?, ?, ?) RETURNING *";
  const row = await db.prepare(query).bind(
    input.id,
    input.quoteId || null,
    input.customerId,
    input.propertyId || null,
    input.status || "new"
  ).first();

  return mapJobRow(row);
}

export async function updateJobStatus(db, jobId, status, options = {}) {
  const query = "UPDATE jobs SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? RETURNING *";
  const row = await db.prepare(query).bind(status, jobId).first();
  return mapJobRow(row);
}
